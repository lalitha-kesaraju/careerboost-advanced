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
  transcript?: string;
  recordingUrl?: string;
  weakTopics?: string[];
  jobPostingText?: string;
}

export interface QuestionAnswerSuggestion {
  question: string;
  user_answer: string;
  hr_expectations: string;
  suggested_answer: string;
  improvement_tips: string[];
  score_impact: string;
}

export interface BigFiveTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  dominant_trait: string;
  career_fit: string;
}

export interface BehavioralMetrics {
  wordsPerMinute: number;
  fillerWordCount: number;
  avgResponseLength: number;
  sentimentScore: number;
  clarityScore: number;
}

export interface AnalysisReport {
  overall_summary: string;
  performance_feedback: { area: string; feedback: string; score: number }[];
  emotional_analysis: { emotion: string; justification: string; score: number }[];
  facial_expression_analysis: { expression: string; justification: string; score: number }[];
  improvement_suggestions: string[];
  nextSteps?: string[];
  overallScore: number;
  hireProbability?: number;
  hiringVerdict?: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  bigFiveTraits?: BigFiveTraits;
  behavioralMetrics?: BehavioralMetrics;
  business_plan?: any;
  skills_gap?: any;
  budget_estimate?: any;
  resources?: any;
}
