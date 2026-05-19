import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewData } from '../../types';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import {
  Mic, MicOff, Terminal, Brain, User as UserIcon, Volume2, Maximize, Minimize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface InterviewScreenProps {
  interviewData: InterviewData;
  onFinish: (transcript: string, recordingUrl: string | null) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ interviewData, onFinish }) => {
  const [timeLeft, setTimeLeft]     = useState(interviewData.timeLimit * 60);
  const [status, setStatus]         = useState('Initializing...');
  const [conversation, setConversation] = useState<{ speaker: 'user' | 'agent'; text: string; isFinal?: boolean }[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isPaused, setIsPaused]     = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { startRecording, stopRecording, audioUrl: recordedUrl, stream } = useAudioRecorder();

  // All mutable state that must survive re-renders lives in refs
  const chatHistoryRef          = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  const systemInstructionRef    = useRef('');
  const recognitionRef          = useRef<any>(null);
  const utteranceQueueRef       = useRef<string[]>([]);
  const finalTranscriptRef      = useRef<string[]>([]);
  const currentUserTranscriptRef= useRef('');
  const endOfSpeechTimerRef     = useRef<number | null>(null);
  const videoRef                = useRef<HTMLVideoElement>(null);
  const containerRef            = useRef<HTMLDivElement>(null);
  const selectedVoiceRef        = useRef<SpeechSynthesisVoice | null>(null);
  const isEndingRef             = useRef(false);
  // Ref so startListening (empty deps) can always call the latest processUtteranceQueue
  const processQueueRef         = useRef<() => void>(() => {});

  // Attach camera stream to video element
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // When recording stops, hand transcript + URL back to parent
  useEffect(() => {
    if (recordedUrl) onFinish(finalTranscriptRef.current.join('\n'), recordedUrl);
  }, [recordedUrl, onFinish]);

  // Preload preferred TTS voice
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      selectedVoiceRef.current =
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en-')) || null;
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ── End interview ──────────────────────────────────────────────────────────
  const handleEndInterview = useCallback(() => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    setStatus('Interview ended. Finishing up...');
    window.speechSynthesis.cancel();
    if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend    = null;
      recognitionRef.current.onerror  = null;
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);

    const closing = "Thank you for your time. Your performance analysis will be ready shortly.";
    setConversation(prev => [...prev, { speaker: 'agent', text: closing, isFinal: true }]);
    finalTranscriptRef.current.push(`Agent: ${closing}`);

    const utterance = new SpeechSynthesisUtterance(closing);
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    utterance.onend   = () => stopRecording();
    utterance.onerror = () => stopRecording();
    window.speechSynthesis.speak(utterance);
  }, [stopRecording]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (timeLeft === 0) handleEndInterview();
  }, [timeLeft, handleEndInterview]);

  // ── Streaming helper: reads SSE response and queues sentences for TTS ──────
  const streamAndSpeak = async (
    response: Response,
    onChunk: (fullText: string) => void
  ): Promise<string> => {
    const reader  = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer             = '';
    let agentResponsePart  = '';
    let fullAgentResponse  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') { buffer = ''; break; }
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) {
            agentResponsePart  += parsed.text;
            fullAgentResponse  += parsed.text;
            onChunk(fullAgentResponse);
            // Split completed sentences and queue immediately for TTS
            const sentences = agentResponsePart.match(/[^.!?]+[.!?\n]+/g);
            if (sentences) {
              agentResponsePart = agentResponsePart.substring(sentences.join('').length);
              sentences.forEach(s => utteranceQueueRef.current.push(s.trim()));
              processQueueRef.current();
            }
          }
        } catch {}
      }
    }

    // Any trailing text that didn't end with punctuation
    if (agentResponsePart.trim()) {
      utteranceQueueRef.current.push(agentResponsePart.trim());
      processQueueRef.current();
    }
    return fullAgentResponse;
  };

  // ── Speech listening loop ─────────────────────────────────────────────────
  // Empty deps intentional: re-registers onend/onresult each call so handlers
  // always close over the latest refs without stale state.
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isEndingRef.current) return;

    setIsListening(true);
    currentUserTranscriptRef.current = '';
    setCurrentTranscript('');

    setConversation(prev => {
      const last = prev[prev.length - 1];
      if (last?.speaker === 'user' && !last.isFinal) return prev;
      return [...prev, { speaker: 'user', text: '', isFinal: false }];
    });

    // onend fires after 1.5s silence → process user message → call Gemini
    recognitionRef.current.onend = async () => {
      setIsListening(false);
      if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);
      if (isEndingRef.current) return;

      const userMessage = currentUserTranscriptRef.current.trim();

      setConversation(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.speaker === 'user' && !last.isFinal) {
          last.isFinal = true;
          last.text = userMessage || '(No response)';
        }
        return updated;
      });

      if (!userMessage) {
        utteranceQueueRef.current.push("I didn't catch that. Could you please say that again?");
        processQueueRef.current();
        return;
      }

      finalTranscriptRef.current.push(`User: ${userMessage}`);
      setStatus('AI is thinking...');

      try {
        const { auth } = await import('../../firebase');
        const token = await auth.currentUser?.getIdToken();

        const newUserEntry = { role: 'user', parts: [{ text: userMessage }] };
        const contents     = [...chatHistoryRef.current, newUserEntry];

        const response = await fetch('/api/gemini/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstructionRef.current,
            config: { maxOutputTokens: 256 }
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Stream failed');
        }

        setConversation(prev => [...prev, { speaker: 'agent', text: '' }]);

        const fullText = await streamAndSpeak(response, (text) => {
          setConversation(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.speaker === 'agent') last.text = text;
            return updated;
          });
        });

        chatHistoryRef.current.push(newUserEntry);
        chatHistoryRef.current.push({ role: 'model', parts: [{ text: fullText }] });
        finalTranscriptRef.current.push(`Agent: ${fullText}`);
        setStatus('Listening...');

      } catch (err) {
        console.error(err);
        setStatus('AI connection error. Retrying...');
        setIsAgentSpeaking(false);
        startListening();
      }
    };

    // onresult: update live transcript, reset silence timer on every word
    recognitionRef.current.onresult = (event: any) => {
      if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);

      let interimTranscript = '';
      let finalTranscript   = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript   += event.results[i][0].transcript;
        else                          interimTranscript += event.results[i][0].transcript;
      }

      const current = (finalTranscript + interimTranscript).trim();
      currentUserTranscriptRef.current = current;
      setCurrentTranscript(current);

      setConversation(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.speaker === 'user' && !last.isFinal) last.text = current;
        return updated;
      });

      // 1.5-second silence → stop recognition → onend fires
      endOfSpeechTimerRef.current = window.setTimeout(() => {
        if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
      }, 1500);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    try { recognitionRef.current.start(); } catch (e) {
      console.warn("Recognition already started:", e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── TTS queue processor ───────────────────────────────────────────────────
  const processUtteranceQueue = useCallback(() => {
    if (utteranceQueueRef.current.length === 0 || window.speechSynthesis.speaking) return;
    setIsAgentSpeaking(true);
    const text = utteranceQueueRef.current.shift();
    if (!text) { setIsAgentSpeaking(false); startListening(); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    utterance.onend = () => {
      if (utteranceQueueRef.current.length > 0) processQueueRef.current();
      else { setIsAgentSpeaking(false); startListening(); }
    };
    utterance.onerror = () => { setIsAgentSpeaking(false); startListening(); };
    window.speechSynthesis.speak(utterance);
  }, [startListening]);

  // Keep processQueueRef pointing at the latest version
  useEffect(() => { processQueueRef.current = processUtteranceQueue; }, [processUtteranceQueue]);

  // ── Session initialisation ────────────────────────────────────────────────
  useEffect(() => {
    const initSession = async () => {
      try {
        await startRecording();
      } catch {
        setError("Microphone and Camera permission are required. Please enable them in your browser settings.");
        setStatus('Permission Denied');
        return;
      }

      setStatus('Connecting to AI agent...');

      systemInstructionRef.current = `You are a world-class, adaptive interviewer conducting a ${interviewData.difficultyLevel} level interview for a ${interviewData.jobRole} position at ${interviewData.dreamCompany || 'a top-tier firm'}.

${interviewData.resumeText ? `CANDIDATE BACKGROUND (from Resume):\n${interviewData.resumeText.substring(0, 2000)}` : ''}

PROTOCOL:
1. DYNAMIC BRANCHING: If candidate mentions a project, technology, or challenge, ask targeted follow-up questions.
2. RESUME FIRST: If a resume is provided, prioritise specific technologies, roles, and achievements.
3. SENSE DEPTH: Probe shallow answers using the STAR method (Situation, Task, Action, Result).
4. DIFFICULTY (${interviewData.difficultyLevel.toUpperCase()}):
   - EASY: Core concepts, clear definitions, be encouraging.
   - MEDIUM: Professional depth, mix architectural questions with implementation details.
   - HARD: Intense probing, optimisation, edge-case handling, systemic thinking.
5. CONTEXT AWARENESS: Reference earlier parts of the conversation in follow-up questions.
6. CONCISION: Keep your responses to 1-2 sentences. You are the listener, not the talker.
7. IDENTITY: The candidate's name is ${interviewData.userName}.

Start by introducing yourself briefly and asking a specific opening question based on the candidate's background or target role.`;

      if (!SpeechRecognitionAPI) {
        setStatus('Speech Recognition not supported. Please use Google Chrome.');
        return;
      }

      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous     = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang           = 'en-US';

      // Trigger AI's opening statement
      setStatus('Waiting for AI...');
      try {
        const { auth } = await import('../../firebase');
        const token = await auth.currentUser?.getIdToken();

        const initEntry = { role: 'user', parts: [{ text: 'Please start the interview now.' }] };
        const response  = await fetch('/api/gemini/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            contents: [initEntry],
            systemInstruction: systemInstructionRef.current,
            config: { maxOutputTokens: 256 }
          })
        });

        if (!response.ok) throw new Error('Failed to connect to AI');

        setConversation([{ speaker: 'agent', text: '' }]);

        const fullText = await streamAndSpeak(response, (text) => {
          setConversation([{ speaker: 'agent', text }]);
        });

        chatHistoryRef.current.push(initEntry);
        chatHistoryRef.current.push({ role: 'model', parts: [{ text: fullText }] });
        finalTranscriptRef.current.push(`Agent: ${fullText}`);
        setStatus('AI is speaking...');

      } catch (err) {
        console.error(err);
        setStatus('Failed to connect to AI. Please restart.');
      }
    };

    initSession();

    return () => {
      window.speechSynthesis.cancel();
      if (endOfSpeechTimerRef.current) clearTimeout(endOfSpeechTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend    = null;
        recognitionRef.current.onerror  = null;
        try { recognitionRef.current.stop(); } catch {}
      }
      if (document.fullscreenElement) document.exitFullscreen();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s: number) => {
    const m  = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="flex flex-col bg-gray-900 rounded-[3.5rem] overflow-hidden shadow-2xl relative min-h-[85vh] text-white">

      {/* Permission error overlay */}
      {error && (
        <div className="absolute inset-0 z-50 bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-gray-800 p-10 rounded-[2.5rem] border border-rose-500/30 max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
              <MicOff className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold">Permissions Required</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black transition-all">
              Try Again
            </button>
            <button onClick={() => onFinish('', null)} className="w-full py-4 text-gray-500 hover:text-gray-300 text-xs font-black uppercase tracking-widest">
              Exit Interview
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-8 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold tracking-tight">{interviewData.jobRole} Round</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{interviewData.difficultyLevel} • {formatTime(timeLeft)} REMAINING</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleFullscreen} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live AI Session</span>
          </div>
          <button onClick={handleEndInterview} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest">
            End Interview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-8 p-10 overflow-hidden">

        {/* Left: Conversation + Voice bar */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex-1 bg-gray-800/30 rounded-[2.5rem] p-10 overflow-y-auto space-y-8 scroll-smooth">
            <AnimatePresence>
              {conversation.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-6 ${msg.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${msg.speaker === 'agent' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                    {msg.speaker === 'agent' ? <Brain className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                  </div>
                  <div className={`max-w-[85%] p-8 rounded-[2rem] ${msg.speaker === 'agent' ? 'bg-gray-800 text-gray-100 rounded-tl-none border border-white/5' : 'bg-white text-gray-900 rounded-tr-none'}`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}
                      {/* blinking cursor while streaming */}
                      {msg.speaker === 'agent' && !msg.isFinal && isAgentSpeaking && (
                        <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-1 animate-pulse align-middle" />
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Live interim transcript bubble */}
              {currentTranscript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-6 flex-row-reverse"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-emerald-600 animate-pulse">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="max-w-[85%] p-8 rounded-[2rem] bg-indigo-50 text-indigo-900 rounded-tr-none border border-indigo-100">
                    <p className="text-sm font-medium leading-relaxed">{currentTranscript}<span className="inline-block w-1 h-4 bg-indigo-400 ml-1 animate-pulse align-middle" /></p>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-indigo-400 mt-2 block">Listening...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Voice visualiser bar */}
          <div className="h-32 bg-gray-800/50 rounded-[2.5rem] flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isAgentSpeaking ? 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)] scale-110' : 'bg-white/5'}`}>
                <Volume2 className={`w-8 h-8 ${isAgentSpeaking ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Interviewer</span>
            </div>

            <div className="flex gap-1 items-center h-12">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isListening ? [8, 32, 12, 24, 8] : isAgentSpeaking ? [6, 18, 8, 14, 6] : 4 }}
                  transition={{ repeat: Infinity, duration: isListening ? 0.7 : 1.2, delay: i * 0.06 }}
                  className={`w-1 rounded-full ${isListening ? 'bg-emerald-500' : isAgentSpeaking ? 'bg-indigo-500' : 'bg-gray-700'}`}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-110' : 'bg-white/5'}`}>
                {isListening ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-gray-600" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {isListening ? (currentTranscript ? 'Listening...' : 'Speak Now') : isAgentSpeaking ? 'AI Speaking' : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Camera + Status */}
        <div className="w-96 flex flex-col gap-8">
          <div className="aspect-video bg-gray-800 rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-white/5">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100" />
            <div className="absolute top-6 left-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
            </div>
          </div>

          <div className="flex-1 bg-white/[0.03] rounded-[2.5rem] p-10 border border-white/5 space-y-6">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Session Status</h4>
            <div className="space-y-4">
              {[
                { label: 'AI Engine', value: 'Gemini Flash (Streaming)', color: 'text-emerald-400' },
                { label: 'Speech Recognition', value: SpeechRecognitionAPI ? 'Active' : 'Not Supported', color: SpeechRecognitionAPI ? 'text-emerald-400' : 'text-rose-400' },
                { label: 'Difficulty', value: interviewData.difficultyLevel.toUpperCase(), color: interviewData.difficultyLevel === 'hard' ? 'text-rose-400' : interviewData.difficultyLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400' },
                { label: 'State', value: status, color: 'text-indigo-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.value}</span>
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
