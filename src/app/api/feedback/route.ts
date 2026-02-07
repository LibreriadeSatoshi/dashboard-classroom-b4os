import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { TABLE_NAMES } from '@/lib/constants';

export async function GET() {
  const session = await getSession();
  if (!session?.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const githubUsername = session.user.name;

  // Fetch feedback from both tables using username directly
  const { data: reviewersData, error: reviewersError } = await supabase
    .from(TABLE_NAMES.STUDENT_REVIEWERS)
    .select('*')
    .eq('student_username', githubUsername)
    .eq('status', 'completed'); // Only fetch feedback that's ready

  const { data: commentsData, error: commentsError } = await supabase
    .from(TABLE_NAMES.REVIEW_COMMENTS)
    .select('*')
    .eq('student_username', githubUsername);

  if (reviewersError || commentsError) {
    console.error('Error fetching feedback:', reviewersError || commentsError);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }

  // Map and combine feedback
  const reviewersFeedback = reviewersData?.map(item => ({
    id: `reviewer-${item.id}`,
    studentId: githubUsername,
    content: item.feedback_for_student,
    read: item.read_by_student || false,
    createdAt: item.completed_at || item.created_at,
  })) || [];

  const commentsFeedback = commentsData?.map(item => ({
    id: `comment-${item.id}`,
    studentId: githubUsername,
    content: item.comment,
    read: item.read_by_student || false,
    createdAt: item.created_at,
  })) || [];

  const combinedFeedback = [...reviewersFeedback, ...commentsFeedback];

  // Sort by date (most recent first) - using toSorted to avoid mutation
  const sortedFeedback = combinedFeedback.toSorted((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(sortedFeedback);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { feedbackId } = await request.json();
  if (!feedbackId) {
    return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
  }

  const supabase = createClient();
  const githubUsername = session.user.name;

  // Parse composite ID "reviewer-123" or "comment-uuid"
  const [source, id] = feedbackId.split('-');
  const table = source === 'reviewer'
    ? TABLE_NAMES.STUDENT_REVIEWERS
    : TABLE_NAMES.REVIEW_COMMENTS;

  // For reviewer table, id is int. For comments table, id is UUID (string)
  const idValue = source === 'reviewer' ? Number.parseInt(id) : id;

  const { error } = await supabase
    .from(table)
    .update({ read_by_student: true })
    .eq('id', idValue)
    .eq('student_username', githubUsername); // Security: only mark own feedback as read

  if (error) {
    console.error('Error marking as read:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
