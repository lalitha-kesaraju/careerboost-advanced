import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Bot, User as UserIcon, MessageSquare, Maximize2, Minimize2, Loader2, Target } from 'lucide-react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { getMithraAdvice } from '../services/gemini';
import Markdown from 'react-markdown';

export function MithraAssistant() {
  const { user, userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'mithra', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState<any>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchFullContext = async () => {
    if (!user) return;
    
    // Attempt to gather context from all main collections
    const collections = ['resumes', 'applications', 'achievements', 'portfolio'];
    const results: any = { usage: userData?.usage };

    for (const coll of collections) {
      const q = query(collection(db, 'users', user.uid, coll), limit(10));
      const snap = await getDocs(q);
      results[coll] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    }
    
    setContextData(results);
  };

  const handleSend = async () => {
    if (!input.trim() || !user || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Fetch fresh context if it's the first message or periodically
      if (messages.length === 0) await fetchFullContext();
      
      const advice = await getMithraAdvice(userMessage, contextData, messages);
      setMessages(prev => [...prev, { role: 'mithra', content: advice }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'mithra', content: "I'm having trouble connecting to my central logic. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col mb-4 transition-all duration-300 ${
              isMaximized ? 'w-[80vw] h-[80vh]' : 'w-[400px] h-[600px] max-h-[70vh]'
            }`}
          >
            {/* Header */}
            <div className="p-8 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-700 rounded-2xl shadow-lg shadow-blue-100">
                  <Sparkles className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 leading-none mb-1.5 font-display text-lg">Boost AI</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full group-hover:animate-ping" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Logic: Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-zinc-400"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="py-12 text-center">
                  <div className="opacity-30 mb-8">
                    <Bot className="w-14 h-14 mx-auto mb-6 text-zinc-300" />
                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 max-w-[240px] mx-auto leading-relaxed">
                      Calibration complete. Waiting for user input...
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
                    <button 
                      onClick={() => {
                        const prompt = "Please provide a complete summary of my career status and progress.";
                        setInput(prompt);
                        // We can't directly call handleSend because it uses state, but clicking it will work
                      }}
                      className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      Summarize my Career
                    </button>
                    <button 
                      onClick={() => setInput("What are my biggest skill gaps right now?")}
                      className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Target className="w-3.5 h-3.5" />
                      Check Skill Gaps
                    </button>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`p-2.5 rounded-2xl h-fit border shadow-sm ${m.role === 'user' ? 'bg-white border-zinc-100' : 'bg-blue-700 border-blue-600'}`}>
                    {m.role === 'user' ? <UserIcon className="w-4.5 h-4.5 text-zinc-400" /> : <Sparkles className="w-4.5 h-4.5 text-white" />}
                  </div>
                  <div className={`p-5 rounded-[1.75rem] text-[13px] leading-relaxed max-w-[85%] font-medium ${
                    m.role === 'user' ? 'bg-zinc-50 text-zinc-600' : 'bg-white border border-zinc-200 text-zinc-800 shadow-sm'
                  }`}>
                    {m.role === 'mithra' ? (
                      <div className="prose prose-sm prose-cyan whitespace-pre-wrap">
                        <Markdown>{m.content}</Markdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="p-2.5 rounded-2xl bg-blue-700 border border-blue-600 h-fit">
                    <Loader2 className="w-4.5 h-4.5 text-white animate-spin" />
                  </div>
                  <div className="p-5 bg-white border border-zinc-200 rounded-[1.75rem] shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-8 border-t border-zinc-100 bg-white">
              <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Universal Command Input..."
                  className="w-full pl-6 pr-16 py-5 bg-zinc-50 border border-zinc-200 rounded-3xl focus:outline-none focus:border-blue-700 focus:bg-white transition-all text-sm font-medium placeholder:text-zinc-300"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 p-3 bg-blue-700 text-white rounded-2xl shadow-xl hover:bg-blue-800 transition-all disabled:opacity-30 disabled:scale-95"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
              <p className="mt-4 text-[9px] text-center font-bold uppercase text-zinc-300 tracking-[0.3em]">
                Boost AI • Career OS
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-5 rounded-full shadow-2xl transition-all duration-500 group flex items-center gap-3 ${
          isOpen ? 'bg-gray-900 text-white' : 'bg-blue-700 text-white'
        }`}
      >
        <Sparkles className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'group-hover:rotate-12'}`} />
        {!isOpen && <span className="font-bold text-sm pr-1">Boost AI</span>}
      </motion.button>
    </div>
  );
}

