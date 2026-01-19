import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from './auth-config'
import type { Student, Assignment, ConsolidatedGrade, StudentFeedback } from './supabase'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

// Create Supabase client for server-side operations
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DashboardData {
  students: Student[]
  assignments: Assignment[]
  grades: ConsolidatedGrade[]
  feedback: StudentFeedback[]
}

// Helper function to get full leaderboard (admin/instructor only)
async function getFullLeaderboard(): Promise<DashboardData> {
  const [studentsResult, assignmentsResult, gradesResult, feedbackResult] = await Promise.all([
    supabase.from('students').select('*').order('github_username'),
    supabase.from('zzz_assignments').select('*').order('name'),
    supabase.from('consolidated_grades').select('*').order('github_username'),
    supabase.from('zzz_student_reviewers')
      .select('id, student_username, reviewer_username, assignment_name, feedback_for_student, status, completed_at')
      .not('feedback_for_student', 'is', null)
  ])

  if (studentsResult.error) {
    console.error('Error fetching students:', studentsResult.error)
    throw studentsResult.error
  }
  if (assignmentsResult.error) {
    console.error('Error fetching assignments:', assignmentsResult.error)
    throw assignmentsResult.error
  }
  if (gradesResult.error) {
    console.error('Error fetching grades:', gradesResult.error)
    throw gradesResult.error
  }
  if (feedbackResult.error) {
    console.error('Error fetching feedback:', feedbackResult.error)
    // Don't throw - feedback is optional
  }

  return {
    students: studentsResult.data || [],
    assignments: assignmentsResult.data || [],
    grades: gradesResult.data || [],
    feedback: feedbackResult.data || []
  }
}

// Helper function to get leaderboard for students (all grades visible, feedback based on privacy)
async function getAnonymizedLeaderboard(currentUsername?: string): Promise<DashboardData> {
  if (!currentUsername) {
    return {
      students: [],
      assignments: [],
      grades: [],
      feedback: []
    }
  }

  // Fetch all data in parallel (students see full leaderboard)
  const [studentsResult, assignmentsResult, gradesResult, privacyResult] = await Promise.all([
    // Get ALL students for leaderboard
    supabase.from('students').select('*').order('github_username'),
    // Get ALL assignments
    supabase.from('zzz_assignments').select('*').order('name'),
    // Get ALL grades for leaderboard
    supabase.from('consolidated_grades').select('*').order('github_username'),
    // Get privacy preferences to filter feedback visibility
    supabase.from('zzz_user_privacy').select('github_username, show_real_name')
  ])

  if (studentsResult.error) {
    console.error('Error fetching students:', studentsResult.error)
    throw studentsResult.error
  }

  if (assignmentsResult.error) {
    console.error('Error fetching assignments:', assignmentsResult.error)
    throw assignmentsResult.error
  }

  if (gradesResult.error) {
    console.error('Error fetching grades:', gradesResult.error)
    throw gradesResult.error
  }

  // Build set of usernames with show_real_name = true (revealed identity)
  const revealedUsernames = new Set<string>()
  if (!privacyResult.error && privacyResult.data) {
    for (const pref of privacyResult.data) {
      if (pref.show_real_name) {
        revealedUsernames.add(pref.github_username)
      }
    }
  }

  // Fetch feedback: own feedback + feedback from users who revealed their identity
  const feedbackResult = await supabase
    .from('zzz_student_reviewers')
    .select('id, student_username, reviewer_username, assignment_name, feedback_for_student, status, completed_at')
    .not('feedback_for_student', 'is', null)

  let filteredFeedback: StudentFeedback[] = []
  if (!feedbackResult.error && feedbackResult.data) {
    // Filter: show own feedback OR feedback of users who revealed identity
    filteredFeedback = feedbackResult.data.filter(fb =>
      fb.student_username === currentUsername || revealedUsernames.has(fb.student_username)
    )
  }

  return {
    students: studentsResult.data || [],
    assignments: assignmentsResult.data || [],
    grades: gradesResult.data || [],
    feedback: filteredFeedback
  }
}

// Main function to get dashboard data based on user role
export async function getDashboardData(): Promise<DashboardData> {
  const session: Session | null = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Check user role - only administrators can see full leaderboard
  const userRole = session.user.role
  const isAdministrator = userRole === 'administrator'
  
  // Get leaderboard - students only see their own data
  return isAdministrator
    ? await getFullLeaderboard()
    : await getAnonymizedLeaderboard(session.user.githubUsername)
}

