import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Bot, User as UserIcon, MessageSquare, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { useAuth } from '../App';
import { db } from '../App';
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
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">Mithra AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Active Insight</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="py-12 text-center opacity-50">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-indigo-200" />
                  <p className="text-sm italic serif truncate max-w-[200px] mx-auto text-gray-500">
                    "How can I accelerate your professional trajectory today?"
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`p-2 rounded-xl h-fit ${m.role === 'user' ? 'bg-gray-100' : 'bg-indigo-50'}`}>
                    {m.role === 'user' ? <UserIcon className="w-4 h-4 text-gray-400" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${
                    m.role === 'user' ? 'bg-gray-100/50 text-gray-700' : 'bg-white border border-gray-100 shadow-sm text-gray-800'
                  }`}>
                    {m.role === 'mithra' ? (
                      <div className="prose prose-sm prose-indigo whitespace-pre-wrap">
                        <Markdown>{m.content}</Markdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  </div>
                  <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/30">
              <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Mithra anything..."
                  className="w-full pl-6 pr-14 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-[9px] text-center font-mono uppercase text-gray-300 tracking-widest">
                Mithra Intelligence • Gemini powered
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
          isOpen ? 'bg-gray-900 text-white' : 'bg-indigo-600 text-white'
        }`}
      >
        <Sparkles className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'group-hover:rotate-12'}`} />
        {!isOpen && <span className="font-bold text-sm pr-1">Mithra AI</span>}
      </motion.button>
    </div>
  );
}
