# Deployment Guide: Vercel + Railway

## Overview
This application has two components:
- **Frontend**: React + Vite → Deploy to **Vercel**
- **Backend**: Express.js + Firebase → Deploy to **Railway**

---

## Step 1: Get Required Credentials

### 1.1 Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy it and save it for later

### 1.2 Firebase Service Account
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gen-lang-client-0658822410`
3. Settings → Service Accounts → Firebase Admin SDK
4. Generate new private key (JSON)
5. Save the file locally and extract:
   - `private_key`
   - `client_email`
   - Keep `project_id` (already in config)

---

## Step 2: Setup Vercel (Frontend)

### 2.1 Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### 2.2 Configure Environment Variables in Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add these variables:
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   GEMINI_API_KEY=your-gemini-api-key
   VITE_FIREBASE_PROJECT_ID=gen-lang-client-0658822410
   ```

### 2.3 Redeploy
```bash
vercel --prod
```

---

## Step 3: Setup Railway (Backend)

### 3.1 Create Railway Account
1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub
3. Create a new project

### 3.2 Connect GitHub Repository
1. In Railway: Create New → GitHub Repo
2. Select your repository
3. Railway will detect this as Node.js project

### 3.3 Configure Environment Variables
In Railway Dashboard, go to Variables and add:
```
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_PROJECT_ID=gen-lang-client-0658822410
FIREBASE_PRIVATE_KEY=your-private-key-from-json
FIREBASE_CLIENT_EMAIL=your-client-email-from-json
FIRESTORE_DATABASE_ID=ai-studio-0204c508-c626-4194-b7e8-ae16aa8db7ad
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### 3.4 Configure Build & Deployment
1. In Railway, go to Build & Deployment
2. Build Command: `npm install`
3. Start Command: `npm run start`
4. Node Version: `18` or higher

### 3.5 Get Your Railway URL
Once deployed, Railway gives you a public URL. Copy it and update:
- Vercel's `VITE_API_URL` environment variable

---

## Step 4: Fix Firebase Config Security

Since `firebase-applet-config.json` is exposed, you need to:

1. **Update `.gitignore`** ✓ (Already done)
2. **Keep the file locally** but don't commit it
3. **Create a `firebase-service-account-key.json`** from Firebase Admin SDK (Step 1.2)
4. **Backend uses the service account key** (more secure)

---

## Step 5: Update Frontend API Calls

Make sure your frontend uses the `VITE_API_URL` environment variable:

```typescript
// Example API call
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const response = await fetch(`${API_URL}/api/user/usage/${userId}`);
```

---

## Step 6: Fix CORS Configuration

Update `server.ts` to add CORS for your Vercel domain:

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

You may also need to install: `npm install cors @types/cors`

---

## Step 7: Local Development

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run preview
```

---

## Troubleshooting Blank Screen

### Check 1: Are environment variables set?
- Vercel: Check in Dashboard → Settings → Environment Variables
- Railway: Check in Project → Variables

### Check 2: Is backend running?
- Test: `curl https://your-railway-app.railway.app/api/health`
- Should return: `{"status":"ok","timestamp":"..."}`

### Check 3: Check browser console
- Open DevTools (F12)
- Look for CORS errors or 404s
- Check Network tab to see if API calls are being made

### Check 4: Check logs
- Vercel: Deployments → View build logs
- Railway: View logs in the dashboard

---

## Environment Variables Summary

| Variable | Dev | Prod | Where |
|----------|-----|------|-------|
| GEMINI_API_KEY | ✓ | ✓ | Both |
| VITE_API_URL | http://localhost:3000 | https://railway.app | Vercel |
| FIREBASE_PRIVATE_KEY | Optional | ✓ | Railway |
| FIREBASE_CLIENT_EMAIL | Optional | ✓ | Railway |
| FRONTEND_URL | http://localhost:5173 | https://vercel.app | Railway |
| NODE_ENV | development | production | Railway |

---

## Checklist

- [ ] Create `.env` file locally
- [ ] Get Gemini API key
- [ ] Get Firebase service account key
- [ ] Deploy to Vercel
- [ ] Deploy to Railway
- [ ] Set environment variables in both
- [ ] Test backend health endpoint
- [ ] Check browser console for errors
- [ ] Update CORS in server.ts
- [ ] Verify API calls work

