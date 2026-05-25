/**

 * @license

 * SPDX-License-Identifier: Apache-2.0

 */



import React, { createContext, useContext, useEffect, useState } from 'react';

import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

import { Layout } from './components/Layout';

import { handleFirestoreError, OperationType } from './services/firestoreService';

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

import { AptitudeMasterySection } from './components/AptitudeMasterySection';

import { MockInterviewSection } from './components/MockInterviewSection';

import { JobTrackerSection } from './components/JobTrackerSection';

import { PortfolioSection } from './components/PortfolioSection';

import { SettingsSection } from './components/SettingsSection';

import { BigFiveTest } from './components/BigFiveTest';

import { AuthPage } from './components/AuthPage';

import { AdminDashboard } from './components/Admin/AdminDashboard';

import { ProgressSection } from './components/ProgressSection';

import { IdeSection } from './components/IdeSection';

import { CoachSection } from './components/CoachSection';

import { fetchUserStats, DashboardStats, recordActivity } from './services/statsService';

import { motion, AnimatePresence } from 'motion/react';

import { LogIn, Rocket } from 'lucide-react';



import { auth, db } from './firebase';



import { DEMO_USERS } from './data/mockUsers';

import {

  createLocalAccount, loginLocalAccount, getDemoAccount,

  getLocalSession, setLocalSession, clearLocalSession,

  LocalSession,

} from './services/localAuth';



// Unified user shape — works for both Firebase and local accounts

export interface AppUser {

  uid: string;

  email: string | null;

  displayName: string | null;

  photoURL?: string | null;

  isLocal?: boolean;

  getIdToken: () => Promise<string | null>;

}



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

}



// Contexts

interface AuthContextType {

  user: AppUser | null;

  userData: UserData | null;

  loading: boolean;

  login: (email: string, pass: string, displayName?: string) => Promise<void>;

  loginAsDemo: () => Promise<void>;

  logout: () => Promise<void>;

  refreshUsage: () => Promise<void>;

  refreshStats: () => Promise<void>;

  authError: string | null;

  stats: DashboardStats | null;

}



const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<AppUser | null>(null);

  const [userData, setUserData] = useState<UserData | null>(null);

  const [loading, setLoading] = useState(true);

  const [authError, setAuthError] = useState<string | null>(null);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);



  useEffect(() => {

    // â”€â”€ Check for local session first (localStorage accounts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const localSession = getLocalSession();

    if (localSession) {

      const localUser: AppUser = {

        uid: localSession.uid,

        email: localSession.email,

        displayName: localSession.displayName,

        isLocal: true,

        getIdToken: async () => null,

      };

      setUser(localUser);

      setUserData({

        userId: localSession.uid,

        email: localSession.email,

        displayName: localSession.displayName,

        tier: localSession.tier,

        usage: { resumeAnalyses: 0, skillGaps: 0, careerAdviceCount: 0, mockInterviews: 0, jobApplicationsCount: 0, learningPlans: 0 },

        ...JSON.parse(localStorage.getItem(`cb_userdata_${localSession.uid}`) ?? '{}'),

      });

      setLoading(false);

      return; // skip Firebase auth listener

    }



    let unsubscribeSnapshot: (() => void) | null = null;



    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {

      // Clean up previous snapshot listener

      if (unsubscribeSnapshot) {

        unsubscribeSnapshot();

        unsubscribeSnapshot = null;

      }



      setUser(u as AppUser | null);

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

          const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);

          const isAdminEmail = adminEmails.includes((u.email || '').toLowerCase());

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

          const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);

          const isAdminEmail = adminEmails.includes((u.email || '').toLowerCase());

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



  const login = async (email: string, pass: string, displayName?: string) => {

    setAuthError(null);

    setIsLoggingIn(true);

    try {

      // â”€â”€ Try local accounts first â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

      const localAccount = loginLocalAccount(email, pass);

      if (localAccount) {

        const session = setLocalSession(localAccount);

        const savedData = JSON.parse(localStorage.getItem(`cb_userdata_${localAccount.uid}`) ?? '{}');

        const ud: UserData = {

          userId: localAccount.uid,

          email: localAccount.email,

          displayName: localAccount.displayName,

          tier: localAccount.tier,

          usage: { resumeAnalyses: 0, skillGaps: 0, careerAdviceCount: 0, mockInterviews: 0, jobApplicationsCount: 0, learningPlans: 0 },

          ...savedData,

        };

        setUser({ uid: localAccount.uid, email: localAccount.email, displayName: localAccount.displayName, isLocal: true, getIdToken: async () => null });

        setUserData(ud);

        return;

      }



      // â”€â”€ If not local, check if it's a "create account" request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

      // When displayName is provided, create a new local account

      if (displayName) {

        const newAccount = createLocalAccount(email, pass, displayName);

        const session = setLocalSession(newAccount);

        const ud: UserData = {

          userId: newAccount.uid,

          email: newAccount.email,

          displayName: newAccount.displayName,

          tier: newAccount.tier,

          usage: { resumeAnalyses: 0, skillGaps: 0, careerAdviceCount: 0, mockInterviews: 0, jobApplicationsCount: 0, learningPlans: 0 },

        };

        localStorage.setItem(`cb_userdata_${newAccount.uid}`, JSON.stringify(ud));

        setUser({ uid: newAccount.uid, email: newAccount.email, displayName: newAccount.displayName, isLocal: true, getIdToken: async () => null });

        setUserData(ud);

        return;

      }



      // â”€â”€ Fall back to Firebase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

      try {

        await signInWithEmailAndPassword(auth, email, pass);

      } catch (signInError: any) {

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



  const loginAsDemo = async () => {

    const demo = getDemoAccount();

    await login(demo.email, 'Demo@1234');

  };



  const logout = async () => {

    clearLocalSession();

    setUser(null);

    setUserData(null);

    try { await signOut(auth); } catch {}

  };



  const refreshStats = async () => {

    if (user) {

      const s = await fetchUserStats(user.uid);

      setStats(s);

    }

  };



  const refreshUsage = async () => {

    if (user) {

      if (user.isLocal) return; // local users don't need remote refresh

      const token = await user.getIdToken();

      const resp = await fetch(`/api/user/usage/${user.uid}`, {

        headers: { 'Authorization': `Bearer ${token}` }

      });

      if (resp.ok) {

        const data = await resp.json();

        setUserData(data);

      }

    }

  };



  return (

    <AuthContext.Provider value={{ user, userData, loading: loading || isLoggingIn, login, loginAsDemo, logout, refreshUsage, refreshStats, authError, stats }}>

      {children}

    </AuthContext.Provider>

  );

}



const AUTH_FALLBACK: AuthContextType = {

  user: null, userData: null, loading: true,

  login: async () => {}, loginAsDemo: async () => {}, logout: async () => {},

  refreshUsage: async () => {}, refreshStats: async () => {},

  authError: null, stats: null,

};



export const useAuth = () => {

  const context = useContext(AuthContext);

  // During Vite HMR module replacement, context may briefly be undefined.

  // Return a safe loading fallback instead of crashing the component tree.

  return context ?? AUTH_FALLBACK;

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

  const [selectedBootcamp, setSelectedBootcamp] = useState<'dsa' | 'prompt-engineering' | 'system-design'>('dsa');



  if (loading) {

    return (

      <div className="h-screen w-full flex items-center justify-center">

        <motion.div 

          animate={{ rotate: 360 }}

          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}

          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"

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



          {/* Placeholders for genuinely unbuilt tabs */}

          {['analysis', 'code', 'dsa', 'studies', 'exam', 'tracker', 'higher-studies', 'examination'].includes(currentView) && (

            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm">

                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-700 mb-6">

                   <Rocket className="w-10 h-10" />

                </div>

                <h2 className="text-3xl font-black mb-4">Under Development</h2>

                <p className="text-gray-500 max-w-md italic serif text-lg">

                  The <span className="text-blue-700 font-bold">"{currentView}"</span> experience is currently being optimized by our AI engineers. Check back soon for the full launch!

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


