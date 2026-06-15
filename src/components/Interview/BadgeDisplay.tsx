import React from 'react';
import { Badge, ALL_BADGES, StreakData } from './services/badgeSystem';
import { Trophy } from 'lucide-react';
import StreakRewardsWidget from './StreakRewardsWidget';

interface Props {
  earnedBadges: Badge[];
  streak: StreakData;
}

const RARITY_STYLES: Record<string, string> = {
  common: 'bg-gray-50 border-gray-200',
  rare: 'bg-blue-50 border-blue-200',
  epic: 'bg-blue-50 border-blue-200',
  legendary: 'bg-amber-50 border-amber-200',
};

const RARITY_LABEL: Record<string, string> = {
  common: 'text-gray-500',
  rare: 'text-blue-600',
  epic: 'text-blue-700',
  legendary: 'text-amber-600',
};

const BadgeDisplay: React.FC<Props> = ({ earnedBadges, streak }) => {
  const earnedIds = new Set(earnedBadges.map(b => b.id));

  return (
    <div className="space-y-6">
      {/* Streak */}
      <StreakRewardsWidget streak={streak} />

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-gray-800 text-sm">{earnedBadges.length} / {ALL_BADGES.length} Badges Earned</span>
        </div>
        <div className="text-sm font-bold text-blue-700">{Math.round((earnedBadges.length / ALL_BADGES.length) * 100)}%</div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
          style={{ width: `${(earnedBadges.length / ALL_BADGES.length) * 100}%` }}
        />
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ALL_BADGES.map(def => {
          const earned = earnedIds.has(def.id);
          const badge = earnedBadges.find(b => b.id === def.id);
          return (
            <div
              key={def.id}
              className={`border rounded-2xl p-3 flex items-start gap-3 transition-all ${earned ? RARITY_STYLES[def.rarity] : 'bg-gray-50/50 border-gray-100 opacity-50'}`}
            >
              <div className={`text-2xl ${!earned ? 'grayscale opacity-50' : ''}`}>{earned ? def.icon : '🔒'}</div>
              <div className="min-w-0">
                <div className={`text-xs font-black ${earned ? RARITY_LABEL[def.rarity] : 'text-gray-400'}`}>
                  {def.name}
                </div>
                <div className="text-[10px] text-gray-500 leading-snug mt-0.5">{def.description}</div>
                {earned && badge?.unlockedAt && (
                  <div className="text-[9px] text-gray-400 mt-1">
                    {new Date(badge.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
                {!earned && (
                  <div className={`text-[9px] mt-1 capitalize font-semibold ${RARITY_LABEL[def.rarity]}`}>{def.rarity}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeDisplay;
