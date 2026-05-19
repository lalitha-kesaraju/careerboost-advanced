import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { getMithraAdvice } from '../services/gemini';
import { Send, Sparkles, Loader2, Bot, User as UserIcon, BrainCircuit, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export function MithraChat() {
  const { user, userData, refreshUsage } = useAuth();
  const [messages, setMessages] = useState<{role: 'user' | 'mithra', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState<any>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const fetchFullContext = async () => {
    if (!user) return;
    const collections = ['resumes', 'applications', 'achievements', 'portfolio'];
    const results: any = { usage: userData?.usage };
    for (const coll of collections) {
      const q = query(collection(db, 'users', user.uid, coll), limit(15));
      const snap = await getDocs(q);
      results[coll] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    }
    setContextData(results);
  };

  const handleSend = async () => {
    if (!user || !userData || !input.trim() || loading) return;
    
    if (userData.usage.careerAdviceCount >= 50) {
      alert("Daily limit reached. Please return tomorrow.");
      return;
    }

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      if (messages.length === 0) await fetchFullContext();
      
      const advice = await getMithraAdvice(userMsg, contextData, messages);
      setMessages(prev => [...prev, { role: 'mithra', content: advice }]);
      
      const token = await user.getIdToken();
      await fetch('/api/user/increment-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: user.uid, feature: 'careerAdviceCount' })
      });
      refreshUsage();
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'mithra', content: "My cognitive link was interrupted. Please retry your inquiry." }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[75vh]">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-100">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Boost AI</h2>
            <p className="text-sm text-gray-500 italic serif opacity-70">Unified Intelligence Center</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
           <History className="w-3.5 h-3.5 text-gray-400" />
           <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Context Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-4 mb-8 scroll-smooth" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 px-10">
             <div className="relative mb-8">
                <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-10 animate-pulse" />
                <Bot className="w-20 h-20 text-cyan-600 relative z-10" />
             </div>
             <h3 className="font-bold text-2xl mb-3 tracking-tight">Behold, Integrated Wisdom</h3>
             <p className="text-gray-500 text-sm max-w-md leading-relaxed italic serif opacity-80">
                "I have analyzed your resumes, tracked your applications, and noted your achievements. Ask me about your trajectory, gaps, or strategy."
             </p>
             <div className="grid grid-cols-2 gap-3 mt-10 w-full max-w-lg">
                {["Critique my latest resume", "Suggest my next certification", "Analyze my interview gaps", "Update my career strategy"].map(q => (
                  <button 
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="p-4 bg-white border border-gray-100 rounded-2xl text-xs font-medium text-gray-500 hover:border-cyan-200 hover:text-cyan-600 transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
             </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all ${
              msg.role === 'user' ? 'bg-gray-100 text-gray-400' : 'bg-cyan-600 text-white'
            }`}>
              {msg.role === 'user' ? <UserIcon className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div className={`p-8 rounded-[2.5rem] max-w-[80%] shadow-lg ${
              msg.role === 'user' ? 'bg-white text-gray-900 border border-gray-100 rounded-tr-none' : 'bg-[#1A1A1A] text-white rounded-tl-none'
            }`}>
               {msg.role === 'mithra' ? (
                 <div className="prose prose-invert prose-sm prose-cyan max-w-none">
                    <Markdown>{msg.content}</Markdown>
                 </div>
               ) : (
                 <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
               )}
            </div>
          </motion.div>
        ))}
        
        {loading && (
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-lg animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div className="p-8 rounded-[2.5rem] bg-gray-900 border border-gray-800 rounded-tl-none flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-cyan-50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest ml-2">Synaptic Processing</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-5 group-focus-within:opacity-10 transition-opacity" />
        <div className="relative p-2 bg-white rounded-[2rem] border border-gray-100 shadow-2xl flex gap-3 items-center focus-within:ring-4 focus-within:ring-cyan-500/5 transition-all">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Interrogate your professional data..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-sm font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-cyan-600 text-white p-4 rounded-2xl hover:bg-cyan-700 transition-all disabled:opacity-30 shadow-xl shadow-cyan-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
