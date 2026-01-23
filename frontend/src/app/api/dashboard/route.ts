import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/dashboard'

// Mock data - temporary, to be replaced with a real data source
const allFeedback = [
  { id: 1, studentId: '1', content: 'Great job on the last assignment! Your analysis was spot on.', read: true, createdAt: '2024-05-10T10:00:00Z' },
  { id: 2, studentId: '1', content: 'Remember to check the formatting guidelines for the next report.', read: false, createdAt: '2024-05-12T14:30:00Z' },
  { id: 3, studentId: '2', content: 'Your presentation skills are improving.', read: true, createdAt: '2024-05-11T11:00:00Z' },
  { id: 4, studentId: '1', content: 'I noticed a small error in your code submission for project "Orion". Please review line 42.', read: false, createdAt: '2024-05-13T09:00:00Z' },
];

export async function GET() {
  try {
    // Fetch dashboard data using server-side helper function
    // This ensures RBAC is applied and data is filtered based on user role
    const dashboardData = await getDashboardData()

    // Mock getting studentId and checking for unread feedback
    const studentId = '1'; 
    const hasUnreadFeedback = allFeedback.some(f => f.studentId === studentId && !f.read);

    return NextResponse.json({ ...dashboardData, hasUnreadFeedback })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
