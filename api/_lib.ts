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
