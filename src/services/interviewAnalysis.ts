import { callGemini } from '../lib/geminiApi';
import { safeParseJson } from '../lib/aiUtils';
import { AnalysisReport, InterviewData } from '../types';

export async function analyzeInterview(
  interviewData: InterviewData,
  history: { role: 'ai' | 'user'; content: string }[]
): Promise<AnalysisReport> {
  const transcript = history
    .map(h => `${h.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${h.content}`)
    .join('\n');

  const resumeSection = interviewData.resumeText
    ? `Candidate Resume:\n"""\n${interviewData.resumeText}\n"""`
    : 'No resume provided.';

  const practiceNote = interviewData.isPracticeMode
    ? `\nPRACTICE MODE: This is a PRACTICE session. Use an encouraging, supportive tone throughout. Celebrate what the candidate did well first. Provide gentle, constructive guidance — not harsh criticism. Scores should be slightly generous to build confidence. Frame all improvement suggestions as growth opportunities, not failures. Overall score must account for effort and courage to practice.`
    : '';

  const roleCategory = (interviewData.roleCategory ?? '').toLowerCase();
  const isBusinessRole = roleCategory.includes('business') || roleCategory.includes('entrepreneur');

  const businessFieldsNote = isBusinessRole
    ? `\n\nThis candidate's role category ("${interviewData.roleCategory}") relates to entrepreneurship or business ownership. In ADDITION to all fields above, also include these fields in the JSON response:
"business_plan": {
  "executive_summary": "...",
  "market_analysis": "...",
  "financial_projections": "...",
  "marketing_strategy": "...",
  "operational_plan": "..."
},
"skills_gap": {
  "skills_possessed": ["..."],
  "skills_needed": ["..."],
  "training_recommendations": ["..."],
  "timeline_to_readiness": "..."
},
"budget_estimate": {
  "startup_costs": [{ "item": "...", "cost": <number> }],
  "monthly_expenses": [{ "item": "...", "cost": <number> }],
  "break_even_months": <number>,
  "pricing_recommendation": "..."
},
"resources": [
  { "title": "...", "description": "...", "url": "...", "category": "..." }
]`
    : '';

  const prompt = `You are an expert interview coach and talent acquisition specialist. Analyze this mock interview and return a detailed JSON report.${practiceNote}

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
${interviewData.isPracticeMode ? '- PRACTICE MODE: Be a supportive mentor, not a harsh judge.' : ''}

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
}${businessFieldsNote}`;

  const result = await callGemini(prompt, {
    // gemini-3.1-pro-preview: deep post-interview analysis requiring complex reasoning
    model: 'gemini-3.1-pro-preview',
    responseMimeType: 'application/json',
  });

  const parsed = safeParseJson(result.text);
  // normalize score field
  if (parsed.overall_score && !parsed.overallScore) parsed.overallScore = parsed.overall_score;
  return parsed as AnalysisReport;
}
