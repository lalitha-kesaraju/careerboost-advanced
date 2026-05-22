
export interface Question {
  question: string;
  type: 'technical' | 'behavioral' | 'situational';
}

export interface RoleQuestions {
  technical: Question[];
  hr: Question[];
}

export const interviewQuestions: Record<string, RoleQuestions> = {
  'frontend-engineer': {
    technical: [
      { question: "Explain the difference between `let`, `const`, and `var` in JavaScript.", type: 'technical' },
      { question: "What is the CSS box model?", type: 'technical' },
      { question: "Describe how you would optimize a web page for performance.", type: 'technical' },
      { question: "What are React Hooks? Can you name a few and explain their purpose?", type: 'technical' },
      { question: "Explain the concept of virtual DOM.", type: 'technical' },
    ],
    hr: []
  },
  'backend-engineer': {
    technical: [
      { question: "What is the difference between SQL and NoSQL databases?", type: 'technical' },
      { question: "Explain the concept of RESTful APIs.", type: 'technical' },
      { question: "Describe the request/response cycle in a typical web application.", type: 'technical' },
      { question: "What is containerization and why is it useful? Talk about Docker.", type: 'technical' },
      { question: "How would you handle authentication and authorization in a web service?", type: 'technical' },
    ],
    hr: []
  },
  'general': {
    technical: [],
    hr: [
      { question: "Tell me about yourself.", type: 'behavioral' },
      { question: "What are your biggest strengths and weaknesses?", type: 'behavioral' },
      { question: "Where do you see yourself in five years?", type: 'behavioral' },
      { question: "Describe a challenging situation you faced at work and how you handled it.", type: 'situational' },
      { question: "Why are you interested in this role and our company?", type: 'behavioral' },
    ]
  }
};

// Populate HR questions for specific roles from the general pool
interviewQuestions['frontend-engineer'].hr = interviewQuestions['general'].hr;
interviewQuestions['backend-engineer'].hr = interviewQuestions['general'].hr;
