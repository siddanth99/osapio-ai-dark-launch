# Deployment Guide for Lovable

This guide explains how to deploy your changes to [https://asapio.lovable.app/](https://asapio.lovable.app/).

## How Lovable Deployment Works

Lovable automatically deploys your frontend when you push changes to your connected GitHub repository. However, **Lovable typically only hosts the frontend**. Your backend needs to be deployed separately.

## Deployment Steps

### 1. Commit and Push Your Changes

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Add CSV support, fix navigation, improve UI/UX, add markdown rendering"

# Push to GitHub
git push origin main
```

**Note:** Lovable will automatically detect the push and start deploying your frontend.

### 2. Configure Environment Variables in Lovable

Since Lovable only hosts the frontend, you need to set environment variables in Lovable's dashboard:

1. Go to your Lovable project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=https://your-backend-url.com
```

**Important:** Replace `VITE_BACKEND_URL` with your actual backend deployment URL.

### 3. Deploy Your Backend Separately

Lovable doesn't host Python backends. You need to deploy it to a service like:

#### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Select the `backend` folder as the root
5. Set environment variables:
   - `MONGO_URL` - Your MongoDB Atlas connection string
   - `DB_NAME` - Database name (e.g., `osapio_db`)
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `FIREBASE_PRIVATE_KEY` - From Firebase service account
   - `FIREBASE_CLIENT_EMAIL` - From Firebase service account
   - `CORS_ORIGINS` - `https://asapio.lovable.app`
6. Railway will automatically deploy and give you a URL like `https://your-app.railway.app`
7. Update `VITE_BACKEND_URL` in Lovable with this URL

#### Option B: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
7. Add environment variables (same as Railway)
8. Get the deployment URL and update Lovable

#### Option C: Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. In `backend/` directory, run: `fly launch`
3. Follow the prompts
4. Set environment variables
5. Deploy: `fly deploy`

### 4. Verify Deployment

1. **Frontend:** Check [https://asapio.lovable.app/](https://asapio.lovable.app/)
2. **Backend:** Test the health endpoint: `https://your-backend-url.com/api/health`
3. **Integration:** Upload a file and verify it works end-to-end

## Important Notes

### Backend Environment Variables

Your backend needs these environment variables (set in your backend hosting platform):

```bash
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=osapio_db
OPENAI_API_KEY=sk-proj-...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
CORS_ORIGINS=https://asapio.lovable.app
```

### Firebase Storage Rules

Make sure your Firebase Storage rules allow authenticated uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### MongoDB Atlas

Ensure your MongoDB Atlas cluster:
- Has network access configured (allow all IPs or specific IPs)
- Has a database user created
- Connection string is correct

## Troubleshooting

### Frontend not updating?
- Check Lovable dashboard for deployment status
- Verify environment variables are set correctly
- Check browser console for errors

### Backend not connecting?
- Verify `VITE_BACKEND_URL` is set correctly in Lovable
- Check CORS settings in backend
- Verify backend is running and accessible

### File uploads failing?
- Check Firebase Storage rules
- Verify Firebase credentials in backend
- Check backend logs for errors

## Quick Deploy Command

```bash
# Commit and push all changes
git add .
git commit -m "Deploy latest changes: CSV support, UI improvements, markdown rendering"
git push origin main

# Lovable will automatically deploy the frontend
# Then deploy backend separately using Railway/Render/Fly.io
```

## Need Help?

- Lovable Docs: Check Lovable's documentation for deployment specifics
- Backend Hosting: Choose Railway (easiest) or Render/Fly.io
- Environment Variables: Make sure all are set in both Lovable and backend hosting platform

