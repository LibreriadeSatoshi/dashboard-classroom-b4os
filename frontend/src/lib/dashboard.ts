import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from './auth-config'
import type { Student, Assignment, ConsolidatedGrade, StudentFeedback } from './supabase'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create Supabase client for server-side operations using service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export interface DashboardData {
  students: Student[]
  assignments: Assignment[]
  grades: ConsolidatedGrade[]
  feedback: StudentFeedback[]
}

export interface WeeklyProgress {
  weekLabel: string; // e.g., "Week 40" or "Oct 2"
  studentScore: number; // Percentage
  classAverage: number; // Percentage
}

// Helper function to get weekly progress data for a student and class average
export async function getWeeklyProgressData(githubUsername: string): Promise<WeeklyProgress[]> {
  const sixWeeksAgo = new Date()
  sixWeeksAgo.setDate(sixWeeksAgo.getDate() - (6 * 7)) // Go back 6 weeks

  const { data: grades, error } = await supabase
    .from('consolidated_grades')
    .select('github_username, points_awarded, points_available, grade_updated_at')
    .gte('grade_updated_at', sixWeeksAgo.toISOString())
    .order('grade_updated_at', { ascending: true })

  if (error) {
    console.error('Error fetching weekly grades:', error)
    throw error
  }

  const weeklyDataMap = new Map<string, {
    studentAwarded: number, studentAvailable: number,
    classAwarded: number, classAvailable: number,
    studentCount: Set<string> // To count unique students per week for average
  }>()

  // Initialize map for the last 6 weeks
  for (let i = 0; i < 6; i++) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((5 - i) * 7))
    const weekLabel = `Week ${getWeekNumber(weekStart)}` // Or format as "Mon Oct 2"
    weeklyDataMap.set(weekLabel, {
      studentAwarded: 0, studentAvailable: 0,
      classAwarded: 0, classAvailable: 0,
      studentCount: new Set<string>()
    })
  }

  grades.forEach(grade => {
    const gradeDate = new Date(grade.grade_updated_at)
    const weekLabel = `Week ${getWeekNumber(gradeDate)}` // Or format as "Mon Oct 2"

    if (!weeklyDataMap.has(weekLabel)) {
      // This might happen if grades are older than 6 weeks but still fetched due to gte filter
      // Or if a week has no grades, we still want it in the map
      weeklyDataMap.set(weekLabel, {
        studentAwarded: 0, studentAvailable: 0,
        classAwarded: 0, classAvailable: 0,
        studentCount: new Set<string>()
      })
    }

    const weekStats = weeklyDataMap.get(weekLabel)!

    // Aggregate for the specific student
    if (grade.github_username === githubUsername) {
      weekStats.studentAwarded += grade.points_awarded || 0
      weekStats.studentAvailable += grade.points_available || 0
    }

    // Aggregate for the class
    weekStats.classAwarded += grade.points_awarded || 0
    weekStats.classAvailable += grade.points_available || 0
    weekStats.studentCount.add(grade.github_username)
  })

  const result: WeeklyProgress[] = Array.from(weeklyDataMap.entries())
    .sort(([labelA], [labelB]) => {
      // Simple sorting by week number, assuming "Week XX" format
      const weekNumA = parseInt(labelA.split(' ')[1])
      const weekNumB = parseInt(labelB.split(' ')[1])
      return weekNumA - weekNumB
    })
    .map(([weekLabel, stats]) => {
      const studentScore = stats.studentAvailable > 0
        ? (stats.studentAwarded / stats.studentAvailable) * 100
        : 0

      // Calculate class average based on total points, not average of averages
      const classAverage = stats.classAvailable > 0
        ? (stats.classAwarded / stats.classAvailable) * 100
        : 0

      return {
        weekLabel,
        studentScore: parseFloat(studentScore.toFixed(2)),
        classAverage: parseFloat(classAverage.toFixed(2))
      }
    })

  return result
}

// Helper function to get week number (ISO week date)
function getWeekNumber(d: Date): number {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
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

