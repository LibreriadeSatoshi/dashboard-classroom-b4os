'use client';

import { Bell, Trophy } from 'phosphor-react';

interface FeedbackBellProps {
  hasUnreadFeedback: boolean;
  unreadBadgeCount?: number;
  onClick: () => void;
  newlyEarnedBadge?: {
    name: string;
    icon: string;
    description: string;
  } | null;
  onBadgeNotificationSeen?: () => void;
}

const FeedbackBell = ({ 
  hasUnreadFeedback, 
  unreadBadgeCount = 0, 
  onClick,
  newlyEarnedBadge,
  onBadgeNotificationSeen
}: FeedbackBellProps) => {
  const totalUnread = (hasUnreadFeedback ? 1 : 0) + unreadBadgeCount;
  const showBadge = totalUnread > 0;

  const handleClick = () => {
    if (newlyEarnedBadge && onBadgeNotificationSeen) {
      onBadgeNotificationSeen()
    }
    onClick()
  }

  return (
    <div className="relative">
      <button 
        onClick={handleClick} 
        className="relative bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg p-2 transition-all duration-200 border border-slate-600/40 shadow-lg"
      >
        <Bell size={24} className="text-white" />
        {showBadge && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white px-1">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
      
      {/* Badge earned notification */}
      {newlyEarnedBadge && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-lg shadow-xl p-3 animate-bounce">
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-full p-1">
              <Trophy size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                🎉 Badge Earned!
              </p>
              <p className="text-xs text-white/90">
                {newlyEarnedBadge.icon} {newlyEarnedBadge.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackBell;
