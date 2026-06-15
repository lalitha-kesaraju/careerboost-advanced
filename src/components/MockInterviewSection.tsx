import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../App';
import { recordActivity } from '../services/statsService';
import { doc, setDoc, updateDoc, increment, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Mic, History, BarChart2, Trophy, Code2 } from 'lucide-react';
import SetupScreen from './Interview/SetupScreen';
import ReadyScreen from './Interview/ReadyScreen';
import InterviewScreen from './Interview/InterviewScreen';
import AnalysisScreen from './Interview/AnalysisScreen';
import InterviewHistoryPanel from './Interview/InterviewHistoryPanel';
import AnalyticsDashboard from './Interview/AnalyticsDashboard';
import BadgeDisplay from './Interview/BadgeDisplay';
import CodingRoundScreen from './Interview/CodingRoundScreen';
import AchievementNotification from './Interview/AchievementNotification';
import { InterviewData, AnalysisReport } from '../types';
import { analyzeInterview } from '../services/interviewAnalysis';
import { loadBadges, loadStreak, updateStreak, checkAndAwardBadges, Badge } from './Interview/services/badgeSystem';

type StepType = 'setup' | 'ready' | 'interview' | 'analysis' | 'history' | 'analytics' | 'badges' | 'coding';

export function MockInterviewSection({ resumeData }: { resumeData?: any }) {
  const [currentStep, setCurrentStep] = useState<StepType>('setup');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ role: 'ai' | 'user', content: string }[]>([]);
  const [viewedAnalysis, setViewedAnalysis] = useState<{ report: AnalysisReport; data: InterviewData } | null>(null);
  const [badges, setBadges] = useState(loadBadges());
  const [streak, setStreak] = useState(loadStreak());
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Badge[]>([]);

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
    
    // Convert transcript string to history-like array for analysis
    // Format from InterviewScreen: "User: ...", "Agent: ...", "SYSTEM: ..."
    const mockHistory = transcript
      .split('\n')
      .map(l => l.trim())
      .filter(l => l !== '' && !l.toLowerCase().startsWith('system:'))
      .map(line => ({
        role: (line.toLowerCase().startsWith('user:') ? 'user' : 'ai') as 'user' | 'ai',
        content: line.replace(/^(User|Agent|AI):\s*/i, '').trim(),
      }))
      .filter(item => item.content !== '');
    setHistory(mockHistory);

    try {
      const analysis = await analyzeInterview(interviewData, mockHistory);
      setAnalysisReport(analysis);

      // Persist to Firestore (Firebase users only)
      if (user) {
        const isLocal = !!(user as any)?.isLocal;
        const interviewId = `int_${Date.now()}`;

        if (!isLocal) {
          const interviewRef = doc(db, 'users', user.uid, 'interviews', interviewId);
          await setDoc(interviewRef, {
            id: interviewId,
            userId: user.uid,
            interviewData: {
              jobRole: interviewData.jobRole,
              dreamCompany: interviewData.dreamCompany ?? null,
              difficultyLevel: interviewData.difficultyLevel,
              language: interviewData.language,
              timeLimit: interviewData.timeLimit,
              isPracticeMode: interviewData.isPracticeMode,
            },
            analysis,
            transcript: mockHistory,
            createdAt: new Date(),
          });

          // Increment usage
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            'usage.mockInterviews': increment(1)
          });
          
          recordActivity(user.uid, 'interview', 'Interview Calibrated', `Performance analysis generated for: ${interviewData.jobRole}`);
          
          // Count total interviews for badge check
          const snap = await getDocs(collection(db, 'users', user.uid, 'interviews'));
          const totalCount = snap.size;
          
          // Update streak
          const newStreak = updateStreak();
          setStreak(newStreak);
          
          // Award badges
          const earned = checkAndAwardBadges({
            totalInterviews: totalCount,
            latestScore: analysis.overall_score ?? 0,
            streak: newStreak,
            isPracticeMode: interviewData.isPracticeMode,
            isHardDifficulty: interviewData.difficultyLevel === 'hard',
            isNonEnglish: interviewData.language !== 'English',
            completedCodingRound: false,
          });
          setBadges(loadBadges());
          if (earned.length > 0) setNewlyEarnedBadges(earned.map(e => e.badge));
          refreshUsage();
        } else {
          // For local/demo users — save to localStorage and update streak/badges locally
          const key = `cb_interviews_${user.uid}`;
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.unshift({ id: interviewId, jobRole: interviewData.jobRole, analysis, createdAt: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
          const newStreak = updateStreak();
          setStreak(newStreak);
          const earned = checkAndAwardBadges({
            totalInterviews: existing.length,
            latestScore: analysis.overall_score ?? 0,
            streak: newStreak,
            isPracticeMode: interviewData.isPracticeMode,
            isHardDifficulty: interviewData.difficultyLevel === 'hard',
            isNonEnglish: interviewData.language !== 'English',
            completedCodingRound: false,
          });
          setBadges(loadBadges());
          if (earned.length > 0) setNewlyEarnedBadges(earned.map(e => e.badge));
        }
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
      {newlyEarnedBadges.length > 0 && (
        <AchievementNotification badges={newlyEarnedBadges} onClose={() => setNewlyEarnedBadges([])} />
      )}
      {/* Header & Sidebar Actions */}
      <div className="flex flex-col gap-10">
        <div className="flex items-start sm:items-center gap-5 flex-wrap">
          <div className="w-16 h-16 bg-blue-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100 shrink-0">
            <Mic className="w-9 h-9" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">AI Interviewer</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Practice with elite recruiter logic</p>
          </div>
          {/* Navigation buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCurrentStep('history')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${currentStep === 'history' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              <History className="w-4 h-4" /> History
            </button>
            <button onClick={() => setCurrentStep('analytics')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${currentStep === 'analytics' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              <BarChart2 className="w-4 h-4" /> Analytics
            </button>
            <button onClick={() => setCurrentStep('badges')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${currentStep === 'badges' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              <Trophy className="w-4 h-4" /> Badges{badges.length > 0 && <span className="ml-1 bg-amber-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{badges.length}</span>}
            </button>
            <button onClick={() => setCurrentStep('coding')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${currentStep === 'coding' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              <Code2 className="w-4 h-4" /> Code Round
            </button>
          </div>
        </div>
      </div>

      {/* Interview Stepper (only visible during main interview flow) */}
      {['setup', 'ready', 'interview', 'analysis'].includes(currentStep) && (
      <div className="flex items-center justify-between max-w-2xl mx-auto py-6 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        {(['setup', 'ready', 'interview', 'analysis'] as const).map((stepId, i) => {
            const labels = ['Setup', 'Ready', 'Interview', 'Analysis'];
            const isActive = currentStep === stepId;
            const isCompleted = i < ['setup', 'ready', 'interview', 'analysis'].indexOf(currentStep);
            return (
                <div key={stepId} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-sm transition-all border-2 ${
                        isActive ? 'bg-blue-700 border-blue-700 text-white shadow-xl shadow-blue-100' : 
                        isCompleted ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-white border-gray-100 text-gray-300'
                    }`}>
                        {isCompleted ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
                        {labels[i]}
                    </span>
                </div>
            );
        })}
      </div>
      )}

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
                report={viewedAnalysis?.report ?? analysisReport} 
                isLoading={isAnalyzing} 
                error={error} 
                onRestart={() => {
                    setCurrentStep('setup');
                    setInterviewData(null);
                    setAnalysisReport(null);
                    setHistory([]);
                    setViewedAnalysis(null);
                }} 
                interviewData={viewedAnalysis?.data ?? interviewData}
                history={history}
              />
            </motion.div>
          )}

          {currentStep === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewHistoryPanel
                onBack={() => setCurrentStep('setup')}
                onViewAnalysis={(report, data) => {
                  setViewedAnalysis({ report, data });
                  setCurrentStep('analysis');
                }}
              />
            </motion.div>
          )}

          {currentStep === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalyticsDashboard onBack={() => setCurrentStep('setup')} />
            </motion.div>
          )}

          {currentStep === 'badges' && (
            <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
                <div className="flex items-center gap-4 mb-2">
                  <button onClick={() => setCurrentStep('setup')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
                    <span className="text-sm font-medium">← Back</span>
                  </button>
                  <h2 className="text-2xl font-black text-gray-900">Achievements</h2>
                </div>
                <BadgeDisplay earnedBadges={badges} streak={streak} />
              </div>
            </motion.div>
          )}

          {currentStep === 'coding' && (
            <motion.div key="coding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CodingRoundScreen
                onBack={() => setCurrentStep('setup')}
                onComplete={() => {
                  // Award coding round badge
                  const newStreak = updateStreak();
                  checkAndAwardBadges({
                    totalInterviews: 0, latestScore: 0, streak: newStreak,
                    isPracticeMode: false, isHardDifficulty: false, isNonEnglish: false,
                    completedCodingRound: true,
                  });
                  setBadges(loadBadges());
                  setCurrentStep('setup');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
