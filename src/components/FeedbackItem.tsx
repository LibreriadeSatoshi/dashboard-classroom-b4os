
'use client';

import { Feedback } from '@/lib/feedback';
import { CheckCircle } from 'phosphor-react';

interface FeedbackItemProps {
  feedback: Feedback;
  onMarkAsRead: (id: string) => void;
}

const FeedbackItem = ({ feedback, onMarkAsRead }: FeedbackItemProps) => {
  const handleMarkAsRead = () => {
    onMarkAsRead(feedback.id);
  };

  return (
    <div className={`p-4 border-b border-gray-200 ${feedback.read ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex justify-between items-start">
        <p className={`text-sm ${feedback.read ? 'text-gray-500' : 'font-medium text-gray-800'}`}>
          {feedback.content}
        </p>
        {!feedback.read && (
          <button
            onClick={handleMarkAsRead}
            className="ml-4 flex-shrink-0 text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            title="Mark as read"
          >
            <CheckCircle size={20} />
            <span className="text-xs hidden sm:inline">Read</span>
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {new Date(feedback.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default FeedbackItem;
