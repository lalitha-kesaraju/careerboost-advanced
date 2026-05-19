import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewData } from '../../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { Mic, MicOff, Brain, User as UserIcon, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface InterviewScreenProps {
  interviewData: InterviewData;
  onFinish: (transcript: string, recordingUrl: string | null) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ interviewData, onFinish }) => {
  const [timeLeft, setTimeLeft]             = useState(interviewData.timeLimit * 60);
  const [status, setStatus]                 = useState('Initializing...');
  const [conversation, setConversation]     = useState<{ speaker: 'user' | 'agent'; text: string; isFinal?: boolean }[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isListening, setIsListening]       = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [hasCamera, setHasCamera]           = useState(false);

  const chatRef                  = useRef<Chat | null>(null);
  const recognitionRef           = useRef<any>(null);
  const utteranceQueueRef        = useRef<string[]>([]);
  const finalTranscriptRef       = useRef<string[]>([]);
  const currentUserTranscriptRef = useRef('');
  const endOfSpeechTimerRef      = useRef<number | null>(null);
  const videoRef                 = useRef<HTMLVideoElement>(null);
  const conversationEndRef       = useRef<HTMLDivElement>(null);
  const selectedVoiceRef         = useRef<SpeechSynthesisVoice | null>(null);
  const isEndingRef              = useRef(false);
  const isProcessingRef          = useRef(false);

  const { startRecording, stopRecording, audioUrl, stream } = useAudioRecorder();

  // Attach camera if available
  useEffect(() => {
    if (videoRef.current && stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoRef.current.srcObject = stream;
        setHasCamera(true);
      }
    }
  }, [stream]);

  // Scroll conversation to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Pass recording to parent when done
  useEffect(() => {
    if (audioUrl) {
      setTimeout(() => onFinish(finalTranscriptRef.current.join('\n'), audioUrl), 500);
    }
  }, [audioUrl, onFinish]);

  // Load TTS voice
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

  // ── End interview ────────────────────────────────────────────────────────
  const handleEndInterview = useCallback(() => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    setStatus('Finishing up...');
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend    = null;
      recognitionRef.current.onerror  = null;
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
    if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);
    window.speechSynthesis.cancel();

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

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleEndInterview(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleEndInterview]);

  // ── TTS queue ────────────────────────────────────────────────────────────
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
    utterance.onerror = () => {
      setIsAgentSpeaking(false);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      startListening();
    };
    window.speechSynthesis.speak(utterance);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mic / speech recognition ─────────────────────────────────────────────
  const startListening = () => {
    if (!recognitionRef.current || isEndingRef.current || isProcessingRef.current) return;

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
      if (isEndingRef.current || isProcessingRef.current) return;

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

      if (!chatRef.current) return;
      isProcessingRef.current = true;
      finalTranscriptRef.current.push(`User: ${lastUserMessage}`);
      setStatus('Thinking...');

      try {
        const aiStream = await chatRef.current.sendMessageStream({ message: lastUserMessage });
        let buffer = '';
        let fullResponse = '';

        setConversation(prev => [...prev, { speaker: 'agent', text: '' }]);

        for await (const chunk of aiStream) {
          const t = chunk.text ?? '';
          buffer += t;
          fullResponse += t;

          setConversation(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.speaker === 'agent') last.text = fullResponse;
            return updated;
          });

          const sentences = buffer.match(/[^.!?]+[.!?\n]+/g);
          if (sentences) {
            buffer = buffer.slice(sentences.join('').length);
            sentences.forEach(s => utteranceQueueRef.current.push(s.trim()));
            processUtteranceQueue();
          }
        }
        if (buffer.trim()) {
          utteranceQueueRef.current.push(buffer.trim());
          processUtteranceQueue();
        }

        finalTranscriptRef.current.push(`Agent: ${fullResponse.trim()}`);
        setStatus('Listening...');
      } catch (e: any) {
        console.error(e);
        setStatus('Error. Retrying...');
        setTimeout(() => startListening(), 1000);
      } finally {
        isProcessingRef.current = false;
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);

      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }

      const current = (currentUserTranscriptRef.current + ' ' + final + interim).trim();
      currentUserTranscriptRef.current = (currentUserTranscriptRef.current + ' ' + final).trim() + (interim ? '' : '');
      if (final) currentUserTranscriptRef.current = (currentUserTranscriptRef.current + ' ' + final).trim();

      // simpler: just accumulate
      const display = (currentUserTranscriptRef.current + ' ' + interim).trim();

      setConversation(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.speaker === 'user' && !last.isFinal) last.text = display || current;
        return updated;
      });

      // 1.5s silence → stop → onend fires
      endOfSpeechTimerRef.current = window.setTimeout(() => {
        try { recognitionRef.current?.stop(); } catch {}
      }, 1500);
    };

    recognitionRef.current.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow mic access and refresh.');
        return;
      }
      // no-speech / network / aborted → restart silently
      if (!isEndingRef.current && !isProcessingRef.current) {
        setTimeout(() => startListening(), 500);
      }
    };

    try { recognitionRef.current.start(); } catch (e) {
      console.error('Recognition start failed:', e);
    }
  };

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!SpeechRecognitionAPI) {
        setError('Speech Recognition not supported. Please use Chrome on desktop.');
        return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API key not configured.');
        return;
      }

      await startRecording();
      setStatus('Connecting to AI...');
      window.speechSynthesis.cancel();

      const ai = new GoogleGenAI({ apiKey });
      const systemPrompt = `You are a voice-based AI interviewer. Conduct a mock interview with ${interviewData.userName ?? 'the candidate'} for the role of '${interviewData.jobRole}'. Duration: ${interviewData.timeLimit} minutes. Keep all responses concise and conversational — suitable for text-to-speech. Ask a mix of technical and HR questions.${interviewData.resume ? ` Resume: """${interviewData.resume}"""` : ''} Start by introducing yourself briefly and asking the first question.`;

      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: systemPrompt },
      });

      finalTranscriptRef.current.push(`SYSTEM: ${systemPrompt}`);

      const rec = new SpeechRecognitionAPI();
      rec.continuous     = true;
      rec.interimResults = true;
      rec.lang           = 'en-US';
      recognitionRef.current = rec;

      setStatus('Waiting for AI...');
      try {
        const initStream = await chatRef.current.sendMessageStream({ message: 'Hello, please begin the interview.' });
        let buffer = '';
        let fullResponse = '';
        setConversation([{ speaker: 'agent', text: '' }]);

        for await (const chunk of initStream) {
          const t = chunk.text ?? '';
          buffer += t;
          fullResponse += t;
          setConversation([{ speaker: 'agent', text: fullResponse }]);

          const sentences = buffer.match(/[^.!?]+[.!?\n]+/g);
          if (sentences) {
            buffer = buffer.slice(sentences.join('').length);
            sentences.forEach(s => utteranceQueueRef.current.push(s.trim()));
            processUtteranceQueue();
          }
        }
        if (buffer.trim()) {
          utteranceQueueRef.current.push(buffer.trim());
          processUtteranceQueue();
        }
        finalTranscriptRef.current.push(`Agent: ${fullResponse}`);
        setStatus('AI is speaking...');
      } catch (e: any) {
        setError(`Failed to connect to AI: ${e.message}`);
      }
    };

    init();

    return () => {
      isEndingRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend    = null;
        recognitionRef.current.onerror  = null;
        try { recognitionRef.current.stop(); } catch {}
      }
      if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);
      window.speechSynthesis.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── UI ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D0D0D] text-white p-8 text-center">
        <div className="text-red-400 text-lg font-bold mb-3">Error</div>
        <div className="text-gray-400 text-sm max-w-sm">{error}</div>
      </div>
    );
  }

  return (
    // Fixed fullscreen overlay — works on both mobile and desktop
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0D] text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono text-white/50 uppercase tracking-widest">Live Interview</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-mono text-lg font-bold tabular-nums ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={handleEndInterview}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <X className="w-3.5 h-3.5" />
            End
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
        {/* Sidebar — stacks on top on mobile */}
        <div className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-white/5 flex sm:flex-col flex-row items-center sm:items-start gap-4 px-4 py-3 sm:p-5 sm:pt-6">
          {/* Camera */}
          <div className="relative w-28 sm:w-full aspect-video rounded-2xl overflow-hidden bg-black/40 shrink-0">
            {hasCamera
              ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              : <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white/20" />
                </div>
            }
            <div className="absolute bottom-1 left-2 text-[9px] bg-black/60 text-white/50 px-1.5 py-0.5 rounded font-mono">YOU</div>
          </div>

          {/* AI avatar + voice bars */}
          <div className="flex sm:flex-col flex-row items-center gap-3 sm:gap-4 sm:w-full sm:mt-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isAgentSpeaking ? 'bg-indigo-500 shadow-2xl shadow-indigo-500/40 scale-110' : 'bg-white/5'}`}>
              <Brain className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${isAgentSpeaking ? 'text-white' : 'text-white/20'}`} />
            </div>
            <div className="flex items-end gap-1 h-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-indigo-500"
                  animate={isAgentSpeaking
                    ? { height: [4, 16 + i * 3, 4], opacity: [0.3, 1, 0.3] }
                    : { height: 3, opacity: 0.15 }}
                  transition={{ duration: 0.5 + i * 0.05, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="sm:mt-auto flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl sm:w-full min-w-0">
            {isListening
              ? <Mic className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
              : isAgentSpeaking
              ? <Volume2 className="w-3 h-3 text-indigo-400 animate-pulse shrink-0" />
              : <MicOff className="w-3 h-3 text-white/20 shrink-0" />}
            <span className="text-[9px] sm:text-[10px] font-mono text-white/40 uppercase tracking-wider truncate">{status}</span>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {conversation.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 sm:gap-3 ${entry.speaker === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${entry.speaker === 'agent' ? 'bg-indigo-500' : 'bg-white/10'}`}>
                  {entry.speaker === 'agent'
                    ? <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    : <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />}
                </div>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${entry.speaker === 'agent' ? 'bg-white/5 text-white rounded-tl-none' : 'bg-indigo-600/30 text-indigo-100 rounded-tr-none'}`}>
                  {entry.text || <span className="opacity-40 text-lg">● ● ●</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={conversationEndRef} />
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
