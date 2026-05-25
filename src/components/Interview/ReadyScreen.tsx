import React from 'react';
import { InterviewData } from '../../types';
import { Brain, Mic, Layout, Building2, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ReadyScreenProps {
  onStart: () => void;
  interviewData: InterviewData;
}

const ReadyScreen: React.FC<ReadyScreenProps> = ({ onStart, interviewData }) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-12 py-10"
    >
        <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl space-y-10">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-blue-700 rounded-[2rem] flex items-center justify-center text-white relative">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 animate-pulse" />
                <Brain className="w-10 h-10 relative z-10" />
                </div>
                <div>
                <h2 className="text-3xl font-black text-gray-900">Final Preparation</h2>
                <p className="text-gray-500 italic serif max-w-sm mx-auto mt-2">
                    "We've tailored the session for a {interviewData.difficultyLevel} {interviewData.jobRole} role at {interviewData.dreamCompany || 'your target company'}."
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                { label: 'Microphone Check', desc: 'Ensure your audio is clear', icon: Mic },
                { label: 'Camera Ready', desc: 'Check your lighting and frame', icon: Layout },
                { label: 'Quiet Environment', desc: 'Find a place with zero distractions', icon: Building2 },
                { label: 'AI Syncing', desc: 'Synchronizing expert recruiter logic', icon: Sparkles, loading: true },
                ].map((check, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-3xl flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-blue-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-700 shadow-sm group-hover:bg-blue-700 group-hover:text-white transition-colors">
                        {check.loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <check.icon className="w-6 h-6" />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{check.label}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{check.desc}</p>
                    </div>
                </div>
                ))}
            </div>

            <div className="pt-6 flex flex-col items-center gap-4 border-t border-gray-100 mt-10">
                <button 
                onClick={onStart}
                className="px-12 py-5 bg-blue-700 text-white rounded-2xl font-black shadow-xl hover:bg-blue-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                Start Final Session <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Estimated duration: {interviewData.timeLimit} minutes</p>
            </div>
        </div>
    </motion.div>
  );
};

export default ReadyScreen;
