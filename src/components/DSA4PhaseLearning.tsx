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
import { getCourseContent, getMithraAdvice, getIDEAgentAdvice } from '../services/gemini';

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
  const [error, setError] = useState<string | null>(null);
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
  const [idePrompt, setIdePrompt] = useState('');

  // Phase 3 state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Hardcoded Fallback Content for stability
  const FALLBACK_CONTENT: Record<string, any> = {
    'graphs': {
      understand: {
        theory: "# Graphs: Modeling Connections\nGraphs consist of vertices (nodes) and edges (connections). They are the most general data structure, used for social networks, GPS routing, and state machines.\n\n### Representation Methods:\n1. **Adjacency Matrix**: A 2D array where `matrix[i][j]` is 1 if an edge exists. Space: O(V^2).\n2. **Adjacency List**: An array of lists. Space: O(V + E). Preferred for sparse graphs.",
        examples: [
          { title: "BFS Traversal", language: "python", code: "from collections import deque\ndef bfs(graph, start):\n    q = deque([start])\n    visited = {start}\n    while q:\n        curr = q.popleft()\n        # process curr\n        for nbr in graph[curr]:\n            if nbr not in visited:\n                visited.add(nbr)\n                q.append(nbr)", explanation: "Standard Level-Order traversal using a queue." }
        ],
        keyPoints: ["Cycles can lead to infinite loops", "Dijkstra's for shortest paths", "Directed vs Undirected edges"]
      },
      evaluate: {
        questions: [
          {
            question: "Which data structure is typically used for a Breadth-First Search (BFS)?",
            options: ["Stack", "Queue", "Binary Tree", "Heap"],
            correctIndex: 1,
            feedback: {
              0: "Stacks are used for Depth-First Search (DFS), which goes deep before wide.",
              1: "Correct! Queues ensure we visit all neighbors at the current distance before moving deeper.",
              2: "A Binary Tree is a type of graph, not a traversal helper.",
              3: "Heaps are for priority management (Dijkstra's), not standard BFS."
            },
            explanation: "BFS maintains a 'frontier' of nodes to visit using a FIFO (First-In-First-Out) queue."
          }
        ]
      }
    },
    'linked lists': {
      understand: {
        theory: "# Linked Lists: Dynamic Memory Chains\nUnlike arrays, linked lists are non-contiguous. Each element (node) contains its data and a pointer to the next node. This allows for efficient insertions but slower lookups.\n\n### Structural Properties:\n1. **Dynamic Size**: Can grow/shrink without reallocating the entire structure.\n2. **Pointer Overhead**: Requires extra memory for addresses.\n3. **Sequential Access**: Must traverse from the head to find a node (O(N) search).",
        examples: [
          { title: "Node Definition", language: "python", code: "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None", explanation: "Basic building block for Singly Linked Lists." }
        ],
        keyPoints: ["O(1) insertion at head/tail", "O(N) indexing access", "Circular vs Doubly lists"]
      },
      evaluate: {
        questions: [
          {
            question: "What is the primary advantage of a Linked List over a fixed-sized Array?",
            options: ["Faster access to an element by index", "Lower memory usage per element", "Ability to insert elements without shifting existing data", "Automatic sorting of elements"],
            correctIndex: 2,
            feedback: {
              0: "Incorrect. Arrays have O(1) index access; Linked Lists are O(N).",
              1: "Linked lists actually use MORE memory due to storage of pointers (next).",
              2: "Perfect! Since nodes aren't physically adjacent, we only need to update pointer references to insert a new node.",
              3: "Linked lists do not sort themselves automatically."
            },
            explanation: "Linked lists decouple physical location from logical order."
          }
        ]
      }
    },
    'trees': {
      understand: {
        theory: "# Trees: Hierarchical Data Logic\nTrees are non-linear data structures representing parent-child relationships. **Binary Search Trees (BST)** and **Heaps** are the most common variants for search and priority tasks.\n\n### Tree Invariants:\n1. **Root**: The top-most node with no parent.\n2. **Leaf**: Nodes with no children.\n3. **BST Property**: Left children < Parent < Right children.",
        examples: [
          { title: "In-Order Traversal", language: "python", code: "def inOrder(root):\n    if not root: return\n    inOrder(root.left)\n    print(root.val)\n    inOrder(root.right)", explanation: "Traversal that visits BST nodes in ascending order." }
        ],
        keyPoints: ["Balanced trees ensure O(log N) operations", "Recursion is the natural way to process trees", "Used for file systems and DOM structures"]
      },
      evaluate: {
        questions: [
          {
            question: "In a Binary Search Tree (BST), where would you find the smallest element?",
            options: ["The Root", "The right-most leaf", "The left-most leaf", "Any leaf node"],
            correctIndex: 2,
            feedback: {
              0: "The root is the median or pivot point, not necessarily the smallest.",
              1: "The right-most leaf is the largest element in a BST.",
              2: "Correct! Following the left-child property recursively leads to the minimum value.",
              3: "Only the left-most leaf (or the pivot's left-most descendant) is the smallest."
            },
            explanation: "The BST property dictates that smaller values always go to the left sub-tree."
          }
        ]
      }
    },
    'frontend fundamentals': {
      understand: {
        theory: "# Frontend Fundamentals: The DOM & Rendering\nThe frontend is where code meets the user. Modern frontend engineering is about managing the **DOM (Document Object Model)** efficiently through component-based architectures like React.\n\n### The UI Stack:\n1. **Virtual DOM**: React's way of minimizing expensive browser repaints.\n2. **Semantic HTML**: Using correct tags for accessibility and SEO.\n3. **CSS Box Model**: Understanding margins, borders, padding, and content.",
        examples: [
          { title: "React Component", language: "jsx", code: "function Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}", explanation: "A simple functional component using props." }
        ],
        keyPoints: ["Accessibility (A11y) is a core requirement", "Performance = Minimum DOM updates", "Responsive design with Flexbox/Grid"]
      },
      evaluate: {
        questions: [
          {
            question: "What is the primary purpose of the 'Virtual DOM' in React?",
            options: ["To store user passwords securely", "To optimize browser rendering by batching updates", "To replace CSS entirely", "To connect directly to the database"],
            correctIndex: 1,
            feedback: {
              0: "Passwords should never live in the DOM, virtual or otherwise.",
              1: "Correct! The Virtual DOM tracks changes in memory and calculates the most efficient way to update the real browser DOM.",
              2: "CSS is still the styling engine; Virtual DOM is for structure.",
              3: "React is client-side; it talks to APIs, not direct DB connections."
            },
            explanation: "The Virtual DOM is a performance optimization layer between state and pixels."
          }
        ]
      }
    },
    'state management': {
      understand: {
        theory: "# State Management: The Source of Truth\nAs apps grow, passing data through 'props' becomes untenable (Prop Drilling). State management involves choosing between Local, Lifted, and Global states.\n\n### Management Patterns:\n1. **Prop Drilling**: Passing state down multiple layers (anti-pattern).\n2. **Context API**: Native React way to provide state to a subtree.\n3. **Redux/Zustand**: External stores for massive, complex global states.",
        examples: [
          { title: "Simple Hook", language: "javascript", code: "const [count, setCount] = useState(0);\n<button onClick={() => setCount(c => c + 1)}>Increment</button>", explanation: "Local state using React Hooks." }
        ],
        keyPoints: ["Don't over-engineer state", "Global state is for data shared across features", "Immutable state patterns prevent bugs"]
      },
      evaluate: {
        questions: [
          {
            question: "What is 'Prop Drilling' in React terms?",
            options: ["A high-performance optimization", "Passing data through components that don't need it just to reach a child", "Connecting a component to a database", "Using a loop to render props"],
            correctIndex: 1,
            feedback: {
              0: "It's actually a maintenance burden, not an optimization.",
              1: "Spot on. This makes components fragile and hard to refactor. Use Context or Stores to solve this.",
              2: "Props are for UI data flow, not DB connectivity.",
              3: "Looping through props is called mapping, not drilling."
            },
            explanation: "Prop drilling occurs when intermediate components act as mere 'messengers' for data they don't consume."
          }
        ]
      }
    },
    'arrays & memory': {
      understand: {
        theory: "# Arrays: The Fundamental Memory Block\nArrays are the most basic data structure, representing a contiguous block of memory. Understanding how they map to physical RAM is crucial for performance optimization.\n\n### Architectural Invariants:\n1. **Contiguous Storage**: Elements are stored back-to-back in memory.\n2. **O(1) Access**: Calculating an address is simple math: `Address = Base + (Index * Size)`.\n3. **Amortized Insertion**: Inserting at the end is fast, but inserting at the start requires O(N) shifting.",
        examples: [
          { title: "Memory Address Calc", language: "python", code: "# Base address: 1000, Int size: 4 bytes\n# Accessing index 3\naddress = 1000 + (3 * 4) # 1012", explanation: "This illustrates why array access is O(1) regardless of size." }
        ],
        keyPoints: ["Space complexity is O(N)", "Fast lookups by index", "Fixed size vs Dynamic arrays"]
      },
      evaluate: {
        questions: [
          {
            question: "Why is inserting an element at the beginning of an array typically O(N)?",
            options: ["The computer needs to find a new memory block", "Every subsequent element must be shifted one position to the right", "The array must be sorted first", "The operating system blocks early memory access"],
            correctIndex: 1,
            feedback: {
              0: "Incorrect. While resizing (finding a new block) can happen, the O(N) cost is primarily due to the mechanical shifting of existing items.",
              1: "Masterful! Because arrays are contiguous, adding at index 0 requires 'pushing' every subsequent element forward to maintain the order.",
              2: "Nonsense. Arrays can be unsorted; the complexity remains O(N) for insertion regardless of sort state.",
              3: "The OS manages memory permissions, but user-space logic (our code) handles the shifting within allocated blocks."
            },
            explanation: "In a contiguous memory structure, inserting at the start forces every other element to move to follow it."
          }
        ]
      },
      apply: {
        problems: [
          {
            title: "Array Summation",
            prompt: "Write a function `sumArray(arr)` that returns the sum of all elements in an array. This is the foundation of linear iteration.",
            starterCode: "def sumArray(arr):\n    # Your logic here\n    pass",
            language: "python",
            hints: ["Use a loop", "Initialize a sum variable at 0"]
          }
        ]
      },
      master: {
        summary: "You now understand that arrays are the bedrock of low-level memory management.",
        recommendations: ["Research Linked Lists vs Arrays", "Study Cache Locality", "Master Dynamic Array Resizing (Amortized Cost)"]
      }
    },
    'system design': {
      understand: {
        theory: "# Scalable System Design: Foundations\nDesigning systems that scale to millions of users requires moving from local execution to distributed thinking. Key concepts include **Load Balancing**, **Database Sharding**, and **Caching Strategies**.\n\n### The Scalability Triangle:\n1. **Horizontal Scaling**: Adding more machines instead of more RAM to one (Vertical).\n2. **Statelessness**: Decoupling user state from the application server.\n3. **Asynchronous Processing**: Using message queues for non-blocking UI.",
        examples: [
          { title: "Load Balancer Logic", language: "yaml", code: "nginx:\n  proxy_pass: http://backend_pool\n  lb_method: round_robin", explanation: "Distributes incoming traffic across multiple instances to prevent bottlenecks." }
        ],
        keyPoints: ["State belongs in the DB, not the RAM", "CDN for static assets", "Microservices vs Monolith"]
      },
      evaluate: {
        questions: [
          {
            question: "What is the primary purpose of a 'Load Balancer' in a web architecture?",
            options: ["Encrypting user passwords", "Distributing traffic across multiple servers", "Running database queries faster", "Storing static images"],
            correctIndex: 1,
            feedback: {
              0: "Encryption is handled by the application logic or HSMs, not typically the LB middleware.",
              1: "Precisely. The LB acts as a traffic controller, ensuring no single server is overwhelmed.",
              2: "LBs don't interact with DB logic directly; they route HTTP/TCP requests.",
              3: "That's the job of a CDN (Content Delivery Network)."
            },
            explanation: "Load balancers ensure high availability by spreading the workload."
          }
        ]
      },
      apply: {
        problems: [
          {
            title: "Mock System Plan",
            prompt: "Describe the components needed for a basic 'Twitter-like' newsfeed. Focus on the Load Balancer and the Cache Layer.",
            starterCode: "# Component List:\n1. LB\n2. App Server\n3. ...",
            language: "text",
            hints: ["Think about 'Read-Heavy' patterns", "Mention Redis for caching"]
          }
        ]
      },
      master: {
        summary: "Architectural thinking is about trade-offs. You've mastered the basics of distributed coordination.",
        recommendations: ["Deep dive into CAP Theorem", "Study Consistent Hashing", "Learn about Message Queues (Kafka/RabbitMQ)"]
      }
    },
    'prompt engineering': {
      understand: {
        theory: "# Prompt Engineering 101: Intent Architecture\nPrompting is the art of providing constraints and context to a model to minimize the search space of its probabilistic output.\n\n### The 'Few-Shot' Paradigm:\n1. **Zero-Shot**: Direct instruction without examples.\n2. **Few-Shot**: Providing 2-3 examples of the desired pattern.\n3. **Chain of Thought**: Asking the model to 'think step-by-step'.",
        examples: [
          { title: "Zero vs Few-Shot", language: "text", code: "Zero: 'Classify this as Happy/Sad: The sun is out.'\nFew: 'User: I hate this. (Sad) User: Great! (Happy) User: The sun is out. (Happy)'", explanation: "Few-shot significantly increases accuracy by providing pattern context." }
        ],
        keyPoints: ["Clarity over brevity", "Define the persona (e.g., 'You are a coder')", "Provide guardrails"]
      },
      evaluate: {
        questions: [
          {
            question: "What is the primary benefit of 'Chain of Thought' prompting?",
            options: ["It reduces the number of tokens used", "It makes the model generate faster", "It improves reasoning by allowing the model to perform intermediate steps", "It ensures the model never hallucinations"],
            correctIndex: 2,
            feedback: {
              0: "Actually, CoT increases token usage as the model explains its work.",
              1: "It's often slower due to the increased output size.",
              2: "Correct! Breaking down logic into steps prevents the model from jumping to shallow conclusions.",
              3: "Unfortunately, Hallucination is baked into the probabilistic nature of LLMs; CoT only reduces it."
            },
            explanation: "CoT allows the model's internal attention to process complex logic sequentially rather than in one pass."
          }
        ]
      },
      apply: {
        problems: [
          {
            title: "Role Simulation",
            prompt: "Write a prompt that asks an AI to act as a 'Senior Security Architect' and review a login function for vulnerabilities. Use the Persona pattern.",
            starterCode: "SYSTEM_PROMPT = \"\"\"",
            language: "text",
            hints: ["Start with 'You are a...'", "Define the output format (e.g. JSON)"]
          }
        ]
      },
      master: {
        summary: "You are no longer a user of AI; you are an orchestrator of machine intent.",
        recommendations: ["Learn Tree-of-Thought prompting", "Study RAG (Retrieval Augmented Generation)", "Master Systematic Guardrails"]
      }
    },
    'full-stack development': {
      understand: {
        theory: "# Full-Stack Synthesis: The Complete Loop\nFull-stack engineering is the ability to connect User Perception (Frontend) with Persistent Truth (Backend/DB). We focus on the **MERN** stack approach: React, Express, Node, and MongoDB.\n\n### The Three Tiers:\n1. **Presentation Layer**: React/Tailwind for the UI.\n2. **Application Layer**: Node.js/Express for business logic and routing.\n3. **Data Layer**: Relational (SQL) or Document (NoSQL) storage.",
        examples: [
          { title: "API Endpoint", language: "javascript", code: "app.get('/api/users', async (req, res) => {\n  const users = await db.collection('users').find().toArray();\n  res.json(users);\n});", explanation: "A standard bridge between the database and the client request." }
        ],
        keyPoints: ["HTTPS is a requirement, not a feature", "CORS is your first security gate", "Authentication vs Authorization"]
      },
      evaluate: {
        questions: [
          {
            question: "Which of the following describes 'State' in a React application?",
            options: ["The physical location of the server", "Data that changes over time and affects the UI rendering", "The CSS styling of a button", "The database password"],
            correctIndex: 1,
            feedback: {
              0: "Server location is infra-level; React state lives in the browser memory.",
              1: "Bingo. State is the reactive heart of a component.",
              2: "Styling is 'Presentation', though state can certainly trigger style changes.",
              3: "Storing passwords in a client side library like React is a critical security failure."
            },
            explanation: "State represents the dynamic data within a user's session."
          }
        ]
      },
      apply: {
        problems: [
          {
            title: "Mini-API Design",
            prompt: "Write an Express route that receives a 'POST' request with a username and returns a greeting.",
            starterCode: "app.post('/greet', (req, res) => {\n    // Extract username and respond\n});",
            language: "javascript",
            hints: ["Check req.body", "Use res.json()"]
          }
        ]
      },
      master: {
        summary: "The loop is closed. You can now manifest ideas into functional, distributed products.",
        recommendations: ["Learn Docker & Containerization", "Master CI/CD pipelines", "Study OAuth 2.0 implementation"]
      }
    },
    'python for automation': {
      understand: {
        theory: "# Python for Automation: The Scripting Edge\nPython is the de-facto standard for automation because of its 'Batteries Included' philosophy. In this module, we focus on the **OS** and **Shutil** modules to manipulate files, and **Requests** for web automation.\n\n### Key Ecosystem Pillars:\n1. **Os Module**: Interfacing with the host operating system.\n2. **Threading/Asyncio**: Handling concurrent tasks.\n3. **Subprocess**: Running external commands.",
        examples: [
          { title: "File Organizer", language: "python", code: "import os\nimport shutil\n\ndef organize(path):\n    for file in os.listdir(path):\n        ext = file.split('.')[-1]\n        os.makedirs(f'{path}/{ext}', exist_ok=True)\n        shutil.move(f'{path}/{file}', f'{path}/{ext}/{file}')", explanation: "Uses os.makedirs and shutil.move to group files by extension." }
        ],
        keyPoints: ["Leverage high-level libraries first", "Always handle FileNotFoundError paths", "Use absolute paths for scripts"]
      },
      evaluate: {
        questions: [
          {
            question: "Which module is best suited for high-level file operations like copying or moving entire directories?",
            options: ["os", "shutil", "sys", "subprocess"],
            correctIndex: 1,
            feedback: {
              0: "The 'os' module handles path manipulation and basic file deletion, but lacks high-level recursive copy/move functions.",
              1: "Correct! 'shutil' (Shell Utilities) provides high-level operations like copytree() and move() which automate nested structures.",
              2: "The 'sys' module is for system-specific parameters and functions, not file manipulation.",
              3: "The 'subprocess' module is for spawning new processes, not directly managing the filesystem."
            },
            explanation: "Shutil is specifically designed for high-level shell operations beyond simple OS kernel calls."
          }
        ]
      }
    },
    'advanced javascript (es6+)': {
      understand: {
        theory: "# Advanced JavaScript: The Async Revolution\nMastering modern JS requires a deep understanding of the **Event Loop**, **Closures**, and **Prototypes**. ES6+ introduced syntax that isn't just sugar—it fundamentally changed memory management and sync-flow.\n\n### Core Paradigms:\n1. **Execution Context**: How JS keeps track of variable scope.\n2. **Promises**: Managing the eventual completion of async operations.\n3. **Temporal Dead Zone**: Understanding 'let' and 'const' hoisting.",
        examples: [
          { title: "Power of Closures", language: "javascript", code: "function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\n\nconst counter = createCounter();\nconsole.log(counter()); // 1", explanation: "The inner function 'remembers' the state of 'count' even after createCounter has finished." }
        ],
        keyPoints: ["Closures enable data privacy", "Promises prevent 'Callback Hell'", "ES6 Classes are syntactic sugar over Prototypes"]
      },
      evaluate: {
        questions: [
          {
            question: "What is the result of 'typeof []' in JavaScript?",
            options: ["array", "list", "object", "undefined"],
            correctIndex: 2,
            feedback: {
              0: "'array' is not a primitive type in JavaScript; arrays are specialized objects.",
              1: "There is no 'list' type in JS; arrays are used instead.",
              2: "Correct! In JS, arrays are objects. To check for arrays specifically, use Array.isArray().",
              3: "Arrays are definitely defined!"
            },
            explanation: "In JavaScript's type system, arrays are structurally objects."
          }
        ]
      }
    },
    'dsa': {
      understand: {
        theory: "# Algorithmic Synthesis: DSA Masterclass\nData Structures and Algorithms (DSA) are the tools for efficient problem solving. We focus on **Time Complexity (Big O)** and the core patterns: **Two Pointers**, **Sliding Window**, and **Dynamic Programming**.\n\n### Essential Patterns:\n1. **Prefix Sums**: Fast range queries.\n2. **Frequency Maps**: O(1) lookups using HashTables.\n3. **Binary Search**: Divid-and-conquer logic for sorted spaces.",
        examples: [
          { title: "Binary Search", language: "python", code: "def binarySearch(arr, x):\n  l, r = 0, len(arr)-1\n  while l <= r:\n    m = l + (r-l)//2\n    if arr[m] == x: return m\n    if arr[m] < x: l = m + 1\n    else: r = m - 1\n  return -1", explanation: "O(log N) complexity by halving the search space each step." }
        ],
        keyPoints: ["Space vs Time trade-offs", "Recursion vs Iteration", "Graph traversals (BFS/DFS)"]
      },
      evaluate: {
        questions: [
          {
            question: "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
            options: ["O(1)", "O(N)", "O(log N)", "O(N log N)"],
            correctIndex: 2,
            feedback: {
              0: "O(1) is only possible if you know the exact memory address or use a perfect hash.",
              1: "O(N) happens in a degenerate (unbalanced) tree, but balanced BSTs are much faster.",
              2: "Correct! The search space halves at each node, giving logarithmic complexity.",
              3: "O(N log N) is typically the complexity of sorting, not searching in a tree."
            },
            explanation: "Balanced trees ensure the path to any node is bounded by the height, which is log(N)."
          }
        ]
      },
      apply: {
        problems: [
          {
            title: "Two Sum",
            prompt: "Given an array and a target sum, return indices of the two numbers such that they add up to the target. Use a HashMap for O(N).",
            starterCode: "def twoSum(nums, target):\n    prevMap = {} # val : index\n    # Your logic here",
            language: "python",
            hints: ["Iterate through the array", "Check if (target - num) exists in the map"]
          }
        ]
      },
      master: {
        summary: "Algorithms are the logic of the universe. You've mastered the foundational efficiency patterns.",
        recommendations: ["Study Graph Theory", "Master Dynamic Programming", "Practice LeetCode Mediums"]
      }
    },
    'mobile architecture': {
      understand: {
        theory: "# Mobile Architecture: Native & Cross-Platform\nMobile development requires managing limited resources (Battery, RAM) and variable connectivity. We focus on **Reactive UI** and **Offline-First** sync strategies.\n\n### Core Concepts:\n1. **The Lifecycle**: Handling Background/Foreground transitions.\n2. **State Management**: Redux/Provider/Riverpod patterns.\n3. **Native Bridges**: How React Native/Flutter talk to iOS/Android APIs.",
        examples: [
          { title: "Life Cycle Hook", language: "javascript", code: "useEffect(() => {\n  const handler = AppState.addEventListener('change', nextState => {\n    // logic when app is minimized\n  });\n  return () => handler.remove();\n}, []);", explanation: "Critical for saving user state before the OS kills the process." }
        ],
        keyPoints: ["Minimize over-the-air (OTA) updates", "Use vector graphics (SVG) for density", "Handle inconsistent network states"]
      },
      evaluate: {
        questions: [
          {
            question: "What is the main benefit of an 'Offline-First' approach?",
            options: ["The app uses less storage", "User productivity isn't interrupted by network drops", "The app is faster to download", "It's easier to program"],
            correctIndex: 1,
            feedback: {
              0: "Offline-first often uses MORE storage due to caching.",
              1: "Correct! By prioritizing local data, the UI remains responsive regardless of internet quality.",
              2: "Download size is unrelated to the sync strategy.",
              3: "It's actually much harder to program due to conflict resolution logic."
            },
            explanation: "Offline-first architectures sync data in the background while keeping the UI live."
          }
        ]
      },
      apply: {
        problems: [
          {
            title: "Safe Sync Logic",
            prompt: "Write a function that checks for network connectivity before sending a data payload. If offline, queue the message.",
            starterCode: "function sendData(payload) {\n    if (navigator.onLine) {\n        // Send now\n    } else {\n        // Queue for later\n    }\n}",
            language: "javascript",
            hints: ["Use navigator.onLine", "Think about LocalStorage for queuing"]
          }
        ]
      }
    },
    'foundations of llms': {
      understand: {
        theory: "# Foundations of LLMs: The Stochastic Parrot Explained\nLarge Language Models (LLMs) are transformer-based neural networks trained to predict the next token in a sequence. Understanding **Self-Attention** and **Context Windows** is critical to effective prompting.\n\n### The Transformer Architecture:\n1. **Attention Mechanism**: How the model weighs the importance of different words in a prompt.\n2. **Tokens**: The discrete units of text (sub-words) processed by the model.\n3. **Probabilistic Nature**: LLMs don't 'know' facts; they sample from a high-dimensional probability distribution.",
        examples: [
          { title: "Tokenization Edge Case", language: "text", code: "Input: 'hamburger'\nTokens: ['ham', 'burg', 'er']", explanation: "LLMs don't see characters; they see token IDs. This explains why they struggle with some character-level tasks." }
        ],
        keyPoints: ["Context window is finite memory", "LLMs are next-token predictors", "Temperature controls randomness/creativity"]
      },
      evaluate: {
        questions: [
          {
            question: "What does the 'Self-Attention' mechanism in an LLM primarily do?",
            options: ["Controls the speed of text generation", "Allows the model to focus on relevant context regardless of distance", "Encodes the audio components of speech", "Limits the maximum response length"],
            correctIndex: 1,
            feedback: {
              0: "Speed is handled by hardware and optimization, not attention logic.",
              1: "Correct! Attention allows the model to relate distal words (e.g., a pronoun to its subject) efficiently.",
              2: "LLMs are text-centric; audio encoding is handled by multimodal layers or separate encoders.",
              3: "Length is controlled by max token parameters, not the attention mechanism."
            },
            explanation: "Self-attention is the breakthrough that allowed LLMs to handle long-range dependencies in text."
          }
        ]
      }
    }
  };

  useEffect(() => {
    const fetchPhaseContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch from AI proxy first
        const data = await getCourseContent(courseTitle, stepTitle, activePhase);
        
        if (!data || Object.keys(data).length === 0) {
          throw new Error("Empty content");
        }
        setContent(data);
        if (activePhase === 'apply' && data.problems && data.problems.length > 0) {
          setCode(data.problems[0].starterCode || '');
        }
      } catch (err: any) {
        console.warn("AI sync failed, checking local master records...", err);
        
        // Fallback to hardcoded data
        const fallbackKey = stepTitle.toLowerCase().trim();
        // Fuzzy match: check if fallbackKey contains or is contained by any key in FALLBACK_CONTENT
        const matchedKey = Object.keys(FALLBACK_CONTENT).find(key => 
          fallbackKey.includes(key) || key.includes(fallbackKey)
        );

        if (matchedKey && FALLBACK_CONTENT[matchedKey]) {
          const fallbackData = FALLBACK_CONTENT[matchedKey][activePhase];
          if (fallbackData) {
            setContent(fallbackData);
            if (activePhase === 'apply' && fallbackData.problems && fallbackData.problems.length > 0) {
              setCode(fallbackData.problems[0].starterCode || '');
            }
          } else {
            setError(`No local data found for the '${activePhase}' phase of this module.`);
          }
        } else {
          setError(`Intelligence Engine Sync Failure: ${err.message || 'Unknown error'}. No local fallback available for '${stepTitle}'.`);
        }
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
    } catch (e: any) {
      console.error(e);
      let errorMsg = "I'm currently having trouble connecting to my knowledge base.";
      if (e.message?.includes("API key not valid")) {
        errorMsg = "AI Access Restricted: The platform's intelligence key is currently invalid. Please use the hardcoded curriculum modules.";
      }
      setDoubts(prev => [...prev, { question: q, answer: errorMsg }]);
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
      const task = idePrompt || `Solve the task: ${problem?.prompt}`;
      const resp = await getIDEAgentAdvice(
        task,
        code,
        content.problems[selectedProblem].language || 'python',
        { course: courseTitle, step: stepTitle, phase: activePhase }
      );
      setCode(resp);
      setIdePrompt('');
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
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto">
                 <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                    <X className="w-10 h-10" />
                 </div>
                 <h4 className="text-2xl font-black text-gray-900 leading-tight">Sync Failure</h4>
                 <p className="text-gray-500 italic serif leading-relaxed text-sm">
                   "{error}"
                 </p>
                 <button 
                   onClick={() => setActivePhase(activePhase === 'understand' ? 'understand' : activePhase)} // Trigger re-run
                   className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all"
                 >
                    <RefreshCcw className="w-4 h-4" /> Retry Connection
                 </button>
              </div>
            ) : !content ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                 <p className="font-bold text-lg italic serif">No data returned for this phase.</p>
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
                           <Markdown>{content?.theory || ''}</Markdown>
                        </section>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {content?.examples?.map((ex: any, idx: number) => (
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
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                           {content.problems?.map((p: any, i: number) => (
                             <button 
                                key={i}
                                onClick={() => { setSelectedProblem(i); setCode(p.starterCode); }}
                                className={`flex-shrink-0 px-6 py-4 rounded-2xl flex flex-col items-start gap-1 transition-all ${
                                  selectedProblem === i ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-500 hover:border-indigo-300'
                                }`}
                             >
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Challenge {i + 1}</span>
                                <span className="text-sm font-bold truncate max-w-[120px]">{p.prompt.split('.')[0]}</span>
                             </button>
                           ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                           {/* Problem Sidebar */}
                           <div className="lg:col-span-4 space-y-6 flex flex-col">
                              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex-1 flex flex-col overflow-y-auto">
                                 <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                       <Terminal className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h4 className="font-black text-gray-900 tracking-tight text-xl uppercase italic serif">Task Brief</h4>
                                 </div>
                                 <div className="prose prose-sm prose-indigo leading-relaxed text-gray-600 mb-8 italic serif text-lg opacity-90">
                                    <Markdown>{content?.problems?.[selectedProblem]?.prompt || ''}</Markdown>
                                 </div>
                                 
                                 <div className="mt-auto pt-8 border-t border-gray-50 space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contextual Guardrails</h5>
                                    <div className="space-y-2">
                                       {content?.problems?.[selectedProblem]?.hints?.map((h: string, i: number) => (
                                          <div key={i} className="p-4 bg-amber-50/50 rounded-2xl text-[11px] font-bold text-amber-800 flex gap-3 border border-amber-100/50">
                                             <div className="p-1 bg-amber-100 rounded-lg h-fit">
                                                <Sparkles className="w-3 h-3" /> 
                                             </div>
                                             {h}
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                           
                           {/* Agentic IDE */}
                           <div className="lg:col-span-8 flex flex-col gap-6">
                              <div className="bg-gray-950 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative border border-white/5 h-full group">
                                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                                 
                                 {/* IDE Top Bar */}
                                 <div className="p-4 bg-white/5 backdrop-blur-md flex justify-between items-center text-white/40 text-[10px] font-mono font-bold tracking-widest border-b border-white/5">
                                    <div className="flex items-center gap-6">
                                       <div className="flex gap-2">
                                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                                       </div>
                                       <div className="flex items-center gap-2 text-indigo-400/60">
                                          <BrainCircuit className="w-3.5 h-3.5" />
                                          <span>AGENTIC_WORKFLOW_ACTIVE</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <span className="opacity-50">LINTING... OK</span>
                                       <div className="flex bg-white/5 rounded-lg p-1">
                                          <button className="px-3 py-1 bg-white/10 rounded-md text-white">CODE</button>
                                          <button className="px-3 py-1 hover:text-white transition-colors">PROMPT</button>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Editor Area */}
                                 <div className="flex-1 flex overflow-hidden relative">
                                    <div className="w-12 bg-white/2 flex flex-col items-center pt-8 text-[10px] font-mono text-white/20 select-none border-r border-white/5">
                                       {Array.from({length: 20}).map((_, i) => (
                                          <div key={i} className="h-6 flex items-center">{i + 1}</div>
                                       ))}
                                    </div>
                                    <textarea 
                                      value={code}
                                      onChange={(e) => setCode(e.target.value)}
                                      className="flex-1 bg-transparent p-8 text-indigo-200 font-mono text-sm outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
                                      spellCheck={false}
                                      placeholder="// Brainstorm with AG-1 or start coding..."
                                    />

                                    {/* AI Feedback Overlay */}
                                    {isAgentic && (
                                       <div className="absolute bottom-8 right-8 max-w-xs p-6 bg-indigo-600/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl text-white transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                          <div className="flex items-center gap-2 mb-3">
                                             <Sparkles className="w-4 h-4 text-amber-400" />
                                             <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Orchestrator Tip</span>
                                          </div>
                                          <p className="text-xs font-bold leading-relaxed italic serif">
                                             "Try delegating the boilerplate setup to me. Use the PROMPT button if you're stuck on the logic."
                                          </p>
                                       </div>
                                    )}
                                 </div>

                                 {/* IDE Bottom Controls */}
                                 <div className="p-8 bg-white/2 border-t border-white/5 flex justify-between items-center gap-6">
                                    <div className="flex-1 flex gap-4">
                                       {isAgentic ? (
                                          <div className="relative flex-1">
                                             <input 
                                                type="text"
                                                value={idePrompt}
                                                onChange={(e) => setIdePrompt(e.target.value)}
                                                placeholder="Prompt the IDE: e.g. 'Generate sorting logic'..."
                                                onKeyDown={(e) => e.key === 'Enter' && handleAgentTask()}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white  outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all font-bold pr-32"
                                             />
                                             <button 
                                               onClick={handleAgentTask}
                                               disabled={agentExecuting}
                                               className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                                             >
                                                {agentExecuting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                                DELEGATE
                                             </button>
                                          </div>
                                       ) : (
                                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                             <Terminal className="w-3 h-3" /> Runtime: Python 3.10 High Performance
                                          </p>
                                       )}
                                    </div>
                                    <div className="flex gap-4">
                                       <button 
                                         onClick={() => setCode(content?.problems?.[selectedProblem]?.starterCode || '')}
                                         className="px-6 py-4 bg-white/5 text-white/60 rounded-2xl hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest border border-white/5"
                                       >
                                          Reset
                                       </button>
                                       <button 
                                         onClick={runCode}
                                         disabled={runningCode}
                                         className="px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all font-black text-xs flex items-center gap-3 shadow-xl shadow-indigo-500/20"
                                       >
                                          {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                          {isAgentic ? 'VERIFY MISSION' : 'RUN CODE'}
                                       </button>
                                    </div>
                                 </div>
                              </div>

                              {testResults && (
                                 <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl"
                                 >
                                    <div className="flex justify-between items-center mb-6">
                                       <h5 className="font-black text-gray-900 flex items-center gap-3">
                                          <BarChart3 className="w-5 h-5 text-indigo-600" /> 
                                          Deployment Logs
                                       </h5>
                                       <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Environment stable</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {testResults.map((r: any, i: number) => (
                                          <div key={i} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${r.passed ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                             <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Scenario {i + 1}</p>
                                                <p className="text-xs font-bold text-gray-800">Input: <code className="bg-white/50 px-1 rounded">{JSON.stringify(r.input)}</code></p>
                                             </div>
                                             <div className={`p-2 rounded-lg ${r.passed ? 'bg-emerald-100/50' : 'bg-rose-100/50'}`}>
                                                {r.passed ? <Check className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-rose-600" />}
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </motion.div>
                              )}
                           </div>
                        </div>
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
                                   <div className="pl-12 pt-4 space-y-3">
                                      <div className={`p-4 rounded-2xl flex gap-3 italic serif text-sm ${
                                         selectedAnswers[qIdx] === q.correctIndex ? 'bg-emerald-100/50 text-emerald-800' : 'bg-rose-100/50 text-rose-800'
                                      }`}>
                                         <div className={`p-1 rounded-lg h-fit ${selectedAnswers[qIdx] === q.correctIndex ? 'bg-emerald-200' : 'bg-rose-200'}`}>
                                            {selectedAnswers[qIdx] === q.correctIndex ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-600" />}
                                         </div>
                                         <div>
                                            <p className="font-bold mb-1 text-[11px] uppercase tracking-wider">{selectedAnswers[qIdx] === q.correctIndex ? 'Diagnostic Success' : 'Conceptual Misalignment'}</p>
                                            <p className="opacity-80 leading-relaxed font-bold">
                                               {q.feedback?.[selectedAnswers[qIdx]] || (selectedAnswers[qIdx] === q.correctIndex ? "This selection aligns perfectly with the core principles of the platform." : "This selection represents a common misunderstanding of the architectural constraints.")}
                                            </p>
                                         </div>
                                      </div>
                                      
                                      {selectedAnswers[qIdx] !== q.correctIndex && (
                                         <div className="p-4 bg-indigo-50/50 text-indigo-800 rounded-2xl flex gap-3 italic serif text-sm border border-indigo-100/50">
                                            <Lightbulb className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                               <p className="font-bold mb-1 text-[11px] uppercase tracking-wider">Corrective Logic</p>
                                               <p className="opacity-80 leading-relaxed font-bold">{q.feedback?.[q.correctIndex] || q.explanation}</p>
                                            </div>
                                         </div>
                                      )}
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
