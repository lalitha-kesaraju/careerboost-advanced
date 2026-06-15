export interface InterviewData {
  userName: string;
  jobRole: string;
  roleCategory: string;
  dreamCompany?: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  language: string;
  timeLimit: number;
  resume: string;
  resumeText?: string;
  isPracticeMode: boolean;
  interviewType?: 'technical' | 'hr' | 'mixed';
  transcript?: string;
  recordingUrl?: string;
}

export interface QuestionAnswerSuggestion {
  question: string;
  user_answer: string;
  hr_expectations: string;
  suggested_answer: string;
  improvement_tips: string[];
  score_impact: string;
}

export interface QuestionBreakdown {
  question: string;
  user_answer: string;
  ideal_answer: string;
  strength: string;
  improvement: string;
  used_star_method: boolean;
  score: number;
}

export interface AnalysisReport {
  overall_summary: string;
  overall_score: number;
  overallScore?: number; // backward compat

  performance_feedback: { area: string; feedback: string; score: number }[];
  emotional_analysis: { emotion: string; justification: string; score: number }[];
  facial_expression_analysis?: { expression: string; justification: string; score: number }[];

  presentation_analysis: {
    attire_recommendation: string;
    environment_recommendation: string;
    body_language_inferred: string;
    vocal_confidence_assessment: string;
    overall_presentation_score: number;
  };

  question_breakdown: QuestionBreakdown[];

  improvement_suggestions: string[];
  next_steps: string[];

  keywords_hit: string[];
  keywords_missed: string[];
  star_method_assessment: string;
  filler_analysis: string;

  // legacy / business fields
  nextSteps?: string[];
  business_plan?: any;
  skills_gap?: any;
  budget_estimate?: any;
  resources?: any;
}
