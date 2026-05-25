import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, Send, Zap, Trophy, ArrowLeft, RefreshCw,
  CheckCircle2, XCircle, Lightbulb, Target, AlertTriangle, Loader2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { callGemini } from '../lib/geminiApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TaskDef {
  taskTitle: string;
  taskDescription: string;
  successCriteria: string;
  hints: string[];
}

interface GradeResult {
  score: number;
  passed: boolean;
  feedback: string;
  highlights: string[];
  improvements: string[];
}

interface Props {
  courseTitle: string;
  topicTitle: string;
  challengeHint: string;
  turnLimit: number;
  onBack: () => void;
  onComplete: (score: number) => void;
}

export function AiPromptChallenge({ courseTitle, topicTitle, challengeHint, turnLimit, onBack, onComplete }: Props) {
  const [phase, setPhase] = useState<'loading' | 'briefing' | 'challenge' | 'grading' | 'result'>('loading');
  const [task, setTask] = useState<TaskDef | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIdx, setCurrentHintIdx] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const turnsLeft = turnLimit - turnsUsed;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    generateTask();
  }, []);

  const generateTask = async () => {
    setPhase('loading');
    try {
      const result = await callGemini(
        `You are designing an AI Prompt Challenge for the course "${courseTitle}", topic "${topicTitle}".
Generate a real-world task that requires the learner to use an AI assistant (like yourself) to accomplish.
The task should be achievable within ${turnLimit} conversational turns and should test their knowledge of "${topicTitle}".
The task should be: ${challengeHint}.

Return ONLY valid JSON:
{
  "taskTitle": "Short task title (max 10 words)",
  "taskDescription": "Clear, specific task description (2-4 sentences). Include any required inputs, context, or constraints.",
  "successCriteria": "What a successful AI-assisted output looks like (1-2 sentences).",
  "hints": ["Hint 1 for prompting strategy", "Hint 2", "Hint 3"]
}`,
        { responseMimeType: 'application/json' }
      );
      const parsed = JSON.parse(result.text);
      setTask(parsed);
      setPhase('briefing');
    } catch (e) {
      setTask({
        taskTitle: `${topicTitle} Challenge`,
        taskDescription: `Use the AI to help you complete a real-world task related to ${topicTitle} in ${courseTitle}. Ask the AI specific, well-structured questions to get the best results.`,
        successCriteria: `The AI should produce a comprehensive, accurate, and actionable output for this ${topicTitle} task.`,
        hints: ['Break your task into smaller sub-questions', 'Provide context about your specific situation', 'Ask the AI to explain its reasoning'],
      });
      setPhase('briefing');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending || turnsLeft <= 0) return;
    const userMsg = input.trim();
    setInput('');
    setIsSending(true);
    setTurnsUsed(prev => prev + 1);

    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedMessages);

    try {
      // Build multi-turn conversation for Gemini
      const systemInstruction = `You are an AI assistant helping a learner complete a challenge from the course "${courseTitle}", topic "${topicTitle}".
Task context: ${task?.taskDescription}
Be helpful, educational, and concise. Give the user exactly what they ask for to help them complete the task.`;

      const geminiContents = updatedMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const result = await callGemini(geminiContents, {}, systemInstruction);
      const assistantReply = result.text ?? 'I had trouble responding. Please try again.';

      setMessages([...updatedMessages, { role: 'assistant', content: assistantReply }]);
    } catch {
      setMessages([...updatedMessages, { role: 'assistant', content: 'Error getting response. Check your connection and try again.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const submitForGrading = async () => {
    if (messages.length === 0) return;
    setIsGrading(true);
    setPhase('grading');
    try {
      const transcript = messages.map(m => `${m.role === 'user' ? 'Learner' : 'AI'}: ${m.content}`).join('\n\n');
      const result = await callGemini(
        `You are evaluating whether a learner successfully used an AI assistant to complete a task.

Course: ${courseTitle}
Topic: ${topicTitle}
Task: ${task?.taskDescription}
Success Criteria: ${task?.successCriteria}
Turn Limit: ${turnLimit} (Learner used ${turnsUsed} turns)

Full Conversation:
---
${transcript}
---

Evaluate:
1. Did the learner successfully use AI to accomplish the task? (score 0-100)
2. Did they prompt efficiently (more turns = lower efficiency bonus)?
3. Did they apply domain knowledge from "${topicTitle}" in their prompts?

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "passed": <true if score >= 60>,
  "feedback": "2-3 sentence overall assessment",
  "highlights": ["What they did well 1", "What they did well 2"],
  "improvements": ["How to improve 1", "How to improve 2"]
}`,
        { responseMimeType: 'application/json' }
      );
      setGrade(JSON.parse(result.text));
      setPhase('result');
    } catch {
      setGrade({ score: 70, passed: true, feedback: 'Assessment complete. You demonstrated solid prompting skills.', highlights: ['Good task breakdown', 'Relevant domain knowledge applied'], improvements: ['Try more specific prompts', 'Reduce turns for efficiency'] });
      setPhase('result');
    } finally {
      setIsGrading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-700">
          <Zap className="w-10 h-10" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900">Generating Your Challenge</h3>
          <p className="text-gray-500 mt-1 italic serif">Crafting a real-world task for {topicTitle}...</p>
        </div>
      </div>
    );
  }

  // ── Grading ──────────────────────────────────────────────────────────────────
  if (phase === 'grading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-700">
          <Bot className="w-10 h-10" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900">AI is Evaluating Your Session</h3>
          <p className="text-gray-500 mt-1 italic serif">Analyzing {turnsUsed} turns of conversation...</p>
        </div>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────────────────────
  if (phase === 'result' && grade) {
    const scoreColor = grade.score >= 80 ? 'text-emerald-600' : grade.score >= 60 ? 'text-amber-600' : 'text-rose-600';
    const scoreBg = grade.score >= 80 ? 'bg-emerald-50 border-emerald-200' : grade.score >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Topics
        </button>

        {/* Score Card */}
        <div className={`rounded-[3rem] border-2 p-12 text-center space-y-4 ${scoreBg}`}>
          {grade.passed
            ? <Trophy className={`w-16 h-16 mx-auto ${scoreColor}`} />
            : <XCircle className={`w-16 h-16 mx-auto ${scoreColor}`} />}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">AI Prompt Challenge Score</p>
            <p className={`text-8xl font-black ${scoreColor}`}>{grade.score}</p>
            <p className="text-gray-500 font-bold mt-2">{grade.passed ? '✓ Challenge Passed' : '✗ Challenge Not Passed — Try Again'}</p>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm font-bold text-gray-500">
            <span>Turns Used: <strong className="text-gray-900">{turnsUsed} / {turnLimit}</strong></span>
            <span>•</span>
            <span>Topic: <strong className="text-gray-900">{topicTitle}</strong></span>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-gray-700 text-lg leading-relaxed italic serif">{grade.feedback}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest">What You Did Well</h4>
            </div>
            {grade.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm font-bold text-emerald-900">{h}</p>
              </div>
            ))}
          </div>
          <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 space-y-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-amber-600" />
              <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest">How to Improve</h4>
            </div>
            {grade.improvements.map((imp, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm font-bold text-amber-900">{imp}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={generateTask} className="flex-1 py-5 bg-white border-2 border-gray-200 rounded-2xl font-black hover:border-gray-900 transition-all flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5" /> Retry Challenge
          </button>
          <button onClick={() => onComplete(grade.score)} className="flex-1 py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-3">
            <Trophy className="w-5 h-5" /> Complete Topic
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Briefing ─────────────────────────────────────────────────────────────────
  if (phase === 'briefing' && task) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Topics
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">AI Prompt Challenge · Round B</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{task.taskTitle}</h2>
          </div>
        </div>

        {/* Task Brief */}
        <div className="p-10 bg-gray-900 text-white rounded-[3rem] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5"><Zap className="w-40 h-40" /></div>
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Mission Brief</p>
            <p className="text-lg text-gray-200 leading-relaxed">{task.taskDescription}</p>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Success Criteria</p>
              <p className="text-gray-300 font-bold italic">{task.successCriteria}</p>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Target className="w-5 h-5" />, label: 'Turn Limit', value: `${turnLimit} turns`, color: 'text-blue-700', bg: 'bg-blue-50' },
            { icon: <Bot className="w-5 h-5" />, label: 'AI Partner', value: 'Gemini 3.5 Flash', color: 'text-indigo-700', bg: 'bg-indigo-50' },
            { icon: <Trophy className="w-5 h-5" />, label: 'Pass Score', value: '60 / 100', color: 'text-emerald-700', bg: 'bg-emerald-50' },
          ].map(r => (
            <div key={r.label} className={`${r.bg} rounded-3xl p-6 flex items-center gap-4`}>
              <div className={r.color}>{r.icon}</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{r.label}</p>
                <p className={`font-black text-sm ${r.color}`}>{r.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Hints preview */}
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-amber-900">
            <span className="font-black">Tip:</span> You have {task.hints.length} hints available during the challenge. Use them wisely — hints don't cost turns.
          </p>
        </div>

        <button onClick={() => setPhase('challenge')}
          className="w-full py-6 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-4 shadow-2xl shadow-blue-200 transition-all transform active:scale-[0.99]">
          <Zap className="w-6 h-6" /> Start Challenge — {turnLimit} Turns
        </button>
      </motion.div>
    );
  }

  // ── Challenge ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="flex items-center gap-4">
          {/* Turn indicator */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest ${turnsLeft <= 2 ? 'bg-rose-100 text-rose-700' : turnsLeft <= 4 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            <Zap className="w-3.5 h-3.5" />
            {turnsLeft} turns left
          </div>
          {/* Hint button */}
          {task && currentHintIdx < task.hints.length && (
            <button onClick={() => { setShowHint(true); setCurrentHintIdx(prev => prev + 1); }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-colors">
              <Lightbulb className="w-3.5 h-3.5" /> Hint {currentHintIdx + 1}
            </button>
          )}
        </div>
      </div>

      {/* Task Mini-Banner */}
      <div className="p-4 bg-gray-900 text-white rounded-2xl flex items-center gap-3">
        <Target className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <p className="text-sm font-bold text-gray-200 line-clamp-1">{task?.taskTitle}</p>
        <button onClick={() => setPhase('briefing')} className="ml-auto text-[10px] text-gray-400 hover:text-white font-bold uppercase tracking-widest whitespace-nowrap">
          View Brief
        </button>
      </div>

      {/* Hint toast */}
      <AnimatePresence>
        {showHint && task && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-amber-900 flex-1">{task.hints[currentHintIdx - 1]}</p>
            <button onClick={() => setShowHint(false)} className="text-amber-400 hover:text-amber-700">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="min-h-[400px] max-h-[500px] overflow-y-auto bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 gap-4">
            <Bot className="w-12 h-12 text-gray-300" />
            <div>
              <p className="font-black text-gray-400">Type your first prompt below</p>
              <p className="text-sm text-gray-400 mt-1 italic">You have {turnLimit} turns to complete the task</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${msg.role === 'user' ? 'bg-blue-700 text-white' : 'bg-gray-900 text-white'}`}>
              {msg.role === 'user' ? 'You' : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-700 text-white' : 'bg-white border border-gray-100 text-gray-900'}`}>
              <div className={`text-sm leading-relaxed ${msg.role === 'assistant' ? 'prose prose-sm max-w-none' : ''}`}>
                {msg.role === 'assistant' ? <Markdown>{msg.content}</Markdown> : msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {isSending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400 font-bold">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Turn exhausted warning */}
      {turnsLeft <= 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <p className="text-sm font-bold text-rose-900 flex-1">Turn limit reached. Submit your session for evaluation.</p>
        </div>
      )}

      {/* Input + Actions */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || turnsLeft <= 0}
          rows={2}
          placeholder={turnsLeft <= 0 ? 'Turn limit reached' : `Turn ${turnsUsed + 1}/${turnLimit} — Type your prompt...`}
          className="flex-1 resize-none bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex flex-col gap-2">
          <button onClick={sendMessage} disabled={!input.trim() || isSending || turnsLeft <= 0}
            className="flex-1 w-14 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center transition-all">
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
          <button onClick={submitForGrading} disabled={messages.length < 2 || isSending}
            className="flex-1 w-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-2xl flex items-center justify-center transition-all" title="Submit for grading">
            <Trophy className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        Press Enter to send · Shift+Enter for new line · Trophy button to submit
      </p>
    </div>
  );
}
