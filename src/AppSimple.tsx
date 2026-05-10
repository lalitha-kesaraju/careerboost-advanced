import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { ResumeUploadSection } from './components/ResumeUploadSection';
import { ResumeReviewSection } from './components/ResumeReviewSection';
import { ResumeAnalysisSection } from './components/ResumeAnalysisSection';
import { SkillGapSection } from './components/SkillGapSection';
import { LearningPlanSection } from './components/LearningPlanSection';
import { CareerAdviceSection } from './components/CareerAdviceSection';
import { CoursesSection } from './components/CoursesSection';
import { BootcampMasterCourse } from './components/BootcampMasterCourse';
import { MithraChat } from './components/MithraChat';
import { MeRIDPsychometricTest } from './components/MeRIDPsychometricTest';
import { AptitudeTestSection } from './components/AptitudeTestSection';
import { MockInterviewSection } from './components/MockInterviewSection';
import { motion, AnimatePresence } from 'motion/react';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

interface AppContextType {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
}

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeStep, setResumeStep] = useState<1 | 2 | 3>(1);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleLogin = (newUser: CurrentUser) => {
    setUser(newUser);
    setCurrentView('dashboard');
  };

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  return (
    <AppContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-[#F0F4F8] text-[#1A1A1A] font-sans">
        <Layout 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          resumeData={resumeData}
          onLogout={handleLogout}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
              
              {(currentView === 'upload' || currentView === 'resume-upload' || currentView === 'resume-analysis') && (
                <>
                  {resumeStep === 1 && (
                    <ResumeUploadSection onNext={(data) => {
                      setResumeData(data);
                      setResumeStep(2);
                      setCurrentView('resume-upload');
                    }} />
                  )}
                  {resumeStep === 2 && (
                    <ResumeReviewSection 
                      initialData={resumeData} 
                      onPrev={() => setResumeStep(1)}
                      onNext={(data) => {
                        setResumeData(data);
                        setResumeStep(3);
                        setCurrentView('resume-analysis');
                      }} 
                    />
                  )}
                  {(resumeStep === 3 || currentView === 'resume-analysis') && (
                    <ResumeAnalysisSection data={resumeData} />
                  )}
                </>
              )}
              
              {currentView === 'skill-gap' && <SkillGapSection />}
              {currentView === 'learning-plan' && <LearningPlanSection />}
              {currentView === 'career-advice' && <CareerAdviceSection />}
              {currentView === 'courses' && <CoursesSection />}
              {currentView === 'bootcamp-master-course' && (
                <BootcampMasterCourse />
              )}
              {currentView === 'mithra-chat' && <MithraChat />}
              {currentView === 'me-ridp' && <MeRIDPsychometricTest />}
              {currentView === 'aptitude-test' && <AptitudeTestSection />}
              {currentView === 'mock-interview' && <MockInterviewSection />}
            </motion.div>
          </AnimatePresence>
        </Layout>
      </div>
    </AppContext.Provider>
  );
}
