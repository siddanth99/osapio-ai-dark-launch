from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import io
import requests

# Import Firebase auth middleware
from auth_middleware import get_current_user
from firebase_config import get_firestore_client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'osapio_db')

try:
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]
    logger.info(f"Connecting to MongoDB at {mongo_url}")
except Exception as e:
    logger.error(f"MongoDB connection error: {e}")
    client = None
    db = None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class UserProfile(BaseModel):
    uid: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    display_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)

class FileUploadRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    file_size: int
    file_path: Optional[str] = None  # Firebase Storage path or local path
    content_type: Optional[str] = None
    upload_timestamp: datetime = Field(default_factory=datetime.utcnow)
    analysis_status: str = "pending"  # pending, processing, completed, failed
    analysis_result: Optional[str] = None

# Public routes (no authentication required)
@api_router.get("/")
async def root():
    return {"message": "osapio API - Authentication enabled"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Protected routes (authentication required)
@api_router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's profile
    """
    firestore_client = get_firestore_client()
    
    # Check if user profile exists in Firestore
    user_ref = firestore_client.collection('users').document(current_user['uid'])
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        # Create user profile if doesn't exist
        user_profile = {
            'uid': current_user['uid'],
            'email': current_user.get('email'),
            'phone_number': current_user.get('phone_number'),
            'email_verified': current_user.get('email_verified', False),
            'provider_id': current_user.get('provider_id'),
            'created_at': datetime.utcnow(),
            'last_login': datetime.utcnow()
        }
        user_ref.set(user_profile)
        return user_profile
    else:
        # Update last login
        user_ref.update({'last_login': datetime.utcnow()})
        return user_doc.to_dict()

@api_router.put("/me")
async def update_user_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user's profile
    """
    firestore_client = get_firestore_client()
    user_ref = firestore_client.collection('users').document(current_user['uid'])
    
    # Prepare update data
    update_data = {}
    if 'display_name' in profile_data:
        update_data['display_name'] = profile_data['display_name']
    
    update_data['updated_at'] = datetime.utcnow()
    
    user_ref.update(update_data)
    
    return {"message": "Profile updated successfully"}

@api_router.delete("/upload-record/{upload_id}")
async def delete_upload_record(
    upload_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a specific upload record (user can only delete their own uploads)
    """
    if db is None:
        raise HTTPException(
            status_code=503, 
            detail="Database connection unavailable. Please ensure MongoDB is running."
        )
    
    try:
        # Check if the upload belongs to the current user
        upload = await db.file_uploads.find_one({
            "id": upload_id,
            "user_id": current_user['uid']
        })
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found or access denied")
        
        # Delete the upload record
        result = await db.file_uploads.delete_one({
            "id": upload_id,
            "user_id": current_user['uid']
        })
        
        if result.deleted_count == 1:
            return {"message": "Upload deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Upload not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting upload record: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)}"
        )

@api_router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a file and create a record (protected endpoint)
    Note: Files are stored in Firebase Storage by the frontend.
    This endpoint creates the metadata record in MongoDB.
    """
    # Validate file size (max 10MB)
    contents = await file.read()
    file_size = len(contents)
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    # Validate file type
    allowed_types = [
        'application/pdf',
        'text/xml',
        'application/xml',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  # .xlsx
        'application/vnd.ms-excel',  # .xls
        'application/excel',  # Legacy Excel
        'text/csv',  # CSV
        'application/csv'  # CSV alternative
    ]
    
    # Also check file extension as fallback
    file_extension = (file.filename or "").lower().split('.')[-1] if '.' in (file.filename or "") else ""
    allowed_extensions = ['pdf', 'xml', 'txt', 'csv', 'xlsx', 'xls']
    
    if file.content_type not in allowed_types and file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: PDF, XML, TXT, CSV, Excel (.xlsx, .xls, .csv)"
        )
    
    # Create upload record
    upload_record = FileUploadRecord(
        user_id=current_user['uid'],
        filename=file.filename or "unnamed",
        file_size=file_size,
        content_type=file.content_type
    )
    
    # Store in MongoDB
    await db.file_uploads.insert_one(upload_record.model_dump())
    
    return {
        "message": "File uploaded successfully",
        "upload_id": upload_record.id,
        "filename": upload_record.filename,
        "file_size": file_size,
        "user_id": current_user['uid']
    }

class UploadRecordCreate(BaseModel):
    filename: str
    file_size: int
    file_path: Optional[str] = None

class AnalyzeRequest(BaseModel):
    file_content: Optional[str] = None
    filename: str = ""

@api_router.post("/upload-record")
async def create_upload_record(
    upload_data: UploadRecordCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a record for file upload (protected endpoint)
    Used when file is uploaded to Firebase Storage from frontend
    """
    if db is None:
        raise HTTPException(
            status_code=503, 
            detail="Database connection unavailable. Please ensure MongoDB is running."
        )
    
    try:
        logger.info(f"Creating upload record for user {current_user['uid']}, filename: {upload_data.filename}")
        
        upload_record = FileUploadRecord(
            user_id=current_user['uid'],
            filename=upload_data.filename,
            file_size=upload_data.file_size,
            file_path=upload_data.file_path
        )
        
        # Convert to dict for MongoDB (Pydantic v2 uses model_dump())
        upload_dict = upload_record.model_dump()
        logger.info(f"Upload record created: {upload_dict}")
        
        # Store in MongoDB
        result = await db.file_uploads.insert_one(upload_dict)
        logger.info(f"MongoDB insert result: {result.inserted_id}")
        
        return {
            "message": "Upload record created",
            "upload_id": upload_record.id,
            "user_id": current_user['uid']
        }
    except Exception as e:
        logger.error(f"Error creating upload record: {e}", exc_info=True)
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Full traceback: {error_trace}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating upload record: {str(e)}"
        )

@api_router.get("/my-uploads")
async def get_user_uploads(current_user: dict = Depends(get_current_user)):
    """
    Get current user's file uploads
    """
    if db is None:
        raise HTTPException(
            status_code=503, 
            detail="Database connection unavailable. Please ensure MongoDB is running."
        )
    
    try:
        user_id = current_user['uid']
        logger.info(f"Fetching uploads for user: {user_id}")
        
        cursor = db.file_uploads.find({"user_id": user_id}).sort("upload_timestamp", -1)
        uploads = await cursor.to_list(100)
        
        logger.info(f"Found {len(uploads)} raw documents from MongoDB")
        
        # Convert MongoDB documents to JSON-serializable format
        result = []
        for upload in uploads:
            # Convert MongoDB document to dict, handling ObjectId and datetime
            upload_dict = {}
            for key, value in upload.items():
                if key == '_id':
                    # Skip MongoDB's _id, we'll use 'id' field instead
                    continue
                elif isinstance(value, datetime):
                    # Convert datetime to ISO format string
                    upload_dict[key] = value.isoformat()
                else:
                    # Keep other values as-is
                    upload_dict[key] = value
            
            # Ensure 'id' field exists (use existing 'id' or fallback to _id as string)
            if 'id' not in upload_dict:
                if '_id' in upload:
                    upload_dict['id'] = str(upload['_id'])
                else:
                    # Generate a new ID if neither exists (shouldn't happen)
                    upload_dict['id'] = str(uuid.uuid4())
                    logger.warning(f"Upload document missing 'id' field, generated new one")
            
            result.append(upload_dict)
        
        logger.info(f"Returning {len(result)} serialized uploads for user {user_id}")
        return result
    except Exception as e:
        logger.error(f"Error fetching uploads: {e}", exc_info=True)
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)}"
        )

@api_router.get("/upload/{upload_id}")
async def get_upload_details(
    upload_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get details of a specific upload
    """
    if db is None:
        raise HTTPException(
            status_code=503, 
            detail="Database connection unavailable. Please ensure MongoDB is running."
        )
    
    try:
        upload = await db.file_uploads.find_one({
            "id": upload_id,
            "user_id": current_user['uid']
        })
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found or access denied")
        
        # Convert MongoDB document to JSON-serializable format
        upload_dict = {}
        for key, value in upload.items():
            if key == '_id':
                # Skip MongoDB's _id, we'll use 'id' field instead
                continue
            elif isinstance(value, datetime):
                # Convert datetime to ISO format string
                upload_dict[key] = value.isoformat()
            else:
                # Keep other values as-is
                upload_dict[key] = value
        
        # Ensure 'id' field exists
        if 'id' not in upload_dict:
            if '_id' in upload:
                upload_dict['id'] = str(upload['_id'])
            else:
                upload_dict['id'] = upload_id
        
        return upload_dict
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching upload details: {e}", exc_info=True)
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)}"
        )

@api_router.get("/download/{upload_id}")
async def download_file(
    upload_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Download a file by proxying it from Firebase Storage
    This avoids CORS issues by downloading on the backend
    """
    if db is None:
        raise HTTPException(
            status_code=503, 
            detail="Database connection unavailable. Please ensure MongoDB is running."
        )
    
    try:
        # Get upload record and verify ownership
        upload = await db.file_uploads.find_one({
            "id": upload_id,
            "user_id": current_user['uid']
        })
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found or access denied")
        
        file_path = upload.get('file_path')
        filename = upload.get('filename', 'download')
        
        if not file_path:
            raise HTTPException(status_code=404, detail="File path not available")
        
        # Download file from Firebase Storage
        try:
            response = requests.get(file_path, stream=True, timeout=30)
            response.raise_for_status()
        except requests.RequestException as e:
            logger.error(f"Error downloading file from Firebase Storage: {e}")
            raise HTTPException(status_code=502, detail="Failed to download file from storage")
        
        # Return file as streaming response with proper headers
        def generate():
            for chunk in response.iter_content(chunk_size=8192):
                yield chunk
        
        return StreamingResponse(
            generate(),
            media_type=upload.get('content_type', 'application/octet-stream'),
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(upload.get('file_size', 0))
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading file: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error downloading file: {str(e)}"
        )

@api_router.post("/analyze/{upload_id}")
async def analyze_document(
    upload_id: str,
    analyze_data: AnalyzeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze a document using AI (OpenAI API)
    """
    if db is None:
        raise HTTPException(
            status_code=503, 
            detail="Database connection unavailable. Please ensure MongoDB is running."
        )
    
    try:
        # Verify upload belongs to user
        upload = await db.file_uploads.find_one({
            "id": upload_id,
            "user_id": current_user['uid']
        })
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found or access denied")
        
        # Update status to processing
        await db.file_uploads.update_one(
            {"id": upload_id, "user_id": current_user['uid']},
            {"$set": {"analysis_status": "processing"}}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accessing database: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)}"
        )
    
    try:
        # Get file content and filename from request body
        file_content = analyze_data.file_content or ""
        filename = analyze_data.filename or upload.get('filename', '')
        file_path = upload.get('file_path', '')
        
        # Check if OpenAI API key is configured
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        
        if not openai_api_key:
            # Return mock analysis if OpenAI not configured
            analysis_result = f"""
File Analysis Results:
====================

📄 File: {filename}
📊 Size: {upload.get('file_size', 0)} bytes
👤 User: {current_user.get('email', 'Unknown')}
📅 Upload Time: {upload.get('upload_timestamp', 'Unknown')}

📋 Content Summary:
OpenAI API key not configured. Please set OPENAI_API_KEY environment variable to enable AI analysis.

✅ File uploaded successfully!
            """
            
            await db.file_uploads.update_one(
                {"id": upload_id, "user_id": current_user['uid']},
                {"$set": {
                    "analysis_status": "completed",
                    "analysis_result": analysis_result
                }}
            )
            
            return {"analysis_result": analysis_result, "upload_id": upload_id}
        
        # Call OpenAI API
        import requests
        
        # Determine document type
        is_idoc = 'idoc' in filename.lower() or (file_content and 'IDOC' in file_content[:1000])
        is_excel = filename.lower().endswith(('.xlsx', '.xls'))
        is_csv = filename.lower().endswith('.csv')
        
        # For Excel files, download and parse the file from Firebase Storage
        if is_excel and file_path:
            try:
                logger.info(f"Downloading Excel file from Firebase Storage: {file_path}")
                # Download file from Firebase Storage URL
                response = requests.get(file_path, timeout=30)
                response.raise_for_status()
                
                # Parse Excel file using pandas
                import pandas as pd
                import io
                
                # Read Excel file - read all sheets
                excel_file = pd.ExcelFile(io.BytesIO(response.content), engine='openpyxl' if filename.endswith('.xlsx') else 'xlrd')
                sheet_names = excel_file.sheet_names
                
                # Convert to readable text format
                excel_summary = f"Excel File: {filename}\n"
                excel_summary += f"Number of sheets: {len(sheet_names)}\n\n"
                
                # Process each sheet
                for sheet_name in sheet_names:
                    df = pd.read_excel(excel_file, sheet_name=sheet_name)
                    excel_summary += f"=== Sheet: {sheet_name} ===\n"
                    excel_summary += f"Columns ({len(df.columns)}): {', '.join(df.columns.astype(str))}\n"
                    excel_summary += f"Rows: {len(df)}\n\n"
                    
                    # Show first 20 rows (or all if less than 20)
                    rows_to_show = min(20, len(df))
                    if rows_to_show > 0:
                        excel_summary += f"First {rows_to_show} rows:\n"
                        excel_summary += df.head(rows_to_show).to_string(index=False)
                        excel_summary += "\n\n"
                    
                    # Show data types and sample values
                    excel_summary += "Column information:\n"
                    for col in df.columns:
                        non_null_count = df[col].notna().sum()
                        excel_summary += f"  - {col}: {df[col].dtype}, {non_null_count}/{len(df)} non-null values\n"
                    excel_summary += "\n"
                
                file_content = excel_summary
                logger.info(f"Excel file parsed successfully. Content length: {len(file_content)}")
                
            except Exception as excel_error:
                logger.error(f"Error parsing Excel file: {excel_error}")
                # Fallback to basic info
                file_content = f"Excel file: {filename}\n\nUnable to parse Excel file content. Error: {str(excel_error)}\n\nThis Excel file may contain SAP data exports or integration data. Please analyze based on filename and provide general recommendations."
        
        # For CSV files, download and parse the file from Firebase Storage
        elif is_csv and file_path:
            try:
                logger.info(f"Downloading CSV file from Firebase Storage: {file_path}")
                # Download file from Firebase Storage URL
                response = requests.get(file_path, timeout=30)
                response.raise_for_status()
                
                # Parse CSV file using pandas
                import pandas as pd
                import io
                
                # Read CSV file
                df = pd.read_csv(io.BytesIO(response.content))
                
                csv_summary = f"CSV File: {filename}\n"
                csv_summary += f"Columns ({len(df.columns)}): {', '.join(df.columns.astype(str))}\n"
                csv_summary += f"Rows: {len(df)}\n\n"
                
                # Show sample data
                rows_to_show = min(20, len(df))
                if rows_to_show > 0:
                    csv_summary += f"First {rows_to_show} rows:\n"
                    csv_summary += df.head(rows_to_show).to_string(index=False)
                    csv_summary += "\n\n"
                
                # Column information
                csv_summary += "Column information:\n"
                for col in df.columns:
                    non_null_count = df[col].notna().sum()
                    csv_summary += f"  - {col}: {df[col].dtype}, {non_null_count}/{len(df)} non-null values\n"
                csv_summary += "\n"
                
                file_content = csv_summary
                logger.info(f"CSV file parsed successfully. Content length: {len(file_content)}")
                
            except Exception as csv_error:
                logger.error(f"Error parsing CSV file: {csv_error}")
                # Fallback to basic info
                file_content = f"CSV file: {filename}\n\nUnable to parse CSV file content. Error: {str(csv_error)}\n\nThis CSV file may contain SAP data exports or integration data. Please analyze based on filename and provide general recommendations."
        
        # Fallback if no content extracted
        if not file_content and (is_excel or is_csv):
            file_type = "Excel" if is_excel else "CSV"
            file_content = f"{file_type} file: {filename}\n\nThis is a {file_type} file that may contain SAP data exports or integration data. Analyze the file structure and provide recommendations for integration approaches."
        
        system_prompt = """You are an expert SAP consultant analyzing a document. 
Provide a comprehensive analysis including:
1. Document type and content overview
2. Key information extracted
3. SAP-related processes or modules involved
4. Recommendations and next steps
5. Potential integration opportunities

Focus on SAP-relevant insights and actionable recommendations."""
        
        if is_idoc:
            system_prompt = """You are an expert SAP consultant analyzing an IDOC (Intermediate Document). 
Provide a detailed analysis including:
1. Document type and purpose
2. Key data fields and their meanings
3. Business process context
4. Potential issues or recommendations
5. Integration points and dependencies

Make your response clear and actionable for SAP professionals."""
        elif is_excel or is_csv:
            file_type = "Excel" if is_excel else "CSV"
            system_prompt = f"""You are an expert SAP consultant analyzing a {file_type} file that may contain SAP data exports or integration data.
Provide a detailed analysis including:
1. File structure and data organization
2. Key data fields and their SAP relevance
3. Data quality assessment
4. Potential SAP module associations (FI, CO, SD, MM, etc.)
5. Integration opportunities (real-time vs batch)
6. Recommendations for ASAPIO or similar integration tools if applicable
7. Data transformation needs

Focus on identifying if this data would benefit from real-time integration tools like ASAPIO vs batch file processing."""
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {openai_api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f'Please analyze this {"SAP IDOC" if is_idoc else "Excel file" if is_excel else "CSV file" if is_csv else "document"}:\n\n{file_content[:50000]}'}  # Limit to 50k chars
                ],
                'max_tokens': 2000,
                'temperature': 0.3,
            },
            timeout=30
        )
        
        if response.status_code == 200:
            analysis_result = response.json()['choices'][0]['message']['content']
        else:
            raise Exception(f"OpenAI API error: {response.status_code}")
        
        # Update database with analysis result
        try:
            await db.file_uploads.update_one(
                {"id": upload_id, "user_id": current_user['uid']},
                {"$set": {
                    "analysis_status": "completed",
                    "analysis_result": analysis_result
                }}
            )
        except Exception as db_error:
            logger.error(f"Error updating database: {db_error}")
            # Still return the analysis result even if DB update fails
        
        return {"analysis_result": analysis_result, "upload_id": upload_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        
        # Update status to failed (if DB is available)
        try:
            if db:
                await db.file_uploads.update_one(
                    {"id": upload_id, "user_id": current_user['uid']},
                    {"$set": {"analysis_status": "failed"}}
                )
        except:
            pass  # Ignore DB errors during error handling
        
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.put("/upload/{upload_id}/analysis")
async def update_analysis_result(
    upload_id: str,
    analysis_result: str,
    status: str = "completed",
    current_user: dict = Depends(get_current_user)
):
    """
    Update analysis result for an upload (manual update)
    """
    if db is None:
        raise HTTPException(
            status_code=503, 
            detail="Database connection unavailable. Please ensure MongoDB is running."
        )
    
    try:
        upload = await db.file_uploads.find_one({
            "id": upload_id,
            "user_id": current_user['uid']
        })
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found or access denied")
        
        await db.file_uploads.update_one(
            {"id": upload_id, "user_id": current_user['uid']},
            {"$set": {
                "analysis_status": status,
                "analysis_result": analysis_result
            }}
        )
        
        return {"message": "Analysis result updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating analysis result: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)}"
        )

# Legacy routes (keeping for backward compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    if db is None:
        raise HTTPException(
            status_code=503, 
            detail="Database connection unavailable. Please ensure MongoDB is running."
        )
    
    try:
        status_dict = input.model_dump()
        status_obj = StatusCheck(**status_dict)
        _ = await db.status_checks.insert_one(status_obj.model_dump())
        return status_obj
    except Exception as e:
        logger.error(f"Error creating status check: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)}"
        )

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    if not db:
        return []  # Return empty list if DB unavailable
    
    try:
        status_checks = await db.status_checks.find().to_list(1000)
        return [StatusCheck(**status_check) for status_check in status_checks]
    except Exception as e:
        logger.error(f"Error fetching status checks: {e}")
        return []  # Return empty list on error

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
