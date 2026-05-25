import React, { useState } from 'react';
import { AnalysisReport, InterviewData } from '../../types';
import {
  BarChart3, Brain, TrendingUp, ArrowRight, MessageSquare, ShieldCheck,
  Sparkles, CheckCircle2, Target, Shirt, Monitor, Mic2,
  ChevronDown, ChevronUp, Star, Zap, AlertTriangle, RefreshCw, Download, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnalysisScreenProps {
  report: AnalysisReport | null;
  isLoading: boolean;
  error: string | null;
  onRestart: () => void;
  interviewData: InterviewData | null;
  history?: any[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const ScoreBadge = ({ score }: { score: number }) => {
  const color = score >= 8 ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
    : score >= 6 ? 'bg-amber-50 text-amber-600 border-amber-200'
    : 'bg-rose-50 text-rose-600 border-rose-200';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${color}`}>
      {score}/10
    </span>
  );
};

const ScoreBar = ({ score, color = 'bg-blue-500' }: { score: number; color?: string }) => (
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
    <motion.div
      className={`h-full rounded-full ${color}`}
      initial={{ width: 0 }}
      animate={{ width: `${score * 10}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  </div>
);

const OverallScoreRing = ({ score }: { score: number }) => {
  const pct = score * 10;
  const color = pct >= 75 ? '#10b981' : pct >= 55 ? '#f59e0b' : '#ef4444';
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-gray-900">{score}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">/ 10</span>
      </div>
    </div>
  );
};

// ── Q&A Breakdown Card ───────────────────────────────────────────────────────

const QACard = ({ item, index }: { item: any; index: number }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
            item.score >= 8 ? 'bg-emerald-100 text-emerald-700' :
            item.score >= 6 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
          }`}>{index + 1}</div>
          <p className="text-sm font-bold text-gray-800 truncate">{item.question}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <ScoreBadge score={item.score} />
          {item.used_star_method && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] font-black rounded-lg border border-blue-100 uppercase tracking-wider">STAR</span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4 border-t border-gray-50">
              {/* What you said */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Answer</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed bg-rose-50/50 rounded-2xl p-4 italic">
                  {item.user_answer || '(No response recorded)'}
                </p>
              </div>

              {/* Ideal answer */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ideal Answer</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-emerald-50/50 rounded-2xl p-4 font-medium">
                  {item.ideal_answer}
                </p>
              </div>

              {/* Feedback */}
              <div className="pt-4 space-y-3">
                <div className="p-4 bg-blue-50/50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Strength</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.strength}</p>
                </div>
                <div className="p-4 bg-amber-50/50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Improve</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.improvement}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  report, isLoading, error, onRestart, interviewData
}) => {

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
          <div className="relative w-16 h-16 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Analyzing Your Performance</h2>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">AI is reviewing every answer, tone, and technique…</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{error || 'Analysis Unavailable'}</h2>
          <p className="text-sm text-gray-500 mt-2">The AI could not generate a report for this session.</p>
          <button onClick={onRestart} className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 bg-blue-700 text-white rounded-2xl font-bold text-sm hover:bg-blue-800 transition-all">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const score = report.overall_score ?? report.overallScore ?? 0;
  const scoreColor = score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-amber-600' : 'text-rose-600';

  const hireLikelihood = score >= 8
    ? { label: 'Strong Hire', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : score >= 7
    ? { label: 'Likely Hire', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    : score >= 5
    ? { label: 'Possible Hire', color: 'bg-amber-50 text-amber-700 border-amber-200' }
    : { label: 'Not Ready Yet', color: 'bg-rose-50 text-rose-700 border-rose-200' };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">

      {/* ── Header ── */}
      <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-gray-100 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-gray-100 pb-8 mb-8">
          <div className="w-16 h-16 bg-blue-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100 shrink-0">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Performance Analysis</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              {interviewData?.jobRole} · {interviewData?.difficultyLevel?.toUpperCase()} · {new Date().toLocaleDateString()}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-2xl text-xs font-black border uppercase tracking-widest ${hireLikelihood.color}`}>
            {hireLikelihood.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center gap-3">
            <OverallScoreRing score={score} />
            <p className={`text-sm font-black uppercase tracking-widest ${scoreColor}`}>
              {score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Needs Work' : 'Keep Practicing'}
            </p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3">Overall Assessment</p>
            <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-medium italic">{report.overall_summary}</p>
          </div>
        </div>
      </div>

      {/* ── Performance Scores ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl space-y-6">
          <h3 className="text-base font-black text-gray-900 flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-700" /> Performance Breakdown
          </h3>
          {report.performance_feedback.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-600">{item.area}</span>
                <ScoreBadge score={item.score} />
              </div>
              <ScoreBar score={item.score}
                color={item.score >= 8 ? 'bg-emerald-500' : item.score >= 6 ? 'bg-amber-500' : 'bg-rose-500'} />
              <p className="text-[11px] text-gray-500 leading-relaxed">{item.feedback}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl space-y-6">
          <h3 className="text-base font-black text-gray-900 flex items-center gap-3">
            <Brain className="w-5 h-5 text-blue-700" /> Emotional Tone
          </h3>
          {report.emotional_analysis.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-600">{item.emotion}</span>
                <span className="text-xs font-black text-gray-900">{item.score * 10}%</span>
              </div>
              <ScoreBar score={item.score} color="bg-blue-500" />
              <p className="text-[11px] text-gray-500 italic leading-relaxed">{item.justification}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Facial Expression Analysis ── */}
      {report.facial_expression_analysis && report.facial_expression_analysis.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl">
          <h3 className="text-base font-black text-gray-900 flex items-center gap-3 mb-6">
            <Smile className="w-5 h-5 text-blue-700" /> Inferred Body Language & Expressions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.facial_expression_analysis.map((item, i) => {
              const exprColor = item.score >= 8
                ? 'bg-emerald-50 border-emerald-100'
                : item.score >= 6
                ? 'bg-blue-50 border-blue-100'
                : 'bg-amber-50 border-amber-100';
              const scoreTextColor = item.score >= 8 ? 'text-emerald-600' : item.score >= 6 ? 'text-blue-600' : 'text-amber-600';
              return (
                <div key={i} className={`p-5 rounded-2xl border ${exprColor} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-gray-800">{item.expression}</span>
                    <span className={`text-xs font-black ${scoreTextColor}`}>{item.score}/10</span>
                  </div>
                  <ScoreBar score={item.score}
                    color={item.score >= 8 ? 'bg-emerald-500' : item.score >= 6 ? 'bg-blue-500' : 'bg-amber-500'} />
                  <p className="text-[11px] text-gray-500 leading-relaxed italic">{item.justification}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Presentation Analysis ── */}
      {report.presentation_analysis && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-700" /> Presentation & Environment
            </h3>
            <ScoreBadge score={report.presentation_analysis.overall_presentation_score} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Shirt className="w-4 h-4 text-blue-700" />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Attire</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{report.presentation_analysis.attire_recommendation}</p>
            </div>
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Environment</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{report.presentation_analysis.environment_recommendation}</p>
            </div>
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-700" />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Body Language</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{report.presentation_analysis.body_language_inferred}</p>
            </div>
            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Mic2 className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Vocal Confidence</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{report.presentation_analysis.vocal_confidence_assessment}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Q&A Breakdown ── */}
      {report.question_breakdown?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-gray-900 flex items-center gap-3 px-1">
            <MessageSquare className="w-5 h-5 text-blue-700" />
            Question-by-Question Breakdown
            <span className="text-xs font-bold text-gray-400">({report.question_breakdown.length} questions)</span>
          </h3>
          {report.question_breakdown.map((item, i) => (
            <QACard key={i} item={item} index={i} />
          ))}
        </div>
      )}

      {/* ── Keywords + STAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(report.keywords_hit?.length > 0 || report.keywords_missed?.length > 0) && (
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl space-y-5">
            <h3 className="text-base font-black text-gray-900 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" /> Keywords
            </h3>
            {report.keywords_hit?.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">✓ Mentioned</p>
                <div className="flex flex-wrap gap-2">
                  {report.keywords_hit.map((k, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">{k}</span>
                  ))}
                </div>
              </div>
            )}
            {report.keywords_missed?.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">✗ Should Mention</p>
                <div className="flex flex-wrap gap-2">
                  {report.keywords_missed.map((k, i) => (
                    <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl space-y-5">
          <h3 className="text-base font-black text-gray-900 flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500" /> Technique Analysis
          </h3>
          {report.star_method_assessment && (
            <div className="p-4 bg-blue-50/50 rounded-2xl">
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">STAR Method</p>
              <p className="text-sm text-gray-700 leading-relaxed">{report.star_method_assessment}</p>
            </div>
          )}
          {report.filler_analysis && (
            <div className="p-4 bg-amber-50/50 rounded-2xl">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Filler Words & Verbal Habits</p>
              <p className="text-sm text-gray-700 leading-relaxed">{report.filler_analysis}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Improvement + Next Steps ── */}
      <div className="bg-gray-900 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl">
        <h2 className="text-xl font-black tracking-tight mb-2">Action Plan</h2>
        <p className="text-blue-500 font-bold text-xs uppercase tracking-widest mb-8">What to do before your next interview</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Improvement Areas</p>
            {report.improvement_suggestions?.map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 text-xs font-black">{i + 1}</div>
                <p className="text-sm leading-relaxed opacity-80">{tip}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority Next Steps</p>
            {(report.next_steps ?? report.nextSteps ?? []).map((step, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-blue-700/20 rounded-2xl border border-blue-500/20 hover:bg-blue-700/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-sm font-bold">{step}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Restart ── */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <button
          onClick={() => {
            const title = `Interview Report - ${interviewData?.jobRole ?? 'Interview'} - ${new Date().toLocaleDateString()}`;
            const prevTitle = document.title;
            document.title = title;
            window.print();
            document.title = prevTitle;
          }}
          className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-black shadow hover:shadow-md hover:border-blue-500 transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-5 h-5" /> Export PDF
        </button>
        <button
          onClick={onRestart}
          className="flex items-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw className="w-5 h-5" /> Start New Interview
        </button>
      </div>
    </div>
  );
};

export default AnalysisScreen;

