# CareerBoost - AI-Powered Career Development Platform

A comprehensive application built with React, TypeScript, and Firebase for career advancement, resume analysis, interview preparation, and skill development.

## 🎯 Features

- **Resume Analysis & Review** - AI-powered resume feedback and improvement suggestions
- **Skill Gap Analysis** - Identify skills needed for target roles
- **Interview Preparation** - Mock interviews with AI feedback
- **Learning Plans** - Personalized learning paths based on goals
- **Career Advice** - AI-powered career guidance
- **Job Tracking** - Track job applications and opportunities
- **Portfolio Building** - Showcase your projects and achievements

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (Deploy to **Vercel**)
- **Backend**: Express.js + Firebase Admin SDK (Deploy to **Railway**)
- **AI**: Google Gemini API for intelligent features
- **Database**: Firebase Firestore

## 📋 Prerequisites

1. **Node.js** 18 or higher
2. **Firebase Project** - [Create one here](https://console.firebase.google.com/)
3. **Gemini API Key** - [Get one here](https://aistudio.google.com/)
4. **Vercel Account** - [Sign up here](https://vercel.com/)
5. **Railway Account** - [Sign up here](https://railway.app/)

## 🚀 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
```bash
cp .env.example .env
```

Then add:
```
GEMINI_API_KEY=your-gemini-api-key
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0658822410
```

### 3. Run Backend (Terminal 1)
```bash
npm run dev
```
Backend runs on `http://localhost:3000`

### 4. Run Frontend (Terminal 2)
```bash
npm run preview
```
Frontend runs on `http://localhost:5173`

## 📦 Building for Production

```bash
npm run build
```
Creates `dist/` folder with optimized production build.

## 🌐 Deployment Guide

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to Vercel + Railway.

### Quick Summary:
1. Deploy frontend to **Vercel** (automatic from GitHub)
2. Deploy backend to **Railway** (automatic from GitHub)
3. Add environment variables in both platforms
4. Update API URLs in environment variables

## 🔑 Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `VITE_API_URL` | Backend API URL | ✅ (dev: localhost:3000) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | ✅ (production only) |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | ✅ (production only) |
| `FIRESTORE_DATABASE_ID` | Firestore database ID | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ (production only) |
| `NODE_ENV` | Environment type | ✅ (production/development) |

## 🧪 Testing

### Check Backend Health
```bash
curl http://localhost:3000/api/health
```

### Check API Connection
```bash
curl http://localhost:3000/api/user/usage/{userId}
```

## 🐛 Troubleshooting

### Blank Screen Issue
1. **Check Console Errors**: Open DevTools (F12) → Console tab
2. **Check Network**: Open DevTools → Network tab, look for failed requests
3. **Backend Not Running**: Ensure `npm run dev` is running in Terminal 1
4. **API URL Wrong**: Check `VITE_API_URL` environment variable

### CORS Errors
- Ensure `FRONTEND_URL` environment variable is set correctly in production
- Check that backend CORS configuration matches your frontend domain

### Firebase Not Initialized
- Verify `firebase-applet-config.json` exists (development only)
- Check Firebase credentials in environment variables (production)

## 📝 Project Structure

```
├── src/
│   ├── components/        # React components
│   ├── services/         # API and external service clients
│   ├── constants/        # Application constants
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── server.ts             # Express backend server
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite bundler config
└── vercel.json           # Vercel deployment config
```

## 🔐 Security

- Firebase Security Rules enforce data access control
- User data is isolated by userId
- Sensitive configuration stored in environment variables
- CORS enabled only for authorized domains
- API rate limiting on backend

## 📄 License

Apache 2.0

## 🤝 Support

For issues and questions:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review error logs in Vercel/Railway dashboards
3. Check browser console for client-side errors

## 🚀 Next Steps

1. [Read the Deployment Guide](./DEPLOYMENT_GUIDE.md)
2. Set up your Gemini API key
3. Deploy to Vercel and Railway
4. Configure environment variables
5. Test the health endpoint
6. Start using the application!

