import React from 'react';
import { useAppContext } from '../AppSimple';
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
  FolderHeart
} from 'lucide-react';
import { motion } from 'motion/react';
import { AchievementPanel } from './AchievementPanel';

interface DashboardProps {
  onNavigate: (view: any) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAppContext();

  const limits = {
    resumeAnalyses: 3,
    skillGaps: 5,
    careerAdviceCount: 10,
    mockInterviews: 5,
    learningPlans: 1
  };

  // Mock user data for demo
  const userData = {
    resumeAnalyses: 2,
    mockInterviews: 1,
    careerAdviceCount: 5,
    skillGaps: 3,
    jobApplicationsCount: 8,
    learningPlans: 1
  };

  const usageStats = [
    { 
      id: 'resume-upload', 
      label: 'Resume Analysis', 
      used: userData?.resumeAnalyses || 0, 
      total: limits.resumeAnalyses,
      color: 'bg-blue-500',
      icon: FileText
    },
    { 
      id: 'mock-interview', 
      label: 'Mock Interviews', 
      used: userData?.mockInterviews || 0, 
      total: limits.mockInterviews,
      color: 'bg-purple-500',
      icon: Mic2
    },
    { 
      id: 'assistant', 
      label: 'AI Coach', 
      used: userData?.careerAdviceCount || 0, 
      total: limits.careerAdviceCount,
      color: 'bg-emerald-500',
      icon: MessageSquare
    },
    { 
      id: 'skill-gap-analysis', 
      label: 'Skill Gap Analysis', 
      used: userData?.skillGaps || 0, 
      total: limits.skillGaps,
      color: 'bg-orange-500',
      icon: Target
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, {user?.name || 'User'}</h1>
          <p className="text-gray-500 max-w-lg">
            Your career evolution is in progress. Here's an overview of your current status and usage.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 italic serif text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          Next reset in 12 days
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {usageStats.map((stat, idx) => {
           const percent = (stat.used / stat.total) * 100;
           const Icon = stat.icon;
           return (
             <motion.div 
               key={stat.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.05 }}
               className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
               onClick={() => onNavigate(stat.id)}
             >
               <div className="flex items-center justify-between mb-6">
                 <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}-100`}>
                   <Icon className="w-5 h-5" />
                 </div>
                 <div className="text-gray-300 group-hover:text-gray-900 transition-colors">
                   <ChevronRight className="w-5 h-5" />
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-bold">{stat.used}</span>
                       <span className="text-gray-400 text-sm">/ {stat.total}</span>
                    </div>
                 </div>
                 
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${percent}%` }}
                     className={`h-full ${stat.color}`}
                   />
                 </div>
               </div>
             </motion.div>
           )
         })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Applications</h3>
              <button 
                onClick={() => onNavigate('tracker')} 
                className="text-indigo-600 text-sm font-semibold flex items-center gap-1 hover:underline"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
              {[
                { company: 'Google', role: 'Software Engineer', status: 'Applied', date: '2 days ago' },
                { company: 'Stripe', role: 'Product Manager', status: 'Interviewing', date: '5 days ago' },
                { company: 'Airbnb', role: 'Frontend Lead', status: 'Draft', date: '8 days ago' },
              ].map((app, i) => (
                <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                      {app.company[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{app.company}</p>
                      <p className="text-sm text-gray-500 font-mono tracking-tight">{app.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      app.status === 'Interviewing' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {app.status}
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono uppercase italic">{app.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="bg-indigo-900 rounded-3xl p-10 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-3xl font-bold mb-4 tracking-tight">Ready for a mock interview?</h2>
                 <p className="text-indigo-200 mb-8 max-w-md leading-relaxed">
                   Practice your storytelling and problem-solving with our AI interviewer. Get instant feedback and improve your success rate by 40%.
                 </p>
                 <button 
                  onClick={() => onNavigate('interviews')}
                  className="bg-white text-indigo-900 font-bold px-8 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
                 >
                   Start Practice Session
                 </button>
               </div>
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
               <TrendingUp className="absolute bottom-8 right-8 w-24 h-24 text-indigo-800 opacity-20" />
            </div>
          </section>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-8">
           <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                Quick Actions
              </h3>
              <div className="grid gap-3">
                <button 
                  onClick={() => onNavigate('upload')}
                  className="w-full p-4 rounded-2xl border border-gray-100 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm font-medium">Build New Resume</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </button>
                <button 
                  onClick={() => onNavigate('builder')}
                  className="w-full p-4 rounded-2xl border border-gray-100 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm font-medium">Resume Builder</span>
                  <FolderHeart className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-all" />
                </button>
                <button 
                  onClick={() => onNavigate('skills')}
                  className="w-full p-4 rounded-2xl border border-gray-100 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm font-medium">Check Skills Gap</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
           </div>

           <AchievementPanel />

           <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                🚀 Pro Tip
              </h3>
              <p className="text-xs leading-relaxed opacity-90 italic serif">
                "Keep your resume updated with new projects. Even small contributions add weight to your professional footprint."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
