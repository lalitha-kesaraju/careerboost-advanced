import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewData } from '../../types';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import {
  Mic, MicOff, Terminal, Brain, User as UserIcon, Volume2, Maximize, Minimize,
  Activity, MessageSquare, Zap, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Language → BCP-47 voice locale map
const LANG_LOCALE_MAP: Record<string, string> = {
  'English': 'en-US', 'Hindi': 'hi-IN', 'Spanish': 'es-ES', 'French': 'fr-FR',
  'German': 'de-DE', 'Japanese': 'ja-JP', 'Mandarin': 'zh-CN', 'Telugu': 'te-IN',
  'Tamil': 'ta-IN', 'Kannada': 'kn-IN', 'Malayalam': 'ml-IN', 'Bengali': 'bn-IN',
  'Marathi': 'mr-IN', 'Gujarati': 'gu-IN', 'Punjabi': 'pa-IN', 'Korean': 'ko-KR',
  'Russian': 'ru-RU', 'Arabic': 'ar-SA', 'Portuguese': 'pt-BR', 'Italian': 'it-IT',
  'Turkish': 'tr-TR', 'Vietnamese': 'vi-VN', 'Thai': 'th-TH', 'Dutch': 'nl-NL',
};

const FILLER_WORDS = /\b(um|uh|like|you know|basically|actually|literally|sort of|kind of|I mean)\b/gi;

// Simple polyfill/check for Speech Recognition
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface InterviewScreenProps {
  interviewData: InterviewData;
  onFinish: (transcript: string, recordingUrl: string | null) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ interviewData, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(interviewData.timeLimit * 60);
  const [status, setStatus] = useState('Initializing...');
  const [conversation, setConversation] = useState<{ speaker: 'user' | 'agent'; text: string; isFinal?: boolean }[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Real-time behavioral metrics
  const [fillerCount, setFillerCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [sentimentScore] = useState(75);
  const [clarityScore] = useState(80);
  const sessionStartRef = useRef<number>(Date.now());

  const { isRecording, startRecording, stopRecording, audioUrl: recordedUrl, stream } = useAudioRecorder();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chatRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceQueueRef = useRef<string[]>([]);
  const finalTranscriptRef = useRef<string[]>([]);
  const currentUserTranscriptRef = useRef('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length === 0) return;
      const locale = LANG_LOCALE_MAP[interviewData.language] || 'en-US';
      // Prefer Google voices, then any matching locale
      const preferred =
        availableVoices.find(v => v.name.toLowerCase().includes('google') && v.lang.startsWith(locale.split('-')[0])) ||
        availableVoices.find(v => v.lang === locale) ||
        availableVoices.find(v => v.lang.startsWith(locale.split('-')[0])) ||
        null;
      selectedVoiceRef.current = preferred;
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [interviewData.language]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
  };

  const handleEndInterview = useCallback(() => {
    setStatus('Interview ended. Finishing up...');
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    stopRecording();
  }, [stopRecording]);

  useEffect(() => {
    if (recordedUrl) {
      onFinish(finalTranscriptRef.current.join('\n'), recordedUrl);
    }
  }, [recordedUrl, onFinish]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setIsListening(true);
    currentUserTranscriptRef.current = '';
    
    try {
        recognitionRef.current.start();
    } catch (e) {
        console.warn("Recognition already started or error:", e);
    }
  }, [isListening]);

  const processUtteranceQueue = useCallback(() => {
    if (utteranceQueueRef.current.length === 0 || window.speechSynthesis.speaking) return;
    setIsAgentSpeaking(true);
    const textToSpeak = utteranceQueueRef.current.shift();
    if (!textToSpeak) {
        setIsAgentSpeaking(false);
        startListening();
        return;
    }
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    
    utterance.onstart = () => {
        setIsAgentSpeaking(true);
    };

    utterance.onend = () => {
        if (utteranceQueueRef.current.length > 0) {
            processUtteranceQueue();
        } else {
            setIsAgentSpeaking(false);
            startListening();
        }
    };

    utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setIsAgentSpeaking(false);
        startListening();
    };

    window.speechSynthesis.speak(utterance);
  }, [startListening]);

  useEffect(() => {
    const initSession = async () => {
        try {
            await startRecording();
        } catch (err) {
            setError("Microphone and Camera permission are required for the interview. Please enable them in your browser settings.");
            setStatus('Permission Denied');
            return;
        }
        setStatus('Connecting to AI agent...');
        
        // Use proxy instead of direct SDK to protect API key
        const systemInstruction = `You are a world-class, adaptive interviewer conducting a ${interviewData.difficultyLevel} level interview for a ${interviewData.jobRole} position at ${interviewData.dreamCompany || 'a top-tier firm'}.
        
        ${interviewData.resumeText ? `CANDIDATE BACKGROUND (Extracted from Resume):
        ${interviewData.resumeText.substring(0, 2000)} ... [End of Snippet]` : ''}
        
        INTERVIEWER PROTOCOL (ADAPTIVE FLOW):
        1. DYNAMIC BRANCHING: Do not stick to a rigid list of questions. If the candidate mentions a project, Technology (especially those from their resume), or challenge, ask relevant follow-up questions to probe their depth.
        2. RESUME FIRST: If a resume is provided, prioritize asking about specific technologies, roles, or achievements mentioned there. Do not give generic feedback; be specific about the data in the resume.
        3. REFERENCE BACKGROUND: Use the candidate's resume content provided above to ask specific questions about their past experiences, projects, or achievements.
        4. SENSE DEPTH: If the candidate gives a shallow answer, probe for details using the STAR method (Situation, Task, Action, Result). 
        5. CHALLENGE ADAPTATION (Level: ${interviewData.difficultyLevel.toUpperCase()}): 
           - EASY: Focus on core concepts, clear definitions, and enthusiastic behavioral responses. Be encouraging.
           - MEDIUM: Standard professional depth. Mix architectural questions with implementation details. Expected high-quality rationale.
           - HARD: Intense technical probing. Expect optimization talk, edge-case handling, and systemic thinking. Be more critical and push the candidate to their limit.
        6. CONTEXT AWARENESS: Reference previous parts of their current conversation in your next questions.
        7. TRANSITIONS: Make transitions between topics smooth and justified.
        
        INTERVIEWER RULES:
        - STYLE: Professional, observant, and slightly challenging.
        - CONCISION: Keep your responses to 1-2 sentences. You are the listener.
        - IDENTITY: Candidate is ${interviewData.userName}.
        
        Start by introducing yourself and asking a highly specific opening question derived directly from a detail in the candidate's background (if provided), otherwise tailored to the ${interviewData.jobRole} role.`;

        // We will store history in a ref to send with each proxy call
        const chatHistoryRef: { role: string; parts: { text: string }[] }[] = [];

        chatRef.current = {
            sendMessage: async ({ message }: { message: string }) => {
                const response = await fetch('/api/gemini/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        payload: {
                            message,
                            history: [...chatHistoryRef],
                            systemInstruction,
                            config: { maxOutputTokens: 256 }
                        }
                    })
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Chat proxy failed');
                }
                
                const data = await response.json();
                
                // Update local history
                chatHistoryRef.push({ role: 'user', parts: [{ text: message }] });
                chatHistoryRef.push({ role: 'model', parts: [{ text: data.text }] });
                
                return data;
            }
        };

        if (SpeechRecognitionAPI) {
            recognitionRef.current = new SpeechRecognitionAPI();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        const text = event.results[i][0].transcript;
                        // Track behavioral metrics
                        const words = text.trim().split(/\s+/).filter(Boolean).length;
                        const fillers = (text.match(FILLER_WORDS) || []).length;
                        setTotalWords(prev => prev + words);
                        setFillerCount(prev => prev + fillers);
                        handleUserResponseComplete(text);
                        setCurrentTranscript('');
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setCurrentTranscript(interimTranscript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
        }

        // Initial Greeting - just trigger the model to start based on the system instructions
        handleUserResponseComplete("Please start the interview.", true);
    };

    const handleUserResponseComplete = async (text: string, isInternalInitial: boolean = false) => {
        if (!isInternalInitial) {
            setConversation(prev => [...prev, { speaker: 'user', text, isFinal: true }]);
            finalTranscriptRef.current.push(`User: ${text}`);
            if (recognitionRef.current) recognitionRef.current.stop();
        }

        setStatus('AI is thinking...');
        try {
            const result = await chatRef.current.sendMessage({ message: text });
            const response = result.text;
            
            setConversation(prev => [...prev, { speaker: 'agent', text: response }]);
            finalTranscriptRef.current.push(`Agent: ${response}`);
            
            utteranceQueueRef.current.push(response);
            processUtteranceQueue();
            setStatus('Waiting for response...');
        } catch (err) {
            console.error(err);
            setStatus('AI connection error.');
            setIsAgentSpeaking(false);
            startListening();
        }
    };

    initSession();

    return () => {
        window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
        stopRecording();
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleEndInterview();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, handleEndInterview]);

  return (
    <div ref={containerRef} className="flex flex-col bg-gray-900 rounded-[3.5rem] overflow-hidden shadow-2xl relative min-h-[85vh] text-white">
        {error && (
            <div className="absolute inset-0 z-50 bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-8">
                <div className="bg-gray-800 p-10 rounded-[2.5rem] border border-rose-500/30 max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                        <MicOff className="w-10 h-10 text-rose-500" />
                    </div>
                    <h3 className="text-2xl font-bold">Permissions Required</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black transition-all"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={() => onFinish('', null)}
                        className="w-full py-4 text-gray-500 hover:text-gray-300 text-xs font-black uppercase tracking-widest"
                    >
                        Exit Interview
                    </button>
                </div>
            </div>
        )}
        {/* Header */}
        <div className="p-8 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                <Terminal className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-white font-bold tracking-tight">{interviewData.jobRole} Round</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{interviewData.difficultyLevel} • {formatTime(timeLeft)} REMAINING</p>
            </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleFullscreen}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live AI Session</span>
                </div>
                <button 
                    onClick={handleEndInterview}
                    className="px-6 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl transition-all text-white font-black text-[10px] uppercase tracking-widest"
                >
                    End Interview
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex gap-8 p-10 overflow-hidden">
            {/* Left: Chat & Voice Visualization */}
            <div className="flex-1 flex flex-col gap-8">
                <div className="flex-1 bg-gray-800/30 rounded-[2.5rem] p-10 overflow-y-auto space-y-8 scroll-smooth overflow-x-hidden">
                    <AnimatePresence>
                        {conversation.map((msg, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-6 ${msg.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                    msg.speaker === 'agent' ? 'bg-indigo-600' : 'bg-gray-700'
                                }`}>
                                    {msg.speaker === 'agent' ? <Brain className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                                </div>
                                <div className={`max-w-[85%] p-8 rounded-[2rem] ${
                                    msg.speaker === 'agent' ? 'bg-gray-800 text-gray-100 rounded-tl-none border border-white/5' : 'bg-white text-gray-900 rounded-tr-none'
                                }`}>
                                    <p className="text-sm font-medium leading-relaxed italic serif">{msg.text}</p>
                                </div>
                            </motion.div>
                        ))}
                        {currentTranscript && (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-6 flex-row-reverse"
                            >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-emerald-600 animate-pulse">
                                    <UserIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="max-w-[85%] p-8 rounded-[2rem] bg-indigo-50 text-indigo-900 rounded-tr-none border border-indigo-100 shadow-lg">
                                    <p className="text-sm font-medium leading-relaxed">{currentTranscript}<span className="inline-block w-1 h-4 bg-indigo-400 ml-1 animate-blink" /></p>
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-indigo-400 mt-2 block">Live Transcript...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Voice Indicators */}
                <div className="h-32 bg-gray-800/50 rounded-[2.5rem] flex items-center justify-center gap-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isAgentSpeaking ? 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)] scale-110' : 'bg-white/5'}`}>
                            <Volume2 className={`w-8 h-8 ${isAgentSpeaking ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Interviewer</span>
                    </div>

                    <div className="flex gap-1 items-center h-12">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: isListening ? [8, 32, 12, 24, 8] : 4 }}
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                                className={`w-1 rounded-full ${isListening ? 'bg-emerald-500' : 'bg-gray-700'}`}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-110' : 'bg-white/5'}`}>
                            {isListening ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-gray-600" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {isListening ? (currentTranscript ? 'Listening...' : 'Speak Now') : 'Mic Off'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Camera Preview & Status */}
            <div className="w-96 flex flex-col gap-8">
                <div className="aspect-video bg-gray-800 rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-white/5">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100" />
                    <div className="absolute top-6 left-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
                    </div>
                </div>

                <div className="flex-1 bg-white/[0.03] rounded-[2.5rem] p-8 border border-white/5 space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Live Behavioral Metrics</h4>
                    </div>

                    {/* WPM */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3" />Words Spoken</span>
                        <span className={`text-[10px] font-black ${totalWords > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{totalWords}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min((totalWords / 300) * 100, 100)}%` }} />
                      </div>
                    </div>

                    {/* Filler Words */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle className="w-3 h-3" />Filler Words</span>
                        <span className={`text-[10px] font-black ${fillerCount === 0 ? 'text-emerald-400' : fillerCount < 5 ? 'text-amber-400' : 'text-rose-400'}`}>{fillerCount}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${Math.min(fillerCount * 10, 100)}%` }} />
                      </div>
                    </div>

                    {/* Sentiment */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><MessageSquare className="w-3 h-3" />Sentiment</span>
                        <span className="text-[10px] font-black text-emerald-400">{sentimentScore}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sentimentScore}%` }} />
                      </div>
                    </div>

                    {/* Clarity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Brain className="w-3 h-3" />Clarity</span>
                        <span className="text-[10px] font-black text-indigo-400">{clarityScore}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${clarityScore}%` }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-2">
                      {[
                        { label: 'AI Engine', value: 'Gemini 2.5 Flash', color: 'text-emerald-400' },
                        { label: 'STT', value: SpeechRecognitionAPI ? 'Active' : 'Unavailable', color: SpeechRecognitionAPI ? 'text-emerald-400' : 'text-rose-400' },
                        { label: 'State', value: status, color: 'text-indigo-400' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.label}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest truncate max-w-[120px] text-right ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default InterviewScreen;
