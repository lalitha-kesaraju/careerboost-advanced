import express from "express";
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

// Initialize Gemini lazily
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from process.env");
      throw new Error("GEMINI_API_KEY not configured on server");
    }
    
    // Log key metadata (safe)
    console.log(`Initializing Gemini with key: ${apiKey.substring(0, 4)}... (length: ${apiKey.length})`);
    
    if (apiKey.length < 10 || apiKey.includes("REPLACE_ME")) {
      throw new Error("GEMINI_API_KEY appears to be a placeholder or invalid. Please check Settings > Secrets.");
    }

    genAI = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// Load firebase config for administrative actions
let firebaseConfig: any;
try {
  firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));
} catch (e) {
  console.error("Firebase config not found. Backend features might be limited.");
}

let appAdmin: admin.app.App | null = null;
if (firebaseConfig) {
  try {
    appAdmin = admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  } catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
  }
}

const db = (appAdmin && firebaseConfig) ? getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId) : null;

const DEFAULT_MODEL = "gemini-flash-latest";

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Gemini proxy routes
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { contents, config, systemInstruction } = req.body;
      const genAIClient = getGenAI();
      
      const response = await genAIClient.models.generateContent({
        model: config?.model || DEFAULT_MODEL,
        contents,
        config: {
          ...config,
          systemInstruction
        }
      });
      
      res.json({ text: response.text });
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
