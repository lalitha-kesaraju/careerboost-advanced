import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  Trophy, 
  ChevronRight, 
  ArrowLeft, 
  Timer, 
  Zap, 
  Brain, 
  Target, 
  HelpCircle, 
  Send, 
  X, 
  Loader2,
  Sparkles,
  BarChart3,
  Award,
  Book,
  PenTool,
  Calculator,
  Compass,
  LayoutGrid,
  FileText
} from 'lucide-react';
import Markdown from 'react-markdown';
import { getMithraAdvice } from '../services/gemini';
import { generateAptitudeQuestions, AptitudeQuestion } from '../services/questionService';

// Topic Configuration
const APTITUDE_TOPICS = [
  { 
    id: 'arithmetic', 
    title: 'Quantitative: Arithmetic', 
    emoji: '📈', 
    icon: <Calculator className="w-6 h-6" />,
    description: 'Percentages, Ratios, Profit & Loss, Averages',
    examplesCount: 5,
    practiceCount: 20
  },
  { 
    id: 'numbers', 
    title: 'Numbers & Algebra', 
    emoji: '🔢', 
    icon: <Target className="w-6 h-6" />,
    description: 'HCF/LCM, Equations, Progressions, Number Series',
    examplesCount: 4,
    practiceCount: 15
  },
  { 
    id: 'di', 
    title: 'Data Interpretation', 
    emoji: '📊', 
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Pie Charts, Bar Graphs, Tables, Line Charts',
    examplesCount: 3,
    practiceCount: 12
  },
  { 
    id: 'logical-analytical', 
    title: 'Logical: Analytical', 
    emoji: '🧠', 
    icon: <Brain className="w-6 h-6" />,
    description: 'Coding-Decoding, Blood Relations, Directions',
    examplesCount: 6,
    practiceCount: 18
  },
  { 
    id: 'logical-visual', 
    title: 'Logical: Non-Verbal', 
    emoji: '🧩', 
    icon: <Compass className="w-6 h-6" />,
    description: 'Pattern Completion, Mirror Images, Matrices',
    examplesCount: 4,
    practiceCount: 10
  },
  { 
    id: 'verbal-linguistic', 
    title: 'Verbal: Linguistic', 
    emoji: '🗣️', 
    icon: <PenTool className="w-6 h-6" />,
    description: 'Sentence Correction, Grammar, Vocabulary',
    examplesCount: 5,
    practiceCount: 25
  },
  { 
    id: 'verbal-reading', 
    title: 'Verbal: Reading', 
    emoji: '📖', 
    icon: <Book className="w-6 h-6" />,
    description: 'Comprehension, Critical Reasoning, Summaries',
    examplesCount: 3,
    practiceCount: 10
  }
];

interface TopicProgress {
  unlockedPhases: number; // 0: Learn, 1: Apply, 2: Practice, 3: Exam
  completedPhases: number[];
}

import { APTITUDE_PHASE_CONTENT } from '../data/aptitudeTheory';

export function AptitudeMasterySection() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgress>>({});
  
  // Content State
  const [theoryContent, setTheoryContent] = useState<any>(null);
  const [workedExamples, setWorkedExamples] = useState<any[]>([]);
  const [practiceQuestions, setPracticeQuestions] = useState<AptitudeQuestion[]>([]);
  const [examQuestions, setExamQuestions] = useState<AptitudeQuestion[]>([]);
  
  // Phase 2 State
  const [currentExampleIdx, setCurrentExampleIdx] = useState(0);
  const [showStep, setShowStep] = useState(0);

  // Phase 3 State
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceStatus, setPracticeStatus] = useState<Record<string, 'correct' | 'wrong' | null>>({});

  // Phase 4 State
  const [examState, setExamState] = useState<'idle' | 'running' | 'finished' | 'disqualified'>('idle');
  const [examTime, setExamTime] = useState(600); // 10 mins
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [currentExamIdx, setCurrentExamIdx] = useState(0);
  const [violations, setViolations] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // DoubtBox State
  const [showDoubtBox, setShowDoubtBox] = useState(false);
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [doubts, setDoubts] = useState<{q: string, a: string}[]>([]);

  const currentTopic = APTITUDE_TOPICS.find(t => t.id === selectedTopic);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('aptitude_progress');
    if (saved) setTopicProgress(JSON.parse(saved));
  }, []);

  const saveProgress = (topicId: string, phaseIdx: number) => {
    const updated = { ...topicProgress };
    if (!updated[topicId]) {
      updated[topicId] = { unlockedPhases: 1, completedPhases: [phaseIdx] };
    } else {
      if (!updated[topicId].completedPhases.includes(phaseIdx)) {
        updated[topicId].completedPhases.push(phaseIdx);
      }
      updated[topicId].unlockedPhases = Math.max(updated[topicId].unlockedPhases, phaseIdx + 1);
    }
    setTopicProgress(updated);
    localStorage.setItem('aptitude_progress', JSON.stringify(updated));
  };

  const loadTopicData = async (topicId: string) => {
    setLoading(true);
    try {
      const local = APTITUDE_PHASE_CONTENT[topicId];
      if (local) {
        setTheoryContent(local.learn);
        setWorkedExamples(local.apply || []);
      } else {
        // AI Fallback for topics not yet hardcoded
        setTheoryContent({
          title: topicId,
          content: `# Understanding ${topicId}\nAI is generating this module based on standard placement patterns...\n\n### Advanced Logic\nFocus on the relationship between variables and time constraints.`,
          tips: ["Speed is key", "Read carefully", "Eliminate options"]
        });
        setWorkedExamples([
          {
            title: "Introductory Pattern",
            problem: "Identify the logical sequence in this topic's fundamental challenge.",
            steps: [
              { label: "Analyze", content: "Break down the components." },
              { label: "Execute", content: "Apply the formula." }
            ]
          }
        ]);
      }

      // Dynamic Questions for Practice and Exam
      const qs = await generateAptitudeQuestions(15, 'medium');
      setPracticeQuestions(qs.slice(0, 5));
      setExamQuestions(qs.slice(5, 15));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setActivePhase(0);
    loadTopicData(topicId);
  };

  const handleAskDoubt = async () => {
    if (!doubtInput.trim()) return;
    const q = doubtInput;
    setDoubtInput('');
    setDoubtLoading(true);
    try {
      const insight = await getMithraAdvice(q, { topic: currentTopic?.title, phase: activePhase }, []);
      setDoubts(prev => [...prev, { q, a: insight }]);
    } catch (e) {
      setDoubts(prev => [...prev, { q, a: "I'm having trouble analyzing that right now. Please try again." }]);
    } finally {
      setDoubtLoading(false);
    }
  };

  const handlePracticeAnswer = (qId: string, optIdx: number, correctIdx: number) => {
    setPracticeAnswers(p => ({ ...p, [qId]: optIdx }));
    setPracticeStatus(p => ({ ...p, [qId]: optIdx === correctIdx ? 'correct' : 'wrong' }));
  };

  // Security Logic
  useEffect(() => {
    if (examState === 'running') {
      const handleSecurityBreach = () => {
        setViolations(v => {
          const next = v + 1;
          if (next >= 3) {
            setExamState('disqualified');
            if (document.fullscreenElement) document.exitFullscreen();
          }
          return next;
        });
      };

      window.addEventListener('blur', handleSecurityBreach);
      const handleVisibility = () => { if (document.hidden) handleSecurityBreach(); };
      document.addEventListener('visibilitychange', handleVisibility);
      const handleFS = () => { if (!document.fullscreenElement && examState === 'running') handleSecurityBreach(); };
      document.addEventListener('fullscreenchange', handleFS);

      return () => {
        window.removeEventListener('blur', handleSecurityBreach);
        document.removeEventListener('visibilitychange', handleVisibility);
        document.removeEventListener('fullscreenchange', handleFS);
      };
    }
  }, [examState]);

  const startExam = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      setExamState('running');
      setExamTime(600);
      setExamAnswers({});
      setCurrentExamIdx(0);
      setViolations(0);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      alert("Camera and Fullscreen are required for this exam.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (examState === 'finished' || examState === 'disqualified' || !selectedTopic) {
      stopCamera();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
  }, [examState, selectedTopic]);

  useEffect(() => {
    let interval: any;
    if (examState === 'running' && examTime > 0) {
      interval = setInterval(() => setExamTime(t => t - 1), 1000);
    } else if (examTime === 0) {
      setExamState('finished');
    }
    return () => clearInterval(interval);
  }, [examState, examTime]);

  const submitExam = () => setExamState('finished');

  const getExamScore = () => {
    let score = 0;
    examQuestions.forEach(q => {
      if (examAnswers[q.id] === q.correct) score++;
    });
    return score;
  };

  // UI Sections
  const renderLobby = () => (
    <div className="space-y-12">
      <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="max-w-xl space-y-6 text-center md:text-left">
              <span className="px-4 py-1 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">Mastery Gated Learning</span>
              <h1 className="text-6xl font-black tracking-tight leading-tight">Aptitude <span className="text-indigo-400">Hub</span></h1>
              <p className="text-gray-400 text-lg italic serif leading-relaxed">
                 7 core pillars of cognitive placement evaluation. Complete the phases to simulate target firm assessments.
              </p>
           </div>
           <div className="flex gap-4">
              <div className="w-32 h-32 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-indigo-400">{Object.keys(topicProgress).length}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase mt-2">Active</span>
              </div>
              <div className="w-32 h-32 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-emerald-400">0</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase mt-2">Masters</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {APTITUDE_TOPICS.map(topic => {
          const progress = topicProgress[topic.id];
          const isMastered = progress?.unlockedPhases === 4 && progress?.completedPhases.length === 4;
          
          return (
            <motion.button 
              key={topic.id}
              whileHover={{ y: -5 }}
              onClick={() => handleTopicSelect(topic.id)}
              className="group p-8 bg-white border border-gray-100 rounded-[2.5rem] text-left hover:border-indigo-200 transition-all shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                {topic.icon}
              </div>

              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-50 transition-colors">
                {topic.emoji}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{topic.title}</h3>
              <p className="text-[11px] text-gray-400 font-bold mb-6 line-clamp-2 uppercase tracking-wide leading-relaxed">{topic.description}</p>
              
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl group-hover:bg-indigo-50/50">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-400">Content</span>
                    <span className="text-xs font-bold text-gray-600">{topic.examplesCount} Examples • {topic.practiceCount} MCQ</span>
                 </div>
                 {isMastered ? <Trophy className="w-5 h-5 text-amber-500" /> : <ChevronRight className="w-5 h-5 text-gray-300" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  const renderPhaseHeader = () => (
    <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={() => setSelectedTopic(null)} className="p-3 hover:bg-gray-50 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h3 className="font-bold text-gray-900 leading-none mb-1">{currentTopic?.title}</h3>
          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Phase 0{activePhase + 1} Mastery</p>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-2xl">
        {['LEARN', 'APPLY', 'PRACTICE', 'EXAM'].map((label, idx) => {
          const isLocked = idx > (topicProgress[selectedTopic!]?.unlockedPhases || 0);
          return (
            <button 
              key={label}
              disabled={isLocked || loading}
              onClick={() => setActivePhase(idx)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activePhase === idx ? 'bg-white text-indigo-600 shadow-sm' : isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {idx === 0 && <BookOpen className="w-3.5 h-3.5" />}
              {idx === 1 && <PenTool className="w-3.5 h-3.5" />}
              {idx === 2 && <Target className="w-3.5 h-3.5" />}
              {idx === 3 && <Timer className="w-3.5 h-3.5" />}
              {label}
            </button>
          );
        })}
      </div>

      {activePhase < 3 && (
        <button 
          onClick={() => setShowDoubtBox(!showDoubtBox)}
          className={`p-3 rounded-xl transition-all ${showDoubtBox ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:text-indigo-600'}`}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  const renderLearn = () => (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="prose prose-indigo max-w-none">
        <Markdown>{theoryContent?.content || ''}</Markdown>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] space-y-4">
           <Zap className="w-8 h-8 text-indigo-600" />
           <h4 className="text-xl font-black italic serif text-indigo-900 leading-tight">Engineered Explainer</h4>
           <p className="text-sm font-bold text-indigo-800 leading-relaxed opacity-80 italic">
              "Need a custom analogy for this topic? Use the DoubtBox. I can break down these formulas into real-world business scenarios."
           </p>
        </div>
        <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2.5rem] space-y-4">
           <Lightbulb className="w-8 h-8 text-amber-600" />
           <h4 className="text-xl font-black italic serif text-amber-900 leading-tight">Master Tips</h4>
           <ul className="space-y-2">
              {theoryContent?.tips?.map((t: string, i: number) => (
                <li key={i} className="text-xs font-bold text-amber-800 flex gap-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> {t}
                </li>
              ))}
           </ul>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={() => { saveProgress(selectedTopic!, 0); setActivePhase(1); }}
          className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-3"
        >
          Confirm Understanding <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderApply = () => (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {workedExamples.map((ex, i) => (
          <button 
            key={i}
            onClick={() => { setCurrentExampleIdx(i); setShowStep(0); }}
            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${
              currentExampleIdx === i ? 'bg-indigo-600 text-white border-transparent' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-100'
            }`}
          >
            Example 0{i + 1}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl space-y-12">
        <div className="space-y-4">
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Problem Statement</span>
           <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
             {workedExamples[currentExampleIdx]?.problem}
           </h2>
        </div>

        <div className="space-y-4">
           {workedExamples[currentExampleIdx]?.steps.map((step, idx) => (
             <motion.div 
               key={idx}
               initial={false}
               animate={{ opacity: idx <= showStep ? 1 : 0.3, y: idx <= showStep ? 0 : 10 }}
               className={`p-6 rounded-3xl border transition-all ${
                 idx <= showStep ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-transparent blur-[1px]'
               }`}
             >
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {idx + 1}: {step.label}</span>
                   {idx <= showStep && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                {idx <= showStep && <p className="text-lg font-bold text-gray-900 italic serif">{step.content}</p>}
             </motion.div>
           ))}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-gray-50">
           <p className="text-xs font-bold text-gray-400 italic serif">
             Reveal each step to build intuitive pattern recognition.
           </p>
           {showStep < workedExamples[currentExampleIdx]?.steps.length - 1 ? (
             <button 
               onClick={() => setShowStep(s => s + 1)}
               className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg flex items-center gap-2"
             >
               Reveal Next Step <Zap className="w-4 h-4" />
             </button>
           ) : (
             <button 
               onClick={() => {
                 if (currentExampleIdx < workedExamples.length - 1) {
                   setCurrentExampleIdx(i => i + 1);
                   setShowStep(0);
                 } else {
                   saveProgress(selectedTopic!, 1);
                   setActivePhase(2);
                 }
               }}
               className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-lg flex items-center gap-2"
             >
               {currentExampleIdx < workedExamples.length - 1 ? 'Next Example' : 'Complete Application'} <ChevronRight className="w-4 h-4" />
             </button>
           )}
        </div>
      </div>
    </div>
  );

  const renderPractice = () => (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="grid grid-cols-5 gap-3">
        {practiceQuestions.map((_, i) => (
          <div key={i} className={`h-2 rounded-full ${practiceAnswers[practiceQuestions[i].id] !== undefined ? 'bg-indigo-600' : 'bg-gray-100'}`} />
        ))}
      </div>

      <div className="space-y-8">
        {practiceQuestions.map((q, qIdx) => (
          <div key={q.id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
            <div className="flex gap-4 items-start">
               <span className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-sm">{qIdx + 1}</span>
               <h3 className="text-xl font-bold text-gray-900 pt-1 leading-relaxed">{q.text}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
              {q.options.map((opt, i) => {
                const status = practiceAnswers[q.id] === i ? practiceStatus[q.id] : null;
                const isCorrect = i === q.correct;
                
                return (
                  <button 
                    key={i}
                    disabled={practiceAnswers[q.id] !== undefined}
                    onClick={() => handlePracticeAnswer(q.id, i, q.correct)}
                    className={`p-6 rounded-[1.5rem] text-left text-sm font-black transition-all border ${
                      status === 'correct' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
                      status === 'wrong' ? 'bg-rose-50 border-rose-500 text-rose-900' :
                      (practiceAnswers[q.id] !== undefined && isCorrect) ? 'bg-emerald-50 border-emerald-500/30 text-emerald-900' :
                      'bg-gray-50 border-transparent text-gray-600 hover:border-indigo-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {practiceAnswers[q.id] !== undefined && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pl-14 pt-4"
              >
                <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] space-y-2">
                   <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span className="text-[10px] font-black uppercase text-indigo-900 tracking-widest">Boost Reasoning</span>
                   </div>
                   <p className="text-sm font-bold text-indigo-800 italic serif leading-relaxed">
                      {q.explanation}
                   </p>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(practiceAnswers).length === practiceQuestions.length && (
        <div className="flex justify-center pt-10">
           <button 
             onClick={() => { saveProgress(selectedTopic!, 2); setActivePhase(3); }}
             className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-3"
           >
             Unlock Final Exam <Timer className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );

  const renderExam = () => (
    <div className="max-w-4xl mx-auto py-10">
      {examState === 'disqualified' && (
        <div className="bg-white p-16 rounded-[4rem] border border-rose-100 shadow-2xl shadow-rose-200/50 text-center space-y-10">
           <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-600 mx-auto border border-rose-100">
              <Shield className="w-12 h-12" />
           </div>
           <div className="space-y-4">
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Diagnostic Terminated</h2>
              <p className="text-gray-500 font-medium italic serif leading-relaxed">
                Academic integrity protocol triggered. 03 Security violations detected (Window Blur / FS Exit). Your session has been invalidated.
              </p>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="px-12 py-5 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
           >
              Restart Calibration Session
           </button>
        </div>
      )}

      {examState === 'idle' && (
        <div className="bg-gray-900 rounded-[3rem] p-16 text-center text-white space-y-8 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
           <div className="relative z-10 space-y-12">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                 <Timer className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-5xl font-black tracking-tighter">Diagnostic Override</h2>
                 <p className="text-gray-400 font-bold italic serif tracking-wide text-lg">10 Questions • 10 Minutes • Adaptive Logic</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-sm mx-auto text-left space-y-4">
                 <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase">Timed environment active</span>
                 </div>
                 <div className="flex items-center gap-3 text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase">Mandatory Camera Proctoring</span>
                 </div>
                 <div className="flex items-center gap-3 text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase">3 Violations = Disqualification</span>
                 </div>
              </div>
              <button 
                onClick={startExam}
                className="px-16 py-6 bg-white text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]"
              >
                Initiate Secure Sequence
              </button>
           </div>
        </div>
      )}

      {examState === 'running' && (
        <div className="space-y-10">
           <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-gray-900 rounded-2xl text-white font-black text-xl">
                   {currentExamIdx + 1}
                 </div>
                 <div>
                    <h4 className="font-black text-gray-900">Module Verification</h4>
                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Integrity Level: {3 - violations}/3</p>
                 </div>
              </div>
              
              <div className="hidden lg:block w-32 h-20 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale" />
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Remaining</p>
                    <p className={`font-mono text-xl font-black ${examTime < 60 ? 'text-rose-500 animate-pulse' : 'text-gray-900'}`}>
                      {Math.floor(examTime / 60)}:{(examTime % 60).toString().padStart(2, '0')}
                    </p>
                 </div>
                 <button 
                   onClick={submitExam}
                   className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg"
                 >
                    Final Submission
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl space-y-12">
              <h2 className="text-3xl font-black text-gray-900 leading-tight">
                 {examQuestions[currentExamIdx]?.text}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {examQuestions[currentExamIdx]?.options.map((opt, i) => (
                   <button 
                     key={i}
                     onClick={() => {
                        setExamAnswers(prev => ({ ...prev, [examQuestions[currentExamIdx].id]: i }));
                        if (currentExamIdx < examQuestions.length - 1) setCurrentExamIdx(i => i + 1);
                     }}
                     className={`p-8 rounded-[2rem] text-left text-lg font-black transition-all border ${
                       examAnswers[examQuestions[currentExamIdx].id] === i ? 'bg-indigo-600 text-white shadow-xl' : 'bg-gray-50 border-transparent hover:border-indigo-200'
                     }`}
                   >
                     {opt}
                   </button>
                 ))}
              </div>
           </div>

           <div className="flex gap-2 justify-center">
              {examQuestions.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentExamIdx(i)}
                  className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                    currentExamIdx === i ? 'bg-gray-900 text-white' : 
                    examAnswers[q.id] !== undefined ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
           </div>
        </div>
      )}

      {examState === 'finished' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-10"
        >
          <div className="bg-gray-900 rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl">
             <Sparkles className="absolute top-[-40px] left-[-40px] w-64 h-64 text-white/5 pointer-events-none" />
             <div className="relative z-10 space-y-8">
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl ${getExamScore() >= 8 ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                   {getExamScore() >= 8 ? <Award className="w-12 h-12" /> : <Calculator className="w-12 h-12" />}
                </div>
                <h2 className="text-5xl font-black tracking-tight mt-6">Examination Complete</h2>
                <p className="text-gray-400 font-bold italic serif tracking-wide text-xl">Score: {getExamScore()} / 10</p>
                
                <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto py-8">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Percentage</p>
                      <p className="text-2xl font-black text-indigo-400">{getExamScore() * 10}%</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Status</p>
                      <p className={`text-2xl font-black ${getExamScore() >= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                         {getExamScore() >= 8 ? 'PASSED' : 'RETRY'}
                      </p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Speed</p>
                      <p className="text-2xl font-black text-indigo-400">Optimum</p>
                   </div>
                </div>

                <div className="flex gap-4 justify-center">
                   <button 
                     onClick={() => {
                        saveProgress(selectedTopic!, 3);
                        setSelectedTopic(null);
                     }}
                     className="px-12 py-4 bg-white text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all"
                   >
                     Return to Hub
                   </button>
                   {getExamScore() < 8 && (
                     <button 
                       onClick={startExam}
                       className="px-12 py-4 bg-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5"
                     >
                       Retry Exam
                     </button>
                   )}
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm space-y-10">
             <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h3 className="text-2xl font-black text-gray-900">Solution Review</h3>
             </div>
             <div className="space-y-6">
                {examQuestions.map((q, i) => (
                  <div key={i} className={`p-8 rounded-[2rem] border transition-all ${examAnswers[q.id] === q.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                     <div className="flex justify-between items-start mb-4">
                        <p className="font-bold text-gray-900 text-lg leading-relaxed">"{q.text}"</p>
                        <div className={`p-2 rounded-lg ${examAnswers[q.id] === q.correct ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                           {examAnswers[q.id] === q.correct ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-rose-600" />}
                        </div>
                     </div>
                     <div className="flex flex-wrap gap-4 mb-4">
                        <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase text-gray-400 border border-gray-100">
                           Your Choice: <span className={examAnswers[q.id] === q.correct ? 'text-emerald-600' : 'text-rose-600'}>{q.options[examAnswers[q.id]] || 'None'}</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase text-gray-400 border border-gray-100">
                           Correct: <span className="text-emerald-600">{q.options[q.correct]}</span>
                        </div>
                     </div>
                     <div className="p-6 bg-white/60 rounded-2xl border border-gray-100 italic serif text-sm text-gray-600 leading-relaxed font-bold">
                        {q.explanation}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {!selectedTopic ? (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderLobby()}
            </motion.div>
          ) : (
            <motion.div 
              key="mastery-system"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[85vh] bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl relative"
            >
               {renderPhaseHeader()}
               
               <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-12 pb-24 relative scroll-smooth">
                     {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                           <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                           <p className="font-bold text-lg italic serif animate-pulse">Synchronizing Cognitive Material...</p>
                        </div>
                     ) : (
                        <>
                           {activePhase === 0 && renderLearn()}
                           {activePhase === 1 && renderApply()}
                           {activePhase === 2 && renderPractice()}
                           {activePhase === 3 && renderExam()}
                        </>
                     )}
                  </div>

                  {/* DoubtBox Sidebar */}
                  <AnimatePresence>
                     {showDoubtBox && (
                       <motion.div 
                         initial={{ width: 0, opacity: 0 }}
                         animate={{ width: 400, opacity: 1 }}
                         exit={{ width: 0, opacity: 0 }}
                         className="border-l border-gray-100 bg-white flex flex-col shadow-2xl"
                       >
                         <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                  <Sparkles className="w-5 h-5" />
                               </div>
                               <h4 className="font-black text-gray-900 tracking-tight">Mithra Support</h4>
                            </div>
                            <button onClick={() => setShowDoubtBox(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                               <X className="w-5 h-5" />
                            </button>
                         </div>

                         <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            {doubts.length === 0 && (
                              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-6">
                                 <Brain className="w-12 h-12 text-gray-300 mb-4" />
                                 <p className="text-sm italic serif leading-relaxed">
                                    "Stuck on a logic path? Describe the step that's confusing you, and I'll clarify it."
                                 </p>
                              </div>
                            )}
                            {doubts.map((d, i) => (
                              <div key={i} className="space-y-4">
                                 <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-4">
                                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">You</div>
                                    <p className="text-sm font-bold text-gray-700 leading-relaxed">{d.q}</p>
                                 </div>
                                 <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] space-y-4 relative overflow-hidden">
                                    <Sparkles className="absolute top-[-10px] right-[-10px] w-20 h-20 text-indigo-100/50 pointer-events-none" />
                                    <div className="flex items-center gap-2">
                                       <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                                       <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Mithra's Insight</span>
                                    </div>
                                    <div className="prose prose-sm prose-indigo text-xs font-bold italic serif leading-relaxed text-indigo-900 opacity-90">
                                       <Markdown>{d.a}</Markdown>
                                    </div>
                                 </div>
                              </div>
                            ))}
                            {doubtLoading && (
                              <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 animate-pulse">
                                 <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                 <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Bridging Synapses...</span>
                              </div>
                            )}
                         </div>

                         <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                            <div className="relative">
                               <input 
                                 value={doubtInput}
                                 onChange={(e) => setDoubtInput(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleAskDoubt()}
                                 placeholder="Ask anything about the topic..."
                                 className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all pr-12 shadow-sm"
                               />
                               <button 
                                 onClick={handleAskDoubt}
                                 disabled={doubtLoading || !doubtInput.trim()}
                                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-30"
                               >
                                  <Send className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                       </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
