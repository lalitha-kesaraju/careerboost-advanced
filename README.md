# CareerBoost — AI-Powered Career Intelligence Platform

CareerBoost (Mithra AI) is a full-stack career coaching platform that combines resume optimization, AI mock interviews, skill gap analysis, personality profiling, and personalized learning paths — all powered by Google Gemini.

---

## Features

- **Resume Upload & Analysis** — Parse PDFs and Word docs, get ATS scores, section-by-section feedback, and improvement suggestions
- **AI Mock Interviews** — Real-time Q&A with an AI interviewer, difficulty levels, audio recording, STAR method assessment, and detailed post-interview reports
- **Skill Gap Analysis** — Compare your resume against job requirements and get targeted learning recommendations
- **AI Career Advisor (Mithra Chat)** — Context-aware career coaching chat with access to your resume, applications, and goals
- **Psychometric & Personality Testing** — Big Five personality test and aptitude mastery across 12 quantitative topics
- **Learning Paths** — DSA 4-phase learning plan and Bootcamp Master Course with structured modules
- **Job Application Tracker** — Track applications, statuses, and outcomes
- **Portfolio Management** — Showcase projects and contributions
- **Dashboard & Analytics** — Activity feed, achievements, and usage statistics
- **Admin Dashboard** — User management and platform analytics

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express, TypeScript (tsx) |
| AI | Google Gemini API (`@google/genai`) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Deployment | Railway.app (Nixpacks) |
| Document Parsing | pdfjs-dist, mammoth |
| Animation | Framer Motion (motion) |

---

## Project Structure

```
carreerboost/
├── src/
│   ├── components/         # 35+ React components (Interview, Resume, Chat, etc.)
│   ├── services/           # Gemini API, interview analysis, Firestore utilities
│   ├── lib/                # AI utils, Gemini proxy wrapper
│   ├── data/               # Aptitude questions, Big Five questions, mock data
│   ├── constants/          # Course and bootcamp content
│   ├── App.tsx             # Root component with auth context and view routing
│   ├── types.ts            # Shared TypeScript interfaces
│   └── firebase.ts         # Firebase initialization
├── server.ts               # Express server (API + static serving)
├── vite.config.ts
├── firestore.rules         # Firestore security rules
├── railway.json            # Railway deployment config
└── .env.example            # Environment variable template
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) account (Gemini API key)
- A [Firebase](https://console.firebase.google.com/) project with Firestore and Authentication enabled

### Installation

```bash
git clone https://github.com/lalitha-kesaraju/carreerboost.git
cd carreerboost
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase (Frontend)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FIRESTORE_DB_ID=

# Firebase (Backend Admin)
FIREBASE_PROJECT_ID=
FIREBASE_FIRESTORE_DB_ID=

# Admin accounts (comma-separated emails)
VITE_ADMIN_EMAILS=admin@example.com

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Running Locally

```bash
npm run dev        # Start dev server on http://localhost:3000
```

### Production Build

```bash
npm run build      # Build React frontend to dist/
npm start          # Start Express production server
```

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | Public | Health check |
| `/api/user/usage/:userId` | GET | Required | Get user usage stats |
| `/api/user/increment-usage` | POST | Required | Increment feature usage |
| `/api/gemini/generate` | POST | Required | Gemini text generation |
| `/api/gemini/stream` | POST | Required | Streaming Gemini output (SSE) |

**Rate limit:** 60 requests/minute per user

---

## Usage Limits (Basic Tier)

| Feature | Limit |
|---------|-------|
| Resume Analyses | 3 |
| Skill Gap Reports | 5 |
| Career Advice Sessions | 10 |
| Mock Interviews | 5 |
| Learning Plans | 1 |

---

## Deployment

The app is configured for [Railway](https://railway.app) via `railway.json`:

```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Set all environment variables in your Railway project dashboard before deploying.

---

## Security

- All Gemini API calls are proxied through the Express backend — API keys are never exposed to the client
- Firestore security rules enforce user-scoped data access
- Admin role is enforced server-side via Firebase JWT verification
- Role escalation is prevented (non-admins cannot self-assign admin role)

---

## License

MIT
