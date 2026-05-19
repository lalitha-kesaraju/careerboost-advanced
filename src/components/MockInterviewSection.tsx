import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../App';
import { recordActivity } from '../services/statsService';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Mic } from 'lucide-react';
import SetupScreen from './Interview/SetupScreen';
import ReadyScreen from './Interview/ReadyScreen';
import InterviewScreen from './Interview/InterviewScreen';
import AnalysisScreen from './Interview/AnalysisScreen';
import { InterviewData, AnalysisReport } from '../types';
import { analyzeInterview } from '../services/interviewAnalysis';

type StepType = 'setup' | 'ready' | 'interview' | 'analysis';

export function MockInterviewSection({ resumeData }: { resumeData?: any }) {
  const [currentStep, setCurrentStep] = useState<StepType>('setup');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ role: 'ai' | 'user', content: string }[]>([]);

  const { user, refreshUsage } = useAuth();

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
      const analysis = await analyzeInterview(interviewData, mockHistory);
      setAnalysisReport(analysis);

      // Persist to Firestore
      if (user) {
        const interviewId = `int_${Date.now()}`;
        const interviewRef = doc(db, 'users', user.uid, 'interviews', interviewId);
        
        await setDoc(interviewRef, {
          id: interviewId,
          userId: user.uid,
          role: interviewData.jobRole,
          feedback: analysis,
          transcript: mockHistory,
          createdAt: new Date().toISOString()
        });

        // Increment usage
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'usage.mockInterviews': increment(1)
        });
        
        recordActivity(user.uid, 'interview', 'Interview Calibrated', `Performance analysis generated for: ${interviewData.jobRole}`);
        
        refreshUsage();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate performance analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };


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

    </div>
  );
}
