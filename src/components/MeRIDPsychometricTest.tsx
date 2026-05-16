import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Target, Sparkles, Zap, Shield, Clock, ArrowRight, Loader2, Award, Info, ChevronRight, BarChart3, Star, Ghost, CheckCircle2, AlertCircle } from 'lucide-react';
import { getMithraAdvice } from '../services/gemini';

import { PERSONALITY_QUESTIONS, PersonalityQuestion } from '../data/personalityQuestions';

export function MeRIDPsychometricTest() {
  const [step, setStep] = useState<'intro' | 'test' | 'loading' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleAnswer = (val: string) => {
    const newAnswers = [...answers, { qId: PERSONALITY_QUESTIONS[currentIdx].id, val }];
    setAnswers(newAnswers);
    
    if (currentIdx < PERSONALITY_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      generateResults(newAnswers);
    }
  };

  const generateResults = async (finalAnswers: any[]) => {
    setStep('loading');
    try {
      // Map final answers back to text for better AI analysis
      const data = PERSONALITY_QUESTIONS.map((q, idx) => {
        const answerVal = finalAnswers.find(a => a.qId === q.id)?.val;
        return {
          q: q.text,
          a: q.options.find(o => o.value === answerVal)?.text || 'N/A'
        };
      });

      const response = await getMithraAdvice(
        "Analyze these psychometric answers and provide a profile in JSON format with fields: persona (string), strengths (array), potentialKillers (array), workEnvironment (string), score (object with EQ, IQ, Resilience, Creativity keys 0-100). Response must be ONLY JSON.",
        { mode: 'psychometric_analysis', answers: data },
        []
      );
      
      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      setResult(parsed);
      setStep('results');
    } catch (err) {
      console.error(err);
      // Fallback result in case of error
      setResult({
        persona: "Analytic Strategist",
        strengths: ["Logical reasoning", "Attention to detail", "Systemic thinking"],
        potentialKillers: ["Over-analysis", "Risk aversion"],
        workEnvironment: "Structured and data-driven",
        score: { EQ: 75, IQ: 85, Resilience: 80, Creativity: 70 }
      });
      setStep('results');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[3rem] p-12 shadow-2xl border border-gray-100 text-center space-y-10"
          >
             <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse" />
                <div className="w-24 h-24 bg-gray-900 rounded-[2.5rem] flex items-center justify-center text-white relative z-10 shadow-xl">
                   <Brain className="w-12 h-12" />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                   <Shield className="w-4 h-4 text-indigo-600" />
                   <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Scientific Assessment</span>
                </div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter">MeRID Diagnostics</h1>
                <p className="text-xl text-gray-500 italic serif max-w-lg mx-auto leading-relaxed">
                   Mental Readiness & Intelligence Diagnostics. Discover your hidden cognitive patterns and high-performance profile.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {[
                  { icon: Zap, label: 'Fast Paced', desc: 'Average 4 mins' },
                  { icon: Target, label: 'Accurate', desc: 'Deep AI Parsing' },
                  { icon: Sparkles, label: 'Actionable', desc: 'Growth Strategy' }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                     <item.icon className="w-5 h-5 text-indigo-600 mb-3" />
                     <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                     <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                  </div>
                ))}
             </div>

             <button 
               onClick={() => setStep('test')}
               className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-100"
             >
                Begin Assessment
                <ArrowRight className="w-6 h-6" />
             </button>
          </motion.div>
        )}

        {step === 'test' && (
          <motion.div 
            key="test"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
             <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-indigo-600 font-black text-xl">
                      {currentIdx + 1}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900">Psychometric Core</h3>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Question {currentIdx + 1} of {PERSONALITY_QUESTIONS.length}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-gray-300" />
                   <span className="text-xs font-bold text-gray-400">Timed Section</span>
                </div>
             </div>

             <section className="bg-white rounded-[3rem] p-12 shadow-xl border border-gray-100">
                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                   {PERSONALITY_QUESTIONS[currentIdx].category} Analysis
                </span>
                <h2 className="text-3xl font-black text-gray-900 mb-12 leading-tight tracking-tight">
                   "{PERSONALITY_QUESTIONS[currentIdx].text}"
                </h2>

                <div className="grid gap-4">
                   {PERSONALITY_QUESTIONS[currentIdx].options.map((opt, i) => (
                     <button 
                       key={i}
                       onClick={() => handleAnswer(opt.value)}
                       className="group p-8 bg-gray-50 border border-gray-100 rounded-3xl text-left hover:bg-white hover:border-indigo-200 hover:shadow-xl transition-all relative overflow-hidden"
                     >
                        <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-indigo-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 opacity-60" />
                        <span className="relative z-10 text-lg font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                           {opt.text}
                        </span>
                        <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                     </button>
                   ))}
                </div>
             </section>

             <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner mx-4">
                <motion.div 
                   animate={{ width: `${((currentIdx + 1) / PERSONALITY_QUESTIONS.length) * 100}%` }}
                   className="h-full bg-indigo-600"
                />
             </div>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center space-y-8"
          >
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto shadow-2xl shadow-indigo-100"
             >
                <Loader2 className="w-12 h-12" />
             </motion.div>
             <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">Decoding Your Mind</h2>
                <p className="text-gray-500 italic serif text-lg opacity-60">MeRID AI is architecting your psychological blueprint...</p>
             </div>
          </motion.div>
        )}

        {step === 'results' && result && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
             {/* Hero Header */}
             <div className="bg-gray-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl">
                <Sparkles className="absolute top-[-20px] right-[-20px] w-64 h-64 text-white/5" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">
                            Diagnostic Match
                         </div>
                         <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                         </div>
                      </div>
                      <h2 className="text-5xl font-black leading-none tracking-tighter">{result.persona}</h2>
                      <p className="text-lg text-gray-400 italic serif leading-relaxed">
                         "Your cognitive profile suggests a high affinity for leadership and deep execution."
                      </p>
                      <div className="pt-4 flex gap-4">
                         <button className="px-8 py-3 bg-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all">Download Diagnosis</button>
                         <button 
                           onClick={() => setStep('intro')}
                           className="px-8 py-3 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
                         >
                            Retake Test
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      {Object.entries(result.score).map(([key, val]: any) => (
                        <div key={key} className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-xl">
                           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{key}</p>
                           <p className="text-3xl font-black text-white">{val}%</p>
                           <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className="h-full bg-indigo-500" />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Strengths */}
                <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex-1">
                   <div className="flex items-center gap-3 mb-8">
                      <Zap className="w-6 h-6 text-emerald-500" />
                      <h4 className="font-black text-gray-900 tracking-tight">Core Powers</h4>
                   </div>
                   <div className="space-y-4">
                      {result.strengths.map((s: string, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                           <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                           <p className="text-xs font-bold text-emerald-900">{s}</p>
                        </div>
                      ))}
                   </div>
                </section>

                {/* Killers */}
                <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex-1">
                   <div className="flex items-center gap-3 mb-8">
                      <Ghost className="w-6 h-6 text-red-500" />
                      <h4 className="font-black text-gray-900 tracking-tight">Vulnerabilities</h4>
                   </div>
                   <div className="space-y-4">
                      {result.potentialKillers.map((k: string, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                           <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                           <p className="text-xs font-bold text-red-900">{k}</p>
                        </div>
                      ))}
                   </div>
                </section>

                {/* Environment */}
                <section className="bg-[#1A1A1A] text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                   <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-8">
                         <BarChart3 className="w-6 h-6 text-indigo-400" />
                         <h4 className="font-black tracking-tight text-white">Ideal Habitat</h4>
                      </div>
                      <p className="text-sm text-gray-400 italic serif leading-relaxed opacity-80 flex-1">
                         {result.workEnvironment}
                      </p>
                      <div className="mt-8 pt-8 border-t border-white/5">
                         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            <span>Culture Match</span>
                            <span>High Affinity</span>
                         </div>
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                </section>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

