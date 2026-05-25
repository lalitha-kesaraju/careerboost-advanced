import React from 'react';
import { motion } from 'motion/react';

interface ScoreBreakdownProps {
  overallScore: number;
  detailedScores: {
    communication?: number;
    technical?: number;
    confidence?: number;
    structure?: number;
  };
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ overallScore, detailedScores }) => {
  const scores = [
    { label: 'Communication', value: detailedScores.communication || 0, color: 'bg-blue-500' },
    { label: 'Technical', value: detailedScores.technical || 0, color: 'bg-blue-500' },
    { label: 'Confidence', value: detailedScores.confidence || 0, color: 'bg-blue-500' },
    { label: 'Structure', value: detailedScores.structure || 0, color: 'bg-pink-500' },
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-end justify-between border-b border-gray-100 pb-4">
        <div>
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Overall Score</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-gray-900">{Math.round(overallScore)}</span>
            <span className="text-xl font-bold text-gray-400 uppercase">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
            overallScore >= 80 ? 'bg-emerald-50 text-emerald-600' : 
            overallScore >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {overallScore >= 80 ? 'Exceptional' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scores.map((score) => (
          <div key={score.label} className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500">
              <span>{score.label}</span>
              <span>{Math.round(score.value * 10)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score.value * 10}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${score.color} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
