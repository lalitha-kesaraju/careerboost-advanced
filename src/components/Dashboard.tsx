import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  FileText, 
  Mic2, 
  MessageSquare, 
  Briefcase, 
  Target, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  FolderHeart,
  Activity,
  Award,
  CircleOff,
  Flame,
  BarChart3,
  Bot,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { AchievementPanel } from './AchievementPanel';
import { ActivityFeed } from './ActivityFeed';

interface DashboardProps {
  onNavigate: (view: any) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, userData, stats } = useAuth();
  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'applications'),
      orderBy('appliedDate', 'desc'),
      limit(3)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecentApps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Dashboard onSnapshot error:", error);
    });
    return unsub;
  }, [user]);

  const daysSinceLastInterview = userData?.lastInterviewAt
    ? Math.floor((Date.now() - new Date(userData.lastInterviewAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const showPracticeNudge = daysSinceLastInterview !== null && daysSinceLastInterview >= 5;

  const activityStats = [
    { 
      label: 'TOTAL RESUMES', 
      value: stats?.totalResumes || 0, 
      color: 'bg-cyan-600',
      icon: FileText
    },
    { 
      label: 'SUCCESSFUL', 
      value: stats?.successful || 0, 
      color: 'bg-emerald-500',
      icon: Award
    },
    { 
      label: 'FAILED', 
      value: stats?.failed || 0, 
      color: 'bg-rose-500',
      icon: CircleOff
    },
    { 
      label: 'SESSIONS', 
      value: stats?.sessions || 0, 
      color: 'bg-amber-500',
      icon: Activity
    },
    { 
      label: 'SUCCESS RATE', 
      value: stats?.totalResumes ? `${Math.min(100, Math.round(((stats?.successful || 0) / (stats?.totalResumes || 1)) * 100))}%` : '0%', 
      color: 'bg-purple-600',
      icon: Flame
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 font-display">Welcome, {userData?.displayName?.split(' ')?.[0] || 'User'}</h1>
          <div className="flex items-center gap-4">
            {userData?.targetRole ? (
              <div className="flex items-center gap-2 text-cyan-600">
                 <Target className="w-4 h-4" />
                 <p className="text-sm font-black uppercase tracking-widest">{userData.targetRole} Trajectory</p>
              </div>
            ) : (
              <p className="text-zinc-600 max-w-lg font-medium leading-relaxed">
                Your career trajectory is currently being mapped and optimized.
              </p>
            )}
            <button 
              onClick={() => onNavigate('settings')}
              className="text-[10px] font-black uppercase tracking-tighter text-rose-400 hover:text-rose-600 transition-colors"
            >
              [ Reset History ]
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-zinc-200 font-bold text-zinc-600 text-[11px] uppercase tracking-widest">
          <Clock className="w-4 h-4 text-cyan-600" />
          Next Reset: 12 Days
        </div>
      </header>

      {showPracticeNudge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-6 p-6 bg-amber-50 border border-amber-100 rounded-[2rem]"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-900">
                It's been {daysSinceLastInterview} days since your last mock interview
              </p>
              <p className="text-sm text-amber-700 font-medium">A short practice session keeps your interview skills sharp.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('mock-interview')}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shrink-0"
          >
            Practice Now
          </button>
        </motion.div>
      )}

      {/* Grid Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {activityStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-7 rounded-[2.5rem] hover:border-cyan-200 transition-all group hover:scale-[1.02]"
            >
              <div className="space-y-6">
                <div className={`w-11 h-11 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-xl shadow-cyan-100 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-2.5">{stat.label}</p>
                  <p className="text-3xl font-bold text-zinc-900 tracking-tighter">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-zinc-900 font-display">Active Applications</h3>
              <button 
                onClick={() => onNavigate('job-tracker')} 
                className="text-cyan-600 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:underline group"
              >
                Tracker Console <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden divide-y divide-zinc-50">
              {recentApps.length > 0 ? recentApps.map((app, i) => (
                <div key={app.id || i} className="group flex items-center justify-between p-6 hover:bg-zinc-50 transition-all cursor-default">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center font-bold text-zinc-600 border border-zinc-100 group-hover:bg-white group-hover:shadow-md transition-all text-xl">
                      {app.company ? app.company[0] : 'J'}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 text-base">{app.company}</p>
                      <p className="text-xs text-zinc-600 font-semibold uppercase tracking-wider">{app.jobTitle || app.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10 text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-colors ${
                      app.status === 'offered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      app.status === 'interviewing' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' : 
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-[11px] text-zinc-600 font-bold font-mono hidden sm:block">
                      {app.appliedDate?.toDate ? app.appliedDate.toDate().toLocaleDateString() : 'SEC_OVR'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-24 text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="w-8 h-8 text-zinc-200" />
                  </div>
                  <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Tracking Null State</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="bg-cyan-600 rounded-[3rem] p-14 text-white relative flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl shadow-cyan-200">
               <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.05] -skew-x-12 translate-x-1/2" />
               <div className="relative z-10 space-y-8">
                 <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight leading-[0.95]">
                   Calibrate your<br/>Market Success.
                 </h2>
                 <p className="text-cyan-100 font-medium max-w-sm leading-relaxed text-lg">
                   Launch high-fidelity AI simulations to optimize your interview success probability.
                 </p>
                 <button 
                  onClick={() => onNavigate('mock-interview')}
                  className="px-10 py-5 bg-white text-cyan-600 font-bold text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-cyan-900/20 uppercase tracking-widest"
                 >
                   Start Calibration
                 </button>
               </div>
               <div className="relative z-10 w-48 h-48 bg-white/10 rounded-[3rem] flex items-center justify-center p-10 backdrop-blur-xl border border-white/10">
                  <Mic2 className="w-full h-full text-white" />
               </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <section className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-5 px-1 uppercase tracking-widest">Global Commands</h3>
              <div className="grid gap-3.5">
                {[
                  { label: 'Build New Resume', id: 'resume-upload', icon: FileText },
                  { label: 'Analysis Engine', id: 'resume-analysis', icon: BarChart3 },
                  { label: 'System Skill Gap', id: 'skill-gap-analysis', icon: Target }
                ].map(action => (
                  <button 
                    key={action.id}
                    onClick={() => onNavigate(action.id)}
                    className="w-full p-5 bg-white border border-zinc-200 rounded-[2rem] text-left hover:border-cyan-600 hover:shadow-xl hover:shadow-cyan-100 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-cyan-50 transition-colors">
                          <action.icon className="w-4.5 h-4.5 text-zinc-600 group-hover:text-cyan-600 transition-colors" />
                       </div>
                       <span className="text-sm font-bold text-zinc-700 group-hover:text-zinc-900 tracking-tight">{action.label}</span>
                    </div>
                    <ArrowRight className="w-4.5 h-4.5 text-zinc-300 group-hover:text-cyan-600 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
           </section>

           <ActivityFeed />

           <AchievementPanel />

           <div className="p-10 bg-cyan-50 border border-cyan-100 rounded-[2.5rem] space-y-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                 <Bot className="w-24 h-24 text-cyan-500" />
              </div>
              <div className="w-10 h-10 bg-white shadow-sm border border-cyan-100 text-cyan-500 rounded-xl flex items-center justify-center font-black relative z-10">
                 <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-base font-bold text-cyan-900 leading-[1.4] relative z-10">
                "Precision matters. AI-optimized resumes see a 3.4x higher response rate in high-tier technical deployments."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
