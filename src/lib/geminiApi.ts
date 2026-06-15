import { safeParseJson } from "./aiUtils";

export async function callGemini(contents: any, config: any = {}, systemInstruction?: any) {
  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, config, systemInstruction })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Gemini proxy call failed');
    }

    const result = await response.json();
    
    if (!result || !result.text) {
      throw new Error("No response from AI");
    }

    return result;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid") || error.message?.includes("authentication failed")) {
      throw new Error("AI authentication failed. Our servers are currently experiencing issues with AI connectivity.");
    }
    throw error;
  }
}
