# Setup Guide - OSAPIO AI Dark Launch

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Backend Environment Variables below)
# Copy firebase_service_account.json to backend/ directory

# Run server
uvicorn server:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (see Frontend Environment Variables below)

# Run development server
npm run dev
```

---

## Environment Variables

### Backend (.env in `backend/` directory)

```env
MONGO_URL=mongodb://localhost:27017
# Or for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/

DB_NAME=osapio_db

# Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Required Files:**
- `firebase_service_account.json` - Download from Firebase Console

### Frontend (.env in `frontend/` directory)

```env
# Firebase Configuration (from Firebase Console > Project Settings)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API URL
VITE_BACKEND_URL=http://localhost:8000
```

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google Sign-in
4. Get Web App Configuration:
   - Project Settings > General > Your apps > Web app
   - Copy config values to frontend `.env`
5. Get Service Account Key:
   - Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `backend/firebase_service_account.json`

---

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# MongoDB will run on mongodb://localhost:27017
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create database user
4. Whitelist your IP address (or 0.0.0.0/0 for development)
5. Get connection string and add to `MONGO_URL` in backend `.env`

---

## Verification

### Test Backend

```bash
# Health check
curl http://localhost:8000/api/health

# Should return: {"status":"healthy","timestamp":"..."}
```

### Test Frontend

1. Open `http://localhost:3000`
2. Try signing in with Google or email
3. Navigate to upload page
4. Try uploading a file (will create record but not store file yet)

---

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process using port 8000
lsof -i :8000
# Kill process
kill -9 <PID>
```

**MongoDB connection failed:**
- Check MongoDB is running: `mongosh` or `mongo`
- Verify `MONGO_URL` in `.env`
- Check MongoDB logs

**Firebase initialization failed:**
- Verify `firebase_service_account.json` exists
- Check file path is correct
- Verify JSON is valid

### Frontend Issues

**Environment variables not loading:**
- Ensure `.env` file is in `frontend/` directory
- Restart dev server after changing `.env`
- Use `VITE_` prefix for all variables
- Check browser console for errors

**CORS errors:**
- Verify `CORS_ORIGINS` in backend `.env` includes frontend URL
- Check backend is running
- Verify `VITE_BACKEND_URL` matches backend URL

**Firebase auth not working:**
- Verify all Firebase env variables are set
- Check Firebase project has Authentication enabled
- Check browser console for Firebase errors

---

## Production Deployment

### Backend

1. Set environment variables on hosting platform
2. Use production MongoDB URL
3. Secure `firebase_service_account.json` (use environment variables)
4. Set proper CORS origins
5. Use production WSGI server (e.g., Gunicorn + Uvicorn workers)

### Frontend

1. Build: `npm run build`
2. Deploy `dist/` folder to hosting (Vercel, Netlify, etc.)
3. Set production environment variables
4. Update `VITE_BACKEND_URL` to production backend URL

---

## Next Steps

After setup, refer to `ANALYSIS.md` for:
- Known issues and fixes
- Feature roadmap
- Security improvements needed

