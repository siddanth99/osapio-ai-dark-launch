# Update Backend Configuration - MongoDB Atlas

## Your Connection String

```
mongodb+srv://nisanthpcecedsce2024_db_user:JJtwS88eXLm8kfpb@clustersap.7mwiid4.mongodb.net/?appName=ClusterSAP
```

## Steps to Complete Setup

### Step 1: Update `backend/.env` File

1. Open `backend/.env` file in your project
2. Find or add these lines:
   ```env
   MONGO_URL=mongodb+srv://nisanthpcecedsce2024_db_user:JJtwS88eXLm8kfpb@clustersap.7mwiid4.mongodb.net/?appName=ClusterSAP
   DB_NAME=osapio_db
   ```
3. **Important**: Make sure the connection string is on a single line (no line breaks)
4. Save the file

### Step 2: Install/Update Python Dependencies

The connection string uses `mongodb+srv://` which requires DNS SRV support. Run:

```bash
cd backend
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate  # On Windows

pip install "pymongo[srv]>=4.5.0"
```

Or reinstall all requirements:
```bash
pip install -r requirements.txt
```

### Step 3: Verify Network Access

Before testing, make sure your IP is whitelisted in MongoDB Atlas:

1. Go to MongoDB Atlas dashboard
2. Click **"Network Access"** in left sidebar
3. Verify your IP is listed (or `0.0.0.0/0` for "Allow from anywhere")
4. If not, click **"Add IP Address"** → **"Allow Access from Anywhere"** → **"Confirm"**

### Step 4: Test the Connection

1. Make sure backend server is stopped
2. Start the backend:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn server:app --reload --port 8000
   ```
3. Check the console output - you should see:
   ```
   INFO:     Connecting to MongoDB at mongodb+srv://nisanthpcecedsce2024_db_user:...
   INFO:     Application startup complete.
   ```
4. If you see connection errors, check:
   - IP is whitelisted in Network Access
   - Connection string is correct (no extra spaces)
   - pymongo[srv] is installed

### Step 5: Verify It Works

1. Open your frontend app (`http://localhost:3000` or `http://localhost:5173`)
2. Log in
3. Go to "My Uploads" page
4. Should load without errors! 🎉

---

## Quick Copy-Paste for `.env` File

Add or update these lines in `backend/.env`:

```env
MONGO_URL=mongodb+srv://nisanthpcecedsce2024_db_user:JJtwS88eXLm8kfpb@clustersap.7mwiid4.mongodb.net/?appName=ClusterSAP
DB_NAME=osapio_db
```

---

## Troubleshooting

**Error: "DNS resolution failed"**
- Check connection string format
- Make sure `pymongo[srv]` is installed

**Error: "Authentication failed"**
- Verify username and password in connection string
- Check database user exists in Atlas

**Error: "Connection timeout"**
- Verify IP is whitelisted in Network Access
- Wait 2-3 minutes after adding IP whitelist

---

**Once connected, your app will store all file uploads metadata in MongoDB Atlas!**

