import React, { useState } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Mic2, Play, Square, Loader2, Sparkles, MessageCircle, ArrowRight, User as UserIcon, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InterviewSection() {
  const { user, userData, refreshUsage } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [feedback, setFeedback] = useState<any>(null);

  const startSession = () => {
    if (userData?.usage.mockInterviews >= 5) {
      alert("You have reached your monthly limit for mock interviews. Upgrade to Pro for more!");
      return;
    }
    setIsActive(true);
    setTranscript([{ 
      role: 'assistant', 
      content: `Hello! I'll be your interviewer today for the ${role || 'Software Engineer'} position. Let's start with 'Tell me about yourself'.` 
    }]);
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Simulate feedback generation
      const feedbackText = "Great session. You spoke clearly about your technical projects, but try to be more concise with your behavioral answers. Score: 85/100";
      setFeedback(feedbackText);
      
      await addDoc(collection(db, 'users', user.uid, 'interviews'), {
        userId: user.uid,
        role: role || 'General',
        transcript,
        feedback: feedbackText,
        createdAt: Timestamp.now()
      });

      await fetch('/api/user/increment-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, feature: 'mockInterviews' })
      });
      refreshUsage();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setIsActive(false);
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">AI Mock Interview</h2>
          <p className="text-sm text-gray-500 italic serif">Practice your pitch and technical answers in a safe environment.</p>
        </div>
        {!isActive && !feedback && (
          <div className="flex gap-4">
             <input 
              value={role} onChange={(e) => setRole(e.target.value)}
              placeholder="Target Role (e.g. Senior Product Manager)"
              className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm min-w-[300px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
             />
             <button 
              onClick={startSession}
              disabled={!role}
              className="bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all disabled:opacity-50"
             >
               <Play className="w-4 h-4 fill-current" /> Start Session
             </button>
          </div>
        )}
      </header>

      <div className="flex-1 min-h-[500px] bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col">
        {!isActive && !feedback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 space-y-6">
             <div className="w-20 h-20 bg-blue-50 text-blue-700 rounded-3xl flex items-center justify-center animate-pulse">
                <Mic2 className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-2">Interview Simulator Ready</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed italic serif">
                   Enter your target role and click start. The AI will guide you through a realistic interview session.
                </p>
             </div>
             <div className="flex gap-3">
                <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">Live Transcript</div>
                <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">AI Feedback</div>
             </div>
          </div>
        )}

        {isActive && (
          <div className="flex-1 flex flex-col p-10">
             <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4">
                {transcript.map((msg, i) => (
                   <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                         msg.role === 'user' ? 'bg-gray-100 text-gray-400' : 'bg-blue-700 text-white shadow-lg shadow-blue-100'
                      }`}>
                         {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-5 rounded-[1.5rem] max-w-[70%] text-sm ${
                         msg.role === 'user' ? 'bg-blue-50 text-blue-950 rounded-tr-none' : 'bg-gray-50 text-gray-700 rounded-tl-none italic serif'
                      }`}>
                         {msg.content}
                      </div>
                   </div>
                ))}
             </div>
             <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                   <span className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">Session Live</span>
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={() => setTranscript([...transcript, { role: 'user', content: "Simulated User Answer: I have 5 years of experience in React..." }])}
                    className="px-6 py-2 bg-white rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-100 transition-all"
                   >
                     Simulate Voice
                   </button>
                   <button 
                    onClick={handleFinish}
                    className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-all flex items-center gap-2"
                   >
                     <Square className="w-3 h-3 fill-current" /> End & Review
                   </button>
                </div>
             </div>
          </div>
        )}

        {feedback && !isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center bg-blue-950 text-white">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-8" />
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Session Complete</h3>
                <div className="max-w-xl mx-auto space-y-6">
                   <p className="text-lg italic serif leading-relaxed opacity-90">
                     {feedback}
                   </p>
                   <div className="pt-10 flex flex-col md:flex-row items-center justify-center gap-6">
                      <button 
                        onClick={() => setFeedback(null)}
                        className="bg-white text-blue-950 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-sm uppercase tracking-widest"
                      >
                         New Session <ArrowRight className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-blue-400 font-mono uppercase tracking-tighter">Usage Recorded: 1 Session</span>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}


