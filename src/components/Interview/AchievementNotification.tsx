import { useEffect, useState } from 'react';
import { Badge } from './services/badgeSystem';

interface AchievementNotificationProps {
  badges: Badge[];
  onClose: () => void;
}

const RARITY_GRADIENT: Record<Badge['rarity'], string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-500 to-cyan-500',
  epic: 'from-purple-500 to-indigo-500',
  legendary: 'from-amber-400 to-yellow-500',
};

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ badges, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (badges.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < badges.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, badges.length, onClose]);

  if (badges.length === 0 || !isVisible) return null;

  const badge = badges[currentIndex];
  const gradient = RARITY_GRADIENT[badge.rarity];

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div className={`bg-gradient-to-r ${gradient} p-1 rounded-xl shadow-2xl max-w-sm`}>
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-3xl shadow-lg animate-bounce`}>
                {badge.icon}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Achievement Unlocked!
                </span>
                <span className="text-xs text-gray-400 uppercase font-semibold">
                  {badge.rarity}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {badge.description}
              </p>
              {badges.length > 1 && (
                <div className="flex items-center justify-end">
                  <span className="text-xs text-gray-400">
                    {currentIndex + 1} of {badges.length}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {badges.length > 1 && (
            <div className="flex gap-1 mt-3">
              {badges.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded ${
                    index === currentIndex ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
