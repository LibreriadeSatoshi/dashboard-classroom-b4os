'use client';

import { useState } from 'react';
import { Feedback, markFeedbackAsRead } from '@/lib/feedback';
import FeedbackItem from './FeedbackItem';
import { useTranslations } from 'next-intl';

interface FeedbackDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedbackRead: () => void;
  initialFeedback: Feedback[];
}

const FeedbackDropdown = ({ isOpen, onClose, onFeedbackRead, initialFeedback }: FeedbackDropdownProps) => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(initialFeedback);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('feedback');

  const handleMarkAsRead = async (id: string) => {
    try {
      await markFeedbackAsRead(id);
      setFeedbackList(prev =>
        prev.map(item => (item.id === id ? { ...item, read: true } : item))
      );
      onFeedbackRead();
    } catch (err) {
      setError(t('error_marking_as_read'));
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden="true" />
      
      <div className="absolute right-0 left-auto top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h2 className="text-md font-semibold text-gray-800">{t('title')}</h2>
        </div>
        <div className="p-2 max-h-96 overflow-y-auto">
          {error && <p className="p-4 text-center text-red-500">{error}</p>}
          {feedbackList.length === 0 && (
            <p className="p-4 text-center text-gray-500">{t('no_feedback')}</p>
          )}
          {feedbackList.length > 0 && (
            <div className="space-y-1">
              {feedbackList.map(feedback => (
                <FeedbackItem key={feedback.id} feedback={feedback} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackDropdown;
