// Types for our database
// NOTE: Supabase client is only used server-side via API routes to prevent credential exposure
export interface Student {
  github_username: string
  updated_at: string
}

export interface Assignment {
  id: number
  name: string
  points_available: number | null
  updated_at: string
}

export interface Grade {
  id: number
  github_username: string
  assignment_name: string
  points_awarded: number | null
  updated_at: string
}

export interface ConsolidatedGrade {
  github_username: string
  assignment_name: string
  points_awarded: number | null
  points_available: number | null
  percentage: number | null
  grade_updated_at: string
}

export interface StudentFeedback {
  id: number
  student_username: string
  reviewer_username: string
  assignment_name: string
  feedback_for_student: string | null
  status: 'pending' | 'in_progress' | 'completed'
  completed_at: string | null
}
