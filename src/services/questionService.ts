import { Type } from "@google/genai";
import { safeParseJson } from "../lib/aiUtils";
import { callGemini } from "../lib/geminiApi";

const DEFAULT_MODEL = "gemini-2.5-flash";

export interface AptitudeQuestion {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface PersonalityQuestion {
  id: string;
  category: string;
  text: string;
  options: { text: string; value: string }[];
}

export async function generateAptitudeQuestions(count: number = 5, difficulty: string = 'medium'): Promise<AptitudeQuestion[]> {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        category: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
        text: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          minItems: 4,
          maxItems: 4
        },
        correct: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
        explanation: { type: Type.STRING }
      },
      required: ['id', 'category', 'difficulty', 'text', 'options', 'correct', 'explanation']
    }
  };

  try {
    const response = await callGemini(
      `Generate ${count} ${difficulty} difficulty aptitude questions for a career platform. 
      Mix categories like Quantitative, Logical Reasoning, and Verbal Proficiency.
      Ensure they are challenging and professional.`,
      {
        responseMimeType: "application/json",
        responseSchema: schema as any
      }
    );

    if (!response || !response.text) {
      throw new Error("No response from AI");
    }

    return safeParseJson(response.text, []);
  } catch (error: any) {
    console.error("Failed to generate aptitude questions:", error);
    if (error.message?.includes("API key not valid")) {
       // Optional: Provide a static set of fallback questions here if needed
    }
    return [];
  }
}

export async function generatePersonalityQuestions(count: number = 10): Promise<PersonalityQuestion[]> {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        category: { type: Type.STRING },
        text: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              value: { type: Type.STRING }
            },
            required: ['text', 'value']
          }
        }
      },
      required: ['id', 'category', 'text', 'options']
    }
  };

  try {
    const response = await callGemini(
      `Generate ${count} psychometric/personality questions for career profiling.
      Categories should include things like Leadership, Teamwork, Emotional Intelligence, and Work Ethic.
      Options should be on a scale or specific behaviors (e.g., Strongly Agree to Strongly Disagree, or behavioral choices).`,
      {
        responseMimeType: "application/json",
        responseSchema: schema as any
      }
    );

    if (!response || !response.text) {
      throw new Error("No response from AI");
    }

    return safeParseJson(response.text, []);
  } catch (error: any) {
    console.error("Failed to generate personality questions:", error);
    return [];
  }
}

