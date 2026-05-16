/**
 * Safely parses a JSON string from an AI response.
 * Handles cases where the AI might include markdown backticks or extra text around the JSON block.
 */
export function safeParseJson(text: string, fallback: any = {}): any {
  if (!text) return fallback;
  
  const cleanText = text.trim();
  
  try {
    // Attempt 1: Direct parse
    return JSON.parse(cleanText);
  } catch (e) {
    // Attempt 2: Extract from markdown block
    const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (innerE) {
        // Fall through
      }
    }
    
    // Attempt 3: Find first bracket/brace and last bracket/brace
    // This handles cases where there's text before or after the JSON object
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleanText.substring(firstBrace, lastBrace + 1));
      } catch (innerE) {
        // Fall through
      }
    }

    const firstBracket = cleanText.indexOf('[');
    const lastBracket = cleanText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleanText.substring(firstBracket, lastBracket + 1));
      } catch (innerE) {
        // Fall through
      }
    }

    console.error("AI Parsing Error: Could not find valid JSON in response", {
      error: e instanceof Error ? e.message : String(e),
      textPreview: cleanText.substring(0, 200) + "..."
    });
    
    return fallback;
  }
}
