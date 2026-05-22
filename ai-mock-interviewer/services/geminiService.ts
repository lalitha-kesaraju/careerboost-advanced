
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        overall_summary: {
            type: Type.STRING,
            description: "A brief, overall summary of the candidate's interview performance.",
        },
        emotional_analysis: {
            type: Type.ARRAY,
            description: "An analysis of the candidate's emotional tone throughout the interview.",
            items: {
                type: Type.OBJECT,
                properties: {
                    emotion: {
                        type: Type.STRING,
                        description: "The dominant emotion detected (e.g., Confident, Nervous, Enthusiastic)."
                    },
                    justification: {
                        type: Type.STRING,
                        description: "A brief justification for the detected emotion, citing parts of the transcript."
                    },
                    score: {
                        type: Type.NUMBER,
                        description: "A score from 1 to 10 indicating the appropriateness of the emotion for an interview context."
                    }
                },
                required: ["emotion", "justification", "score"],
            }
        },
        facial_expression_analysis: {
            type: Type.ARRAY,
            description: "An analysis of the candidate's inferred facial expressions and body language based on their tone and word choice from the transcript.",
            items: {
                type: Type.OBJECT,
                properties: {
                    expression: {
                        type: Type.STRING,
                        description: "The dominant inferred expression (e.g., Confident, Engaged, Distracted, Anxious)."
                    },
                    justification: {
                        type: Type.STRING,
                        description: "A brief justification for the inferred expression, citing parts of the transcript that suggest this."
                    },
                    score: {
                        type: Type.NUMBER,
                        description: "A score from 1 to 10 indicating the appropriateness of the inferred expression for an interview context."
                    }
                },
                required: ["expression", "justification", "score"],
            }
        },
        performance_feedback: {
            type: Type.ARRAY,
            description: "Specific feedback on the candidate's performance in different areas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    area: {
                        type: Type.STRING,
                        description: "The area of feedback (e.g., Technical Knowledge, Communication, Problem-Solving, HR Questions)."
                    },
                    feedback: {
                        type: Type.STRING,
                        description: "Constructive feedback, including strengths and areas for improvement."
                    },
                    score: {
                        type: Type.NUMBER,
                        description: "A score from 1 to 10 for this specific area."
                    }
                },
                 required: ["area", "feedback", "score"],
            }
        },
        improvement_suggestions: {
            type: Type.ARRAY,
            description: "A list of 3-5 actionable suggestions for the candidate to improve their interview skills.",
            items: {
                type: Type.STRING,
                description: "A specific, constructive suggestion."
            }
        }
    },
    required: ["overall_summary", "emotional_analysis", "facial_expression_analysis", "performance_feedback", "improvement_suggestions"],
};


export const generateAnalysis = async (resume: string | undefined, jobRole: string, transcript: string): Promise<AnalysisReport> => {
  let prompt = `
    As an expert interview analyst, please provide a detailed performance review based on the following mock interview.
    The candidate is applying for the role of: ${jobRole}.
    
    You must analyze multiple facets of the interview:
    1.  **Vocal Emotional Tone**: Analyze the candidate's emotional state based on their word choice and phrasing in the transcript.
    2.  **Inferred Facial Expressions**: Since you cannot see the candidate, infer their likely facial expressions and body language (e.g., confident, engaged, anxious) from the tone, confidence, and language used in the transcript.
    3.  **Performance Feedback**: Evaluate their skills (Technical, Communication, etc.) based on their answers.
    4.  **Actionable Suggestions**: Provide concrete steps for improvement.
  `;

  if (resume) {
    prompt += `
      \nCandidate's Resume:
      ---
      ${resume}
      ---
      \nAnalyze the transcript in the context of the resume and job role.
    `;
  } else {
    prompt += `
      \nThe candidate did not provide a resume.
      \nAnalyze the transcript based on the job role requirements alone.
    `;
  }

  prompt += `
    \nFull Interview Transcript:
    ---
    ${transcript}
    ---

    Evaluate the candidate's technical skills, communication abilities, problem-solving skills, and responses to HR questions.
    Based *only* on the transcript, analyze their vocal emotional tone and infer their facial expressions.
    Provide a detailed analysis in the requested JSON format. The feedback should be constructive and actionable.
    Finally, provide a list of 3 to 5 clear, actionable suggestions for improvement.
  `;


  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as AnalysisReport;
  } catch (e) {
    console.error("Failed to parse analysis JSON:", jsonText, e);
    throw new Error("Could not parse the analysis from the model.");
  }
};