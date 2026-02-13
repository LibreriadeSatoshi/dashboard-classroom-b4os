'use client';

import { Bell } from 'phosphor-react';

interface FeedbackBellProps {
  hasUnreadFeedback: boolean;
  unreadBadgeCount?: number;
  onClick: () => void;
}

const FeedbackBell = ({ hasUnreadFeedback, unreadBadgeCount = 0, onClick }: FeedbackBellProps) => {
  const totalUnread = hasUnreadFeedback ? 1 : 0 + unreadBadgeCount;
  const showBadge = totalUnread > 0;

  return (
    <button onClick={onClick} className="relative bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg p-2 transition-all duration-200 border border-slate-600/40 shadow-lg">
      <Bell size={24} className="text-white" />
      {showBadge && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white px-1">
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </button>
  );
};

export default FeedbackBell;
