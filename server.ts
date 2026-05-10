import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load firebase config for administrative actions
let firebaseConfig: any;
let serviceAccountKey: any;

// Try to load from environment variables first (production)
if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID,
  };
  serviceAccountKey = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  // Fall back to local file (development)
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));
  } catch (e) {
    console.error("Firebase config not found. Backend features might be limited.");
  }
}

let appAdmin: admin.app.App | null = null;
if (firebaseConfig) {
  try {
    const adminConfig: any = {
      projectId: firebaseConfig.projectId,
    };
    
    // Use service account key if available (production), otherwise auth will use default credentials
    if (serviceAccountKey) {
      adminConfig.credential = admin.credential.cert(serviceAccountKey);
    }
    
    appAdmin = admin.initializeApp(adminConfig);
  } catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
  }
}

const db = (appAdmin && firebaseConfig) ? getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId) : null;

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // CORS Configuration
  app.use(cors({
    origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/user/usage/:userId", async (req, res) => {
    if (!db) return res.status(500).json({ error: "Firestore not initialized" });
    try {
      const { userId } = req.params;
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(userDoc.data());
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/user/increment-usage", async (req, res) => {
    if (!db) return res.status(500).json({ error: "Firestore not initialized" });
    try {
      const { userId, feature } = req.body;
      if (!userId || !feature) {
        return res.status(400).json({ error: "Missing userId or feature" });
      }
      
      const userRef = db.collection("users").doc(userId);
      
      await db.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        if (!doc.exists) {
          // Initialize user if not exists (though usually handled by frontend)
          t.set(userRef, {
            userId,
            usage: {
              resumeAnalyses: 0,
              skillGaps: 0,
              careerAdviceCount: 0,
              mockInterviews: 0,
              jobApplicationsCount: 0,
              learningPlans: 0
            },
            tier: "basic"
          });
          return;
        }

        const data = doc.data()!;
        const currentUsage = data.usage?.[feature] || 0;
        
        const limits: Record<string, number> = {
          resumeAnalyses: 3,
          skillGaps: 5,
          careerAdviceCount: 10,
          mockInterviews: 5,
          learningPlans: 1
        };

        if (currentUsage >= (limits[feature] || Infinity)) {
          throw new Error(`Limit of ${limits[feature]} exceeded for ${feature}`);
        }

        t.update(userRef, {
          [`usage.${feature}`]: currentUsage + 1
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Gemini Proxy Routes
  app.post("/api/gemini/:action", async (req, res) => {
    try {
      const { action } = req.params;
      const { payload } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured on server");
      }

      let result;
      switch (action) {
        case "generateContent": {
          const { contents, config } = payload;
          result = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents,
            config
          });
          res.json({ text: result.text });
          break;
        }
        case "chat": {
          const { history, message, systemInstruction, config } = payload;
          const chat = genAI.chats.create({ 
            model: "gemini-3-flash-preview",
            history,
            config: {
              ...config,
              systemInstruction
            }
          });
          result = await chat.sendMessage(message);
          res.json({ text: result.text });
          break;
        }
        default:
          res.status(404).json({ error: "Action not found" });
      }
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      app.get("*", (req, res) => {
        res.status(500).send("Build artifacts not found. Please run 'npm run build'.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
