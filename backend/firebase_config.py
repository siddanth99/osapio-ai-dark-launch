import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from pathlib import Path

# Initialize Firebase Admin SDK
def initialize_firebase():
    if not firebase_admin._apps:
        # Path to service account key
        service_account_path = Path(__file__).parent / "firebase_service_account.json"
        
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(str(service_account_path))
        firebase_admin.initialize_app(cred, {
            'projectId': 'asapio',
        })
        
    return firebase_admin.get_app()

# Initialize Firebase
firebase_app = initialize_firebase()

# Get Firestore client
def get_firestore_client():
    return firestore.client()

# Verify Firebase ID Token
async def verify_firebase_token(id_token: str) -> dict:
    """
    Verify Firebase ID token and return decoded claims
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "phone_number": decoded_token.get("phone_number"),
            "email_verified": decoded_token.get("email_verified", False),
            "provider_id": decoded_token.get("firebase", {}).get("sign_in_provider")
        }
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")