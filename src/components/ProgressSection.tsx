import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { 
  History, 
  FileText, 
  Mic2, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

export function ProgressSection() {
  const { user, userData } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const isLocal = !!(user as any)?.isLocal;
      if (isLocal) {
        // Load interview history from localStorage for demo/local users
        try {
          const saved = localStorage.getItem(`cb_interviews_${user.uid}`);
          if (saved) setInterviews(JSON.parse(saved).slice(0, 5));
        } catch {}
        setLoading(false);
        return;
      }
      try {
        // Fetch last 5 resumes
        const resumesRef = collection(db, 'users', user.uid, 'resumes');
        const rQuery = query(resumesRef, orderBy('createdAt', 'desc'), limit(5));
        const rSnap = await getDocs(rQuery);
        setResumes(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch last 5 interviews
        const interviewsRef = collection(db, 'users', user.uid, 'interviews');
        const iQuery = query(interviewsRef, orderBy('createdAt', 'desc'), limit(5));
        const iSnap = await getDocs(iQuery);
        setInterviews(iSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching progress data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const usageStats = [
    { label: 'Advices Used', current: userData?.usage.careerAdviceCount || 0, max: userData?.tier === 'premium' ? '\u221E' : (userData?.tier === 'medium' ? 4 : 1) },
    { label: 'Analyses', current: userData?.usage.resumeAnalyses || 0, max: '\u221E' },
    { label: 'Interviews', current: userData?.usage.mockInterviews || 0, max: userData?.tier === 'premium' ? '\u221E' : (userData?.tier === 'medium' ? 5 : 1) },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Growth Roadmap</h2>
        <p className="text-gray-600 italic serif text-lg mt-2 opacity-80">Track your evolution from candidate to industry leader.</p>
      </div>

      {/* Plan & Usage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[3rem] p-10 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-gray-900 border-b-4 border-blue-600 pb-1">Usage Quotas</h3>
            <div className="px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              {userData?.tier} Tier
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {usageStats.map((stat, i) => (
              <div key={i} className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900">{stat.current}</span>
                  <span className="text-gray-400 font-bold">/ {stat.max}</span>
                </div>
                <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: typeof stat.max === 'number' ? `${(stat.current / stat.max) * 100}%` : '40%' }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>

          {userData?.tier !== 'premium' && (
            <div className="mt-10 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-700 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-900">Want more advice sessions?</p>
                <p className="text-[11px] text-gray-500 font-bold">Upgrade to Premium for unlimited AI career strategies.</p>
              </div>
              <button className="ml-auto px-6 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                Upgrade Now
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-900 text-white rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl shadow-blue-950/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-600/20 transition-all" />
          <div className="relative z-10">
            <Award className="w-10 h-10 text-blue-500 mb-6" />
            <h3 className="text-2xl font-black tracking-tight leading-tight mb-2">Match History Trend</h3>
            <p className="text-gray-400 text-sm font-medium mb-8">Visualizing your career alignment growth over the last few uploads.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-blue-500 border border-white/5">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Global Progress</p>
                  <p className="text-xl font-black">+14% Growth</p>
                </div>
              </div>
            </div>
          </div>
          
          <button className="mt-10 w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            View Analytics <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Resume History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-700" /> Resume History
            </h3>
            <button className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 tracking-widest transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
            {resumes.length === 0 ? (
              <div className="p-10 bg-white border border-gray-50 rounded-[2.5rem] text-center italic text-gray-400 font-bold border-dashed">
                No resumes saved yet.
              </div>
            ) : resumes.map((resume, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex items-center gap-5 group hover:shadow-xl hover:shadow-gray-200/40 transition-all">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-700 group-hover:bg-blue-50 transition-all">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-gray-900 truncate">{resume.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" /> {resume.createdAt ? format(new Date(resume.createdAt), 'MMM d, yyyy') : 'Recently'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-700">{resume.parsedData?.matchPercentage || 0}% Match</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{resume.parsedData?.targetRole || 'Not specified'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <Mic2 className="w-6 h-6 text-emerald-600" /> Interview Log
            </h3>
            <button className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 tracking-widest transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
             {interviews.length === 0 ? (
              <div className="p-10 bg-white border border-gray-50 rounded-[2.5rem] text-center italic text-gray-400 font-bold border-dashed">
                No mock interviews recorded.
              </div>
            ) : interviews.map((interview, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex items-center gap-5 group hover:shadow-xl hover:shadow-gray-200/40 transition-all">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all">
                  <Mic2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-black text-gray-900 truncate">{interview.role} Interview</h4>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" /> {interview.createdAt ? format(new Date(interview.createdAt), 'MMM d, yyyy') : 'Recently'}
                  </p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black">
                   {interview.feedback?.score || 'Completed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Roadmap Visual */}
      <div className="bg-white border border-gray-100 rounded-[4rem] p-12 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Active Learning Tracks</h3>
            <p className="text-gray-500 italic serif opacity-80">Skills being mastered based on your current gaps.</p>
          </div>
          <button className="px-8 py-4 bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-3 active:scale-95 transition-all">
             <BookOpen className="w-4 h-4" /> Go to Learning Center
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {(resumes[0]?.parsedData?.skillGaps?.slice(0, 3).map((gap: any) => ({
            name: gap.skill,
            progress: gap.priority === 'Critical' ? 15 : (gap.priority === 'High' ? 45 : 75),
            status: gap.priority === 'Critical' ? 'Beginner' : (gap.priority === 'High' ? 'Intermediate' : 'Advanced'),
            weeks: gap.priority === 'Critical' ? '12 weeks' : (gap.priority === 'High' ? '6 weeks' : '2 weeks')
          })) || [
            { name: 'Core Foundations', progress: 75, status: 'Advanced', weeks: '4 weeks' },
            { name: 'Technical Depth', progress: 40, status: 'Intermediate', weeks: '8 weeks' },
            { name: 'Leadership Logic', progress: 20, status: 'Beginner', weeks: '12 weeks' }
          ]).map((track, i) => (
            <div key={i} className="p-8 bg-gray-50 rounded-[3rem] border border-gray-50 space-y-6 group hover:bg-white hover:border-blue-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                 <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-blue-700 shadow-sm border border-gray-100">
                    <CheckCircle2 className="w-5 h-5" />
                 </div>
                 <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{track.status}</span>
              </div>
              <div>
                 <h4 className="font-black text-gray-900 text-lg">{track.name}</h4>
                 <p className="text-gray-400 text-[11px] font-bold mt-1 uppercase tracking-widest">Mastery Level</p>
              </div>
              <div className="space-y-3">
                 <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${track.progress}%` }}
                      className="h-full bg-blue-700" 
                    />
                 </div>
                 <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>{track.progress}% Complete</span>
                    <span className="text-gray-900 italic">{track.weeks} remaining</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Milestone Timeline */}
      <div className="bg-gray-900 rounded-[4rem] p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-20 -mt-20" />
        <div className="relative z-10">
           <h3 className="text-3xl font-black mb-12 tracking-tight">Deployment Timeline</h3>
           <div className="space-y-12">
              {[
                { date: 'MAY 2026', title: 'System Initialization', desc: 'First resume upload and career trajectory baseline established.', status: 'completed' },
                { date: 'JUN 2026', title: 'Calibration Phase', desc: 'Mock interview performance optimization and skill gap filling.', status: 'active' },
                { date: 'JUL 2026', title: 'Market Deployment', desc: 'Launch high-fidelity applications to tier-1 organizations.', status: 'planned' }
              ].map((milestone, i) => (
                <div key={i} className="flex gap-10 group">
                   <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${milestone.status === 'completed' ? 'border-blue-600 bg-blue-600' : milestone.status === 'active' ? 'border-blue-600 bg-transparent' : 'border-gray-700 bg-transparent'}`}>
                         {milestone.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-gray-900" />}
                         {milestone.status === 'active' && <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />}
                      </div>
                      {i < 2 && <div className="w-0.5 flex-1 bg-gray-800 my-4" />}
                   </div>
                   <div className="pb-10">
                      <div className="flex items-center gap-4 mb-2">
                         <span className="text-blue-600 font-mono text-[10px] font-black tracking-widest">{milestone.date}</span>
                         <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-0.5 rounded-full ${milestone.status === 'completed' ? 'bg-emerald-500 text-gray-900' : milestone.status === 'active' ? 'bg-blue-600 text-gray-900' : 'bg-gray-800 text-gray-400'}`}>
                           {milestone.status}
                         </span>
                      </div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">{milestone.title}</h4>
                      <p className="text-gray-400 text-sm max-w-xl font-medium leading-relaxed">{milestone.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
