import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/dashboard'

export async function GET() {
  try {
    // Fetch dashboard data using server-side helper function
    // This ensures RBAC is applied and data is filtered based on user role
    const dashboardData = await getDashboardData()
    return NextResponse.json(dashboardData)
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
