import type { VercelRequest, VercelResponse } from "@vercel/node";
import { extractText, DEEP_MODEL_CHAIN, generateWithFallback } from "../_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { contents, config, systemInstruction } = req.body;
    if (!contents) return res.status(400).json({ error: "Missing 'contents'" });

    const models = config?.model ? [config.model, ...DEEP_MODEL_CHAIN] : DEEP_MODEL_CHAIN;
    const { response } = await generateWithFallback(
      models,
      Array.isArray(contents) ? contents : [{ role: "user", parts: [{ text: String(contents) }] }],
      { ...config, systemInstruction }
    );

    res.json({ text: extractText(response) });
  } catch (err: any) {
    console.error("[deep]", err);
    res.status(500).json({ error: err.message || "Deep analysis failed" });
  }
}
