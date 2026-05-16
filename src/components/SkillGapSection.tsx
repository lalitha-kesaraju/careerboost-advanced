import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Target, Zap, AlertCircle, CheckCircle2, Loader2, ArrowRight, TrendingUp, Brain, Trophy } from 'lucide-react';
import { analyzeSkillGap } from '../services/gemini';

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

export function SkillGapSection({ resumeData, targetRole, onNavigate, onDataUpdate }: { resumeData: any, targetRole?: string, onNavigate: (view: string) => void, onDataUpdate?: (data: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(targetRole || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gapData, setGapData] = useState<any>(resumeData?.activeSkillGap?.data || null);

  const skills = resumeData?.skills || [];

  useEffect(() => {
    if (targetRole) {
      // Check if we have a valid cached analysis for this role
      if (resumeData?.activeSkillGap?.targetRole === targetRole && resumeData?.activeSkillGap?.skillsSnapshot === JSON.stringify(skills)) {
        setGapData(resumeData.activeSkillGap.data);
        setSelectedRole(targetRole);
        return;
      }
      handleAnalyze(targetRole);
    }
  }, [targetRole, skills]);

  const filteredRoles = ROLES.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAnalyze = async (role: string) => {
    setSelectedRole(role);
    setIsAnalyzing(true);
    try {
      const result = await analyzeSkillGap(resumeData, role);
      setGapData(result);
      
      // Update parent state with target role and missing skills for later sections
      if (onDataUpdate) {
        onDataUpdate({
          targetRole: role,
          missingSkills: result.missingSkills?.map((s: any) => typeof s === 'string' ? s : s.name) || [],
          activeSkillGap: {
            targetRole: role,
            skillsSnapshot: JSON.stringify(skills),
            data: result
          }
        });
      }
    } catch (err) {
      console.error("Gap Analysis Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {!selectedRole || isAnalyzing ? (
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="text-center relative">
              <button 
                onClick={() => onNavigate('resume-analysis')}
                className="absolute left-0 top-0 w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                title="Back to Analysis"
              >
                 <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Select Your Target Role</h2>
              <p className="text-gray-500 italic serif text-lg opacity-80">Choose from over 100+ professional paths to see what's missing</p>
           </div>

           <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                 <Search className="w-6 h-6" />
              </div>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search roles (e.g. AI Engineer, Product Manager...)"
                className="w-full bg-white border border-gray-100 rounded-[2.5rem] pl-16 pr-8 py-6 text-lg font-bold shadow-2xl shadow-gray-200/40 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
           </div>

           {isAnalyzing ? (
             <div className="py-20 text-center space-y-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto"
                >
                   <Loader2 className="w-10 h-10 text-indigo-600" />
                </motion.div>
                <div>
                   <h3 className="text-2xl font-black text-gray-900">Comparing with Industry Standards</h3>
                   <p className="text-gray-500 italic serif">Identifying critical gaps for {selectedRole}...</p>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200">
                {filteredRoles.map((role, idx) => (
                  <motion.button
                    key={role}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    onClick={() => handleAnalyze(role)}
                    className="p-6 bg-white border border-gray-100 rounded-3xl text-left hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100/20 transition-all group"
                  >
                     <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 mb-1">{role}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Industry Path</p>
                  </motion.button>
                ))}
             </div>
           )}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <button 
                   onClick={() => setSelectedRole(null)}
                   className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                 >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                 </button>
                 <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Skill Gap: {selectedRole}</h2>
                    <p className="text-emerald-500 font-black text-sm uppercase tracking-widest">{gapData?.matchPercentage || 0}% Match Rating</p>
                 </div>
              </div>
              <button 
                onClick={() => onNavigate('career-advice')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                 Get Career Strategy <ArrowRight className="w-5 h-5" />
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Missing Skills */}
              <section className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                       <Zap className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 tracking-tight">Missing Critical Skills</h3>
                       <p className="text-xs text-gray-400 font-bold">What you need to learn to be competitive</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {(gapData?.missingSkills || []).map((skill: any, idx: number) => (
                      <div key={idx} className="p-6 bg-gray-50 border border-gray-100 rounded-3xl space-y-3 hover:border-indigo-500 transition-all group">
                         <div className="flex items-center justify-between">
                            <h4 className="text-lg font-black text-gray-900">{typeof skill === 'string' ? skill : skill.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              skill.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                              skill.priority === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                               {skill.priority || 'High'} Priority
                            </span>
                         </div>
                         <p className="text-sm text-gray-500 font-medium leading-relaxed italic serif">
                            {skill.reason || "Crucial for core responsibilities in this role."}
                         </p>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Summary Stats */}
              <div className="space-y-8">
                 <section className="bg-gray-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden group">
                    <TrendingUp className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/5" />
                    <div className="relative z-10 space-y-6">
                       <h3 className="text-xl font-black tracking-tight">AI Insights</h3>
                       <div className="space-y-4">
                          <div className="p-4 bg-white/10 rounded-2xl">
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Learning Time</p>
                             <p className="text-lg font-bold">{gapData?.timeline || "~ 12+ Months"}</p>
                          </div>
                          <div className="p-4 bg-white/10 rounded-2xl">
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Difficulty Level</p>
                             <p className="text-lg font-bold">{gapData?.difficulty || "Hard"}</p>
                          </div>
                       </div>
                       <p className="text-sm text-gray-300 italic serif leading-relaxed opacity-90">
                          "{gapData?.insight || `Moving from your background to ${selectedRole} requires a significant professional shift and dedicated specialization.`}"
                       </p>
                    </div>
                 </section>

                  <section className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-10">
                     <div className="flex items-center gap-3 mb-6">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-black text-emerald-900">
                          {(gapData?.matchPercentage || 0) < 20 ? "Relevant Background" : "Mastered Foundation"}
                        </h3>
                     </div>
                     <div className="space-y-3">
                        {skills.slice(0, 10).map((skill: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                             <span className="text-sm font-bold text-emerald-800">{skill}</span>
                          </div>
                        ))}
                     </div>
                     {(gapData?.matchPercentage || 0) < 20 && gapData && (
                       <div className="mt-6 p-4 bg-white/50 rounded-2xl border border-emerald-100 italic text-[11px] text-emerald-700 font-medium leading-tight">
                          Note: Your current expertise is highly specialized in another field. Transitioning to {selectedRole} will require starting with foundational certifications or degrees.
                       </div>
                    )}
                  </section>

                 <button 
                    onClick={() => onNavigate('career-advice')}
                    className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black hover:bg-black transition-all shadow-xl shadow-gray-200"
                  >
                    Get Strategic Career Roadmap →
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
