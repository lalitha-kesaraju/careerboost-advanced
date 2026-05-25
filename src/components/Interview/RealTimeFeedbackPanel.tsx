import React, { useState } from 'react';
import { Activity, Zap, Volume2, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SpeechMetrics, FeedbackIndicator } from './services/realTimeFeedbackService';

interface Props {
  metrics: SpeechMetrics;
  feedback: FeedbackIndicator[];
  isActive: boolean;
}

const bar = (value: number, good: boolean) => (
  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${good ? 'bg-emerald-400' : value >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);

const RealTimeFeedbackPanel: React.FC<Props> = ({ metrics, feedback, isActive }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!isActive) return null;

  const paceOk = metrics.wordsPerMinute >= 120 && metrics.wordsPerMinute <= 160;

  return (
    <div
      className={`fixed top-20 right-4 z-50 bg-black/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300 ${collapsed ? 'w-12' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Live Feedback</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-white/40 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* WPM */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-white/50" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Pace</span>
              </div>
              <span className={`text-xs font-black ${paceOk ? 'text-emerald-400' : 'text-amber-400'}`}>
                {metrics.wordsPerMinute} WPM
              </span>
            </div>
            <p className="text-[9px] text-white/30">Optimal: 120–160 WPM</p>
            {bar(Math.min(100, (metrics.wordsPerMinute / 180) * 100), paceOk)}
          </div>

          {/* Clarity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-white/50" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Clarity</span>
              </div>
              <span className={`text-xs font-black ${metrics.clarity >= 70 ? 'text-emerald-400' : metrics.clarity >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {Math.round(metrics.clarity)}%
              </span>
            </div>
            {bar(metrics.clarity, metrics.clarity >= 70)}
          </div>

          {/* Confidence */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Confidence</span>
              <span className={`text-xs font-black ${metrics.confidence >= 70 ? 'text-emerald-400' : metrics.confidence >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {Math.round(metrics.confidence)}%
              </span>
            </div>
            {bar(metrics.confidence, metrics.confidence >= 70)}
          </div>

          {/* Filler words */}
          <div className="flex items-center justify-between py-2 border-t border-white/5">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Filler Words</span>
            <span className={`text-xs font-black ${metrics.fillerWordsCount === 0 ? 'text-emerald-400' : metrics.fillerWordsCount < 3 ? 'text-amber-400' : 'text-rose-400'}`}>
              {metrics.fillerWordsCount}
            </span>
          </div>

          {/* Feedback indicators */}
          {feedback.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              {feedback.slice(0, 3).map((f, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-xl text-[10px] ${f.level === 'good' ? 'bg-emerald-500/10 text-emerald-300' : f.level === 'warning' ? 'bg-amber-500/10 text-amber-300' : 'bg-rose-500/10 text-rose-300'}`}>
                  {f.level === 'good'
                    ? <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                    : <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />}
                  <span className="font-bold leading-relaxed">{f.suggestion ?? f.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeFeedbackPanel;
