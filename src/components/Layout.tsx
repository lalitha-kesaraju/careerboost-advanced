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
  Bell,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: any) => void;
  resumeData?: any;
}

export function Layout({ children, currentView, onNavigate, resumeData }: LayoutProps) {
  const { userData, logout, stats } = useAuth();
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);

  const hasResume = !!resumeData;
  const hasTargetRole = !!resumeData?.targetRole;
  const sessionsCount = stats?.sessions || 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coach', label: 'Mithra AI Coach', icon: Bot },
    { id: 'progress', label: 'Growth Roadmap', icon: Activity },
    { id: 'resume-upload', label: 'Resume Upload', icon: Upload },
    { id: 'builder', label: 'Resume Builder', icon: FileEdit },
    { id: 'resume-analysis', label: 'Resume Analysis', icon: BarChart3, isLocked: !hasResume },
    { id: 'skill-gap-analysis', label: 'Skill Gap Analysis', icon: Target, isLocked: !hasResume },
    { id: 'career-advice', label: 'Career Advice', icon: MessageSquare, isLocked: !hasTargetRole },
    { id: 'learning-plan', label: 'Learning Plan', icon: BookOpen, isLocked: !hasTargetRole },
    { id: 'code-ide', label: 'Code Editor', icon: Code },
    { id: 'dsa-course', label: 'DSA Course', icon: Activity },
    { id: 'aptitude-v5', label: 'Aptitude Mastery', icon: Brain },
    { id: 'role-quiz', label: 'Role Diagnostics', icon: ClipboardList, isLocked: !hasTargetRole },
    { id: 'higher-studies', label: 'Higher Studies', icon: GraduationCap },
    { id: 'psychometric-test', label: 'Personality Test', icon: UserIcon },
    { id: 'interviews', label: 'Mock Interview', icon: Mic2 },
    { id: 'job-tracker', label: 'Job Tracker', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    isLocked?: boolean;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-zinc-200/50 flex flex-col h-full z-20 shrink-0">
        <div className="p-10">
          <div className="flex items-center gap-3.5 mb-12">
            <div className="w-10 h-10 bg-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-cyan-100 italic text-xl">
               C
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight font-display leading-none mb-1">CareerBoost</h1>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Career OS</span>
            </div>
          </div>

          <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar pr-1">
            {(navItems as NavItem[]).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.isLocked && onNavigate(item.id)}
                  id={`nav-${item.id}`}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all group relative ${
                    isActive 
                      ? 'bg-cyan-50 text-cyan-600' 
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  } ${item.isLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-cyan-600' : 'text-zinc-500 group-hover:text-zinc-600'}`} />
                  <span className="flex-1 text-left tracking-tight">{item.label}</span>
                  {item.isLocked && <Lock className="w-3 h-3 ml-auto opacity-30 text-zinc-500" />}
                  {isActive && (
                    <motion.div 
                       layoutId="activeNav"
                       className="absolute left-0 w-1 h-6 bg-cyan-600 rounded-r-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-3">
          <button 
             onClick={() => setIsVoiceOpen(true)}
             className="w-full py-4 bg-cyan-600 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-700 transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-cyan-100"
             id="voice-companion-trigger"
          >
             <Volume2 className="w-4 h-4" />
             AI Companion
          </button>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-5 py-3 rounded-2xl text-[13px] font-bold text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-all group"
          >
            <LogOut className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden bg-[#FDFDFD] flex flex-col swiss-grid">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 h-24 shrink-0 flex items-center justify-between px-12">
          <div className="flex items-center gap-10">
             <button className="p-2 lg:hidden text-zinc-500 hover:bg-zinc-50 rounded-xl transition-colors">
               <Menu className="w-6 h-6" />
             </button>
             <div className="hidden lg:block">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Session Overview</span>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight font-display leading-tight">
                  {navItems.find(i => i.id === currentView)?.label || 'Overview'}
                </h2>
             </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div 
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-4 group cursor-pointer"
            >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-zinc-900 leading-none mb-1.5 group-hover:text-cyan-600 transition-colors">{userData?.displayName || 'User'}</p>
                  <p className="text-[10px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50/50 px-2 py-0.5 rounded-md uppercase tracking-wider">{userData?.tier || 'BASIC'} PLAN</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-cyan-600 font-bold border border-zinc-200 shadow-sm group-hover:border-cyan-200 transition-all overflow-hidden relative">
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover relative z-10" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative z-10">{userData?.displayName?.charAt(0) || 'U'}</span>
                    </>
                  )}
                </div>
            </div>
            
            <div className="flex items-center gap-3.5">
              <button className="hidden sm:flex items-center gap-2.5 px-5 py-3 bg-white border border-zinc-200 rounded-2xl hover:border-cyan-600 hover:text-cyan-600 transition-all font-bold text-[11px] text-zinc-600 uppercase tracking-widest relative group">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full group-hover:animate-ping" />
                Network OK
              </button>
              
              <button className="flex items-center justify-center w-11 h-11 bg-white text-zinc-500 border border-zinc-200 rounded-2xl hover:bg-zinc-50 hover:text-zinc-600 transition-all relative">
                <Bell className="w-5 h-5" />
                <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-12 lg:p-16 relative custom-scrollbar">
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
