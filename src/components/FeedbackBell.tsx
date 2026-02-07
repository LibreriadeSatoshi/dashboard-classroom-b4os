
'use client';

import { Bell } from 'phosphor-react';

interface FeedbackBellProps {
  hasUnreadFeedback: boolean;
  onClick: () => void;
}

const FeedbackBell = ({ hasUnreadFeedback, onClick }: FeedbackBellProps) => {
  return (
    <button onClick={onClick} className="relative bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg p-2 transition-all duration-200 border border-slate-600/40 shadow-lg">
      <Bell size={24} className="text-white" />
      {hasUnreadFeedback && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      )}
    </button>
  );
};

export default FeedbackBell;
