import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Loader2, X, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../App';
import { db } from '../App';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { getMithraAdvice } from '../services/gemini';

export function VoiceCompanion({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) {
  const { user, userData } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [mithraResponse, setMithraResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState<any>({});
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(final);
        setInterimTranscript(interim);
      };

      recognitionRef.current.onend = () => {
        if (isListening && transcript) {
          handleProcessVoiceInput(transcript);
        }
      };
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [isListening]);

  const fetchFullContext = async () => {
    if (!user) return;
    const collections = ['resumes', 'applications', 'achievements', 'portfolio'];
    const results: any = { usage: userData?.usage };
    for (const coll of collections) {
      const q = query(collection(db, 'users', user.uid, coll), limit(5));
      const snap = await getDocs(q);
      results[coll] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    }
    setContextData(results);
    return results;
  };

  const handleProcessVoiceInput = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setTranscript('');
    setInterimTranscript('');
    
    try {
      const ctx = await fetchFullContext();
      const advice = await getMithraAdvice(text, ctx, []);
      setMithraResponse(advice);
      speak(advice);
    } catch (error) {
      console.error(error);
      speak("I encountered a synchronization error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    
    // Clean markdown for speech
    const cleanText = text.replace(/[#*`_~]/g, '').slice(0, 300);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.pitch = 1.1;
    utterance.rate = 1.0;
    
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setMithraResponse('');
      if (synthRef.current) synthRef.current.cancel();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
    >
      <button 
        onClick={onToggle}
        className="absolute top-10 right-10 text-white/40 hover:text-white p-4 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="max-w-2xl w-full flex flex-col items-center gap-16 text-center">
        {/* Orbital Visualizer */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0.2 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl"
              />
            )}
            {isSpeaking && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 0.3 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl"
              />
            )}
          </AnimatePresence>
          
          <motion.div 
            animate={isListening || isSpeaking ? { 
                scale: [1, 1.05, 1],
                borderRadius: ["40%", "50%", "45%"]
            } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-40 h-40 bg-gradient-to-tr ${
              isListening ? 'from-indigo-600 to-purple-600' : 
              isSpeaking ? 'from-emerald-500 to-teal-500' : 
              'from-gray-700 to-gray-800'
            } rounded-[40%] flex items-center justify-center shadow-2xl relative z-10 transition-colors duration-500`}
          >
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-white animate-spin opacity-50" />
            ) : isListening ? (
              <Mic className="w-12 h-12 text-white" />
            ) : isSpeaking ? (
              <Volume2 className="w-12 h-12 text-white" />
            ) : (
              <Sparkles className="w-12 h-12 text-white opacity-20" />
            )}
          </motion.div>
        </div>

        {/* Text Display */}
        <div className="space-y-6 h-40 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest font-bold">Mithra is Listening</p>
                <h3 className="text-3xl font-medium text-white/90 italic serif px-10">
                  {interimTranscript || transcript || "Speak to Mithra..."}
                </h3>
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/40 text-xl font-mono uppercase tracking-[0.3em] animate-pulse"
              >
                Analyzing Synaptic Data...
              </motion.div>
            ) : mithraResponse ? (
              <motion.div
                key="response"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 max-w-xl mx-auto"
              >
                <p className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">Direct Response</p>
                <p className="text-2xl text-white font-medium leading-tight italic serif">
                   {mithraResponse.slice(0, 150)}{mithraResponse.length > 150 ? '...' : ''}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/20 text-3xl font-bold tracking-tighter"
              >
                Hold to Converse
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
           <button 
             onClick={toggleListening}
             className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
               isListening ? 'bg-red-500 scale-110 shadow-red-500/20 shadow-2xl' : 'bg-indigo-600 hover:scale-105 active:scale-95'
             }`}
           >
              {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
           </button>
           
           <div className="text-left">
              <p className="text-white font-bold text-sm">Companion Mode</p>
              <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Neural Link Enabled</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
