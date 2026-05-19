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

// ─── Gemini ──────────────────────────────────────────────────────────────────

let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey.length < 10 || apiKey.includes("REPLACE_ME")) {
      throw new Error("GEMINI_API_KEY is not configured. Add it to your .env file.");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return genAI;
}

// ─── Firebase Admin (env-var-based, no JSON file) ────────────────────────────

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_FIRESTORE_DB_ID = process.env.FIREBASE_FIRESTORE_DB_ID;

let appAdmin: admin.app.App | null = null;
if (FIREBASE_PROJECT_ID) {
  try {
    appAdmin = admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
  } catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
  }
} else {
  console.warn("FIREBASE_PROJECT_ID not set — Firestore admin features disabled.");
}

const db =
  appAdmin && FIREBASE_FIRESTORE_DB_ID
    ? getFirestore(appAdmin, FIREBASE_FIRESTORE_DB_ID)
    : null;

// ─── Rate limiter (in-memory, per-user) ──────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_COUNT = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_COUNT) return true;
  entry.count++;
  return false;
}

// ─── Token verification ───────────────────────────────────────────────────────

async function verifyToken(token: string): Promise<admin.auth.DecodedIdToken | null> {
  if (!appAdmin) return null;
  try {
    return await admin.auth(appAdmin).verifyIdToken(token);
  } catch {
    return null;
  }
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

async function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }
  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
  req.user = decoded;
  next();
}

// ─── Server ───────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = "gemini-flash-latest";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map((o) => o.trim());
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(204).end();
    next();
  });

  // Body parser with size limit
  app.use(express.json({ limit: "4mb" }));

  // Request logging
  app.use("/api", (req, _res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  // ── Health (public) ──────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── Get user usage (protected — own user only) ───────────────────────────
  app.get("/api/user/usage/:userId", requireAuth, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Firestore not available." });
    const { userId } = req.params;
    if (req.user.uid !== userId) return res.status(403).json({ error: "Forbidden." });
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) return res.status(404).json({ error: "User not found." });
      res.json(userDoc.data());
    } catch {
      res.status(500).json({ error: "Failed to fetch user data." });
    }
  });

  // ── Increment usage (protected — own user only) ──────────────────────────
  app.post("/api/user/increment-usage", requireAuth, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Firestore not available." });
    const { userId, feature } = req.body;
    if (!userId || !feature) return res.status(400).json({ error: "Missing userId or feature." });
    if (req.user.uid !== userId) return res.status(403).json({ error: "Forbidden." });
    if (typeof feature !== "string" || !/^[a-zA-Z]+$/.test(feature)) {
      return res.status(400).json({ error: "Invalid feature name." });
    }

    try {
      const userRef = db.collection("users").doc(userId);
      await db.runTransaction(async (t) => {
        const snap = await t.get(userRef);
        if (!snap.exists) {
          t.set(userRef, {
            userId,
            usage: {
              resumeAnalyses: 0, skillGaps: 0, careerAdviceCount: 0,
              mockInterviews: 0, jobApplicationsCount: 0, learningPlans: 0,
            },
            tier: "basic",
          });
          return;
        }
        const data = snap.data()!;
        const current = data.usage?.[feature] ?? 0;
        const limits: Record<string, number> = {
          resumeAnalyses: 3, skillGaps: 5, careerAdviceCount: 10,
          mockInterviews: 5, learningPlans: 1,
        };
        if (current >= (limits[feature] ?? Infinity)) {
          throw new Error(`Usage limit reached for ${feature}.`);
        }
        t.update(userRef, { [`usage.${feature}`]: current + 1 });
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ── Gemini proxy (protected + rate-limited) ──────────────────────────────
  app.post("/api/gemini/generate", requireAuth, async (req: any, res) => {
    const userId: string = req.user.uid;

    if (isRateLimited(userId)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." });
    }

    try {
      const { contents, config, systemInstruction } = req.body;

      if (!contents) {
        return res.status(400).json({ error: "Missing 'contents' in request body." });
      }
      if (typeof contents !== "string" && !Array.isArray(contents)) {
        return res.status(400).json({ error: "Invalid 'contents' format." });
      }
      const modelName =
        typeof config?.model === "string" ? config.model : DEFAULT_MODEL;

      const genAIClient = getGenAI();
      const response = await genAIClient.models.generateContent({
        model: modelName,
        contents: Array.isArray(contents)
          ? contents
          : [{ role: "user", parts: [{ text: String(contents) }] }],
        config: { ...config, systemInstruction },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("[Gemini Proxy Error]", error.message);
      res.status(500).json({ error: error.message || "AI generation failed." });
    }
  });

  // ── Gemini streaming proxy (SSE) ─────────────────────────────────────────
  app.post("/api/gemini/stream", requireAuth, async (req: any, res) => {
    const userId: string = req.user.uid;
    if (isRateLimited(userId)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." });
    }

    const { contents, config, systemInstruction } = req.body;
    if (!contents) return res.status(400).json({ error: "Missing 'contents'." });

    try {
      const modelName = typeof config?.model === "string" ? config.model : DEFAULT_MODEL;
      const genAIClient = getGenAI();

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const stream = await genAIClient.models.generateContentStream({
        model: modelName,
        contents: Array.isArray(contents)
          ? contents
          : [{ role: "user", parts: [{ text: String(contents) }] }],
        config: { ...config, systemInstruction },
      });

      for await (const chunk of stream) {
        if (res.writableEnded) break;
        const text = chunk.text;
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }

      if (!res.writableEnded) {
        res.write("data: [DONE]\n\n");
        res.end();
      }
    } catch (error: any) {
      console.error("[Gemini Stream Error]", error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "AI streaming failed." });
      } else if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  });

  // ── Vite / Static ────────────────────────────────────────────────────────
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
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      app.get("*", (_req, res) => {
        res.status(500).send("Build artifacts not found. Run 'npm run build'.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
