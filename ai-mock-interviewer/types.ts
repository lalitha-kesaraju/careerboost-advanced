export enum AppState {
  SETUP,
  READY,
  INTERVIEW,
  ANALYSIS,
}

export interface InterviewData {
  userName: string;
  resume?: string;
  jobRole: string;
  timeLimit: number;
  transcript?: string;
  recordingUrl?: string | null;
}

export interface EmotionAnalysis {
  emotion: string;
  justification: string;
  score: number;
}

export interface FacialExpressionAnalysis {
  expression: string;
  justification: string;
  score: number;
}

export interface PerformanceFeedback {
    area: string;
    feedback: string;
    score: number;
}

export interface AnalysisReport {
  overall_summary: string;
  emotional_analysis: EmotionAnalysis[];
  facial_expression_analysis: FacialExpressionAnalysis[];
  performance_feedback: PerformanceFeedback[];
  improvement_suggestions: string[];
}