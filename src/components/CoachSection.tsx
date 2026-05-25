import React, { useState } from 'react';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { MithraChat } from './MithraChat';
import { 
  Bot, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Award, 
  MessageSquare,
  ChevronRight,
  Zap,
  ShieldCheck,
  BrainCircuit,
  LayoutDashboard
} from 'lucide-react';

export function CoachSection({ onNavigate, initialTab = 'insights' }: { onNavigate: (view: any) => void, initialTab?: 'insights' | 'chat' }) {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>(initialTab);

  const summaryData = [
    { 
      title: 'Current Velocity', 
      value: userData?.usage?.resumeAnalyses ? 'High' : 'Standby', 
      desc: 'Based on application activity and analysis frequency.',
      icon: TrendingUp,
      color: 'text-emerald-500'
    },
    { 
      title: 'Strategic Focus', 
      value: userData?.targetRole || 'Not Set', 
      desc: 'Your career trajectory is calibrated for this outcome.',
      icon: Target,
      color: 'text-blue-600'
    },
    { 
      title: 'Readiness Score', 
      value: '74%', 
      desc: 'Aggregate skill match across target organization tier.',
      icon: Award,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="space-y-12 pb-32">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-blue-500 shadow-2xl relative overflow-hidden group">
                <Bot className="w-8 h-8 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent group-hover:scale-150 transition-transform duration-700" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mithra AI Coach</h2>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">High-Fidelity Strategic Career Guidance</p>
             </div>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
             <button 
               onClick={() => setActiveTab('insights')}
               className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'insights' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                <LayoutDashboard className="w-4 h-4" />
                Insights
             </button>
             <button 
               onClick={() => setActiveTab('chat')}
               className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                <MessageSquare className="w-4 h-4" />
                Mithra Chat
             </button>
          </div>
       </div>

       <AnimatePresence mode="wait">
          {activeTab === 'insights' ? (
             <motion.div 
               key="insights"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="space-y-12"
             >
                {/* Performance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {summaryData.map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-xl shadow-gray-200/20 hover:border-blue-200 transition-all group"
                      >
                         <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 ${item.color} group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6" />
                         </div>
                         <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{item.title}</h4>
                         <p className="text-4xl font-black text-gray-900 mb-4">{item.value}</p>
                         <p className="text-xs text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                      </motion.div>
                   ))}
                </div>

                {/* Deep Insight Card */}
                <div className="bg-gray-900 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-950/40">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-20 -mt-20" />
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -ml-20 -mb-20" />
                   
                   <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                      <div className="space-y-8">
                         <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Live Executive Summary</span>
                         </div>
                         <h3 className="text-5xl font-black tracking-tight leading-[0.95]">
                            Your System is <br/> 
                            <span className="text-blue-500">74% Calibrated</span>
                         </h3>
                         <p className="text-gray-400 text-lg font-medium leading-relaxed italic serif">
                            "You have successfully bridged the GAP in Core System Design. Current trajectory indicates a 14% increase in interview conversion probability if you finalize the 'Leadership Logic' module."
                         </p>
                         <div className="flex gap-4">
                            <button 
                              onClick={() => setActiveTab('chat')}
                              className="px-10 py-5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-950/20 transition-all transform active:scale-95 flex items-center gap-3"
                            >
                               <MessageSquare className="w-5 h-5" /> Chat with Mithra
                            </button>
                            <button 
                              onClick={() => onNavigate('progress')}
                              className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                            >
                               View Full Roadmap
                            </button>
                         </div>
                      </div>

                 <div className="space-y-6">
                    {userData?.personalityTraits ? (
                      Object.entries(userData.personalityTraits as Record<string, number>).map(([trait, score], i) => (
                        <div key={i} className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-black uppercase tracking-widest text-gray-400">{trait}</span>
                              <span className="text-xs font-black text-white">{score}%</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                className={`h-full ${i % 2 === 0 ? 'bg-blue-600' : 'bg-blue-500'}`} 
                              />
                           </div>
                        </div>
                      ))
                    ) : (
                      [
                        { label: 'Technical Maturity', score: 88, color: 'bg-blue-600' },
                        { label: 'Strategic Alignment', score: 62, color: 'bg-blue-500' },
                        { label: 'Market Velocity', score: 45, color: 'bg-emerald-500' }
                      ].map((stat, i) => (
                        <div key={i} className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
                              <span className="text-xs font-black text-white">{stat.score}%</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.score}%` }}
                                className={`h-full ${stat.color}`} 
                              />
                           </div>
                        </div>
                      ))
                    )}
                 </div>
                   </div>
                </div>

                {/* Next Objectives */}
                <div className="space-y-8">
                   <h3 className="text-2xl font-black text-gray-900 px-2 tracking-tight">Priority Objectives</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { title: 'Big Five Personality Test', desc: 'Calibrate your system with high-fidelity psychometric profiling.', icon: BrainCircuit, action: 'Start Test', id: 'psychometric-test' },
                        { title: 'Update Engineering Portfolio', desc: 'Add recent logic snippets to reflect system architecture skills.', icon: Sparkles, action: 'Go to Portfolio', id: 'builder' }
                      ].map((obj, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-[3rem] p-8 flex items-center gap-8 group hover:border-gray-900 transition-all cursor-pointer">
                           <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-700 group-hover:bg-blue-50 transition-all">
                              <obj.icon className="w-8 h-8" />
                           </div>
                           <div className="flex-1">
                              <h4 className="font-black text-gray-900 group-hover:text-blue-700 transition-colors">{obj.title}</h4>
                              <p className="text-xs text-gray-500 font-bold mt-1">{obj.desc}</p>
                           </div>
                           <button 
                             onClick={() => onNavigate(obj.id)}
                             className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-white group-hover:bg-gray-900 transition-all"
                           >
                              <ChevronRight className="w-5 h-5" />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
             </motion.div>
          ) : (
             <motion.div 
               key="chat"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
             >
                <MithraChat />
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}

