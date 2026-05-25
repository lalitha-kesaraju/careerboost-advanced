import React, { useState, useCallback } from 'react';
import { Code2, Play, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Trophy, Clock, ArrowLeft, Terminal } from 'lucide-react';

interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
  hint: string;
  topic: string;
}

const PROBLEMS: CodingProblem[] = [
  {
    id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', company: 'Amazon', topic: 'Arrays',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution and you may not use the same element twice.',
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }, { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists'],
    starterCode: `function twoSum(nums, target) {\n  // Your code here\n  \n}\n\n// Test\nconsole.log(JSON.stringify(twoSum([2,7,11,15], 9)));\nconsole.log(JSON.stringify(twoSum([3,2,4], 6)));`,
    testCases: [{ input: '[2,7,11,15], 9', expectedOutput: '[0,1]' }, { input: '[3,2,4], 6', expectedOutput: '[1,2]' }],
    hint: 'Use a hash map to store seen values and their indices.',
  },
  {
    id: 'valid-parens', title: 'Valid Parentheses', difficulty: 'Easy', company: 'Google', topic: 'Stack',
    description: 'Given a string `s` containing just characters `(`, `)`, `{`, `}`, `[`, `]`, determine if the input string is valid. An input string is valid if open brackets are closed by the same type and in the correct order.',
    examples: [{ input: 's = "()"', output: 'true' }, { input: 's = "()[]{}"', output: 'true' }, { input: 's = "(]"', output: 'false' }],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only'],
    starterCode: `function isValid(s) {\n  // Your code here\n  \n}\n\nconsole.log(isValid("()"));\nconsole.log(isValid("()[]{}}"));\nconsole.log(isValid("(]"));`,
    testCases: [{ input: '"()"', expectedOutput: 'true' }, { input: '"(]"', expectedOutput: 'false' }],
    hint: 'Use a stack. Push open brackets, pop and check when you see close brackets.',
  },
  {
    id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', company: 'Microsoft', topic: 'Linked List',
    description: 'Given the head of a singly linked list, reverse the list and return the reversed list. Implement using the provided Node class.',
    examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }, { input: 'head = [1,2]', output: '[2,1]' }],
    constraints: ['0 ≤ number of nodes ≤ 5000', '-5000 ≤ Node.val ≤ 5000'],
    starterCode: `class ListNode { constructor(val, next = null) { this.val = val; this.next = next; }}\n\nfunction reverseList(head) {\n  // Your code here\n  \n}\n\n// Helper to build list\nconst buildList = arr => arr.reduceRight((acc, v) => new ListNode(v, acc), null);\nconst toArray = h => { const r = []; while(h) { r.push(h.val); h = h.next; } return r; };\n\nconsole.log(JSON.stringify(toArray(reverseList(buildList([1,2,3,4,5])))));\nconsole.log(JSON.stringify(toArray(reverseList(buildList([1,2])))));`,
    testCases: [{ input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' }],
    hint: 'Iterate with prev/curr pointers. At each step: next = curr.next, curr.next = prev, prev = curr, curr = next.',
  },
  {
    id: 'max-subarray', title: 'Maximum Subarray', difficulty: 'Medium', company: 'Amazon', topic: 'Dynamic Programming',
    description: 'Given an integer array `nums`, find the subarray with the largest sum and return its sum. (Kadane\'s Algorithm)',
    examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has largest sum = 6' }],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    starterCode: `function maxSubArray(nums) {\n  // Your code here\n  \n}\n\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));\nconsole.log(maxSubArray([1]));\nconsole.log(maxSubArray([5,4,-1,7,8]));`,
    testCases: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' }, { input: '[5,4,-1,7,8]', expectedOutput: '23' }],
    hint: "Keep a running sum. If it drops below 0, reset it. Track the maximum.",
  },
  {
    id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', company: 'Apple', topic: 'Dynamic Programming',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. How many distinct ways can you climb to the top?',
    examples: [{ input: 'n = 2', output: '2', explanation: '1+1, 2' }, { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' }],
    constraints: ['1 ≤ n ≤ 45'],
    starterCode: `function climbStairs(n) {\n  // Your code here\n  \n}\n\nconsole.log(climbStairs(2));\nconsole.log(climbStairs(3));\nconsole.log(climbStairs(10));`,
    testCases: [{ input: '2', expectedOutput: '2' }, { input: '3', expectedOutput: '3' }],
    hint: 'This is essentially Fibonacci. f(n) = f(n-1) + f(n-2).',
  },
  {
    id: 'binary-search', title: 'Binary Search', difficulty: 'Easy', company: 'Google', topic: 'Binary Search',
    description: 'Given an array of integers `nums` sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. Return the index if found, otherwise return -1.',
    examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }, { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }],
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'nums is sorted ascending', 'All integers are unique'],
    starterCode: `function search(nums, target) {\n  // Your code here\n  \n}\n\nconsole.log(search([-1,0,3,5,9,12], 9));\nconsole.log(search([-1,0,3,5,9,12], 2));`,
    testCases: [{ input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' }, { input: '[-1,0,3,5,9,12], 2', expectedOutput: '-1' }],
    hint: 'Use left/right pointers. mid = Math.floor((left+right)/2). Compare and shrink window.',
  },
  {
    id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', company: 'Meta', topic: 'Arrays',
    description: 'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals and return an array of non-overlapping intervals.',
    examples: [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }],
    constraints: ['1 ≤ intervals.length ≤ 10⁴', 'intervals[i].length == 2'],
    starterCode: `function merge(intervals) {\n  // Your code here\n  \n}\n\nconsole.log(JSON.stringify(merge([[1,3],[2,6],[8,10],[15,18]])));\nconsole.log(JSON.stringify(merge([[1,4],[4,5]])));`,
    testCases: [{ input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' }],
    hint: 'Sort by start time. Iterate and merge if current start ≤ previous end.',
  },
  {
    id: 'lru-cache', title: 'LRU Cache', difficulty: 'Medium', company: 'Amazon', topic: 'Design',
    description: 'Design a data structure that follows the Least Recently Used (LRU) cache constraints. Implement `get(key)` and `put(key, value)` in O(1) time.',
    examples: [{ input: 'capacity=2, put(1,1), put(2,2), get(1)=1, put(3,3), get(2)=-1', output: 'Cache evicts key 2 when full' }],
    constraints: ['1 ≤ capacity ≤ 3000', '0 ≤ key ≤ 10⁴'],
    starterCode: `class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n  get(key) {\n    // return value or -1\n  }\n  put(key, value) {\n    // insert/update\n  }\n}\n\nconst c = new LRUCache(2);\nc.put(1,1); c.put(2,2);\nconsole.log(c.get(1)); // 1\nc.put(3,3);\nconsole.log(c.get(2)); // -1 (evicted)\nconsole.log(c.get(3)); // 3`,
    testCases: [{ input: 'LRU capacity=2', expectedOutput: '1\n-1\n3' }],
    hint: 'Use a Map (ordered insertion in JS) to track access order. Map.keys() gives insertion order.',
  },
  {
    id: 'word-break', title: 'Word Break', difficulty: 'Medium', company: 'Google', topic: 'Dynamic Programming',
    description: 'Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into one or more dictionary words.',
    examples: [{ input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true' }, { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true' }],
    constraints: ['1 ≤ s.length ≤ 300', '1 ≤ wordDict.length ≤ 1000'],
    starterCode: `function wordBreak(s, wordDict) {\n  // Your code here\n  \n}\n\nconsole.log(wordBreak("leetcode", ["leet","code"]));\nconsole.log(wordBreak("applepenapple", ["apple","pen"]));\nconsole.log(wordBreak("catsandog", ["cats","dog","sand","and","cat"]));`,
    testCases: [{ input: '"leetcode", ["leet","code"]', expectedOutput: 'true' }, { input: '"catsandog", ["cats","dog","sand","and","cat"]', expectedOutput: 'false' }],
    hint: 'dp[i] = true if s[0..i] can be segmented. For each i, check all j < i where dp[j] is true and s[j..i] is in dict.',
  },
  {
    id: 'find-median', title: 'Find Median from Data Stream', difficulty: 'Hard', company: 'Microsoft', topic: 'Heap',
    description: 'Implement a data structure that supports: `addNum(int num)` to add a number from the data stream to the structure, and `findMedian()` to return the median of all elements.',
    examples: [{ input: 'addNum(1), addNum(2), findMedian() = 1.5, addNum(3), findMedian() = 2.0', output: '1.5, 2.0' }],
    constraints: ['-10⁵ ≤ num ≤ 10⁵', 'At most 5 × 10⁴ calls total'],
    starterCode: `class MedianFinder {\n  constructor() {\n    this.data = [];\n  }\n  addNum(num) {\n    // insert num in sorted order (or use two heaps for O(log n))\n    const i = this.data.findIndex(x => x >= num);\n    i === -1 ? this.data.push(num) : this.data.splice(i, 0, num);\n  }\n  findMedian() {\n    // Your code here\n    \n  }\n}\n\nconst mf = new MedianFinder();\nmf.addNum(1); mf.addNum(2);\nconsole.log(mf.findMedian()); // 1.5\nmf.addNum(3);\nconsole.log(mf.findMedian()); // 2`,
    testCases: [{ input: 'addNum(1), addNum(2), findMedian()', expectedOutput: '1.5' }],
    hint: 'Use two heaps: a max-heap for the lower half and a min-heap for the upper half, keeping them balanced.',
  },
];

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

const DIFF_COLOR = { Easy: 'text-emerald-600 bg-emerald-50 border-emerald-200', Medium: 'text-amber-600 bg-amber-50 border-amber-200', Hard: 'text-rose-600 bg-rose-50 border-rose-200' };

const CodingRoundScreen: React.FC<Props> = ({ onBack, onComplete }) => {
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  React.useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const openProblem = useCallback((p: CodingProblem) => {
    setSelectedProblem(p);
    setCode(p.starterCode);
    setOutput('');
    setShowHint(false);
  }, []);

  const runCode = useCallback(() => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput('');
    setTimeout(() => {
      const logs: string[] = [];
      const origLog = console.log;
      const origErr = console.error;
      const origWarn = console.warn;
      console.log  = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      console.error = (...args) => logs.push('[ERROR] ' + args.join(' '));
      console.warn  = (...args) => logs.push('[WARN] ' + args.join(' '));
      try {
        // eslint-disable-next-line no-new-func
        new Function(code)();
        setOutput(logs.join('\n') || '(No output)');
        if (selectedProblem && logs.length > 0) {
          setSolved(prev => new Set([...prev, selectedProblem.id]));
        }
      } catch (e: any) {
        setOutput(`[ERROR] ${e.message}\n${logs.join('\n')}`);
      } finally {
        console.log  = origLog;
        console.error = origErr;
        console.warn  = origWarn;
        setIsRunning(false);
      }
    }, 50);
  }, [code, selectedProblem]);

  const filtered = PROBLEMS.filter(p => filter === 'All' || p.difficulty === filter);

  if (selectedProblem) {
    return (
      <div className="flex flex-col h-screen bg-[#0D0D0D] text-white overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedProblem(null)} className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-white text-sm">{selectedProblem.title}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${DIFF_COLOR[selectedProblem.difficulty]}`}>{selectedProblem.difficulty}</span>
            {solved.has(selectedProblem.id) && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? 'text-rose-400' : 'text-white/60'}`}>
              <Clock className="w-3.5 h-3.5 inline mr-1" />{formatTime(timeLeft)}
            </span>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-bold transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              {isRunning ? 'Running…' : 'Run'}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Problem panel */}
          <div className="w-2/5 overflow-y-auto p-5 space-y-4 border-r border-white/5 text-sm">
            <p className="text-white/80 leading-relaxed">{selectedProblem.description}</p>

            <div>
              <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">Examples</div>
              {selectedProblem.examples.map((ex, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 mb-2 font-mono text-xs space-y-1">
                  <div><span className="text-white/40">Input:</span> {ex.input}</div>
                  <div><span className="text-white/40">Output:</span> {ex.output}</div>
                  {ex.explanation && <div><span className="text-white/40">Explanation:</span> {ex.explanation}</div>}
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">Constraints</div>
              {selectedProblem.constraints.map((c, i) => (
                <div key={i} className="text-xs text-white/60 font-mono">• {c}</div>
              ))}
            </div>

            <button
              onClick={() => setShowHint(h => !h)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              {showHint ? '▼ Hide hint' : '💡 Show hint'}
            </button>
            {showHint && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                {selectedProblem.hint}
              </div>
            )}
          </div>

          {/* Editor + output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-transparent resize-none outline-none text-sm font-mono text-white/90 p-5 leading-relaxed"
              style={{ tabSize: 2 }}
              onKeyDown={e => {
                if (e.key === 'Tab') { e.preventDefault(); const s = e.currentTarget; const v = s.value; const st = s.selectionStart; s.value = v.substring(0, st) + '  ' + v.substring(s.selectionEnd); s.selectionStart = s.selectionEnd = st + 2; setCode(s.value); }
              }}
            />
            {output && (
              <div className="border-t border-white/5 bg-black/30 p-4 max-h-40 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Output</span>
                </div>
                <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Problem list
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Code2 className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Coding Round</h2>
            <p className="text-sm text-gray-500">{solved.size}/{PROBLEMS.length} solved · {formatTime(timeLeft)} remaining</p>
          </div>
        </div>
        {solved.size >= 3 && (
          <button onClick={onComplete} className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all">
            <Trophy className="w-4 h-4" />
            Finish Round
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-700 rounded-full transition-all duration-500" style={{ width: `${(solved.size / PROBLEMS.length) * 100}%` }} />
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['All', 'Easy', 'Medium', 'Hard'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === f ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => openProblem(p)}
            className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm rounded-2xl text-left transition-all group"
          >
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm shrink-0 ${solved.has(p.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              {solved.has(p.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Code2 className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-sm group-hover:text-blue-800 transition-colors">{p.title}</div>
              <div className="text-xs text-gray-500">{p.topic} · {p.company}</div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border shrink-0 ${DIFF_COLOR[p.difficulty]}`}>{p.difficulty}</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-700 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CodingRoundScreen;
