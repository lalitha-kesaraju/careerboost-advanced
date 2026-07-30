import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_firebaseAdmin.js";

const LIMITS: Record<string, number> = {
  resumeAnalyses: 3,
  skillGaps: 5,
  careerAdviceCount: 10,
  mockInterviews: 5,
  learningPlans: 1,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId, feature } = req.body;
    if (!userId || !feature) {
      return res.status(400).json({ error: "Missing userId or feature" });
    }

    const db = getDb();
    const userRef = db.collection("users").doc(userId);

    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      if (!doc.exists) {
        t.set(userRef, {
          userId,
          usage: {
            resumeAnalyses: 0,
            skillGaps: 0,
            careerAdviceCount: 0,
            mockInterviews: 0,
            jobApplicationsCount: 0,
            learningPlans: 0,
          },
          tier: "basic",
        });
        return;
      }

      const data = doc.data()!;
      const currentUsage = data.usage?.[feature] || 0;

      if (currentUsage >= (LIMITS[feature] ?? Infinity)) {
        throw new Error(`Limit of ${LIMITS[feature]} exceeded for ${feature}`);
      }

      t.update(userRef, { [`usage.${feature}`]: currentUsage + 1 });
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error("[user/increment-usage]", err);
    res.status(400).json({ error: err.message || "Failed to increment usage" });
  }
}
