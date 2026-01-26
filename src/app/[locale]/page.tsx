import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { getDashboardData } from '@/lib/dashboard'
import DashboardClient from '@/components/DashboardClient'
import ProtectedRoute from '@/components/ProtectedRoute'

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
  try {
    dashboardData = await getDashboardData() // Server-side only
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Fallback to empty data
    dashboardData = {
      students: [],
      assignments: [],
      grades: [],
      feedback: []
    }
  }

  // Data is passed as props to client component
  // Server-rendered, not exposed in network tab
  return (
    <ProtectedRoute>
      <DashboardClient initialData={dashboardData} />
    </ProtectedRoute>
  )
}
