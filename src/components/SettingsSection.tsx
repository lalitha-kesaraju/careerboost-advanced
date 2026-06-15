import React, { useState, useRef, useEffect } from 'react';
import { useAuth, UserData } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Camera, 
  Shield, 
  Mail, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Upload,
  X,
  RefreshCw,
  Zap,
  Target,
  Search
} from 'lucide-react';
import { doc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../services/firestoreService';

const AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Max&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=Charlie&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=Bailey&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=River&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Jude&backgroundColor=b6e3f4'
];

export function SettingsSection() {
  const { user, userData, refreshStats } = useAuth();
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userData?.photoURL || '');
  const [targetRole, setTargetRole] = useState(userData?.targetRole || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Role Recommendations
  const SUGGESTED_ROLES = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Business Analyst',
    'Marketing Specialist',
    'Sales Executive',
    'Cloud Architect'
  ];

  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDocs, setShowRoleDocs] = useState(false);

  const filteredRoles = SUGGESTED_ROLES.filter(r => 
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );
  
  // Camera & Upload States
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to handle stream attachment
  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  // Clean up stream on unmount or modal close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL,
        targetRole
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
        setShowConfirmSave(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 400, height: 400, facingMode: 'user' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setMessage({ type: 'error', text: 'Camera access denied. Please check permissions.' });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhotoURL(dataUrl);
        setShowConfirmSave(true);
        stopCamera();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-4xl font-black text-gray-900 tracking-tight">System Identity</h2>
           <p className="text-gray-600 italic serif text-lg opacity-80">Customize your digital presence and auth parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white border border-gray-100 rounded-[3rem] p-8 text-center shadow-xl shadow-gray-200/40 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 bg-cyan-50 rounded-[2.5rem] flex items-center justify-center text-cyan-600 font-bold border-4 border-white shadow-2xl overflow-hidden">
                       {photoURL ? (
                         <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-12 h-12" />
                       )}
                    </div>
                    <button 
                      onClick={startCamera}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-600 hover:bg-cyan-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-100 transition-colors"
                    >
                       <Camera className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -left-2 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 transition-colors"
                    >
                       <Upload className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                    />
                 </div>
                 <h3 className="text-xl font-black text-gray-900 mb-1">{userData?.displayName}</h3>
                 <p className="text-[10px] font-black text-cyan-600 border border-cyan-100 bg-cyan-50/50 px-3 py-1 rounded-full uppercase tracking-widest inline-block">{userData?.tier} Plan</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>

            <div className="bg-gray-900 text-white rounded-[3rem] p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <Shield className="w-5 h-5 text-cyan-400" />
                 <h4 className="font-black text-sm uppercase tracking-widest">Account Security</h4>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Email Hash</p>
                    <p className="text-xs font-mono truncate">{userData?.email}</p>
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-bold text-gray-600 px-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Email Verified
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2">
           <form onSubmit={handleUpdateProfile} className="bg-white border border-gray-100 rounded-[3.5rem] p-10 shadow-xl shadow-gray-200/40 space-y-10">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest px-1">Display Name</label>
                    <input 
                       type="text" 
                       value={displayName}
                       onChange={(e) => setDisplayName(e.target.value)}
                       placeholder="Enter your full name"
                       className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-cyan-500/5 focus:bg-white transition-all"
                    />
                 </div>

                 <div className="space-y-4 relative">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest px-1">Target Job Role</label>
                    <div className="relative">
                       <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                       <input 
                          type="text" 
                          value={targetRole || roleSearch}
                          onChange={(e) => {
                            setTargetRole(e.target.value);
                            setRoleSearch(e.target.value);
                            setShowRoleDocs(true);
                          }}
                          onFocus={() => setShowRoleDocs(true)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-cyan-500/5 focus:bg-white transition-all"
                       />
                       {showRoleDocs && filteredRoles.length > 0 && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden py-2"
                         >
                            {filteredRoles.map(role => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  setTargetRole(role);
                                  setRoleSearch(role);
                                  setShowRoleDocs(false);
                                }}
                                className="w-full text-left px-6 py-3 text-sm font-bold hover:bg-cyan-50 transition-colors flex items-center gap-3"
                              >
                                <Search className="w-3 h-3 text-gray-500" />
                                {role}
                              </button>
                            ))}
                         </motion.div>
                       )}
                    </div>
                    {showRoleDocs && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowRoleDocs(false)} 
                      />
                    )}
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Select Profile Avatar</label>
                      <div className="flex gap-2">
                         <button 
                            type="button" 
                            onClick={startCamera}
                            className="text-[9px] font-black uppercase text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                         >
                            <Camera className="w-3 h-3" /> Live Capture
                         </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                       {AVATARS.map((url, i) => (
                         <button 
                            key={i}
                            type="button"
                            onClick={() => setPhotoURL(url)}
                            className={`relative rounded-2xl overflow-hidden aspect-square border-4 transition-all hover:scale-105 active:scale-95 ${photoURL === url ? 'border-cyan-600 shadow-xl' : 'border-white hover:border-gray-100'}`}
                         >
                            <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                            {photoURL === url && (
                              <div className="absolute inset-0 bg-cyan-600/20 flex items-center justify-center">
                                 <CheckCircle2 className="w-6 h-6 text-white" />
                              </div>
                            )}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest px-1">Or External Photo URL</label>
                    <div className="flex gap-4">
                       <div className="relative flex-1">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input 
                             type="text" 
                             value={photoURL}
                             onChange={(e) => setPhotoURL(e.target.value)}
                             placeholder="https://example.com/photo.jpg"
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-cyan-500/5 focus:bg-white transition-all"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                   {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                   <p className="text-xs font-bold">{message.text}</p>
                </div>
              )}

              <AnimatePresence>
                {showConfirmSave && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="p-8 bg-cyan-600 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-cyan-200 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md overflow-hidden border border-white/30 flex items-center justify-center p-1">
                         <img src={photoURL} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-inner" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest">New Identity Detected</p>
                        <p className="text-xs text-cyan-100 font-bold opacity-80 mt-0.5">Would you like to set this as your permanent profile photo?</p>
                      </div>
                    </div>
                    <div className="flex gap-3 relative z-10">
                      <button 
                        type="button"
                        onClick={() => {
                          setPhotoURL(userData?.photoURL || '');
                          setShowConfirmSave(false);
                        }}
                        className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Discard
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          handleUpdateProfile({ preventDefault: () => {} } as any);
                          setShowConfirmSave(false);
                        }}
                        className="flex-1 py-4 bg-white text-cyan-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-900/20 active:scale-95 transition-all"
                      >
                        Set as Permanent
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                 type="submit"
                 disabled={isSaving}
                 className="w-full py-5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-cyan-100 transition-all transform active:scale-95"
              >
                 {isSaving ? (
                    <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                       className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                 ) : (
                    <>
                       <Save className="w-5 h-5" /> Save Changes
                    </>
                 )}
              </button>
            </form>

            <div className="mt-12 bg-white border border-rose-100 rounded-[3.5rem] p-10 shadow-xl shadow-rose-200/20 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
               <div className="relative z-10 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-rose-600 tracking-tight flex items-center gap-3">
                      <AlertCircle className="w-6 h-6" /> Danger Zone
                    </h3>
                    <p className="text-gray-500 text-sm font-bold mt-2">Permanently delete your career progress and start from scratch.</p>
                  </div>
                  
                  <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">Clear All Progress Data</p>
                      <p className="text-xs text-rose-600 font-bold opacity-80 mt-1">This will erase your resume history, interview transcripts, and skill analysis data. This action cannot be undone.</p>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!user || isResetting) return;
                        const confirm = window.confirm("Are you ABSOLUTELY SURE? This will wipe your entire CareerBoost history including resumes and interviews.");
                        if (confirm) {
                          setIsResetting(true);
                          setMessage(null);
                          try {
                            const collectionsToWipe = ['resumes', 'interviews', 'learningPlans', 'applications', 'portfolio', 'achievements', 'logs', 'personalityAnalyses'];
                            let deletedCount = 0;
                            
                            for (const col of collectionsToWipe) {
                              try {
                                const colRef = collection(db, 'users', user.uid, col);
                                const snap = await getDocs(colRef);
                                for (const docItem of snap.docs) {
                                  await deleteDoc(docItem.ref);
                                  deletedCount++;
                                }
                              } catch (colErr) {
                                console.error(`Failed to wipe ${col}:`, colErr);
                              }
                            }
                            
                            // Reset usage stats and personality data
                            await updateDoc(doc(db, 'users', user.uid), {
                              usage: {
                                resumeAnalyses: 0,
                                skillGaps: 0,
                                careerAdviceCount: 0,
                                mockInterviews: 0,
                                jobApplicationsCount: 0,
                                learningPlans: 0
                              },
                              personalityTraits: null,
                              personalityAnalysis: null,
                              lastAnalysisDate: null
                            });
                            
                            await refreshStats();
                            
                            setMessage({ type: 'success', text: `System reset complete. ${deletedCount} records purged.` });
                            setTimeout(() => {
                              window.location.reload();
                            }, 1500);
                          } catch (err) {
                            console.error("Reset error:", err);
                            handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/all`);
                            setMessage({ type: 'error', text: 'Factory reset failed. Please contact support.' });
                            setIsResetting(false);
                          }
                        }
                      }}
                      disabled={isResetting}
                      className="px-8 py-4 bg-rose-600 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 whitespace-nowrap flex items-center gap-2"
                    >
                      {isResetting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Purging Data...
                        </>
                      ) : (
                        'Factory Reset Data'
                      )}
                    </button>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[3rem] w-full max-w-lg p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <button 
                onClick={stopCamera}
                className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-all z-20"
              >
                 <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 text-center space-y-8">
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Camera Feed</h3>
                    <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest mt-1">Capture your system identity</p>
                 </div>

                 <div className="relative aspect-square bg-black rounded-[2.5rem] overflow-hidden border-4 border-white/5">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                 </div>

                 <div className="flex gap-4">
                    <button 
                       onClick={stopCamera}
                       className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-zinc-400 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={capturePhoto}
                       className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-900/40 transition-all flex items-center justify-center gap-2"
                    >
                       <Zap className="w-4 h-4" /> Capture Photo
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
