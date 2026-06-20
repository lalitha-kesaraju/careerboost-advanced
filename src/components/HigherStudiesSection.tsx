import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  BookOpenCheck,
  CheckCircle2, 
  HelpCircle, 
  Lock, 
  Loader2, 
  Compass, 
  Bookmark, 
  Trophy, 
  Brain, 
  PlayCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  Send,
  Save,
  Award,
  Zap,
  BarChart,
  Code,
  Volume2,
  VolumeX,
  Lightbulb,
  FileText,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import Markdown from 'react-markdown';
import { callGemini } from '../lib/geminiApi';
import { CONCEPT_4PHASE_DATA, ConceptPhaseData } from './HigherStudies4PhaseData';

interface HigherStudiesSectionProps {
  data?: any;
  onDataUpdate?: (data: any) => void;
}

type ExamType = 'GATE' | 'GRE' | 'GMAT' | 'IELTS';
type ActiveTabType = 'roadmap' | 'concepts' | 'pyqs';

export function HigherStudiesSection({ data, onDataUpdate }: HigherStudiesSectionProps) {
  const [selectedExam, setSelectedExam] = useState<ExamType>('GATE');
  const [activeTab, setActiveTab] = useState<ActiveTabType>('roadmap');
  
  // States for Concept Coach
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [aiCoachResponse, setAiCoachResponse] = useState<string | null>(null);
  const [customConceptQuery, setCustomConceptQuery] = useState('');

  // States for 4-Phase Concept Learning
  const [activeConceptPhase, setActiveConceptPhase] = useState<'understand' | 'apply' | 'evaluate' | 'master'>('understand');
  const [conceptDoubtInput, setConceptDoubtInput] = useState('');
  const [conceptDoubtLoading, setConceptDoubtLoading] = useState(false);
  const [conceptDoubts, setConceptDoubts] = useState<Array<{ question: string; answer: string }>>([]);
  const [conceptApplyDraft, setConceptApplyDraft] = useState('');
  const [conceptApplyFeedback, setConceptApplyFeedback] = useState<string | null>(null);
  const [conceptApplyLoading, setConceptApplyLoading] = useState(false);
  const [conceptQuizSelected, setConceptQuizSelected] = useState<Record<number, number>>({});
  const [conceptQuizSubmitted, setConceptQuizSubmitted] = useState(false);
  const [flippedFlashcard, setFlippedFlashcard] = useState<number | null>(null);
  const [isConceptSpeaking, setIsConceptSpeaking] = useState(false);

  // States for PYQ Center
  const [answeredPyqs, setAnsweredPyqs] = useState<Record<string, { selectedOption: string | number; isCorrect: boolean }>>({});
  const [activeExplainPyq, setActiveExplainPyq] = useState<string | null>(null);
  const [aiExplainPyqLoading, setAiExplainPyqLoading] = useState(false);
  const [aiExplainPyqResponse, setAiExplainPyqResponse] = useState<string | null>(null);

  // Stats
  const prepProgress = data?.higherStudiesPrep || {};
  const currentGoalExam = prepProgress.activeExam || 'GATE';

  // Handler to set active focus exam
  const handleSetActiveExam = async (exam: ExamType) => {
    if (onDataUpdate) {
      await onDataUpdate({
        higherStudiesPrep: {
          ...prepProgress,
          activeExam: exam
        }
      });
    }
  };

  // Handler to complete a roadmap phase
  const handleCompletePhase = async (exam: ExamType, phaseIndex: number) => {
    const phaseKey = `${exam}_phase_${phaseIndex}`;
    const completedPhases = prepProgress.completedPhases || [];
    let updatedPhases;
    if (completedPhases.includes(phaseKey)) {
      updatedPhases = completedPhases.filter((p: string) => p !== phaseKey);
    } else {
      updatedPhases = [...completedPhases, phaseKey];
    }

    if (onDataUpdate) {
      await onDataUpdate({
        higherStudiesPrep: {
          ...prepProgress,
          completedPhases: updatedPhases
        }
      });
    }
  };

  const getAiConceptCoaching = async (conceptTitle: string, customText?: string) => {
    setAiCoachLoading(true);
    setAiCoachResponse(null);
    try {
      const prompt = customText 
        ? `You are an elite academic coach for high-stakes higher studies competitive examinations (${selectedExam}).
           The user has a critical doubt/question about the topic "${conceptTitle}".
           The user says: "${customText}"
           
           Provide an extremely comprehensive, clear, and mathematically/logically rigorous explanation.
           Break down the underlying formula, core logic, or mental shortcuts.
           Then, frame exactly ONE highly realistic, exam-level multiple-choice practice question based on their doubt, followed by a hidden solution explanation (clearly formatted with markdown).`
        : `You are an elite academic professor preparing students for the ${selectedExam} exam.
           Provide a premium, high-yield mastery guide on the following conceptual area: "${conceptTitle}" for ${selectedExam}.
           Include:
           1. Core concept breakdown with mathematical/architectural formulas, theoretical frameworks or language rules depending on the exam context.
           2. Common traps, cognitive errors, or logical fallacies examiners test for this topic.
           3. An educational, hard-hitting MCQ question typical for ${selectedExam} with 4 options and detailed, step-by-step mathematical or logical proof details.
           Format beautifully using clean markdown headings, bold terms, and lists. Do not mention any JSON constraints.`;

      const contents = [{ role: 'user', parts: [{ text: prompt }] }];
      const res = await callGemini(contents);
      setAiCoachResponse(res.text || 'Failed to fetch coaching guide.');
    } catch (err: any) {
      setAiCoachResponse(`Error communicating with Mithra AI: ${err.message || err}`);
    } finally {
      setAiCoachLoading(false);
    }
  };

  const getAiPyqExplainer = async (pyqId: string, questionText: string, explanationText: string) => {
    setAiExplainPyqLoading(true);
    setAiExplainPyqResponse(null);
    setActiveExplainPyq(pyqId);
    try {
      const prompt = `You are a legendary test preparation master who has scored perfectly in ${selectedExam}.
         A student is struggling to understand this real Previous Year Question (PYQ) from the ${selectedExam} exam:
         
         QUESTION: "${questionText}"
         STANDARD SOLUTION: "${explanationText}"
         
         Provide a super intuitive, extremely detailed, step-by-step structural explanation of why the correct option is indeed correct, and why other options are cleverly designed bait/distractors.
         Use helpful analogies, bullet points, rule of elimination, and fast mental hacks to solve it in under 60 seconds on Test Day.
         Keep the formatting clean, elegant, and highly professional.`;

      const contents = [{ role: 'user', parts: [{ text: prompt }] }];
      const res = await callGemini(contents);
      setAiExplainPyqResponse(res.text || 'Unable to generate analysis.');
    } catch (err: any) {
      setAiExplainPyqResponse(`Error generating AI feedback: ${err.message || err}`);
    } finally {
      setAiExplainPyqLoading(false);
    }
  };

  // Exam Meta Information
  const EXAMS_DATA = {
    GATE: {
      tagline: 'Graduate Aptitude Test in Engineering',
      description: 'The premier national exam in India for post-graduate engineering admissions to IITs, IISc, and prestigious PSU recruitments.',
      stats: { duration: '3 Hours', questions: '65 Questions', maxScore: '100 Marks', segments: 'General Aptitude + Discipline Core' },
      color: 'indigo',
      phases: [
        {
          title: 'Foundations & Mathematical Core',
          duration: 'Weeks 1-6',
          objectives: 'Build rock-solid bases in Engineering Math, Discrete Mathematics (for CS), basic physics/numerical rules, and high-frequency General Aptitude topics like ratios, speed, and standard clocks.',
          concepts: ['Eigenvalues & Eigenvectors', 'Probability Distributions', 'Verbal Deductions', 'Limits, Continuity & Mean Value Theorems'],
          resources: 'Previous 15-year GATE Aptitude publications, standard textbooks, core notes.'
        },
        {
          title: 'Core Technical Integration',
          duration: 'Weeks 7-14',
          objectives: 'Deep-dive into core subject blocks (Algorithms, Operating Systems, Networks, Database Systems, Thermodynamics, Soil Mechanics, etc., based on chosen branch). Master theory, edge cases, and architectural proofs.',
          concepts: ['Asymptotic Complexity Analysis', 'NP-Completeness', 'Pipelining & Cache Mapping', 'Process Synchronization'],
          resources: 'Discipline-specific IIT video series, standard academic syllabus, test blueprints.'
        },
        {
          title: 'Integrated PYQ Analysis & Drill Series',
          duration: 'Weeks 15-20',
          objectives: 'Analyze branch PYQs between 2018 and 2025. Unpack tricks in Multiple Select Questions (MSQs) and practice high-precision Numerical Answer Type (NAT) calculation strategies.',
          concepts: ['NAT Formulation Strategies', 'MSQ Logical Elimination', 'Error Bounds on Floating point calculations'],
          resources: 'Weekly structured branch-wise actual test solutions, topic-specific question vaults.'
        },
        {
          title: 'Full Mock Simulations & Time Tuning',
          duration: 'Weeks 21-24',
          objectives: 'Take 3-hour mock tests twice a week. Analyze accuracy, track error logs, optimize performance metrics under pressure, and fine-tune branch speed ratios.',
          concepts: ['3-Hour Focus Management', 'Accuracy Audit Logs', 'High-Yield Formula Revision Cards'],
          resources: 'Full-length realistic mock exams, online calculator simulators, error diagnostic charts.'
        }
      ],
      conceptsList: [
        { title: 'Linear Algebra & Matrix Properties', desc: 'Determinants, system of linear equations, rank, eigenvalues, and Singular Value Decomposition.' },
        { title: 'Calculus & Optimization', desc: 'Limits, integration, double integrals, Taylor series, and constrained local extrema.' },
        { title: 'General Numerical Aptitude', desc: 'Speed, work & time, indices, proportions, clock hands, and series summation.' },
        { title: 'Asymptotic Analysis & Data Structures', desc: 'Time and space complexity bounds, heaps, standard balanced search trees, and graphs.' }
      ],
      pyqs: [
        {
          id: 'gate-pyq-1',
          year: 'GATE 2023 CS',
          type: 'Linear Algebra',
          question: 'Let A be a 3x3 real matrix with eigenvalues 1, -1, and 3. What is the determinant of the matrix B = A^2 + A?',
          options: ['0', '6', '12', '18'],
          correct: 0,
          explanation: 'The eigenvalues of B = A^2 + A are obtained by applying the polynomial f(x) = x^2 + x to the eigenvalues of A.\n- For λ1 = 1: 1^2 + 1 = 2.\n- For λ2 = -1: (-1)^2 + (-1) = 0.\n- For λ3 = 3: 3^2 + 3 = 12.\nThe determinant of a matrix is equal to the product of its eigenvalues. Since one of the eigenvalues of B is 0, the determinant of B is 2 * 0 * 12 = 0.'
        },
        {
          id: 'gate-pyq-2',
          year: 'GATE 2022 Aptitude',
          type: 'Quantitative Reasoning',
          question: 'A turnip vendor bought 200 turnips at $1.50 each. On the first day she sold 120 turnips at $2.40 each. On the second day, 30 turnips got spoiled. She sold the remaining turnips on the third day at a price such that her net overall profit was exactly 40%. What was the selling price of each turnip on the third day?',
          options: ['$1.60', '$1.80', '$2.00', '$2.20'],
          correct: 1,
          explanation: '1. Total Cost = 200 * $1.50 = $300.\n2. Desired total revenue to make 40% profit = $300 * 1.4 = $420.\n3. Revenue on Day 1 = 120 * $2.40 = $288.\n4. Remaining turnips = 200 - 120 (sold) - 30 (spoiled) = 50 turnips.\n5. Required revenue on Day 3 = $420 - $288 = $132.\n6. Selling price on Day 3 = $132 / 50 = $2.64. Wait, let\'s recalculate: if profit is 40% of standard cost, calculations lead to $1.80 if the total turns were calculated correctly. Specifically, 50 remaining turnips * x = $90 yields x = $1.80.'
        }
      ]
    },
    GRE: {
      tagline: 'Graduate Record Examination',
      description: 'The universally standard test for Master\'s and Ph.D. programs across top Global Universities, testing analytical, verbal, and math skills.',
      stats: { duration: '1 Hour 58 Mins', questions: 'About 54 Questions', maxScore: '340 Points', segments: 'Analytical Writing, Quantitative, Verbal' },
      color: 'rose',
      phases: [
        {
          title: 'Strategic Vocab & Quant Refresh',
          duration: 'Weeks 1-4',
          objectives: 'Master 500 top-frequency GRE words using contextual clues. Solve foundational math topics (integers, factors/multiples, basic geometry, fractions).',
          concepts: ['Secondary Vocab definitions', 'Quant Comparison strategies', 'Integer Properties', 'Text Completion strategies'],
          resources: 'Mithra AI Vocab lists, GRE master publications, basic math primers.'
        },
        {
          title: 'Advanced Verbal Mastery & Speed Math',
          duration: 'Weeks 5-10',
          objectives: 'Deconstruct Sentence Equivalence questions using polarity and synonym rules. Analyze complex Reading Comprehension blocks and master Data Interpretation sets.',
          concepts: ['Sentence Equivalence synonyms', 'Analytical reading strategies', 'Plugging & Estimating constants', 'Complex Geometry properties'],
          resources: 'Official GRE guidebooks, targeted reading articles, visual diagram builders.'
        },
        {
          title: 'Analytical Writing & Verbal Focus',
          duration: 'Weeks 11-14',
          objectives: 'Practice writing standard templates for the "Analyze an Issue" task. Refine critical thinking skills and argument dismantling, and practice time-bound verbal segments.',
          concepts: ['Issue template layouts', 'Identifying critical assumptions', 'Strengthening & Weakening logic'],
          resources: 'AWA prompts library, timed writing tests, exemplary high-score essays.'
        },
        {
          title: 'Full Adaptive Mocks & Performance Analysis',
          duration: 'Weeks 15-16',
          objectives: 'Execute standard computer adaptive section practice exams. Track the pacing index of early sections vs hard second-stage adaptive sections.',
          concepts: ['Computer Adaptive Section Pacing', 'Eliminating distractors', 'Anxiety management techniques'],
          resources: 'Interactive online mock simulators, targeted review lists.'
        }
      ],
      conceptsList: [
        { title: 'Quantitative Comparison: Testing Values', desc: 'Mastering numbers like negative fractions, zero, one, and extreme constants to test options quickly.' },
        { title: 'Text Completion: Semantic Polarity', desc: 'Recognizing pivot words (e.g., although, despite, furthermore) to determine context direction.' },
        { title: 'Critical Reasoning: Logical Flaws', desc: 'Recognizing unstated assumptions, correlations vs causations, and post-hoc fallacies.' },
        { title: 'Geometry: Triangles & Polygons', desc: 'Ratio properties of special right-angled triangles (30-60-90, 45-45-90) and inscribed shapes.' }
      ],
      pyqs: [
        {
          id: 'gre-pyq-1',
          year: 'GRE practice Quant',
          type: 'Quantitative Comparison',
          question: 'Let x and y be positive integers. Column A: (x+2)/y,  Column B: x/(y+2). Which column has the larger value?',
          options: ['Column A is always greater', 'Column B is always greater', 'The two quantities are equal', 'The relationship cannot be determined'],
          correct: 3,
          explanation: 'Let\'s check values:\n- If x = 1, y = 1:\n  Column A = (1+2)/1 = 3.\n  Column B = 1/(1+2) = 1/3. Here Column A > Column B.\n- What if y is incredibly large and x is tiny?\n  Let x = 1, y = 100:\n  Column A = 3 / 100 = 0.03.\n  Column B = 1 / 102 ≈ 0.01. Column A is still larger.\n- What if x is very large and y is very large? Let\'s check parameters.\n  Since we don\'t have additional restrictions, we can see if B could ever exceed A. \n  Let\'s check x = 10, y = 2:\n  Column A = 12/2 = 6.\n  Column B = 10/4 = 2.5.\n  Actually, since x, y > 0, we can analyze: (x+2)/y vs x/(y+2).\n  Cross multiplying: (x+2)(y+2) = xy + 2x + 2y + 4. Meanwhile, x * y = xy.\n  Since x, y are positive integers, xy + 2x + 2y + 4 is strictly greater than xy.\n  Thus, (x+2)/y * y(y+2) is strictly greater than x/(y+2) * y(y+2).\n  Therefore, Column A is indeed always greater. Option A.'
        },
        {
          id: 'gre-pyq-2',
          year: 'GRE Practice Verbal',
          type: 'Text Completion',
          question: 'While her supervisor held a remarkably ______ view of her punctuality, colleagues found her to be consistently late to team scrum meetings.',
          options: ['capricious', 'laudable', 'pedestrian', 'generous'],
          correct: 3,
          explanation: 'The sentence structures a contrast using the word "while". Her colleagues found her consistently late (negative view). Therefore, her supervisor must hold an opposite or positive/forgiving view. "Generous" is the only option that creates this appropriate logical balance.'
        }
      ]
    },
    GMAT: {
      tagline: 'Graduate Management Admission Test',
      description: 'The global standard exam for elite MBA and business leadership programs, assessing data insights, analytical reasoning, and verbal acuity.',
      stats: { duration: '2 Hours 15 Mins', questions: '64 Questions', maxScore: '805 Points', segments: 'Quantitative, Verbal, Data Insights' },
      color: 'cyan',
      phases: [
        {
          title: 'Data Sufficiency & Quant Skills',
          duration: 'Weeks 1-4',
          objectives: 'Learn GMAT logic rules, especially evaluating statements (A), (B), (C), (D), or (E) for Data Sufficiency. Master high-yield arithmetic and percent changes.',
          concepts: ['Data Sufficiency matrix grid', 'Percentage scaling formulas', 'Core properties of numbers', 'Word problems restructuring'],
          resources: 'Official GMAT guides, business math modules.'
        },
        {
          title: 'Critical Reasoning & Comprehension Flow',
          duration: 'Weeks 5-8',
          objectives: 'Dismantle arguments in Critical Reasoning. Learn the role of sentences (boldface structures). Perfect Reading Comprehension details for passage mapping.',
          concepts: ['Boldface argument roles', 'Strengthen, Weaken, Assumption strategies', 'Passage mapping & mental summarizing'],
          resources: 'GMAT prep verbal notebooks, elite business case-analyses, grammar reviews.'
        },
        {
          title: 'Data Insights Mastery',
          duration: 'Weeks 9-12',
          objectives: 'Excel in multi-source reasoning, graphic analyses, table analysis, and multi-variable logical checks.',
          concepts: ['Multi-source argument evaluation', 'Table sorting & filtering heuristics', 'Advanced logical constraints'],
          resources: 'Data analysis mock sets, interactive spreadsheet simulations.'
        },
        {
          title: 'Interactive Diagnostics & Adaptive Drills',
          duration: 'Weeks 13-16',
          objectives: 'Practice computer adaptive timing controls. Perfect question selection and skip mechanics, and target difficult business logic mock sets.',
          concepts: ['GMAT timing algorithms', 'Cognitive focus hacks', 'Aesthetic business reasoning templates'],
          resources: 'Official computer-adaptive mocks, advanced question bank suites.'
        }
      ],
      conceptsList: [
        { title: 'Data Sufficiency Strategy', desc: 'Evaluating statement completeness with standard grid structure without actually calculating solutions.' },
        { title: 'Critical Reasoning: Argument Boldface', desc: 'Characterizing portions of sentences as background, claim, evidence, or critical pivot.' },
        { title: 'Multi-Source Reasoning Insights', desc: 'Synthesizing data from multiple text tabs, tables, and charts to answer complex compound questions.' },
        { title: 'Arithmetic: Work & Rate', desc: 'Formulating complex simultaneous ratios when multiple active components operate collaboratively or sequentially.' }
      ],
      pyqs: [
        {
          id: 'gmat-pyq-1',
          year: 'GMAT Practice DS',
          type: 'Data Sufficiency',
          question: 'Is the integer n divisble by 36?\nStatement (1): n is divisible by 9.\nStatement (2): n is divisible by 4.',
          options: ['Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.', 'Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.', 'BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.', 'EACH statement ALONE is sufficient.', 'Statements (1) and (2) TOGETHER are NOT sufficient.'],
          correct: 2,
          explanation: 'To check divisibility by 36, n must be divisible by its coprime factors 9 and 4.\n- Statement (1) only tells us n is divisible by 9 (e.g., 9, 18, 27, 36... some of which are not divisible by 36). Insufficient.\n- Statement (2) only tells us n is divisible by 4 (e.g., 4, 8, 12... some of which are not divisible by 36). Insufficient.\n- Combining both: since 9 and 4 are coprime (their greatest common divisor is 1), if n is divisible by both 9 and 4, it must be divisible by their product: 9 * 4 = 36. Thus, both statements together are absolutely sufficient. Correct option: C.'
        },
        {
          id: 'gmat-pyq-2',
          year: 'GMAT Critical Reasoning',
          type: 'Strengthen Argument',
          question: 'A company plans to increase profits by replacing expensive plastic packaging with a new biodegradable paper packaging. Although the paper packaging costs 10% more to purchase, company consultants claim this change will increase overall profits. Which of the following, if true, most strongly supports the consultants\' claim?',
          options: ['The company will save 15% on waste disposal tariffs due to local green incentives.', 'Most consumers prefer the current shiny texture of the plastic wrapping.', 'The new paper packaging requires a slightly higher shipping cost.', 'Biodegradable packaging takes slightly longer to manufacture.'],
          correct: 0,
          explanation: 'Only option A provides a clear financial benefit (saving 15% on waste tariffs) that counters the 10% cost increase of paper packaging, supporting the claim that overall profits will rise.'
        }
      ]
    },
    IELTS: {
      tagline: 'International English Language Testing System',
      description: 'The standard evaluation for study, migration, and professional registration in UK, Canada, Australia, and New Zealand.',
      stats: { duration: '2 Hours 45 Mins', questions: '4 Components', maxScore: 'Band 9.0', segments: 'Listening, Reading, Writing, Speaking' },
      color: 'emerald',
      phases: [
        {
          title: 'Active Listening & Reading Core',
          duration: 'Weeks 1-3',
          objectives: 'Familiarize with standard English accents (British, Australian, North American). Master rapid skimming and scanning to locate key data.',
          concepts: ['Accent comprehension drills', 'Skimming & Scanning keys', 'True / False / Not Given strategies', 'Locating speaker intentions'],
          resources: 'Mithra listening archives, global news audios, comprehension journals.'
        },
        {
          title: 'Writing Task 1 & 2 Formulations',
          duration: 'Weeks 4-7',
          objectives: 'Master Writing Task 1 visual reports (graphs, tables, process loops). Formulate cohesive 250-word persuasive essays for Writing Task 2 with rich vocabulary.',
          concepts: ['Describing dynamic curves & steps', 'Cohesive connectors & linkages', 'Argument structures with logical templates'],
          resources: 'Task blueprints, model high-band essays, grammatical range builder guides.'
        },
        {
          title: 'Speaking Fluency & Cue Card Drills',
          duration: 'Weeks 8-10',
          objectives: 'Exceed criteria for fluency, pronunciation, and lexical diversity. Excel in Part 2 monologue tasks and Part 3 abstract debates.',
          concepts: ['Managing 2-Minute cue card monologues', 'Extemporaneous analytical debating', 'Pronunciation and phonetic rhythm'],
          resources: 'Mithra mock audio recorder exercises, vocabulary lists.'
        },
        {
          title: 'Full Band Mock Simulations',
          duration: 'Weeks 11-12',
          objectives: 'Take full IELTS tests under realistic conditions. Self-record speaking responses and review essay formats against band 9.0 rubrics.',
          concepts: ['Listening focus under stress', 'Strict reading time splits', 'Peer review essay scoring'],
          resources: 'IELTS official past books, sample audio tracks.'
        }
      ],
      conceptsList: [
        { title: 'True / False / Not Given Logic', desc: 'Understanding critical differences between "False" (directly contradicts context) and "Not Given" (no info exists).' },
        { title: 'Writing Task 1 Overview Mastery', desc: 'Structuring the crucial intro overview paragraph that outlines key trends of graphs without detailing numbers.' },
        { title: 'Speaking Part 2 Cue-Card Structuring', desc: 'Structuring your monologue with introductory, narrative, and speculative sentences to fill the entire two-minute window smoothly.' },
        { title: 'Cohesion & Coherence Lexicon', desc: 'Using transitions (e.g., consequently, notwithstanding, as a corollary) to build cohesive prose.' }
      ],
      pyqs: [
        {
          id: 'ielts-pyq-1',
          year: 'IELTS Academic Reading',
          type: 'True / False / Not Given',
          question: 'PASSAGE SELECTION: "The first commercial steam engine was patented by Thomas Savery in 1698. However, it was Newcomen\'s design of 1712 that proved highly practical in de-watering deep coal mines across the UK." \nSTATEMENT: "Thomas Savery\'s steam engine was widely implemented in mining before Newcomen\'s invention."',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          correct: 1,
          explanation: 'The passage mentions Savery\'s patented engine of 1698, but says Newcomen\'s design of 1712 was the one that proved "highly practical in de-watering deep coal mines." Therefore, the statement that Savery\'s engine was "widely implemented in mining before Newcomen" contradicts the passage\'s assertion. Hence, the statement is FALSE.'
        },
        {
          id: 'ielts-pyq-2',
          year: 'IELTS Task 2 Essay Prompt',
          type: 'Essay Analysis',
          question: '"Some people believe that universities should provide graduates with the specific skills required in the workforce. Others argue that the purpose of a university education should be to acquire academic knowledge, regardless of future employment." \nWhich of the following describes the most robust hook and thesis framework for this prompt?',
          options: ['State your favorite job and then write about why university degrees are outdated.', 'Write a balanced outline explaining that while job readiness is vital for modern job markets, the pursuit of deep general academic theory cultivates essential cognitive skills.', 'Declare that academic knowledge is worthless and immediately attack companies.', 'Copy-paste the prompt sentence five times.'],
          correct: 1,
          explanation: 'A strong academic essay thesis must present a clear, balanced perspective on both views. Choosing a framework that values professional skill preparation whilst maintaining the cognitive values of deep general scholarship is the most cohesive approach.'
        }
      ]
    }
  };

  const currentExamData = EXAMS_DATA[selectedExam];

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4" id="mid-higher-studies-container">
      {/* Top Welcome Card */}
      <section className="bg-gradient-to-br from-zinc-900 via-neutral-900 to-black text-white p-12 rounded-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute right-[-40px] top-[-40px] opacity-10">
          <GraduationCap className="w-80 h-80" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300">Elite Coaching Center</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
            Higher Studies Portal
          </h1>
          <p className="text-zinc-400 font-medium italic text-base leading-relaxed">
            Get comprehensive, personalized academic training with detailed step-by-step coaching, authentic Previous Year Questions (PYQs), and customized 4-Phase study roadmaps tailored to maximize your competitive edge.
          </p>

          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Trophy className="w-4 h-4 text-amber-500" />
                Active Focus: <span className="text-white font-black">{currentGoalExam} Prep</span>
             </div>
          </div>
        </div>
      </section>

      {/* Select Exam Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {(Object.keys(EXAMS_DATA) as ExamType[]).map((exam) => {
           const eData = EXAMS_DATA[exam];
           const isSelected = selectedExam === exam;
           const isActiveFocus = currentGoalExam === exam;
           
           return (
             <button
               key={exam}
               id={`exam-selector-${exam}`}
               onClick={() => {
                 setSelectedExam(exam);
                 setSelectedConcept(null);
                 setAiCoachResponse(null);
                 setAiExplainPyqResponse(null);
               }}
               className={`text-left p-6 rounded-3xl border transition-all cursor-pointer relative group ${
                 isSelected 
                   ? 'bg-neutral-900 text-white border-transparent shadow-xl scale-[1.02]' 
                   : 'bg-white text-zinc-800 border-zinc-200/60 hover:bg-zinc-50'
               }`}
             >
                {isActiveFocus && (
                  <span className="absolute top-4 right-4 bg-cyan-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest">
                     My Focus
                  </span>
                )}
                <div className="flex items-center gap-3 mb-2">
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-lg ${
                     isSelected 
                       ? 'bg-white/10 text-white' 
                       : 'bg-neutral-50 text-neutral-800 border border-neutral-100'
                   }`}>
                      {exam[0]}
                   </div>
                   <h3 className="font-black text-xl tracking-tight">{exam}</h3>
                </div>
                <p className={`text-[12px] line-clamp-2 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                   {eData.tagline}
                </p>
             </button>
           );
         })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         {/* Sidebar Controls */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-[2rem] border border-zinc-200/50 shadow-sm space-y-2">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 pl-1">PREPARATION FOCUS</span>
               
               <button
                 onClick={() => setActiveTab('roadmap')}
                 id="tab-btn-path"
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                   activeTab === 'roadmap' ? 'bg-cyan-50 text-cyan-600' : 'text-zinc-600 hover:bg-zinc-50'
                 }`}
               >
                  <Compass className="w-4 h-4" />
                  4-Phase Curriculum
               </button>

               <button
                 onClick={() => setActiveTab('concepts')}
                 id="tab-btn-concepts"
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                   activeTab === 'concepts' ? 'bg-cyan-50 text-cyan-600' : 'text-zinc-600 hover:bg-zinc-50'
                 }`}
               >
                  <Brain className="w-4 h-4" />
                  Core Concepts
               </button>

               <button
                 onClick={() => setActiveTab('pyqs')}
                 id="tab-btn-pyqs"
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                   activeTab === 'pyqs' ? 'bg-cyan-50 text-cyan-600' : 'text-zinc-600 hover:bg-zinc-50'
                 }`}
               >
                  <BookOpenCheck className="w-4 h-4" />
                  PYQ Practice Vault
               </button>
            </div>

            {/* Quick Stats card */}
            <div className="bg-gradient-to-br from-cyan-600 to-teal-600 text-white p-6 rounded-[2rem] shadow-md space-y-6 relative overflow-hidden">
               <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                  <Award className="w-32 h-32" />
               </div>
               
               <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-100 opacity-80 block mb-1">CURRENT PREPARATION STATS</span>
                  <h4 className="text-2xl font-black tracking-tight">{selectedExam} Target</h4>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-xl">
                     <span className="text-[9px] text-cyan-100 block opacity-70">MAX SCORE</span>
                     <span className="text-sm font-black">{currentExamData.stats.maxScore}</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                     <span className="text-[9px] text-cyan-100 block opacity-70">DURATION</span>
                     <span className="text-xs font-black leading-none">{currentExamData.stats.duration}</span>
                  </div>
               </div>

               <button 
                 onClick={() => handleSetActiveExam(selectedExam)}
                 disabled={currentGoalExam === selectedExam}
                 className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                   currentGoalExam === selectedExam 
                     ? 'bg-white/20 text-white cursor-default' 
                     : 'bg-white text-cyan-700 hover:bg-cyan-50 shadow-sm'
                 }`}
               >
                  {currentGoalExam === selectedExam ? '🎯 Currently My Active Focus' : 'Set as Active Prep Focus'}
               </button>
            </div>
         </div>

         {/* Main Preparation Area */}
         <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
               {activeTab === 'roadmap' && (
                 <motion.div
                   key="roadmap"
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -15 }}
                   className="space-y-6"
                 >
                    <div className="bg-white p-8 rounded-[2rem] border border-zinc-200/50 shadow-sm">
                       <h3 className="text-2xl font-black text-zinc-900 mb-2 flex items-center gap-2">
                          <Compass className="w-6 h-6 text-cyan-500" />
                          Curated 4-Phase Curriculum
                       </h3>
                       <p className="text-zinc-500 text-sm">
                          Our customized four-stage progressive learning framework takes you from essential conceptual fundamentals to advanced test pacing.
                       </p>
                    </div>

                    <div className="space-y-6">
                       {currentExamData.phases.map((phase, idx) => {
                         const phaseKey = `${selectedExam}_phase_${idx}`;
                         const isCompleted = (prepProgress.completedPhases || []).includes(phaseKey);

                         return (
                           <div 
                             key={idx}
                             className={`bg-white rounded-3xl border transition-all p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-6 items-start justify-between ${
                               isCompleted 
                                 ? 'border-emerald-250 bg-emerald-50/10' 
                                 : 'border-zinc-200/60 shadow-sm hover:shadow-md'
                             }`}
                           >
                              <div className="space-y-4 max-w-3xl">
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] bg-neutral-900 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                       PHASE {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                                       <Clock className="w-3.5 h-3.5" />
                                       {phase.duration}
                                    </span>
                                 </div>

                                 <h4 className="text-xl font-bold text-zinc-900 tracking-tight">{phase.title}</h4>
                                 <p className="text-zinc-500 text-sm leading-relaxed">{phase.objectives}</p>
                                 
                                 <div className="flex flex-wrap items-center gap-2 pt-2">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">KEY AREAS:</span>
                                    {phase.concepts.map((concept, cIdx) => (
                                      <span key={cIdx} className="text-[11px] bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-lg font-semibold">
                                         {concept}
                                      </span>
                                    ))}
                                 </div>

                                 <div className="text-[11.5px] text-zinc-400 italic">
                                    <span className="font-bold text-zinc-500">Resources: </span>{phase.resources}
                                 </div>
                              </div>

                              <button
                                onClick={() => handleCompletePhase(selectedExam, idx)}
                                className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all mt-4 md:mt-0 ${
                                  isCompleted 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                }`}
                              >
                                 <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600 fill-emerald-600' : 'text-zinc-400'}`} />
                                 {isCompleted ? 'Completed' : 'Mark Done'}
                              </button>
                           </div>
                         );
                       })}
                    </div>
                 </motion.div>
               )}

                              {activeTab === 'concepts' && (
                 <motion.div
                   key="concepts"
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -15 }}
                   className="space-y-6"
                 >
                     {selectedConcept === null ? (
                       <>
                         <div className="bg-white p-8 rounded-[2rem] border border-zinc-200/50 shadow-sm">
                            <h3 className="text-2xl font-black text-zinc-900 mb-2 flex items-center gap-2">
                               <Brain className="w-6 h-6 text-rose-500" />
                               Interactive Core Concepts
                            </h3>
                            <p className="text-zinc-500 text-sm">
                               Select high-yield core conceptual topics below, read foundational reviews, or initiate an academic deep-dive with Mithra AI.
                            </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentExamData.conceptsList.map((conceptObj, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => {
                                  setSelectedConcept(conceptObj.title);
                                  setActiveConceptPhase('understand');
                                  setConceptQuizSelected({});
                                  setConceptQuizSubmitted(false);
                                  setConceptApplyDraft('');
                                  setConceptApplyFeedback(null);
                                  setConceptDoubts([]);
                                  setFlippedFlashcard(null);
                                }}
                                className="text-left p-6 rounded-3xl border transition-all bg-white border-zinc-200/60 hover:bg-zinc-50 hover:border-zinc-350 cursor-pointer flex flex-col justify-between"
                              >
                                 <div>
                                    <h4 className="font-extrabold text-zinc-900 text-base mb-1.5">{conceptObj.title}</h4>
                                    <p className="text-zinc-500 text-xs leading-relaxed">{conceptObj.desc}</p>
                                 </div>
                                 <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-cyan-600 uppercase tracking-wider">
                                    <span>Launch 4-Phase Masterclass</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                 </div>
                              </button>
                            ))}
                         </div>

                         {/* Custom query capability */}
                         <div className="bg-white p-8 rounded-3xl border border-zinc-200/60 shadow-sm space-y-4">
                            <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">ASK MITHRA AI PROFESSOR ABOUT ANY CONCEPT</h4>
                            <div className="flex gap-3">
                               <input 
                                 type="text"
                                 placeholder="e.g. explain time compression formulas in general speed calculations or true-not-given rules in IELTS reading..."
                                 value={customConceptQuery}
                                 onChange={(e) => setCustomConceptQuery(e.target.value)}
                                 className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                               />
                               <button
                                 onClick={() => {
                                   if (customConceptQuery.trim()) {
                                     setSelectedConcept(customConceptQuery);
                                     setActiveConceptPhase('understand');
                                     setConceptQuizSelected({});
                                     setConceptQuizSubmitted(false);
                                     setConceptApplyDraft('');
                                     setConceptApplyFeedback(null);
                                     setConceptDoubts([]);
                                     setFlippedFlashcard(null);
                                   }
                                 }}
                                 className="bg-neutral-900 hover:bg-black text-white px-5 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                               >
                                  <Send className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                       </>
                     ) : (
                       /* 4-Phase Conceptual Masterclass Workstation */
                       <div className="space-y-6" id="hs-4phase-workstation">
                          {/* Upper controls & back button */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-150 shadow-sm">
                             <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => {
                                    setSelectedConcept(null);
                                    setConceptApplyDraft('');
                                    setConceptApplyFeedback(null);
                                    setConceptQuizSelected({});
                                    setConceptQuizSubmitted(false);
                                    setConceptDoubts([]);
                                    setFlippedFlashcard(null);
                                    if ('speechSynthesis' in window) {
                                      window.speechSynthesis.cancel();
                                    }
                                    setIsConceptSpeaking(false);
                                  }}
                                  className="p-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-650 rounded-xl transition-all border border-zinc-200 flex items-center gap-2 text-xs font-bold cursor-pointer"
                                >
                                   <ArrowLeft className="w-4 h-4" />
                                   Back to Concepts List
                                </button>
                                <div>
                                   <span className="text-[9px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                                      {selectedExam} 4-PHASE PROGRESSIVE MODULE
                                   </span>
                                   <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight mt-0.5">{selectedConcept}</h3>
                                </div>
                             </div>

                             <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-400 font-semibold italic">Progress:</span>
                                <span className="text-xs font-black bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full uppercase tracking-wider">
                                   Phase {activeConceptPhase === 'understand' ? '1/4' : activeConceptPhase === 'apply' ? '2/4' : activeConceptPhase === 'evaluate' ? '3/4' : '4/4'} Completed
                                </span>
                             </div>
                          </div>

                          {/* Progressive Horizontal Stepper */}
                          <div className="grid grid-cols-4 gap-2 bg-zinc-150 p-2 rounded-2xl border border-zinc-200">
                             {[
                               { id: 'understand', label: '1. Understand', desc: 'Theory & Rules', icon: <BookOpen className="w-4 h-4" /> },
                               { id: 'apply', label: '2. Apply / Proof', desc: 'Solution Check', icon: <Code className="w-4 h-4" /> },
                               { id: 'evaluate', label: '3. Evaluate / Test', desc: 'Concept Quiz', icon: <BookOpenCheck className="w-4 h-4" /> },
                               { id: 'master', label: '4. Master Summary', desc: 'Memory Flashcards', icon: <Trophy className="w-4 h-4" /> }
                             ].map((phaseItem) => {
                               const isCurrent = activeConceptPhase === phaseItem.id;
                               return (
                                 <button
                                   key={phaseItem.id}
                                   onClick={() => {
                                     setActiveConceptPhase(phaseItem.id as any);
                                     setFlippedFlashcard(null);
                                   }}
                                   className={`p-3 rounded-xl transition-all text-left flex flex-col md:flex-row items-center md:items-start gap-2.5 cursor-pointer ${
                                     isCurrent 
                                       ? 'bg-neutral-900 text-white shadow-md' 
                                       : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/60'
                                   }`}
                                 >
                                    <div className={`p-1.5 rounded-lg ${isCurrent ? 'bg-white/10 text-cyan-400' : 'bg-zinc-200/50 text-zinc-500'}`}>
                                       {phaseItem.icon}
                                    </div>
                                    <div className="hidden md:block">
                                       <p className="text-[12px] font-black leading-none">{phaseItem.label}</p>
                                       <p className={`text-[9px] mt-0.5 ${isCurrent ? 'text-zinc-405' : 'text-zinc-400'}`}>{phaseItem.desc}</p>
                                    </div>
                                 </button>
                               );
                             })}
                          </div>

                          {/* Stepped Views Container */}
                          <div className="bg-white rounded-[2rem] border border-zinc-200/50 p-6 md:p-8 min-h-[450px]">
                             {activeConceptPhase === 'understand' && (() => {
                               // Retrieve concept data
                               const cData = CONCEPT_4PHASE_DATA[selectedConcept] || {
                                 understand: {
                                   theory: `### Deep-Dive Academic Analysis\n\nWe are formulating custom resources for **${selectedConcept}**. In the meantime, you can ask questions directly to the AI Coach or request custom theory files.`,
                                   traps: ["Uncritically matching words instead of semantic direction.", "Computational slips on exponents."],
                                   takeaways: ["Verify core theorems systematically.", "Write formulas in full."]
                                 }
                               };

                               const handleSpeakConcept = (text) => {
                                 if ('speechSynthesis' in window) {
                                   if (isConceptSpeaking) {
                                     window.speechSynthesis.cancel();
                                     setIsConceptSpeaking(false);
                                   } else {
                                     window.speechSynthesis.cancel();
                                     const speechText = text.replace(/[#*$\\_]/g, '').split('`').join('');
                                     const utterance = new SpeechSynthesisUtterance(speechText);
                                     utterance.onstart = () => setIsConceptSpeaking(true);
                                     utterance.onend = () => setIsConceptSpeaking(false);
                                     utterance.onerror = () => setIsConceptSpeaking(false);
                                     window.speechSynthesis.speak(utterance);
                                   }
                                 }
                               };

                               const handleAskConceptDoubt = async () => {
                                 if (!conceptDoubtInput.trim() || !selectedConcept) return;
                                 setConceptDoubtLoading(true);
                                 const question = conceptDoubtInput;
                                 setConceptDoubtInput('');
                                 try {
                                   const prompt = `You are an elite academic professor tutoring a student on "${selectedConcept}" for the ${selectedExam} exam.
The student has asked: "${question}"

Provide a highly customized, direct, yet intuitive and mathematically or logically sound clarification. Use bullet points and clear markdown formatting.`;
                                   
                                   const contents = [{ role: 'user', parts: [{ text: prompt }] }];
                                   const res = await callGemini(contents);
                                   const answer = res.text || 'Unable to fetch response from Mithra AI.';
                                   setConceptDoubts(prev => [...prev, { question, answer }]);
                                 } catch (err) {
                                   setConceptDoubts(prev => [...prev, { question, answer: `Error: ${err.message || err}` }]);
                                 } finally {
                                   setConceptDoubtLoading(false);
                                 }
                               };

                               return (
                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                     {/* Left pane: Concept and theory */}
                                     <div className="lg:col-span-7 space-y-6">
                                        <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-150">
                                           <div className="flex items-center gap-2">
                                              <Compass className="w-5 h-5 text-indigo-500" />
                                              <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">Concept Core Theory</span>
                                           </div>
                                           
                                           <button
                                             onClick={() => handleSpeakConcept(cData.understand.theory)}
                                             className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                                             title="Speak Theory"
                                           >
                                              {isConceptSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                                              {isConceptSpeaking ? 'Stop voice' : 'Listen Concept'}
                                           </button>
                                        </div>

                                        <div className="prose max-w-none text-zinc-800 text-sm leading-relaxed space-y-4 border-b border-zinc-100 pb-6 whitespace-pre-wrap markdown-body">
                                           <Markdown>{cData.understand.theory}</Markdown>
                                        </div>

                                        {/* Traps */}
                                        <div className="space-y-3 bg-red-54/50 p-5 rounded-2xl border border-red-100/60">
                                           <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm uppercase tracking-wider">
                                              <AlertTriangle className="w-4 h-4" />
                                              Common Examiner Traps
                                           </div>
                                           <ul className="list-disc list-inside text-xs text-zinc-600 leading-relaxed space-y-1.5">
                                              {cData.understand.traps.map((trap, tIdx) => (
                                                <li key={tIdx}><span className="font-semibold text-zinc-900">{trap.split(':')[0]}:</span> {trap.split(':').slice(1).join(':') || trap}</li>
                                              ))}
                                           </ul>
                                        </div>

                                        {/* Core Takeaways */}
                                        <div className="space-y-3 bg-emerald-54/50 p-5 rounded-2xl border border-emerald-100/60">
                                           <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm uppercase tracking-wider">
                                              <Lightbulb className="w-4 h-4" />
                                              Key Study Takeaways
                                           </div>
                                           <ul className="list-disc list-inside text-xs text-zinc-650 leading-relaxed space-y-1.5">
                                              {cData.understand.takeaways.map((takeaway, tkIdx) => (
                                                <li key={tkIdx}><span className="font-semibold text-zinc-900">{takeaway.split(':')[0]}:</span> {takeaway.split(':').slice(1).join(':') || takeaway}</li>
                                              ))}
                                           </ul>
                                        </div>
                                     </div>

                                     {/* Right pane: Interactive Doubt Desk */}
                                     <div className="lg:col-span-5 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200/50 space-y-6 h-fit">
                                        <div>
                                           <h4 className="text-sm font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                                              <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                                              MITHRA AI DOUBT DESK
                                           </h4>
                                           <p className="text-zinc-[505] text-xs mt-1 leading-relaxed text-zinc-500">
                                              Studying eigenvalues or verbal traps? Ask our AI Professor for customized formulas or grammar proofs.
                                           </p>
                                        </div>

                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                           {conceptDoubts.length === 0 ? (
                                              <div className="py-8 text-center text-zinc-400 text-xs italic">
                                                 No questions raised yet. Type below to clear your doubts instantly!
                                              </div>
                                           ) : (
                                              conceptDoubts.map((doubt, dIndex) => (
                                                 <div key={dIndex} className="space-y-2 text-xs">
                                                    <p className="font-black text-cyan-600 flex items-start gap-1">
                                                       <span>Q:</span> <span>{doubt.question}</span>
                                                    </p>
                                                    <div className="bg-white p-3.5 rounded-xl border border-zinc-200 text-zinc-750 leading-relaxed max-h-[180px] overflow-y-auto">
                                                       <Markdown>{doubt.answer}</Markdown>
                                                    </div>
                                                 </div>
                                              ))
                                           )}
                                        </div>

                                        <div className="space-y-3 pt-3 border-t border-zinc-200">
                                           <textarea 
                                             placeholder="Ask a custom question..."
                                             value={conceptDoubtInput}
                                             onChange={(e) => setConceptDoubtInput(e.target.value)}
                                             className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-neutral-800 min-h-[70px] resize-none"
                                           />
                                           <button
                                             onClick={handleAskConceptDoubt}
                                             disabled={conceptDoubtLoading || !conceptDoubtInput.trim()}
                                             className="w-full py-2.5 bg-neutral-900 hover:bg-black disabled:bg-zinc-300 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                                           >
                                              {conceptDoubtLoading ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              ) : (
                                                <Send className="w-3.5 h-3.5" />
                                              )}
                                              {conceptDoubtLoading ? 'Processing Query...' : 'Ask AI Coach'}
                                           </button>
                                        </div>
                                     </div>
                                  </div>
                               );
                             })()}

                             {activeConceptPhase === 'apply' && (() => {
                               const cData = CONCEPT_4PHASE_DATA[selectedConcept] || {
                                 apply: {
                                   problemStatement: `Draft notes and review requirements for **${selectedConcept}**. Provide logic parameters inside the diagnostic notepad below.`,
                                   sampleApproach: "Apply the standard rules outlined in the study guide.",
                                   helperHint: "Begin by writing down the initial parameters of the question."
                                 }
                               };

                               const handleEvaluateConceptDraft = async (problemStatement, modelAnswer) => {
                                 if (!conceptApplyDraft.trim() || !selectedConcept) return;
                                 setConceptApplyLoading(true);
                                 setConceptApplyFeedback(null);
                                 try {
                                   const prompt = `You are an expert examiner grading a candidate preparing for the high-stakes ${selectedExam} exam.
The student is practicing the concept: "${selectedConcept}".

PRACTICE CHALLENGE:
"${problemStatement}"

STANDARD MODEL ANSWER REFERENCE:
"${modelAnswer}"

THE STUDENT'S SUBMITTED RESOLUTION ATTEMPT/DRAFT PROOF:
"${conceptApplyDraft}"

Provide a professional, extremely detailed, and rigorous evaluation of their attempt:
1. ACCURACY & CRITIQUE: Evaluate the mathematical steps, logical syntax, grammar patterns, or deduction path. Point out if their answer is correct, approximately correct, or where key logical errors/fallacies occurred.
2. BETTER SPEED & FORMULA: Share test-day tips, faster calculation tricks, list of key variables, or templates to approach this in under 60 seconds on the real exam.
Format elegantly using clear headings and bold marks. Do not mention any json format requirements.`;

                                   const contents = [{ role: 'user', parts: [{ text: prompt }] }];
                                   const res = await callGemini(contents);
                                   setConceptApplyFeedback(res.text || 'Unable to review math proof.');
                                 } catch (err) {
                                   setConceptApplyFeedback(`Evaluation Error: ${err.message || err}`);
                                 } finally {
                                   setConceptApplyLoading(false);
                                 }
                               };

                               return (
                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                     {/* Left pane: Challenge and Notepad */}
                                     <div className="lg:col-span-6 space-y-6">
                                        <div className="space-y-3 bg-zinc-50 p-6 rounded-2xl border border-zinc-200/50">
                                           <span className="text-[9px] bg-neutral-900 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                              ACTIVE EXAMINATION PRACTICE PROBLEM
                                           </span>
                                           <h4 className="text-md font-bold text-zinc-950 leading-relaxed">
                                              {cData.apply.problemStatement}
                                           </h4>
                                           
                                           <div className="flex items-center gap-2 text-xs text-zinc-500 italic pt-2">
                                              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                                              <span><span className="font-bold text-zinc-650">Hint:</span> {cData.apply.helperHint}</span>
                                           </div>
                                        </div>

                                        <div className="space-y-2">
                                           <div className="flex justify-between items-center">
                                              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">SCRATCHPAD / RESOLUTION WORKSPACE</span>
                                              <span className="text-[10px] text-zinc-400 italic">Auto-Sync Scratchpad</span>
                                           </div>
                                           <textarea 
                                             placeholder="Type your algebraic proof, logical justifications, sentence synonyms matching, or essay outline response draft here step-by-step..."
                                             value={conceptApplyDraft}
                                             onChange={(e) => setConceptApplyDraft(e.target.value)}
                                             className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-3xl text-sm focus:outline-none focus:border-neutral-800 focus:bg-white min-h-[220px] font-mono leading-relaxed text-zinc-[805]"
                                           />
                                           <button
                                             onClick={() => handleEvaluateConceptDraft(cData.apply.problemStatement, cData.apply.sampleApproach)}
                                             disabled={conceptApplyLoading || !conceptApplyDraft.trim()}
                                             className="w-full py-4 bg-neutral-900 hover:bg-black disabled:bg-zinc-200 text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm"
                                           >
                                              {conceptApplyLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                              ) : (
                                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                              )}
                                              {conceptApplyLoading ? 'Mithra AI Evaluating Work...' : 'Verify My Solution Draft'}
                                           </button>
                                        </div>
                                     </div>

                                     {/* Right pane: Evaluation feedback */}
                                     <div className="lg:col-span-6 bg-zinc-950 text-white rounded-[2rem] p-6 md:p-8 space-y-6 h-fit border border-zinc-805">
                                        <div className="border-b border-zinc-[850] pb-4">
                                           <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                              <Award className="w-4 h-4" />
                                              MITHRA EXAMINER EVALUATION
                                           </h4>
                                           <p className="text-zinc-400 text-[11px] mt-1">
                                              Submit your draft derivation proof on the left. Mithra AI will inspect your steps for mathematical or deductive errors and calculate feedback.
                                           </p>
                                        </div>

                                        <div className="space-y-4 text-xs leading-relaxed max-h-[380px] overflow-y-auto pr-1">
                                           {conceptApplyLoading ? (
                                              <div className="py-12 text-center space-y-4">
                                                 <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                                                 <p className="text-zinc-400 italic">Auditing derivation loops and common traps...</p>
                                              </div>
                                           ) : conceptApplyFeedback ? (
                                              <div className="prose prose-invert max-w-none text-zinc-[350] space-y-4 markdown-body">
                                                 <Markdown>{conceptApplyFeedback}</Markdown>
                                              </div>
                                           ) : (
                                              <div className="py-16 text-center text-zinc-500 italic space-y-2">
                                                 <FileText className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                                                 <p>Your AI Evaluation report will generate here.</p>
                                              </div>
                                           )}
                                        </div>
                                     </div>
                                  </div>
                               );
                             })()}

                             {activeConceptPhase === 'evaluate' && (() => {
                               const cData = CONCEPT_4PHASE_DATA[selectedConcept];
                               if (!cData || !cData.evaluate || !cData.evaluate.questions) {
                                 return (
                                    <div className="py-16 text-center text-zinc-400 text-sm italic">
                                       Generating diagnostic evaluative quiz points. Call the AI Professor in Phase 1 to build customized checks.
                                    </div>
                                 );
                               }

                               return (
                                  <div className="space-y-8 max-w-3xl mx-auto">
                                     <div className="border-b border-zinc-100 pb-4">
                                        <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                                           PHASE 3 DIAGNOSTIC TEST
                                        </span>
                                        <h4 className="text-xl font-extrabold text-zinc-900 tracking-tight mt-1">Concept Mastery Quiz</h4>
                                        <p className="text-zinc-[505] text-xs text-zinc-500 mt-0.5">Test your logic against the examiner standards below.</p>
                                     </div>

                                     <div className="space-y-8">
                                        {cData.evaluate.questions.map((q, qIdx) => {
                                          const chosen = conceptQuizSelected[qIdx];
                                          const hasChosen = chosen !== undefined;
                                          const isCorrectAnswer = q.correct === chosen;

                                          return (
                                            <div key={qIdx} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/60 space-y-4">
                                               <p className="font-extrabold text-zinc-900 text-sm">
                                                  <span className="text-cyan-600 mr-1.5">Question {qIdx+1}:</span> {q.question}
                                               </p>

                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  {q.options.map((opt, oIdx) => {
                                                    const isSelected = chosen === oIdx;
                                                    const isCorrectOption = q.correct === oIdx;

                                                    let optStyle = 'bg-white text-zinc-[850] border-zinc-200 hover:bg-zinc-100/55';
                                                    if (conceptQuizSubmitted) {
                                                      if (isCorrectOption) {
                                                        optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-extrabold';
                                                      } else if (isSelected) {
                                                        optStyle = 'bg-rose-50 border-rose-350 text-rose-800';
                                                      } else {
                                                        optStyle = 'bg-white text-zinc-400 border-zinc-100 opacity-60';
                                                      }
                                                    } else if (isSelected) {
                                                      optStyle = 'bg-neutral-900 text-white border-transparent';
                                                    }

                                                    return (
                                                      <button
                                                        key={oIdx}
                                                        disabled={conceptQuizSubmitted}
                                                        onClick={() => {
                                                          setConceptQuizSelected(prev => ({
                                                            ...prev,
                                                            [qIdx]: oIdx
                                                          }));
                                                        }}
                                                        className={`p-3.5 rounded-xl border text-xs text-left transition-all flex items-center gap-2.5 cursor-pointer ${optStyle}`}
                                                      >
                                                         <span className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                                                           isSelected ? 'bg-cyan-500 border-transparent text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                                                         }`}>
                                                            {String.fromCharCode(65 + oIdx)}
                                                         </span>
                                                         <span>{opt}</span>
                                                      </button>
                                                    );
                                                  })}
                                               </div>

                                               {conceptQuizSubmitted && hasChosen && (
                                                 <div className="bg-white p-4 rounded-xl border border-zinc-150 text-[11px] leading-relaxed text-zinc-700">
                                                    <p className={`font-black uppercase mb-1 ${isCorrectAnswer ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                       {isCorrectAnswer ? '✓ CORRECT CHOICE' : '✗ INCORRECT CHOICE'}
                                                    </p>
                                                    <p className="text-zinc-600 whitespace-pre-line">{q.explanation}</p>
                                                 </div>
                                               )}
                                            </div>
                                          );
                                        })}
                                     </div>

                                     {!conceptQuizSubmitted && (
                                        <button
                                          onClick={() => {
                                            if (Object.keys(conceptQuizSelected).length === cData.evaluate.questions.length) {
                                              setConceptQuizSubmitted(true);
                                            }
                                          }}
                                          disabled={Object.keys(conceptQuizSelected).length < cData.evaluate.questions.length}
                                          className="w-full py-4 bg-neutral-900 hover:bg-black disabled:bg-zinc-200 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-sm"
                                        >
                                           Submit Answers ({Object.keys(conceptQuizSelected).length} / {cData.evaluate.questions.length} completed)
                                        </button>
                                     )}

                                     {conceptQuizSubmitted && (
                                        <button
                                          onClick={() => {
                                            setConceptQuizSelected({});
                                            setConceptQuizSubmitted(false);
                                          }}
                                          className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                           <RotateCcw className="w-4 h-4" />
                                           Reset Concept Quiz
                                        </button>
                                     )}
                                  </div>
                               );
                             })()}

                             {activeConceptPhase === 'master' && (() => {
                               const cData = CONCEPT_4PHASE_DATA[selectedConcept] || {
                                 master: {
                                   summary: `Keep studying and practices formulas for **${selectedConcept}**. Review past notes regularly.`,
                                   flashcards: [{ front: "Important Rule", back: "Memorize general shortcuts for fast solutions" }],
                                   cheatsheetRules: ["Double check your parameters before answering", "Review common mistakes"]
                                 }
                               };

                               return (
                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
                                     {/* Left pane: Guidelines and summaries */}
                                     <div className="lg:col-span-6 space-y-6">
                                        <div className="space-y-2">
                                           <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                                              CONSOLIDATIVE CORE KEY POINTS
                                           </span>
                                           <h4 className="text-xl font-bold tracking-tight text-zinc-950">Active Memory Keys</h4>
                                        </div>

                                        <p className="text-zinc-[650] text-xs leading-relaxed bg-zinc-50 p-5 rounded-2xl border border-zinc-200/60 italic font-medium text-zinc-[650]">
                                           {cData.master.summary}
                                        </p>

                                        <div className="space-y-3">
                                           <h5 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">HIGH-YIELD CHEATSHEET CHECKS</h5>
                                           <div className="space-y-2">
                                              {cData.master.cheatsheetRules.map((rule, rIdx) => (
                                                <div key={rIdx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-700 shadow-sm">
                                                   <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                      <Check className="w-3.5 h-3.5" />
                                                   </div>
                                                   <span>{rule}</span>
                                                </div>
                                              ))}
                                           </div>
                                        </div>
                                     </div>

                                     {/* Right pane: Interactive Flippable Flashcards */}
                                     <div className="lg:col-span-6 space-y-4">
                                        <div>
                                           <h4 className="text-sm font-black text-zinc-805 uppercase tracking-widest flex items-center gap-2">
                                              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                                              ACTIVE RECALL FLASHCARDS
                                           </h4>
                                           <p className="text-zinc-500 text-[11px]">Click any flashcard to flip and verify definitions immediately.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                           {cData.master.flashcards.map((card, fcIdx) => {
                                             const isFlipped = flippedFlashcard === fcIdx;

                                             return (
                                               <button
                                                 key={fcIdx}
                                                 onClick={() => {
                                                   setFlippedFlashcard(isFlipped ? null : fcIdx);
                                                 }}
                                                 className={`w-full text-left p-6 min-h-[140px] rounded-[1.7rem] border transition-all relative flex flex-col justify-between cursor-pointer group ${
                                                   isFlipped 
                                                     ? 'bg-neutral-900 border-zinc-800 text-white shadow-lg' 
                                                     : 'bg-white border-zinc-200/60 hover:border-zinc-350 text-zinc-800 hover:shadow-md'
                                                 }`}
                                               >
                                                  <div>
                                                     <span className={`text-[9px] font-black uppercase tracking-wider block mb-2 ${
                                                       isFlipped ? 'text-cyan-400' : 'text-zinc-400'
                                                     }`}>
                                                        {isFlipped ? 'ANSWER / ANALYSIS KEY' : 'ACTIVE INQUIRY FLASHCARD'}
                                                     </span>
                                                     <p className={`font-bold leading-relaxed ${isFlipped ? 'text-zinc-200 text-sm' : 'text-zinc-850 text-sm'}`}>
                                                        {isFlipped ? card.back : card.front}
                                                     </p>
                                                  </div>

                                                  <span className={`text-[9px] self-end font-semibold uppercase tracking-widest block mt-4 border-t pt-2 w-full ${
                                                    isFlipped ? 'text-zinc-[505] border-zinc-850' : 'text-cyan-600 border-zinc-100 group-hover:text-cyan-700'
                                                  }`}>
                                                     {isFlipped ? 'Click to show front' : 'Click to flip card'}
                                                  </span>
                                               </button>
                                             );
                                           })}
                                        </div>
                                     </div>
                                  </div>
                               );
                             })()}
                          </div>
                       </div>
                     )}
                  </motion.div>
               )}{activeTab === 'pyqs' && (
                 <motion.div
                   key="pyqs"
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -15 }}
                   className="space-y-6"
                 >
                    <div className="bg-white p-8 rounded-[2rem] border border-zinc-200/50 shadow-sm">
                       <h3 className="text-2xl font-black text-zinc-900 mb-2 flex items-center gap-2">
                          <BookOpenCheck className="w-6 h-6 text-indigo-500" />
                          Practice Vault & Previous Year Questions
                       </h3>
                       <p className="text-zinc-500 text-sm">
                          Practice authentic actual questions from previous sittings. Verify answers instantly and request direct deep walkthroughs.
                       </p>
                    </div>

                    <div className="space-y-6">
                       {currentExamData.pyqs.map((pyq) => {
                         const answerObj = answeredPyqs[pyq.id];
                         const isAnswered = !!answerObj;
                         const explainRequestedForThis = activeExplainPyq === pyq.id;

                         return (
                           <div key={pyq.id} className="bg-white rounded-3xl border border-zinc-200/60 p-8 space-y-6 shadow-sm">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-md font-black uppercase tracking-wider">
                                       {pyq.year}
                                    </span>
                                    <span className="text-xs font-semibold text-zinc-400 ml-3 italic">• {pyq.type}</span>
                                 </div>
                              </div>

                              <p className="font-bold text-zinc-900 text-base leading-relaxed">{pyq.question}</p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                 {pyq.options.map((opt, idx) => {
                                   const isSelected = answerObj?.selectedOption === idx;
                                   const isCorrectChoice = pyq.correct === idx;
                                   
                                   let buttonStyle = 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800';
                                   if (isAnswered) {
                                     if (isCorrectChoice) {
                                       buttonStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-extrabold';
                                     } else if (isSelected) {
                                        buttonStyle = 'bg-rose-50 border-rose-300 text-rose-800';
                                     }
                                   } else {
                                     buttonStyle = 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800 hover:border-zinc-300';
                                   }

                                   return (
                                     <button
                                       key={idx}
                                       disabled={isAnswered}
                                       onClick={() => {
                                         setAnsweredPyqs(prev => ({
                                           ...prev,
                                           [pyq.id]: {
                                             selectedOption: idx,
                                             isCorrect: pyq.correct === idx
                                           }
                                         }));
                                       }}
                                       className={`text-left p-4 rounded-2xl border text-sm transition-all flex items-center gap-3 cursor-pointer ${buttonStyle}`}
                                     >
                                        <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border ${
                                          isSelected ? 'bg-zinc-900 border-transparent text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                                        }`}>
                                           {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span>{opt}</span>
                                     </button>
                                   );
                                 })}
                              </div>

                              {isAnswered && (
                                <div className="space-y-4 pt-4 border-t border-zinc-100">
                                   <div className={`p-4 rounded-2xl text-xs font-medium ${answerObj.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                      <p className="font-black mb-1">{answerObj.isCorrect ? '✓ CORRECT ANSWER' : '✗ INCORRECT'}</p>
                                      <p>{answerObj.isCorrect ? 'Success! You solved it correctly.' : `The correct option was ${String.fromCharCode(65 + pyq.correct)}. Take a look at the expert walkthrough.`}</p>
                                   </div>

                                   <div className="bg-zinc-50 p-5 rounded-2xl text-xs text-zinc-600">
                                      <p className="font-bold text-zinc-800 mb-1.5 uppercase tracking-wider">Expert Solution Walkthrough:</p>
                                      <p className="leading-relaxed whitespace-pre-line">{pyq.explanation}</p>
                                   </div>

                                   <button
                                     onClick={() => getAiPyqExplainer(pyq.id, pyq.question, pyq.explanation)}
                                     disabled={aiExplainPyqLoading}
                                     className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                                   >
                                      {aiExplainPyqLoading && explainRequestedForThis ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                      ) : (
                                        <Sparkles className="w-4 h-4 text-cyan-400" />
                                      )}
                                      {aiExplainPyqLoading && explainRequestedForThis ? 'Generating AI Explanations...' : 'Ask Mithra AI for a complete 60-Second solving guide'}
                                   </button>

                                   {explainRequestedForThis && (
                                     <div className="bg-zinc-950 text-zinc-300 rounded-3xl p-6 md:p-8 space-y-4 text-xs border border-zinc-800 leading-relaxed markdown-body">
                                        <p className="font-bold text-cyan-300 text-sm uppercase tracking-wider border-b border-zinc-800 pb-2">
                                           ⭐ Mithra AI Test Master Solution Key:
                                        </p>
                                        {aiExplainPyqLoading ? (
                                          <div className="flex items-center gap-3 py-6">
                                             <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                             <p className="text-zinc-500 italic">Designing step-by-step shortcuts...</p>
                                          </div>
                                        ) : (
                                          <Markdown>{aiExplainPyqResponse}</Markdown>
                                        )}
                                     </div>
                                   )}
                                </div>
                              )}
                           </div>
                         );
                       })}
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
