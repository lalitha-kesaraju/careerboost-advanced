import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Brain, 
  Target, 
  Zap, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Timer, 
  Lightbulb, 
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  PieChart
} from 'lucide-react';

import { APTITUDE_DATA, AptitudeQuestion } from '../data/aptitudeQuestions';

export function AptitudeTestSection() {
  const [view, setView] = useState<'lobby' | 'test' | 'results'>('lobby');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timer, setTimer] = useState(0);
  const [activeDifficulty, setActiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [filteredQuestions, setFilteredQuestions] = useState<AptitudeQuestion[]>([]);

  useEffect(() => {
    if (view === 'test') {
      const diff = activeDifficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
      const pool = APTITUDE_DATA.filter(q => q.difficulty === diff);
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
      setFilteredQuestions(shuffled);
      setCurrentIdx(0);
      setAnswers({});
      setTimer(0);
    }
  }, [view, activeDifficulty]);

  const handleAnswer = (optionIdx: number) => {
    const q = filteredQuestions[currentIdx];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: optionIdx }));
    
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setView('results');
    }
  };

  const calculateScore = () => {
    let correct = 0;
    filteredQuestions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    return {
      correct,
      total: filteredQuestions.length,
      percentage: Math.round((correct / filteredQuestions.length) * 100)
    };
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <AnimatePresence mode="wait">
        {view === 'lobby' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="bg-gray-900 text-white p-12 rounded-[3.5rem] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/10" />
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="max-w-xl space-y-6">
                     <span className="px-4 py-1.5 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">Mastery Level 1</span>
                     <h1 className="text-6xl font-black tracking-tighter leading-none">Aptitude <span className="text-indigo-400">Elite</span></h1>
                     <p className="text-gray-400 text-lg italic serif leading-relaxed">
                        100 Questions. 3 Difficulty Tiers. One goal: Absolute cognitive domination for technical and leadership roles.
                     </p>
                     <div className="flex gap-4 pt-4">
                        <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                           <BarChart3 className="w-5 h-5 text-indigo-400" />
                           <span className="text-xs font-bold">100+ Challenges</span>
                        </div>
                        <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                           <Timer className="w-5 h-5 text-indigo-400" />
                           <span className="text-xs font-bold">Timed Experience</span>
                        </div>
                     </div>
                  </div>
                  <div className="w-full md:w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                     <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Select Difficulty</h3>
                        <div className="space-y-2">
                           {['easy', 'medium', 'hard'].map((d: any) => (
                             <button 
                               key={d}
                               onClick={() => setActiveDifficulty(d)}
                               className={`w-full p-4 rounded-xl font-bold text-xs flex justify-between items-center transition-all ${
                                 activeDifficulty === d ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                               }`}
                             >
                               <span className="capitalize">{d}</span> Level
                               {activeDifficulty === d && <CheckCircle2 className="w-4 h-4" />}
                             </button>
                           ))}
                        </div>
                     </div>
                     <button 
                       onClick={() => setView('test')}
                       className="w-full py-5 bg-white text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                     >
                        Start Diagnostic <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] space-y-4">
                  <PieChart className="w-8 h-8 text-indigo-600" />
                  <h4 className="text-xl font-black">Quantitative</h4>
                  <p className="text-gray-500 text-xs leading-relaxed italic serif">Focus on data interpretation, ratios, and algebraic logic for business systems.</p>
               </div>
               <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] space-y-4">
                  <Brain className="w-8 h-8 text-indigo-600" />
                  <h4 className="text-xl font-black">Logical Reasoning</h4>
                  <p className="text-gray-500 text-xs leading-relaxed italic serif">Master pattern recognition and syllogistic structures favored by top-tier firms.</p>
               </div>
               <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] space-y-4">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                  <h4 className="text-xl font-black">Verbal Proficiency</h4>
                  <p className="text-gray-500 text-xs leading-relaxed italic serif">Enhance communication precision, semantic analysis, and situational judgment.</p>
               </div>
            </div>
          </motion.div>
        )}

        {view === 'test' && (
          <motion.div 
            key="test"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                    {currentIdx + 1}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{filteredQuestions[currentIdx].category}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{activeDifficulty} Tier Progress</p>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Elapsed</p>
                     <p className="font-mono text-indigo-600 font-bold">
                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                     </p>
                  </div>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                     <motion.div 
                       animate={{ width: `${((currentIdx + 1) / filteredQuestions.length) * 100}%` }}
                       className="h-full bg-indigo-600"
                     />
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl space-y-12">
               <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  {filteredQuestions[currentIdx].text}
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredQuestions[currentIdx].options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className="group p-8 bg-gray-50 border border-gray-100 rounded-3xl text-left hover:bg-indigo-600 hover:text-white transition-all transform active:scale-[0.98] relative overflow-hidden"
                    >
                       <span className="relative z-10 text-lg font-black">{opt}</span>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-xl scale-0 group-hover:scale-100 transition-transform">
                          <CheckCircle2 className="w-4 h-4" />
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {view === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            <div className="bg-gray-900 rounded-[3.5rem] p-16 text-center text-white relative overflow-hidden">
               <Sparkles className="absolute top-[-40px] left-[-40px] w-64 h-64 text-white/5" />
               <div className="relative z-10 space-y-8">
                  <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20">
                     <Trophy className="w-12 h-12" />
                  </div>
                  <h2 className="text-5xl font-black tracking-tight mt-6">Diagnostic Verified</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto py-10">
                     <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Cognitive Score</p>
                        <p className="text-4xl font-black text-indigo-400">{calculateScore().percentage}%</p>
                     </div>
                     <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Correct Hits</p>
                        <p className="text-4xl font-black text-indigo-400">{calculateScore().correct} / {calculateScore().total}</p>
                     </div>
                     <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Time per Question</p>
                        <p className="text-4xl font-black text-indigo-400">
                           {Math.round(timer / filteredQuestions.length)}s
                        </p>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                     <button 
                       onClick={() => {
                         setView('lobby');
                         setCurrentIdx(0);
                         setTimer(0);
                       }}
                       className="px-12 py-4 bg-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                     >
                        Next Tier <ChevronRight className="w-4 h-4" />
                     </button>
                     <button className="px-12 py-4 bg-white/10 rounded-2xl font-black text-sm hover:bg-white/20 transition-all border border-white/5">
                        Download Analytics
                     </button>
                  </div>
               </div>
            </div>

            <section className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl">
               <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                  Performance Insights
               </h3>
               <div className="space-y-6">
                  {filteredQuestions.map(q => (
                    <div key={q.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex gap-8 items-start hover:border-indigo-100 transition-all">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                         answers[q.id] === q.correct ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                       }`}>
                          {answers[q.id] === q.correct ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                       </div>
                       <div className="space-y-4">
                          <p className="font-bold text-gray-900 leading-relaxed text-lg">"{q.text}"</p>
                          <div className="flex gap-4 items-center">
                             <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-[10px] font-black uppercase text-gray-400">
                                Category: <span className="text-indigo-600">{q.category}</span>
                             </div>
                             <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-[10px] font-black uppercase text-gray-400">
                                Difficulty: <span className="text-amber-600">{q.difficulty}</span>
                             </div>
                          </div>
                          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                             <p className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-2">Mithra Explanation</p>
                             <p className="text-sm text-indigo-700 italic serif leading-relaxed">{q.explanation}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
