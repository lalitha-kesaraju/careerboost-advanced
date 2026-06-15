import React from 'react';
import { X, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestionBreakdown } from '../../types';

interface AnswerScoreCardProps {
  item: QuestionBreakdown | null;
  isOpen: boolean;
  onClose: () => void;
}

const getScoreColor = (value: number) => {
  if (value >= 8) return 'text-emerald-600 bg-emerald-50';
  if (value >= 6) return 'text-amber-600 bg-amber-50';
  if (value >= 4) return 'text-orange-600 bg-orange-50';
  return 'text-rose-600 bg-rose-50';
};

const getScoreGrade = (value: number) => {
  if (value >= 9) return 'A+';
  if (value >= 8) return 'A';
  if (value >= 7) return 'B+';
  if (value >= 6) return 'B';
  if (value >= 5) return 'C+';
  if (value >= 4) return 'C';
  return 'D';
};

const AnswerScoreCard: React.FC<AnswerScoreCardProps> = ({ item, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-700 p-6 rounded-t-[2rem] text-white relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-black tracking-tight mb-6">Answer Score Details</h2>

              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className={`w-28 h-28 rounded-full ${getScoreColor(item.score)} flex items-center justify-center border-4 border-white/30 shadow-lg`}>
                    <div>
                      <div className="text-4xl font-black">{item.score}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">out of 10</div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black mb-1">{getScoreGrade(item.score)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Grade</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Question</p>
                <p className="text-sm font-bold text-gray-800 leading-relaxed">{item.question}</p>
              </div>

              {item.used_star_method && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-900">STAR Method Applied</p>
                    <p className="text-xs text-emerald-700">Your answer follows the recommended structure</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Answer</p>
                  <p className="text-sm text-gray-600 leading-relaxed bg-rose-50/50 rounded-2xl p-4 italic">
                    {item.user_answer || '(No response recorded)'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ideal Answer</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-emerald-50/50 rounded-2xl p-4 font-medium">
                    {item.ideal_answer}
                  </p>
                </div>
              </div>

              {item.strength && (
                <div className="bg-emerald-50 rounded-2xl p-4">
                  <h3 className="font-black text-emerald-900 mb-2 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    What You Did Well
                  </h3>
                  <p className="text-sm text-emerald-800 leading-relaxed">{item.strength}</p>
                </div>
              )}

              {item.improvement && (
                <div className="bg-blue-50 rounded-2xl p-4">
                  <h3 className="font-black text-blue-900 mb-2 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    How to Improve
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed">{item.improvement}</p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-blue-700 text-white font-black py-3 rounded-2xl hover:bg-blue-800 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnswerScoreCard;
