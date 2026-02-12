

export interface Feedback {
  id: string;
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

export async function markFeedbackAsRead(feedbackId: string): Promise<MarkAsReadResponse> {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ feedbackId }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error marking feedback as read:', { status: response.status, error: errorText, feedbackId });
    throw new Error(`Failed to mark feedback as read: ${response.status} - ${errorText}`);
  }
  return response.json();
}
