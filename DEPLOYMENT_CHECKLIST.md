✅ Deployment Checklist

## Phase 1: Prepare (Do Locally)

### Get Credentials
- [ ] Get Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
- [ ] Get Firebase Service Account Key from Firebase Console
  - [ ] Extract `FIREBASE_PRIVATE_KEY`
  - [ ] Extract `FIREBASE_CLIENT_EMAIL`

### Update Local Configuration
- [ ] Edit `.env` file with your credentials:
  ```
  GEMINI_API_KEY=your-api-key
  VITE_API_URL=http://localhost:3000
  ```

### Test Locally
- [ ] Run `npm install` 
- [ ] Start backend: `npm run dev` (Terminal 1)
- [ ] Start frontend: `npm run preview` (Terminal 2)
- [ ] Visit `http://localhost:5173` - should see the app (not blank)
- [ ] Test API: `curl http://localhost:3000/api/health`
- [ ] Should see: `{"status":"ok",...}`
- [ ] Check browser console (F12) - no red errors
- [ ] Check Network tab (F12) - API calls returning 200 OK

### Push to GitHub
- [ ] Commit all changes: `git add . && git commit -m "Setup for Vercel/Railway deployment"`
- [ ] Push to main branch: `git push origin main`

---

## Phase 2: Deploy to Vercel (Frontend)

### Create Vercel Project
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project"
- [ ] Select your GitHub repository
- [ ] Click Import

### Configure Environment Variables
- [ ] In Vercel Dashboard → Project Settings → Environment Variables
- [ ] Add:
  ```
  VITE_API_URL = http://localhost:3000
  GEMINI_API_KEY = your-gemini-api-key
  ```
  (Will update `VITE_API_URL` after Railway deployment)
- [ ] Click "Save"

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (green checkmark)
- [ ] Copy your Vercel URL (e.g., `https://careerboost.vercel.app`)
- [ ] Click "Visit" - check if app loads (not blank screen)
- [ ] Open DevTools (F12) → Check console for errors

---

## Phase 3: Deploy to Railway (Backend)

### Create Railway Project
- [ ] Go to [Railway Dashboard](https://railway.app/)
- [ ] Click "New Project"
- [ ] Select "GitHub Repo"
- [ ] Select your repository
- [ ] Click "Deploy"

### Configure Environment Variables
- [ ] In Railway → Project → Variables
- [ ] Add these variables:
  ```
  GEMINI_API_KEY = your-gemini-api-key
  FIREBASE_PROJECT_ID = gen-lang-client-0658822410
  FIREBASE_PRIVATE_KEY = your-private-key-from-json
  FIREBASE_CLIENT_EMAIL = your-client-email-from-json
  FIRESTORE_DATABASE_ID = ai-studio-0204c508-c626-4194-b7e8-ae16aa8db7ad
  FRONTEND_URL = https://your-vercel-url.vercel.app
  NODE_ENV = production
  ```
  (Replace with your actual Vercel URL)
- [ ] Click "Save"

### Verify Deployment
- [ ] Wait for build to complete
- [ ] Go to Railway → Project → Deployments → Latest
- [ ] Look for green "Success" status
- [ ] Copy your Railway public URL (e.g., `https://careerboost.railway.app`)
- [ ] Test: `curl https://your-railway-url/api/health`
- [ ] Should see: `{"status":"ok",...}`

---

## Phase 4: Link Services Together

### Update Vercel to Point to Railway
- [ ] Go to Vercel Dashboard → Project Settings → Environment Variables
- [ ] Update `VITE_API_URL`:
  - Old: `http://localhost:3000`
  - New: `https://your-railway-url` (from Phase 3)
- [ ] Click "Save"
- [ ] Vercel auto-redeployed? 
  - [ ] If not, go to Deployments → Redeploy latest commit

### Verify Production API Connection
- [ ] Visit your Vercel URL
- [ ] Open DevTools (F12) → Console tab
- [ ] Should see NO red errors
- [ ] Check Network tab → API calls should return 200 OK
- [ ] If API calls fail, check:
  - [ ] Is `VITE_API_URL` correct in Vercel?
  - [ ] Is Railway backend running (check Railway dashboard logs)?
  - [ ] Are CORS settings correct?

---

## Phase 5: Final Testing

### Frontend Tests
- [ ] Page loads without blank screen ✅
- [ ] No JavaScript errors in console ✅
- [ ] Login works (Firebase Auth) ✅
- [ ] Can upload resume ✅
- [ ] Can click buttons without errors ✅

### Backend Tests
- [ ] Health check: `curl https://your-railway-url/api/health` ✅
- [ ] API calls from frontend work ✅
- [ ] Firebase operations work ✅
- [ ] Gemini API calls work ✅

### Security Checks
- [ ] No sensitive keys in browser network requests ✅
- [ ] API keys only in server-side environment variables ✅
- [ ] CORS configured correctly ✅
- [ ] `.gitignore` protecting sensitive files ✅

---

## 🚨 Troubleshooting During Deployment

### Blank Screen in Vercel
1. [ ] Check Vercel build logs for errors
2. [ ] Verify `VITE_API_URL` is set
3. [ ] Check browser console (F12 → Console)
4. [ ] Look for network errors (F12 → Network)

### Backend Not Responding
1. [ ] Check Railway logs (Railway → Project → Deployments → Logs)
2. [ ] Verify environment variables in Railway
3. [ ] Check `FIREBASE_PRIVATE_KEY` has correct `\n` format
4. [ ] Ensure `NODE_ENV=production` is set

### CORS Errors
1. [ ] Check browser console for "CORS policy" error
2. [ ] Verify `FRONTEND_URL` in Railway matches Vercel domain
3. [ ] Check `server.ts` has CORS configuration

### API Calls Timeout
1. [ ] Is Railway app active? (Check dashboard)
2. [ ] Is Vercel correctly pointing to Railway? (`VITE_API_URL`)
3. [ ] Check Railway logs for errors

---

## ✅ Success Criteria

You'll know everything is working when:

- ✅ Visit Vercel URL → See the app (not blank)
- ✅ Open DevTools → No red errors in console
- ✅ Check Network tab → API calls to Railway returning 200 OK
- ✅ Can log in with Firebase Auth
- ✅ Can use AI features (resume analysis, etc.)
- ✅ Data saves to Firestore
- ✅ Test health endpoint returns JSON: `curl https://your-railway-url/api/health`

---

## 📝 Save These URLs

Keep these URLs handy:

| Service | URL | Notes |
|---------|-----|-------|
| Frontend (Vercel) | https://your-vercel-url | Main app |
| Backend (Railway) | https://your-railway-url | API endpoint |
| Vercel Dashboard | https://vercel.com/dashboard | Manage frontend |
| Railway Dashboard | https://railway.app/ | Manage backend |
| Firebase Console | https://console.firebase.google.com/ | Database |

---

## 📞 Getting Help

If something doesn't work:

1. **Check logs first:**
   - Vercel: Dashboard → Deployments → Build/Function logs
   - Railway: Dashboard → Deployments → Logs

2. **Common issues:**
   - See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting

3. **Debug locally first:**
   - Run `npm run dev` locally
   - Test `npm run build`
   - Then deploy

---

Last Updated: May 10, 2026
Time to Deploy: ~30-45 minutes
