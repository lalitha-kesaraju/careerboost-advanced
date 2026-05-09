/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
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
import { LogIn, Rocket } from 'lucide-react';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Types
export interface UserUsage {
  resumeAnalyses: number;
  skillGaps: number;
  careerAdviceCount: number;
  mockInterviews: number;
  jobApplicationsCount: number;
  learningPlans: number;
}

export interface UserData {
  userId: string;
  email: string;
  displayName: string;
  tier: 'basic' | 'medium' | 'premium';
  usage: UserUsage;
}

// Contexts
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUsage: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch or create user record
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newData: UserData = {
            userId: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'User',
            tier: 'basic',
            usage: {
              resumeAnalyses: 0,
              skillGaps: 0,
              careerAdviceCount: 0,
              mockInterviews: 0,
              jobApplicationsCount: 0,
              learningPlans: 0
            }
          };
          await setDoc(userRef, newData);
          setUserData(newData);
        } else {
          setUserData(userSnap.data() as UserData);
          // Set up listener for real-time usage updates
          onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              setUserData(doc.data() as UserData);
            }
          });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    setAuthError(null);
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError("Sign-in popup was blocked. Please enable popups or try 'Open in New Tab'.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        setAuthError("Sign-in request was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("Sign-in window closed before completion. Please try again.");
      } else {
        setAuthError("Failed to sign in. Please try opening the app in a new tab.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUsage = async () => {
    if (user) {
      const resp = await fetch(`/api/user/usage/${user.uid}`);
      if (resp.ok) {
        const data = await resp.json();
        setUserData(data);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading: loading || isLoggingIn, login, logout, refreshUsage, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Main App Component
export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeStep, setResumeStep] = useState<1 | 2 | 3>(1);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F0F4F8] text-[#1A1A1A] font-sans">
        <AppContent 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          resumeData={resumeData}
          setResumeData={setResumeData}
          resumeStep={resumeStep}
          setResumeStep={setResumeStep}
        />
      </div>
    </AuthProvider>
  );
}

function AppContent({ 
  currentView, 
  setCurrentView, 
  resumeData, 
  setResumeData, 
  resumeStep, 
  setResumeStep 
}: { 
  currentView: any, 
  setCurrentView: any,
  resumeData: any,
  setResumeData: any,
  resumeStep: any,
  setResumeStep: any
}) {
  const { user, loading, login, authError } = useAuth();
  const [selectedBootcamp, setSelectedBootcamp] = useState<'dsa' | 'prompt-engineering' | 'system-design'>('dsa');

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-md"
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
            <Rocket className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-4">CareerBoost Elite: Pivot Architect</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Unlock your professional potential with AI-powered career tools. 
            Analyze resumes, practice interviews, and track your progress—all in one place.
          </p>
          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-black transition-colors disabled:opacity-50"
            id="login-button"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Get Started with Google
              </>
            )}
          </button>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm italic serif"
            >
              {authError}
            </motion.div>
          )}

          <p className="text-xs text-gray-400 mt-6 font-mono uppercase tracking-widest text-center">
            Free Tier • secure • AI-Powered
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} resumeData={resumeData}>
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
                  setCurrentView('resume-upload'); // Ensure we stay in upload during review
                }} />
              )}
              {resumeStep === 2 && (
                <ResumeReviewSection 
                  initialData={resumeData} 
                  onPrev={() => setResumeStep(1)}
                  onNext={(data) => {
                    setResumeData(data);
                    setResumeStep(3);
                    setCurrentView('resume-analysis'); // Transition to analysis view
                  }} 
                />
              )}
              {(resumeStep === 3 || currentView === 'resume-analysis') && (
                <ResumeAnalysisSection 
                  data={resumeData} 
                  onReset={() => setResumeStep(1)} 
                  onNavigate={setCurrentView}
                  onDataUpdate={(newData) => setResumeData(prev => ({...(prev || {}), ...newData}))}
                />
              )}
            </>
          )}

          {(currentView === 'skills' || currentView === 'skill-gap-analysis') && (
            <SkillGapSection 
              resumeData={resumeData} 
              targetRole={resumeData?.targetRole}
              onNavigate={setCurrentView} 
              onDataUpdate={(newData) => setResumeData(prev => ({...(prev || {}), ...newData}))}
            />
          )}

          {(currentView === 'learning' || currentView === 'learning-plan') && (
            <LearningPlanSection 
              goal={resumeData?.targetRole} 
              missingSkills={resumeData?.missingSkills || []} 
              onBack={() => setCurrentView('skill-gap-analysis')} 
              data={resumeData}
              onDataUpdate={(newData) => setResumeData(prev => ({...(prev || {}), ...newData}))}
            />
          )}

          {(currentView === 'advice' || currentView === 'career-advice') && (
            <CareerAdviceSection 
              data={resumeData} 
              onNavigate={setCurrentView} 
              onDataUpdate={(newData) => setResumeData(prev => ({...(prev || {}), ...newData}))}
            />
          )}

          {(currentView === 'courses') && (
            <CoursesSection 
              data={resumeData} 
              onNavigate={(view, extra) => {
                if (view === 'bootcamp' && extra) {
                  setSelectedBootcamp(extra as any);
                  setCurrentView('bootcamp');
                } else {
                  setCurrentView(view);
                }
              }} 
              onDataUpdate={(newData) => setResumeData(prev => ({...(prev || {}), ...newData}))}
            />
          )}

          {currentView === 'bootcamp' && (
            <BootcampMasterCourse 
              type={selectedBootcamp} 
              onBack={() => setCurrentView('courses')} 
            />
          )}

          {currentView === 'dsa-course' && (
            <BootcampMasterCourse 
              type="dsa" 
              onBack={() => setCurrentView('dashboard')} 
            />
          )}

          {currentView === 'assistant' && <MithraChat />}

          {(currentView === 'personality' || currentView === 'psychometric-test' || currentView === 'personality-analysis' || currentView === 'merid') && (
            <MeRIDPsychometricTest />
          )}

          {(currentView === 'aptitude' || currentView === 'aptitude-v5') && <AptitudeTestSection />}

          {(currentView === 'interviews' || currentView === 'mock-interview') && (
            <MockInterviewSection resumeData={resumeData} />
          )}

          {/* Placeholders for other tabs */}
          {['assistant', 'coach', 'builder', 'analysis', 'code', 'dsa', 'studies', 'exam', 'tracker', 'code-ide', 'psychometric-test', 'higher-studies', 'examination', 'job-tracker'].includes(currentView) && !['upload', 'resume-upload', 'resume-analysis', 'skills', 'skill-gap-analysis', 'learning', 'learning-plan', 'advice', 'career-advice', 'courses', 'bootcamp', 'aptitude', 'aptitude-v5', 'interviews', 'mock-interview', 'dsa-course'].includes(currentView) && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6">
                   <Rocket className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black mb-4">Under Development</h2>
                <p className="text-gray-500 max-w-md italic serif text-lg">
                  The <span className="text-indigo-600 font-bold">"{currentView}"</span> experience is currently being optimized by our AI engineers. Check back soon for the full launch!
                </p>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-10 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
                >
                  Back to Dashboard
                </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
