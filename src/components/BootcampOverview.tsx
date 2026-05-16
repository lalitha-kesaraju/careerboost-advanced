import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Code2, 
  CheckCircle2, 
  Trophy, 
  Play, 
  Clock, 
  Star, 
  Users, 
  Award, 
  Target,
  BarChart3,
  Bookmark,
  Share2,
  ChevronRight,
  RefreshCcw,
  BrainCircuit,
  Settings2,
  Zap
} from 'lucide-react';

interface BootcampOverviewProps {
  type: 'dsa' | 'prompt-engineering' | 'system-design' | 'full-stack' | 'mobile';
  onStart: (stepIndex: number) => void;
  progress?: any;
}

const BOOTCAMP_METADATA = {
  'dsa': {
    title: "Algorithmic Architecture",
    description: "A comprehensive 13-step journey through the foundational pillars of computer science, designed for career-pivot mastery.",
    hours: "75+",
    problems: "385",
    level: "MIT-102: ALGORITHMIC MASTERY",
    badge: "Premium Pathway",
    steps: [
      { id: 1, title: 'Arrays & Hashing', duration: '4h', difficulty: 'Easy', topics: ['Dynamic Arrays', 'Hash Maps', 'Two Pointers'], icon: <Target className="w-5 h-5" /> },
      { id: 2, title: 'Linked Lists', duration: '3h', difficulty: 'Medium', topics: ['Singly Linked List', 'Doubly Linked List', 'Fast & Slow Pointers'], icon: <Users className="w-5 h-5" /> },
      { id: 3, title: 'Trees', duration: '6h', difficulty: 'Medium', topics: ['Binary Search Tree', 'DFS', 'BFS'], icon: <Star className="w-5 h-5" /> },
      { id: 4, title: 'Graphs', duration: '8h', difficulty: 'Hard', topics: ['Dijkstra', 'Topological Sort', 'Union Find'], icon: <Trophy className="w-5 h-5" /> },
      { id: 5, title: 'Dynamic Programming', duration: '12h', difficulty: 'Hard', topics: ['Memoization', 'Tabulation', 'Knapsack'], icon: <Trophy className="w-5 h-5" /> },
      { id: 6, title: 'Sorting & Searching', duration: '5h', difficulty: 'Easy', topics: ['Quick Sort', 'Merge Sort', 'Binary Search'], icon: <BarChart3 className="w-5 h-5" /> },
      { id: 7, title: 'Stacks & Queues', duration: '3h', difficulty: 'Easy', topics: ['Monotonic Stack', 'Deque'], icon: <Bookmark className="w-5 h-5" /> },
      { id: 8, title: 'Heaps', duration: '4h', difficulty: 'Medium', topics: ['Priority Queues', 'Max Heap', 'Min Heap'], icon: <Target className="w-5 h-5" /> },
      { id: 9, title: 'Tries', duration: '3h', difficulty: 'Medium', topics: ['Prefix Tree', 'Suffix Tree'], icon: <Share2 className="w-5 h-5" /> },
      { id: 10, title: 'Backtracking', duration: '6h', difficulty: 'Medium', topics: ['Recursion', 'Pruning'], icon: <Play className="w-5 h-5" /> },
      { id: 11, title: 'Sliding Window', duration: '4h', difficulty: 'Medium', topics: ['Fixed Window', 'Variable Window'], icon: <Target className="w-5 h-5" /> },
      { id: 12, title: 'Bit Manipulation', duration: '4h', difficulty: 'Hard', topics: ['XOR', 'Masking'], icon: <Code2 className="w-5 h-5" /> },
      { id: 13, title: 'Greedy', duration: '5h', difficulty: 'Hard', topics: ['Intervals', 'Huffman Coding'], icon: <Award className="w-5 h-5" /> }
    ]
  },
  'prompt-engineering': {
    title: "AI Orchestration Elite",
    description: "Master the art of high-fidelity prompting. From zero-shot foundations to multi-agent deployment architectures with Mithra.",
    hours: "45+",
    problems: "150 Tasks",
    level: "AI-301: PROMPT ARCHITECTURE",
    badge: "Agentic Specialization",
    steps: [
      { id: 1, title: 'Foundations of LLMs', duration: '3h', difficulty: 'Easy', topics: ['Tokenization', 'Temperature', 'P-Sampling'], icon: <BrainCircuit className="w-5 h-5" /> },
      { id: 2, title: 'Zero-Shot & Few-Shot', duration: '3h', difficulty: 'Easy', topics: ['Direct Instruction', 'Role play'], icon: <Zap className="w-5 h-5" /> },
      { id: 3, title: 'Chain of Thought', duration: '4h', difficulty: 'Easy', topics: ['In-context learning', 'Example filtering'], icon: <Star className="w-5 h-5" /> },
      { id: 4, title: 'Chain of Thought', duration: '5h', difficulty: 'Medium', topics: ['Self-Correction', 'Logical Decomposition'], icon: <Settings2 className="w-5 h-5" /> },
      { id: 5, title: 'Iterative Refinement', duration: '4h', difficulty: 'Medium', topics: ['Feedback Loops', 'Prompt Versioning'], icon: <RefreshCcw className="w-5 h-5" /> },
      { id: 6, title: 'Content Extraction', duration: '4h', difficulty: 'Medium', topics: ['JSON outputs', 'Schema Enforcement'], icon: <Code2 className="w-5 h-5" /> },
      { id: 7, title: 'Context Injection', duration: '4h', difficulty: 'Medium', topics: ['RAG Basics', 'Information Retrieval'], icon: <Target className="w-5 h-5" /> },
      { id: 8, title: 'Advanced Orchestration', duration: '6h', difficulty: 'Hard', topics: ['Tool Use', 'Function Calling'], icon: <Trophy className="w-5 h-5" /> },
      { id: 9, title: 'Agentic Workflows', duration: '8h', difficulty: 'Hard', topics: ['Multi-agent debate', 'Sequential chains'], icon: <BrainCircuit className="w-5 h-5" /> },
      { id: 10, title: 'Prompt Security', duration: '4h', difficulty: 'Hard', topics: ['Injection attacks', 'Guardrails'], icon: <Award className="w-5 h-5" /> }
    ]
  },
  'system-design': {
    title: "Scalable Systems Design",
    description: "Learn to design production systems that handle millions of requests per second with high availability.",
    hours: "60+",
    problems: "45 Case Studies",
    level: "SYS-401: DISTRIBUTED SYSTEMS",
    badge: "Architect Series",
    steps: [
      { id: 1, title: 'Vertical vs Horizontal Scaling', duration: '4h', difficulty: 'Easy', topics: ['Load Balancers', 'Vertical vs Horizontal'], icon: <Settings2 className="w-5 h-5" /> },
      { id: 2, title: 'Load Balancers', duration: '6h', difficulty: 'Medium', topics: ['SQL vs NoSQL', 'Sharding', 'Replication'], icon: <Target className="w-5 h-5" /> },
      { id: 3, title: 'Relational vs NoSQL', duration: '5h', difficulty: 'Medium', topics: ['Redis', 'CDN', 'Cache Invalidation'], icon: <Zap className="w-5 h-5" /> }
    ]
  },
  'full-stack': {
    title: "Full Stack Mastery",
    description: "From database to pixel. Master the modern stack with React, Node, and advanced architecture patterns.",
    hours: "120+",
    problems: "12 Real Projects",
    level: "FS-501: SENIOR STACK ARCHITECT",
    badge: "Engineering Series",
    steps: [
      { id: 1, title: 'Frontend Fundamentals', duration: '6h', difficulty: 'Easy', topics: ['React Components', 'Hooks', 'Vite'], icon: <Zap className="w-5 h-5" /> },
      { id: 2, title: 'State Management', duration: '8h', difficulty: 'Medium', topics: ['Zustand', 'Context API', 'Server State'], icon: <Target className="w-5 h-5" /> }
    ]
  },
  'mobile': {
    title: "Mobile Architecture Elite",
    description: "Build high-performance mobile applications. Master React Native, Flutter, and Native Bridges.",
    hours: "90+",
    problems: "8 Apps",
    level: "MOB-401: MOBILE LEAD ENGINEER",
    badge: "Specialization Series",
    steps: [
      { id: 1, title: 'Cross-Platform Selection', duration: '5h', difficulty: 'Easy', topics: ['Native vs Hybrid', 'Device APIs'], icon: <Settings2 className="w-5 h-5" /> },
      { id: 2, title: 'Native Bridging', duration: '10h', difficulty: 'Hard', topics: ['SQLite', 'Sync Stratagies'], icon: <Trophy className="w-5 h-5" /> }
    ]
  }
};

export function BootcampOverview({ type, onStart, progress }: BootcampOverviewProps) {
  const meta = BOOTCAMP_METADATA[type];
  
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 bg-gray-900 text-white p-12 rounded-[3.5rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">{meta.badge}</span>
            <span className="text-gray-400 text-[10px] font-mono">{meta.level}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.1]">{meta.title}</h1>
          <p className="text-gray-400 text-lg italic serif leading-relaxed">
            {meta.description}
          </p>
          <div className="flex flex-wrap gap-6 pt-4">
             <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span className="font-bold">{meta.hours} Hours</span>
             </div>
             <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <span className="font-bold">{meta.problems}</span>
             </div>
             <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <span className="font-bold">Verified Certificate</span>
             </div>
          </div>
        </div>
        <div className="w-full md:w-80 relative z-10">
           <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mastery Level</span>
                    <span className="text-2xl font-black text-indigo-400">0%</span>
                 </div>
                 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '0%' }}
                      className="h-full bg-indigo-500"
                    />
                 </div>
              </div>
              <button 
                onClick={() => onStart(0)}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
              >
                 Begin Experience <ChevronRight className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meta.steps.map((step, idx) => (
          <motion.div 
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onStart(idx)}
            className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 grayscale group-hover:grayscale-0 group-hover:opacity-10 transition-all text-indigo-600">
               {step.icon}
            </div>
            
            <div className="relative z-10 space-y-6">
               <div className="flex justify-between items-center">
                  <span className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {step.id < 10 ? `0${step.id}` : step.id}
                  </span>
                  <div className="flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                       step.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                       step.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                     }`}>
                        {step.difficulty}
                     </span>
                  </div>
               </div>

               <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{step.title}</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{step.duration} • Curriculum Core</p>
               </div>

               <div className="flex flex-wrap gap-1.5">
                  {step.topics.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-[9px] font-bold">
                      {t}
                    </span>
                  ))}
               </div>

               <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                     <span className="text-[10px] font-black uppercase tracking-widest">Unlocking 4 Phases</span>
                     <ChevronRight className="w-3 h-3" />
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
