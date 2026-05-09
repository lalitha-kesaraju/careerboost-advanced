import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../App';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Briefcase, Plus, Trash2, MapPin, Building2, Calendar, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function JobTrackerSection() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New Job state
  const [newJob, setNewJob] = useState({
    company: '',
    role: '',
    status: 'applied',
    location: '',
  });

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    const snap = await getDocs(query(collection(db, 'users', user.uid, 'applications'), orderBy('appliedDate', 'desc')));
    setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!user || !newJob.company || !newJob.role) return;
    await addDoc(collection(db, 'users', user.uid, 'applications'), {
      ...newJob,
      userId: user.uid,
      appliedDate: Timestamp.now()
    });
    setNewJob({ company: '', role: '', status: 'applied', location: '' });
    setShowAdd(false);
    fetchJobs();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'applications', id));
    fetchJobs();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Job Application Tracker</h2>
          <p className="text-sm text-gray-500 italic serif">Keep your search organized and professional.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-black transition-all"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
               <div className="col-span-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-mono">Company</label>
                 <input 
                  value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none" 
                  placeholder="e.g. Google"
                 />
               </div>
               <div className="col-span-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-mono">Role</label>
                 <input 
                  value={newJob.role} onChange={(e) => setNewJob({...newJob, role: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none" 
                  placeholder="e.g. Backend Dev"
                 />
               </div>
               <div className="col-span-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-mono">Status</label>
                 <select 
                  value={newJob.status} onChange={(e) => setNewJob({...newJob, status: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none"
                 >
                   <option value="wishlist">Wishlist</option>
                   <option value="applied">Applied</option>
                   <option value="interviewing">Interviewing</option>
                   <option value="offered">Offered</option>
                   <option value="rejected">Rejected</option>
                 </select>
               </div>
               <div className="flex gap-2">
                 <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-bold text-sm">Save</button>
                 <button onClick={() => setShowAdd(false)} className="px-4 text-gray-400 text-sm">Cancel</button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/50 p-4 px-8 border-b border-gray-100 flex items-center justify-between">
           <div className="flex gap-4">
              <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                <Filter className="w-3 h-3" /> Filter
              </button>
           </div>
           <span className="text-[10px] font-mono text-gray-400 uppercase">{jobs.length} applications total</span>
        </div>
        
        <div className="divide-y divide-gray-50">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center font-bold text-gray-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{job.company}</h4>
                    <p className="text-sm text-gray-500 font-mono tracking-tight">{job.role}</p>
                  </div>
               </div>

               <div className="flex items-center gap-10">
                  <div className="hidden lg:block text-gray-400">
                     <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1">
                       <Calendar className="w-3 h-3" /> Applied 
                     </div>
                     <p className="text-xs">{job.appliedDate?.toDate().toLocaleDateString()}</p>
                  </div>

                  <div className="text-right flex items-center gap-6">
                     <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                       job.status === 'offered' ? 'bg-emerald-100 text-emerald-700' : 
                       job.status === 'interviewing' ? 'bg-indigo-100 text-indigo-700' :
                       job.status === 'rejected' ? 'bg-red-100 text-red-700' :
                       'bg-gray-100 text-gray-600'
                     }`}>
                       {job.status}
                     </div>
                     <button onClick={() => handleDelete(job.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="p-20 text-center text-gray-300 italic serif">
               No applications tracked yet. Add your first one to start tracking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
