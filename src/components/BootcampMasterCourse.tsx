import React, { useState } from 'react';
import { BootcampOverview } from './BootcampOverview';
import { DSA4PhaseLearning } from './DSA4PhaseLearning';

interface BootcampProps {
  type: 'dsa' | 'prompt-engineering' | 'system-design' | 'full-stack' | 'mobile' | 'languages';
  onBack: () => void;
}

const BOOTCAMP_DATA = {
  'languages': {
    title: 'Modern Language Mastery',
    steps: [
      'Python for Automation', 'Advanced JavaScript (ES6+)', 'Go: Concurrent Systems', 
      'Rust for Safety', 'TypeScript Orchestration', 'C++ Performance'
    ]
  },
  'dsa': {
    title: 'DSA Master Curriculum',
    steps: [
      'Arrays & Hashing', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 
      'Sorting & Searching', 'Stacks & Queues', 'Heaps', 'Tries', 'Backtracking', 
      'Sliding Window', 'Bit Manipulation', 'Greedy'
    ]
  },
  'prompt-engineering': {
    title: 'Prompt Engineering Elite',
    steps: [
      'Foundations of LLMs', 'Zero-Shot & Few-Shot', 'Chain of Thought', 
      'Prompt Patterns', 'Output Structuring', 'Context Injection', 
      'Advanced Orchestration', 'Multi-Agent Paradigms', 'Safety & Guardrails', 
      'Prompt Injection Defense'
    ]
  },
  'system-design': {
    title: 'Scalable Systems Architect',
    steps: [
      'Vertical vs Horizontal Scaling', 'Load Balancers', 'Relational vs NoSQL',
      'Caching Strategies', 'Message Queues', 'Consistency Patterns',
      'Microservices Architecture', 'API Gateway Patterns'
    ]
  },
  'full-stack': {
    title: 'Full Stack Masterclass',
    steps: [
      'Frontend Fundamentals', 'State Management', 'Backend Architecture',
      'Database Design', 'Authentication & Security', 'Deployment & CI/CD',
      'Testing Strategies', 'Real-time Features'
    ]
  },
  'mobile': {
    title: 'Mobile Architecture',
    steps: [
      'Cross-Platform Selection', 'Native Bridging', 'State Management (Mobile)',
      'Offline Persistence', 'Push Notifications', 'App Store Deployment',
      'UI/UX Mobile Guidelines'
    ]
  }
};

export function BootcampMasterCourse({ type, onBack }: BootcampProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'learning'>('overview');
  const [activeStep, setActiveStep] = useState(0);

  const bootcamp = BOOTCAMP_DATA[type];

  const handleStartStep = (index: number) => {
    setActiveStep(index);
    setCurrentView('learning');
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      {currentView === 'overview' ? (
        <div className="space-y-8">
          <button onClick={onBack} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs text-gray-400">
             Back to Course Selection
          </button>
          <BootcampOverview type={type} onStart={handleStartStep} />
        </div>
      ) : (
        <DSA4PhaseLearning 
          courseTitle={bootcamp.title}
          stepTitle={bootcamp.steps[activeStep]}
          stepIndex={activeStep}
          onBack={() => setCurrentView('overview')}
          onComplete={() => {
            if (activeStep < bootcamp.steps.length - 1) {
              setActiveStep(prev => prev + 1);
            } else {
              setCurrentView('overview');
            }
          }}
        />
      )}
    </div>
  );
}
