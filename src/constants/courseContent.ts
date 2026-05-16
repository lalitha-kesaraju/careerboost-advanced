export const HARDCODED_COURSES: Record<string, Record<string, any>> = {
  "AI Orchestration Elite": {
    "Foundations of LLMs": {
      understand: {
        theory: `
# Foundations of LLMs
Large Language Models (LLMs) like Gemini, GPT-4, and Claude are deep learning models trained on massive datasets to understand and generate human-like text. They are based on the **Transformer** architecture, which revolutionized NLP in 2017.

### Key Architectural Pillars
1. **Self-Attention**: Allows the model to weigh the importance of different words in a sequence, regardless of their distance.
2. **Tokenization**: The process of breaking down text into smaller units (tokens). A token can be a word, part of a word, or punctuation.
3. **Parameters**: The internal variables (weights) that the model learns during training. "Better" doesn't always mean "more parameters", but scale has historically led to emergent capabilities.

### Why Context Matters
The **Context Window** is the model's short-term memory. If your prompt exceeds this window, the model starts "forgetting" earlier parts of the conversation.
`,
        examples: [
          {
            title: "Tokenization Breakdown",
            language: "Natural Language",
            code: "Input: 'Learning is earning!'\nTokens: ['Learn', 'ing', ' is', ' earn', 'ing', '!']",
            explanation: "Models don't see words; they see numerical representations of these sub-word tokens."
          }
        ],
        keyPoints: [
          "LLMs are probabilistic, not deterministic.",
          "Context length dictates how much data you can process at once.",
          "Temperature controls the randomness of the output (0.0 for logic, 0.7+ for creativity)."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Refactor this prompt to use 'Delimiters' for better clarity: 'Summarize the following text: Apple is a tech company founded by Steve Jobs.'",
            starterCode: "### TASK\nRewrite the prompt using symbols like ### or \"\"\" to isolate the content.\n\n### YOUR PROMPT:",
            hints: ["Use clear instructions before the delimiter.", "The AI should know exactly where the content starts and ends."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "What does the 'Self-Attention' mechanism allow a model to do?",
            options: ["Save memory", "Understand relationships between distant words", "Connect to the internet", "Predict stock prices"],
            correctIndex: 1,
            explanation: "Self-attention allows the model to look at other words in the input sequence for hints that can help lead to a better encoding for the word."
          }
        ]
      },
      master: {
        summary: "You've mastered the architectural foundations. You're ready to start steering these models.",
        recommendations: ["Read 'Attention Is All You Need' paper.", "Explore the concept of Embeddings."]
      }
    },
    "Zero-Shot & Few-Shot": {
      understand: {
        theory: `
# Zero-Shot & Few-Shot
These are the two primary ways to perform In-Context Learning (ICL).

### Zero-Shot
Asking the model to perform a task without any examples.
*Example: "Classify this email as Spam or Not Spam: 'Win a free iPhone now!'"*

### Few-Shot
Providing the model with a few examples (shots) in the prompt to define the task and desired output format.
*Example:*
"Text: I love this! Sentiment: Positive"
"Text: This is bad. Sentiment: Negative"
"Text: It is okay. Sentiment: Neutral"
"Text: Wow, incredible! Sentiment: "
`,
        examples: [
          {
            title: "Few-Shot Formatting",
            language: "JSON",
            code: "Prompt: 'Extract names and roles from text.\nEx: John is a dev -> {name: \"John\", role: \"dev\"}\nEx: Sarah is a PM -> {name: \"Sarah\", role: \"PM\"}\nEx: Mike is a CEO -> '",
            explanation: "By providing examples, we force the model into a specific JSON pattern."
          }
        ],
        keyPoints: [
          "Few-shot is significantly more robust for complex formatting.",
          "The first example in a few-shot sequence sets the strongest precedent.",
          "Diversity in your 'shots' helps the model generalize better."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Write a few-shot prompt that translates English phrases into 'Pirate Speak'. Provide at least 2 examples before the target input.",
            starterCode: "### PIRATE TRANSLATOR\nExamples:\n1. 'Hello' -> 'Ahoy!'\n\n### YOUR TURN:",
            hints: ["Use '->' as a separator.", "Include more complex phrases like 'Where is the gold?'"],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "In Few-Shot prompting, what represents a 'shot'?",
            options: ["A single input/output example", "An API call", "A token", "A line of code"],
            correctIndex: 0,
            explanation: "Each 'shot' is an example provided to the model within the prompt body."
          }
        ]
      },
      master: {
        summary: "You can now teach an AI new skills in seconds without any training.",
        recommendations: ["Learn about 'Chain-of-Thought' few-shot.", "Study prompt optimization techniques like APE."]
      }
    },
    "Chain of Thought": {
      understand: {
        theory: `
# Chain of Thought (CoT) Prompting
CoT is a breakthrough technique that enables LLMs to solve complex reasoning tasks by breaking them down into intermediate steps.

### How it works
Instead of just asking for an answer, you prompt the model to "think step by step." This allocates more compute (tokens) to the reasoning process before the final conclusion is reached.

### Patterns
1. **Zero-Shot CoT**: Simply adding "Let's think step-by-step" to the end of a prompt.
2. **Few-Shot CoT**: Providing examples that show the step-by-step reasoning process.
`,
        examples: [
          {
            title: "CoT Reasoning",
            language: "Natural Language",
            code: "Q: If I have 3 apples and buy 2 more, then give 1 to a friend, how many do I have?\nA: Let's think step by step.\n1. Start with 3 apples.\n2. Add 2: 3 + 2 = 5.\n3. Give 1: 5 - 1 = 4.\nFinal Answer: 4.",
            explanation: "Breaking down the logic prevents the model from making 'glance-at' errors."
          }
        ],
        keyPoints: [
          "CoT is most effective on models with >10B parameters.",
          "It dramatically improves performance on math and symbolic logic.",
          "Self-Consistency (running CoT multiple times and taking the majority vote) is even more powerful."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Solve this logic puzzle using Chain of Thought: 'A man has to get a fox, a chicken, and a sack of corn across a river. He has a boat, but it can only fit himself and one other thing. If the fox and chicken are left alone, the fox will eat the chicken. If the chicken and corn are left alone, the chicken will eat the corn. How does he get everything across?'",
            starterCode: "### LOGIC PUZZLE\nReasoning Step-by-Step:\n1. ",
            hints: ["First crossing must involve the chicken.", "The trick is bringing something back on the second return trip."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "Why does Chain of Thought improve model performance?",
            options: ["It reduces token usage", "It allows the model to process logic in smaller, serial chunks", "It connects the model to a calculator", "It increases the temperature"],
            correctIndex: 1,
            explanation: "By decomposing the problem, the model uses its own previous 'thoughts' as context for the next step, reducing the chance of logical jumps."
          }
        ]
      },
      master: {
        summary: "You can now handle complex, multi-step logic with AI precision.",
        recommendations: ["Combined CoT with Few-Shot for 'Few-Shot CoT'.", "Explore Least-to-Most prompting."]
      }
    }
  },
  "Algorithmic Architecture": {
    "Arrays & Hashing": {
      understand: {
        theory: `
# Arrays & Hashing
Arrays are contiguous blocks of memory. Hashing (implemented as Hash Maps or Sets) uses a mathematical function to map keys to indices, achieving O(1) average time complexity for lookups.

### Key Complexity (Average)
- **Access**: O(1) for Arrays, O(1) for Hash Maps.
- **Search**: O(n) for Arrays, O(1) for Hash Maps.
- **Insertion**: O(n) for Arrays (due to shifting), O(1) for Hash Maps.

### The Space-Time Tradeoff
We often use a Hash Map (extra space) to avoid nested loops (O(n²) time), bringing our solution closer to O(n) time.
`,
        examples: [
          {
            title: "Frequency Map Pattern",
            language: "TypeScript",
            code: "const counts = new Map<number, number>();\nfor (const n of nums) {\n  counts.set(n, (counts.get(n) || 0) + 1);\n}",
            explanation: "Count occurrences of each number in a single pass O(n)."
          }
        ],
        keyPoints: [
          "Arrays are best when order and index-based access matter.",
          "Hash Maps are best for checking existence or frequency in O(1).",
          "Beware of Hash Collisions (handled via Chaining or Probing)."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Given an array of integers, return true if any value appears at least twice in the array. Use a Hash Set.",
            starterCode: "function hasDuplicate(nums: number[]): boolean {\n  // Your code here\n}",
            hints: ["Create a new Set.", "Iterate through elements and check if they exist in the set."],
            testCases: [
              { input: [1,2,3,1], expected: true },
              { input: [1,2,3,4], expected: false }
            ]
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "What is the average time complexity of searching a Hash Map?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
            correctIndex: 0,
            explanation: "Hash maps allow nearly constant time access on average."
          }
        ]
      },
      master: {
        summary: "Arrays and Hashing are the foundation of almost all high-performance algorithms.",
        recommendations: ["Solve 'Two Sum' on LeetCode.", "Study 'Sliding Window' patterns."]
      }
    },
    "Linked Lists": {
      understand: {
        theory: `
# Linked Lists
A linked list is a linear data structure where elements (nodes) are stored in non-contiguous memory locations. Each node contains data and a pointer (reference) to the next node.

### Types of Lists
1. **Singly Linked**: Each node points to the next.
2. **Doubly Linked**: Nodes point both forward and backward.
3. **Circular**: The last node points back to the head.

### Complexity
- **Access**: O(n)
- **Insertion at Head**: O(1)
- **Deletion at Head**: O(1)
- **Space**: O(n)
`,
        examples: [
          {
            title: "Node Definition",
            language: "TypeScript",
            code: "class ListNode {\n  val: number;\n  next: ListNode | null = null;\n  constructor(val: number) { this.val = val; }\n}",
            explanation: "A basic building block for a singly linked list."
          }
        ],
        keyPoints: [
          "Dynamic size, unlike fixed-size arrays.",
          "No random access; you must traverse from the head.",
          "Ideal for implementing stacks and queues."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Implement a function to reverse a singly linked list. Return the new head.",
            starterCode: "function reverseList(head: ListNode | null): ListNode | null {\n  // Your code here\n}",
            hints: ["Use three pointers: prev, curr, and next.", "Initialize prev to null and curr to head."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "What is the time complexity to find an element at index 'k' in a linked list?",
            options: ["O(1)", "O(log N)", "O(k)", "O(1) if you have the pointer"],
            correctIndex: 2,
            explanation: "You must traverse k elements sequentially."
          }
        ]
      },
      master: {
        summary: "You've mastered nodes and pointers, the building blocks of complex memory structures.",
        recommendations: ["Study Floyd's Cycle-Finding Algorithm.", "Implement a Doubly Linked List."]
      }
    },
    "Trees & Graphs": {
      understand: {
        theory: `
# Trees & Graphs
Non-linear data structures that represent hierarchical (Trees) or networked (Graphs) relationships.

### Trees
A tree is a connected graph with no cycles. 
- **Binary Tree**: Each node has at most 2 children.
- **Binary Search Tree (BST)**: Left child < Parent < Right child.
- **Traversal**: In-order, Pre-order, Post-order.

### Graphs
A set of vertices (nodes) and edges (connections).
- **Directed vs Undirected**.
- **Weighted vs Unweighted**.
- **Search**: DFS (Depth First Search) and BFS (Breadth First Search).
`,
        examples: [
          {
            title: "BST Definition",
            language: "TypeScript",
            code: "class TreeNode {\n  val: number;\n  left: TreeNode | null = null;\n  right: TreeNode | null = null;\n  constructor(val: number) { this.val = val; }\n}",
            explanation: "The structure for a node in a binary tree."
          }
        ],
        keyPoints: [
          "Trees are excellent for hierarchical data (folders, Org charts).",
          "Graphs can model anything from social networks to GPS routing.",
          "O(log N) search in balanced trees is highly efficient."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Calculate the maximum depth of a binary tree.",
            starterCode: "function maxDepth(root: TreeNode | null): number {\n  // Your code here\n}",
            hints: ["Use recursion.", "Depth = 1 + max(leftDepth, rightDepth)."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "In a Binary Search Tree, what is the complexity of finding a value?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            correctIndex: 1,
            explanation: "Each step cuts the search space in half (if balanced)."
          }
        ]
      },
      master: {
        summary: "You can now model complex real-world relationships in code.",
        recommendations: ["Study AVL and Red-Black Trees.", "Learn Dijkstra's Algorithm."]
      }
    }
  },
  "Scalable Systems Design": {
    "Vertical vs Horizontal Scaling": {
      understand: {
        theory: `
# Vertical vs Horizontal Scaling
Scaling is how we handle more traffic.

### Vertical Scaling (Scaling Up)
Adding more CPU, RAM, or Disk to a single server.
- **Pros**: Simple, consistent. No architectural changes.
- **Cons**: Hardware limits, single point of failure.

### Horizontal Scaling (Scaling Out)
Adding more servers and distributing traffic among them.
- **Pros**: Unlimited scale, high availability (if one dies, others live).
- **Cons**: Requires Load Balancers, complex distributed logic, data synchronization issues.
`,
        examples: [
          {
            title: "Horizontal Scaling with Load Balancer",
            language: "Diagram Concept",
            code: "[Client] -> [Load Balancer] -> [Server 1, Server 2, Server 3]",
            explanation: "Traffic is shared across multiple stateless instances."
          }
        ],
        keyPoints: [
          "Vertical scaling is usually the starting point.",
          "Horizontal scaling is required for truly massive, resilient apps.",
          "Statelessness is the key to easy horizontal scaling."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Your single server is running at 95% CPU due to a traffic spike. You need high availability. What is your first step in moving to horizontal scaling?",
            starterCode: "### ARCHITECTURAL PROPOSAL:\n",
            hints: ["Think about where the traffic goes first.", "Mention a 'Load Balancer'."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "Which scaling approach avoids a 'Single Point of Failure'?",
            options: ["Vertical Scaling", "Horizontal Scaling", "Both", "Neither"],
            correctIndex: 1,
            explanation: "Horizontal scaling uses multiple servers, so if one fails, the others can continue serving requests."
          }
        ]
      },
      master: {
        summary: "You now understand the fundamental tradeoff of system growth.",
        recommendations: ["Learn about Nginx and HAProxy.", "Study the CAP theorem."]
      }
    },
    "Microservices vs Monoliths": {
      understand: {
        theory: `
# Microservices vs Monoliths
Architectural patterns for organizing code and deployment.

### Monolithic Architecture
A single, unified unit. Functional, but difficult to scale parts independently.
- **Pros**: Simple deployment, easy testing, low latency (calls are in-memory).
- **Cons**: Difficult to scale, long build times, "Blast Radius" (one bug takes down the whole app).

### Microservices Architecture
Application as a collection of loose-coupled services.
- **Pros**: Independent scaling, technology freedom, isolated failures.
- **Cons**: Operational complexity, network latency, data consistency issues.
`,
        examples: [
          {
            title: "Microservices Communication",
            language: "Natural Language",
            code: "OrderService -> (via HTTP/gRPC) -> InventoryService",
            explanation: "Services talk over the network, necessitating robust APIs."
          }
        ],
        keyPoints: [
          "Don't start with microservices (Premature Scaling).",
          "Use Monoliths for speed and simplicity in early stages.",
          "Adopt Microservices when the team size or scale requires it."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "A massive monolith is slowing down the team. The 'Image Processing' module is causing memory leaks. How would you apply microservices here?",
            starterCode: "### REFACTORING PLAN:\n",
            hints: ["Isolate the Image Processing into its own service.", "Decide how it communicates with the main app."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "What is the primary operational headache of Microservices?",
            options: ["Writing code", "Distributed tracing and debugging", "Hardware costs", "Code style"],
            correctIndex: 1,
            explanation: "Since logic is spread across services, finding where a request failed is much harder."
          }
        ]
      },
      master: {
        summary: "You can now architect systems for global-scale engineering teams.",
        recommendations: ["Study Kubernetes (K8s).", "Learn about API Gateways."]
      }
    }
  },
  "Full Stack Mastery": {
    "Frontend Fundamentals": {
      understand: {
        theory: `
# Frontend Fundamentals
Modern frontend development focuses on **Components**, **State**, and **Reactivity**.

### The DOM vs Virtual DOM
The DOM represents the actual document. The Virtual DOM is a lightweight copy used by frameworks like React to calculate updates efficiently.

### State Management
Where Does the data live? 
- **Local State**: One component.
- **Global State**: Accessible by the entire app (Redux, Zustand, Context).
`,
        examples: [
          {
            title: "React Functional Component",
            language: "JSX",
            code: "function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}",
            explanation: "Uses local state to manage a simple interaction."
          }
        ],
        keyPoints: [
          "Keep components small and focused.",
          "Lift state up only when necessary.",
          "Semantic HTML improves accessibility and SEO."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Create a simple 'ProfileCard' component that accepts 'name' and 'role' as props.",
            starterCode: "const ProfileCard = ({ name, role }) => {\n  return (\n    // Your JSX here\n  );\n}",
            hints: ["Use Tailwind classes for styling.", "Display the props inside <h2> and <p> tags."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          {
            question: "What is the primary benefit of the Virtual DOM?",
            options: ["Saves disk space", "Reduces actual DOM manipulations", "Makes the site look better", "Increases JS execution time"],
            correctIndex: 1,
            explanation: "By calculating changes in memory first, React avoids unnecessary and expensive updates to the real DOM."
          }
        ]
      },
      master: {
        summary: "Frontend development is about building predictable, interactive user interfaces.",
        recommendations: ["Master CSS Flexbox/Grid.", "Explore Next.js for server-side rendering."]
      }
    }
  }
};
