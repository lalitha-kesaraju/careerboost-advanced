import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Briefcase, Trophy, Sparkles, Brain, 
  BarChart3, Target, Star, Flame, History, Users, Bell, RefreshCw, WifiOff,
  UserCircle, MessageSquare, Code, Layout, MessageCircle, ArrowRight,
  Plus
} from 'lucide-react';
import SetupScreen from './Interview/SetupScreen';
import ReadyScreen from './Interview/ReadyScreen';
import InterviewScreen from './Interview/InterviewScreen';
import AnalysisScreen from './Interview/AnalysisScreen';
import { InterviewData, AnalysisReport } from '../types';
import { getSessionAnalysis } from '../services/gemini';

type StepType = 'setup' | 'ready' | 'interview' | 'analysis';

export function MockInterviewSection({ resumeData }: { resumeData?: any }) {
  const [currentStep, setCurrentStep] = useState<StepType>('setup');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ role: 'ai' | 'user', content: string }[]>([]);

  const handleStartSetup = (data: InterviewData) => {
    setInterviewData(data);
    setCurrentStep('ready');
  };

  const handleBeginInterview = () => {
    setCurrentStep('interview');
  };

  const handleFinishInterview = async (transcript: string, recordingUrl: string | null) => {
    if (!interviewData) return;
    
    setInterviewData(prev => prev ? { ...prev, transcript: transcript || '', recordingUrl: recordingUrl || undefined } : null);
    setCurrentStep('analysis');
    setIsAnalyzing(true);
    
    // Convert transcript string to history-like array for analysis if needed
    const lines = transcript.split('\n').filter(l => l.trim() !== '');
    const mockHistory = lines.map(line => {
        const isUser = line.toLowerCase().startsWith('user:');
        return { 
            role: (isUser ? 'user' : 'ai') as 'user' | 'ai', 
            content: line.replace(/^(User|Agent|AI): /i, '').trim()
        };
    });
    setHistory(mockHistory);

    try {
      const analysis = await getSessionAnalysis(interviewData, mockHistory);
      setAnalysisReport(analysis);
    } catch (err) {
      console.error(err);
      setError("Failed to generate performance analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const categories = [
    { label: 'PERFORMANCE', items: [
      { icon: BarChart3, label: 'Analytics' },
      { icon: Target, label: 'Practice Drills' },
      { icon: Star, label: 'Daily Challenge' },
      { icon: Flame, label: 'Streak Rewards', badge: true },
      { icon: History, label: 'History' },
    ]},
    { label: 'COMMUNITY', items: [
      { icon: Trophy, label: 'Badges' },
      { icon: UserCircle, label: 'Personality' },
      { icon: Users, label: 'Collaborate' },
      { icon: Bell, label: 'Notifications' },
      { icon: RefreshCw, label: 'Auto-Sync' },
      { icon: WifiOff, label: 'Offline' },
    ]}
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 pb-32 min-h-screen">
      {/* Header & Sidebar Actions */}
      <div className="flex flex-col gap-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <Mic className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">AI Interviewer</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Practice with elite recruiter logic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {categories.map((group, idx) => (
            <div key={idx} className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{group.label}</h3>
                <div className="flex flex-wrap gap-3">
                {group.items.map((item, i) => (
                    <button key={i} className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all group relative">
                    <item.icon className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-600">{item.label}</span>
                    {item.badge && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />}
                    </button>
                ))}
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Main Stepper Navigation */}
      <div className="flex items-center justify-between max-w-2xl mx-auto py-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        {['Setup', 'Ready', 'Interview', 'Analysis'].map((step, i) => {
            const stepId = step.toLowerCase() as StepType;
            const isActive = currentStep === stepId;
            const isCompleted = i < ['setup', 'ready', 'interview', 'analysis'].indexOf(currentStep);

            return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-sm transition-all border-2 ${
                        isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 
                        isCompleted ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-gray-100 text-gray-300'
                    }`}>
                        {isCompleted ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {step}
                    </span>
                </div>
            );
        })}
      </div>

      {/* Component Context Renderer */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentStep === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <SetupScreen onStart={handleStartSetup} resumeData={resumeData} />
            </motion.div>
          )}
          
          {currentStep === 'ready' && interviewData && (
            <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ReadyScreen onStart={handleBeginInterview} interviewData={interviewData} />
            </motion.div>
          )}

          {currentStep === 'interview' && interviewData && (
            <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewScreen interviewData={interviewData} onFinish={handleFinishInterview} />
            </motion.div>
          )}

          {currentStep === 'analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalysisScreen 
                report={analysisReport} 
                isLoading={isAnalyzing} 
                error={error} 
                onRestart={() => {
                    setCurrentStep('setup');
                    setInterviewData(null);
                    setAnalysisReport(null);
                    setHistory([]);
                }} 
                interviewData={interviewData}
                history={history}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Menu (Bottom Right) */}
      <div className="fixed bottom-10 right-10 flex items-center gap-4 z-50">
          <div className="flex gap-2">
            <button className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setCurrentStep('setup')}
                className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center font-bold"
            >
                <Plus className="w-7 h-7" />
            </button>
          </div>
      </div>
    </div>
  );
}
