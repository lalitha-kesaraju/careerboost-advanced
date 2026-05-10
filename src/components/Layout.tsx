import React from 'react';
import { useAuth } from '../App';
import { MithraAssistant } from './MithraAssistant';
import { VoiceCompanion } from './VoiceCompanion';
import { 
  LayoutDashboard, 
  FileText, 
  Mic2, 
  Sparkles, 
  Briefcase, 
  Target, 
  LogOut,
  User as UserIcon,
  Crown,
  FolderHeart,
  Volume2,
  Bot,
  Upload,
  FileEdit,
  BarChart3,
  MessageSquare,
  BookOpen,
  Code,
  Activity,
  Brain,
  GraduationCap,
  ClipboardList,
  Book,
  Lock,
  Menu,
  ChevronDown,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: any) => void;
  resumeData?: any;
  onLogout?: () => void;
}

export function Layout({ children, currentView, onNavigate, resumeData, onLogout }: LayoutProps) {
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);
  let userData: any = null;
  let logout: any = null;
  
  try {
    // Try to get auth context if available
    const auth = useAuth();
    userData = auth?.userData;
    logout = auth?.logout;
  } catch (e) {
    // If useAuth fails, we're using simplified auth
    // Load user from localStorage for display
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      userData = {
        displayName: user.name,
        email: user.email,
        tier: 'basic'
      };
    }
  }

  const handleLogout = onLogout || logout;

  const hasResume = !!resumeData;
  const hasTargetRole = !!resumeData?.targetRole;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Coach', icon: Bot },
    { id: 'resume-upload', label: 'Resume Upload', icon: Upload },
    { id: 'builder', label: 'Resume Builder', icon: FileEdit },
    { id: 'resume-analysis', label: 'Resume Analysis', icon: BarChart3, isLocked: !hasResume },
    { id: 'skill-gap-analysis', label: 'Skill Gap Analysis', icon: Target, isLocked: !hasResume },
    { id: 'career-advice', label: 'Career Advice', icon: MessageSquare, isLocked: !hasTargetRole },
    { id: 'learning-plan', label: 'Learning Plan', icon: BookOpen, isLocked: !hasTargetRole },
    { id: 'code-ide', label: 'Code Editor', icon: Code },
    { id: 'dsa-course', label: 'DSA Course', icon: Activity },
    { id: 'aptitude-v5', label: 'Aptitude Mastery', icon: Brain },
    { id: 'psychometric-test', label: 'Personality Test', icon: UserIcon },
    { id: 'higher-studies', label: 'Higher Studies', icon: GraduationCap },
    { id: 'examination', label: 'Examination', icon: ClipboardList },
    { id: 'mock-interview', label: 'Mock Interview', icon: Mic2 },
    { id: 'courses', label: 'Courses', icon: Book },
    { id: 'job-tracker', label: 'Job Tracker', icon: Briefcase },
  ];

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    isLocked?: boolean;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] flex flex-col h-full z-20 shrink-0">
        <div className="p-6">
          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Mithra Careers</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.15em] opacity-60">Elite Career Platform</p>
          </div>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar pr-1">
            {(navItems as NavItem[]).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.isLocked && onNavigate(item.id)}
                  id={`nav-${item.id}`}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden ${
                    isActive 
                      ? 'bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  } ${item.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.isLocked && <Lock className="w-3 h-3 ml-auto opacity-40" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 bg-black/20">
          <button 
             onClick={() => setIsVoiceOpen(true)}
             className="w-full mb-4 py-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600/20 transition-all font-bold text-xs uppercase tracking-widest"
             id="voice-companion-trigger"
          >
             <Volume2 className="w-4 h-4" />
             AI Companion
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#F0F4F8] flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 h-20 shrink-0 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4">
             <button className="p-2 lg:hidden">
               <Menu className="w-6 h-6 text-gray-500" />
             </button>
             {/* Current View Title is removed per image, it uses a breadcrumb/title in body */}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-[#F8FAFC] rounded-2xl p-2 px-4 border border-gray-100">
               <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                 {userData?.displayName?.charAt(0) || 'U'}
               </div>
               <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{userData?.displayName || 'User'}</p>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono tracking-tight lowercase">{userData?.email || 'demo@mithracareers.com'}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">{userData?.tier || 'BASIC'} TIER</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all relative">
                <span className="w-5 h-5 flex items-center justify-center">📊</span>
                <span className="text-sm font-semibold text-gray-700">Activity</span>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">12</div>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all">
                <Menu className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Menu</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          {children}
        </div>
      </main>
      {/* Floating Mithra */}
      <MithraAssistant />
      <AnimatePresence>
        {isVoiceOpen && <VoiceCompanion isOpen={isVoiceOpen} onToggle={() => setIsVoiceOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
