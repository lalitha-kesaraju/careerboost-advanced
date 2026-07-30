import React, { useState, useEffect } from 'react';
import { AnalysisReport, InterviewData, QuestionAnswerSuggestion } from '../../types';
import SpinnerIcon from './icons/SpinnerIcon';
import ScoreBreakdown from './ScoreBreakdown';
import BusinessToolsSection from './BusinessToolsSection';
import {
  BarChart, Target, Brain, Lightbulb, TrendingUp, ArrowRight, MessageSquare, ShieldCheck, Sparkles,
  Activity, Zap, Users, CheckCircle, XCircle, AlertCircle, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getDetailedAnswerSuggestions } from '../../services/gemini';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface AnalysisScreenProps {
  report: AnalysisReport | null;
  isLoading: boolean;
  error: string | null;
  onRestart: () => void;
  interviewData: InterviewData | null;
  history?: any[]; // To match the component logic
  userId?: string;
  interviewId?: string | null;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = (s: number) => {
    if (s >= 8) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s >= 5) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-rose-50 text-rose-600 border-rose-100';
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getColor(score)}`}>
      {score}/10
    </span>
  );
};

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
    report, isLoading, error, onRestart, interviewData, history, userId, interviewId
}) => {
  const [answerSuggestions, setAnswerSuggestions] = useState<QuestionAnswerSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [escalationState, setEscalationState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleEscalateToCoach = async () => {
    if (!userId || !interviewId) return;
    setEscalationState('sending');
    try {
      await updateDoc(doc(db, 'users', userId, 'interviews', interviewId), {
        escalatedForReview: true,
        escalatedAt: new Date().toISOString(),
      });
      setEscalationState('sent');
    } catch (err) {
      console.error('Escalation failed:', err);
      setEscalationState('error');
    }
  };

  const generateAnswerSuggestions = async () => {
    if (!interviewData || !history) return;
    setIsGeneratingSuggestions(true);
    try {
      const data = await getDetailedAnswerSuggestions(interviewData, history);
      setAnswerSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Decrypting Performance Logic</h2>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Our AI is calibrating your feedback metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500">
           <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{error || "Analysis Unavailable"}</h2>
            <button onClick={onRestart} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Restart Session</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-fade-in">
        {/* Header Summary */}
        <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl space-y-10">
            <div className="flex items-center gap-6 border-b border-gray-100 pb-10">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                    <BarChart className="w-10 h-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Performance Audit</h1>
                    <p className="text-gray-500 font-medium">Session: {interviewData?.jobRole} • {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Core Narrative</h3>
                    <p className="text-xl font-medium text-gray-800 leading-relaxed italic serif whitespace-pre-wrap">
                        {report.overall_summary}
                    </p>
                </div>
                <div>
                     <ScoreBreakdown 
                        overallScore={report.overallScore} 
                        detailedScores={{
                            communication: report.performance_feedback.find(f => f.area.includes('Communication'))?.score,
                            technical: report.performance_feedback.find(f => f.area.includes('Technical'))?.score,
                            confidence: report.performance_feedback.find(f => f.area.includes('Confidence'))?.score,
                            structure: report.performance_feedback.find(f => f.area.includes('Problem'))?.score
                        }} 
                    />
                </div>
            </div>
        </div>

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl space-y-8">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-indigo-600" />
                    Technical Proficiency
                </h3>
                <div className="space-y-4">
                    {report.performance_feedback.map((item, i) => (
                        <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.area}</p>
                                <p className="text-sm font-bold text-gray-700 italic serif">{item.feedback}</p>
                            </div>
                            <ScoreBadge score={item.score} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl space-y-8">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Cognitive State Analysis
                </h3>
                <div className="space-y-6">
                    {report.emotional_analysis.map((item, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{item.emotion}</span>
                                <span className="text-xs font-black text-gray-900">{item.score * 10}%</span>
                            </div>
                            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${item.score * 10}%` }} />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium italic serif mt-2">{item.justification}</p>
                        </div>
                    ))}
                </div>
                {report.visual_engagement_summary && (
                    <div className="pt-6 border-t border-gray-100 space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Visual Engagement (from real webcam snapshots)
                        </p>
                        <p className="text-xs text-gray-600 italic serif leading-relaxed">{report.visual_engagement_summary}</p>
                    </div>
                )}
            </div>
        </div>

        {/* Hire Probability + Behavioral Metrics */}
        {(report.hireProbability !== undefined || report.behavioralMetrics) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {report.hireProbability !== undefined && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl space-y-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Hiring Assessment
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                      <circle cx="50" cy="50" r="40" fill="none"
                        stroke={report.hireProbability >= 70 ? '#10b981' : report.hireProbability >= 45 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="10"
                        strokeDasharray={`${report.hireProbability * 2.513} 251.3`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-gray-900">{report.hireProbability}%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm border ${
                      report.hiringVerdict === 'Strong Hire' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      report.hiringVerdict === 'Hire' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      report.hiringVerdict === 'Maybe' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {report.hiringVerdict === 'Strong Hire' || report.hiringVerdict === 'Hire'
                        ? <CheckCircle className="w-4 h-4" />
                        : report.hiringVerdict === 'Maybe' ? <AlertCircle className="w-4 h-4" />
                        : <XCircle className="w-4 h-4" />}
                      {report.hiringVerdict}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Based on AI analysis of your responses, communication style, and technical depth.</p>
                  </div>
                </div>
              </div>
            )}

            {report.behavioralMetrics && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl space-y-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-cyan-600" />
                  Behavioral Metrics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Words Spoken', value: report.behavioralMetrics.wordsPerMinute, unit: '', max: 300, color: 'bg-indigo-500' },
                    { label: 'Filler Words', value: report.behavioralMetrics.fillerWordCount, unit: '', max: 20, color: 'bg-rose-400', invert: true },
                    { label: 'Sentiment', value: report.behavioralMetrics.sentimentScore, unit: '%', max: 100, color: 'bg-emerald-500' },
                    { label: 'Clarity', value: report.behavioralMetrics.clarityScore, unit: '%', max: 100, color: 'bg-cyan-500' },
                  ].map((m, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.label}</span>
                        <span className={`text-[10px] font-black ${m.invert && m.value > 5 ? 'text-rose-500' : 'text-gray-700'}`}>{m.value}{m.unit}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${m.color}`} style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Big Five Personality Traits */}
        {report.bigFiveTraits && (
          <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-purple-600 rounded-[1.5rem] flex items-center justify-center text-white">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Big Five Personality Calibration</h3>
                <p className="text-gray-500 text-sm font-medium">Inferred from your interview language patterns by Gemini 2.5 Pro</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-5">
                {([
                  { key: 'openness', label: 'Openness', desc: 'Curiosity & creativity', color: 'bg-purple-500' },
                  { key: 'conscientiousness', label: 'Conscientiousness', desc: 'Reliability & precision', color: 'bg-indigo-500' },
                  { key: 'extraversion', label: 'Extraversion', desc: 'Energy & assertiveness', color: 'bg-cyan-500' },
                  { key: 'agreeableness', label: 'Agreeableness', desc: 'Warmth & cooperation', color: 'bg-emerald-500' },
                  { key: 'neuroticism', label: 'Neuroticism', desc: 'Emotional volatility', color: 'bg-rose-400' },
                ] as const).map(trait => {
                  const score = (report.bigFiveTraits as any)[trait.key] as number;
                  return (
                    <div key={trait.key} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-black text-gray-800">{trait.label}</span>
                          <span className="text-[10px] text-gray-400 font-medium ml-2 italic">{trait.desc}</span>
                        </div>
                        <span className="text-xs font-black text-gray-700">{score}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className={`h-full rounded-full ${trait.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col justify-center gap-6">
                <div className="p-8 bg-purple-50 rounded-[2rem] border border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Dominant Trait</span>
                  </div>
                  <p className="text-2xl font-black text-purple-900">{report.bigFiveTraits.dominant_trait}</p>
                </div>
                <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Career Fit</span>
                  </div>
                  <p className="text-sm font-bold text-indigo-900 italic serif leading-relaxed">{report.bigFiveTraits.career_fit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Improvements Section */}
        <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <Lightbulb className="w-48 h-48 rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight mb-2">High-Stakes Refinement</h2>
                        <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Precision feedback for elite market placement</p>
                    </div>
                    <button 
                        onClick={generateAnswerSuggestions}
                        disabled={isGeneratingSuggestions || showSuggestions}
                        className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isGeneratingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Detailed Answer Fixes
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Suggestions</h3>
                        <div className="space-y-4">
                            {report.improvement_suggestions.map((tip, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                                     <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-4 h-4" />
                                     </div>
                                     <p className="text-sm leading-relaxed italic serif opacity-80">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recommended Next Steps</h3>
                        <div className="space-y-4">
                            {report.nextSteps?.map((step, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-indigo-600/20 rounded-2xl border border-indigo-500/20 group cursor-pointer hover:bg-indigo-600/40 transition-all">
                                     <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                                            <Target className="w-4 h-4 text-white" />
                                        </div>
                                        <p className="text-sm font-black">{step}</p>
                                     </div>
                                     <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Answer Suggestions Modal/Section */}
        <AnimatePresence>
            {showSuggestions && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-8 pt-10"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <MessageSquare className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest">Context-Aware Answer Refinement</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8">
                        {answerSuggestions.map((item, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden shadow-indigo-100/50">
                                <div className="p-10 border-b border-gray-50 bg-indigo-50/20">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">The Question</h4>
                                    <p className="text-lg font-black text-gray-900 italic serif">"{item.question}"</p>
                                </div>
                                <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white">
                                     <div className="space-y-8">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Attempt</h5>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600 italic serif bg-gray-50 p-6 rounded-2xl">{item.user_answer}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ideal Mental Model (HR Expectations)</h5>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600 italic serif leading-relaxed">{item.hr_expectations}</p>
                                        </div>
                                     </div>
                                     <div className="space-y-8">
                                        <div className="p-10 bg-emerald-50/30 rounded-[2rem] border border-emerald-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Recommended Logic Flow</h5>
                                            </div>
                                            <p className="text-sm font-black text-gray-800 italic serif leading-relaxed mb-6">"{item.suggested_answer}"</p>
                                            <div className="space-y-3">
                                                {item.improvement_tips.map((tip, idx) => (
                                                    <div key={idx} className="flex gap-3 text-xs text-gray-500 font-medium italic serif">
                                                        <span className="text-emerald-500">•</span>
                                                        {tip}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-2xl">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Expected Score Impact</span>
                                            <span className="text-lg font-black text-indigo-700">{item.score_impact}</span>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Business Section if applicable */}
        {interviewData?.roleCategory === 'Home-Based Business' && report.business_plan && (
            <BusinessToolsSection 
                businessPlan={report.business_plan}
                budgetEstimate={report.budget_estimate}
                resources={report.resources}
                skillsGap={report.skills_gap}
                jobRole={interviewData.jobRole}
            />
        )}

        {/* Final Action */}
        <div className="pt-10 flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-4">
                <button
                    onClick={onRestart}
                    className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center gap-3 hover:scale-105 active:scale-95"
                >
                    Start New Cycle <ArrowRight className="w-5 h-5" />
                </button>
                {userId && interviewId && (
                    <button
                        onClick={handleEscalateToCoach}
                        disabled={escalationState === 'sending' || escalationState === 'sent'}
                        className="px-10 py-5 bg-white border-2 border-indigo-100 text-indigo-700 rounded-2xl font-black shadow-sm hover:border-indigo-300 transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <UserCheck className="w-5 h-5" />
                        {escalationState === 'sent' ? 'Sent to Coach for Review' : escalationState === 'sending' ? 'Sending...' : 'Escalate to Human Coach'}
                    </button>
                )}
            </div>
            {escalationState === 'error' && (
                <p className="text-rose-500 text-xs font-black uppercase tracking-widest">Failed to escalate — please try again.</p>
            )}
            {escalationState === 'sent' && (
                <p className="text-xs text-gray-500 max-w-md text-center italic serif">
                    A human coach will review this session's transcript and feedback. This helps close the trust gap that pure AI scoring can't.
                </p>
            )}
        </div>
    </div>
  );
};

export default AnalysisScreen;

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Terminal = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
);
