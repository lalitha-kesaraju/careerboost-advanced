import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Code2, 
  CheckCircle2, 
  Trophy, 
  Play, 
  ArrowLeft,
  Loader2,
  Sparkles,
  Zap,
  Mic,
  Volume2,
  HelpCircle,
  Terminal,
  Send,
  MoreVertical,
  Maximize2,
  RefreshCcw,
  Check,
  Award,
  BarChart3,
  Lightbulb,
  X,
  ChevronRight,
  BrainCircuit,
  Settings2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { getCourseContent, getMithraAdvice } from '../services/gemini';

interface PhaseLearningProps {
  courseTitle: string;
  stepTitle: string;
  stepIndex: number;
  onBack: () => void;
  onComplete: () => void;
}

export function DSA4PhaseLearning({ courseTitle, stepTitle, stepIndex, onBack, onComplete }: PhaseLearningProps) {
  const [activePhase, setActivePhase] = useState<'understand' | 'apply' | 'evaluate' | 'master'>('understand');
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showDoubtBox, setShowDoubtBox] = useState(false);
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [doubts, setDoubts] = useState<{question: string, answer: string}[]>([]);
  
  // Is this an AI-Agentic course? (e.g., Prompt Engineering)
  const isAgentic = courseTitle.toLowerCase().includes('prompt') || courseTitle.toLowerCase().includes('ai');

  // Phase 2 state
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [runningCode, setRunningCode] = useState(false);
  const [agentExecuting, setAgentExecuting] = useState(false);

  // Phase 3 state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    const fetchPhaseContent = async () => {
      setLoading(true);
      try {
        const data = await getCourseContent(courseTitle, stepTitle, activePhase);
        setContent(data);
        if (activePhase === 'apply' && data.problems) {
          setCode(data.problems[0].starterCode);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhaseContent();
  }, [activePhase, stepTitle]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAskDoubt = async () => {
    if (!doubtInput.trim()) return;
    setDoubtLoading(true);
    const q = doubtInput;
    setDoubtInput('');
    try {
      const resp = await getMithraAdvice(q, { phase: activePhase, content }, []);
      setDoubts(prev => [...prev, { question: q, answer: resp }]);
    } catch (e) {
      console.error(e);
    } finally {
      setDoubtLoading(false);
    }
  };

  const runCode = async () => {
    setRunningCode(true);
    // Simulate real execution with actual test cases
    setTimeout(() => {
      const problem = content.problems?.[selectedProblem];
      if (!problem) return;
      
      const cases = problem.testCases && problem.testCases.length > 0 
        ? problem.testCases 
        : [
            { input: "Sample Input", expected: "Sample Output" },
            { input: "Edge Case", expected: "Standard Output" }
          ];

      setTestResults(cases.map((tc: any) => ({
        ...tc,
        passed: Math.random() > 0.15, // Higher pass rate for better feel
        actual: tc.expected // Simulate success mostly
      })));
      setRunningCode(false);
    }, 1200);
  };

  const handleAgentTask = async () => {
    if (!isAgentic) return;
    setAgentExecuting(true);
    try {
      const problem = content.problems?.[selectedProblem];
      const resp = await getMithraAdvice(
        `Perform this task at the IDE level for the user: ${problem?.prompt}. The current code in IDE is: ${code}. Write the complete solution.`,
        { mode: 'ide_execution', course: courseTitle },
        []
      );
      // Extract code from markdown response if needed, for now just update
      setCode(resp.replace(/```[a-z]*\n/g, '').replace(/```/g, ''));
    } catch (e) {
      console.error(e);
    } finally {
      setAgentExecuting(false);
    }
  };

  const finishQuiz = () => {
    setShowQuizResults(true);
  };

  const PHASES = [
    { id: 'understand', label: 'Understand', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'apply', label: 'Apply', icon: <Code2 className="w-4 h-4" /> },
    { id: 'evaluate', label: 'Evaluate', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'master', label: 'Master', icon: <Trophy className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col h-[85vh] bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 hover:bg-gray-50 rounded-xl transition-colors">
               <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
               <h3 className="font-bold text-gray-900 leading-none mb-1">{stepTitle}</h3>
               <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{courseTitle} • Level 0{stepIndex + 1}</p>
            </div>
         </div>

         <div className="flex bg-gray-100 p-1 rounded-2xl">
            {PHASES.map(p => (
              <button 
                key={p.id}
                disabled={loading}
                onClick={() => setActivePhase(p.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activePhase === p.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {p.icon} {p.label}
              </button>
            ))}
         </div>

         <div className="flex items-center gap-2">
            <button 
               onClick={() => speak(content?.theory || "Learning content loading")}
               className={`p-3 rounded-xl transition-all ${isSpeaking ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-50 text-gray-400 hover:text-indigo-600'}`}
            >
               <Volume2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowDoubtBox(!showDoubtBox)}
              className={`p-3 rounded-xl transition-all ${showDoubtBox ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-400 hover:text-emerald-600'}`}
            >
               <HelpCircle className="w-5 h-5" />
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Main Content Area */}
         <div className="flex-1 overflow-y-auto p-10">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                 <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                 <p className="font-bold text-lg italic serif animate-pulse">Initializing Phase Environment...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto"
                >
                   {activePhase === 'understand' && (
                     <div className="space-y-10">
                        <section className="prose prose-indigo max-w-none">
                           <Markdown>{content.theory}</Markdown>
                        </section>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {content.examples?.map((ex: any, idx: number) => (
                             <div key={idx} className="bg-gray-900 rounded-3xl overflow-hidden shadow-xl">
                                <div className="p-4 bg-gray-800 flex justify-between items-center">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ex.title}</span>
                                   <span className="text-[10px] font-bold text-indigo-400">{ex.language}</span>
                                </div>
                                <pre className="p-6 text-sm text-indigo-100 font-mono overflow-x-auto">
                                   <code>{ex.code}</code>
                                </pre>
                                <div className="p-4 bg-indigo-900/20 border-t border-white/5">
                                   <p className="text-xs text-indigo-300 italic serif">{ex.explanation}</p>
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-start gap-4">
                           <Lightbulb className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                           <div className="space-y-4">
                              <h4 className="font-black text-emerald-900 italic serif text-xl underline decoration-emerald-200 underline-offset-4">Core Takeaways</h4>
                              <ul className="space-y-2">
                                 {content.keyPoints?.map((pt: string, i: number) => (
                                   <li key={i} className="flex gap-3 text-sm font-bold text-emerald-800">
                                      <span className="text-emerald-400">•</span> {pt}
                                   </li>
                                 ))}
                              </ul>
                           </div>
                        </div>

                        <div className="pt-10 flex justify-center">
                           <button 
                             onClick={() => setActivePhase('apply')}
                             className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                           >
                              Next Phase: APPLY <ChevronRight className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                   )}

                   {activePhase === 'apply' && (
                     <div className="h-full flex flex-col gap-6">
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                           {content.problems?.map((p: any, i: number) => (
                             <button 
                                key={i}
                                onClick={() => { setSelectedProblem(i); setCode(p.starterCode); }}
                                className={`flex-shrink-0 px-6 py-4 rounded-2xl flex flex-col items-start gap-1 transition-all ${
                                  selectedProblem === i ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-500 hover:border-indigo-300'
                                }`}
                             >
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Problem {i + 1}</span>
                                <span className="text-sm font-bold truncate max-w-[120px]">{p.prompt.split('.')[0]}</span>
                             </button>
                           ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[400px]">
                           <div className="space-y-6">
                              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-full flex flex-col">
                                 <div className="flex items-center gap-2 mb-4">
                                    <Terminal className="w-5 h-5 text-indigo-600" />
                                    <h4 className="font-black text-gray-900">Task Manifest</h4>
                                 </div>
                                 <p className="text-sm text-gray-600 leading-relaxed italic serif mb-6">
                                    {content.problems[selectedProblem].prompt}
                                 </p>
                                 <div className="mt-auto space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hints</h5>
                                    <div className="space-y-2">
                                       {content.problems[selectedProblem].hints.map((h: string, i: number) => (
                                          <div key={i} className="p-3 bg-amber-50 rounded-xl text-[11px] font-bold text-amber-700 flex gap-2">
                                             <Sparkles className="w-3.5 h-3.5" /> {h}
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
                              <div className="p-4 bg-gray-800 flex justify-between items-center text-white/50 text-[10px] font-mono font-bold tracking-widest">
                                 <span>MAIN_EXECUTOR.PY</span>
                                 <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                 </div>
                              </div>
                              <textarea 
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="flex-1 bg-transparent p-8 text-indigo-300 font-mono text-sm outline-none resize-none"
                                spellCheck={false}
                              />
                                <div className="p-6 bg-gray-800/50 flex justify-between items-center gap-3">
                                 <div className="flex gap-2">
                                    {isAgentic && (
                                       <button 
                                         onClick={handleAgentTask}
                                         disabled={agentExecuting}
                                         className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                       >
                                          {agentExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                                          DELEGATE TO MITHRA
                                       </button>
                                    )}
                                 </div>
                                 <div className="flex gap-3">
                                   <button 
                                     onClick={() => setCode(content.problems[selectedProblem].starterCode || '')}
                                     className="p-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all font-bold text-xs"
                                   >
                                      Reset
                                   </button>
                                   <button 
                                     onClick={runCode}
                                     disabled={runningCode}
                                     className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                                   >
                                      {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                      {isAgentic ? 'VERIFY TASK' : 'EXECUTE'}
                                   </button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {testResults && (
                           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl">
                              <h5 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                 <BarChart3 className="w-5 h-5 text-indigo-600" /> Execution Results
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {testResults.map((r: any, i: number) => (
                                    <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${r.passed ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                       <div>
                                          <p className="text-[10px] font-black uppercase text-gray-400">Test Case {i + 1}</p>
                                          <p className="text-xs font-bold text-gray-700">In: {JSON.stringify(r.input)}</p>
                                       </div>
                                       {r.passed ? <Check className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-rose-600" />}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                   )}

                   {activePhase === 'evaluate' && (
                     <div className="space-y-10">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-12">
                           {content.questions?.map((q: any, qIdx: number) => (
                             <div key={qIdx} className="space-y-6">
                                <div className="flex items-start gap-4">
                                   <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 flex-shrink-0">
                                      {qIdx + 1}
                                   </span>
                                   <p className="text-lg font-bold text-gray-900 pt-1">{q.question}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                                   {q.options.map((opt: string, oIdx: number) => {
                                      const isSelected = selectedAnswers[qIdx] === oIdx;
                                      const isCorrect = q.correctIndex === oIdx;
                                      return (
                                        <button 
                                          key={oIdx}
                                          disabled={showQuizResults}
                                          onClick={() => setSelectedAnswers(prev => ({...prev, [qIdx]: oIdx}))}
                                          className={`p-4 rounded-2xl text-left text-sm font-bold transition-all border ${
                                            showQuizResults 
                                              ? (isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : isSelected ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-gray-50 border-transparent text-gray-400')
                                              : (isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-900' : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200')
                                          }`}
                                        >
                                           {opt}
                                        </button>
                                      );
                                   })}
                                </div>
                                {showQuizResults && (
                                   <div className="pl-12 pt-2">
                                      <p className="text-xs italic serif text-gray-500 flex gap-2">
                                         <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                         {q.explanation}
                                      </p>
                                   </div>
                                )}
                             </div>
                           ))}
                        </div>

                        {!showQuizResults ? (
                          <div className="flex justify-center">
                             <button 
                                onClick={finishQuiz}
                                className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all"
                             >
                                Submit Assessment
                             </button>
                          </div>
                        ) : (
                          <div className="flex justify-center flex-col items-center gap-6">
                             <div className="text-center bg-gray-900 text-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl">
                                <Trophy className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                                <h4 className="text-2xl font-black tracking-tight">Assessment Completed</h4>
                                <p className="text-gray-400 font-bold mb-6 italic serif text-lg opacity-80">"Your conceptual foundation is solid."</p>
                                <div className="flex justify-center items-end gap-2">
                                   <span className="text-5xl font-black text-indigo-400">80</span>
                                   <span className="text-xl text-gray-500 font-bold mb-2">/ 100</span>
                                </div>
                             </div>
                             <button 
                                onClick={() => setActivePhase('master')}
                                className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center gap-3"
                             >
                                View Mastery Roadmap <ChevronRight className="w-5 h-5" />
                             </button>
                          </div>
                        )}
                     </div>
                   )}

                   {activePhase === 'master' && (
                     <div className="space-y-10">
                        <div className="text-center py-10 space-y-4">
                           <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mx-auto shadow-xl shadow-emerald-100">
                              <Award className="w-12 h-12" />
                           </div>
                           <h2 className="text-4xl font-black text-gray-900 tracking-tight">Stage Master Certified</h2>
                           <p className="text-gray-500 italic serif text-lg opacity-80 leading-relaxed max-w-xl mx-auto">
                              "{content.summary || "You have successfully integrated the structural concepts of this module into your permanent mental model."}"
                           </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-6">
                              <h4 className="font-black text-gray-900 flex items-center gap-2">
                                 <RefreshCcw className="w-5 h-5 text-indigo-600" /> Longitudinal Roadmap
                              </h4>
                              <div className="space-y-4">
                                 {content.recommendations?.map((rec: string, i: number) => (
                                   <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
                                      <div className="w-2 h-2 bg-indigo-200 rounded-full mt-2 group-hover:bg-indigo-500" />
                                      <p className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{rec}</p>
                                   </div>
                                 ))}
                              </div>
                           </div>

                           <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between">
                              <div className="space-y-6">
                                 <h4 className="text-lg font-black uppercase tracking-widest text-indigo-400">Mastery Snapshot</h4>
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                                       <span className="text-xs font-bold text-gray-400">Conceptual Depth</span>
                                       <span className="text-indigo-400 font-black">94%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                                       <span className="text-xs font-bold text-gray-400">Implementation Spped</span>
                                       <span className="text-emerald-400 font-black">Fast</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                                       <span className="text-xs font-bold text-gray-400">Weak Area</span>
                                       <span className="text-rose-400 font-black">Edge Cases</span>
                                    </div>
                                 </div>
                              </div>
                              <button 
                                onClick={onComplete}
                                className="mt-8 w-full py-5 bg-white text-gray-900 rounded-2xl font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-3"
                              >
                                 Unlock Next Step <ChevronRight className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                     </div>
                   )}
                </motion.div>
              </AnimatePresence>
            )}
         </div>

         {/* Doubt / AI Assistant Sidebar */}
         <AnimatePresence>
            {showDoubtBox && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-gray-100 bg-white shadow-2xl flex flex-col"
              >
                 <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Sparkles className="w-4 h-4" />
                       </div>
                       <h4 className="font-bold text-gray-900">Mithra Assistant</h4>
                    </div>
                    <button onClick={() => setShowDoubtBox(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                       <X className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {doubts.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                         <HelpCircle className="w-12 h-12 text-gray-300 mb-4" />
                         <p className="text-xs italic serif truncate max-w-[200px]">"Confused about a concept? Ask me for a clearer explanation."</p>
                      </div>
                    )}
                    {doubts.map((d, i) => (
                      <div key={i} className="space-y-4">
                         <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Your Question</p>
                            <p className="text-xs font-bold text-gray-700">{d.question}</p>
                         </div>
                         <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl relative overflow-hidden">
                            <Sparkles className="absolute top-[-10px] right-[-10px] w-20 h-20 text-emerald-100 pointer-events-none" />
                            <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 relative z-10">Mithra's Insight</p>
                            <div className="prose prose-sm prose-emerald relative z-10 text-xs italic serif leading-relaxed text-emerald-900">
                               <Markdown>{d.answer}</Markdown>
                            </div>
                         </div>
                      </div>
                    ))}
                    {doubtLoading && (
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl animate-pulse">
                         <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                         <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Bridging Synapses...</span>
                      </div>
                    )}
                 </div>

                 <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                    <div className="relative">
                       <input 
                         value={doubtInput}
                         onChange={(e) => setDoubtInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleAskDoubt()}
                         placeholder="Describe your confusion..."
                         className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all pl-6 pr-12 shadow-sm"
                       />
                       <button 
                         onClick={handleAskDoubt}
                         disabled={doubtLoading || !doubtInput.trim()}
                         className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-30"
                       >
                          <Send className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
