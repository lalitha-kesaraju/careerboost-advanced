/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, Suspense, lazy } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Layout } from './components/Layout';
import { handleFirestoreError, OperationType } from './services/firestoreService';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/Admin/AdminDashboard';

// Lazy-loaded: everything below is behind a nav click, not the first paint,
// so it doesn't need to be in the initial bundle (was one 2.5MB chunk).
const ResumeUploadSection = lazy(() => import('./components/ResumeUploadSection').then(m => ({ default: m.ResumeUploadSection })));
const ResumeReviewSection = lazy(() => import('./components/ResumeReviewSection').then(m => ({ default: m.ResumeReviewSection })));
const ResumeAnalysisSection = lazy(() => import('./components/ResumeAnalysisSection').then(m => ({ default: m.ResumeAnalysisSection })));
const SkillGapSection = lazy(() => import('./components/SkillGapSection').then(m => ({ default: m.SkillGapSection })));
const LearningPlanSection = lazy(() => import('./components/LearningPlanSection').then(m => ({ default: m.LearningPlanSection })));
const CareerAdviceSection = lazy(() => import('./components/CareerAdviceSection').then(m => ({ default: m.CareerAdviceSection })));
const RoleQuizSection = lazy(() => import('./components/RoleQuizSection').then(m => ({ default: m.RoleQuizSection })));
const HigherStudiesSection = lazy(() => import('./components/HigherStudiesSection').then(m => ({ default: m.HigherStudiesSection })));
const CoursesSection = lazy(() => import('./components/CoursesSection').then(m => ({ default: m.CoursesSection })));
const BootcampMasterCourse = lazy(() => import('./components/BootcampMasterCourse').then(m => ({ default: m.BootcampMasterCourse })));
const MithraChat = lazy(() => import('./components/MithraChat').then(m => ({ default: m.MithraChat })));
const MeRIDPsychometricTest = lazy(() => import('./components/MeRIDPsychometricTest').then(m => ({ default: m.MeRIDPsychometricTest })));
const AptitudeMasterySection = lazy(() => import('./components/AptitudeMasterySection').then(m => ({ default: m.AptitudeMasterySection })));
const MockInterviewSection = lazy(() => import('./components/MockInterviewSection').then(m => ({ default: m.MockInterviewSection })));
const JobTrackerSection = lazy(() => import('./components/JobTrackerSection').then(m => ({ default: m.JobTrackerSection })));
const PortfolioSection = lazy(() => import('./components/PortfolioSection').then(m => ({ default: m.PortfolioSection })));
const SettingsSection = lazy(() => import('./components/SettingsSection').then(m => ({ default: m.SettingsSection })));
const BigFiveTest = lazy(() => import('./components/BigFiveTest').then(m => ({ default: m.BigFiveTest })));
const ProgressSection = lazy(() => import('./components/ProgressSection').then(m => ({ default: m.ProgressSection })));
const IdeSection = lazy(() => import('./components/IdeSection').then(m => ({ default: m.IdeSection })));
const CoachSection = lazy(() => import('./components/CoachSection').then(m => ({ default: m.CoachSection })));

import { fetchUserStats, DashboardStats, recordActivity } from './services/statsService';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Rocket, Loader2 } from 'lucide-react';

import { auth, db } from './firebase';

import { DEMO_USERS } from './data/mockUsers';

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
  photoURL?: string;
  targetRole?: string;
  tier: 'basic' | 'medium' | 'premium';
  role?: string;
  usage: UserUsage;
  personalityTraits?: Record<string, number>;
  weakTopics?: string[];
  lastInterviewAt?: string;
}

// Contexts
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUsage: () => Promise<void>;
  refreshStats: () => Promise<void>;
  authError: string | null;
  stats: DashboardStats | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    let isLocalSessionResolved = false;

    // Check for local auth session first (offline simulation fallback)
    const savedLocalSession = localStorage.getItem('local_auth_session');
    if (savedLocalSession) {
      try {
        const { user: savedUser, userData: savedUserData } = JSON.parse(savedLocalSession);
        setUser(savedUser);
        setUserData(savedUserData);
        setLoading(false);
        isLocalSessionResolved = true;
        fetchUserStats(savedUser.uid).then(setStats).catch(console.error);
      } catch (e) {
        console.error("Failed to restore saved local session", e);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      // Clean up previous snapshot listener
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      // If we recovered a local session and u is null, keep the local session!
      if (!u && isLocalSessionResolved) {
        return;
      }

      // if we have a real user logged in via firebase, clear local simulation
      if (u) {
        localStorage.removeItem('local_auth_session');
      }

      setUser(u);
      if (u) {
        // Fetch stats
        const s = await fetchUserStats(u.uid);
        setStats(s);

        // Record Login Activity
        recordActivity(u.uid, 'login', 'System Initialization', `Session started for identity: ${u.email}`);

        // Fetch or create user record
        const userRef = doc(db, 'users', u.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
          return;
        }
        
        if (!userSnap.exists()) {
          const demoUser = DEMO_USERS.find(du => du.email.toLowerCase() === (u.email || '').toLowerCase());
          const isAdminEmail = u.email === 'admin@careerboost.ai' || u.email === 'kesarajulalitha@gmail.com';
          const newData: UserData = {
            userId: u.uid,
            email: u.email || '',
            displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'User'),
            tier: (demoUser?.tier.toLowerCase() as any) || 'premium',
            role: isAdminEmail ? 'Platform Admin' : (demoUser?.role || 'User'),
            usage: {
              resumeAnalyses: 0,
              skillGaps: 0,
              careerAdviceCount: 0,
              mockInterviews: 0,
              jobApplicationsCount: 0,
              learningPlans: 0
            }
          };
          try {
            await setDoc(userRef, newData);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${u.uid}`);
          }
          setUserData(newData);
        } else {
          const data = userSnap.data() as UserData;
          const isAdminEmail = u.email === 'admin@careerboost.ai' || u.email === 'kesarajulalitha@gmail.com';
          if (isAdminEmail && data.role !== 'Platform Admin') {
            data.role = 'Platform Admin';
            // Optionally update firestore too
            updateDoc(userRef, { role: 'Platform Admin' }).catch(console.error);
          }
          setUserData(data);
          // Set up listener for real-time usage updates
          unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              const d = doc.data() as UserData;
              if (isAdminEmail) d.role = 'Platform Admin';
              setUserData(d);
            }
          }, (error) => {
            // Only log errors if we still have a user
            if (auth.currentUser) {
              handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
            }
          });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      // First try to sign in
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (signInError: any) {
        const isNetworkOrConnectionError = 
          signInError.code === 'auth/network-request-failed' || 
          signInError.code === 'auth/internal-error' ||
          signInError.message?.toLowerCase().includes('network') ||
          signInError.message?.toLowerCase().includes('failed-request') ||
          signInError.message?.toLowerCase().includes('fetch');

        if (isNetworkOrConnectionError) {
          console.warn("Firebase Auth network error. Falling back to local offline simulation.");
          // Initialize local simulated auth state
          const demoUser = DEMO_USERS.find(du => du.email.toLowerCase() === email.toLowerCase());
          const mockUid = "local_uid_" + (demoUser?.email.split('@')[0] || email.replace(/[^a-zA-Z0-9]/g, '_'));
          const mockUser = {
            uid: mockUid,
            email: email,
            displayName: demoUser?.email.split('@')[0] || email.split('@')[0],
            photoURL: null,
            emailVerified: true
          } as any;
          
          setUser(mockUser);
          
          // Set up local user data
          const newData: UserData = {
            userId: mockUid,
            email: email,
            displayName: mockUser.displayName,
            tier: (demoUser?.tier.toLowerCase() as any) || 'premium',
            role: email === 'admin@careerboost.ai' || email === 'kesarajulalitha@gmail.com' ? 'Platform Admin' : (demoUser?.role || 'User'),
            usage: {
              resumeAnalyses: 0,
              skillGaps: 0,
              careerAdviceCount: 0,
              mockInterviews: 0,
              jobApplicationsCount: 0,
              learningPlans: 0
            }
          };
          setUserData(newData);
          // Set simulated stats
          const s = await fetchUserStats(mockUid);
          setStats(s);
          
          // Save session to localStorage so that refresh persists local auth
          localStorage.setItem('local_auth_session', JSON.stringify({ user: mockUser, userData: newData }));
          setIsLoggingIn(false);
          return;
        }

        // If user doesn't exist, try creating account (simplified for this "afterwards Supabase" request)
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, email, pass);
        } else {
          throw signInError;
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/invalid-email') {
        setAuthError("Please provide a valid email address.");
      } else if (error.code === 'auth/weak-password') {
        setAuthError("Password should be at least 6 characters.");
      } else if (error.code === 'auth/wrong-password') {
        setAuthError("Incorrect password. Please try again.");
      } else {
        setAuthError(error.message || "Failed to authenticate.");
      }
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('local_auth_session');
    try {
      await signOut(auth);
    } catch (e) {
      console.error("SignOut error:", e);
    }
    setUser(null);
    setUserData(null);
  };

  const refreshStats = async () => {
    if (user) {
      const s = await fetchUserStats(user.uid);
      setStats(s);
    }
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
    <AuthContext.Provider value={{ user, userData, loading: loading || isLoggingIn, login, logout, refreshUsage, refreshStats, authError, stats }}>
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
  const { user, userData, loading, login, authError } = useAuth();
  const [selectedBootcamp, setSelectedBootcamp] = useState<'dsa' | 'prompt-engineering' | 'system-design' | 'full-stack' | 'mobile' | 'languages' | 'ai-agents'>('dsa');

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (userData?.role === 'Platform Admin') {
    return <AdminDashboard />;
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
        <Suspense fallback={
          <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        }>
          {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
          {currentView === 'progress' && <ProgressSection />}
          {currentView === 'coach' && <CoachSection onNavigate={setCurrentView} />}
          
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
                  onPrev={() => {
                    setResumeStep(1);
                    setCurrentView('upload');
                  }}
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
                  onReset={() => {
                    setResumeStep(1);
                    setCurrentView('upload');
                  }} 
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

          {currentView === 'assistant' && <CoachSection onNavigate={setCurrentView} initialTab="chat" />}

          {(currentView === 'personality' || currentView === 'psychometric-test' || currentView === 'personality-analysis' || currentView === 'merid') && (
            <BigFiveTest onClose={() => setCurrentView('dashboard')} />
          )}

          {(currentView === 'aptitude' || currentView === 'aptitude-v5') && <AptitudeMasterySection />}

          {(currentView === 'interviews' || currentView === 'mock-interview') && (
            <MockInterviewSection resumeData={resumeData} />
          )}

          {currentView === 'job-tracker' && <JobTrackerSection />}
          {currentView === 'code-ide' && <IdeSection />}
          {currentView === 'builder' && <PortfolioSection />}
          {currentView === 'settings' && <SettingsSection />}

          {(currentView === 'role-quiz' || currentView === 'quiz') && (
            <RoleQuizSection
              data={resumeData}
              onNavigate={setCurrentView}
              onDataUpdate={(newData) => setResumeData(prev => ({...(prev || {}), ...newData}))}
            />
          )}

          {(currentView === 'higher-studies' || currentView === 'studies') && (
            <HigherStudiesSection
              data={resumeData}
              onDataUpdate={(newData) => setResumeData(prev => ({...(prev || {}), ...newData}))}
            />
          )}

          {/* Placeholders for other tabs */}
          {['assistant', 'coach', 'analysis', 'code', 'dsa', 'exam', 'tracker', 'examination'].includes(currentView) && !['upload', 'resume-upload', 'resume-analysis', 'skills', 'skill-gap-analysis', 'learning', 'learning-plan', 'advice', 'career-advice', 'courses', 'bootcamp', 'aptitude', 'aptitude-v5', 'interviews', 'mock-interview', 'dsa-course', 'job-tracker', 'builder', 'role-quiz', 'quiz', 'higher-studies', 'studies', 'code-ide'].includes(currentView) && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-cyan-50 rounded-3xl flex items-center justify-center text-cyan-600 mb-6">
                   <Rocket className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black mb-4">Under Development</h2>
                <p className="text-gray-500 max-w-md italic serif text-lg">
                  The <span className="text-cyan-600 font-bold">"{currentView}"</span> experience is currently being optimized by our AI engineers. Check back soon for the full launch!
                </p>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-10 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
                >
                  Back to Dashboard
                </button>
            </div>
          )}
        </Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
