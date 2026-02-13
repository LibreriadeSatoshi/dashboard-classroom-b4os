import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { getDashboardData, getAssignmentProgressData, AssignmentProgress } from '@/lib/dashboard'
import { getUserBadges, getUserPoints, BadgeInfo } from '@/lib/badges'
import DashboardClient from '@/components/DashboardClient'
import ProtectedRoute from '@/components/ProtectedRoute'

interface BadgeData {
  badges: BadgeInfo[]
  points: number
}

interface PageData {
  dashboardData: {
    students: any[]
    assignments: any[]
    grades: any[]
    feedback: any[]
    hasUnreadFeedback: boolean
  }
  assignmentProgressData: AssignmentProgress[]
  badgeData: BadgeData
}

// Server Component - Fetch all data on server - this never reaches the client
// Data is passed as props to client component, not exposed in network tab
export default async function Dashboard() {
  // Verify authentication on server
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/es/auth/signin')
  }

  // Fetch dashboard data on server - RBAC is applied here
  let dashboardData
  let assignmentProgressData: AssignmentProgress[]
  let badgeData: BadgeData

  try {
    dashboardData = await getDashboardData() // Server-side only
    assignmentProgressData = await getAssignmentProgressData(session.user.githubUsername)
    
    // Fetch badge data
    const points = await getUserPoints(session.user.githubUsername)
    const badges = await getUserBadges(session.user.githubUsername)
    badgeData = { badges, points }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Fallback to empty data
    dashboardData = {
      students: [],
      assignments: [],
      grades: [],
      feedback: [],
      hasUnreadFeedback: false
    }
    assignmentProgressData = []
    badgeData = { badges: [], points: 0 }
  }

  // Data is passed as props to client component
  // Server-rendered, not exposed in network tab
  return (
    <ProtectedRoute>
      <DashboardClient 
        initialData={dashboardData} 
        assignmentProgressData={assignmentProgressData}
        badgeData={badgeData}
      />
    </ProtectedRoute>
  )
}
