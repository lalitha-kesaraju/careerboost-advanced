import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Zap, Target, Trophy, ArrowLeft, ArrowRight,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Send,
  Loader2, Lightbulb, Clock, Award, RefreshCcw, Eye, EyeOff,
  Brain, Play, Lock, MessageCircle, Sparkles, ChevronRight
} from 'lucide-react';
import { APTITUDE_TOPICS, AptitudeTopic, PracticeQuestion, WorkedExample } from '../data/aptitudeQuestions';
import { getMithraAdvice } from '../services/gemini';

type Phase = 'learn' | 'apply' | 'practice' | 'exam';
type View  = 'lobby' | 'topic';

interface PhaseProgress {
  learn: boolean;
  apply: boolean;
  practice: boolean;
}

const PHASES: { id: Phase; label: string; short: string; icon: React.ElementType; color: string }[] = [
  { id: 'learn',    label: 'Phase 1 - Learn',    short: 'Learn',    icon: BookOpen,  color: 'indigo' },
  { id: 'apply',    label: 'Phase 2 - Apply',    short: 'Apply',    icon: Zap,       color: 'emerald' },
  { id: 'practice', label: 'Phase 3 - Practice', short: 'Practice', icon: Target,    color: 'orange' },
  { id: 'exam',     label: 'Phase 4 - Exam',     short: 'Exam',     icon: Trophy,    color: 'purple' },
];

const PHASE_COLORS: Record<Phase, { bg: string; text: string; border: string }> = {
  learn:    { bg: 'bg-indigo-600',  text: 'text-indigo-600',  border: 'border-indigo-200'  },
  apply:    { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200' },
  practice: { bg: 'bg-orange-500',  text: 'text-orange-500',  border: 'border-orange-200'  },
  exam:     { bg: 'bg-purple-600',  text: 'text-purple-600',  border: 'border-purple-200'  },
};

const DIFF_BADGE: Record<string, string> = {
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
};

// â”€â”€â”€ Doubt Box â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DoubtBox({ phase, context }: { phase: Phase; context: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([]);
  const c = PHASE_COLORS[phase];

  const ask = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    setLoading(true);
    try {
      const answer = await getMithraAdvice(
        `Context: ${context}. Student doubt: ${q}. Give a concise, step-by-step explanation for placement exam prep in 3-5 sentences.`,
        { phase }, []
      );
      setMessages(m => [...m, { q, a: answer }]);
    } catch {
      setMessages(m => [...m, { q, a: 'Could not get an answer right now. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-6">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl border ${c.border} ${c.text} font-bold text-sm hover:opacity-80 transition-all`}>
        <MessageCircle className="w-4 h-4" />
        Ask a Doubt
        {open ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-bold text-gray-700">You: {m.q}</p>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className="flex gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Mithra</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{m.a}</p>
                  </div>
                </div>
              ))}
              {loading && <div className="flex items-center gap-3 text-gray-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Mithra is thinking...</div>}
              <div className="flex gap-3">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
                  placeholder="Type your doubt..."
                  className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-indigo-300" />
                <button onClick={ask} disabled={loading || !input.trim()}
                  className={`px-6 py-3 ${c.bg} text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center gap-2`}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// â”€â”€â”€ Phase 1: Learn â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PhaseLearn({ topic, onComplete }: { topic: AptitudeTopic; onComplete: () => void }) {
  const [loadingTheory, setLoadingTheory] = useState(false);
  const [aiTheory, setAiTheory] = useState('');

  const generateTheory = async () => {
    setLoadingTheory(true);
    try {
      const resp = await getMithraAdvice(
        `You are an expert placement prep coach. Explain "${topic.title}" for aptitude exams. Cover: (1) Core concept in simple words, (2) Why it appears in placements, (3) Common mistakes, (4) Intuition behind the formula. Under 300 words, use clear sections.`,
        { topic: topic.id }, []
      );
      setAiTheory(resp);
    } catch { setAiTheory('Could not load AI explanation. Use the formulas and tips below.'); }
    finally { setLoadingTheory(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-gray-900 text-white rounded-[3rem] p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10" />
        <div className="relative z-10 space-y-4">
          <span className="text-4xl">{topic.emoji}</span>
          <h2 className="text-4xl font-black tracking-tighter">{topic.title}</h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-2xl italic">{topic.theoryOverview}</p>
          <button onClick={generateTheory} disabled={loadingTheory}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 rounded-2xl text-sm font-bold hover:bg-indigo-400 transition-all disabled:opacity-60 mt-2">
            {loadingTheory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiTheory ? 'Refresh AI Explanation' : 'Get AI Explanation'}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {aiTheory && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span className="font-black text-indigo-700 uppercase tracking-widest text-xs">Mithra Explanation</span>
            </div>
            <p className="text-gray-800 text-sm leading-loose whitespace-pre-line">{aiTheory}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <h3 className="font-black text-gray-900 text-lg mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" /> Key Formulas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topic.keyFormulas.map((f, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{f.name}</p>
              <p className="font-mono text-sm font-bold text-indigo-700">{f.formula}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8">
        <h3 className="font-black text-amber-800 text-lg mb-5 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" /> Quick Tips for Placements
        </h3>
        <ul className="space-y-3">
          {topic.quickTips.map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm text-amber-900">
              <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-black text-[10px] flex-shrink-0 mt-0.5">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
      <DoubtBox phase="learn" context={`Topic: ${topic.title}. Formulas: ${topic.keyFormulas.map(f => f.name + ': ' + f.formula).join(', ')}`} />
      <button onClick={onComplete}
        className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
        I have Understood - Move to Apply <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// â”€â”€â”€ Phase 2: Apply â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PhaseApply({ topic, onComplete }: { topic: AptitudeTopic; onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const ex: WorkedExample = topic.workedExamples[idx];
  const curSteps = revealedSteps[idx] ?? 0;
  const fullyRevealed = revealed[idx] || curSteps >= ex.steps.length;

  const revealNext = () => {
    const cur = curSteps;
    if (cur < ex.steps.length) setRevealedSteps(r => ({ ...r, [idx]: cur + 1 }));
    if (cur >= ex.steps.length - 1) setRevealed(r => ({ ...r, [idx]: true }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="font-black text-gray-900 text-lg">Worked Examples</h3>
          <p className="text-xs text-gray-400 font-bold mt-0.5">{topic.title} Â· Example {idx + 1} of {topic.workedExamples.length}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${DIFF_BADGE[ex.difficulty]}`}>{ex.difficulty}</span>
      </div>
      <div className="flex gap-2">
        {topic.workedExamples.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < idx ? 'bg-emerald-500' : i === idx ? 'bg-emerald-300' : 'bg-gray-100'}`} />
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
        <p className="text-gray-800 font-bold text-base leading-relaxed">{ex.problem}</p>
        <div className="space-y-3">
          {ex.steps.slice(0, curSteps).map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</span>
              <p className="text-sm font-medium text-emerald-900">{step}</p>
            </motion.div>
          ))}
          {fullyRevealed && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-gray-900 text-white rounded-2xl flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Answer</p>
                <p className="font-black text-lg">{ex.answer}</p>
              </div>
            </motion.div>
          )}
        </div>
        {!fullyRevealed && (
          <button onClick={revealNext}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all">
            <Eye className="w-4 h-4" />
            {curSteps === 0 ? 'Reveal First Step' : curSteps >= ex.steps.length - 1 ? 'Show Answer' : `Reveal Step ${curSteps + 1}`}
          </button>
        )}
      </div>
      <DoubtBox phase="apply" context={`Topic: ${topic.title}. Worked Example: ${ex.problem}`} />
      <div className="flex gap-4">
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)}
            className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5" /> Prev
          </button>
        )}
        {idx < topic.workedExamples.length - 1 ? (
          <button onClick={() => setIdx(i => i + 1)}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all">
            Next Example <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={onComplete} disabled={!fullyRevealed}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-50">
            Move to Practice <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Phase 3: Practice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PhasePractice({ topic, onComplete }: { topic: AptitudeTopic; onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [showExp, setShowExp] = useState<Record<number, boolean>>({});
  const q: PracticeQuestion = topic.practiceQuestions[idx];
  const answered = selected[q.id] !== undefined;
  const correct  = selected[q.id] === q.correct;
  const allAnswered = topic.practiceQuestions.every(pq => selected[pq.id] !== undefined);
  const score = topic.practiceQuestions.filter(pq => selected[pq.id] === pq.correct).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="font-black text-gray-900 text-lg">Practice Questions</h3>
          <p className="text-xs text-gray-400 font-bold mt-0.5">{topic.title} Â· Q{idx + 1} of {topic.practiceQuestions.length}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${DIFF_BADGE[q.difficulty]}`}>{q.difficulty}</span>
      </div>
      <div className="flex gap-2">
        {topic.practiceQuestions.map((pq, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${
            selected[pq.id] !== undefined ? (selected[pq.id] === pq.correct ? 'bg-emerald-500' : 'bg-red-400') : i === idx ? 'bg-orange-300' : 'bg-gray-100'
          }`} />
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
        <p className="text-gray-900 font-bold text-lg leading-relaxed">{q.text}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            const isSel = selected[q.id] === i;
            const isCorr = i === q.correct;
            let cls = 'border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-300 hover:bg-orange-50';
            if (answered) {
              if (isCorr) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
              else if (isSel) cls = 'border-red-400 bg-red-50 text-red-800';
              else cls = 'border-gray-100 bg-gray-50 text-gray-400';
            }
            return (
              <button key={i} onClick={() => !answered && setSelected(s => ({ ...s, [q.id]: i }))}
                className={`p-5 border-2 rounded-2xl text-left font-bold text-sm transition-all flex items-center gap-3 ${cls}`}>
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                  {answered ? (isCorr ? '\u2713' : isSel ? '\u2717' : String.fromCharCode(65+i)) : String.fromCharCode(65+i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl flex items-start gap-3 ${correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              {correct ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className={`font-black text-sm ${correct ? 'text-emerald-700' : 'text-red-700'}`}>{correct ? 'Correct!' : 'Not quite.'}</p>
                {showExp[q.id] && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{q.explanation}</p>}
                <button onClick={() => setShowExp(e => ({ ...e, [q.id]: !e[q.id] }))}
                  className="mt-2 text-xs font-bold text-gray-500 underline underline-offset-2 hover:text-gray-700 flex items-center gap-1">
                  {showExp[q.id] ? <><EyeOff className="w-3 h-3" /> Hide explanation</> : <><Eye className="w-3 h-3" /> Show explanation</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <DoubtBox phase="practice" context={`Topic: ${topic.title}. Question: ${q.text}. Correct: ${q.options[q.correct]}. Explanation: ${q.explanation}`} />
      <div className="flex gap-4">
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)}
            className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        )}
        {idx < topic.practiceQuestions.length - 1 ? (
          <button onClick={() => setIdx(i => i + 1)} disabled={!answered}
            className="flex-1 py-4 bg-orange-500 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-orange-600 transition-all disabled:opacity-40">
            Next Question <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={onComplete} disabled={!allAnswered}
            className="flex-1 py-4 bg-orange-500 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-orange-600 transition-all disabled:opacity-40">
            Move to Final Exam <Trophy className="w-5 h-5" />
          </button>
        )}
      </div>
      {allAnswered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-200">
          <p className="text-sm font-black text-orange-700">Practice score: {score}/{topic.practiceQuestions.length}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// â”€â”€â”€ Phase 4: Exam â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PhaseExam({ topic }: { topic: AptitudeTopic }) {
  const EXAM_TIME = 10 * 60;
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allQuestions: PracticeQuestion[] = [...topic.practiceQuestions, ...topic.examQuestions];

  useEffect(() => {
    if (started && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); setSubmitted(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, submitted]);

  const submit = () => { if (timerRef.current) clearInterval(timerRef.current); setSubmitted(true); };
  const score = allQuestions.filter(q => selected[q.id] === q.correct).length;
  const pct   = Math.round((score / allQuestions.length) * 100);
  const mins  = Math.floor(timeLeft / 60);
  const secs  = timeLeft % 60;
  const q: PracticeQuestion = allQuestions[idx];

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 text-white rounded-[3rem] p-12 text-center space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/10" />
        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 bg-purple-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Final Exam</p>
            <h2 className="text-4xl font-black tracking-tighter">{topic.title}</h2>
            <p className="text-gray-400 mt-3 text-base">{allQuestions.length} questions Â· 10 minutes Â· No hints</p>
          </div>
          <button onClick={() => setStarted(true)}
            className="px-12 py-5 bg-purple-600 rounded-[2rem] font-black text-lg flex items-center gap-3 mx-auto hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/30">
            <Play className="w-5 h-5" /> Start Exam
          </button>
        </div>
      </motion.div>
    );
  }

  if (submitted) {
    const grade = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : 'Needs Work';
    const gradeColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
        <div className="bg-gray-900 text-white rounded-[3rem] p-12 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/10" />
          <div className="relative z-10 space-y-4">
            <Award className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-5xl font-black tracking-tighter">{pct}%</h2>
            <p className={`text-2xl font-black ${gradeColor}`}>{grade}</p>
            <p className="text-gray-400">{score} correct out of {allQuestions.length}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowSolutions(s => !s)}
            className="flex-1 py-4 bg-white border border-gray-200 rounded-[2rem] font-black text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50">
            {showSolutions ? 'Hide' : 'View'} Solutions
          </button>
          <button onClick={() => { setStarted(false); setSubmitted(false); setSelected({}); setIdx(0); setTimeLeft(EXAM_TIME); }}
            className="flex-1 py-4 bg-purple-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-purple-700">
            <RefreshCcw className="w-4 h-4" /> Retake
          </button>
        </div>
        {showSolutions && (
          <div className="space-y-4">
            {allQuestions.map((aq, i) => {
              const ok = selected[aq.id] === aq.correct;
              return (
                <div key={aq.id} className={`p-6 rounded-3xl border-2 ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex gap-3 mb-3">
                    {ok ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                    <p className="font-bold text-sm text-gray-800">{i + 1}. {aq.text}</p>
                  </div>
                  <p className="text-xs font-black text-gray-500 mb-1">Correct: <span className="text-emerald-700">{aq.options[aq.correct]}</span></p>
                  <p className="text-xs text-gray-600 leading-relaxed">{aq.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm">{idx + 1}</div>
          <div>
            <p className="font-black text-gray-900 text-sm">Q{idx + 1} / {allQuestions.length}</p>
            <span className={`text-[10px] font-black uppercase ${DIFF_BADGE[q.difficulty].split(' ')[1]}`}>{q.difficulty}</span>
          </div>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
          <Clock className="w-5 h-5" /> {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${((idx + 1) / allQuestions.length) * 100}%` }} />
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
        <p className="font-bold text-lg text-gray-900 leading-relaxed">{q.text}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setSelected(s => ({ ...s, [q.id]: i }))}
              className={`p-5 border-2 rounded-2xl text-left font-bold text-sm transition-all flex items-center gap-3 ${
                selected[q.id] === i ? 'border-purple-500 bg-purple-50 text-purple-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'
              }`}>
              <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                {String.fromCharCode(65+i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        {idx > 0 && (
          <button onClick={() => setIdx(i => i - 1)}
            className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        )}
        {idx < allQuestions.length - 1 ? (
          <button onClick={() => setIdx(i => i + 1)}
            className="flex-1 py-4 bg-purple-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-purple-700">
            Next <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={submit}
            className="flex-1 py-4 bg-gray-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-gray-800">
            <Trophy className="w-5 h-5" /> Submit Exam
          </button>
        )}
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Topic View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TopicView({ topic, onBack }: { topic: AptitudeTopic; onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('learn');
  const [progress, setProgress] = useState<PhaseProgress>({ learn: false, apply: false, practice: false });

  const unlocked = (p: Phase) => {
    if (p === 'learn') return true;
    if (p === 'apply') return progress.learn;
    if (p === 'practice') return progress.apply;
    if (p === 'exam') return progress.practice;
    return false;
  };

  const complete = (p: Phase) => {
    if (p === 'learn')    { setProgress(x => ({ ...x, learn: true }));    setPhase('apply'); }
    if (p === 'apply')    { setProgress(x => ({ ...x, apply: true }));    setPhase('practice'); }
    if (p === 'practice') { setProgress(x => ({ ...x, practice: true })); setPhase('exam'); }
  };

  const c = PHASE_COLORS[phase];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <button onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 bg-gray-100 rounded-2xl text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
          <ArrowLeft className="w-4 h-4" /> Topics
        </button>
        <h2 className="font-black text-gray-900 text-lg">{topic.emoji} {topic.title}</h2>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PHASES.map(ph => {
          const isUnlocked = unlocked(ph.id);
          const isDone = ph.id !== 'exam' && progress[ph.id as keyof PhaseProgress];
          const isActive = phase === ph.id;
          return (
            <button key={ph.id} onClick={() => isUnlocked && setPhase(ph.id)}
              className={`relative p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                isActive ? `${c.border} ${c.bg} text-white shadow-lg` :
                isDone ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                isUnlocked ? 'border-gray-200 bg-white text-gray-600 hover:border-gray-300' :
                'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}>
              {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : isUnlocked ? <ph.icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{ph.short}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          {phase === 'learn'    && <PhaseLearn    topic={topic} onComplete={() => complete('learn')} />}
          {phase === 'apply'    && <PhaseApply    topic={topic} onComplete={() => complete('apply')} />}
          {phase === 'practice' && <PhasePractice topic={topic} onComplete={() => complete('practice')} />}
          {phase === 'exam'     && <PhaseExam     topic={topic} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// â”€â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function AptitudeTestSection() {
  const [view, setView] = useState<View>('lobby');
  const [selectedTopic, setSelectedTopic] = useState<AptitudeTopic | null>(null);

  if (view === 'topic' && selectedTopic) {
    return <TopicView topic={selectedTopic} onBack={() => { setView('lobby'); setSelectedTopic(null); }} />;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 text-white rounded-[3.5rem] p-12 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/10" />
        <div className="relative z-10">
          <span className="px-4 py-1.5 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">4-Phase Mastery</span>
          <h1 className="text-6xl font-black tracking-tighter leading-none mt-4">Aptitude <span className="text-indigo-400">Elite</span></h1>
          <p className="text-gray-400 text-lg italic mt-3 max-w-xl leading-relaxed">
            Learn then Apply then Practice then Exam. Every topic taught to mastery with AI doubt clearance at every phase.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {PHASES.map(ph => (
              <div key={ph.id} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/10">
                <ph.icon className="w-4 h-4 text-indigo-300" />
                <span className="text-sm font-bold">{ph.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {APTITUDE_TOPICS.map((topic, i) => (
          <motion.button key={topic.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => { setSelectedTopic(topic); setView('topic'); }}
            className={`${topic.color} p-8 rounded-[2.5rem] border border-transparent hover:shadow-xl transition-all text-left group relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/30 transition-all rounded-[2.5rem]" />
            <div className="relative z-10 space-y-4">
              <span className="text-4xl">{topic.emoji}</span>
              <div>
                <h3 className="font-black text-gray-900 text-xl">{topic.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{topic.theoryOverview}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-white/60 rounded-full text-[10px] font-black text-gray-600">{topic.workedExamples.length} examples</span>
                  <span className="px-2 py-1 bg-white/60 rounded-full text-[10px] font-black text-gray-600">{topic.practiceQuestions.length} practice</span>
                </div>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${topic.accentColor} bg-white/50 group-hover:translate-x-1 transition-transform`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

