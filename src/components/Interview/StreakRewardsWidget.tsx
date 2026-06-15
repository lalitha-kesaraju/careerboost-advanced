import React from 'react';
import { StreakData } from './services/badgeSystem';

interface StreakRewardsWidgetProps {
  streak: StreakData;
  compact?: boolean;
}

interface StreakMilestone {
  days: number;
  label: string;
  reward: string;
  achieved: boolean;
}

const MILESTONE_DEFS: { days: number; label: string; reward: string }[] = [
  { days: 3, label: 'Getting Started', reward: 'Unlock the "On a Roll" badge' },
  { days: 7, label: 'Week Warrior', reward: 'Unlock the "Week Warrior" badge' },
  { days: 14, label: 'Two Week Streak', reward: 'Bragging rights and steady momentum' },
  { days: 30, label: 'Habit Formed', reward: 'Unlock the "Unstoppable" badge' },
  { days: 60, label: 'Two Month Streak', reward: 'You are in the top tier of practicers' },
  { days: 100, label: 'Century Club', reward: 'Elite consistency — outstanding work' },
];

const getStreakColor = (streak: number) => {
  if (streak >= 30) return 'from-purple-500 to-pink-600';
  if (streak >= 14) return 'from-orange-500 to-red-600';
  if (streak >= 7) return 'from-blue-500 to-cyan-600';
  return 'from-green-500 to-teal-600';
};

const getStreakIcon = (streak: number) => {
  if (streak >= 30) return '🔥💎';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 7) return '🔥';
  return '⭐';
};

const StreakRewardsWidget: React.FC<StreakRewardsWidgetProps> = ({ streak, compact = false }) => {
  if (compact) {
    return (
      <div className={`bg-gradient-to-r ${getStreakColor(streak.currentStreak)} rounded-xl shadow-lg p-4 text-white`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getStreakIcon(streak.currentStreak)}</div>
          <div>
            <div className="text-xs opacity-90">Current Streak</div>
            <div className="text-2xl font-bold">{streak.currentStreak} Days</div>
          </div>
        </div>
      </div>
    );
  }

  const milestones: StreakMilestone[] = MILESTONE_DEFS.map(m => ({
    ...m,
    achieved: streak.longestStreak >= m.days,
  }));

  const nextMilestone = milestones.find(m => !m.achieved);
  const recentMilestones = milestones.filter(m => m.achieved).slice(-3);

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${getStreakColor(streak.currentStreak)} p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-5xl">{getStreakIcon(streak.currentStreak)}</span>
          <div>
            <h3 className="text-2xl font-bold">Practice Streak</h3>
            <p className="text-sm opacity-90">Keep the momentum going!</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-200">
            <div className="text-3xl font-bold text-orange-600 mb-1">{streak.currentStreak}</div>
            <div className="text-xs text-gray-600 font-medium">Current Streak</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-1">{streak.longestStreak}</div>
            <div className="text-xs text-gray-600 font-medium">Longest Streak</div>
          </div>
        </div>

        {nextMilestone && (
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3">Next Milestone</h4>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl">{nextMilestone.days === 7 ? '🎯' : nextMilestone.days === 14 ? '🏆' : nextMilestone.days === 30 ? '👑' : '⭐'}</div>
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900">{nextMilestone.days} days — {nextMilestone.label}</h5>
                  <p className="text-sm text-gray-600">{nextMilestone.days - streak.longestStreak} days to go</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-gray-900">{streak.longestStreak} / {nextMilestone.days} days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (streak.longestStreak / nextMilestone.days) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Reward:</span> {nextMilestone.reward}
                </div>
              </div>
            </div>
          </div>
        )}

        {recentMilestones.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3">Recent Achievements</h4>
            <div className="space-y-2">
              {recentMilestones.map(milestone => (
                <div
                  key={milestone.days}
                  className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="text-2xl">✅</div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{milestone.days} days — {milestone.label}</h5>
                    <p className="text-xs text-gray-600">{milestone.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakRewardsWidget;
