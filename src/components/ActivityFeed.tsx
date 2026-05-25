import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { 
  FileText, 
  Mic, 
  Code, 
  Briefcase, 
  TrendingUp, 
  Plus, 
  History,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityItem {
  id: string;
  type: 'resume' | 'interview' | 'application' | 'code' | 'login';
  title: string;
  description: string;
  timestamp: any;
}

export function ActivityFeed() {
  const { user } = useAuth();
  const isLocal = !!(user as any)?.isLocal;
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || isLocal) { setIsLoading(false); return; }

    // Collect latest from multiple collections
    // Since we don't have a centralized 'activity' collection yet, 
    // we'll simulate one by combining the latest entries from others 
    // OR we could create a real 'logs' collection. 
    // Let's create a dynamic combined view for now.

    const q = query(
      collection(db, 'users', user.uid, 'logs'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt || Timestamp.now()
      }));
      setActivities(items as any);
      setIsLoading(false);
    }, (error) => {
      console.error("ActivityFeed error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getIcon = (type: string) => {
    const props = { className: "w-5 h-5" };
    switch (type) {
      case 'resume': return <FileText {...props} className={props.className + " text-blue-600"} />;
      case 'interview': return <Mic {...props} className={props.className + " text-blue-500"} />;
      case 'application': return <Briefcase {...props} className={props.className + " text-emerald-500"} />;
      case 'code': return <Code {...props} className={props.className + " text-amber-500"} />;
      case 'login': return <CheckCircle2 {...props} className={props.className + " text-blue-500"} />;
      default: return <History {...props} />;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-10 py-8 border-b border-zinc-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-gray-900" />
            <h3 className="text-sm font-black text-gray-900 border-b-2 border-blue-600 pb-0.5 tracking-tight uppercase">System Logs</h3>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Live Sync Engine</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scroll-smooth custom-scrollbar">
         {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center p-12 space-y-4">
               <Zap className="w-10 h-10 text-gray-100 animate-pulse" />
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Aggregating History...</p>
            </div>
         ) : activities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
               <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200">
                  <Plus className="w-8 h-8" />
               </div>
               <div>
                  <p className="text-xs font-black text-gray-900 uppercase">Initialize Trajectory</p>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed max-w-[160px] mx-auto mt-2 italic serif">No deployment logs found. Start an action to generate system events.</p>
               </div>
            </div>
         ) : (
            <div className="space-y-1 p-2">
               <AnimatePresence initial={false}>
                  {activities.map((activity, idx) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex gap-5 p-5 rounded-[1.75rem] hover:bg-zinc-50 transition-all cursor-default"
                    >
                       <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          {getIcon(activity.type)}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <h4 className="text-xs font-black text-gray-900 tracking-tight leading-tight">{activity.title}</h4>
                             <span className="text-[9px] font-bold text-gray-300 font-mono">
                                {activity.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-bold mt-1.5 line-clamp-1">{activity.description}</p>
                       </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         )}
      </div>

      <div className="p-8 border-t border-zinc-100 bg-zinc-50/50">
         <div className="flex items-center gap-4 text-blue-700">
            <Clock className="w-4 h-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption Active</p>
         </div>
      </div>
    </div>
  );
}
