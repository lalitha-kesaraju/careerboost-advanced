// Badge System — definitions, unlock logic, and localStorage persistence

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string; // ISO date
}

export const ALL_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'first_interview', name: 'First Step', description: 'Complete your first interview', icon: '🎤', rarity: 'common' },
  { id: 'five_interviews', name: 'Consistent', description: 'Complete 5 interviews', icon: '🔥', rarity: 'common' },
  { id: 'ten_interviews', name: 'Dedicated', description: 'Complete 10 interviews', icon: '💪', rarity: 'rare' },
  { id: 'twenty_five_interviews', name: 'Veteran', description: 'Complete 25 interviews', icon: '⚡', rarity: 'epic' },
  { id: 'fifty_interviews', name: 'Legend', description: 'Complete 50 interviews', icon: '👑', rarity: 'legendary' },
  { id: 'score_7', name: 'Rising Star', description: 'Score 7 or above', icon: '⭐', rarity: 'common' },
  { id: 'score_8', name: 'High Achiever', description: 'Score 8 or above', icon: '🌟', rarity: 'rare' },
  { id: 'score_9', name: 'Near Perfect', description: 'Score 9 or above', icon: '💎', rarity: 'epic' },
  { id: 'score_10', name: 'Perfect Score', description: 'Score a perfect 10', icon: '🏆', rarity: 'legendary' },
  { id: 'streak_3', name: 'On a Roll', description: '3-day practice streak', icon: '🔥', rarity: 'common' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day practice streak', icon: '⚔️', rarity: 'rare' },
  { id: 'streak_30', name: 'Unstoppable', description: '30-day practice streak', icon: '🚀', rarity: 'legendary' },
  { id: 'practice_mode', name: 'Safe Space', description: 'Complete a practice mode interview', icon: '🛡️', rarity: 'common' },
  { id: 'hard_difficulty', name: 'Brave Heart', description: 'Complete a hard difficulty interview', icon: '💥', rarity: 'rare' },
  { id: 'multilingual', name: 'Polyglot', description: 'Interview in a non-English language', icon: '🌍', rarity: 'rare' },
  { id: 'coding_round', name: 'Code Warrior', description: 'Complete a coding round', icon: '💻', rarity: 'epic' },
];

const STORAGE_KEY = 'careerboost_badges';
const STREAK_KEY  = 'careerboost_streak';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastInterviewDate: string; // YYYY-MM-DD
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBadges(badges: Badge[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { currentStreak: 0, longestStreak: 0, lastInterviewDate: '' };
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastInterviewDate: '' };
  }
}

export function updateStreak(): StreakData {
  const streak = loadStreak();
  const t = today();
  if (streak.lastInterviewDate === t) return streak; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().slice(0, 10);

  const newStreak = streak.lastInterviewDate === y ? streak.currentStreak + 1 : 1;
  const updated: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(streak.longestStreak, newStreak),
    lastInterviewDate: t,
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  return updated;
}

export interface EarnedBadgeEvent {
  badge: Badge;
  isNew: boolean;
}

export function checkAndAwardBadges(params: {
  totalInterviews: number;
  latestScore: number;
  streak: StreakData;
  isPracticeMode: boolean;
  isHardDifficulty: boolean;
  isNonEnglish: boolean;
  completedCodingRound: boolean;
}): EarnedBadgeEvent[] {
  const existing = loadBadges();
  const existingIds = new Set(existing.map(b => b.id));
  const newBadges: Badge[] = [];

  const tryUnlock = (id: string) => {
    if (!existingIds.has(id)) {
      const def = ALL_BADGES.find(b => b.id === id);
      if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
    }
  };

  const { totalInterviews, latestScore, streak, isPracticeMode, isHardDifficulty, isNonEnglish, completedCodingRound } = params;

  if (totalInterviews >= 1) tryUnlock('first_interview');
  if (totalInterviews >= 5) tryUnlock('five_interviews');
  if (totalInterviews >= 10) tryUnlock('ten_interviews');
  if (totalInterviews >= 25) tryUnlock('twenty_five_interviews');
  if (totalInterviews >= 50) tryUnlock('fifty_interviews');

  if (latestScore >= 7) tryUnlock('score_7');
  if (latestScore >= 8) tryUnlock('score_8');
  if (latestScore >= 9) tryUnlock('score_9');
  if (latestScore >= 10) tryUnlock('score_10');

  if (streak.currentStreak >= 3)  tryUnlock('streak_3');
  if (streak.currentStreak >= 7)  tryUnlock('streak_7');
  if (streak.currentStreak >= 30) tryUnlock('streak_30');

  if (isPracticeMode) tryUnlock('practice_mode');
  if (isHardDifficulty) tryUnlock('hard_difficulty');
  if (isNonEnglish) tryUnlock('multilingual');
  if (completedCodingRound) tryUnlock('coding_round');

  if (newBadges.length > 0) {
    saveBadges([...existing, ...newBadges]);
  }

  return newBadges.map(b => ({ badge: b, isNew: true }));
}
