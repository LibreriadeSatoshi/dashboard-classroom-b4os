

export interface Feedback {
  id: number;
  studentId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  updatedFeedback: Feedback;
}

export async function getFeedback(): Promise<Feedback[]> {
  const response = await fetch('/api/feedback');
  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }
  return response.json();
}

export async function markFeedbackAsRead(feedbackId: number): Promise<MarkAsReadResponse> {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ feedbackId }),
  });
  if (!response.ok) {
    throw new Error('Failed to mark feedback as read');
  }
  return response.json();
}
