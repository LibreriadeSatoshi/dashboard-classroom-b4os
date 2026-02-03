  'use client'

import { useState, useMemo, useEffect, Fragment } from 'react'
import { useSession } from 'next-auth/react'
import { type Student, type Assignment, type ConsolidatedGrade, type StudentFeedback } from '@/lib/supabase'
import { MagnifyingGlass, Funnel, CaretUp, CaretDown, Crown, ChatCircleText, CaretRight } from 'phosphor-react'
import {
  generateAnonymousId,
  findUserByRealUsername,
  getAnonymousDescription
} from '@/utils/anonymization'
import LOTRAvatar from './LOTRAvatar'
import { useNamePreference } from '@/contexts/NamePreferenceContext'
import { useTranslations } from 'next-intl'
import { filterValidGrades, calculateGradePercentage } from '@/utils/gradeFilters'
import { Badge, UserBadge } from '@/types/badges'
import BadgeList from './BadgeList'

interface StudentsTableProps {
  readonly students: Student[]
  readonly assignments: Assignment[]
  readonly grades: ConsolidatedGrade[]
  readonly feedback: StudentFeedback[]
  readonly showRealNames?: boolean
  readonly averageGrade: number // Added averageGrade prop
  readonly badges: Badge[]
  readonly userBadges: UserBadge[]
}

type SortField = 'github_username' | 'assignment_name' | 'points_awarded' | 'points_available' | 'percentage'
type SortDirection = 'asc' | 'desc'

export default function StudentsTable({ assignments, grades, feedback, showRealNames = true, averageGrade, badges, userBadges }: StudentsTableProps) {
  const { data: session } = useSession()
  const { showRealName } = useNamePreference()
  const t = useTranslations('table')

  // KISS: Extract user info once
  const sessionUser = session?.user as { githubUsername: string; role: 'administrator' | 'dev' } | undefined
  const isAdmin = sessionUser?.role === 'administrator'
  const currentUsername = sessionUser?.githubUsername

  // Filter valid grades using centralized business logic
  const validGrades = filterValidGrades(grades)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [sortField, setSortField] = useState<SortField>('github_username')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [userPreferences, setUserPreferences] = useState<Record<string, boolean>>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Helper to get feedback for a specific assignment
  const getFeedbackForAssignment = (username: string, assignmentName: string) => {
    return feedback.filter(
      f => f.student_username === username && f.assignment_name === assignmentName && f.feedback_for_student
    )
  }

  // Toggle expanded row
  const toggleRowExpanded = (rowKey: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowKey)) {
        newSet.delete(rowKey)
      } else {
        newSet.add(rowKey)
      }
      return newSet
    })
  }

  // Load all user preferences
  useEffect(() => {
    const loadAllUserPreferences = async () => {
      try {
        const response = await fetch('/api/user-preferences')

        if (!response.ok) {
          console.error('Error loading user preferences:', response.statusText)
          return
        }

        const data = await response.json()

        const preferences: Record<string, boolean> = {}
        data.preferences?.forEach((pref: { github_username: string; show_real_name: boolean }) => {
          preferences[pref.github_username] = pref.show_real_name
        })
        setUserPreferences(preferences)
      } catch (error) {
        console.error('Error loading user preferences:', error)
      }
    }

    loadAllUserPreferences()

    // Poll for changes every 5 seconds (replaces realtime subscription)
    const interval = setInterval(loadAllUserPreferences, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Also reload preferences when the current user's preference changes
  useEffect(() => {
    const loadAllUserPreferences = async () => {
      try {
        const response = await fetch('/api/user-preferences')

        if (!response.ok) {
          console.error('Error loading user preferences:', response.statusText)
          return
        }

        const data = await response.json()

        const preferences: Record<string, boolean> = {}
        data.preferences?.forEach((pref: { github_username: string; show_real_name: boolean }) => {
          preferences[pref.github_username] = pref.show_real_name
        })
        setUserPreferences(preferences)
      } catch (error) {
        console.error('Error loading user preferences:', error)
      }
    }

    loadAllUserPreferences()
  }, [session?.user, showRealName]) // Reload when session or current user's preference changes

  // Display name based on role and privacy preference
  const getDisplayName = (githubUsername: string) => {
    if (isAdmin || userPreferences[githubUsername]) {
      return githubUsername
    }
    return generateAnonymousId(githubUsername)
  }

  // Display description based on role and privacy preference
  const getDisplayDescription = (githubUsername: string) => {
    const anonymousId = generateAnonymousId(githubUsername)

    // Admin sees anonymous ID as description (real name is already shown above)
    if (isAdmin) {
      return anonymousId
    }
    // User revealed identity - no extra description needed
    if (userPreferences[githubUsername]) {
      return ''
    }
    return getAnonymousDescription(anonymousId)
  }

  // Check if search term matches a real username (exact match for self-identification)
  const searchedUserInfo = useMemo(() => {
    if (!searchTerm) return null

    const allUsernames = grades.map(g => g.github_username)
    const exactMatch = allUsernames.find(username =>
      username.toLowerCase() === searchTerm.toLowerCase()
    )

    if (exactMatch) {
      // Non-admins can only search for their own username
      if (!isAdmin && exactMatch !== currentUsername) {
        return null
      }

      const result = findUserByRealUsername(exactMatch, allUsernames)
      return result.found ? { realUsername: exactMatch, anonymousId: result.anonymousId } : null
    }

    return null
  }, [searchTerm, grades, isAdmin, currentUsername])

  // Filter and sort data
  const filteredAndSortedGrades = useMemo(() => {
    let filtered = validGrades

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(grade => {
        const anonymousId = generateAnonymousId(grade.github_username)
        const canSearchRealName = isAdmin || userPreferences[grade.github_username] || grade.github_username === currentUsername

        return (
          anonymousId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grade.assignment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (canSearchRealName && grade.github_username.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })
    }

    // Filter by assignment
    if (selectedAssignment) {
      filtered = filtered.filter(grade =>
        grade.assignment_name === selectedAssignment
      )
    }

    // If user searched their real username, move their records to top
    if (searchedUserInfo) {
      filtered = filtered.sort((a, b) => {
        const aIsSearched = a.github_username.toLowerCase() === searchedUserInfo.realUsername.toLowerCase()
        const bIsSearched = b.github_username.toLowerCase() === searchedUserInfo.realUsername.toLowerCase()
        if (aIsSearched && !bIsSearched) return -1
        if (!aIsSearched && bIsSearched) return 1
        return 0
      })
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] as string | number
      let bValue: string | number = b[sortField] as string | number

      if (sortField === 'percentage') {
        aValue = calculateGradePercentage(a.points_awarded || 0, a.points_available || 0)
        bValue = calculateGradePercentage(b.points_awarded || 0, b.points_available || 0)
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [validGrades, searchTerm, selectedAssignment, sortField, sortDirection, searchedUserInfo, isAdmin, currentUsername, userPreferences])


  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <CaretUp size={16} /> : <CaretDown size={16} />
  }

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 epic-title">
            <Crown size={24} className="text-amber-600" />
            {t('title')}
          </h2>

          {/* Search result indicator */}
          {searchedUserInfo && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
              <div className="flex-shrink-0">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-amber-900 mb-1">
                  🎯 {t('identityRevealed')}
                </div>
                <div className="text-sm text-amber-800">
                  {t('yourSecretIdentity')}
                  <span className="font-bold text-amber-900 ml-1 px-2 py-1 bg-amber-100 rounded">
                    {searchedUserInfo.anonymousId}
                  </span>
                </div>
                <div className="text-xs text-amber-700 mt-1 italic">
                  {t('onlyYouCanSee')}
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={isAdmin ? t('searchPlaceholderAdmin') : t('searchPlaceholderDev')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>

            {/* Assignment Filter */}
            <div className="relative">
              <Funnel size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none min-w-[200px] transition-all duration-200"
              >
                <option value="">{t('allAdventures')}</option>
                {assignments.map(assignment => (
                  <option key={assignment.id} value={assignment.name}>
                    {assignment.name} ({assignment.points_available} {t('points')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('github_username')}
              >
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  {t('inhabitant')}
                  {getSortIcon('github_username')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('assignment_name')}
              >
                <div className="flex items-center gap-2">
                  {t('challenge')}
                  {getSortIcon('assignment_name')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('points_awarded')}
              >
                <div className="flex items-center gap-2">
                  {t('pointsAwarded')}
                  {getSortIcon('points_awarded')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('points_available')}
              >
                <div className="flex items-center gap-2">
                  {t('pointsAvailable')}
                  {getSortIcon('points_available')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percentage')}
              >
                <div className="flex items-center gap-2">
                  {t('percentage')}
                  {getSortIcon('percentage')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedGrades.map((grade, index) => {
              const percentage = calculateGradePercentage(grade.points_awarded || 0, grade.points_available || 0)
              const displayName = getDisplayName(grade.github_username)
              const description = getDisplayDescription(grade.github_username)
              const isSearchedUser = searchedUserInfo?.realUsername.toLowerCase() === grade.github_username.toLowerCase()
              const isCurrentUser = currentUsername === grade.github_username && !isAdmin // Identify current student
              const rowKey = `${grade.github_username}-${grade.assignment_name}-${index}`
              const assignmentFeedback = getFeedbackForAssignment(grade.github_username, grade.assignment_name)
              const hasFeedback = assignmentFeedback.length > 0
              const isExpanded = expandedRows.has(rowKey)
              const studentUserBadges = userBadges.filter(ub => ub.user_id === grade.github_username)

              // Determine comparison with average
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
                <Fragment key={rowKey}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors duration-200 ${isSearchedUser ? 'bg-amber-50 border-l-4 border-amber-500 shadow-sm' : ''
                      } ${isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' : ''} ${hasFeedback ? 'cursor-pointer' : ''}`}
                    onClick={hasFeedback ? () => toggleRowExpanded(rowKey) : undefined}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <LOTRAvatar
                            githubUsername={grade.github_username}
                            size="lg"
                            className="transition-transform duration-200 hover:scale-110"
                          />
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {displayName}
                            </div>
                            {isSearchedUser && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                <Crown className="h-3 w-3 mr-1" />
                                {t('itsYou')}
                              </span>
                            )}
                            {isCurrentUser && ( // New indicator for current user
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                <Crown className="h-3 w-3 mr-1" />
                                {t('yourPosition')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 italic">
                            {description}
                          </div>
                          <BadgeList badges={badges} userBadges={studentUserBadges} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {grade.assignment_name}
                        </span>
                        {hasFeedback && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            <ChatCircleText className="h-3 w-3" />
                            {t('feedback')}
                            <CaretRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.points_awarded || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {grade.points_available || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 break-word">
                      <div className="flex flex-col items-start gap-1"> {/* Changed to flex-col for better mobile display */}
                        <div className="flex items-center gap-3">
                          {/* Barra de progreso */}
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${percentage >= 80 ? 'bg-green-500' :
                                  percentage >= 60 ? 'bg-yellow-500' :
                                    percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          {/* Porcentaje con pill */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBgColor(percentage)} ${getGradeColor(percentage)}`}>
                            {percentage}%
                          </span>
                        </div>
                        {isCurrentUser && averageComparison && ( // Display comparison for current user
                          <div className={`flex items-center gap-1 text-xs font-medium ${comparisonColor}`}>
                            {comparisonIcon}
                            {averageComparison} ({t('classAverage')}: {averageGrade}%)
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expanded feedback row */}
                  {hasFeedback && isExpanded && (
                    <tr key={`${rowKey}-feedback`} className="bg-amber-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="ml-12 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                            <ChatCircleText className="h-4 w-4" />
                            {t('tutorFeedback')}
                          </div>
                          {assignmentFeedback.map((fb, fbIndex) => (
                            <div key={fbIndex} className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.feedback_for_student}</p>
                              <p className="text-xs text-gray-500 mt-2 italic">
                                — {fb.reviewer_username}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <span>
            {t('showing')} {filteredAndSortedGrades.length} {t('of')} {validGrades.length} {t('records')}
          </span>
        </div>
      </div>
    </div>
  )
}