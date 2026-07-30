import admin from "firebase-admin";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

// Read as plain JSON rather than a static ESM import — Node's ESM loader on
// Vercel requires an explicit `type: "json"` import attribute for JSON
// modules, which varies by TS/bundler config and broke this at runtime.
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8")
);

let _db: Firestore | null = null;

// Vercel has no Application Default Credentials (that only works on GCP
// infra). A real deployment needs a service account key — generate one in
// Firebase Console > Project Settings > Service Accounts > Generate new
// private key, then set FIREBASE_SERVICE_ACCOUNT_KEY in Vercel to the raw
// JSON content. Without it, every call here throws instead of silently
// pretending to work.
export function getDb(): Firestore {
  if (_db) return _db;

  if (!admin.apps.length) {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
    if (!rawKey) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is not configured. Usage/tier tracking requires a Firebase service account key set as a Vercel environment variable."
      );
    }
    const serviceAccount = JSON.parse(rawKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  }

  _db = getFirestore(admin.apps[0]!, firebaseConfig.firestoreDatabaseId);
  return _db;
}
