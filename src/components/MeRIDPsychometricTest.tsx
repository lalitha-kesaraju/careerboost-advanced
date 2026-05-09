import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Target, Sparkles, Zap, Shield, Clock, ArrowRight, Loader2, Award, Info, ChevronRight, BarChart3, Star, Ghost } from 'lucide-react';
import { getMithraAdvice } from '../services/gemini';

const QUESTIONS = [
  {
    id: 1,
    category: 'Innovation',
    text: 'When faced with a "tried and true" method that is slightly inefficient, my first instinct is to:',
    options: [
      { text: 'Follow the protocol to ensure 100% reliability', value: 'resilience' },
      { text: 'Look for immediate shortcuts to save time', value: 'execution' },
      { text: 'Brainstorm an entirely new system, even if it carries risk', value: 'creativity' }
    ]
  },
  {
    id: 2,
    category: 'Resilience',
    text: 'After a major project failure, I find that I am back to my full productivity levels after:',
    options: [
      { text: 'A few hours (I move on instantly)', value: 'high_resilience' },
      { text: 'A day or two (I need to process the data)', value: 'mid_resilience' },
      { text: 'A week (I analyze the failure deeply)', value: 'analytical' }
    ]
  },
  {
    id: 3,
    category: 'Logic',
    text: 'A manager gives you conflicting instructions. The most logical first step is:',
    options: [
      { text: 'Follow the most recent instruction', value: 'direct' },
      { text: 'Pause both and seek a synchronization meeting', value: 'strategic' },
      { text: 'Execute the one that provides the most business value', value: 'autonomous' }
    ]
  },
  {
    id: 4,
    category: 'Leadership',
    text: 'In a group project where no one is taking charge, I typically:',
    options: [
      { text: 'Wait for someone else to step up to avoid overstepping', value: 'team_player' },
      { text: 'Directly assign tasks to keep things moving', value: 'assertive' },
      { text: 'Ask questions that naturally lead the group to consensus', value: 'influencer' }
    ]
  },
  {
    id: 5,
    category: 'Adaptability',
    text: 'If my role changed completely tomorrow due to AI automation, I would:',
    options: [
      { text: 'Feel anxious about my long-term job security', value: 'stable' },
      { text: 'Immediately start learning the tools that replaced me', value: 'agile' },
      { text: 'See it as an opportunity to pivot into a new creative field', value: 'visionary' }
    ]
  },
  {
    id: 6,
    category: 'Stress Management',
    text: 'Under a tight 24-hour deadline, my performance usually:',
    options: [
      { text: 'Peaks as the pressure clarifies my focus', value: 'high_stress_performer' },
      { text: 'Remains steady but I might make minor errors', value: 'consistent' },
      { text: 'Declines as I worry about the quality of the output', value: 'quality_focused' }
    ]
  },
  {
    id: 7,
    category: 'Collaboration',
    text: 'When a teammate takes credit for my work during a meeting, I:',
    options: [
      { text: 'Let it go to maintain harmony in the group', value: 'harmonizer' },
      { text: 'Politely clarify my contribution during the discussion', value: 'direct' },
      { text: 'Speak to them privately afterward about boundaries', value: 'diplomatic' }
    ]
  },
  {
    id: 8,
    category: 'Growth Mindset',
    text: 'I prefer to receive feedback that is:',
    options: [
      { text: 'Validating and supportive of my progress', value: 'encouragement_seeker' },
      { text: 'Blunt and highlights my specific technical flaws', value: 'optimization_seeker' },
      { text: 'Focused on my potential for leadership', value: 'ambition_seeker' }
    ]
  },
  {
    id: 9,
    category: 'Decision Making',
    text: 'When making a high-stakes decision with 70% of the data available, I:',
    options: [
      { text: 'Trust my intuition and move forward immediately', value: 'intuitive' },
      { text: 'Wait for the remaining 30% even if it delays the project', value: 'precisionist' },
      { text: 'Build a fallback plan and execute with the 70%', value: 'risk_manager' }
    ]
  },
  {
    id: 11,
    category: 'Risk Tolerance',
    text: 'When investing time into a project with high payoff but only a 20% success rate, I feel:',
    options: [
      { text: 'Excited by the challenge of beating the odds', value: 'high_risk_seeker' },
      { text: 'Calculated; I check if I can afford the failure', value: 'rational_risk' },
      { text: 'Dread; I prefer guaranteed smaller wins', value: 'risk_averse' }
    ]
  },
  {
    id: 12,
    category: 'Team Dynamics',
    text: 'My ideal team is one where everyone:',
    options: [
      { text: 'Follows a strict hierarchy with clear roles', value: 'structuralist' },
      { text: 'Operates as individual experts with loose synergy', value: 'specialist_team' },
      { text: 'Brainstorms everything together in a flat structure', value: 'collaborative_flat' }
    ]
  },
  {
    id: 13,
    category: 'Information Processing',
    text: 'When reading a complex 50-page document, I tend to:',
    options: [
      { text: 'Read every word to ensure I miss zero details', value: 'meticulous' },
      { text: 'Scan for headings and bolded data points first', value: 'scanner' },
      { text: 'Jump to the conclusion to see the "bottom line" first', value: 'result_oriented' }
    ]
  },
  {
    id: 14,
    category: 'Persistence',
    text: 'When a technical bug takes more than 4 hours to solve, my mood:',
    options: [
      { text: 'Improves; I become obsessed with the "hunt"', value: 'dogged' },
      { text: 'Stays neutral; it is just part of the job', value: 'resilient' },
      { text: 'Worsens; I feel like my time is being wasted', value: 'efficiency_obsessed' }
    ]
  },
  {
    id: 15,
    category: 'Integrity',
    text: 'If I notice a small error in my performance that no one else saw, I usually:',
    options: [
      { text: 'Fix it silently and move on', value: 'self_correcting' },
      { text: 'Flag it to the team to ensure absolute transparency', value: 'high_integrity' },
      { text: 'Ignore it if it doesn\'t affect the final outcome', value: 'utilitarian' }
    ]
  },
  {
    id: 16,
    category: 'Work Ethic',
    text: 'For me, a "successful" day is one where I:',
    options: [
      { text: 'Cleared every single item on my to-do list', value: 'task_master' },
      { text: 'Had one breakthrough idea that changes the roadmap', value: 'visionary' },
      { text: 'Helped others on my team overcome their blocks', value: 'servant_leader' }
    ]
  },
  {
    id: 17,
    category: 'Consciousness',
    text: 'My workspace is usually:',
    options: [
      { text: 'Perfectly organized and minimalist', value: 'disciplined' },
      { text: 'A "creative mess" that I understand perfectly', value: 'creative' },
      { text: 'Constantly changing depending on the project', value: 'adaptive' }
    ]
  },
  {
    id: 18,
    category: 'Conflict Resolution',
    text: 'When someone strongly disagrees with my logic, my first response is to:',
    options: [
      { text: 'Argue my point until they see the logic', value: 'debater' },
      { text: 'Listen silently and look for where their logic is correct', value: 'empathetic_analytical' },
      { text: 'Propose a third alternative that combines both views', value: 'synthesizer' }
    ]
  },
  {
    id: 19,
    category: 'Future Focus',
    text: 'I think about the state of my career 5 years from now:',
    options: [
      { text: 'Daily; I have a specific roadmap I am following', value: 'planner' },
      { text: 'Occasionally; I focus more on the current quarter', value: 'pragmatist' },
      { text: 'Rarely; I believe in seizing opportunities as they come', value: 'opportunist' }
    ]
  },
  {
    id: 20,
    category: 'Authority',
    text: 'I respect a leader primarily because of their:',
    options: [
      { text: 'Title and established position of power', value: 'traditionalist' },
      { text: 'Extreme technical competence and skill', value: 'meritocrat' },
      { text: 'Ability to inspire and connect with the team', value: 'charismatic' }
    ]
  }
];

export function MeRIDPsychometricTest() {
  const [step, setStep] = useState<'intro' | 'test' | 'loading' | 'results'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleAnswer = (val: string) => {
    const newAnswers = [...answers, { qId: QUESTIONS[currentIdx].id, val }];
    setAnswers(newAnswers);
    
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      generateResults(newAnswers);
    }
  };

  const generateResults = async (finalAnswers: any[]) => {
    setStep('loading');
    try {
      const response = await getMithraAdvice(
        "Analyze these psychometric answers and provide a profile in JSON format with fields: persona (string), strengths (array), potentialKillers (array), workEnvironment (string), score (object with EQ, IQ, Resilience, Creativity keys 0-100).",
        { mode: 'psychometric_analysis', answers: finalAnswers },
        []
      );
      
      const parsed = JSON.parse(response.replace(/```json|```/g, ''));
      setResult(parsed);
      setStep('results');
    } catch (err) {
      console.error(err);
      setStep('intro');
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
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Question {currentIdx + 1} of {QUESTIONS.length}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-gray-300" />
                   <span className="text-xs font-bold text-gray-400">Timed Section</span>
                </div>
             </div>

             <section className="bg-white rounded-[3rem] p-12 shadow-xl border border-gray-100">
                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                   {QUESTIONS[currentIdx].category} Analysis
                </span>
                <h2 className="text-3xl font-black text-gray-900 mb-12 leading-tight tracking-tight">
                   "{QUESTIONS[currentIdx].text}"
                </h2>

                <div className="grid gap-4">
                   {QUESTIONS[currentIdx].options.map((opt, i) => (
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
                   animate={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
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

function CheckCircle2(props: any) {
  return (
    <svg 
      {...props}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AlertCircle(props: any) {
  return (
    <svg 
      {...props}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
