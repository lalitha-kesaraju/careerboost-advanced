import type { VercelRequest, VercelResponse } from "@vercel/node";
import { extractText, DEFAULT_MODEL_CHAIN, generateWithFallback } from "../_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { contents, config, systemInstruction } = req.body;
    if (!contents) return res.status(400).json({ error: "Missing 'contents'" });

    const models = config?.model ? [config.model, ...DEFAULT_MODEL_CHAIN] : DEFAULT_MODEL_CHAIN;
    const { response } = await generateWithFallback(
      models,
      Array.isArray(contents) ? contents : [{ role: "user", parts: [{ text: String(contents) }] }],
      { ...config, systemInstruction }
    );

    res.json({ text: extractText(response) });
  } catch (err: any) {
    console.error("[generate]", err);
    res.status(500).json({ error: err.message || "AI generation failed" });
  }
}
