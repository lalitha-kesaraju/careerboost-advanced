import { GoogleGenAI } from '@google/genai';
import { AnalysisReport, InterviewData } from '../types';

function getAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set');
  return new GoogleGenAI({ apiKey });
}

export async function analyzeInterview(
  interviewData: InterviewData,
  history: { role: 'ai' | 'user'; content: string }[]
): Promise<AnalysisReport> {
  const ai = getAI();

  const transcript = history
    .map(h => `${h.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${h.content}`)
    .join('\n');

  const resumeSection = interviewData.resumeText
    ? `Candidate Resume:\n"""\n${interviewData.resumeText}\n"""`
    : 'No resume provided.';

  const prompt = `You are an expert interview coach and talent acquisition specialist. Analyze this mock interview and return a detailed JSON report.

Role applied for: ${interviewData.jobRole}
Difficulty: ${interviewData.difficultyLevel?.toUpperCase() ?? 'MEDIUM'}
Company: ${interviewData.dreamCompany ?? 'Not specified'}
${resumeSection}

Full Interview Transcript:
---
${transcript}
---

EVALUATION GUIDELINES based on difficulty:
- EASY: Encouraging tone, focus on basics and confidence
- MEDIUM: Expect structured answers (STAR method), professional communication
- HARD: Elite evaluation — architectural depth, edge cases, leadership, optimization

Return ONLY valid JSON matching this exact structure:
{
  "overall_summary": "2-3 sentence executive summary of performance",
  "overall_score": <number 1-10>,

  "performance_feedback": [
    { "area": "Technical Knowledge", "feedback": "...", "score": <1-10> },
    { "area": "Communication Skills", "feedback": "...", "score": <1-10> },
    { "area": "Problem-Solving", "feedback": "...", "score": <1-10> },
    { "area": "HR & Behavioral", "feedback": "...", "score": <1-10> },
    { "area": "Confidence & Presence", "feedback": "...", "score": <1-10> }
  ],

  "emotional_analysis": [
    { "emotion": "<detected emotion>", "justification": "<cite transcript>", "score": <1-10> }
  ],

  "presentation_analysis": {
    "attire_recommendation": "What attire is ideal for a ${interviewData.jobRole} interview and tips on professional dress",
    "environment_recommendation": "Ideal interview environment setup: lighting, background, noise, posture",
    "body_language_inferred": "Inferred body language based on tone, word choice, and confidence in transcript",
    "vocal_confidence_assessment": "Assessment of speaking pace, filler words, clarity, and vocal confidence",
    "overall_presentation_score": <number 1-10>
  },

  "question_breakdown": [
    {
      "question": "<exact question the interviewer asked>",
      "user_answer": "<what the candidate actually said — quote from transcript>",
      "ideal_answer": "<comprehensive model answer with specific points>",
      "strength": "<what was good about their answer>",
      "improvement": "<specific, actionable thing to improve>",
      "used_star_method": <true|false>,
      "score": <number 1-10>
    }
  ],

  "improvement_suggestions": [
    "<specific actionable suggestion 1>",
    "<specific actionable suggestion 2>",
    "<specific actionable suggestion 3>",
    "<specific actionable suggestion 4>",
    "<specific actionable suggestion 5>"
  ],

  "next_steps": [
    "<priority action item 1>",
    "<priority action item 2>",
    "<priority action item 3>"
  ],

  "keywords_hit": ["<role-relevant keyword they mentioned>"],
  "keywords_missed": ["<important keyword for this role they should have mentioned>"],
  "star_method_assessment": "Overall assessment of whether they used Situation/Task/Action/Result structure",
  "filler_analysis": "Analysis of verbal habits — filler words (um, uh, like, basically, you know), repetition, and how to improve"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text?.trim() ?? '';
  try {
    const parsed = JSON.parse(text);
    // normalize score field
    if (parsed.overall_score && !parsed.overallScore) parsed.overallScore = parsed.overall_score;
    return parsed as AnalysisReport;
  } catch {
    // strip markdown fences if model added them
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    return JSON.parse(cleaned) as AnalysisReport;
  }
}
