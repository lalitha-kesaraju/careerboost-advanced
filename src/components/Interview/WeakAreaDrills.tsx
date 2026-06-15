import React, { useState } from 'react';
import { Dumbbell, PartyPopper, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisReport } from '../../types';
import { getPracticeQuestions } from '../../services/gemini';
import SpinnerIcon from './icons/SpinnerIcon';

interface WeakAreaDrillsProps {
  report: AnalysisReport;
  jobRole: string;
  difficultyLevel: string;
}

interface PracticeQuestion {
  id: number;
  type: string;
  text: string;
  category: string;
  answerGuide: string;
  sampleAnswer?: string;
}

interface WeakArea {
  area: string;
  feedback: string;
  score: number;
}

const WeakAreaDrill: React.FC<{ area: WeakArea; jobRole: string; difficultyLevel: string }> = ({
  area, jobRole, difficultyLevel
}) => {
  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPracticeQuestions(jobRole || 'Professional', difficultyLevel || 'medium');
      setQuestions(result?.questions ?? []);
    } catch {
      setError('Could not generate practice questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-gray-900">{area.area}</p>
          <p className="text-xs text-gray-500 leading-relaxed mt-1">{area.feedback}</p>
        </div>
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest bg-rose-50 text-rose-600 border-rose-200 shrink-0">
          {area.score}/10
        </span>
      </div>

      {!questions && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black hover:bg-blue-800 transition-colors disabled:opacity-60"
        >
          {loading ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating…' : 'Generate practice questions for this'}
        </button>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      {questions && questions.length > 0 && (
        <div className="space-y-2">
          {questions.map((q, i) => {
            const open = expandedIdx === i;
            return (
              <div key={q.id ?? i} className="bg-white rounded-xl border border-gray-100">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setExpandedIdx(open ? null : i)}
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">{q.type}</span>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{q.text}</p>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />}
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Answer Guide</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{q.answerGuide}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const WeakAreaDrills: React.FC<WeakAreaDrillsProps> = ({ report, jobRole, difficultyLevel }) => {
  const weakAreas: WeakArea[] = (report.performance_feedback ?? []).filter(item => item.score < 6);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl">
      <h3 className="text-base font-black text-gray-900 flex items-center gap-3 mb-6">
        <Dumbbell className="w-5 h-5 text-blue-700" /> Weak Area Drills
      </h3>

      {weakAreas.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-3 py-8">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <PartyPopper className="w-7 h-7" />
          </div>
          <p className="text-sm font-black text-gray-900">No major weak areas — great job!</p>
          <p className="text-xs text-gray-500 max-w-sm">
            Every category scored 6 or above. Keep practicing to maintain your edge.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {weakAreas.map((area, i) => (
            <WeakAreaDrill key={i} area={area} jobRole={jobRole} difficultyLevel={difficultyLevel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeakAreaDrills;
