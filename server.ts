import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
dotenv.config({ path: ".env", override: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini lazily
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    // Explicitly use GEMINI_API_KEY. Clear GOOGLE_API_KEY so the SDK
    // doesn't auto-detect a stale or leaked system env var instead.
    delete process.env.GOOGLE_API_KEY;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from process.env");
      throw new Error("GEMINI_API_KEY not configured on server");
    }

    console.log(`Initializing Gemini with key prefix: ${apiKey.substring(0, 6)}... (length: ${apiKey.length})`);

    if (apiKey.length < 10 || apiKey.includes("REPLACE_ME")) {
      throw new Error("GEMINI_API_KEY appears to be a placeholder or invalid.");
    }

    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
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

// Vercel (production) has no Application Default Credentials — it needs a
// real service account key. Support the same env var locally so dev/prod
// behave the same way instead of silently relying on gcloud ADC that only
// happens to be configured on some developers' machines.
let appAdmin: admin.app.App | null = null;
if (firebaseConfig) {
  try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
    appAdmin = admin.initializeApp(
      rawKey
        ? { credential: admin.credential.cert(JSON.parse(rawKey)), projectId: firebaseConfig.projectId }
        : { projectId: firebaseConfig.projectId }
    );
  } catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
  }
}

const db = (appAdmin && firebaseConfig) ? getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId) : null;

const DEFAULT_MODEL_CHAIN = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
const DEEP_MODEL_CHAIN = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

function isRetryableGeminiError(err: any): boolean {
  let code: number | string | undefined;
  let status: string | undefined;
  try {
    const parsed = JSON.parse(err?.message ?? "");
    code = parsed?.error?.code;
    status = parsed?.error?.status;
  } catch {
    // message wasn't JSON — fall through to substring sniffing below
  }
  if (code === 404 || code === 429 || code === 503) return true;
  if (status === "NOT_FOUND" || status === "RESOURCE_EXHAUSTED" || status === "UNAVAILABLE") return true;
  const msg = String(err?.message ?? "").toLowerCase();
  return /quota|no longer available|high demand|unavailable|resource_exhausted/.test(msg);
}

async function generateWithFallback(models: string[], contents: any, config: any) {
  const genAIClient = getGenAI();
  let lastError: any;
  for (const model of models) {
    try {
      const response = await genAIClient.models.generateContent({ model, contents, config });
      return { response, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      if (!isRetryableGeminiError(err)) throw err;
      console.warn(`[gemini-fallback] ${model} failed (${err?.message}), trying next model in chain`);
    }
  }
  throw lastError;
}

// gemini-2.5-flash/pro are thinking models — response.text can be empty when
// the model outputs thought parts first. Extract the real text from candidates.
function extractText(response: any): string {
  if (response.text) return response.text;
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const textPart = parts.find((p: any) => p.text && !p.thought);
  return textPart?.text ?? parts.find((p: any) => p.text)?.text ?? "";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging middleware for API routes
  app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    next();
  });

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
    console.log("[Gemini Proxy] Received request");
    try {
      const { contents, config, systemInstruction } = req.body;
      
      if (!contents) {
        return res.status(400).json({ error: "Missing 'contents' in request body" });
      }

      const models = config?.model ? [config.model, ...DEFAULT_MODEL_CHAIN] : DEFAULT_MODEL_CHAIN;
      const { response, modelUsed } = await generateWithFallback(
        models,
        Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: String(contents) }] }],
        { ...config, systemInstruction }
      );
      console.log(`[Gemini Proxy] Used model: ${modelUsed}`);

      res.json({ text: extractText(response) });
    } catch (error: any) {
      console.error("[Gemini Proxy Error]", error);
      res.status(500).json({ 
        error: error.message || "An unexpected error occurred during AI generation",
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  });

  // Multi-turn chat endpoint (used by InterviewScreen)
  app.post("/api/gemini/chat", async (req, res) => {
    console.log("[Gemini Chat] Received request");
    try {
      const { payload } = req.body;
      if (!payload || !payload.message) {
        return res.status(400).json({ error: "Missing 'payload.message'" });
      }

      const { message, history = [], systemInstruction, config = {} } = payload;
      const models = config.model ? [config.model, ...DEFAULT_MODEL_CHAIN] : DEFAULT_MODEL_CHAIN;
      console.log(`[Gemini Chat] history length: ${history.length}`);

      const contents = [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ];

      const { response, modelUsed } = await generateWithFallback(
        models,
        contents,
        { maxOutputTokens: config.maxOutputTokens || 512, systemInstruction }
      );

      console.log(`[Gemini Chat] Success using ${modelUsed}`);
      res.json({ text: extractText(response) });
    } catch (error: any) {
      console.error("[Gemini Chat Error]", error);
      res.status(500).json({
        error: error.message || "Chat generation failed",
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      });
    }
  });

  // Deep analysis endpoint — uses gemini-2.5-pro for psychometric & session analysis
  app.post("/api/gemini/deep", async (req, res) => {
    console.log("[Gemini Deep] Received request");
    try {
      const { contents, config, systemInstruction } = req.body;
      if (!contents) {
        return res.status(400).json({ error: "Missing 'contents'" });
      }

      const models = config?.model ? [config.model, ...DEEP_MODEL_CHAIN] : DEEP_MODEL_CHAIN;
      const { response, modelUsed } = await generateWithFallback(
        models,
        Array.isArray(contents) ? contents : [{ role: "user", parts: [{ text: String(contents) }] }],
        { ...config, systemInstruction }
      );

      console.log(`[Gemini Deep] Success using ${modelUsed}`);
      res.json({ text: extractText(response) });
    } catch (error: any) {
      console.error("[Gemini Deep Error]", error);
      res.status(500).json({
        error: error.message || "Deep analysis failed",
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      });
    }
  });

  // Job-posting fetch tool (used by SetupScreen to ground the interview in a real JD)
  const BLOCKED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "::1"]);
  const isPrivateIp = (hostname: string): boolean => {
    const v4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!v4) return false;
    const a = parseInt(v4[1]);
    const b = parseInt(v4[2]);
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 127;
  };
  const stripHtmlToText = (html: string): string =>
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

  app.post("/api/fetch-job-posting", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") return res.status(400).json({ error: "Missing 'url'" });

      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL" });
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return res.status(400).json({ error: "Only http/https URLs are allowed" });
      }
      if (BLOCKED_HOSTNAMES.has(parsed.hostname) || isPrivateIp(parsed.hostname)) {
        return res.status(400).json({ error: "This URL is not allowed" });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(parsed.toString(), {
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerBoostBot/1.0)" },
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        return res.status(502).json({ error: `Failed to fetch job posting (HTTP ${response.status})` });
      }
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
        return res.status(400).json({ error: "URL did not return a readable page" });
      }

      const raw = await response.text();
      const text = stripHtmlToText(raw).slice(0, 6000);
      if (text.length < 50) {
        return res.status(422).json({ error: "Could not extract meaningful content from this page" });
      }
      res.json({ text });
    } catch (error: any) {
      console.error("[fetch-job-posting]", error);
      const message = error.name === "AbortError" ? "Request timed out" : error.message || "Failed to fetch job posting";
      res.status(500).json({ error: message });
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
