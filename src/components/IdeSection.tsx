import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Code, Save, Play, RefreshCw, Trash2, ChevronDown, 
  Settings, Share2, Download, Copy, AlertCircle, CheckCircle2,
  Lock, Zap, Crown
} from 'lucide-react';
import { useAuth } from '../App';
import { recordActivity } from '../services/statsService';
import { doc, collection, addDoc, getDocs, deleteDoc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../services/firestoreService';

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: string;
}

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'HTML/CSS', value: 'html' }
];

export function IdeSection() {
  const { user, userData } = useAuth();
  const [code, setCode] = useState('// Your elite logic here...\nconsole.log("Hello, Talent Master!");');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('Untitled Snippet');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  const tier = userData?.tier || 'basic';
  const canSave = tier === 'medium' || tier === 'premium';
  const isPremium = tier === 'premium';

  useEffect(() => {
    if (user && canSave) {
      loadSnippets();
    } else {
      setIsLoading(false);
    }
  }, [user, tier]);

  const loadSnippets = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'users', user.uid, 'portfolio'),
        orderBy('createdAt', 'desc'),
        limit(isPremium ? 50 : 5)
      );
      const snap = await getDocs(q);
      const loaded: Snippet[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Snippet));
      setSnippets(loaded);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/portfolio`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !canSave) return;
    setIsSaving(true);
    try {
      const snippetData = {
        title,
        code,
        language,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'users', user.uid, 'portfolio'), snippetData);
      setSnippets([{ id: docRef.id, ...snippetData }, ...snippets]);
      
      recordActivity(user.uid, 'code', 'Logic Snippet Saved', `New engineering component saved: ${title} (${language})`);
      
      alert("Snippet synchronized to Cloud");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/portfolio`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("Delete this logic forever?")) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'portfolio', id));
        setSnippets(snippets.filter(s => s.id !== id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/portfolio/${id}`);
      }
    }
  };

  return (
    <div className="space-y-8 pb-32">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-cyan-400 shadow-xl">
                <Code className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Logic Engine</h2>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Develop. Persist. Dominate.</p>
             </div>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
             <button 
               onClick={() => setActiveTab('editor')}
               className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Editor
             </button>
             <button 
               onClick={() => setActiveTab('history')}
               className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                History {snippets.length > 0 && <span className="ml-2 text-[8px] bg-gray-900 text-white px-1.5 py-0.5 rounded-full">{snippets.length}</span>}
             </button>
          </div>
       </div>

       {activeTab === 'editor' ? (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ring-1 ring-gray-200 rounded-[3rem] p-2 bg-gray-50/50 overflow-hidden">
            {/* Editor Area */}
            <div className="lg:col-span-8 bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px] shadow-2xl">
               <div className="bg-zinc-800/50 px-6 py-4 flex items-center justify-between border-b border-zinc-700/50">
                  <div className="flex items-center gap-4">
                     <div className="flex gap-1.5">
                        <div className="w-3 h-3 bg-rose-500 rounded-full" />
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                     </div>
                     <input 
                       value={title}
                       onChange={(e) => setTitle(e.target.value)}
                       className="bg-transparent border-none text-zinc-400 font-bold text-sm focus:outline-none focus:text-white"
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <select 
                       value={language}
                       onChange={(e) => setLanguage(e.target.value)}
                       className="bg-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-zinc-600 border-none"
                     >
                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                     </select>
                  </div>
               </div>

               <textarea 
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 spellCheck={false}
                 className="flex-1 bg-transparent text-emerald-400 p-8 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
               />

               <div className="bg-zinc-800/80 p-4 border-t border-zinc-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">UTF-8</span>
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Space: 2</span>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Settings className="w-5 h-5" />
                     </button>
                     <button className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Download className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>

            {/* Controls Bar */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/20 space-y-8">
                  <div className="space-y-4">
                     <h3 className="text-xl font-black text-gray-900 tracking-tight">Execution Control</h3>
                     <button className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all transform active:scale-95 group">
                        <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                        Run Script
                     </button>
                     
                     <button 
                       onClick={handleSave}
                       disabled={isSaving || !canSave}
                       className="w-full py-5 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all transform active:scale-95"
                     >
                        {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {canSave ? 'Sync to Cloud' : 'Upgrade to Sync'}
                     </button>
                  </div>

                  {!canSave && (
                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-4">
                       <div className="flex items-center gap-2 text-amber-600">
                          <Crown className="w-5 h-5" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Cloud Persistence Locked</h4>
                       </div>
                       <p className="text-xs text-amber-900 font-bold leading-relaxed">
                          Basic users cannot save code snippets. Upgrade to Medium or Premium to enable logic persistence.
                       </p>
                    </div>
                  )}

                  <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user ? 'System Online' : 'Offline'}</span>
                     </div>
                     <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{tier} PLAN</span>
                  </div>
               </div>

               <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                     <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Elite Tip</h4>
                     </div>
                     <p className="text-sm font-bold leading-relaxed italic opacity-90">
                        "Clean code is the signature of high-performance talent. Document your logic to stand out."
                     </p>
                  </div>
                  <Crown className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10" />
               </div>
            </div>
         </div>
       ) : (
         <div className="space-y-6">
            {isLoading ? (
               <div className="h-[40vh] flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-12 h-12 text-gray-300 animate-spin mb-4" />
                  <p className="text-gray-400 font-bold italic serif">Synchronizing history data...</p>
               </div>
            ) : snippets.length === 0 ? (
               <div className="h-[40vh] flex flex-col items-center justify-center text-center p-10 bg-white rounded-[3rem] border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6 font-black text-2xl">
                     ?
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">No Logic Records</h3>
                  <p className="text-gray-500 max-w-sm mx-auto italic serif mt-2">Your synchronized logic history is empty. Start coding to build your persistent portfolio.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {snippets.map(s => (
                    <motion.div 
                      key={s.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 hover:border-gray-900 transition-all group"
                    >
                       <div className="flex justify-between items-start mb-6">
                          <span className="px-3 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full">{s.language}</span>
                          <button 
                            onClick={() => handleDelete(s.id)}
                            className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                       <h4 className="text-lg font-black text-gray-900 mb-2 truncate">{s.title}</h4>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(s.createdAt).toLocaleDateString()}</p>
                       
                       <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3">
                          <button 
                            onClick={() => {
                               setCode(s.code);
                               setLanguage(s.language);
                               setTitle(s.title);
                               setActiveTab('editor');
                            }}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-600 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                          >
                             Load Editor
                          </button>
                          <button className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                             <Copy className="w-4 h-4" />
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </div>
            )}

            {!isPremium && snippets.length >= 5 && (
              <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                 <div>
                    <h4 className="text-xl font-black tracking-tight">History Limit Approaching</h4>
                    <p className="text-sm opacity-80 font-bold">Medium plan is capped at 5 snippets. Upgrade for unlimited storage.</p>
                 </div>
                 <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40">
                    Go Premium
                 </button>
              </div>
            )}
         </div>
       )}
    </div>
  );
}
