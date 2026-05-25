import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, ChevronRight, CheckCircle2, GraduationCap, Zap, Loader2, Calendar, Target, Brain, Star, ArrowLeft } from 'lucide-react';
import { getDetailedLearningPath } from '../services/gemini';

interface LearningPlanSectionProps {
  goal: string;
  missingSkills: string[];
  onBack: () => void;
}

export function LearningPlanSection({ goal, missingSkills, onBack, data, onDataUpdate }: LearningPlanSectionProps & { data?: any, onDataUpdate?: (data: any) => void }) {
  const [duration, setDuration] = useState(6);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const DURATIONS = [6, 8, 12];

  const generatePlan = async (selectedDuration: number) => {
    if (!goal) {
      setLoading(false);
      return;
    }
    // Check cache first
    const cacheKey = `${goal}-${selectedDuration}-${JSON.stringify(missingSkills)}`;
    if (data?.learningPlanCache?.[cacheKey]) {
      setPlan(data.learningPlanCache[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getDetailedLearningPath(goal, missingSkills, selectedDuration);
      setPlan(result);
      
      if (onDataUpdate) {
        const newCache = { ...(data?.learningPlanCache || {}) };
        newCache[cacheKey] = result;
        onDataUpdate({ learningPlanCache: newCache });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan(duration);
  }, [duration, goal, JSON.stringify(missingSkills)]);

  return (
    <div className="space-y-10 pb-20">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <button 
             onClick={onBack}
             className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-700 transition-colors"
           >
              <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
              <h2 className="text-3xl font-black text-gray-900 mb-1">Mastery Path</h2>
              <p className="text-gray-500 italic serif text-sm opacity-80">Forging your path to <span className="text-blue-700 font-bold">{goal}</span></p>
           </div>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
           {DURATIONS.map(d => (
             <button 
               key={d}
               onClick={() => setDuration(d)}
               className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${duration === d ? 'bg-blue-700 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
             >
                {d} Months
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-6">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
             className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto"
           >
              <Loader2 className="w-10 h-10 text-blue-700" />
           </motion.div>
           <div>
              <h3 className="text-2xl font-black text-gray-900">Architecting Your Curriculum</h3>
              <p className="text-gray-500 italic serif">Optimizing milestones for {duration} months...</p>
           </div>
        </div>
      ) : plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
           {/* Summary Stats */}
           <div className="space-y-6">
              <section className="bg-gray-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden group">
                 <Brain className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/5" />
                 <div className="relative z-10 space-y-8">
                    <h3 className="text-2xl font-black tracking-tight">Strategy Overview</h3>
                    <div className="space-y-4">
                       <div className="p-4 bg-white/10 rounded-2xl">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Commitment</p>
                          <p className="text-lg font-bold">{plan?.weeklyCommitment || "15-20 Hours/Week"}</p>
                       </div>
                       <div className="p-4 bg-white/10 rounded-2xl">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Milestones</p>
                          <p className="text-lg font-bold">{plan?.phases?.length || 0} Professional Phases</p>
                       </div>
                    </div>
                    <p className="text-sm text-gray-400 italic serif leading-relaxed opacity-80">
                       "{plan?.executiveSummary}"
                    </p>
                 </div>
              </section>

              <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg">
                 <div className="flex items-center gap-3 mb-6">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <h4 className="font-black text-gray-900">Key Outcomes</h4>
                 </div>
                 <div className="space-y-4">
                    {(plan?.outcomes || []).map((o: string, idx: number) => (
                      <div key={idx} className="flex gap-3">
                         <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                         </div>
                         <p className="text-sm text-gray-600 font-medium">{o}</p>
                      </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Timeline Phases */}
           <div className="lg:col-span-2 space-y-6">
              {plan?.phases?.map((phase: any, idx: number) => (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all border-l-8 border-l-blue-700"
                >
                   <div className="p-10">
                      <div className="flex items-start justify-between mb-8">
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                               <span className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                  Phase {idx + 1}
                               </span>
                               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">• {phase.duration}</span>
                            </div>
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight">{phase.title}</h4>
                         </div>
                         <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-700 transition-colors">
                            <Calendar className="w-5 h-5" />
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(phase.topics || []).map((topic: string, tidx: number) => (
                               <div key={tidx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white transition-all">
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  <span className="text-sm font-bold text-gray-700">{topic}</span>
                               </div>
                            ))}
                         </div>
                         
                         <div className="p-5 bg-blue-50/50 rounded-3xl border border-dashed border-blue-100">
                            <p className="text-[10px] text-blue-700 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                               <Target className="w-3 h-3" />
                               Capstone Project
                            </p>
                            <p className="text-sm text-blue-950 font-bold italic serif">"{phase.project}"</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      ) : (
        <div className="py-20 text-center">
           <Zap className="w-12 h-12 text-gray-200 mx-auto mb-4" />
           <p className="text-gray-400 font-medium">Please generate a learning plan to see results</p>
        </div>
      )}
    </div>
  );
}
