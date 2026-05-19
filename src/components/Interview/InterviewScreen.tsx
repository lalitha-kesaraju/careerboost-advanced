import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewData } from '../../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { Mic, MicOff, Terminal, Brain, User as UserIcon, Volume2, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface InterviewScreenProps {
  interviewData: InterviewData;
  onFinish: (transcript: string, recordingUrl: string | null) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ interviewData, onFinish }) => {
  const [timeLeft, setTimeLeft]         = useState(interviewData.timeLimit * 60);
  const [status, setStatus]             = useState('Initializing...');
  const [conversation, setConversation] = useState<{ speaker: 'user' | 'agent'; text: string; isFinal?: boolean }[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const chatRef              = useRef<Chat | null>(null);
  const recognitionRef       = useRef<any>(null);
  const utteranceQueueRef    = useRef<string[]>([]);
  const finalTranscriptRef   = useRef<string[]>([]);
  const currentUserTranscriptRef = useRef('');
  const endOfSpeechTimerRef  = useRef<number | null>(null);
  const videoRef             = useRef<HTMLVideoElement>(null);
  const containerRef         = useRef<HTMLDivElement>(null);
  const selectedVoiceRef     = useRef<SpeechSynthesisVoice | null>(null);
  const isEndingRef          = useRef(false);

  const { startRecording, stopRecording, audioUrl, stream } = useAudioRecorder();

  // Attach camera to video
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // When recording stops, pass transcript + URL to parent
  useEffect(() => {
    if (audioUrl) {
      setTimeout(() => {
        onFinish(finalTranscriptRef.current.join('\n'), audioUrl);
      }, 500);
    }
  }, [audioUrl, onFinish]);

  // Load preferred TTS voice
  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        selectedVoiceRef.current =
          voices.find(v => v.name === 'Google US English') ||
          voices.find(v => v.lang === 'en-US') ||
          voices.find(v => v.lang.startsWith('en-')) ||
          null;
      }
    };
    window.speechSynthesis.onvoiceschanged = load;
    load();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── End interview ────────────────────────────────────────────────────────────
  const handleEndInterview = useCallback(() => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    setStatus('Interview ended. Finishing up...');

    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend    = null;
      recognitionRef.current.onerror  = null;
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);
    window.speechSynthesis.cancel();
    if (document.fullscreenElement) document.exitFullscreen();

    const closing = "Time is up. Thank you for the interview. Your analysis will be ready shortly.";
    const utterance = new SpeechSynthesisUtterance(closing);
    utterance.lang = 'en-US';
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    finalTranscriptRef.current.push(`Agent: ${closing}`);
    setConversation(prev => [...prev, { speaker: 'agent', text: closing, isFinal: true }]);
    utterance.onend   = () => stopRecording();
    utterance.onerror = () => stopRecording();
    window.speechSynthesis.speak(utterance);
  }, [stopRecording]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleEndInterview(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleEndInterview]);

  // ── TTS queue processor ───────────────────────────────────────────────────
  const processUtteranceQueue = useCallback(() => {
    if (utteranceQueueRef.current.length === 0 || window.speechSynthesis.speaking) return;
    setIsAgentSpeaking(true);
    const text = utteranceQueueRef.current.shift();
    if (!text) { setIsAgentSpeaking(false); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    utterance.onend = () => {
      if (utteranceQueueRef.current.length > 0) {
        processUtteranceQueue();
      } else {
        setIsAgentSpeaking(false);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        startListening();
      }
    };
    utterance.onerror = () => { setIsAgentSpeaking(false); startListening(); };
    window.speechSynthesis.speak(utterance);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Listen for user speech ────────────────────────────────────────────────
  const startListening = () => {
    if (!recognitionRef.current || isEndingRef.current) return;

    setIsListening(true);
    currentUserTranscriptRef.current = '';

    setConversation(prev => {
      const last = prev[prev.length - 1];
      if (last?.speaker === 'user' && !last.isFinal) return prev;
      return [...prev, { speaker: 'user', text: '', isFinal: false }];
    });

    recognitionRef.current.onend = async () => {
      setIsListening(false);
      if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);

      const lastUserMessage = currentUserTranscriptRef.current.trim();

      setConversation(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.speaker === 'user' && !last.isFinal) {
          last.isFinal = true;
          last.text = lastUserMessage || last.text || '(No response)';
        }
        return updated;
      });

      if (!lastUserMessage) {
        utteranceQueueRef.current.push("I didn't catch that. Could you please say that again?");
        processUtteranceQueue();
        return;
      }

      if (!chatRef.current || isEndingRef.current) return;

      finalTranscriptRef.current.push(`User: ${lastUserMessage}`);
      setStatus('Thinking...');

      try {
        const stream = await chatRef.current.sendMessageStream({ message: lastUserMessage });
        let agentResponsePart = '';
        let fullAgentResponse = '';

        setConversation(prev => [...prev, { speaker: 'agent', text: '' }]);

        for await (const chunk of stream) {
          const chunkText = chunk.text ?? '';
          agentResponsePart += chunkText;
          fullAgentResponse += chunkText;

          setConversation(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.speaker === 'agent') last.text = fullAgentResponse;
            return updated;
          });

          const sentences = agentResponsePart.match(/[^.!?]+[.!?\n]+/g);
          if (sentences) {
            agentResponsePart = agentResponsePart.slice(sentences.join('').length);
            sentences.forEach(s => utteranceQueueRef.current.push(s.trim()));
            processUtteranceQueue();
          }
        }

        if (agentResponsePart.trim()) {
          utteranceQueueRef.current.push(agentResponsePart.trim());
          processUtteranceQueue();
        }

        finalTranscriptRef.current.push(`Agent: ${fullAgentResponse.trim()}`);
        setStatus('Listening...');
      } catch (e: any) {
        console.error(e);
        setStatus('Error communicating with AI.');
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);

      let interim = '', final = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      const current = (final + interim).trim();
      currentUserTranscriptRef.current = current;

      setConversation(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.speaker === 'user' && !last.isFinal) last.text = current;
        return updated;
      });

      endOfSpeechTimerRef.current = window.setTimeout(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
      }, 1500);
    };

    recognitionRef.current.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      if (e.error !== 'no-speech') setStatus('Mic error. Try again.');
    };

    try { recognitionRef.current.start(); } catch {}
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!SpeechRecognitionAPI) {
        setError('Your browser does not support Speech Recognition. Please use Chrome.');
        return;
      }
      if (!window.speechSynthesis) {
        setError('Your browser does not support Speech Synthesis.');
        return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env.local');
        return;
      }

      startRecording();
      setStatus('Connecting to AI agent...');
      window.speechSynthesis.cancel();

      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are an AI agent designed to be a voice-based interviewer. You will conduct a mock interview with ${interviewData.userName ?? 'the candidate'} entirely through voice for the role of '${interviewData.jobRole}'. The total interview time is ${interviewData.timeLimit} minutes. Conduct the entire interview in English. Your responses should be concise and conversational — suitable for text-to-speech.${interviewData.resume ? ` The candidate's resume: """${interviewData.resume}""". Tailor some questions to their experience.` : ''} Ask a mix of technical and HR questions. Start by introducing yourself and asking the first question.`;

      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: systemPrompt },
      });

      finalTranscriptRef.current.push(`SYSTEM: ${systemPrompt}`);

      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous     = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang           = 'en-US';

      // AI opens the interview
      setStatus('Waiting for AI...');
      try {
        const initStream = await chatRef.current.sendMessageStream({ message: 'Hello, please begin the interview.' });
        let agentResponse = '';
        setConversation([{ speaker: 'agent', text: '' }]);

        for await (const chunk of initStream) {
          const t = chunk.text ?? '';
          agentResponse += t;
          setConversation([{ speaker: 'agent', text: agentResponse }]);

          const sentences = agentResponse.match(/[^.!?]+[.!?\n]+/g);
          if (sentences) {
            const spoken = sentences.join('');
            agentResponse = agentResponse.slice(spoken.length);
            sentences.forEach(s => utteranceQueueRef.current.push(s.trim()));
            processUtteranceQueue();
          }
        }
        if (agentResponse.trim()) {
          utteranceQueueRef.current.push(agentResponse.trim());
          processUtteranceQueue();
        }

        finalTranscriptRef.current.push(`Agent: ${agentResponse}`);
        setStatus('AI is speaking...');
      } catch (e: any) {
        console.error(e);
        setError(`Failed to connect to AI: ${e.message}`);
      }
    };

    // Request fullscreen
    containerRef.current?.requestFullscreen().catch(() => {});
    setIsFullscreen(true);

    init();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend    = null;
        recognitionRef.current.onerror  = null;
        recognitionRef.current.stop();
      }
      if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);
      window.speechSynthesis.cancel();
      if (document.fullscreenElement) document.exitFullscreen();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── UI ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="text-red-400 text-lg font-bold mb-2">Connection Error</div>
        <div className="text-gray-400 text-sm max-w-md">{error}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex flex-col w-full min-h-[80vh] bg-[#0D0D0D] rounded-3xl overflow-hidden text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Live Interview</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-lg font-bold tabular-nums text-white">{formatTime(timeLeft)}</span>
          <button onClick={() => { if (document.fullscreenElement) { document.exitFullscreen(); setIsFullscreen(false); } else { containerRef.current?.requestFullscreen(); setIsFullscreen(true); } }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Left: Camera + visualiser */}
        <div className="w-72 shrink-0 border-r border-white/5 flex flex-col p-6 gap-6">
          {/* Camera */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white/60 px-2 py-1 rounded-lg font-mono">
              YOU
            </div>
          </div>

          {/* AI Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all ${isAgentSpeaking ? 'bg-indigo-500 shadow-2xl shadow-indigo-500/40 scale-110' : 'bg-white/5'}`}>
              <Brain className={`w-9 h-9 transition-colors ${isAgentSpeaking ? 'text-white' : 'text-white/30'}`} />
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AI Interviewer</span>
            {/* Voice bars */}
            <div className="flex items-end gap-1 h-8">
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-indigo-500"
                  animate={isAgentSpeaking
                    ? { height: [8, 24 + Math.random() * 16, 8], opacity: [0.4, 1, 0.4] }
                    : { height: 4, opacity: 0.2 }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
              {isListening
                ? <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                : isAgentSpeaking
                ? <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                : <MicOff className="w-3.5 h-3.5 text-white/20" />}
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider truncate">{status}</span>
            </div>
          </div>
        </div>

        {/* Right: Conversation */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <AnimatePresence initial={false}>
              {conversation.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${entry.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${entry.speaker === 'agent' ? 'bg-indigo-500' : 'bg-white/10'}`}>
                    {entry.speaker === 'agent' ? <Brain className="w-4 h-4 text-white" /> : <UserIcon className="w-4 h-4 text-white/60" />}
                  </div>
                  <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${entry.speaker === 'agent' ? 'bg-white/5 text-white rounded-tl-none' : 'bg-indigo-600/30 text-indigo-100 rounded-tr-none'}`}>
                    {entry.text || <span className="opacity-40 animate-pulse">●●●</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* End button */}
          <div className="p-6 border-t border-white/5">
            <button
              onClick={handleEndInterview}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold rounded-2xl text-sm uppercase tracking-widest transition-all"
            >
              End Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
