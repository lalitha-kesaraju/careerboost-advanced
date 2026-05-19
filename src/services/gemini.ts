import { safeParseJson } from "../lib/aiUtils";
import { callGemini } from "../lib/geminiApi";

const DEFAULT_MODEL = "gemini-flash-latest";

export async function parseResume(rawText: string) {
  // Use SDK directly — no proxy auth needed for setup screen
  const { GoogleGenAI } = await import('@google/genai');
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are an expert ATS parser. Analyze the resume text below.
CRITICAL: If it is not a resume/CV, set "isNotResume": true.

Text:
${rawText}

Return ONLY valid JSON:
{
  "isNotResume": false,
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "website": "" },
  "targetRole": "",
  "summary": "",
  "skills": [],
  "experience": [{ "title": "", "company": "", "duration": "", "description": "" }],
  "projects": [{ "title": "", "description": "", "link": "" }],
  "education": [{ "degree": "", "school": "", "year": "" }]
}`,
    config: { responseMimeType: 'application/json' },
  });

  const parsed = safeParseJson(response.text ?? '{}', {
    personalInfo: { fullName: '', email: '', phone: '', location: '', website: '' },
    summary: '', skills: [], experience: [], projects: [], education: []
  });

  if (parsed.isNotResume) {
    throw new Error('The uploaded file does not look like a resume. Please upload a valid CV or resume.');
  }
  return parsed;
}

export async function analyzeResume(parsedData: any) {
  const result = await callGemini(
    `Analyze this resume data and provide a professional score (0-100), specific feedback, market positioning, and an ATS parsability audit.
    Data: ${JSON.stringify(parsedData)}
    
    Return JSON:
    {
      "score": number,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"],
      "targetRole": "string",
      "atsScore": "90%+",
      "marketInsights": {
        "salaryRange": "string",
        "demandLevel": "High/Medium/Low",
        "experienceLevel": "Junior/Mid/Senior",
        "topCompaniesHiring": ["string"]
      },
      "atsChecks": [
        { "label": "string", "status": "string", "desc": "string", "passed": boolean }
      ]
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

export async function generateReferralMessage(targetCompany: string, role: string, resumeData: any) {
  const result = await callGemini(
    `Write a compelling 200-character LinkedIn referral request or cold outreach message for a '${role}' position at '${targetCompany}'. 
    Use the user's background: ${JSON.stringify(resumeData.experience?.[0] || {})}
    
    Return JSON:
    {
      "subject": "string",
      "message": "string",
      "strategy": "string"
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

export async function analyzeSkillGap(resumeData: any, targetRole: string) {
  const result = await callGemini(
    `You are a high-stakes Career Strategist. Compare this user's resume against the standard requirements for a '${targetRole}' role.
    
    Resume Data: ${JSON.stringify(resumeData)}
    Target Role: ${targetRole}
    
    CRITICAL: 
    1. If the user's background (e.g., Software Engineering) is completely unrelated to the target role (e.g., Corporate Lawyer), be BRUTALLY HONEST. 
    2. Explicitly include "Hard Requirements" like Degrees (JD, MD, PhD) and Licenses (Bar, Medical License) in 'missingSkills' if they are missing.
    3. Do not say it's a "great foundation" if there is zero overlap. Call out that this is a total career restart.
    4. Match Percentage should be 0-10% if they lack the basic degree/license required for the profession.
    
    Return JSON:
    {
      "matchPercentage": number,
      "missingSkills": [
        { "name": "string", "priority": "Critical|High|Medium", "reason": "string (e.g. Requires 3 years of Law School or Law Degree)" }
      ],
      "marketDemand": "High|Medium|Low",
      "insight": "A professional assessment of the gap. Be brutally honest about the degree/license requirements and the difficulty of the pivot.",
      "difficulty": "Easy|Moderate|Hard|Extreme",
      "timeline": "string (e.g., 3-5 years for degree + bar)"
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

export async function generateLearningPlan(goal: string, missingSkills: string[]) {
  const result = await callGemini(
    `Create a detailed 4-week learning plan to acquire these skills: ${missingSkills.join(', ')} for the goal: ${goal}.
    
    Return JSON:
    {
      "title": "string",
      "weeks": [{
        "week": number,
        "focus": "string",
        "tasks": ["string"],
        "resources": ["string"]
      }]
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

export async function generateInterviewQuestions(role: string, level: string, resumeData?: any) {
  const result = await callGemini(
    `Generate 5 challenging interview questions for a ${level} ${role} position. ${resumeData ? `Tailor them to this resume: ${JSON.stringify(resumeData)}` : ''}
    
    Return JSON:
    {
      "questions": [
        { "id": "number", "text": "string", "category": "Technical|Behavioral", "hint": "string" }
      ]
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

export async function analyzeInterviewResponse(question: string, responseText: string) {
  const result = await callGemini(
    `Analyze the following interview response.
    Question: ${question}
    Response: ${responseText}
    
    Return JSON:
    {
      "score": number,
      "feedback": "string",
      "sampleAnswer": "string",
      "praise": "string",
      "critique": "string"
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

export async function getCareerProjection(role: string, level: string, currentSkills: string[]) {
  const result = await callGemini(
    `Provide a high-stakes, realistic career projection for a ${level} ${role}. 
    The user currently has these skills: ${currentSkills.join(', ')}.
    
    CRITICAL: 
    - If the user's current skills are completely unrelated to ${role}, identify that the "market survival" is very low without immediate upskilling.
    - Provide specific position titles they can achieve in 5, 10, and 15 years.
    - Give concrete strategic advice for each milestone.
    - Include market trends, risk analysis, and strategic alternatives for those pivoting.
    
    Return JSON:
    {
      "isRightPath": boolean,
      "reasoning": "string",
      "salaryInfo": { "current": "string (localized/global estimate)", "projection5yr": "string" },
      "marketTrends": ["string"],
      "riskAnalysis": ["string"],
      "strategicAlternatives": ["string"],
      "projections": [
        { "years": 5, "position": "string", "marketSurvival": "string", "advice": "string" },
        { "years": 10, "position": "string", "marketSurvival": "string", "advice": "string" },
        { "years": 15, "position": "string", "marketSurvival": "string", "advice": "string" }
      ]
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

export async function getDetailedLearningPath(goal: string, missingSkills: string[], durationMonths: number) {
  const result = await callGemini(
    `Create a ${durationMonths}-month intensive learning path for: ${goal}.
    Missing Skills: ${missingSkills.join(', ')}
    
    Return JSON:
    {
      "executiveSummary": "A concise 2-sentence strategy for this career pivot.",
      "weeklyCommitment": "Estimate weekly hours (e.g., '15-20 Hours/Week')",
      "outcomes": ["3-4 specific outcomes upon completion"],
      "phases": [{
         "title": "Phase name",
         "duration": "Duration (e.g., 'Weeks 1-4')",
         "topics": ["4-5 specific topics"],
         "project": "A capstone project for this phase"
      }]
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

export async function getRecommendedCourses(targetRole: string, missingSkills: string[]) {
  const result = await callGemini(
    `Recommend 6 high-quality, real-world courses (from Coursera, Udemy, edX, or YouTube) for someone targeting a '${targetRole}' role who lacks these skills: ${missingSkills.join(', ')}.
    
    Return JSON:
    {
      "courses": [
        {
          "title": "string",
          "provider": "string", 
          "level": "Beginner|Intermediate|Advanced",
          "duration": "string",
          "rating": number,
          "link": "string (valid URL to course or search page)",
          "skillsCovered": ["string"],
          "whyRecommend": "string"
        }
      ]
    }`,
    { responseMimeType: "application/json" }
  );

  return safeParseJson(result.text);
}

import { HARDCODED_COURSES } from '../constants/courseContent';

export async function getCourseContent(courseTitle: string, topic: string, phase: 'understand' | 'apply' | 'evaluate' | 'master') {
  // Check hardcoded first
  if (HARDCODED_COURSES[courseTitle] && HARDCODED_COURSES[courseTitle][topic]) {
    const hardcoded = HARDCODED_COURSES[courseTitle][topic][phase];
    if (hardcoded) {
        return hardcoded;
    }
  }

  const prompts = {
    understand: `Provide detailed theory, code examples, and a conceptual overview for the topic "${topic}" in the course "${courseTitle}". Format as JSON with: theory (markdown), examples (array of {title, code, language, explanation}), and keyPoints (array).`,
    apply: `Generate 3 coding problems for "${topic}" in "${courseTitle}". Range: Easy, Medium, Hard. Each with: prompt, starterCode, testCases (array of {input, expected}), and hints (array).`,
    evaluate: `Generate a 10-question quiz for "${topic}" in "${courseTitle}". Each question: question, options (array), correctIndex (number), explanation.`,
    master: `Generate a final mastery summary and a list of 5 "What's Next" recommendations for "${topic}" in "${courseTitle}".`
  };

  const result = await callGemini(prompts[phase], { responseMimeType: "application/json" });

  return safeParseJson(result.text);
}

export async function getIDEAgentAdvice(task: string, currentCode: string, language: string, context: any) {
  const systemInstruction = `You are "AG-1 Orchestrator", an advanced AI Coding Agent integrated into a professional IDE.
    Your mission is to assist the user in completing high-stakes engineering tasks effectively.
    
    Current Task: ${task}
    Current Code Environment:
    \`\`\`${language}
    ${currentCode}
    \`\`\`
    
    Context: ${JSON.stringify(context)}
    
    Rules:
    1. Respond ONLY with the complete, updated code block that solves the task.
    2. Ensure the code is production-grade, optimized, and includes necessary comments.
    3. Do not include conversational text unless it's within code comments.
    4. Maintain the existing code structure unless the task requires architectural changes.`;

  const result = await callGemini(
    `Task: ${task}\n\nCode:\n${currentCode}`,
    { systemInstruction }
  );
  
  return result.text?.replace(/```[a-z]*\n/g, '').replace(/```/g, '') || "";
}

export async function getMithraAdvice(question: string, context: any, history: {role: string, content: string}[]) {
  const historyText = history.map(h => `${h.role === 'user' ? 'User' : 'Mithra'}: ${h.content}`).join('\n');
  
  const systemInstruction = `You are "Mithra", an elite career strategist and personal growth companion. 
    You have absolute knowledge of the user's career data on this platform.
    
    Current User Data Context:
    - Resumes: ${JSON.stringify(context.resumes || [])}
    - Job Applications: ${JSON.stringify(context.applications || [])}
    - Achievements: ${JSON.stringify(context.achievements || [])}
    - Usage: ${JSON.stringify(context.usage || {})}
    
    Guidelines:
    1. Be concise, strategic, and encouraging.
    2. Reference their specific data (e.g., "I noticed you're interviewing at Stripe...").
    3. Use Markdown for formatting (bolding, lists, etc.).
    4. Proactively suggest the next best action.`;

  const result = await callGemini(
    `Conversation History:\n${historyText}\n\nCurrent Question: ${question}`,
    { systemInstruction }
  );

  return result.text || "";
}

export async function getPracticeQuestions(role: string, level: string) {
  const result = await callGemini(
    `Generate 10 diverse and challenging interview questions for a ${level} ${role} position. 
    Include a mix of Technical, Behavioral, and Situational questions. 
    For each question, provide a detailed "answerGuide" that explains both the recruiter's expectations and a sample high-quality response.
    
    Return JSON:
    {
      "questions": [
        { 
          "id": number, 
          "type": "Technical|Behavioral|Situational", 
          "text": "string", 
          "category": "string", 
          "answerGuide": "string",
          "sampleAnswer": "string" 
        }
      ]
    }`,
    { responseMimeType: "application/json" }
  );
  return safeParseJson(result.text);
}

export async function getInterviewTips(category: string) {
  const result = await callGemini(
    `Generate 15 essential interview tips for the category: ${category}. 
    Include Do's, Don'ts, Strategy, and Preparation.
    
    Return JSON:
    {
      "tips": [
        { "id": number, "title": "string", "type": "Do's|Don'ts|Strategy|Preparation", "description": "string", "category": "string" }
      ]
    }`,
    { responseMimeType: "application/json" }
  );
  return safeParseJson(result.text);
}

export async function getCodingExam(role: string, level: string, language: string) {
  const result = await callGemini(
    `Generate a challenging coding problem for a ${level} ${role} in ${language}.
    
    Return JSON:
    {
      "id": number,
      "title": "string",
      "difficulty": "Easy|Medium|Hard",
      "description": "Markdown string describing the problem, constraints, and examples.",
      "starterCode": "string",
      "testCases": [{ "input": "string", "expected": "string" }],
      "timeLimit": "string",
      "memoryLimit": "string"
    }`,
    { responseMimeType: "application/json" }
  );
  return safeParseJson(result.text);
}

export async function evaluateCode(problem: any, code: string, language: string) {
  const result = await callGemini(
    `Evaluate this ${language} code for the following problem. 
    Problem: ${JSON.stringify(problem)}
    User Code: ${code}
    
    Return JSON:
    {
      "passed": boolean,
      "results": [{ "testCase": number, "passed": boolean, "output": "string", "error": "string|null" }],
      "feedback": "string",
      "efficiency": "string",
      "score": number
    }`,
    { responseMimeType: "application/json" }
  );
  return safeParseJson(result.text);
}

export async function getSessionAnalysis(setup: any, history: any[], codingResult?: any) {
  const result = await callGemini(
    `Provide a comprehensive performance analysis for the following interview session.
    Setup Data: ${JSON.stringify(setup)}
    Interview History: ${JSON.stringify(history)}
    Coding Result (if any): ${JSON.stringify(codingResult || {})}
    
    The analysis should be highly professional and calibrated for an interview difficulty level: ${setup.difficultyLevel.toUpperCase()}.
    
    CRITICAL EVALUATION GUIDELINES:
    - EASY: Focus on the basics, confidence, and basic understanding. Scoring should be relatively encouraging.
    - MEDIUM: Expect professional-grade answers. Look for structured logic (STAR method) and technical competence.
    - HARD: This is an elite/senior level evaluation. Be critical, look for architectural depth, optimization, edge-case awareness, and leadership qualities.
    
    ${setup.roleCategory === 'Home-Based Business' ? 'Since this is a Home-Based Business category, you MUST also include a "business_plan", "skills_gap", "budget_estimate", and "resources" logic in your response.' : ''}
    
    Return JSON:
    {
      "overall_summary": "Detailed paragraph summary of the performance",
      "performance_feedback": [
        { "area": "Technical Accuracy", "feedback": "...", "score": number (1-10) },
        { "area": "Communication", "feedback": "...", "score": number (1-10) },
        { "area": "Problem Solving", "feedback": "...", "score": number (1-10) },
        { "area": "Confidence", "feedback": "...", "score": number (1-10) }
      ],
      "emotional_analysis": [
        { "emotion": "Tone Variance", "justification": "...", "score": number },
        { "emotion": "Engagement", "justification": "...", "score": number }
      ],
      "facial_expression_analysis": [
        { "expression": "Inferred Presence", "justification": "Confident tone suggests professional posture", "score": number }
      ],
      "improvement_suggestions": ["specific actionable advice"],
      "nextSteps": ["specific topics to study"],
      "overallScore": number (0-100)${setup.roleCategory === 'Home-Based Business' ? `,
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
        "startup_costs": [{ "item": "...", "cost": number }],
        "monthly_expenses": [{ "item": "...", "cost": number }],
        "break_even_months": number,
        "pricing_recommendation": "..."
      },
      "resources": [
        { "title": "...", "description": "...", "url": "...", "category": "registration" }
      ]` : ''}
    }`,
    { responseMimeType: "application/json" }
  );
  return safeParseJson(result.text);
}

export async function getDetailedAnswerSuggestions(setup: any, history: any[]) {
  const result = await callGemini(
    `Analyze the following interview transcript and provide improved answer suggestions.
    Role: ${setup.role}
    History: ${JSON.stringify(history)}
    
    Return JSON:
    {
      "suggestions": [
        {
          "question": "The question asked by AI",
          "user_answer": "What the user actually said",
          "hr_expectations": "What recruiters look for in this answer",
          "suggested_answer": "A perfect model answer",
          "improvement_tips": ["tip 1", "tip 2"],
          "score_impact": "How much this would improve their score"
        }
      ]
    }`,
    { responseMimeType: "application/json" }
  );
  return safeParseJson(result.text);
}

