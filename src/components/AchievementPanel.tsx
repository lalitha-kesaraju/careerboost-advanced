import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { db } from '../App';
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
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
       <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Achievements
          </h3>
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            {Object.keys(unlocked).length} / {ACHIEVEMENTS.length} UNLOCKED
          </span>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-1 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = !!unlocked[ach.id];
            return (
              <div 
                key={ach.id} 
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isUnlocked ? 'bg-amber-50/50 border-amber-100' : 'bg-gray-50/30 border-transparent opacity-60'
                }`}
              >
                 <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                    {getIcon(ach.icon, isUnlocked)}
                 </div>
                 <div>
                    <p className={`text-xs font-bold tracking-tight ${isUnlocked ? 'text-amber-900' : 'text-gray-400'}`}>
                        {ach.name}
                    </p>
                    <p className={`text-[10px] ${isUnlocked ? 'text-amber-700/60' : 'text-gray-300'} italic serif`}>
                        {ach.description}
                    </p>
                 </div>
              </div>
            );
          })}
       </div>
    </div>
  );
}
