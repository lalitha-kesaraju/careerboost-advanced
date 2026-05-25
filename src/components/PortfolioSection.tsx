import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FolderHeart, Plus, Trash2, Link as LinkIcon, Briefcase, GraduationCap, Code2, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PortfolioSection() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    type: 'project' as 'project' | 'experience' | 'education',
    skills: '',
    link: ''
  });

  useEffect(() => {
    if (user) fetchPortfolio();
  }, [user]);

  const fetchPortfolio = async () => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'portfolio'), orderBy('type'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!user || !newItem.title || !newItem.description) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'portfolio'), {
        ...newItem,
        skills: newItem.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      });
      setNewItem({ title: '', description: '', type: 'project', skills: '', link: '' });
      setShowAdd(false);
      fetchPortfolio();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'portfolio', id));
    fetchPortfolio();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <Code2 className="w-5 h-5" />;
      case 'experience': return <Briefcase className="w-5 h-5" />;
      case 'education': return <GraduationCap className="w-5 h-5" />;
      default: return <FolderHeart className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Portfolio Showcase</h2>
          <p className="text-sm text-gray-500 italic serif">Highlight your best work, education, and professional experience.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 space-y-6">
               <h3 className="text-2xl font-bold">Add Portfolio Item</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Title</label>
                        <input 
                            value={newItem.title} 
                            onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                            placeholder="e.g. Lead Developer"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type</label>
                        <select 
                            value={newItem.type} 
                            onChange={(e) => setNewItem({...newItem, type: e.target.value as any})}
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm focus:outline-none"
                        >
                            <option value="project">Project</option>
                            <option value="experience">Experience</option>
                            <option value="education">Education</option>
                        </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</label>
                    <textarea 
                        value={newItem.description} 
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm focus:outline-none h-32 resize-none"
                        placeholder="What did you achieve? Key learnings..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Skills (comma separated)</label>
                        <input 
                            value={newItem.skills} 
                            onChange={(e) => setNewItem({...newItem, skills: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm focus:outline-none"
                            placeholder="React, Node, Figma"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Link (Optional)</label>
                        <input 
                            value={newItem.link} 
                            onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm focus:outline-none"
                            placeholder="https://github.com/..."
                        />
                    </div>
                  </div>
               </div>
               <div className="flex justify-end gap-4 pt-6">
                  <button onClick={() => setShowAdd(false)} className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900">Cancel</button>
                  <button 
                    onClick={handleAdd}
                    disabled={!newItem.title || !newItem.description}
                    className="bg-[#1A1A1A] text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50"
                  >
                    Add to Portfolio
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="flex items-start justify-between mb-6">
               <div className={`p-3 rounded-2xl ${
                 item.type === 'project' ? 'bg-blue-50 text-blue-700' : 
                 item.type === 'experience' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
               }`}>
                  {getIcon(item.type)}
               </div>
               <button onClick={() => handleDelete(item.id)} className="text-gray-200 hover:text-red-500 transition-colors">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>

            <div className="space-y-4">
               <div>
                  <h4 className="text-xl font-bold tracking-tight">{item.title}</h4>
                  <p className="text-[10px] font-mono uppercase text-gray-400 tracking-widest">{item.type}</p>
               </div>
               <p className="text-sm text-gray-600 leading-relaxed italic serif opacity-80">{item.description}</p>
               
               {item.skills && item.skills.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                    {item.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-md uppercase tracking-tighter border border-gray-100">
                        {skill}
                      </span>
                    ))}
                 </div>
               )}

               {item.link && (
                 <a 
                   href={item.link} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-blue-700 text-xs font-bold hover:underline"
                 >
                   View Source/Demo <LinkIcon className="w-3 h-3" />
                 </a>
               )}
            </div>
          </motion.div>
        ))}

        {items.length === 0 && !loading && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] opacity-40">
             <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
             <p className="font-mono uppercase text-xs tracking-[0.3em]">Portfolio Empty</p>
             <p className="text-xs mt-2 italic serif">Start by adding your first project or work experience.</p>
          </div>
        )}
      </div>
    </div>
  );
}

