import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, BarChart3, Filter, ShieldCheck, Zap, Ship, Rocket, Landmark, MessageSquare, Copy, Link as LinkIcon, Loader2, ArrowLeft } from 'lucide-react';
import { getCareerProjection, generateReferralMessage } from '../services/gemini';

interface CareerAdviceSectionProps {
  data: any;
  onNavigate: (view: string) => void;
  onDataUpdate?: (data: any) => void;
}

export function CareerAdviceSection({ data, onNavigate, onDataUpdate }: CareerAdviceSectionProps) {
  const [projection, setProjection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState(5);
  const [referral, setReferral] = useState<any>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [targetCompany, setTargetCompany] = useState('');

  const isConfirmed = data?.isPathConfirmed;
  const careerAdvice = data?.careerAdvice;
  const targetRole = data?.targetRole;
  const skills = data?.skills || [];

  const handleGenerateReferral = async () => {
    if (!targetCompany) return;
    setReferralLoading(true);
    try {
      const result = await generateReferralMessage(targetCompany, targetRole, data);
      setReferral(result);
    } catch (err) {
      console.error(err);
    } finally {
      setReferralLoading(false);
    }
  };

  const handleConfirmPath = () => {
    if (onDataUpdate) {
      onDataUpdate({ isPathConfirmed: true });
    }
    // Automatically navigate to learning plan to "generate" it
    onNavigate('learning-plan');
  };

  useEffect(() => {
    const fetchAdvice = async () => {
      // Check if we already have valid cached advice for this role
      if (careerAdvice && careerAdvice.targetRole === targetRole && careerAdvice.skillsSnapshot === JSON.stringify(skills)) {
        setProjection(careerAdvice.data);
        setLoading(false);
        return;
      }

      if (!targetRole) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getCareerProjection(
          targetRole,
          'Mid-Level',
          skills
        );
        setProjection(result);
        if (onDataUpdate) {
          onDataUpdate({ 
            careerAdvice: {
              targetRole: targetRole,
              skillsSnapshot: JSON.stringify(skills),
              data: result
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, [targetRole, JSON.stringify(skills)]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6">
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full shadow-2xl"
         />
         <div className="text-center">
            <p className="text-gray-900 font-black text-xl mb-1">Mapping Your Future</p>
            <p className="text-gray-500 font-bold italic serif animate-pulse">Running competitive market simulations...</p>
         </div>
      </div>
    );
  }

  if (!data?.targetRole) {
    return (
      <div className="py-20 text-center space-y-6">
         <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <AlertCircle className="w-10 h-10" />
         </div>
         <h3 className="text-2xl font-black text-gray-900">Target Role Missing</h3>
         <p className="text-gray-500 italic serif max-w-md mx-auto">Please select a target role in the Resume Analysis tab first to get personalized career advice.</p>
         <button 
           onClick={() => onNavigate('resume-analysis')}
           className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1"
         >
            Go to Analysis
         </button>
      </div>
    );
  }

  const activeProjection = projection?.projections?.find((p: any) => p.years === timeFilter);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => onNavigate('skill-gap-analysis')}
             className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
           >
              <ArrowLeft className="w-5 h-5" />
           </button>
           <div className={`p-4 rounded-2xl ${isConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <Compass className="w-8 h-8" />
           </div>
           <div>
              <div className="flex items-center gap-2">
                 <h2 className="text-3xl font-black text-gray-900">Strategic Roadmap</h2>
                 {isConfirmed && (
                   <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Committed
                   </span>
                 )}
              </div>
              <p className="text-gray-500 italic serif text-lg opacity-80">Path: <span className="text-indigo-600 font-bold uppercase tracking-tight">{targetRole}</span></p>
           </div>
        </div>
        
        {!isConfirmed && (
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
             {[5, 10, 15].map(yr => (
               <button 
                 key={yr}
                 onClick={() => setTimeFilter(yr)}
                 className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${timeFilter === yr ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  {yr} Years
               </button>
             ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Verdict Section */}
         <section className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
              <div className={`absolute top-0 right-0 p-8 opacity-10 ${projection?.isRightPath ? 'text-emerald-600' : 'text-amber-600'}`}>
                 {projection?.isRightPath ? <CheckCircle2 className="w-40 h-40" /> : <AlertCircle className="w-40 h-40" />}
              </div>
              
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Path Verdict</h3>
                 </div>

                 <div className={`p-6 rounded-3xl border ${projection?.isRightPath ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <p className={`text-lg font-black mb-2 ${projection?.isRightPath ? 'text-emerald-900' : 'text-rose-900'}`}>
                       {projection?.isRightPath ? 'Optimal Trajectory' : 'Pivotal Shift Alert'}
                    </p>
                    <p className={`text-sm italic serif leading-relaxed ${projection?.isRightPath ? 'text-emerald-700' : 'text-rose-700'}`}>
                       {projection?.reasoning}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                       <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">Market Benchmark Salary</p>
                       <p className="text-xl font-black text-indigo-900 tracking-tight">{projection?.salaryInfo?.current}</p>
                    </div>
                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100">
                       <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest mb-1">5yr Ceiling Extension</p>
                       <p className="text-xl font-black text-purple-900 tracking-tight">{projection?.salaryInfo?.projection5yr}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Market Trends */}
           <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white space-y-6">
              <div className="flex items-center gap-3">
                 <TrendingUp className="w-5 h-5 text-indigo-400" />
                 <h3 className="text-lg font-black uppercase tracking-widest">Market Trends</h3>
              </div>
              <div className="space-y-4">
                 {(projection?.marketTrends || ["AI integration across workflows", "Remote-first leadership", "Data-driven decision making"]).map((trend: string, idx: number) => (
                   <div key={idx} className="flex gap-3">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full mt-2" />
                      <p className="text-sm text-gray-400 font-bold">{trend}</p>
                   </div>
                 ))}
              </div>
           </div>
         </section>

         {/* Detailed Projection or Selection */}
         <section className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
               {isConfirmed ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-emerald-50 border-2 border-emerald-200 rounded-[3rem] p-12 text-center space-y-8 h-full flex flex-col justify-center"
                 >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
                       <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-4xl font-black text-emerald-900">Career Goal Locked</h3>
                       <p className="text-emerald-700 italic serif text-lg max-w-xl mx-auto">
                          You have committed to the <span className="font-bold underline decoration-wavy underline-offset-4">{targetRole}</span> path. Your learning plan is now being tailored to these specific requirements.
                       </p>
                    </div>
                    <button 
                       onClick={() => onNavigate('learning-plan')}
                       className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 mx-auto"
                    >
                       View 12-Month Plan <ChevronRight className="w-6 h-6" />
                    </button>
                 </motion.div>
               ) : (
                 <motion.div 
                   key={timeFilter}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40 space-y-10"
                 >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                       <div className="space-y-6 flex-1">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                {timeFilter === 5 ? <Ship className="w-7 h-7" /> : timeFilter === 10 ? <Rocket className="w-7 h-7" /> : <Landmark className="w-7 h-7" />}
                             </div>
                             <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{timeFilter} Year Outlook</h3>
                                <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm">{activeProjection?.position}</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">Longevity Check</span>
                                <h4 className="text-xl font-black text-gray-900">Market Survival</h4>
                                <p className="text-sm text-gray-500 font-bold italic serif leading-relaxed">{activeProjection?.marketSurvival}</p>
                             </div>
                             <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-3">
                                <Zap className="w-6 h-6 text-indigo-600" />
                                <h4 className="text-xl font-black text-gray-900">Strategic Move</h4>
                                <p className="text-sm text-indigo-700 font-bold leading-relaxed">{activeProjection?.advice}</p>
                             </div>
                          </div>
                       </div>

                       <div className="w-full md:w-80 space-y-6">
                           <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl space-y-4">
                              <div className="flex items-center gap-2 text-rose-600">
                                 <AlertCircle className="w-5 h-5" />
                                 <h4 className="text-sm font-black uppercase tracking-widest">Risk Analysis</h4>
                              </div>
                              <ul className="space-y-3">
                                 {(projection?.riskAnalysis || ["Competition from licensed majors", "Extended upskilling duration", "Entry-level pay reset"]).map((risk: string, i: number) => (
                                   <li key={i} className="text-xs text-rose-700 font-bold leading-tight flex gap-2">
                                      <span>•</span> {risk}
                                   </li>
                                 ))}
                              </ul>
                           </div>

                           <div className="p-8 bg-gray-50 border border-gray-100 rounded-3xl space-y-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                 <Filter className="w-5 h-5" />
                                 <h4 className="text-sm font-black uppercase tracking-widest">Alternatives</h4>
                              </div>
                              <ul className="space-y-2">
                                 {(projection?.strategicAlternatives || ["Legal Tech Engineer", "Compliance Officer", "IP Strategist"]).map((alt: string, i: number) => (
                                   <li key={i} className="text-xs text-gray-600 font-bold flex items-center gap-2">
                                      <div className="w-1 h-1 bg-gray-400 rounded-full" /> {alt}
                                   </li>
                                 ))}
                              </ul>
                           </div>
                       </div>
                    </div>

                    <div className="pt-10 border-t border-gray-100 flex flex-col items-center">
                       <p className="text-sm text-gray-500 mb-6 text-center italic serif max-w-lg">
                          "Despite the challenge, your unique background in AI gives you a defensive moat if you pair it with the required {targetRole} credentials."
                       </p>
                       <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                          <button 
                             onClick={handleConfirmPath}
                             className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                          >
                             Yes, I still want to continue!
                          </button>
                          <button 
                             onClick={() => onNavigate('resume-analysis')}
                             className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black flex items-center justify-center gap-3 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                          >
                             Re-evaluate Path
                          </button>
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </section>
      </div>

      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40">
          <div className="max-w-4xl mx-auto">
             <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-full md:w-1/3 space-y-6">
                   <div className="w-16 h-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600">
                      <MessageSquare className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">Referral AI</h3>
                      <p className="text-gray-500 italic serif leading-relaxed">Generate personalized LinkedIn outreach messages to land interviews.</p>
                   </div>
                   
                   <div className="space-y-4">
                      <input 
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        placeholder="Enter Target Company (e.g. Google)"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                      />
                      <button 
                         onClick={handleGenerateReferral}
                         disabled={referralLoading || !targetCompany}
                         className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
                      >
                         {referralLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                         Generate Outreach Message
                      </button>
                   </div>
                </div>

                <div className="flex-1 w-full">
                   <AnimatePresence mode="wait">
                      {referral ? (
                        <motion.div 
                          key="referral-result"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gray-50 rounded-[2.5rem] border border-indigo-100 p-8 space-y-6 relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600 pointer-events-none">
                              <MessageSquare className="w-40 h-40" />
                           </div>
                           
                           <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-4">
                                 <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Strategic Template</span>
                              </div>
                              <p className="text-gray-900 font-bold mb-2">Subject: {referral.subject}</p>
                              <div className="p-6 bg-white rounded-2xl border border-gray-100 italic serif text-gray-700 leading-relaxed shadow-sm">
                                 "{referral.message}"
                              </div>
                              
                              <div className="mt-6 flex items-center gap-4">
                                 <button 
                                   onClick={() => {
                                     navigator.clipboard.writeText(referral.message);
                                     alert("Message copied to clipboard!");
                                   }}
                                   className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                                 >
                                    <Copy className="w-4 h-4" /> Copy Message
                                 </button>
                                 <div className="flex-1 p-4 bg-indigo-50 rounded-2xl">
                                    <p className="text-[10px] text-indigo-600 font-black uppercase mb-1">Coach Strategy</p>
                                    <p className="text-[11px] text-indigo-900 font-bold font-mono">{referral.strategy}</p>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                      ) : (
                        <div className="h-full min-h-[300px] border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10 group hover:border-indigo-200 transition-all">
                           <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                              <Rocket className="w-8 h-8" />
                           </div>
                           <h4 className="text-xl font-bold text-gray-400">Ready to expand your reach?</h4>
                           <p className="text-sm text-gray-400 italic serif max-w-xs mt-2">Enter a company name to generate a proven outreach sequence tailored to your experience.</p>
                        </div>
                      )}
                   </AnimatePresence>
                </div>
             </div>
          </div>
       </section>
    </div>
  );
}
