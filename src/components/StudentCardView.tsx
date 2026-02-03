/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { Fragment } from 'react'
import { type Assignment, type ConsolidatedGrade, type StudentFeedback } from '@/lib/supabase'
import { Crown, ChatCircleText, CaretRight, CaretUp, CaretDown } from 'phosphor-react'
import LOTRAvatar from './LOTRAvatar'
import { useTranslations } from 'next-intl'
import { calculateGradePercentage } from '@/utils/gradeFilters'

interface StudentCardViewProps {
  grades: ConsolidatedGrade[]
  assignments: Assignment[]
  feedback: StudentFeedback[]
  showRealNames: boolean
  averageGrade: number
  isAdmin: boolean
  currentUsername: string | undefined
  userPreferences: Record<string, boolean>
  getDisplayName: (githubUsername: string) => string
  getDisplayDescription: (githubUsername: string) => string
  getFeedbackForAssignment: (username: string, assignmentName: string) => StudentFeedback[]
  toggleRowExpanded: (rowKey: string) => void
  expandedRows: Set<string>
  getGradeColor: (percentage: number) => string; // Added prop
  getGradeBgColor: (percentage: number) => string; // Added prop
}

const StudentCardView: React.FC<StudentCardViewProps> = ({
  grades,
  assignments,
  feedback,
  showRealNames,
  averageGrade,
  isAdmin,
  currentUsername,
  userPreferences,
  getDisplayName,
  getDisplayDescription,
  getFeedbackForAssignment,
  toggleRowExpanded,
  expandedRows,
}) => {
  const t = useTranslations('table')

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-700'
    if (percentage >= 60) return 'text-yellow-700'
    if (percentage >= 40) return 'text-orange-700'
    return 'text-red-700'
  }

  const getGradeBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100'
    if (percentage >= 60) return 'bg-yellow-100'
    if (percentage >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  if (grades.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {t('noResults')}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {grades.map((grade, index) => {
        const percentage = calculateGradePercentage(grade.points_awarded || 0, grade.points_available || 0)
        const displayName = getDisplayName(grade.github_username)
        const description = getDisplayDescription(grade.github_username)
        const isSearchedUser = false // Search logic will be handled by parent
        const isCurrentUser = currentUsername === grade.github_username && !isAdmin
        const cardKey = `${grade.github_username}-${grade.assignment_name}-${index}`
        const assignmentFeedback = getFeedbackForAssignment(grade.github_username, grade.assignment_name)
        const hasFeedback = assignmentFeedback.length > 0
        const isExpanded = expandedRows.has(cardKey)

        let averageComparison = ''
        let comparisonIcon = null
        let comparisonColor = ''

        if (isCurrentUser) {
          if (percentage > averageGrade) {
            averageComparison = t('aboveAverage')
            comparisonIcon = <CaretUp size={14} className="text-green-500" />
            comparisonColor = 'text-green-700'
          } else if (percentage < averageGrade) {
            averageComparison = t('belowAverage')
            comparisonIcon = <CaretDown size={14} className="text-red-500" />
            comparisonColor = 'text-red-700'
          } else {
            averageComparison = t('onPar')
            comparisonIcon = <CaretRight size={14} className="text-gray-500" />
            comparisonColor = 'text-gray-700'
          }
        }

        return (
          <div
            key={cardKey}
            className={`bg-white rounded-xl shadow-lg border ${
              isCurrentUser ? 'border-blue-500' : 'border-gray-200'
            } overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <LOTRAvatar
                    githubUsername={grade.github_username}
                    size="md"
                    className="mr-3"
                  />
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-900 truncate">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500 italic truncate">
                      {description}
                    </div>
                  </div>
                </div>
                {isCurrentUser && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Crown className="h-3 w-3 mr-1" />
                    {t('yourPosition')}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  {t('challenge')}:
                </h4>
                <p className="text-base font-semibold text-gray-900 truncate">
                  {grade.assignment_name}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    {t('points')}:
                  </h4>
                  <p className="text-base font-semibold text-gray-900">
                    {grade.points_awarded || 0} / {grade.points_available || 0}
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    {t('percentage')}:
                  </h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeBgColor(percentage)} ${getGradeColor(percentage)}`}>
                    {percentage}%
                  </span>
                </div>
              </div>

              {isCurrentUser && averageComparison && (
                <div className={`flex items-center gap-1 text-xs font-medium ${comparisonColor} mb-4`}>
                  {comparisonIcon}
                  {averageComparison} ({t('classAverage')}: {averageGrade}%)
                </div>
              )}

              {hasFeedback && (
                <button
                  onClick={() => toggleRowExpanded(cardKey)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors duration-200"
                >
                  <ChatCircleText className="h-4 w-4" />
                  {t('feedback')}
                  <CaretRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              )}
            </div>

            {hasFeedback && isExpanded && (
              <div className="bg-amber-50 border-t border-amber-200 p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                    <ChatCircleText className="h-4 w-4" />
                    {t('tutorFeedback')}
                  </div>
                  {assignmentFeedback.map((fb, fbIndex) => (
                    <div key={fbIndex} className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.feedback_for_student}</p>
                      <p className="text-xs text-gray-500 mt-2 italic truncate">
                        — {fb.reviewer_username}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StudentCardView
