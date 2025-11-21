# Quick Start Guide

## 🚀 Running the Application

### Prerequisites

1. **MongoDB**: Install locally or use MongoDB Atlas
   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   ```

2. **Firebase Project**: Create project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password + Google)
   - Enable Storage
   - Get Web App config and Service Account key

### Backend (Terminal 1)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create backend/.env file:
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=osapio_db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
OPENAI_API_KEY=sk-your-key-here  # Optional: for AI analysis
EOF

# Ensure firebase_service_account.json is in backend/ directory
# Download from: Firebase Console > Project Settings > Service Accounts > Generate new private key

uvicorn server:app --reload --port 8000
```

**Backend runs on**: http://localhost:8000

**Verify**: Visit http://localhost:8000/api/health

### Frontend (Terminal 2)

```bash
cd frontend
npm install

# Create frontend/.env file:
cat > .env << EOF
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_BACKEND_URL=http://localhost:8000
EOF

npm run dev
```

**Frontend runs on**: http://localhost:3000

## ✅ Verify It Works

1. **Backend Health**: Visit http://localhost:8000/api/health
   - Should return: `{"status":"healthy","timestamp":"..."}`

2. **Frontend**: Visit http://localhost:3000
   - Should see landing page with "Sign In" button

3. **Authentication**: 
   - Click "Sign In" → Navigate to `/login`
   - Try Google SSO or create account with email/password
   - Should redirect to home page after login

4. **File Upload**:
   - Navigate to upload section (or `/my-uploads`)
   - Upload a PDF/XML/TXT file
   - File should upload to Firebase Storage
   - Record created in MongoDB
   - AI analysis triggered (if OpenAI API key configured)

## 📋 What Was Added/Fixed

### ✅ Completed
- ✅ **Dedicated Login Page** (`/login`) with Google SSO and email/password
- ✅ **Firebase Storage Integration** - Files now actually stored (not just metadata)
- ✅ **Real File Upload** - Backend endpoint for file uploads
- ✅ **AI Analysis Endpoint** - Integrated OpenAI API for document analysis
- ✅ **File Download Support** - Backend endpoints ready for file retrieval
- ✅ **Database Architecture Documentation** - Complete DB structure explained
- ✅ Fixed environment variable names (`REACT_APP_` → `VITE_`)
- ✅ Added `.gitignore` entries for sensitive files

### 🔄 Still Needs Configuration
- ⚠️ **OpenAI API Key** - Set `OPENAI_API_KEY` in backend `.env` for AI analysis
- ⚠️ **Firebase Storage Rules** - Configure security rules for file access
- ⚠️ **File Download UI** - Frontend download button needs implementation

## 🗄️ Database Structure

See `DATABASE_ARCHITECTURE.md` for complete database documentation.

**Quick Summary**:
- **MongoDB**: Stores file upload metadata (`file_uploads` collection)
- **Firestore**: Stores user profiles (`users` collection)
- **Firebase Storage**: Stores actual files (`uploads/{user_id}/`)

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**:
```bash
# Check MongoDB is running
mongosh  # Should connect successfully

# Verify MONGO_URL in backend/.env
```

**Firebase Initialization Failed**:
- Verify `firebase_service_account.json` exists in `backend/` directory
- Check JSON file is valid and not corrupted

**Port Already in Use**:
```bash
lsof -i :8000  # Find process
kill -9 <PID>  # Kill process
```

### Frontend Issues

**Environment Variables Not Loading**:
- Ensure `.env` file is in `frontend/` directory
- Restart dev server after changing `.env`
- Use `VITE_` prefix for all variables
- Check browser console for errors

**CORS Errors**:
- Verify `CORS_ORIGINS` in backend `.env` includes `http://localhost:3000`
- Check backend is running
- Verify `VITE_BACKEND_URL` matches backend URL

**Firebase Auth Not Working**:
- Verify all Firebase env variables are set correctly
- Check Firebase Console > Authentication is enabled
- Check browser console for Firebase errors

## 📚 Documentation

- **ANALYSIS.md** - Complete codebase analysis
- **SETUP_GUIDE.md** - Detailed setup instructions
- **DATABASE_ARCHITECTURE.md** - Database structure and flow
- **QUICK_START.md** - This file

## ⚠️ Known Issues

See `ANALYSIS.md` for complete list. Main issues:
- File upload only creates metadata (no actual file storage)
- AI analysis is mocked (not real)
- Missing production-ready features

## 📚 Documentation

- **ANALYSIS.md** - Complete codebase analysis and reliability assessment
- **SETUP_GUIDE.md** - Detailed setup instructions
- **QUICK_START.md** - This file

