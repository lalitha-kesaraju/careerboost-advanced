import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  HelpCircle, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Award, 
  BookOpen, 
  RotateCcw, 
  Compass, 
  AlertCircle,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { generateRoleQuiz } from '../services/gemini';
import { useAuth } from '../App';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface RoleQuizSectionProps {
  data: any;
  onNavigate: (view: string) => void;
  onDataUpdate?: (data: any) => void;
}

export function RoleQuizSection({ data, onNavigate, onDataUpdate }: RoleQuizSectionProps) {
  const { user, userData } = useAuth();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectTopics, setIncorrectTopics] = useState<string[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const targetRole = data?.targetRole;
  const missingSkills = data?.missingSkills || [];
  const level = data?.marketInsights?.experienceLevel || 'Mid-Level';

  const fetchQuiz = async () => {
    if (!targetRole) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const skillsArray = typeof missingSkills === 'string' 
        ? [missingSkills] 
        : Array.isArray(missingSkills) 
          ? missingSkills.map((s: any) => typeof s === 'object' ? s.name : s) 
          : [];

      const result = await generateRoleQuiz(targetRole, level, skillsArray);
      if (result && Array.isArray(result.questions) && result.questions.length > 0) {
        setQuiz(result);
      } else {
        throw new Error("Invalid quiz format returned");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate custom diagnostic tool. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we already have quiz results and want to show summary, we can let user retake or jump.
    // For a highly customized, immediate flow, generate a new quiz.
    fetchQuiz();
  }, [targetRole]);

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedIdx(optionIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedIdx === null || isAnswered) return;
    
    const currentQuestion = quiz.questions[currentIdx];
    const isCorrect = selectedIdx === currentQuestion.correctIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      if (currentQuestion.topic && !incorrectTopics.includes(currentQuestion.topic)) {
        setIncorrectTopics(prev => [...prev, currentQuestion.topic]);
      }
    }
    
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    setSelectedIdx(null);
    setIsAnswered(false);
    
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setQuizSubmitted(true);
    }
  };

  const handleGenerateAdjustedPath = async () => {
    const quizResults = {
      score,
      total: quiz.questions.length,
      incorrectTopics,
      completedAt: new Date().toISOString()
    };

    // Save to local parent state so it's passed down
    if (onDataUpdate) {
      onDataUpdate({ 
        quizResults,
        isPathConfirmed: true // Also locks in the goal
      });
    }

    // Save persistent careerOS progress
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'quizResults': quizResults,
          'isPathConfirmed': true
        });
      } catch (err) {
        console.error("Firestore save error:", err);
      }
    }

    // Move to learning-plan component which will read `quizResults` and build tailored path!
    onNavigate('learning-plan');
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setIncorrectTopics([]);
    setQuizSubmitted(false);
    fetchQuiz();
  };

  if (!targetRole) {
    return (
      <div className="py-20 text-center space-y-6">
         <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <AlertCircle className="w-10 h-10" />
         </div>
         <h3 className="text-2xl font-black text-gray-900">Career Trajectory Undefined</h3>
         <p className="text-gray-500 italic serif max-w-sm mx-auto">Please upload and analyze your resume first to establish a target role.</p>
         <button 
           onClick={() => onNavigate('resume-upload')}
           className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
         >
            Go to Resume Panel
         </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center space-y-6">
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full shadow-2xl"
         />
         <div className="text-center space-y-1.5">
            <p className="text-zinc-900 font-extrabold text-2xl tracking-tight">Synthesizing Diagnostic Evaluation</p>
            <p className="text-indigo-600/80 font-black text-xs uppercase tracking-widest animate-pulse">
              Curating questions for {targetRole} ({level})
            </p>
         </div>
         <div className="max-w-md text-center p-6 bg-indigo-50 border border-indigo-100/50 rounded-2xl">
            <p className="text-xs text-indigo-900 font-medium leading-relaxed">
              This diagnostic tests real-world scenario reasoning, specific framework methodologies, and system architectural patterns to custom-tune your upcoming Mastery Path learning speeds.
            </p>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl max-w-lg mx-auto">
         <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
            <AlertCircle className="w-8 h-8" />
         </div>
         <h3 className="text-2xl font-black text-gray-900 mb-2">Quiz Formulation Failed</h3>
         <p className="text-gray-500 text-sm mb-6 leading-relaxed">{error}</p>
         <button 
           onClick={fetchQuiz}
           className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"
         >
            <RotateCcw className="w-4 h-4" /> Retry Construction
         </button>
      </div>
    );
  }

  const currentQuestion = quiz?.questions?.[currentIdx];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-white/[0.04] -skew-x-12 translate-x-1/3" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1 bg-white/25 rounded-md text-[10px] font-black uppercase tracking-widest leading-none">
              Role Diagnostics
            </div>
            {data?.quizResults && (
              <span className="text-[10px] text-indigo-200 font-bold">• Previous attempt score: {data.quizResults.score}/{data.quizResults.total}</span>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight font-display">{quiz?.title || `${targetRole} Evaluation`}</h2>
          <p className="text-indigo-200 text-xs italic serif">Adaptive curriculum tailoring based on performance scoring</p>
        </div>
        {!quizSubmitted && (
          <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 font-mono text-xs font-bold shrink-0">
            Progress: {currentIdx + 1} / {quiz?.questions?.length}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!quizSubmitted ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Question card */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-zinc-250/60 p-10 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                    Q{currentIdx + 1}
                  </div>
                  <span className="text-xs text-zinc-500 font-black uppercase tracking-widest font-mono">
                    Topic: {currentQuestion?.topic || 'Core Competency'}
                  </span>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-zinc-900 leading-relaxed font-display">
                    {currentQuestion?.question}
                  </h3>

                  {/* Options */}
                  <div className="grid gap-3.5">
                    {currentQuestion?.options?.map((option: string, oIdx: number) => {
                      const isOptionSelected = selectedIdx === oIdx;
                      let optionStyle = 'border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300';
                      
                      if (isAnswered) {
                        if (oIdx === currentQuestion.correctIndex) {
                          optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900';
                        } else if (isOptionSelected) {
                          optionStyle = 'bg-rose-50 border-rose-500 text-rose-900';
                        } else {
                          optionStyle = 'opacity-55 border-zinc-100';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'bg-indigo-50/50 border-indigo-600 text-indigo-900 shadow-md shadow-indigo-50';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleOptionSelect(oIdx)}
                          className={`w-full p-5 rounded-2xl border-2 text-left font-bold text-sm tracking-tight transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{option}</span>
                          {isAnswered && oIdx === currentQuestion.correctIndex && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {isAnswered && isOptionSelected && oIdx !== currentQuestion.correctIndex && (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm/Next Actions */}
                <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 italic font-medium">Choose carefully. Every score fine-tunes your path.</span>
                  
                  {!isAnswered ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedIdx === null}
                      className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-indigo-150"
                    >
                      Confirm Response
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-indigo-150"
                    >
                      {currentIdx + 1 === quiz.questions.length ? 'Submit Quiz' : 'Next Question'}{' '}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Explanation & Helper sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <AnimatePresence mode="wait">
                {isAnswered ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="p-8 bg-zinc-55 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 border border-indigo-100/70 rounded-[2.5rem] space-y-4"
                  >
                    <div className="flex items-center gap-2 text-indigo-900">
                      <BookMarked className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-extrabold uppercase tracking-widest text-[10px]">Academic Commentary</h4>
                    </div>

                    <div className="space-y-4">
                      {selectedIdx === currentQuestion.correctIndex ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs uppercase">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct Analysis!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase">
                          <XCircle className="w-4 h-4 text-rose-600" /> Misinterpreted Scenario
                        </div>
                      )}

                      <p className="text-zinc-700 text-sm leading-relaxed font-bold italic serif">
                        "{currentQuestion.explanation}"
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center h-full min-h-[220px] text-zinc-400">
                    <HelpCircle className="w-10 h-10 mb-4 text-zinc-300 animate-bounce" />
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Answer Pending</p>
                    <p className="text-[11px] italic serif max-w-[200px]">Strategic explanations unlock as soon as you confirm an option.</p>
                  </div>
                )}
              </AnimatePresence>

              <div className="p-8 bg-white border border-zinc-200/80 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-2 text-zinc-800">
                  <Compass className="w-4 h-4 text-cyan-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Adjustment Metric</h4>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  We match your errors directly against the upcoming curriculum syllabus. High scores will inject complex project specifications; multiple errors will seed easy-to-absorb step-by-step foundation micro-tasks.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Finished: Score panel */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] border border-zinc-200/80 p-12 text-center max-w-4xl mx-auto space-y-10"
          >
            <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-100 text-indigo-600">
              <Award className="w-12 h-12" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-black text-zinc-950 tracking-tight font-display">Diagnostic Terminated</h2>
              <p className="text-base text-zinc-600 font-bold uppercase tracking-widest">
                Target Score Indicator: <span className="text-indigo-600 font-black text-2xl font-mono">{score} / {quiz.questions.length}</span>
              </p>
              
              {/* Feedback Statement */}
              <div className="max-w-xl mx-auto p-6 bg-zinc-50 rounded-2xl border border-zinc-100 italic serif text-zinc-700 leading-relaxed text-base">
                {score >= 8 
                  ? `"Exceptional capability demonstrated. You display deep underlying technical context corresponding to advanced architectural pacing. Modifying learning path to fast-track foundational layers and deploy complex systems designs earlier."` 
                  : score >= 5 
                    ? `"Solid baseline competency verified. We have identified a few structural optimization possibilities. Your tailored plan will emphasize intermediate workflows, balancing pace and structural review with target-designed checkpoints."`
                    : `"Excellent starting point. We've detected foundational topics that deserve deep and deliberate analysis. Your tailored learning path has been redesigned with extended tutorials, descriptive exercises, and direct scaffolding."`
                }
              </div>
            </div>

            {/* Topics breakdown */}
            {incorrectTopics.length > 0 && (
              <div className="max-w-lg mx-auto space-y-3 pt-4">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Adjustment Topics Identified</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {incorrectTopics.map((topic, i) => (
                    <span key={i} className="px-4 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-extrabold uppercase tracking-wide border border-rose-100">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGenerateAdjustedPath}
                className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-extrabold text-sm uppercase tracking-wider hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <BookOpen className="w-5 h-5" /> Generate Tailored Mastery Path
              </button>
              <button 
                onClick={handleRetake}
                className="px-10 py-5 bg-white border border-zinc-200 text-zinc-700 rounded-2xl font-bold text-sm hover:border-zinc-400 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retake Evaluation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
