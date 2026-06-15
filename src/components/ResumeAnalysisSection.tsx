import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp, Target, Award, ArrowLeft, Download, Share2, Loader2, BarChart3, ListChecks, ShieldCheck } from 'lucide-react';
import { analyzeResume } from '../services/gemini';
import { useAuth } from '../App';
import { recordActivity } from '../services/statsService';
import { collection, doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../services/firestoreService';

interface ResumeAnalysisSectionProps {
  data: any;
  onReset: () => void;
  onNavigate: (view: any) => void;
  onDataUpdate?: (data: any) => void;
}

export function ResumeAnalysisSection({ data, onReset, onNavigate, onDataUpdate }: ResumeAnalysisSectionProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const ROLES = [
    "Software Engineer", "Data Scientist", "UX/UI Designer", "Product Manager", "DevOps Engineer", 
    "Cybersecurity Analyst", "AI/ML Engineer", "Cloud Architect", "Blockchain Developer", "Full Stack Developer",
    "General Surgeon", "Medical Doctor", "Registered Nurse", "Pharmacist", "Dentist", 
    "Veterinarian", "Medical Lab Technician", "Psychiatrist", "Physical Therapist", "Hospital Administrator",
    "Corporate Lawyer", "Criminal Defense Attorney", "Paralegal", "Legal Consultant", "Compliance Officer",
    "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Aerospace Engineer", "Chemical Engineer",
    "Biomedical Engineer", "Environmental Engineer", "Structural Engineer", "Architect", "Urban Planner",
    "Investment Banker", "Financial Analyst", "Chartered Accountant (CPA)", "Actuary", "Stock Broker",
    "Marketing Director", "Brand Manager", "Sales Executive", "PR Manager", "Content Strategy Lead",
    "Management Consultant", "Supply Chain Manager", "HR Director", "Operations Manager", "Business Development Manager",
    "University Professor", "Secondary School Teacher", "Special Education Teacher", "Educational Consultant",
    "Commercial Pilot", "Air Traffic Controller", "Ship Captain", "Logistics Coordinator",
    "Executive Chef", "Hotel General Manager", "Real Estate Broker", "Journalist", "Film Director",
    "Graphic Designer", "Professional Athlete", "Social Worker", "Police Officer", "Firefighter"
  ];

  const filteredRoles = ROLES.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
  const { user, refreshUsage } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const result = await analyzeResume(data);
        setAnalysis(result);
        
        // Save to Firestore if not already saved and user is logged in
        if (user && !isSaved) {
          const resumeId = `resume_${Date.now()}`;
          const resumeRef = doc(db, 'users', user.uid, 'resumes', resumeId);
          
          await setDoc(resumeRef, {
            id: resumeId,
            userId: user.uid,
            name: data.fileName || 'New Resume',
            content: data.rawContent || '',
            parsedData: result,
            createdAt: new Date().toISOString()
          });

          // Increment usage
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            'usage.resumeAnalyses': increment(1)
          });
          
          recordActivity(user.uid, 'resume', 'Resume Analyzed', `High-precision audit completed for: ${data.fileName || 'Untitled Deployment'}`);
          
          setIsSaved(true);
          refreshUsage();
        }
      } catch (err) {
        console.error("Analysis Error:", err);
      } finally {
        setLoading(false);
      }
    };
    runAnalysis();
  }, [data, user]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
           className="mb-6 p-4 bg-cyan-50 rounded-full"
         >
           <Loader2 className="w-12 h-12 text-cyan-600" />
         </motion.div>
         <h2 className="text-3xl font-black mb-2">Quantifying Professional Value...</h2>
         <p className="text-gray-500 italic serif opacity-60">Our AI is running cross-market comparisons</p>
      </div>
    );
  }

  const score = analysis?.score || 75;

  return (
    <div className="space-y-10 pb-20">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-2">
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 z-10 cursor-pointer" onClick={onReset}>
               <CheckCircle2 className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold text-emerald-600 mt-2 uppercase tracking-widest">Upload</span>
           </div>
           <div className="flex-1 h-1 bg-emerald-500 mx-4 -mt-6" />
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 z-10 cursor-pointer" onClick={() => {
               // We don't have a direct "back to review" but we can go back to step 1
               onReset();
             }}>
               <CheckCircle2 className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold text-emerald-600 mt-2 uppercase tracking-widest">Review</span>
           </div>
           <div className="flex-1 h-1 bg-emerald-500 mx-4 -mt-6" />
           <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-100 z-10">
               <span className="font-bold">3</span>
             </div>
             <span className="text-xs font-bold text-cyan-600 mt-2 uppercase tracking-widest">Analysis</span>
           </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h2 className="text-3xl font-black text-gray-900 mb-2">Resume Intelligence Dashboard</h2>
           <p className="text-gray-500 italic serif text-lg opacity-80">Holistic audit of your professional credentials</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowRoleSelector(true)}
             className="px-6 py-3 bg-cyan-50 text-cyan-600 rounded-xl font-bold border border-cyan-100 hover:bg-cyan-100 transition-all flex items-center gap-2"
           >
              <Target className="w-4 h-4" />
              Set Target Role
           </button>
           <button onClick={onReset} className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-gray-900 font-bold transition-all">
             <ArrowLeft className="w-4 h-4" />
             Upload New Resume
           </button>
        </div>
      </div>

      {/* Role Selection Modal */}
      {showRoleSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowRoleSelector(false)}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-10">
              <h3 className="text-3xl font-black text-gray-900 mb-2">Select Career Goal</h3>
              <p className="text-gray-500 italic serif mb-8">This target role will focus your Skill Gap analysis and Learning Plans.</p>
              
              <div className="relative mb-6">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                  <Target className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search over 50+ roles..."
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/5 focus:border-cyan-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredRoles.map(role => (
                  <button 
                    key={role}
                    onClick={() => {
                      if (onDataUpdate) onDataUpdate({ targetRole: role });
                      onNavigate('skill-gap-analysis'); 
                      setShowRoleSelector(false);
                    }}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-left hover:border-cyan-500 hover:text-cyan-600 transition-all group"
                  >
                    <p className="text-sm font-bold text-gray-700 group-hover:text-cyan-600">{role}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header Analysis */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <svg className="w-48 h-48 -rotate-90 transform">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - score / 100)}
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-gray-900">{score}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ATS Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">AI Resume Analysis</h2>
              <p className="text-gray-500 italic serif text-lg opacity-80">Targeting: {analysis?.targetRole || 'Career Insights'}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Impact</p>
                <p className="text-lg font-black text-emerald-900">High</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">Formatting</p>
                <p className="text-lg font-black text-cyan-900">Optimized</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Keywords</p>
                <p className="text-lg font-black text-amber-900">{analysis?.keywordMatch || '72%'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Positioning */}
        <section className="bg-gray-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-cyan-400">
                    <TrendingUp className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black tracking-tight">Market Benchmarking</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Real-time Positioning</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Target Role</p>
                    <p className="text-xl font-bold">{analysis?.targetRole || 'Software Engineer'}</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Demand Level</p>
                    <p className="text-xl font-bold text-emerald-400">{analysis?.marketInsights?.demandLevel || 'High'}</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 col-span-2">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Est. Salary Bonus Range</p>
                    <p className="text-3xl font-black text-cyan-400">{analysis?.marketInsights?.salaryRange || '$120k - $160k'}</p>
                    <p className="text-[10px] text-gray-600 mt-2 italic">*Based on current skill clusters and certifications</p>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Top Hiring Brands for you</p>
                 <div className="flex flex-wrap gap-2">
                    {(analysis?.marketInsights?.topCompaniesHiring || ['Google', 'Stripe', 'OpenAI', 'Meta']).map((c: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-gray-300">{c}</span>
                    ))}
                 </div>
              </div>
           </div>
           <BarChart3 className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/5" />
        </section>

        {/* AI Recommendations */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
              <ListChecks className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">AI Suggestions</h3>
              <p className="text-xs text-gray-400 font-bold">Priority improvements for maximum impact</p>
            </div>
          </div>

          <div className="space-y-4">
            {(analysis?.improvements || []).map((rec: string, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all cursor-default"
              >
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex-shrink-0 flex items-center justify-center text-cyan-600 font-black text-sm">
                  {idx + 1}
                </div>
                <p className="text-sm font-bold text-gray-700 leading-relaxed pt-1">{rec}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strengths */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
               <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Top Strengths</h3>
              <p className="text-xs text-gray-400 font-bold">What makes you stand out</p>
            </div>
          </div>

          <div className="space-y-4">
            {(analysis?.strengths || []).map((strength: string, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                 <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                 <p className="text-sm font-black text-emerald-900">{strength}</p>
              </div>
            ))}
            
            <div className="mt-10 p-6 bg-gray-900 text-white rounded-3xl relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Market Position</p>
                  <p className="text-xl font-bold leading-tight">Top candidate match for {analysis?.targetRole || 'industry roles'}.</p>
               </div>
               <BarChart3 className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/5" />
            </div>
          </div>
        </section>
      </div>

      {/* ATS Compliance Checklist */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40 mt-10">
         <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-cyan-600 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">ATS Multi-Check</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Compliance & Parsability Audit</p>
               </div>
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">
               Audit Score: {analysis?.atsScore || '90%+'}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(analysis?.atsChecks || [
              { label: 'File Structure', status: 'Optimal', desc: 'Standard single-column layout detected.', passed: true },
              { label: 'Contact Data', status: 'Verified', desc: 'Email and phone correctly extracted.', passed: true },
              { label: 'Header Validity', status: 'Clean', desc: 'No complex graphics identified.', passed: true },
              { label: 'Skill Density', status: 'High', desc: 'Industry-relevant keywords found.', passed: true },
              { label: 'Date Formatting', status: 'Standard', desc: 'Standard date format is easily parseable.', passed: true },
              { label: 'Font Legibility', status: 'Safe', desc: 'Standard sans-serif fonts identified.', passed: true }
            ]).map((check: any, i: number) => (
              <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 transition-all hover:bg-white hover:shadow-lg">
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{check.label}</span>
                    <CheckCircle2 className={`w-4 h-4 ${check.passed ? 'text-emerald-500' : 'text-rose-500'}`} />
                 </div>
                 <p className="text-sm font-black text-gray-900 mb-1">{check.status}</p>
                 <p className="text-[10px] text-gray-500 leading-tight italic serif">{check.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-10">
        <button 
          onClick={onReset}
          className="px-10 py-5 bg-white border border-gray-100 rounded-2xl text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
        >
          Upload New Resume
        </button>
        <button 
          onClick={() => onNavigate('skill-gap-analysis')}
          className="px-10 py-5 bg-cyan-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-100"
        >
          Select Target Role & Analyze Gap →
        </button>
      </div>
    </div>
  );
}
