import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, onSnapshot, query, setDoc, doc, Timestamp } from 'firebase/firestore';
import { Trophy, Award, Star, Flame, Target, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ACHIEVEMENTS = [
  { id: 'resume_upload', name: 'First impressions', description: 'Upload your first resume', icon: 'file-text', trigger: (usage: any) => usage.resumeAnalyses > 0 },
  { id: 'skill_analysis', name: 'Knowledge Seeker', description: 'Complete a skill gap analysis', icon: 'target', trigger: (usage: any) => usage.skillGaps > 0 },
  { id: 'career_chat', name: 'Well Advised', description: 'Have 3 career advice conversations', icon: 'message-square', trigger: (usage: any) => usage.careerAdviceCount >= 3 },
  { id: 'mock_interview', name: 'Battle Ready', description: 'Complete your first mock interview', icon: 'mic', trigger: (usage: any) => usage.mockInterviews > 0 },
  { id: 'pro_user', name: 'Dedicated Talent', description: 'Achieve 10 total actions across platform', icon: 'star', trigger: (usage: any) => 
    (usage.resumeAnalyses + usage.skillGaps + usage.careerAdviceCount + usage.mockInterviews) >= 10 
  },
];

export function AchievementPanel() {
  const { user, userData } = useAuth();
  const [unlocked, setUnlocked] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'achievements'), (snap) => {
        const data: Record<string, any> = {};
        snap.docs.forEach(d => data[d.id] = d.data());
        setUnlocked(data);
    });
    return unsub;
  }, [user]);

  // Check for new unlocks when usage changes
  useEffect(() => {
    if (!user || !userData) return;
    
    ACHIEVEMENTS.forEach(async (ach) => {
        if (!unlocked[ach.id] && ach.trigger(userData.usage)) {
            // Unlock!
            await setDoc(doc(db, 'users', user.uid, 'achievements', ach.id), {
                id: ach.id,
                name: ach.name,
                description: ach.description,
                unlockedAt: Timestamp.now(),
                icon: ach.icon
            });
        }
    });
  }, [userData?.usage, user, unlocked]);

  const getIcon = (type: string, active: boolean) => {
    const className = `w-8 h-8 ${active ? 'text-amber-500' : 'text-gray-200'}`;
    switch (type) {
      case 'file-text': return <Rocket className={className} />;
      case 'target': return <Target className={className} />;
      case 'message-square': return <Flame className={className} />;
      case 'mic': return <Award className={className} />;
      case 'star': return <Trophy className={className} />;
      default: return <Star className={className} />;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-200 shadow-sm space-y-10">
       <div className="flex items-center justify-between border-b border-zinc-50 pb-8">
          <h3 className="text-sm font-bold text-zinc-900 border-b-2 border-cyan-600 pb-1 tracking-tight">
            Milestones
          </h3>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Deployment Phase: {Object.keys(unlocked).length} / {ACHIEVEMENTS.length}
          </span>
       </div>
 
       <div className="grid grid-cols-1 gap-2.5">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = !!unlocked[ach.id];
            return (
              <div 
                key={ach.id} 
                className={`flex items-center gap-5 p-5 rounded-[1.75rem] border transition-all group ${
                  isUnlocked ? 'bg-cyan-50/50 border-cyan-100' : 'bg-zinc-50/50 border-transparent opacity-50 grayscale'
                }`}
              >
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isUnlocked ? 'bg-white shadow-md' : 'bg-zinc-100'}`}>
                    {getIcon(ach.icon, isUnlocked)}
                 </div>
                 <div className="flex-1">
                    <p className={`text-sm font-bold tracking-tight mb-1 ${isUnlocked ? 'text-cyan-900' : 'text-zinc-400'}`}>
                        {ach.name}
                    </p>
                    <p className={`text-[11px] leading-tight font-medium ${isUnlocked ? 'text-cyan-700/60' : 'text-zinc-400'}`}>
                        {ach.description}
                    </p>
                 </div>
                 {isUnlocked && (
                   <div className="w-2 h-2 bg-cyan-600 rounded-full" />
                 )}
              </div>
            );
          })}
       </div>
    </div>
  );
}
