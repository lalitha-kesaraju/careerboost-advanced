# 🚀 CareerBoost Deployment with Supabase - FAST SETUP

Complete guide to deploy your app with local logins and Supabase database.

## ✅ What's New (FAST SETUP)

✨ **Local Login System**
- 4 dummy users ready to use: **Rohith**, **Sravan**, **Sreekar**, **Demo User**
- No Firebase needed for login
- Quick login buttons for demo
- Data stored in localStorage initially

✨ **Supabase Database Ready**
- Complete SQL schema (`supabase_schema.sql`)
- Sample data for all 4 users
- Tables for resumes, skill gaps, learning plans, job applications, etc.
- Row-level security configured

---

## 📋 Step-by-Step Setup (15 minutes)

### **Step 1: Test Locally** (2 min)

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` - Click **Quick Login** with:
- **Rohith** (rohith@careerboost.com / rohith123)
- **Sravan** (sravan@careerboost.com / sravan123)
- **Sreekar** (sreekar@careerboost.com / sreekar123)
- **Demo User** (demo@careerboost.com / demo123)

✅ Should see the dashboard (not blank screen!)

---

### **Step 2: Create Supabase Project** (3 min)

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub (recommended)
3. Click "New Project"
4. **Project Details:**
   - Name: `careerboost`
   - Database Password: `CareerBoost@2026` (or your choice, save it!)
   - Region: Choose closest to you (e.g., `us-west-1`)
   - Click "Create new project"
5. ⏳ Wait 1-2 minutes for database to initialize

---

### **Step 3: Create Database Schema** (3 min)

1. In Supabase Dashboard → Click your project
2. Go to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy the entire contents of `supabase_schema.sql`
5. Paste into the SQL editor
6. Click **"Run"** button (top right)
7. ✅ You should see "Success" message

---

### **Step 4: Insert Sample Data** (2 min)

The SQL file already includes sample data for the 4 dummy users. If it didn't insert:

1. Go to **SQL Editor** → **New Query**
2. Run this:
```sql
-- Verify users were created
SELECT * FROM users;

-- Verify usage tracking
SELECT * FROM user_usage;

-- Verify sample resumes
SELECT * FROM resumes;
```

You should see data for:
- Rohith (id: `550e8400-e29b-41d4-a716-446655440001`)
- Sravan (id: `550e8400-e29b-41d4-a716-446655440002`)
- Sreekar (id: `550e8400-e29b-41d4-a716-446655440003`)
- Demo (id: `550e8400-e29b-41d4-a716-446655440004`)

---

### **Step 5: Get Supabase Connection Details** (2 min)

1. In Supabase Dashboard → Click your project
2. Go to **Settings** → **API** (left sidebar)
3. Copy these values:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **Project API Key** (the `anon` key)
4. Save them for next steps

---

### **Step 6: Install Supabase Client** (1 min)

```bash
npm install @supabase/supabase-js
```

---

### **Step 7: Create Supabase Service** (2 min)

Create file: `src/services/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Running in demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database functions
export const db = {
  // Users
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    return { data, error };
  },

  // User Usage
  async getUserUsage(userId: string) {
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async incrementUsage(userId: string, feature: string) {
    const { data, error } = await supabase
      .from('user_usage')
      .update({ [feature]: supabase.rpc('increment', { x: feature }) })
      .eq('user_id', userId);
    return { data, error };
  },

  // Resumes
  async getResumes(userId: string) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  async addResume(userId: string, resume: any) {
    const { data, error } = await supabase
      .from('resumes')
      .insert([{ user_id: userId, ...resume }]);
    return { data, error };
  },

  // Job Applications
  async getJobApplications(userId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  async addJobApplication(userId: string, app: any) {
    const { data, error } = await supabase
      .from('job_applications')
      .insert([{ user_id: userId, ...app }]);
    return { data, error };
  },

  // Learning Plans
  async getLearningPlans(userId: string) {
    const { data, error } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  async addLearningPlan(userId: string, plan: any) {
    const { data, error } = await supabase
      .from('learning_plans')
      .insert([{ user_id: userId, ...plan }]);
    return { data, error };
  }
};
```

---

### **Step 8: Update `.env` File** (1 min)

Add to your `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
```

Replace with your actual values from Step 5.

---

### **Step 9: Test Supabase Connection** (2 min)

Create `src/services/test-db.ts`:

```typescript
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('Supabase Error:', error);
      return false;
    }
    
    console.log('✅ Supabase connected! Users found:', data);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}
```

Call this in your App.tsx `useEffect`:

```typescript
import { testSupabaseConnection } from './services/test-db';

useEffect(() => {
  testSupabaseConnection();
}, []);
```

Check browser console - should see: `✅ Supabase connected!`

---

### **Step 10: Deploy to Vercel** (3 min)

```bash
# Commit changes
git add .
git commit -m "Add login page and Supabase setup"
git push origin main

# Deploy
vercel --prod
```

Add Environment Variables in Vercel Dashboard:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
VITE_API_URL=https://your-railway-backend.railway.app
```

---

## 🔐 Security Setup (IMPORTANT!)

### Enable Row Level Security in Supabase

The SQL file already has RLS enabled, but update policies to use your auth system:

1. Go to Supabase Dashboard → **Authentication**
2. Under **Policies**, add this for each table:
```sql
-- Allow users to see only their own data
CREATE POLICY "Users can access own data"
ON users FOR SELECT
USING (auth.uid()::text = id::text);
```

---

## 📊 Sample User IDs for Testing

Copy these UUIDs for manual testing:

```
Rohith:  550e8400-e29b-41d4-a716-446655440001
Sravan:  550e8400-e29b-41d4-a716-446655440002
Sreekar: 550e8400-e29b-41d4-a716-446655440003
Demo:    550e8400-e29b-41d4-a716-446655440004
```

To manually query a user in Supabase SQL Editor:
```sql
SELECT * FROM user_dashboard_summary WHERE id = '550e8400-e29b-41d4-a716-446655440001';
```

---

## 🔄 Connecting Components to Supabase

### Example: Get User's Resumes

**Before (localStorage only):**
```typescript
const resumes = JSON.parse(localStorage.getItem('resumes') || '[]');
```

**After (Supabase):**
```typescript
import { db } from '@/services/supabase';

const { data: resumes, error } = await db.getResumes(userId);
if (error) console.error('Error:', error);
```

---

## ✅ Deployment Checklist

- [ ] Local test works (4 dummy logins work)
- [ ] Supabase project created
- [ ] SQL schema imported successfully
- [ ] Sample data visible in Supabase
- [ ] Supabase credentials in `.env`
- [ ] Supabase client installed (`@supabase/supabase-js`)
- [ ] Supabase service created (`src/services/supabase.ts`)
- [ ] Connection test successful (console shows "✅ Supabase connected!")
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] App works in production (no blank screen)

---

## 📱 Quick Login Info

Use these credentials to test:

| Name | Email | Password |
|------|-------|----------|
| Rohith | rohith@careerboost.com | rohith123 |
| Sravan | sravan@careerboost.com | sravan123 |
| Sreekar | sreekar@careerboost.com | sreekar123 |
| Demo | demo@careerboost.com | demo123 |

---

## 🐛 Troubleshooting

### Blank Screen After Login
- Check browser console (F12)
- Verify Supabase credentials in `.env`
- Test Supabase connection (run test-db.ts)

### "Supabase credentials not configured"
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` to `.env`
- Restart dev server: `npm run dev`

### Data Not Showing
- Check Supabase SQL Editor
- Verify data exists: `SELECT * FROM resumes;`
- Check user_id matches

### Vercel Shows Blank Screen
- Check Vercel build logs
- Verify env vars in Vercel dashboard
- Check Network tab (F12) for failed requests

---

## 🚀 Next Steps

1. ✅ Get login working locally
2. ✅ Create Supabase project
3. ✅ Import schema and data
4. ✅ Connect to app
5. ✅ Deploy to Vercel
6. ✅ Test in production
7. 🎉 Celebrate! Your app is live!

---

**Time to deploy:** ~20 minutes

**Questions?** Check:
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [Vercel Docs](https://vercel.com/docs)

