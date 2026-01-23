
'use client';

import { useEffect, useState } from 'react';
import { X } from 'phosphor-react';
import { Feedback, getFeedback, markFeedbackAsRead } from '@/lib/feedback';
import FeedbackItem from './FeedbackItem';

interface FeedbackPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedbackRead: () => void; // Callback to notify parent about feedback being read
}

const FeedbackPanel = ({ isOpen, onClose, onFeedbackRead }: FeedbackPanelProps) => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFeedback();
    }
  }, [isOpen]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFeedback();
      setFeedbackList(data);
    } catch (err) {
      setError('Failed to load feedback.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markFeedbackAsRead(id);
      // Optimistically update UI
      setFeedbackList(prev =>
        prev.map(item => (item.id === id ? { ...item, read: true } : item))
      );
      onFeedbackRead(); // Notify parent that feedback status might have changed
    } catch (err) {
      setError('Failed to mark feedback as read.');
      console.error(err);
      // Re-fetch to ensure state consistency if optimistic update fails
      fetchFeedback(); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 right-0 ml-auto w-full max-w-md bg-white shadow-lg h-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Feedback</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          {loading && <p>Loading feedback...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && feedbackList.length === 0 && (
            <p>No feedback to display.</p>
          )}
          {!loading && !error && feedbackList.length > 0 && (
            <div>
              {feedbackList.map(feedback => (
                <FeedbackItem key={feedback.id} feedback={feedback} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;
