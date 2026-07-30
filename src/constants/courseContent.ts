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
  },
  "AI Agents & Microsoft Foundry": {
    "Generative AI & Microsoft Foundry Foundations": {
      understand: {
        theory: `
# Generative AI & Microsoft Foundry Foundations

Generative AI creates new content — text, code, images, audio, video — by predicting the most likely output from patterns learned during training, rather than retrieving or classifying existing data. It is powered by **Large Language Models (LLMs)**, which learn grammar, context, and relationships between words from massive text datasets.

### From LLM to AI Agent
A raw LLM only generates a response to a prompt. An **AI Agent** goes further by combining four components:
1. **LLM** — the reasoning engine that understands requests and generates responses.
2. **Instructions** — define the agent's role and behavioral boundaries (e.g. "answer politely, escalate complex issues").
3. **Tools** — let the agent act: web search, database queries, code execution, calendar management, ticket creation.
4. **Knowledge Sources** — give the agent access to specific information: company docs, FAQs, internal databases.

This is the key distinction from a traditional chatbot: a chatbot answers from a script; an agent can retrieve real data and take real actions.

### The Five AI Solution Types
Microsoft groups AI capability into five categories, often combined in one application:
- **Generative AI and Agents** — content generation, conversational assistants, task automation.
- **Natural Language Processing (NLP)** — sentiment analysis, entity recognition, summarization.
- **Computer Speech** — speech-to-text, text-to-speech, real-time transcription.
- **Computer Vision** — object detection, OCR, image classification.
- **Information Extraction** — pulling structured data out of invoices, forms, and scanned documents.

### Microsoft Foundry
Microsoft Foundry is a unified platform (at ai.azure.com) for building, testing, deploying, and managing AI models and agents on Azure, so developers aren't stitching together disconnected services by hand.

- **Foundry Resource** — the Azure resource providing compute, storage, and security; the shared container underneath one or more Projects.
- **Project** — the workspace where a specific AI solution's models, agents, tools, and knowledge sources actually live.
- **Model Catalog** — browse and deploy models from Microsoft (Phi), OpenAI (GPT), and others like Llama and Mistral, choosing based on cost, accuracy, and required capabilities.
- **Foundry Tools** — ready-to-use AI services so you don't train custom models for common tasks: Azure Language (sentiment/entity/summarization), Azure Speech (STT/TTS), Azure Translator, Azure Document Intelligence (invoices/receipts/forms), Azure Content Understanding (multimodal: documents + images + video + audio).

### Responsible AI — Six Principles
Because AI models are probabilistic, not deterministic, they can be wrong, biased, or opaque. Microsoft's Responsible AI framework has six principles: **Fairness** (no unfair advantage/disadvantage to any group), **Reliability and Safety** (consistent, tested, monitored behavior), **Privacy and Security** (protecting data from misuse and attack), **Inclusiveness** (works for people of all backgrounds and abilities), **Transparency** (users know they're talking to AI and understand its limits), and **Accountability** (a human, not the AI, is ultimately responsible for outcomes).

### The AI Solution Development Process
A structured seven-step lifecycle: **1)** Define the business requirement (what problem, for whom, measured how) **2)** Identify required AI capabilities **3)** Select models and services **4)** Build the solution (create Foundry project, deploy models, configure agents, connect knowledge sources) **5)** Test and validate (accuracy, security, Responsible AI compliance) **6)** Deploy **7)** Monitor and improve continuously — AI development doesn't stop at launch.
`,
        examples: [
          {
            title: "Agent vs. Chatbot: the leave-balance test",
            language: "Scenario",
            code: "User: \"What is my leave balance?\"\n\nTraditional chatbot -> \"I don't have access to that information.\"\n\nAI Agent (HR Assistant) -> connects to the HR system via a Tool,\nretrieves the actual balance, and answers accurately.",
            explanation: "The difference isn't language understanding — both can parse the question. The difference is that the agent has a Tool connected to a real system, and knowledge sources to ground the answer in fact."
          }
        ],
        keyPoints: [
          "An AI Agent = LLM + Instructions + Tools + Knowledge Sources — not just a bigger prompt.",
          "Foundry Resource is the shared infrastructure; a Project is the workspace for one specific solution.",
          "Foundry Tools exist because not every problem needs an LLM — dedicated services are often faster, cheaper, and more accurate for tasks like sentiment analysis or invoice extraction.",
          "All six Responsible AI principles apply throughout the lifecycle, not just as a final review step.",
          "The Solution Development Process starts with the business problem, never with 'which model should we use.'"
        ]
      },
      apply: {
        problems: [
          {
            prompt: "You're asked to design an AI Agent for an IT Helpdesk that resets passwords and creates support tickets. Identify the agent's four components: what LLM role, what instructions, what tools, and what knowledge sources would it need?",
            starterCode: "### AGENT DESIGN\nLLM role:\nInstructions:\nTools:\nKnowledge Sources:",
            hints: ["Tools must map to real actions — 'reset password' implies a specific system API, not just a text response.", "Knowledge sources should be things the LLM doesn't already know, like internal ticketing categories."],
            testCases: []
          },
          {
            prompt: "A retail company wants to: (1) let customers ask questions in chat, (2) analyze the sentiment of product reviews, (3) let a warehouse camera flag damaged packages. Map each requirement to one of the five AI Solution Types.",
            starterCode: "1) Chat questions -> \n2) Review sentiment -> \n3) Damaged package detection -> ",
            hints: ["Two of the three map cleanly onto specific Foundry Tools rather than a general LLM."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          { question: "What are the four components of an AI Agent?", options: ["Model, Prompt, Temperature, Tokens", "LLM, Instructions, Tools, Knowledge Sources", "Portal, SDK, API, CLI", "Fairness, Safety, Privacy, Transparency"], correctIndex: 1, explanation: "These four combine to let an agent understand, decide, act, and ground its answers in real data." },
          { question: "What is the main advantage of an AI Agent over a traditional chatbot?", options: ["It uses fewer tokens", "It can access external tools and knowledge sources to take real action", "It never makes mistakes", "It doesn't require an LLM"], correctIndex: 1, explanation: "A chatbot is limited to scripted responses; an agent can retrieve live data and perform actions." },
          { question: "In Microsoft Foundry, what is the relationship between a Foundry Resource and a Project?", options: ["They are the same thing", "A Resource is the shared infrastructure; a Project is the workspace for one specific solution", "A Project contains many Resources", "Resources are only used for billing"], correctIndex: 1, explanation: "One Foundry Resource can support multiple Projects, sharing common infrastructure." },
          { question: "Which Foundry Tool would you use to extract vendor name and total from a scanned invoice?", options: ["Azure Speech", "Azure Translator", "Azure Document Intelligence", "Azure Content Understanding"], correctIndex: 2, explanation: "Document Intelligence is purpose-built for structured extraction from invoices, receipts, and forms." },
          { question: "Which Responsible AI principle is about a human ultimately being responsible for an AI system's outcomes?", options: ["Transparency", "Accountability", "Inclusiveness", "Reliability and Safety"], correctIndex: 1, explanation: "Even though an AI system appears autonomous, the deploying organization is accountable for its decisions." },
          { question: "Why are AI models described as 'probabilistic rather than deterministic'?", options: ["They cost money to run", "They generate predictions based on probability, not absolute certainty, so testing and monitoring matter", "They only work with images", "They require GPUs"], correctIndex: 1, explanation: "This is why thorough testing and ongoing monitoring — not just initial validation — are part of Reliability and Safety." },
          { question: "What is the FIRST step in the AI Solution Development Process?", options: ["Select a model from the catalog", "Define the business requirement", "Deploy to production", "Write the system prompt"], correctIndex: 1, explanation: "Starting with technology before the problem is a common and costly mistake." },
          { question: "A company wants to automatically translate product pages into 12 languages. Which Foundry Tool fits best?", options: ["Azure Translator", "Azure Speech", "Azure Document Intelligence", "A general-purpose LLM with no tool"], correctIndex: 0, explanation: "Azure Translator is purpose-built and more reliable/cost-effective for high-volume translation than asking an LLM to translate freeform." }
        ]
      },
      master: {
        summary: "You can now distinguish an LLM from an AI Agent, map a business problem to one of the five AI solution types, navigate Microsoft Foundry's Resource/Project/Model Catalog structure, and apply the six Responsible AI principles throughout a solution's lifecycle — not just at the end.",
        recommendations: ["Move to 'Building a GenAI Chat App' to go hands-on with the Foundry SDK and Responses API.", "Try mapping your own product's features onto the five AI solution types.", "Read Microsoft's official Responsible AI Standard for the full governance detail behind these six principles."]
      }
    },
    "Building a GenAI Chat App with Microsoft Foundry": {
      understand: {
        theory: `
# Building a GenAI Chat App with Microsoft Foundry

Before writing code, Microsoft Foundry's **Model Playground** lets you test a model with zero code: set a system message, send prompts, tune parameters, and — critically — click **Code** to export a working SDK sample. The workflow is always: **explore in the playground → generate code → build → iterate.**

### Three Dials You Must Understand
- **Temperature** (0.0–2.0): controls randomness. Low (0.2) for facts and code; high (0.9) for brainstorming. Higher temperature means *more varied*, not *more correct*.
- **Top P** (0.0–1.0): nucleus sampling, an alternate way to control variety. Tune Temperature OR Top P — not both at once.
- **Max Tokens**: caps reply length (a token ≈ ¾ of a word). Protects cost and latency.

### Two Endpoints, Two SDKs
Every Foundry project exposes two endpoints, and each pairs with a specific SDK:
- **Project endpoint** (\`.../api/projects/<project>\`) → use the **Foundry SDK** (\`azure-ai-projects\`, \`AIProjectClient\`). Unlocks Foundry-native features: agents, evaluations, tracing, connections, direct models like Phi/DeepSeek.
- **Azure OpenAI endpoint** (\`.../openai/v1\`) → use the **OpenAI SDK** directly. Maximum compatibility and portability between OpenAI and Azure.

Both ultimately give you an OpenAI-compatible chat client — \`project_client.get_openai_client()\` returns one from the Foundry side.

### Authentication
**Microsoft Entra ID** (via \`DefaultAzureCredential\`) is the recommended approach for production — no secrets in code, the app runs as a trusted identity. **API keys** are convenient for prototyping but must live in Azure Key Vault, never hardcoded — this is a frequently tested exam point and a real security requirement.

### Responses API vs. ChatCompletions API
- **Responses API** (recommended for new apps): stateful by default. Pass \`previous_response_id\` to link turns — the API remembers context for you. Merges the older ChatCompletions and Assistants APIs into one.
- **ChatCompletions API** (legacy, widely compatible): you manage memory yourself by appending every turn to a \`messages\` list and resending the whole history each call. Forgetting to append the assistant's own reply is the single most common bug — the bot then "forgets" what it just said.

### The Request Path
Every chat app follows the same shape: **Your App → SDK (adds auth, builds request) → Endpoint (the model's address) → Model → Response flows back.**
`,
        examples: [
          {
            title: "Foundry SDK setup (Python)",
            language: "python",
            code: "from azure.identity import DefaultAzureCredential\nfrom azure.ai.projects import AIProjectClient\n\nendpoint = \"https://<res>.services.ai.azure.com/api/projects/<project>\"\n\nproject_client = AIProjectClient(\n    credential=DefaultAzureCredential(),\n    endpoint=endpoint,\n)\nopenai_client = project_client.get_openai_client(api_version=\"2024-10-21\")",
            explanation: "DefaultAzureCredential signs in with your current Azure identity (run `az login` first) — no API key in code. get_openai_client() is the Foundry SDK method that hands you an OpenAI-compatible client."
          },
          {
            title: "Responses API — stateful multi-turn chat",
            language: "python",
            code: "r1 = client.responses.create(model=m, input=\"What is machine learning?\")\nr2 = client.responses.create(model=m, input=\"Give me an example\",\n                              previous_response_id=r1.id)  # remembers!\nprint(r2.output_text)",
            explanation: "previous_response_id is the whole mechanism — it links this turn to the last one so the model has conversational memory without you resending anything."
          },
          {
            title: "ChatCompletions — manual memory loop",
            language: "python",
            code: "messages = [{\"role\":\"system\",\"content\":\"You are helpful.\"}]\nwhile True:\n    text = input(\"You: \")\n    if text == \"quit\": break\n    messages.append({\"role\":\"user\",\"content\":text})\n    c = openai_client.chat.completions.create(model=\"gpt-4o\", messages=messages)\n    reply = c.choices[0].message.content\n    messages.append({\"role\":\"assistant\",\"content\":reply})  # don't forget this!",
            explanation: "Common mistake: forgetting to append the assistant's reply back into messages. Skip that line and the bot loses the thread on the very next turn."
          }
        ],
        keyPoints: [
          "Playground is for exploring ideas with zero code; SDK is for shipping.",
          "AIProjectClient -> Project endpoint. OpenAI client -> Azure OpenAI endpoint. Both can be used in the same app.",
          "Entra ID is the production auth answer; API keys belong in Key Vault, never in source.",
          "Responses API remembers state for you via previous_response_id; ChatCompletions makes you track messages[] yourself.",
          "Get the client once at startup and reuse it — don't recreate it on every request."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Write the Foundry SDK setup code to connect to a project endpoint and get an OpenAI-compatible client, using Entra ID authentication (no API keys).",
            starterCode: "from azure.identity import DefaultAzureCredential\nfrom azure.ai.projects import AIProjectClient\n\n# TODO: create project_client and get openai_client\n",
            hints: ["You need DefaultAzureCredential() and the project endpoint URL.", "The method that returns a chat client is get_openai_client()."],
            testCases: []
          },
          {
            prompt: "Build a stateful chat loop using the Responses API that lets a user have a multi-turn conversation, correctly threading previous_response_id.",
            starterCode: "last_id = None\nwhile True:\n    msg = input(\"You: \")\n    if msg.lower() == \"quit\": break\n    # TODO: call client.responses.create with previous_response_id=last_id\n    # TODO: print output and update last_id\n",
            hints: ["The response object has .output_text and .id.", "last_id must be updated after every turn, or context breaks."],
            testCases: []
          },
          {
            prompt: "Fix this broken ChatCompletions loop — it forgets everything the assistant says. Find and fix the bug.",
            starterCode: "messages = [{\"role\":\"system\",\"content\":\"You are helpful.\"}]\nwhile True:\n    text = input(\"You: \")\n    messages.append({\"role\":\"user\",\"content\":text})\n    c = openai_client.chat.completions.create(model=\"gpt-4o\", messages=messages)\n    print(c.choices[0].message.content)\n    # BUG IS HERE",
            hints: ["Compare against the working example in the theory section above.", "What line is missing after printing the reply?"],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          { question: "Which endpoint pairs with the Foundry SDK's AIProjectClient?", options: ["Azure OpenAI endpoint", "Project endpoint", "Storage endpoint", "Public endpoint"], correctIndex: 1, explanation: "AIProjectClient connects to the project endpoint (…/api/projects/…)." },
          { question: "Which chat API does Microsoft recommend for NEW Foundry apps?", options: ["ChatCompletions", "Assistants", "Responses", "Embeddings"], correctIndex: 2, explanation: "The Responses API is recommended and is stateful by default." },
          { question: "Which Python package provides the Foundry SDK?", options: ["openai", "azure-ai-projects", "azure-storage", "foundry-sdk"], correctIndex: 1, explanation: "Install azure-ai-projects (plus azure-identity and openai)." },
          { question: "Recommended authentication for a PRODUCTION app?", options: ["API key in source code", "Microsoft Entra ID", "Anonymous access", "A shared password"], correctIndex: 1, explanation: "Entra ID is identity-based — no secrets in code." },
          { question: "Which Responses API parameter maintains context across calls?", options: ["temperature", "max_output_tokens", "previous_response_id", "stream"], correctIndex: 2, explanation: "previous_response_id links the new turn to the last one." },
          { question: "In ChatCompletions, how is conversation context retained?", options: ["Automatically by the API", "By manually tracking the messages list", "Via previous_response_id", "It cannot be retained"], correctIndex: 1, explanation: "You append each turn to messages and resend it." },
          { question: "Which Foundry SDK method returns an OpenAI-compatible client?", options: ["get_client()", "create_chat()", "get_openai_client()", "connect()"], correctIndex: 2, explanation: "project_client.get_openai_client() returns the chat client." },
          { question: "Which property holds the text in a Responses API reply?", options: ["message.content", "output_text", "choices[0]", "result"], correctIndex: 1, explanation: "response.output_text contains the generated text." },
          { question: "Which parameter controls randomness / creativity?", options: ["top_k", "temperature", "max_tokens", "seed"], correctIndex: 1, explanation: "Higher temperature = more varied; lower = more focused." },
          { question: "The Responses API unifies which two older APIs?", options: ["Embeddings + Images", "ChatCompletions + Assistants", "Whisper + TTS", "Files + Batch"], correctIndex: 1, explanation: "It merges ChatCompletions and Assistants into one experience." },
          { question: "To stream partial output incrementally, you set:", options: ["async=True", "stream=True", "live=True", "partial=True"], correctIndex: 1, explanation: "stream=True yields output as it is generated." },
          { question: "In ChatCompletions, which role defines the assistant's persona?", options: ["user", "assistant", "system", "tool"], correctIndex: 2, explanation: "The system message sets behaviour and rules." },
          { question: "Where can you test a model with NO code?", options: ["Azure CLI", "Model playground", "Key Vault", "Resource group"], correctIndex: 1, explanation: "The playground is the no-code testing environment." }
        ]
      },
      master: {
        summary: "You can now describe the full build process for a Foundry chat app, use the Model Playground to prototype, choose the right endpoint/auth/SDK combination, and implement both the Responses API and ChatCompletions API — including their memory models and the most common bug in each.",
        recommendations: [
          "Complete the official hands-on lab: deploy a model, generate SDK code from the playground, and run it end to end.",
          "Move to 'Enterprise AI Agents & Workflow Patterns' to see how this chat app foundation extends into M365-integrated agents.",
          "Real-world use cases to practice on: a customer-support chatbot, an internal knowledge assistant, or a document Q&A tool."
        ]
      }
    },
    "Enterprise AI Agents & Workflow Patterns": {
      understand: {
        theory: `
# Enterprise AI Agents & Workflow Patterns

Once an agent works in isolation, the next step is embedding it into where people already work — Microsoft 365 and Teams — and giving it structured, repeatable workflows instead of one-off replies.

### Microsoft 365 Integration
Agents built with Azure AI Foundry and Copilot Studio access M365 data (email, calendar, files, contacts, sites) through the **Microsoft Graph API** — a single authenticated REST surface for the whole M365 ecosystem. **Graph connectors** extend this to non-Microsoft data sources (SAP, ServiceNow, custom databases). Authentication runs through **Microsoft Entra ID**, either delegated (acting as the signed-in user) or application permissions (acting as a service principal). Critically: **AI does not bypass compliance controls** — every agent action is still governed by the tenant's existing sensitivity labels, DLP policies, and retention policies.

### Teams Integration
Agents deploy as **Teams bots** for 1:1 chat, group chats, or channels. Copilot Studio agents publish directly to Teams with no custom bot development. They can post **Adaptive Cards** (structured, interactive — approve/reject/submit without switching apps), summarize **meeting transcripts** into action items, and send **proactive messages** triggered by external events rather than waiting for a user prompt. **Single sign-on (SSO)** means the agent inherits the user's Entra ID identity for every downstream call.

### Work IQ
Microsoft's framework for applying AI to workplace productivity: agents build a picture of *what a user is actually working on* from contextual signals (recent emails, calendar, documents, collaboration patterns). This powers **meeting preparation** (auto-briefing before a calendar event), **people knowledge** (surfacing the right colleague), and **writing assistance** calibrated to the user's own tone. Work IQ agents strictly respect **permission boundaries** — an agent cannot surface content the user isn't already allowed to see, no matter what's technically retrievable via the Graph API.

### Workflow Patterns
A workflow is a structured sequence combining model calls, tool calls, conditional logic, and human checkpoints:
- **Sequential** — steps execute in order, each fed by the previous step's output.
- **Parallel** — independent sub-tasks run simultaneously and results are aggregated.
- **Conditional branching** — different paths based on model output or business rules (e.g. routing by topic classification).
- **Human-in-the-loop (HITL)** — the workflow pauses at a checkpoint for a human to review, approve, or modify before continuing.
- **Retry and fallback** — automatic retries with backoff, and a fallback action when a primary tool/model is unavailable.
- **Event-driven** — triggered by an external event (new email, Teams message, file upload, webhook) instead of a user prompt, enabling background automation.

### Power Fx in Workflows
Microsoft's open-source, Excel-syntax-based low-code formula language. Lets non-developers set variables, build conditional logic, and transform connector data inside Copilot Studio agents — strongly typed with compile-time validation, and natively queries **Dataverse** tables.

### Real Automation Scenarios
IT service desk (Tier-1 autonomy, escalate on low confidence), HR onboarding (accounts, training, orientation, HRIS updates), contract review (extract terms, flag non-standard clauses, route via Adaptive Cards), meeting follow-up (transcribe → action items → Planner tasks → summary email), customer support escalation (classify → retrieve KB → draft → route complex cases), and compliance monitoring (scan for policy violations, generate audit trails). Success requires: **clear scope boundaries, human escalation paths, audit logging, permission governance, and measurable KPIs.**
`,
        examples: [
          {
            title: "Event-driven vs. sequential — same task, different trigger",
            language: "Scenario",
            code: "Sequential: User asks agent to \"summarize this meeting\" -> agent runs one linear pipeline.\n\nEvent-driven: Teams meeting ends -> webhook fires -> agent transcribes,\nextracts action items, creates Planner tasks, emails summary -> \nno user prompt required at all.",
            explanation: "The event-driven version is what makes 'meeting follow-up automation' actually valuable in practice — it runs with zero manual initiation."
          }
        ],
        keyPoints: [
          "Graph API is the single entry point for M365 data; Graph connectors extend it to non-Microsoft systems.",
          "AI agents never bypass existing DLP/retention/sensitivity-label policies — compliance is enforced the same way regardless of who (or what) is accessing the data.",
          "Work IQ respects permission boundaries strictly: an agent can't show a user something they couldn't already see themselves.",
          "HITL and retry/fallback patterns exist specifically because production workflows fail in ways a single happy-path demo never shows.",
          "Power Fx lets business analysts modify agent logic without writing Python or C#."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Design a workflow for automated invoice approval: invoices under $500 auto-approve, $500-$5000 need a manager's Adaptive Card approval in Teams, over $5000 needs two approvals. Which workflow pattern(s) from the theory section apply, and in what order?",
            starterCode: "### WORKFLOW DESIGN\nPattern(s) used:\nStep-by-step flow:",
            hints: ["This needs more than one pattern — think about branching AND human-in-the-loop together.", "What happens if the Adaptive Card approval times out? That's a retry/fallback question."],
            testCases: []
          },
          {
            prompt: "An HR onboarding agent needs to: provision an M365 account, send a welcome email, and schedule an orientation meeting — but only after IT confirms hardware is ready. Identify which steps can run in parallel and which must be sequential.",
            starterCode: "Sequential steps:\nParallel steps:\nDependency (must wait for):",
            hints: ["Two of these three tasks don't depend on each other or on IT hardware confirmation."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          { question: "What is the single unified REST API surface for accessing M365 data and services?", options: ["Azure Resource Manager", "Microsoft Graph API", "Dataverse API", "Teams SDK"], correctIndex: 1, explanation: "Graph API provides access to all M365 data and services through one authenticated endpoint." },
          { question: "What extends the indexable content surface to non-M365 data sources like SAP or ServiceNow?", options: ["Graph connectors", "Adaptive Cards", "Power Fx", "Copilot Studio"], correctIndex: 0, explanation: "Graph connectors index custom/external data sources so agents and Copilot can query them." },
          { question: "Which workflow pattern pauses execution for a human to review or approve before continuing?", options: ["Sequential pattern", "Event-driven pattern", "Human-in-the-loop (HITL) pattern", "Parallel pattern"], correctIndex: 2, explanation: "HITL checkpoints are essential wherever an autonomous action carries real risk." },
          { question: "What triggers an event-driven workflow?", options: ["A user typing a prompt", "An external event like a new email, Teams message, or webhook", "A scheduled daily reset", "Nothing — it runs constantly"], correctIndex: 1, explanation: "Event-driven workflows enable fully automated background processing without a user initiating anything." },
          { question: "What does Power Fx allow non-developers to do inside Copilot Studio agents?", options: ["Train new LLMs", "Write formula-based logic and transformations without Python/C#/JavaScript", "Manage Azure billing", "Configure network firewalls"], correctIndex: 1, explanation: "Power Fx is Excel-syntax based, letting business analysts customize agent logic directly." },
          { question: "True or False: An AI agent with application permissions can bypass a tenant's DLP policies to complete a task faster.", options: ["True", "False"], correctIndex: 1, explanation: "AI does not bypass compliance controls — all existing governance still applies regardless of who/what is acting." },
          { question: "What does Work IQ strictly respect when surfacing information to a user?", options: ["The user's calendar color scheme", "Permission boundaries — it can't show what the user can't already access", "The size of the user's mailbox", "Nothing, it has full access always"], correctIndex: 1, explanation: "This is a hard constraint regardless of what's technically retrievable via Graph API." },
          { question: "Which pattern is best suited to analyzing 10 independent uploaded documents at once?", options: ["Sequential pattern", "Parallel pattern", "Conditional branching", "Retry and fallback"], correctIndex: 1, explanation: "Independent, decomposable sub-tasks are the textbook case for the parallel pattern." }
        ]
      },
      master: {
        summary: "You can now design agent workflows using the six core patterns (sequential, parallel, conditional, HITL, retry/fallback, event-driven), understand how Graph API and Graph connectors ground an agent in real M365 and enterprise data, and apply the governance guardrails (scope boundaries, escalation paths, audit logging) that separate a demo from a production automation.",
        recommendations: [
          "Move to 'Microsoft Agent Framework' to see how memory and planning combine with these workflow patterns programmatically.",
          "Practice mapping a real process at your own organization onto these six patterns before building anything.",
          "Review Copilot Studio's Power Fx documentation if you'll be handing workflow logic to non-developer teammates."
        ]
      }
    },
    "Microsoft Agent Framework: Memory, Planning & Tools": {
      understand: {
        theory: `
# Microsoft Agent Framework: Memory, Planning & Tools

Modern AI is evolving from simple chatbots into intelligent agents that reason about problems, use external tools, maintain memory, and execute multi-step tasks autonomously. Microsoft Agent Framework combines LLMs, memory systems, planning engines, and tool integrations into a platform for building and managing these agents.

### Agent SDK
The Agent SDK provides the tools, libraries, and APIs to build agents efficiently, with reusable components that cut implementation complexity:
- **Agent Creation APIs** — quickly create, configure, and deploy agents.
- **Workflow Orchestration** — coordinates multiple tasks in a structured sequence.
- **Memory Integration** — store, access, and reuse prior interactions.
- **Tool Connectivity** — connect to external tools, APIs, databases, enterprise apps.
- **Agent Lifecycle Management** — from creation through monitoring and maintenance.
- **Extensible Architecture** — add capabilities later without a redesign.

### Agent Development Process
A structured lifecycle, not an ad-hoc build: **Define Agent Objective → Configure Agent Behavior → Connect Data Sources → Integrate Tools → Configure Memory → Implement Planning Logic → Test and Deploy.**

### Tool Integration
Tools let an agent go beyond conversation: databases, APIs, web services, enterprise applications, knowledge bases, and cloud services. This is what turns "the agent can describe an action" into "the agent can actually perform the action."

### Agent Memory
Two distinct types, each solving a different problem:
- **Short-Term Memory** — current conversation context and session state. Lost when the session ends.
- **Long-Term Memory** — historical interactions and user preferences, persisted across sessions to support genuine personalization (this is the mechanism behind "the agent remembers you struggled with system design questions last time").

### Agent Planning
Planning is what separates an agent from a single-shot responder — it determines the sequence of actions needed to reach a goal:
- **Goal Decomposition** — break a complex goal into smaller, manageable subtasks.
- **Task Sequencing** — determine the correct execution order.
- **Decision Making** — evaluate alternatives and select the right action.
- **Workflow Execution** — coordinate multiple tasks automatically.
- **Multi-Step Reasoning** — chain logical reasoning across several steps rather than answering in one shot.

### Security and Governance
Non-negotiable for any agent with real tool access: **Identity Management, Access Control, Data Protection, Secure Tool Access, Compliance Monitoring** (security considerations) plus **Agent Auditing, Activity Monitoring, Policy Enforcement, Responsible AI Principles** (governance practices). An agent that can take real actions needs real audit trails — "the AI did it" is never an acceptable answer to "why did this happen."
`,
        examples: [
          {
            title: "Short-term vs. long-term memory in practice",
            language: "Scenario",
            code: "Short-term: \"Earlier in THIS conversation you asked about X, so I'm\nreferencing that context now.\"\n\nLong-term: \"Across your last 3 mock interview sessions, you\nconsistently struggled with system design questions — let's\nfocus there today.\"",
            explanation: "Short-term memory dies with the session; long-term memory is what makes an agent feel like it actually knows you over time — it requires deliberate persistence, not just a longer context window."
          }
        ],
        keyPoints: [
          "The Agent Development Process is sequential: objective -> behavior -> data -> tools -> memory -> planning -> test/deploy. Skipping steps (e.g. no clear objective) is the most common cause of a flaky agent.",
          "Short-term memory = this session. Long-term memory = across sessions. Confusing the two is a common design mistake.",
          "Goal Decomposition + Task Sequencing + Decision Making together are what 'planning' actually means — it's not one single feature.",
          "Security and Governance are listed last in the framework but must be designed in from step one, not bolted on after deployment.",
          "Extensible Architecture means you shouldn't need a full redesign every time you add one new tool or capability."
        ]
      },
      apply: {
        problems: [
          {
            prompt: "Design the memory strategy for a study-coaching agent: within one session it should track which questions the student got wrong; across all sessions over a month it should track topics the student consistently struggles with. Specify exactly what goes in short-term vs. long-term memory.",
            starterCode: "### MEMORY DESIGN\nShort-term memory holds:\nLong-term memory holds:\nWhat triggers writing from short-term into long-term?",
            hints: ["Not everything in short-term memory needs to graduate to long-term — think about what's actually worth persisting.", "Consider: does one wrong answer count as a 'consistent struggle', or does it need a pattern across sessions?"],
            testCases: []
          },
          {
            prompt: "Apply Goal Decomposition and Task Sequencing to this objective: 'Plan and send a project status update to 3 stakeholders with different levels of technical detail.' Break it into an ordered list of subtasks.",
            starterCode: "Goal: Plan and send a project status update to 3 stakeholders\n\nSubtasks (in order):\n1.\n2.\n3.\n...",
            hints: ["Different stakeholders likely need different content, not just the same email three times.", "Consider what needs to happen before drafting can even start."],
            testCases: []
          }
        ]
      },
      evaluate: {
        questions: [
          { question: "What are the two types of Agent Memory described in the framework?", options: ["Fast and Slow", "Short-Term and Long-Term", "Local and Cloud", "Public and Private"], correctIndex: 1, explanation: "Short-term holds current session context; long-term retains historical interactions and preferences for personalization." },
          { question: "Which capability breaks a complex goal into smaller, manageable subtasks?", options: ["Task Sequencing", "Goal Decomposition", "Workflow Execution", "Tool Connectivity"], correctIndex: 1, explanation: "Goal Decomposition is specifically about breaking down complexity before any sequencing happens." },
          { question: "What is the correct order of the Agent Development Process?", options: ["Deploy -> Test -> Define Objective", "Define Objective -> Configure Behavior -> Connect Data -> Integrate Tools -> Configure Memory -> Implement Planning -> Test and Deploy", "Configure Memory -> Define Objective -> Deploy", "Integrate Tools -> Test -> Define Objective"], correctIndex: 1, explanation: "This is a structured lifecycle — skipping or reordering steps (like adding tools before defining the objective) is a common source of unreliable agents." },
          { question: "Which Agent SDK feature specifically reduces the effort of adding new capabilities later?", options: ["Agent Lifecycle Management", "Extensible Architecture", "Workflow Orchestration", "Memory Integration"], correctIndex: 1, explanation: "Extensible Architecture is defined as flexibility to add features without a major redesign." },
          { question: "Under Security and Governance, what ensures accountability when an agent takes an incorrect action?", options: ["A faster LLM", "Agent Auditing and Activity Monitoring", "More training data", "A longer context window"], correctIndex: 1, explanation: "Auditing and monitoring provide the trail needed to understand and correct agent behavior after the fact." },
          { question: "What does Tool Connectivity actually enable that a plain LLM prompt cannot do alone?", options: ["Faster token generation", "Interacting with real external systems — databases, APIs, enterprise apps — to perform actions", "Better grammar", "Lower cost per token"], correctIndex: 1, explanation: "This is the same theme as 'AI Agent vs Traditional Chatbot' — real action requires real tool access." },
          { question: "Multi-Step Reasoning, as part of Agent Planning, refers to:", options: ["Answering in the fewest tokens possible", "Performing logical reasoning across multiple steps rather than a single-shot answer", "Running multiple LLMs at once for redundancy", "Storing multiple copies of the same memory"], correctIndex: 1, explanation: "It's specifically about chaining reasoning steps toward a goal, not about speed or redundancy." }
        ]
      },
      master: {
        summary: "You can now describe the Agent SDK's core building blocks, follow the seven-step Agent Development Process in the right order, design short-term vs. long-term memory strategies for a real scenario, and explain how Goal Decomposition, Task Sequencing, and Decision Making combine into genuine agent planning — plus why Security and Governance have to be designed in from the start, not added afterward.",
        recommendations: [
          "Combine this with 'Enterprise AI Agents & Workflow Patterns' — planning logic and workflow patterns (sequential/parallel/HITL) are two views of the same underlying idea.",
          "Design a long-term memory schema for one real agent idea of your own before writing any code.",
          "Review your own project's agent-adjacent features (if any) against the Security and Governance checklist: identity, access control, data protection, auditing."
        ]
      }
    }
  }
};
