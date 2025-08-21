from fastapi import FastAPI, APIRouter, Depends, HTTPException
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

# Import Firebase auth middleware
from auth_middleware import get_current_user, optional_auth
from firebase_config import get_firestore_client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    upload_timestamp: datetime = Field(default_factory=datetime.utcnow)
    analysis_status: str = "pending"  # pending, processing, completed, failed

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

@api_router.post("/upload-record")
async def create_upload_record(
    filename: str,
    file_size: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a record for file upload (protected endpoint)
    """
    upload_record = FileUploadRecord(
        user_id=current_user['uid'],
        filename=filename,
        file_size=file_size
    )
    
    # Store in MongoDB
    _ = await db.file_uploads.insert_one(upload_record.dict())
    
    return {
        "message": "Upload record created",
        "upload_id": upload_record.id,
        "user_id": current_user['uid']
    }

@api_router.get("/my-uploads")
async def get_user_uploads(current_user: dict = Depends(get_current_user)):
    """
    Get current user's file uploads
    """
    uploads = await db.file_uploads.find({"user_id": current_user['uid']}).to_list(100)
    return uploads

# Legacy routes (keeping for backward compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
