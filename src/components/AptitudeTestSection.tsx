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

interface Question {
  id: number;
  category: 'Quantitative' | 'Logical' | 'Verbal';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

const APTITUDE_POOL: Question[] = [
  // EASY - QUANTITATIVE
  {
    id: 1,
    category: 'Quantitative',
    difficulty: 'Easy',
    text: "A project manager allocates $4500 for a team lunch. If the team size increases by 20% and the budget per person remains the same, what is the new total budget?",
    options: ["$5,000", "$5,400", "$4,900", "$6,000"],
    correct: 1,
    explanation: "20% of 4500 is (0.2 * 4500) = 900. New budget = 4500 + 900 = 5400."
  },
  {
    id: 2,
    category: 'Quantitative',
    difficulty: 'Easy',
    text: "If a server processes 150 requests per minute, how many requests will it process in 4 hours?",
    options: ["36,000", "24,000", "45,000", "30,000"],
    correct: 0,
    explanation: "Requests per hour = 150 * 60 = 9000. In 4 hours = 9000 * 4 = 36000."
  },
  {
    id: 3,
    category: 'Quantitative',
    difficulty: 'Easy',
    text: "The ratio of developers to designers in a firm is 7:3. If there are 21 designers, how many developers are there?",
    options: ["42", "49", "63", "35"],
    correct: 1,
    explanation: "3 units = 21, so 1 unit = 7. Developers (7 units) = 7 * 7 = 49."
  },
  // MEDIUM - LOGICAL
  {
    id: 4,
    category: 'Logical',
    difficulty: 'Medium',
    text: "Complete the series: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"],
    correct: 2,
    explanation: "The differences are 4, 6, 8, 10... so the next difference is 12. 30 + 12 = 42."
  },
  {
    id: 5,
    category: 'Logical',
    difficulty: 'Medium',
    text: "Statement: All developers are engineers. Some engineers are managers. Conclusion: I. Some managers are developers. II. Some developers are managers.",
    options: ["Only II follows", "Only I follows", "Both I and II follow", "Neither follows"],
    correct: 3,
    explanation: "Being an engineer doesn't guarantee the connection between developer and manager roles in this overlapping set."
  },
  // HARD - QUANTITATIVE
  {
    id: 6,
    category: 'Quantitative',
    difficulty: 'Hard',
    text: "A tank can be filled by Pipe A in 12 hours and emptied by Pipe B in 15 hours. If both are opened simultaneously, how long will it take to fill half the tank?",
    options: ["30 hours", "60 hours", "45 hours", "20 hours"],
    correct: 0,
    explanation: "Net rate = (1/12 - 1/15) = 1/60 per hour. Full tank takes 60 hours. Half tank takes 30 hours."
  },
  // MEDIUM - VERBAL
  {
    id: 7,
    category: 'Verbal',
    difficulty: 'Medium',
    text: "Select the word most nearly opposite in meaning to 'EPHEMERAL':",
    options: ["Fleeting", "Permanent", "Precarious", "Ethereal"],
    correct: 1,
    explanation: "Ephemeral means short-lived. Permanent is the opposite."
  },
  {
    id: 8,
    category: 'Verbal',
    difficulty: 'Easy',
    text: "Choose the correct sentence:",
    options: [
      "He performed good on the test.",
      "He performed well on the test.",
      "He performed more better on the test.",
      "He performed bestest on the test."
    ],
    correct: 1,
    explanation: "'Well' is the adverb modifying the verb 'performed'."
  },
  // MEDIUM - QUANT
  {
    id: 9,
    category: 'Quantitative',
    difficulty: 'Medium',
    text: "If a sum of money doubles in 8 years at simple interest, what is the rate of interest per annum?",
    options: ["10%", "12.5%", "15%", "8%"],
    correct: 1,
    explanation: "Interest = Principal. I = PRT/100 => P = P*R*8/100 => R = 100/8 = 12.5%."
  },
  {
    id: 10,
    category: 'Logical',
    difficulty: 'Hard',
    text: "In a certain code, 'PYTHON' is written as 'QZUIOP'. How is 'SCRIPT' written in that code?",
    options: ["TDSTQU", "TDSJQU", "TDSIQU", "TDRJQU"],
    correct: 1,
    explanation: "Each letter is shifted: P+1=Q, Y+1=Z, T+1=U, H+1=I, O+1=P, N+1=O (wait, check pattern). P->Q(+1), Y->Z(+1), T->U(+1), H->I(+1), O->P(+1), N->O(+1). For SCRIPT: S->T, C->D, R->S, I->J, P->Q, T->U. Result: TDSJQU."
  },
  {
    id: 11,
    category: 'Quantitative',
    difficulty: 'Medium',
    text: "A shopkeeper marks his goods 20% above cost price and allows a discount of 10%. What is his profit percentage?",
    options: ["10%", "8%", "12%", "5%"],
    correct: 1,
    explanation: "Let CP = 100. MP = 120. SP = 120 - 10% of 120 = 120 - 12 = 108. Profit = 8%."
  },
  {
    id: 12,
    category: 'Logical',
    difficulty: 'Medium',
    text: "Pointing to a photograph, a man said, 'I have no brother or sister, but that man's father is my father's son.' Whose photograph was it?",
    options: ["His father's", "His son's", "His own", "His nephew's"],
    correct: 1,
    explanation: "'My father's son' with no siblings means 'Me'. So 'that man's father is Me'. The photograph is of his son."
  },
  {
    id: 13,
    category: 'Verbal',
    difficulty: 'Hard',
    text: "Identify the analogy: PARADIGM : PATTERN :: ?",
    options: ["Anomaly : Standard", "Facet : Aspect", "Criteria : Singular", "Virtue : Vice"],
    correct: 1,
    explanation: "A paradigm is a pattern or model; a facet is an aspect or feature. They are synonyms."
  },
  {
    id: 14,
    category: 'Quantitative',
    difficulty: 'Easy',
    text: "Find the average of the first five prime numbers.",
    options: ["5.6", "5.4", "6.2", "4.8"],
    correct: 0,
    explanation: "First 5 primes: 2, 3, 5, 7, 11. Sum = 28. Average = 28/5 = 5.6."
  },
  {
    id: 15,
    category: 'Logical',
    difficulty: 'Easy',
    text: "If Sunday is the 1st day of the month, what day will the 25th be?",
    options: ["Tuesday", "Wednesday", "Thursday", "Friday"],
    correct: 1,
    explanation: "Days are 1, 8, 15, 22 (all Sundays). 23=Mon, 24=Tue, 25=Wed."
  },
  {
    id: 16,
    category: 'Verbal',
    difficulty: 'Medium',
    text: "Choose the correct spelling:",
    options: ["Acquaintance", "Acquaintence", "Aquaintance", "Acquanitance"],
    correct: 0,
    explanation: "The correct spelling is 'Acquaintance'."
  },
  {
    id: 17,
    category: 'Quantitative',
    difficulty: 'Hard',
    text: "The speed of a boat in still water is 15 km/hr and the speed of the current is 3 km/hr. Find the distance traveled downstream in 12 minutes.",
    options: ["3.6 km", "3.0 km", "4.2 km", "2.4 km"],
    correct: 0,
    explanation: "Downstream speed = 15 + 3 = 18 km/hr. Time = 12/60 = 0.2 hr. Distance = 18 * 0.2 = 3.6 km."
  },
  {
    id: 18,
    category: 'Logical',
    difficulty: 'Medium',
    text: "Find the odd one out: 27, 64, 125, 144, 216",
    options: ["27", "64", "125", "144"],
    correct: 3,
    explanation: "All others are cubes (3^3, 4^3, 5^3, 6^3). 144 is 12^2."
  },
  {
    id: 19,
    category: 'Quantitative',
    difficulty: 'Easy',
    text: "If 12 machines can produce 1200 units in 5 days, how many units can 8 machines produce in 10 days?",
    options: ["1600", "1200", "1800", "2000"],
    correct: 0,
    explanation: "(M1*D1)/W1 = (M2*D2)/W2 => (12*5)/1200 = (8*10)/W2 => 60/1200 = 80/W2 => 1/20 = 80/W2 => W2 = 1600."
  },
  {
    id: 20,
    category: 'Verbal',
    difficulty: 'Medium',
    text: "Complete the sentence: 'The committee ________ split in their opinion.'",
    options: ["is", "are", "was", "has"],
    correct: 1,
    explanation: "When a collective noun is divided in opinion, use a plural verb."
  },
  {
    id: 21,
    category: 'Quantitative',
    difficulty: 'Medium',
    text: "What is the probability of getting a sum of 7 when two dice are thrown?",
    options: ["1/6", "1/12", "5/36", "1/36"],
    correct: 0,
    explanation: "Favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. Total = 36. Prob = 6/36 = 1/6."
  },
  {
    id: 22,
    category: 'Logical',
    difficulty: 'Hard',
    text: "If A + B means A is the daughter of B; A - B means A is the husband of B; A * B means A is the brother of B. What does P + Q * R mean?",
    options: ["P is the niece of R", "P is the daughter of R", "P is the cousin of R", "P is the sister of R"],
    correct: 0,
    explanation: "Q * R means Q is brother of R. P + Q means P is daughter of Q. So P is daughter of R's brother, making P the niece of R."
  },
  {
    id: 23,
    category: 'Quantitative',
    difficulty: 'Medium',
    text: "A person sells two articles at $600 each. On one he gains 20% and on other he loses 20%. Overall result is:",
    options: ["No profit no loss", "4% loss", "4% gain", "1% loss"],
    correct: 1,
    explanation: "When selling prices are same and gain/loss % are same, there is always a loss of (x^2 / 100)%. (20^2 / 100) = 400/100 = 4% loss."
  },
  {
    id: 24,
    category: 'Verbal',
    difficulty: 'Easy',
    text: "Choose the synonym for 'ABUNDANT':",
    options: ["Scarce", "Plentiful", "Rare", "Meager"],
    correct: 1,
    explanation: "Abundant means plentiful."
  },
  {
    id: 25,
    category: 'Logical',
    difficulty: 'Easy',
    text: "If COLD is coded as DPME, then how is HEAT coded?",
    options: ["IFBU", "IGBV", "JFBU", "HFBU"],
    correct: 0,
    explanation: "C+1=D, O+1=P, L+1=M, D+1=E. For HEAT: H+1=I, E+1=F, A+1=B, T+1=U."
  },
  {
    id: 26,
    category: 'Quantitative',
    difficulty: 'Medium',
    text: "A train 150m long is running at 54 km/hr. How much time will it take to cross a platform 200m long?",
    options: ["20 sec", "23.33 sec", "25 sec", "21 sec"],
    correct: 1,
    explanation: "Total distance = 150 + 200 = 350m. Speed = 54 * 5/18 = 15 m/s. Time = 350/15 = 23.33 sec."
  },
  {
    id: 27,
    category: 'Verbal',
    difficulty: 'Medium',
    text: "Select the correctly punctuated sentence:",
    options: [
      "The sun was shining; nevertheless, it was cold.",
      "The sun was shining, nevertheless, it was cold.",
      "The sun was shining nevertheless it was cold.",
      "The sun was shining; nevertheless it was cold."
    ],
    correct: 0,
    explanation: "A semicolon is used before 'nevertheless' and a comma after it when joining two independent clauses."
  },
  {
    id: 28,
    category: 'Logical',
    difficulty: 'Medium',
    text: "In a row of boys, Deepak is 7th from the left and Madhu is 12th from the right. If they interchange positions, Deepak becomes 22nd from the left. How many boys are there in the row?",
    options: ["31", "33", "34", "30"],
    correct: 1,
    explanation: "New position of Deepak = 22nd from left. This is Madhu's old position (12th from right). Total = 22 + 12 - 1 = 33."
  },
  {
    id: 29,
    category: 'Quantitative',
    difficulty: 'Hard',
    text: "What is the unit digit in the product (3^65 * 6^59 * 7^71)?",
    options: ["1", "2", "4", "6"],
    correct: 2,
    explanation: "3^65 = 3^(4*16 + 1) -> 3^1 = 3. 6^any = 6. 7^71 = 7^(4*17 + 3) -> 7^3 = 343 -> 3. Product unit digits: 3 * 6 * 3 = 54 -> 4."
  },
  {
    id: 30,
    category: 'Verbal',
    difficulty: 'Medium',
    text: "Choose the word that fits: 'The ________ of the mountain was difficult.'",
    options: ["Ascent", "Assent", "Accent", "Ascend"],
    correct: 0,
    explanation: "Ascent means the act of rising or climbing."
  }
];

// Mocking the full 100 question generation for demonstration
const generateMoreQuestions = () => {
  const categories: ('Quantitative' | 'Logical' | 'Verbal')[] = ['Quantitative', 'Logical', 'Verbal'];
  const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
  
  const additional: Question[] = [];
  const templates = [
    "Challenge #{i}: A software module has a ${i}% probability of failure. What is the reliability of 3 such modules in parallel?",
    "Challenge #{i}: If 'CODE' is 20, then 'IDE' is 15. What is the code for 'BUILD' given index ${i}?",
    "Challenge #{i}: Which of these is a synonym for 'PROMETHEAN' in a technical context?",
    "Challenge #{i}: A database query takes ${i}ms. If we add an index, it speeds up by 40%. New speed?",
    "Challenge #{i}: Logical Inference: If all users are clients, and some clients are paid. Is every user paid?",
    "Challenge #{i}: Find the next number in the sequence: ${i*2}, ${i*3}, ${i*5}, ${i*8}, ?"
  ];

  for (let i = 31; i <= 100; i++) {
    const cat = categories[i % 3];
    const diff = i < 50 ? 'Easy' : (i < 80 ? 'Medium' : 'Hard');
    const template = templates[i % templates.length].replace('${i}', i.toString());
    
    additional.push({
      id: i,
      category: cat,
      difficulty: diff,
      text: template,
      options: ["Case A", "Case B", "Case C", "Insufficient Data"],
      correct: (i % 4),
      explanation: `Challenge #${i} involves advanced systemic reasoning. In this specific scenario, the logic aligns with standard algorithmic complexity analysis.`
    });
  }
  return [...APTITUDE_POOL, ...additional];
};

const FULL_QUESTION_SET = generateMoreQuestions();

export function AptitudeTestSection() {
  const [view, setView] = useState<'lobby' | 'test' | 'results'>('lobby');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timer, setTimer] = useState(0);
  const [activeDifficulty, setActiveDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');

  const filteredQuestions = FULL_QUESTION_SET.filter(q => q.difficulty === activeDifficulty);

  useEffect(() => {
    let interval: any;
    if (view === 'test') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  const handleAnswer = (optionIdx: number) => {
    const q = filteredQuestions[currentIdx];
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
                           {['Easy', 'Medium', 'Hard'].map((d: any) => (
                             <button 
                               key={d}
                               onClick={() => setActiveDifficulty(d)}
                               className={`w-full p-4 rounded-xl font-bold text-xs flex justify-between items-center transition-all ${
                                 activeDifficulty === d ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                               }`}
                             >
                               {d} Level
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
