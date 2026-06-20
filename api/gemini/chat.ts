import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGenAI, extractText, DEFAULT_MODEL } from "../_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { payload } = req.body;
    if (!payload?.message) return res.status(400).json({ error: "Missing 'payload.message'" });

    const { message, history = [], systemInstruction, config = {} } = payload;
    const genAI = getGenAI();
    const model = config.model || DEFAULT_MODEL;

    const response = await genAI.models.generateContent({
      model,
      contents: [...history, { role: "user", parts: [{ text: message }] }],
      config: { maxOutputTokens: config.maxOutputTokens || 512, systemInstruction },
    });

    res.json({ text: extractText(response) });
  } catch (err: any) {
    console.error("[chat]", err);
    res.status(500).json({ error: err.message || "Chat failed" });
  }
}
