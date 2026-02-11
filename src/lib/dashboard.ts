import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from './auth-config'
import type { Student, Assignment, ConsolidatedGrade, StudentFeedback } from './supabase'
import { TABLE_NAMES } from './constants'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create Supabase client for server-side operations using service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export interface DashboardData {
  students: Student[]
  assignments: Assignment[]
  grades: ConsolidatedGrade[]
  feedback: StudentFeedback[]
  hasUnreadFeedback: boolean
}

export interface WeeklyProgress {
  weekLabel: string; // e.g., "Week 40" or "Oct 2"
  studentScore: number; // Percentage
  classAverage: number; // Percentage
}

export interface AssignmentProgress {
  assignmentName: string;
  originalName?: string;
  studentPoints: number;
  classAveragePoints: number;
}

// Helper function to get weekly progress data for a student and class average
export async function getWeeklyProgressData(githubUsername: string): Promise<WeeklyProgress[]> {
  // Fetch grades from the last 1 year
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const { data: grades, error } = await supabase
    .from('consolidated_grades')
    .select('github_username, points_awarded, points_available, grade_updated_at')
    .not('grade_updated_at', 'is', null)
    .gte('grade_updated_at', oneYearAgo.toISOString())
    .order('grade_updated_at', { ascending: true })

  if (error) {
    console.error('Error fetching weekly grades:', error)
    // Return empty array on error
    return []
  }

  const weeklyDataMap = new Map<string, {
    weekYear: string;  // For sorting: "2026-W5"
    studentAwarded: number, studentAvailable: number,
    classAwarded: number, classAvailable: number,
    studentCount: Set<string>
  }>()

  // Initialize map for the last 6 weeks
  for (let i = 0; i < 6; i++) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((5 - i) * 7))
    const weekNum = getWeekNumber(weekStart)
    const year = weekStart.getFullYear()
    const weekYear = `${year}-${weekNum}`
    weeklyDataMap.set(weekYear, {
      weekYear,
      studentAwarded: 0, studentAvailable: 0,
      classAwarded: 0, classAvailable: 0,
      studentCount: new Set<string>()
    })
  }

  // Aggregate grades by week
  grades.forEach(grade => {
    const gradeDate = new Date(grade.grade_updated_at)
    const weekNum = getWeekNumber(gradeDate)
    const year = gradeDate.getFullYear()
    const weekYear = `${year}-${weekNum}`

    if (!weeklyDataMap.has(weekYear)) {
      weeklyDataMap.set(weekYear, {
        weekYear,
        studentAwarded: 0, studentAvailable: 0,
        classAwarded: 0, classAvailable: 0,
        studentCount: new Set<string>()
      })
    }

    const weekStats = weeklyDataMap.get(weekYear)!

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
    .sort(([weekYearA], [weekYearB]) => weekYearA.localeCompare(weekYearB))
    .map(([weekYear, stats]) => {
      const weekNum = Number.parseInt(weekYear.split('-')[1])
      const weekLabel = `Week ${weekNum}`
      const studentScore = stats.studentAvailable > 0
        ? (stats.studentAwarded / stats.studentAvailable) * 100
        : 0

      const classAverage = stats.classAvailable > 0
        ? (stats.classAwarded / stats.classAvailable) * 100
        : 0

      return {
        weekLabel,
        studentScore: Number.parseFloat(studentScore.toFixed(2)),
        classAverage: Number.parseFloat(classAverage.toFixed(2))
      }
    })

  return result
}

// Helper function to get assignment progress data for a student and class average
export async function getAssignmentProgressData(githubUsername: string): Promise<AssignmentProgress[]> {
  const { data: grades, error } = await supabase
    .from('zzz_grades')
    .select('github_username, assignment_name, points_awarded, fork_created_at')
    .not('points_awarded', 'is', null)
    .order('fork_created_at', { ascending: true })

  if (error || !grades) {
    console.error('Error fetching assignment grades:', error)
    return []
  }

  const assignmentMap = new Map<string, {
    studentAwarded: number,
    classTotalPoints: number,
    studentCount: number,
    forkCreatedAt: string
  }>()

  grades.forEach(grade => {
    const assignmentName = grade.assignment_name;
    // Forzamos que sea número para evitar concatenación de strings
    const points = Number(grade.points_awarded) || 0; 

    if (!assignmentMap.has(assignmentName)) {
      assignmentMap.set(assignmentName, {
        studentAwarded: 0,
        classTotalPoints: 0,
        studentCount: 0,
        forkCreatedAt: grade.fork_created_at || ''
      })
    }

    const stats = assignmentMap.get(assignmentName)!
    
    if (grade.github_username === githubUsername) {
      stats.studentAwarded = points; // Asumimos que un alumno solo tiene una entrada por tarea
    }

    stats.classTotalPoints += points;
    stats.studentCount += 1;
  })

  const result: AssignmentProgress[] = Array.from(assignmentMap.entries())
    .map(([assignmentName, stats]) => {
      const classAverage = stats.studentCount > 0 ? stats.classTotalPoints / stats.studentCount : 0;
      
      return {
        assignmentName: formatAssignmentName(assignmentName),
        originalName: assignmentName,
        // Aquí asumimos que quieres el porcentaje. 
        // Si points_awarded ya es sobre 100, no necesitas dividir por maxPoints.
        studentPoints: Math.round(stats.studentAwarded), 
        classAveragePoints: Math.round(classAverage)
      }
    })
    .sort((a, b) => {
      // Get stats for each assignment to compare dates
      const statsA = assignmentMap.get(a.originalName)!;
      const statsB = assignmentMap.get(b.originalName)!;
      const dateA = statsA?.forkCreatedAt || '';
      const dateB = statsB?.forkCreatedAt || '';
      return dateA.localeCompare(dateB);
    });

  return result
}

// Helper function to format assignment names with line breaks for better readability
function formatAssignmentName(name: string): string {
  const nameMap: Record<string, string> = {
    'bitcoin-core-setup-and-tests': 'Bitcoin Core Setup\n       and Tests',
    'curse-of-missing-descriptors': 'Curse of Missing\n      Descriptors',
    'the-moria-mining-codex-part-1': 'The Moria Mining\n   Codex Part-1',
    'the-moria-mining-codex-part-2': 'The Moria Mining\n   Codex Part-2',
    'tweaks-generator-for-silent-payments': ' Tweaks Generator for\n      Silent Payments',
    'vintage-wallet-modernization-challenge': 'Vintage Wallet Modernization\n       Challenge'
  }
  
  return nameMap[name] || name
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
    supabase.from(TABLE_NAMES.STUDENTS).select('*').order('github_username'),
    supabase.from(TABLE_NAMES.ASSIGNMENTS).select('*').order('name'),
    supabase.from(TABLE_NAMES.CONSOLIDATED_GRADES).select('*').order('github_username'),
    supabase.from(TABLE_NAMES.STUDENT_REVIEWERS)
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

  // Check if there's any unread feedback in the system (admin sees all)
  const { count: unreadReviewersCount } = await supabase
    .from(TABLE_NAMES.STUDENT_REVIEWERS)
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .eq('read_by_student', false)
    .not('feedback_for_student', 'is', null);

  const { count: unreadCommentsCount } = await supabase
    .from(TABLE_NAMES.REVIEW_COMMENTS)
    .select('*', { count: 'exact', head: true })
    .eq('read_by_student', false);

  const hasUnreadFeedback = ((unreadReviewersCount || 0) + (unreadCommentsCount || 0)) > 0;

  return {
    students: studentsResult.data || [],
    assignments: assignmentsResult.data || [],
    grades: gradesResult.data || [],
    feedback: feedbackResult.data || [],
    hasUnreadFeedback
  }
}

// Helper function to get leaderboard for students (all grades visible, feedback based on privacy)
async function getAnonymizedLeaderboard(currentUsername?: string): Promise<DashboardData> {
  if (!currentUsername) {
    return {
      students: [],
      assignments: [],
      grades: [],
      feedback: [],
      hasUnreadFeedback: false
    }
  }

  // Fetch all data in parallel (students see full leaderboard)
  const [studentsResult, assignmentsResult, gradesResult, privacyResult] = await Promise.all([
    // Get ALL students for leaderboard
    supabase.from(TABLE_NAMES.STUDENTS).select('*').order('github_username'),
    // Get ALL assignments
    supabase.from(TABLE_NAMES.ASSIGNMENTS).select('*').order('name'),
    // Get ALL grades for leaderboard
    supabase.from(TABLE_NAMES.CONSOLIDATED_GRADES).select('*').order('github_username'),
    // Get privacy preferences to filter feedback visibility
    supabase.from(TABLE_NAMES.USER_PRIVACY).select('github_username, show_real_name')
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
    .from(TABLE_NAMES.STUDENT_REVIEWERS)
    .select('id, student_username, reviewer_username, assignment_name, feedback_for_student, status, completed_at')
    .not('feedback_for_student', 'is', null)

  let filteredFeedback: StudentFeedback[] = []
  if (!feedbackResult.error && feedbackResult.data) {
    // Filter: show own feedback OR feedback of users who revealed identity
    filteredFeedback = feedbackResult.data.filter(fb =>
      fb.student_username === currentUsername || revealedUsernames.has(fb.student_username)
    )
  }

  // Check if current user has unread feedback
  const { count: unreadReviewersCount } = await supabase
    .from(TABLE_NAMES.STUDENT_REVIEWERS)
    .select('*', { count: 'exact', head: true })
    .eq('student_username', currentUsername)
    .eq('status', 'completed')
    .eq('read_by_student', false)
    .not('feedback_for_student', 'is', null);

  const { count: unreadCommentsCount } = await supabase
    .from(TABLE_NAMES.REVIEW_COMMENTS)
    .select('*', { count: 'exact', head: true })
    .eq('student_username', currentUsername)
    .eq('read_by_student', false);

  const hasUnreadFeedback = ((unreadReviewersCount || 0) + (unreadCommentsCount || 0)) > 0;

  return {
    students: studentsResult.data || [],
    assignments: assignmentsResult.data || [],
    grades: gradesResult.data || [],
    feedback: filteredFeedback,
    hasUnreadFeedback
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

