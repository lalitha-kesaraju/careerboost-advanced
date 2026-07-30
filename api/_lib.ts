import { GoogleGenAI } from "@google/genai";

let _genAI: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey.includes("REPLACE_ME") || apiKey.length < 10) {
      throw new Error("GEMINI_API_KEY is not configured in Vercel environment variables.");
    }
    _genAI = new GoogleGenAI({ apiKey });
  }
  return _genAI;
}

export function extractText(response: any): string {
  if (response.text) return response.text;
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const textPart = parts.find((p: any) => p.text && !p.thought);
  return textPart?.text ?? parts.find((p: any) => p.text)?.text ?? "";
}

export const DEFAULT_MODEL = "gemini-3.5-flash-lite";
export const DEEP_MODEL = "gemini-3.5-flash-lite";

// Ordered by preference. The Gemini SDK's ApiError encodes the HTTP status
// inside a JSON-stringified `message`, not a real status field — quota
// exhaustion (429), retired models (404), and transient overload (503) all
// look like a thrown Error, so we can't distinguish "this key can't use this
// model" from "network blip" without inspecting the message body.
export const DEFAULT_MODEL_CHAIN = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
export const DEEP_MODEL_CHAIN = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

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

export async function generateWithFallback(
  models: string[],
  contents: any,
  config: any
): Promise<{ response: any; modelUsed: string }> {
  const genAI = getGenAI();
  let lastError: any;
  for (const model of models) {
    try {
      const response = await genAI.models.generateContent({ model, contents, config });
      return { response, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      if (!isRetryableGeminiError(err)) throw err;
      console.warn(`[gemini-fallback] ${model} failed (${err?.message}), trying next model in chain`);
    }
  }
  throw lastError;
}
