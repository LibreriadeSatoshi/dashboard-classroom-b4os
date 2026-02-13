import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { 
  getUserBadges, 
  getUserPoints,
  getNextBadgeThreshold,
  getNextBadgeProgress,
  BADGE_DEFINITIONS
} from '@/lib/badges'

// GET /api/badges - Get user's badges and progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.githubUsername) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    const username = session.user.githubUsername

    if (action === 'stats') {
      const points = await getUserPoints(username)
      const badges = await getUserBadges(username)
      const earnedCount = badges.filter(b => b.earned).length
      const nextThreshold = await getNextBadgeThreshold(username)
      const nextBadgeProgress = await getNextBadgeProgress(username)

      return NextResponse.json({
        points,
        earnedCount,
        totalCount: BADGE_DEFINITIONS.length,
        nextThreshold,
        progress: nextBadgeProgress,
        completionPercentage: Math.round((earnedCount / BADGE_DEFINITIONS.length) * 100)
      })
    }

    // Default: get badges with progress
    const points = Number(await getUserPoints(username)) || 0
    const badges = await getUserBadges(username)
    const nextBadgeProgress = await getNextBadgeProgress(username)

    return NextResponse.json({ 
      badges,
      points,
      definitions: BADGE_DEFINITIONS,
      nextBadgeProgress
    })
  } catch (error) {
    console.error('Error in GET /api/badges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}

// Badge actions - reserved for future use (e.g., manual acknowledgment)
// Currently badges are auto-calculated from points
