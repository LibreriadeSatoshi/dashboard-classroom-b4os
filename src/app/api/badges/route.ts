
import { NextResponse } from 'next/server';
import { getBadges, getUserBadges, unlockBadge } from '@/lib/badges';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.githubUsername) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [badges, userBadges] = await Promise.all([
    getBadges(),
    getUserBadges(session.user.githubUsername),
  ]);

  return NextResponse.json({ badges, userBadges });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.githubUsername) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { badgeId } = await request.json();
  if (!badgeId) {
    return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 });
  }

  const newUserBadge = await unlockBadge(session.user.githubUsername, badgeId);

  if (!newUserBadge) {
    return NextResponse.json({ error: 'Failed to unlock badge' }, { status: 500 });
  }

  return NextResponse.json(newUserBadge);
}
    