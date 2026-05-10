import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppSimple';
import { db } from '../App';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, setDoc } from 'firebase/firestore';
import { analyzeResume } from '../services/gemini';
import { 
  FileText, 
  Upload, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Loader2, 
  Trash2,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ResumeSection() {
  const { user } = useAppContext();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newResumeText, setNewResumeText] = useState('');
  const [newResumeName, setNewResumeName] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'resumes'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setResumes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleSaveResume = async () => {
    if (!user || !newResumeText || !newResumeName) return;
    setLoading(true);
    try {
      const resumeRef = collection(db, 'users', user.uid, 'resumes');
      await addDoc(resumeRef, {
        userId: user.uid,
        name: newResumeName,
        content: newResumeText,
        createdAt: Timestamp.now(),
      });
      setShowBuilder(false);
      setNewResumeText('');
      setNewResumeName('');
      fetchResumes();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAnalyze = async (resume: any) => {
    if (!user || !userData) return;
    if (userData.usage.resumeAnalyses >= 3) {
      alert("You have reached your monthly limit for resume analysis. Upgrade to Pro for more!");
      return;
    }

    setAnalyzing(true);
    try {
      // 1. Analyze with Gemini
      const result = await analyzeResume(resume.content);
      setAnalysisResult(result);

      // 2. Increment usage in backend
      const resp = await fetch('/api/user/increment-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, feature: 'resumeAnalyses' })
      });

      if (resp.ok) {
        refreshUsage();
      }

      // 3. Save analysis to firestore (optional, but good for history)
      const resumeRef = doc(db, 'users', user.uid, 'resumes', resume.id);
      await setDoc(resumeRef, { analysis: result }, { merge: true });
      fetchResumes();

    } catch (e) {
      console.error(e);
    }
    setAnalyzing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Resume Management</h2>
          <p className="text-sm text-gray-500 italic serif">Build and analyze your master resume for different roles.</p>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          id="new-resume-button"
        >
          <Plus className="w-4 h-4" /> New Resume
        </button>
      </div>

      <AnimatePresence>
        {showBuilder && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-[#0A0A0A]/20 backdrop-blur-sm" onClick={() => setShowBuilder(false)} />
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-10 flex flex-col h-[80vh]">
               <h3 className="text-2xl font-bold mb-6">Resume Builder</h3>
               <div className="space-y-6 flex-1 overflow-y-auto pr-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Resume Name</label>
                    <input 
                      value={newResumeName}
                      onChange={(e) => setNewResumeName(e.target.value)}
                      placeholder="e.g. Senior Frontend Dev - 2024"
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Content (Paste or Write)</label>
                    <textarea 
                      value={newResumeText}
                      onChange={(e) => setNewResumeText(e.target.value)}
                      placeholder="Paste your existing resume text here..."
                      className="w-full flex-1 p-6 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[300px] resize-none"
                    />
                  </div>
               </div>
               <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button onClick={() => setShowBuilder(false)} className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                  <button 
                    onClick={handleSaveResume}
                    disabled={!newResumeName || !newResumeText}
                    className="bg-[#1A1A1A] text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50"
                  >
                    Save Resume
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((resume, idx) => (
          <motion.div 
            key={resume.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <h4 className="font-bold text-lg mb-1 truncate">{resume.name}</h4>
            <p className="text-[10px] text-gray-400 font-mono uppercase italic mb-6">Added {resume.createdAt?.toDate().toLocaleDateString()}</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleAnalyze(resume)}
                disabled={analyzing}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 rounded-2xl text-xs font-bold transition-all border border-transparent hover:border-indigo-100 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze with Gemini
              </button>
              {resume.analysis && (
                <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">AI Score</span>
                    <span className="text-xl font-black text-indigo-700">{resume.analysis.Score}%</span>
                  </div>
                  <div className="h-1 w-full bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${resume.analysis.Score}%` }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {resumes.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
             <FileSearch className="w-16 h-16 mb-4" />
             <p className="font-mono uppercase text-sm tracking-[0.2em]">No resumes found</p>
             <p className="text-xs mt-2 italic serif">Click "New Resume" to get started.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {analysisResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8"
          >
             <div className="flex items-center justify-between">
               <h3 className="text-3xl font-bold tracking-tight">AI Feedback Report</h3>
               <button onClick={() => setAnalysisResult(null)} className="text-gray-400 hover:text-gray-900 transition-colors uppercase font-mono text-[10px] tracking-widest">Close Report</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div>
                      <h4 className="flex items-center gap-2 text-indigo-600 font-bold mb-3 uppercase tracking-widest text-[10px]">
                        <CheckCircle className="w-4 h-4" /> Strong Points
                      </h4>
                      <ul className="space-y-3">
                        {analysisResult['Strongest points']?.map((pt: string, idx: number) => (
                           <li key={idx} className="text-sm border-l-2 border-indigo-200 pl-4 py-1 italic serif text-gray-700">{pt}</li>
                        ))}
                      </ul>
                   </div>
                   <div>
                      <h4 className="flex items-center gap-2 text-red-500 font-bold mb-3 uppercase tracking-widest text-[10px]">
                        <AlertCircle className="w-4 h-4" /> Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult['Missing critical keywords for Tech Industry']?.map((kw: string, idx: number) => (
                           <span key={idx} className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100 uppercase tracking-tighter">
                             {kw}
                           </span>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="p-8 bg-[#1A1A1A] rounded-[2rem] text-white">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Executive Summary</p>
                      <p className="text-lg leading-relaxed italic serif opacity-90">{analysisResult['Overall summary']}</p>
                   </div>
                   <div>
                      <h4 className="flex items-center gap-2 text-gray-500 font-bold mb-3 uppercase tracking-widest text-[10px]">
                        <Sparkles className="w-4 h-4" /> Suggested Bullet Improvements
                      </h4>
                      <ul className="space-y-4">
                        {analysisResult['Improvements for bullet points']?.map((imp: string, idx: number) => (
                           <li key={idx} className="text-xs text-gray-500 font-mono border-b border-gray-50 pb-2 leading-relaxed">
                             {imp}
                           </li>
                        ))}
                      </ul>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
