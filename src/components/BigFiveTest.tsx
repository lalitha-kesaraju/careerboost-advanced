import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Target, 
  Award,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Shield,
  Camera,
  Fullscreen,
  X,
  Lock,
  Eye,
  Info
} from 'lucide-react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { doc, updateDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../services/firestoreService';
import { recordActivity } from '../services/statsService';

interface Question {
  id: number;
  text: string;
  trait: 'Openness' | 'Conscientiousness' | 'Extraversion' | 'Agreeableness' | 'Neuroticism';
  reverse?: boolean;
}

const QUESTIONS: Question[] = [
  // Openness (Student focused)
  { id: 1, text: "I enjoy exploring complex theoretical concepts during lectures.", trait: 'Openness' },
  { id: 2, text: "I often find myself thinking about new ways to solve academic problems.", trait: 'Openness' },
  { id: 3, text: "I am quick to grasp abstract ideas even if they aren't in my syllabus.", trait: 'Openness' },
  { id: 4, text: "I enjoy participating in cultural events and artistic activities on campus.", trait: 'Openness' },
  { id: 5, text: "I prefer sticking to standard study methods rather than trying new ones.", trait: 'Openness', reverse: true },
  
  // Conscientiousness (Academia focused)
  { id: 6, text: "I am always prepared for my exams and assignments well in advance.", trait: 'Conscientiousness' },
  { id: 7, text: "I strictly follow a daily study schedule.", trait: 'Conscientiousness' },
  { id: 8, text: "I pay close attention to every detail in my project reports.", trait: 'Conscientiousness' },
  { id: 9, text: "I complete my home assignments as soon as they are assigned.", trait: 'Conscientiousness' },
  { id: 10, text: "I often leave my notes and workstation in a mess.", trait: 'Conscientiousness', reverse: true },

  // Extraversion (Campus life focused)
  { id: 11, text: "I am often the first one to speak up in group discussions.", trait: 'Extraversion' },
  { id: 12, text: "I feel very comfortable presenting in front of a full classroom.", trait: 'Extraversion' },
  { id: 13, text: "I enjoy taking leadership roles in student clubs and organizations.", trait: 'Extraversion' },
  { id: 14, text: "I enjoy socializing with different groups of students during breaks.", trait: 'Extraversion' },
  { id: 15, text: "I don't mind being the representative for my batch.", trait: 'Extraversion' },

  // Agreeableness (Collaboration focused)
  { id: 16, text: "I am always willing to help my classmates with their doubts.", trait: 'Agreeableness' },
  { id: 17, text: "I sympathize with peers who are struggling with their grades.", trait: 'Agreeableness' },
  { id: 18, text: "I prioritize maintaining harmony in my project groups.", trait: 'Agreeableness' },
  { id: 19, text: "I often take time to explain concepts to my friends.", trait: 'Agreeableness' },
  { id: 20, text: "I am more focused on my own grades than helping others.", trait: 'Agreeableness', reverse: true },

  // Neuroticism (Stress focused)
  { id: 21, text: "I get extremely stressed out during the final exam week.", trait: 'Neuroticism' },
  { id: 22, text: "I frequently worry about my future career prospects.", trait: 'Neuroticism' },
  { id: 23, text: "My mood fluctuates significantly based on my academic performance.", trait: 'Neuroticism' },
  { id: 24, text: "I feel overwhelmed when I have multiple deadlines in one week.", trait: 'Neuroticism' },
  { id: 25, text: "I get upset easily when I receive negative feedback on my work.", trait: 'Neuroticism' }
];

const OPTIONS = [
  { label: 'Strongly Disagree', value: 1, color: 'bg-rose-50 border-rose-100 text-rose-600' },
  { label: 'Disagree', value: 2, color: 'bg-orange-50 border-orange-100 text-orange-600' },
  { label: 'Neutral', value: 3, color: 'bg-gray-50 border-gray-100 text-gray-600' },
  { label: 'Agree', value: 4, color: 'bg-blue-50 border-blue-100 text-blue-600' },
  { label: 'Strongly Agree', value: 5, color: 'bg-emerald-50 border-emerald-100 text-emerald-600' }
];

export function BigFiveTest({ onComplete, onClose }: { onComplete?: (results: any) => void; onClose?: () => void }) {
  const { user } = useAuth();
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [violations, setViolations] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [lastViolationTime, setLastViolationTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const totalQuestions = QUESTIONS.length;
  const progress = (Object.keys(answers).length / totalQuestions) * 100;

  useEffect(() => {
    if (isStarted && !showResults && !isDisqualified) {
      const handleSecurityBreach = () => {
        const now = Date.now();
        if (now - lastViolationTime < 2000) return; // Prevent double triggers
        
        setLastViolationTime(now);
        setViolations(prev => {
          const next = prev + 1;
          if (next >= 3) {
            setIsDisqualified(true);
            exitFullscreen();
          }
          return next;
        });
      };

      window.addEventListener('blur', handleSecurityBreach);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) handleSecurityBreach();
      });
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) handleSecurityBreach();
      });

      return () => {
        window.removeEventListener('blur', handleSecurityBreach);
        document.removeEventListener('visibilitychange', handleSecurityBreach);
        document.removeEventListener('fullscreenchange', handleSecurityBreach);
      };
    }
  }, [isStarted, showResults, isDisqualified, lastViolationTime]);

  useEffect(() => {
    if (isStarted && !showResults && !isDisqualified) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isStarted, showResults, isDisqualified]);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleStart = async () => {
    await enterFullscreen();
    setIsStarted(true);
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleAnswer = (questionId: number, value: number) => {
    if (isSubmitting || answers[questionId]) return;
    
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentStep < totalQuestions - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 400);
    }
  };

  const calculateResults = async () => {
    setIsSubmitting(true);
    
    const scores: Record<string, number> = {
      Openness: 0,
      Conscientiousness: 0,
      Extraversion: 0,
      Agreeableness: 0,
      Neuroticism: 0
    };

    const counts: Record<string, number> = {
        Openness: 0,
        Conscientiousness: 0,
        Extraversion: 0,
        Agreeableness: 0,
        Neuroticism: 0
    };

    QUESTIONS.forEach(q => {
      let score = answers[q.id];
      if (q.reverse) {
        score = 6 - score;
      }
      scores[q.trait] += score;
      counts[q.trait]++;
    });

    const normalized: Record<string, number> = {};
    Object.keys(scores).forEach(trait => {
      normalized[trait] = Math.round((scores[trait] / (counts[trait] * 5)) * 100);
    });

    try {
      if (user) {
        const analysisRef = doc(collection(db, 'users', user.uid, 'personalityAnalyses'));
        const analysisData = {
          traits: normalized,
          rawAnswers: answers,
          createdAt: serverTimestamp(),
          model: 'Ocean-v1',
          violations: violations
        };
        await setDoc(analysisRef, analysisData);

        await updateDoc(doc(db, 'users', user.uid), {
          personalityTraits: normalized,
          lastAnalysisDate: serverTimestamp()
        });

        recordActivity(user.uid, 'code', 'Personality Calibrated', `Psychometric profile generated. Integrity level: ${3 - violations}/3`);
      }

      setResults(normalized);
      setShowResults(true);
      exitFullscreen();
      if (onComplete) onComplete(normalized);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'personalityAnalyses');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDisqualified) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#f8fafc] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[4rem] border border-rose-100 shadow-2xl shadow-rose-200/50 space-y-10">
           <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-600 mx-auto border border-rose-100 shadow-inner">
              <Shield className="w-12 h-12" />
           </div>
           <div className="space-y-4">
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Assessment Invalidated</h2>
              <p className="text-gray-500 font-medium italic serif leading-relaxed">
                Your session has been terminated due to 3 security violations (window blur or exit from full-screen). Student integrity is paramount.
              </p>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
           >
             Return to Batch Portal
           </button>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
           <div className="lg:col-span-3 space-y-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full"
              >
                 <Shield className="w-4 h-4 text-blue-700" />
                 <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Secure University Protocol</span>
              </motion.div>
              
              <div className="space-y-6">
                 <h1 className="text-7xl font-black text-gray-900 tracking-tighter leading-[0.85]">
                    Behavioral <br/>
                    <span className="text-blue-700">Calibration</span>
                 </h1>
                 <p className="text-gray-500 text-xl font-medium italic serif leading-relaxed max-w-lg">
                    A university-grade psychological assessment designed to map your natural cognitive biases and collaborative potential for Tier-1 placement rounds.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { icon: Camera, title: 'AI Proctoring', desc: 'Active environment monitoring via Mithra Lens.', color: 'text-blue-700', bg: 'bg-blue-50' },
                   { icon: Fullscreen, title: 'Mastery Mode', desc: 'Full-screen isolation required for validation.', color: 'text-blue-700', bg: 'bg-blue-50' },
                   { icon: Lock, title: 'Anti-Bypass', desc: 'Disqualification on 3rd security breach.', color: 'text-rose-600', bg: 'bg-rose-50' },
                   { icon: Target, title: 'Trait Mapping', desc: 'Evaluates Openness, Grit, and Adaptability.', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                 ].map((feat, i) => (
                   <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex gap-4 items-start"
                   >
                      <div className={`w-12 h-12 flex-shrink-0 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center`}>
                         <feat.icon className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="text-gray-900 font-black text-xs uppercase tracking-wider">{feat.title}</h4>
                         <p className="text-gray-400 text-[10px] font-bold leading-tight mt-1">{feat.desc}</p>
                      </div>
                   </motion.div>
                 ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                 <button 
                  onClick={handleStart}
                  className="w-full sm:w-auto px-12 py-6 bg-blue-700 hover:bg-blue-800 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-3 group"
                 >
                    Initialize Test <Zap className="w-5 h-5 group-hover:animate-pulse" />
                 </button>
                 <button 
                    onClick={() => onClose ? onClose() : window.location.reload()}
                    className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-900 transition-colors"
                 >
                    Exit to Dashboard
                 </button>
              </div>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 shadow-2xl shadow-blue-100/50 rounded-[4rem] p-10 space-y-8">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Trait Breakdown</span>
                    <BarChart3 className="w-4 h-4 text-gray-300" />
                 </div>
                 <div className="space-y-6">
                    {[
                      { label: 'Openness', desc: 'Intellectual curiosity & innovation', val: 85 },
                      { label: 'Conscientiousness', desc: 'Discipline & study organization', val: 92 },
                      { label: 'Extraversion', desc: 'Batch leadership & networking', val: 74 },
                      { label: 'Agreeableness', desc: 'Peer collaboration & empathy', val: 88 },
                      { label: 'Neuroticism', desc: 'Stress resilience & focus', val: 15 }
                    ].map((trait, i) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-gray-900 uppercase">{trait.label}</span>
                            <span className="text-[9px] font-bold text-gray-400 italic">{trait.desc}</span>
                         </div>
                         <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${trait.val}%` }}
                              transition={{ delay: 0.5 + (i * 0.1) }}
                              className="h-full bg-blue-700 opacity-20"
                            />
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 italic serif leading-relaxed text-center">
                       "Character is not just who you are, but how you react to academic pressure."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F8FAFC] p-6 md:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-12 pb-20"
        >
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200">
                   <Award className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-gray-900 tracking-tight">Psychometric Profile </h2>
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Calibration Complete</p>
                </div>
             </div>
             <button 
               onClick={onClose || (() => window.location.reload())}
               className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"
             >
                Return to Portal
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
             {Object.entries(results).map(([trait, score], i) => (
               <motion.div 
                 key={trait}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/20 text-center space-y-4"
               >
                  <div className="relative w-24 h-24 mx-auto">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="44" fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
                        <motion.circle 
                          cx="48" cy="48" r="44" fill="transparent" stroke="#0891b2" strokeWidth="8"
                          strokeDasharray={276}
                          initial={{ strokeDashoffset: 276 }}
                          animate={{ strokeDashoffset: 276 - (0.01 * (score as number) * 276) }}
                          strokeLinecap="round"
                        />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-gray-900">
                        {Math.round(score as number)}%
                     </div>
                  </div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{trait}</h4>
               </motion.div>
             ))}
          </div>

          <div className="bg-gray-900 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-20 -mt-20" />
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                   <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mithra AI Logic Engine</span>
                   </div>
                   <h3 className="text-5xl font-black tracking-tight leading-[0.95]">
                      Behavioral <br/> 
                      <span className="text-blue-500">Synthesis</span>
                   </h3>
                   <p className="text-gray-400 text-lg font-medium leading-relaxed italic serif">
                      "Your high score in {Object.entries(results).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]} indicates unique capacity for system innovation. Strategic alignment successful."
                   </p>
                </div>
                <div className="p-10 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                         <Target className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-widest">Career Integration</h4>
                   </div>
                   <p className="text-gray-400 leading-relaxed font-bold italic serif">
                      Psychometric mapping completed. Your behavioral traits are now used to contextualize AI feedback and interview simulations.
                   </p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col overflow-hidden">
       {/* Proctoring Bar */}
       <div className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center shadow-sm relative z-20">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full animate-pulse ${violations > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Assessment Environment Secure</span>
             </div>
             <div className="h-6 w-px bg-gray-100" />
             <div className="flex items-center gap-3">
                <Shield className={`w-5 h-5 ${violations > 1 ? 'text-rose-500' : violations > 0 ? 'text-orange-500' : 'text-blue-700'}`} />
                <span className={`text-[11px] font-black uppercase tracking-widest ${violations > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                   Integrity Violations: {violations}/3
                </span>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Session Progress</p>
                <div className="w-56 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                   <motion.div 
                     className="h-full bg-blue-700 shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                   />
                </div>
             </div>
             <button 
               onClick={async () => {
                 exitFullscreen();
                 onClose ? onClose() : window.location.reload();
               }}
               className="w-12 h-12 bg-white hover:bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 transition-all border border-gray-100 shadow-sm"
             >
                <X className="w-6 h-6" />
             </button>
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
          {/* Main Question Area */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-12 bg-slate-50/30">
             <div className="max-w-3xl w-full">
                {currentQuestion ? (
                   <AnimatePresence mode="wait">
                      <motion.div 
                        key={currentStep}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="space-y-16"
                      >
                         <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-blue-100 rounded-full shadow-sm">
                               <Info className="w-4 h-4 text-blue-700" />
                               <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">{currentQuestion.trait} Dimension Assessment</span>
                            </div>
                            <div className="min-h-[160px] flex items-center bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[80px] -mr-16 -mt-16" />
                               <h3 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight serif italic relative z-10">
                                  "{currentQuestion.text}"
                                </h3>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {OPTIONS.map((opt) => (
                              <button 
                                key={opt.value}
                                onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                                className={`group flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 transition-all text-center space-y-4 ${
                                  answers[currentQuestion.id] === opt.value 
                                  ? 'border-blue-700 bg-white ring-4 ring-blue-50 shadow-xl -translate-y-2' 
                                  : 'border-white bg-white hover:border-gray-100 hover:shadow-lg shadow-sm'
                                } ${answers[currentQuestion.id] ? 'pointer-events-none' : ''}`}
                              >
                                 <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg border-2 transition-all ${
                                   answers[currentQuestion.id] === opt.value 
                                   ? 'bg-blue-700 border-blue-700 text-white' 
                                   : 'bg-gray-50 border-gray-100 text-gray-400 group-hover:border-blue-200 group-hover:text-blue-700'
                                 }`}>
                                    {opt.value}
                                 </div>
                                 <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${answers[currentQuestion.id] === opt.value ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    {opt.label}
                                 </span>
                                 {answers[currentQuestion.id] === opt.value && (
                                   <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                   </div>
                                 )}
                              </button>
                            ))}
                         </div>

                         <div className="flex justify-between items-center pt-10">
                            <button 
                              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                              disabled={currentStep === 0}
                              className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-900 hover:border-gray-200 disabled:opacity-20 transition-all flex items-center gap-3 shadow-sm"
                            >
                               <ChevronLeft className="w-5 h-5" /> Previous Statement
                            </button>

                            {currentStep === totalQuestions - 1 && answers[currentQuestion.id] ? (
                               <button 
                                 onClick={calculateResults}
                                 disabled={isSubmitting}
                                 className="px-12 py-6 bg-gray-900 hover:bg-black text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3 active:scale-95 transition-all"
                               >
                                  {isSubmitting ? 'Syncing Profile...' : 'Submit Academic Profile'}
                               </button>
                            ) : (
                               <button 
                                 onClick={() => setCurrentStep(prev => Math.min(totalQuestions - 1, prev + 1))}
                                 disabled={!answers[currentQuestion.id]}
                                 className="px-10 py-6 bg-blue-700 hover:bg-blue-800 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all flex items-center gap-3 shadow-xl shadow-blue-100"
                               >
                                  Next Statement <ChevronRight className="w-5 h-5" />
                               </button>
                            )}
                         </div>
                      </motion.div>
                   </AnimatePresence>
                ) : (
                  <div className="bg-white p-20 rounded-[4rem] text-center space-y-8 border border-gray-100 shadow-xl">
                     <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-600 mx-auto border border-rose-100">
                        <AlertCircle className="w-12 h-12" />
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-3xl font-black text-gray-900">System Sync Error</h3>
                        <p className="text-gray-500 italic serif max-w-sm mx-auto">The behavioral assessment engine encountered a sequence error. Please re-initialize.</p>
                     </div>
                     <button onClick={() => setCurrentStep(0)} className="px-10 py-5 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all">Restart Batch Session</button>
                  </div>
                )}
             </div>
          </div>

          {/* Sidebar / Monitor Feed */}
          <div className="w-[420px] bg-white border-l border-gray-100 p-10 space-y-12 hidden 2xl:block overflow-y-auto">
             <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                   <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Live Proctoring Feedback</h4>
                   <span className="text-[9px] font-black text-emerald-500 uppercase">System Active</span>
                </div>
                <div className="aspect-video bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 relative group shadow-inner">
                   <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale-[0.5]"
                   />
                   <div className="absolute inset-0 border-[12px] border-blue-600/5 pointer-events-none" />
                   <div className="absolute top-6 left-6 flex items-center gap-3 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-gray-100">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Batch_ID: {user?.uid.slice(0, 8)}</span>
                   </div>
                   {!stream && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-gray-50">
                        <Camera className="w-12 h-12 text-rose-500/20" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-tight">Environment Calibration <br/> Required</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                   <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Dimension Track</h4>
                   <span className="text-[10px] font-black text-gray-900">{currentStep + 1} / {totalQuestions}</span>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                   {QUESTIONS.map((q, idx) => (
                     <div key={idx} className={`flex items-start gap-5 p-5 rounded-[2rem] border transition-all ${idx === currentStep ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-gray-50/50 border-transparent opacity-60'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[12px] shadow-sm ${idx === currentStep ? 'bg-blue-700 text-white' : 'bg-white text-gray-400'}`}>
                           {idx + 1}
                        </div>
                        <div className="flex-1">
                           <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${idx === currentStep ? 'text-blue-900' : 'text-gray-400'}`}>
                              {idx < currentStep ? 'Completed' : idx === currentStep ? 'Calibrating...' : 'Pending'}
                           </p>
                           {idx === currentStep && <p className="text-[11px] font-bold text-blue-700/80 italic serif">{q.trait} Matrix</p>}
                        </div>
                        {answers[q.id] && <CheckCircle2 className="w-5 h-5 text-blue-700" />}
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl -mr-8 -mt-8" />
                <div className="flex items-center gap-3 relative z-10">
                   <Lock className="w-4 h-4 text-blue-500" />
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Security Invariant</h5>
                </div>
                <p className="text-[11px] font-medium leading-relaxed italic serif text-gray-300 relative z-10">
                   "Please maintain focus. Our algorithms track page engagement to ensure calibrated results."
                </p>
             </div>
          </div>
       </div>

       {/* Security Warning Overlay */}
       <AnimatePresence>
          {violations > 0 && violations < 3 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[150] bg-rose-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-rose-500"
            >
               <AlertCircle className="w-6 h-6 animate-pulse" />
               <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest">Integrity Warning ({violations}/3)</p>
                  <p className="text-[10px] font-medium opacity-90">Please do not switch tabs or exit full-screen mode.</p>
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}


