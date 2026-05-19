import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain, Target, Sparkles, Zap, Shield, ArrowRight, Loader2,
  Star, Ghost, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
  BarChart3, Briefcase
} from 'lucide-react';
import { getMithraAdvice } from '../services/gemini';
import {
  BIG_FIVE_QUESTIONS, BFTrait, LIKERT_CHOICES, TRAIT_LABELS,
  TRAIT_DESCRIPTIONS, TRAIT_COLORS, QUESTIONS_PER_PAGE, TOTAL_PAGES,
  computeOceanScores
} from '../data/bigFiveQuestions';

interface BigFiveResult {
  persona: string;
  strengths: string[];
  potentialKillers: string[];
  workEnvironment: string;
  careerMatches: string[];
  insight: string;
  score: Record<BFTrait, number>;
}

const TRAIT_ORDER: BFTrait[] = ['EXT', 'AGR', 'CSN', 'NEU', 'OPN'];

export function MeRIDPsychometricTest() {
  const [step, setStep] = useState<'intro' | 'test' | 'loading' | 'results'>('intro');
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<BigFiveResult | null>(null);

  const pageQuestions = BIG_FIVE_QUESTIONS.slice(
    page * QUESTIONS_PER_PAGE,
    (page + 1) * QUESTIONS_PER_PAGE
  );

  const pageAnswered = pageQuestions.every(q => answers[q.id] !== undefined);
  const totalAnswered = Object.keys(answers).length;

  const handleSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (page < TOTAL_PAGES - 1) {
      setPage(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      generateResults();
    }
  };

  const handleBack = () => {
    if (page > 0) setPage(p => p - 1);
  };

  const generateResults = async () => {
    setStep('loading');
    const scores = computeOceanScores(answers);

    try {
      const response = await getMithraAdvice(
        `You are a professional career psychologist. Given these validated Big Five OCEAN personality scores (0â€“100 scale, higher = more of that trait):
- Extraversion (EXT): ${scores.EXT}
- Agreeableness (AGR): ${scores.AGR}
- Conscientiousness (CSN): ${scores.CSN}
- Neuroticism (NEU): ${scores.NEU}
- Openness (OPN): ${scores.OPN}

Provide a career-focused personality analysis as a single JSON object with ONLY these fields:
{
  "persona": "brief professional archetype name",
  "strengths": ["3â€“4 key professional strengths based on the scores"],
  "potentialKillers": ["2â€“3 career derailers to watch out for"],
  "workEnvironment": "2â€“3 sentence description of ideal work environment",
  "careerMatches": ["4â€“5 specific best-fit career paths or roles"],
  "insight": "2-sentence motivational career insight tailored to this profile"
}
Response must be ONLY valid JSON with no markdown.`,
        { mode: 'big_five_analysis', scores },
        []
      );

      const cleaned = response.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setResult({ ...parsed, score: scores });
      setStep('results');
    } catch {
      setResult({
        persona: 'The Adaptive Professional',
        strengths: ['Analytical thinking', 'Reliable execution', 'Emotional awareness', 'Creative problem solving'],
        potentialKillers: ['Overthinking decisions', 'Difficulty delegating'],
        workEnvironment: 'You thrive in structured yet collaborative environments where deep work is valued alongside meaningful team interaction.',
        careerMatches: ['Product Manager', 'UX Researcher', 'Data Analyst', 'Business Strategist'],
        insight: 'Your unique blend of traits positions you for roles that bridge creativity and execution. Lean into environments that reward both independence and collaboration.',
        score: scores,
      });
      setStep('results');
    }
  };

  const restart = () => {
    setStep('intro');
    setPage(0);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <AnimatePresence mode="wait">

        {/* â”€â”€ INTRO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Big Five IPIP Assessment</span>
              </div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Personality Diagnostics</h1>
              <p className="text-xl text-gray-500 italic max-w-lg mx-auto leading-relaxed">
                The gold-standard OCEAN model. 50 validated questions reveal your Openness, Conscientiousness, Extraversion, Agreeableness and Neuroticism â€” mapped to your career potential.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { icon: Target,    label: '50 Questions',  desc: '5 pages Â· ~10 mins' },
                { icon: Zap,       label: 'OCEAN Scoring', desc: 'Scientifically keyed' },
                { icon: Sparkles,  label: 'Career Insight', desc: 'AI-powered readout' },
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

        {/* â”€â”€ TEST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 'test' && (
          <motion.div
            key={`test-${page}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Big Five Assessment</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  Page {page + 1} of {TOTAL_PAGES} Â· {totalAnswered} / {BIG_FIVE_QUESTIONS.length} answered
                </p>
              </div>
              <div className="px-4 py-2 bg-indigo-50 rounded-2xl text-indigo-600 text-xs font-black uppercase tracking-widest">
                OCEAN Model
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(totalAnswered / BIG_FIVE_QUESTIONS.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 120 }}
                className="h-full bg-indigo-600 rounded-full"
              />
            </div>

            {/* Likert header labels (desktop) */}
            <div className="hidden md:grid grid-cols-[1fr_repeat(5,_minmax(60px,_80px))] gap-3 px-2 text-center">
              <div />
              {LIKERT_CHOICES.map(c => (
                <div key={c.value} className="text-[9px] font-black uppercase tracking-wider text-gray-400 leading-tight">
                  {c.label}
                </div>
              ))}
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {pageQuestions.map((q, idx) => {
                const globalIdx = page * QUESTIONS_PER_PAGE + idx;
                const selected = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-3xl border p-5 transition-all ${
                      selected !== undefined
                        ? 'border-indigo-200 shadow-sm shadow-indigo-50'
                        : 'border-gray-100 shadow-sm'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_repeat(5,_minmax(60px,_80px))] gap-4 items-center">
                      <p className="text-sm font-bold text-gray-800 leading-snug">
                        <span className="text-indigo-400 mr-2 font-black">{globalIdx + 1}.</span>
                        {q.text}
                      </p>
                      {LIKERT_CHOICES.map(choice => (
                        <button
                          key={choice.value}
                          onClick={() => handleSelect(q.id, choice.value)}
                          className={`w-full aspect-square md:aspect-auto md:h-12 rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center ${
                            selected === choice.value
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                              : 'border-gray-200 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                          title={choice.label}
                        >
                          <span className="hidden md:block">{choice.value}</span>
                          <span className="md:hidden text-[10px]">{choice.label.split(' ').map((w: string) => w[0]).join('')}</span>
                        </button>
                      ))}
                    </div>
                    {selected !== undefined && (
                      <p className="md:hidden text-[10px] text-indigo-500 font-bold mt-2 text-right">
                        {LIKERT_CHOICES.find(c => c.value === selected)?.label}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 pt-2">
              {page > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!pageAnswered}
                className={`flex-1 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all ${
                  pageAnswered
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {page < TOTAL_PAGES - 1 ? (
                  <>Next Page <ChevronRight className="w-5 h-5" /></>
                ) : (
                  <>Analyse My Profile <Sparkles className="w-5 h-5" /></>
                )}
              </button>
            </div>

            {!pageAnswered && (
              <p className="text-center text-xs text-gray-400 font-bold">
                Answer all {QUESTIONS_PER_PAGE} questions on this page to continue
              </p>
            )}
          </motion.div>
        )}

        {/* â”€â”€ LOADING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center space-y-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto shadow-2xl shadow-indigo-100"
            >
              <Loader2 className="w-12 h-12" />
            </motion.div>
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Scoring Your OCEAN Profile</h2>
              <p className="text-gray-500 italic text-lg opacity-60">Computing trait scores and generating your career blueprintâ€¦</p>
            </div>
          </motion.div>
        )}

        {/* â”€â”€ RESULTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            {/* Hero */}
            <div className="bg-gray-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl">
              <Sparkles className="absolute top-[-20px] right-[-20px] w-64 h-64 text-white/5" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">
                    Big Five Â· OCEAN Profile
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                  </div>
                </div>
                <h2 className="text-5xl font-black leading-none tracking-tighter">{result.persona}</h2>
                <p className="text-base text-gray-400 leading-relaxed max-w-2xl italic">"{result.insight}"</p>
                <div className="pt-4">
                  <button
                    onClick={restart}
                    className="px-8 py-3 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
                  >
                    Retake Test
                  </button>
                </div>
              </div>
            </div>

            {/* OCEAN Trait Bars */}
            <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                <h4 className="font-black text-gray-900 tracking-tight text-lg">Your OCEAN Scores</h4>
              </div>
              <div className="space-y-6">
                {TRAIT_ORDER.map(trait => {
                  const score = result.score[trait] ?? 0;
                  const color = TRAIT_COLORS[trait];
                  return (
                    <div key={trait}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-black text-gray-900 text-sm">{TRAIT_LABELS[trait]}</span>
                          <span className="text-xs text-gray-400 ml-2 hidden sm:inline">{TRAIT_DESCRIPTIONS[trait]}</span>
                        </div>
                        <span className="font-black text-gray-900 text-lg">{score}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ delay: 0.1 * TRAIT_ORDER.indexOf(trait), duration: 0.8, type: 'spring' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Three-column insight cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
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

              <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <Ghost className="w-6 h-6 text-red-500" />
                  <h4 className="font-black text-gray-900 tracking-tight">Watch Out For</h4>
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

              <section className="bg-[#1A1A1A] text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <Target className="w-6 h-6 text-indigo-400" />
                    <h4 className="font-black tracking-tight text-white">Ideal Habitat</h4>
                  </div>
                  <p className="text-sm text-gray-400 italic leading-relaxed flex-1">
                    {result.workEnvironment}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
              </section>
            </div>

            {/* Career Matches */}
            <section className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <Briefcase className="w-6 h-6 text-indigo-600" />
                <h4 className="font-black text-gray-900 tracking-tight text-lg">Best-Fit Career Paths</h4>
              </div>
              <div className="flex flex-wrap gap-4">
                {result.careerMatches.map((career: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm font-bold text-indigo-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-indigo-400 rounded-full" />
                    {career}
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

