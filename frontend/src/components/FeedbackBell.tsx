
'use client';

import { Bell } from 'phosphor-react';

interface FeedbackBellProps {
  hasUnreadFeedback: boolean;
  onClick: () => void;
}

const FeedbackBell = ({ hasUnreadFeedback, onClick }: FeedbackBellProps) => {
  return (
    <button onClick={onClick} className="relative">
      <Bell size={24} className="text-gray-600 hover:text-gray-800" />
      {hasUnreadFeedback && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      )}
    </button>
  );
};

export default FeedbackBell;
