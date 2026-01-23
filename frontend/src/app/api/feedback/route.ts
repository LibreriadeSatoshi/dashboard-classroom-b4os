import { NextResponse } from 'next/server';

// Mock data - in a real application, this would come from a database
const allFeedback = [
  { id: 1, studentId: '1', content: 'Great job on the last assignment! Your analysis was spot on.', read: true, createdAt: '2024-05-10T10:00:00Z' },
  { id: 2, studentId: '1', content: 'Remember to check the formatting guidelines for the next report.', read: false, createdAt: '2024-05-12T14:30:00Z' },
  { id: 3, studentId: '2', content: 'Your presentation skills are improving.', read: true, createdAt: '2024-05-11T11:00:00Z' },
  { id: 4, studentId: '1', content: 'I noticed a small error in your code submission for project "Orion". Please review line 42.', read: false, createdAt: '2024-05-13T09:00:00Z' },
];

// In-memory store to track read status for the mock.
let feedbackStore = [...allFeedback];


export async function GET(request: Request) {
  const studentId = '1'; // Mocking studentId

  if (!studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userFeedback = feedbackStore.filter(f => f.studentId === studentId);
  
  return NextResponse.json(userFeedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export async function POST(request: Request) {
  const { feedbackId } = await request.json();

  if (!feedbackId) {
    return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
  }

  const feedbackIndex = feedbackStore.findIndex(f => f.id === feedbackId);

  if (feedbackIndex === -1) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
  }

  // Update the read status
  feedbackStore[feedbackIndex].read = true;

  return NextResponse.json({ success: true, updatedFeedback: feedbackStore[feedbackIndex] });
}