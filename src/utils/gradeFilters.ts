/**
 * Grade filtering utilities
 * Centralizes business logic for determining valid grades
 */

import { type ConsolidatedGrade } from '@/lib/supabase'

/**
 * Determines if a grade record is valid for display and statistics
 */
export function isValidGrade(grade: ConsolidatedGrade): boolean {
  const pointsAwarded = grade.points_awarded || 0
  const pointsAvailable = grade.points_available || 0
  return pointsAwarded > 0 || pointsAvailable > 0
}

/**
 * Filters an array of grades to only include valid ones
 */
export function filterValidGrades(grades: ConsolidatedGrade[]): ConsolidatedGrade[] {
  return grades.filter(isValidGrade)
}

/**
 * Calculates the percentage score for a grade
 */
export function calculateGradePercentage(pointsAwarded: number, pointsAvailable: number): number {
  if (pointsAvailable > 0) {
    return Math.round((pointsAwarded / pointsAvailable) * 100)
  } else if (pointsAwarded > 0) {
    return 100
  }
  return 0
}

