import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewData } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import MicIcon from './icons/MicIcon';
import { interviewQuestions } from '../data/interviewQuestions';

// Fix: Add minimal type definitions for Web Speech API to avoid TypeScript errors
// when the standard DOM library does not include them.
interface SpeechRecognitionResult {
  isFinal: boolean;
  [key: number]: { transcript: string };
}
interface SpeechRecognitionResultList {
  [key: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

// Fix: Rename to SpeechRecognitionAPI to avoid shadowing the SpeechRecognition interface type.
// Polyfill for cross-browser compatibility
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

interface InterviewScreenProps {
  interviewData: InterviewData;
  onFinish: (transcript: string, recordingUrl: string | null) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ interviewData, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(interviewData.timeLimit * 60);
  const [status, setStatus] = useState('Initializing...');
  const [conversation, setConversation] = useState<{ speaker: 'user' | 'agent'; text: string; isFinal?: boolean }[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatRef = useRef<Chat | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceQueueRef = useRef<string[]>([]);
  const finalTranscriptRef = useRef<string[]>([]);
  const currentUserTranscriptRef = useRef('');
  const endOfSpeechTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const { startRecording, stopRecording, audioUrl, stream } = useAudioRecorder();
  
  // Effect to load and select a preferred speech synthesis voice
  useEffect(() => {
    const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            const englishVoice = 
                availableVoices.find(voice => voice.name === 'Google US English') ||
                availableVoices.find(voice => voice.lang === 'en-US') ||
                availableVoices.find(voice => voice.lang.startsWith('en-'));
            selectedVoiceRef.current = englishVoice || null;
        }
    };

    // The voices list is loaded asynchronously.
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Also call it immediately in case they are already loaded.

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleEndInterview = useCallback(() => {
    // Prevent this from being called multiple times
    if (status.startsWith('Interview ended')) return;

    setStatus('Interview ended. Finishing up...');
    
    // Stop listening to the user
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (endOfSpeechTimerRef.current) {
        clearTimeout(endOfSpeechTimerRef.current);
    }

    // Stop any AI speech that is currently happening
    window.speechSynthesis.cancel();
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }

    const closingMessage = "Time is up. Thank you for the interview. Your analysis will be ready shortly.";
    const utterance = new SpeechSynthesisUtterance(closingMessage);
    utterance.lang = 'en-US';
    if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
    }

    finalTranscriptRef.current.push(`Agent: ${closingMessage}`);
    setConversation(prev => [...prev, { speaker: 'agent', text: closingMessage, isFinal: true }]);

    // When the closing message is done, stop the recording
    utterance.onend = () => {
      stopRecording();
    };

    utterance.onerror = (e) => {
        const errorEvent = e as SpeechSynthesisErrorEvent;
        console.error("SpeechSynthesis Error on closing message:", errorEvent.error);
        // Fallback to stop recording immediately if speech fails
        stopRecording();
    };
    
    window.speechSynthesis.speak(utterance);

  }, [stopRecording, status]);

  useEffect(() => {
    if (audioUrl) {
      setTimeout(() => {
        onFinish(finalTranscriptRef.current.join('\n'), audioUrl);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, onFinish]);

   useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleEndInterview();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleEndInterview]);

  // NOTE: This function is NOT wrapped in useCallback to prevent stale closures.
  // It needs to be redefined on each render to capture the latest state.
  const startListening = () => {
    if (!recognitionRef.current || isListening) return;

    setIsListening(true);
    currentUserTranscriptRef.current = '';

    setConversation(prev => {
        const last = prev[prev.length-1];
        if (last && last.speaker === 'user' && !last.isFinal) {
            return prev;
        }
        return [...prev, { speaker: 'user', text: '', isFinal: false }];
    });
    
    // The onend handler now is the one that processes the final transcript
    recognitionRef.current.onend = async () => {
        setIsListening(false);
        if (endOfSpeechTimerRef.current) {
            clearTimeout(endOfSpeechTimerRef.current);
        }
        
        const lastUserMessage = currentUserTranscriptRef.current.trim();
        
        setConversation(prev => {
            const newConversation = [...prev];
            const lastIndex = newConversation.length - 1;
            if(newConversation[lastIndex]?.speaker === 'user' && !newConversation[lastIndex]?.isFinal) {
                newConversation[lastIndex].isFinal = true;
                newConversation[lastIndex].text = lastUserMessage || newConversation[lastIndex].text || "(No response)";
            }
            return newConversation;
        });

        if (!lastUserMessage) {
            utteranceQueueRef.current.push("I didn't catch that. Could you please say that again?");
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            processUtteranceQueue();
            return;
        }
        
        if (chatRef.current) {
            finalTranscriptRef.current.push(`User: ${lastUserMessage}`);
            setStatus('Thinking...');
            try {
                const stream = await chatRef.current.sendMessageStream({ message: lastUserMessage });
                let agentResponsePart = '';
                let fullAgentResponse = '';
                
                setConversation(prev => [...prev, { speaker: 'agent', text: '' }]);

                for await (const chunk of stream) {
                    const chunkText = chunk.text;
                    agentResponsePart += chunkText;
                    fullAgentResponse += chunkText;

                    setConversation(prev => {
                        const newConversation = [...prev];
                        const lastEntry = newConversation[newConversation.length - 1];
                        if (lastEntry.speaker === 'agent') {
                           lastEntry.text = fullAgentResponse;
                        }
                        return newConversation;
                    });

                    const sentences = agentResponsePart.match(/[^.!?]+[.!?\n]+/g);
                    if (sentences) {
                        agentResponsePart = agentResponsePart.substring(sentences.join('').length);
                        sentences.forEach(sentence => utteranceQueueRef.current.push(sentence.trim()));
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        processUtteranceQueue();
                    }
                }
                
                if (agentResponsePart.trim()) {
                     utteranceQueueRef.current.push(agentResponsePart.trim());
                     // eslint-disable-next-line @typescript-eslint/no-use-before-define
                     processUtteranceQueue();
                }

                finalTranscriptRef.current.push(`Agent: ${fullAgentResponse.trim()}`);
                setStatus('Listening...');

            } catch(e) {
                setStatus('Error communicating with AI. Please try ending the interview.');
                console.error(e);
            }
        }
    };
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        if (endOfSpeechTimerRef.current) {
            clearTimeout(endOfSpeechTimerRef.current);
        }

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
      
        const currentTranscript = (finalTranscript + interimTranscript).trim();
        currentUserTranscriptRef.current = currentTranscript;

        setConversation(prev => {
            const newConversation = [...prev];
            const lastIndex = newConversation.length - 1;
            if(newConversation[lastIndex]?.speaker === 'user' && !newConversation[lastIndex]?.isFinal) {
                newConversation[lastIndex].text = currentTranscript;
            }
            return newConversation;
        });

        endOfSpeechTimerRef.current = window.setTimeout(() => {
            if (recognitionRef.current) {
                recognitionRef.current.stop(); // This will trigger onend
            }
        }, 1500); // 1.5 second silence threshold
    };

    recognitionRef.current.start();
  };

  const processUtteranceQueue = useCallback(() => {
    if (utteranceQueueRef.current.length === 0 || window.speechSynthesis.speaking) {
      return;
    }
    setIsAgentSpeaking(true);
    const textToSpeak = utteranceQueueRef.current.shift();
    if (!textToSpeak) {
      setIsAgentSpeaking(false);
      startListening();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';
    if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
    }
    utterance.onend = () => {
      if (utteranceQueueRef.current.length > 0) {
        processUtteranceQueue();
      } else {
        setIsAgentSpeaking(false);
        startListening();
      }
    };
    utterance.onerror = (e) => {
      const errorEvent = e as SpeechSynthesisErrorEvent;
      console.error("SpeechSynthesis Error:", errorEvent.error);
      setIsAgentSpeaking(false);
      startListening();
    };
    window.speechSynthesis.speak(utterance);
  }, [startListening]);

  useEffect(() => {
     const element = containerRef.current;
    if (element) {
        element.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    }

    const initializeInterview = async () => {
      if (!SpeechRecognitionAPI) {
        setStatus('Your browser does not support Speech Recognition.');
        return;
      }
      if (!window.speechSynthesis) {
        setStatus('Your browser does not support Speech Synthesis.');
        return;
      }
       if (!process.env.API_KEY) {
        setStatus('Error: API key not configured.');
        return;
      }
      
      startRecording();
      setStatus('Connecting to AI agent...');
      window.speechSynthesis.cancel(); // Clear any leftover utterances

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const roleKey = interviewData.jobRole.toLowerCase().replace(/\s+/g, '-');
      const questionsForRole = interviewQuestions[roleKey] || {
        technical: [],
        hr: interviewQuestions['general'].hr,
      };

      let systemPrompt = `You are an AI agent designed to be a voice-based interviewer. You will conduct a mock interview with ${interviewData.userName} entirely through voice for the role of '${interviewData.jobRole}'. The total interview time is ${interviewData.timeLimit} minutes. You must conduct the entire interview in English. Listen carefully to the candidate's spoken responses and then ask your questions and follow-ups verbally. Your responses should be concise.`;

      if (interviewData.resume && interviewData.resume.trim()) {
        systemPrompt += ` The candidate's resume is provided here: """${interviewData.resume}""". Tailor some of your questions to their experience.`;
      } else {
        systemPrompt += ` The candidate has not provided a resume, so conduct a general interview for the specified role.`;
      }
      systemPrompt += ` Your task is to ask a mix of technical and HR questions. Use the following JSON object as a primary source for questions. Ask questions naturally without mentioning that you are using a list. You are also encouraged to ask relevant follow-up questions based on the candidate's answers. Here is the list of suggested questions: ${JSON.stringify(questionsForRole)}. Start the interview now by introducing yourself and asking the first question.`;

      chatRef.current = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: systemPrompt }});
      finalTranscriptRef.current.push(`SYSTEM: ${systemPrompt}`);

      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // Start conversation
      setStatus('Waiting for AI...');
      const initialStream = await chatRef.current.sendMessageStream({ message: "Hello, please begin."});
      let agentResponse = '';
      setConversation([{ speaker: 'agent', text: '' }]);

      for await (const chunk of initialStream) {
        const chunkText = chunk.text;
        agentResponse += chunkText;
        setConversation(prev => {
            const newConversation = [...prev];
            if(newConversation.length > 0) newConversation[0].text = agentResponse;
            return newConversation;
        });
      }
      finalTranscriptRef.current.push(`Agent: ${agentResponse}`);
      utteranceQueueRef.current.push(agentResponse);
      processUtteranceQueue();
      setStatus('AI is speaking...');
    };

    initializeInterview();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
      if (endOfSpeechTimerRef.current) {
        clearTimeout(endOfSpeechTimerRef.current);
      }
      window.speechSynthesis.cancel();
       if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center p-4 min-h-[60vh] animate-fade-in bg-slate-800 w-full h-full">
        <div className="w-full flex justify-between items-start mb-4">
            <div className="relative w-48 h-36 rounded-lg overflow-hidden shadow-lg bg-slate-900">
               <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100"></video>
               <div className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                    Your Preview
                </div>
            </div>
            <span className="text-lg font-mono bg-slate-700 px-3 py-1 rounded-lg">{formatTime(timeLeft)}</span>
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
            <div className={`absolute inset-0 rounded-full bg-indigo-500 transition-all duration-500 ${isAgentSpeaking ? 'animate-pulse scale-105' : ''}`}></div>
            <div className={`absolute inset-2 rounded-full bg-sky-400 transition-all duration-300 ${isListening ? 'animate-pulse scale-105' : ''}`}></div>
            <MicIcon className={`relative text-white transition-colors h-12 w-12 ${isListening ? 'text-green-300' : 'text-slate-200'}`} />
        </div>
        
        <p className="text-slate-400 mb-6 text-center h-6">{status}</p>

        <div className="w-full bg-slate-900/50 p-4 rounded-lg min-h-[150px] max-h-[250px] text-lg text-slate-200 text-left flex flex-col-reverse overflow-y-auto">
           <div>
            {conversation.map((entry, index) => (
                <p key={index} className={`my-1 ${entry.speaker === 'agent' ? 'text-sky-300' : 'text-green-300'}`}>
                    <span className="font-bold capitalize">{entry.speaker}: </span>{entry.text}
                </p>
            )).reverse()}
            </div>
        </div>

        <button
            onClick={handleEndInterview}
            className="mt-8 bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-500 transition-transform transform hover:scale-105 shadow-lg"
        >
            End Interview
        </button>
    </div>
  );
};

export default InterviewScreen;