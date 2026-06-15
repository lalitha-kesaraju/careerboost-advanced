import React from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface PerformanceFeedbackItem {
  area: string;
  feedback: string;
  score: number;
}

interface ScoreBreakdownProps {
  overallScore: number;
  performanceFeedback: PerformanceFeedbackItem[];
}

const getRingColor = (score: number) => {
  if (score >= 8) return '#10b981';
  if (score >= 6) return '#f59e0b';
  return '#ef4444';
};

const getBarColor = (score: number) => {
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 6) return 'bg-amber-500';
  return 'bg-rose-500';
};

const CircularGauge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const color = getRingColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="-rotate-90 w-24 h-24" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <motion.circle
            cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 10) * circumference }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-gray-900">{score.toFixed(1)}</span>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-600 text-center">{label}</p>
    </div>
  );
};

const LinearGauge: React.FC<{ score: number; label: string }> = ({ score, label }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <span className="text-xs font-black text-gray-900">{score.toFixed(1)}/10</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${getBarColor(score)}`}
        initial={{ width: 0 }}
        animate={{ width: `${(score / 10) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  </div>
);

const KEYWORD_MAP: Record<string, string[]> = {
  Communication: ['communication'],
  Technical: ['technical'],
  Confidence: ['confidence', 'presence'],
  Structure: ['problem-solving', 'problem solving', 'hr', 'behavioral', 'structure'],
};

const pickCategories = (
  performanceFeedback: PerformanceFeedbackItem[],
  overallScore: number
): PerformanceFeedbackItem[] => {
  if (!performanceFeedback?.length) {
    return Object.keys(KEYWORD_MAP).map(label => ({ area: label, feedback: '', score: overallScore }));
  }

  const used = new Set<number>();
  const picked: PerformanceFeedbackItem[] = [];

  for (const [label, keywords] of Object.entries(KEYWORD_MAP)) {
    const idx = performanceFeedback.findIndex((item, i) =>
      !used.has(i) && keywords.some(k => item.area.toLowerCase().includes(k))
    );
    if (idx !== -1) {
      used.add(idx);
      picked.push({ ...performanceFeedback[idx], area: label });
    }
  }

  if (picked.length < 4) {
    for (let i = 0; i < performanceFeedback.length && picked.length < 4; i++) {
      if (!used.has(i)) {
        used.add(i);
        picked.push(performanceFeedback[i]);
      }
    }
  }

  return picked.slice(0, 4);
};

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ overallScore, performanceFeedback }) => {
  const categories = pickCategories(performanceFeedback, overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl space-y-8"
    >
      <h3 className="text-base font-black text-gray-900 flex items-center gap-3">
        <Activity className="w-5 h-5 text-blue-700" /> Score Breakdown
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((item, i) => (
          <CircularGauge key={i} score={item.score} label={item.area} />
        ))}
      </div>

      <div className="space-y-4 bg-gray-50 rounded-2xl p-6">
        {categories.map((item, i) => (
          <LinearGauge key={i} score={item.score} label={item.area} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span>8-10 Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span>6-7 Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full" />
          <span>0-5 Needs Work</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreBreakdown;
