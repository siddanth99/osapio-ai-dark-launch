from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_config import verify_firebase_token
from typing import Dict, Optional

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """
    Dependency to get current authenticated user from Firebase token
    """
    try:
        # Verify the Firebase ID token
        user_data = await verify_firebase_token(credentials.credentials)
        return user_data
    except ValueError as e:
        raise HTTPException(
            status_code=401, 
            detail=f"Authentication failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401, 
            detail="Invalid authentication token"
        )

async def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[Dict]:
    """
    Optional authentication dependency - returns user data if authenticated, None otherwise
    """
    if not credentials:
        return None
        
    try:
        user_data = await verify_firebase_token(credentials.credentials)
        return user_data
    except:
        return None