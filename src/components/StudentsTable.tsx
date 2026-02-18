'use client'

import { useState, useMemo, useEffect, Fragment } from 'react'
import { useSession } from 'next-auth/react'
import { type Assignment, type ConsolidatedGrade, type StudentFeedback } from '@/lib/supabase'
import { type Session } from 'next-auth'
import { MagnifyingGlass, Funnel, CaretUp, CaretDown, Crown, ChatCircleText, CaretRight } from 'phosphor-react'
import { getBadgeIcon } from '@/lib/badgeIcons'
import {
  generateAnonymousId,
  findUserByRealUsername,
  getAnonymousDescription
} from '@/utils/anonymization'
import LOTRAvatar from './LOTRAvatar'
import { useNamePreference } from '@/contexts/NamePreferenceContext'
import { useTranslations } from 'next-intl'
import { filterValidGrades } from '@/utils/gradeFilters'
import { BADGE_DEFINITIONS } from '@/lib/badges'

interface StudentsTableProps {
  readonly assignments: Assignment[]
  readonly grades: ConsolidatedGrade[]
  readonly feedback: StudentFeedback[]
  readonly averageGrade: number
}

type SortField = 'github_username' | 'challenge_count' | 'total_points' | 'average_percentage'
type SortDirection = 'asc' | 'desc'

// Type for grouped user data
interface GroupedUserData {
  githubUsername: string
  grades: ConsolidatedGrade[]
  totalPoints: number
  averagePercentage: number
  challengeCount: number
}

export default function StudentsTable({ assignments, grades, feedback, averageGrade }: StudentsTableProps) {
  const { data: session } = useSession()
  const { showRealName } = useNamePreference()
  const t = useTranslations('table')

  // KISS: Extract user info once
  const isAdmin = (session?.user as Session['user'])?.role === 'administrator'
  const currentUsername = (session?.user as Session['user'])?.githubUsername

  // Filter valid grades using centralized business logic
  const validGrades = filterValidGrades(grades)

  // Calculate total points and badge for each user
  const userPointsMap = useMemo(() => {
    const map: Record<string, number> = {}
    validGrades.forEach(grade => {
      if (!map[grade.github_username]) {
        map[grade.github_username] = 0
      }
      map[grade.github_username] += Number(grade.points_awarded || 0)
    })
    return map
  }, [validGrades])

  // Group grades by user for grouped table view
  const userGradesMap = useMemo(() => {
    const map: Record<string, ConsolidatedGrade[]> = {}
    validGrades.forEach(grade => {
      if (!map[grade.github_username]) {
        map[grade.github_username] = []
      }
      map[grade.github_username].push(grade)
    })
    return map
  }, [validGrades])

  // Calculate total based on ALL assignments in the system, not just the graded ones
  const totalSystemPoints = useMemo(() => {
    return assignments.length * 100;
  }, [assignments]);

  // Create grouped users array with aggregated data
  const groupedUsers = useMemo((): GroupedUserData[] => {
    const result = Object.entries(userGradesMap).map(([username, userGrades]) => {
      const totalPoints = userGrades.reduce((sum, g) => sum + Number(g.points_awarded || 0), 0)
      
      // 2. Calculate the group average percentage
      // Prevent division by zero if no points are available in the system
      const rawPercentage = totalSystemPoints > 0 ? (totalPoints / totalSystemPoints) * 100 : 0;
      // Round to one decimal place to ensure UI consistency, and cap at 100%
      const averagePercentage = Math.min(Math.round(rawPercentage * 10) / 10, 100);
      
      return {
        githubUsername: username,
        grades: userGrades,
        totalPoints,
        averagePercentage,
        challengeCount: userGrades.length
      }
    })
    return result
  }, [userGradesMap, totalSystemPoints])

  // Get badge for a user based on their total points
  const getUserBadge = (githubUsername: string) => {
    const points = userPointsMap[githubUsername] || 0
    // Find the highest badge the user has earned
    const earnedBadge = [...BADGE_DEFINITIONS].reverse().find(def => points >= def.level)
    return earnedBadge || null
  }

  // Get badge for a specific assignment based on points earned
  const getAssignmentBadge = (pointsAwarded: number, pointsAvailable: number) => {
    if (!pointsAwarded || !pointsAvailable) return null
    // Calculate what percentage of the assignment was completed
    const percentage = (pointsAwarded / pointsAvailable) * 100
    // Map percentage to badge thresholds (each badge = 100 points = passing an assignment)
    const badgeLevel = Math.floor(percentage / 20) * 100 // 0-19=0, 20-39=100, 40-59=200, etc.
    const earnedBadge = BADGE_DEFINITIONS.find(def => def.level === badgeLevel) || null
    return earnedBadge
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [sortField, setSortField] = useState<SortField>('github_username')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [userPreferences, setUserPreferences] = useState<Record<string, boolean>>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Shared function to load user preferences (defined once to avoid duplication)
  const loadAllUserPreferences = async (): Promise<void> => {
    try {
      const response = await fetch('/api/user-preferences')

      if (!response.ok) {
        // Silently ignore 401 (not authenticated) - this is expected
        if (response.status !== 401) {
          console.error('Error loading user preferences:', response.statusText)
        }
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

  // Load all user preferences on mount and poll for changes
  useEffect(() => {
    loadAllUserPreferences()

    // Poll for changes every 5 seconds (replaces realtime subscription)
    const interval = setInterval(loadAllUserPreferences, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Also reload preferences when the current user's preference changes
  useEffect(() => {
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

  // Helper for sorting comparison (must be defined before useMemo)
  const compareValues = (aValue: string | number, bValue: string | number, direction: SortDirection): number => {
    const isAscending = direction === 'asc'
    
    if (aValue === bValue) return 0
    
    if (isAscending) {
      return aValue < bValue ? -1 : 1
    }
    return aValue > bValue ? -1 : 1
  }

  // Filter and sort grouped users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = groupedUsers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const anonymousId = generateAnonymousId(user.githubUsername)
        const canSearchRealName = isAdmin || userPreferences[user.githubUsername] || user.githubUsername === currentUsername

        return (
          anonymousId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (canSearchRealName && user.githubUsername.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })
    }

    // If user searched their real username, move their record to top
    if (searchedUserInfo) {
      filtered = filtered.sort((a, b) => {
        const aIsSearched = a.githubUsername.toLowerCase() === searchedUserInfo.realUsername.toLowerCase()
        const bIsSearched = b.githubUsername.toLowerCase() === searchedUserInfo.realUsername.toLowerCase()
        if (aIsSearched && !bIsSearched) return -1
        if (!aIsSearched && bIsSearched) return 1
        return 0
      })
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'github_username':
          aValue = a.githubUsername.toLowerCase()
          bValue = b.githubUsername.toLowerCase()
          break
        case 'challenge_count':
          aValue = a.challengeCount
          bValue = b.challengeCount
          break
        case 'total_points':
          aValue = a.totalPoints
          bValue = b.totalPoints
          break
        case 'average_percentage':
          aValue = a.averagePercentage
          bValue = b.averagePercentage
          break
      }

      if (sortDirection === 'asc') {
        return compareValues(aValue, bValue, 'asc')
      } else {
        return compareValues(aValue, bValue, 'desc')
      }
    })

    return filtered
  }, [groupedUsers, searchTerm, sortField, sortDirection, searchedUserInfo, isAdmin, currentUsername, userPreferences])


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

  // Get progress bar color
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Get average comparison info
  const getAverageComparison = (isCurrentUser: boolean, userPercentage: number) => {
    if (!isCurrentUser) return { comparison: '', icon: null, color: '' }
    
    if (userPercentage > averageGrade) {
      return {
        comparison: t('aboveAverage'),
        icon: <CaretUp size={14} className="text-green-500" />,
        color: 'text-green-700'
      }
    }
    if (userPercentage < averageGrade) {
      return {
        comparison: t('belowAverage'),
        icon: <CaretDown size={14} className="text-red-500" />,
        color: 'text-red-700'
      }
    }
    return {
      comparison: t('onPar'),
      icon: <CaretRight size={14} className="text-gray-500" />,
      color: 'text-gray-700'
    }
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
            <div className="bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
              <div className="shrink-0">
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
                className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none min-w-50 transition-all duration-200"
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

      {/* Table - Responsive without horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-0">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 md:px-4 md:py-3 w-1/4"
                onClick={() => handleSort('github_username')}
              >
                <div className="flex items-center gap-1 md:gap-2">
                  <Crown className="h-3 w-3 md:h-4 md:w-4 text-amber-500" />
                  <span className="hidden sm:inline">{t('inhabitant')}</span>
                  <span className="sm:hidden">👤</span>
                  {getSortIcon('github_username')}
                </div>
              </th>
              <th
                className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 md:px-4 md:py-3 w-20"
                onClick={() => handleSort('challenge_count')}
              >
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="hidden md:inline">{t('challenges')}</span>
                  <span className="md:hidden">🎯</span>
                  {getSortIcon('challenge_count')}
                </div>
              </th>
              <th
                className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 md:px-4 md:py-3 w-1/3"
                onClick={() => handleSort('average_percentage')}
              >
                <div className="flex items-center gap-2">
                  {t('average')}
                  {getSortIcon('average_percentage')}
                </div>
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-4 md:py-3 w-24">
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="hidden md:inline">🏆</span>
                  <span className="md:hidden">🏅</span>
                  <span className="hidden lg:inline">{t('badge')}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedUsers.map((user) => {
              const displayName = getDisplayName(user.githubUsername)
              const description = getDisplayDescription(user.githubUsername)
              const isSearchedUser = searchedUserInfo?.realUsername.toLowerCase() === user.githubUsername.toLowerCase()
              const isCurrentUser = currentUsername === user.githubUsername && !isAdmin
              const rowKey = user.githubUsername
              const isExpanded = expandedRows.has(rowKey)
              const userBadge = getUserBadge(user.githubUsername)
              const { comparison: averageComparison, icon: comparisonIcon, color: comparisonColor } = getAverageComparison(isCurrentUser, user.averagePercentage)

              return (
                <Fragment key={rowKey}>
                  <tr
                    className={`hover:bg-gray-100 transition-colors duration-200 cursor-pointer ${
                      isSearchedUser ? 'bg-amber-50 border-l-4 border-amber-500 shadow-sm' : ''
                    } ${isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' : ''}`}
                    onClick={() => toggleRowExpanded(rowKey)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleRowExpanded(rowKey)}
                    tabIndex={0}
                  >
                    <td className="px-2 py-3 whitespace-nowrap md:px-4">
                      <div className="flex items-center">
                        <div className="shrink-0">
                          <LOTRAvatar
                            githubUsername={user.githubUsername}
                            size="sm"
                            className="transition-transform duration-200 hover:scale-110 md:size-lg"
                          />
                        </div>
                        <div className="ml-2 md:ml-3">
                          <div className="flex items-center gap-1 md:gap-2">
                            <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-20 md:max-w-none">
                              {displayName}
                            </div>
                            {isSearchedUser && (
                              <span className="inline-flex items-center px-1 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                <Crown className="h-2 w-2 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                                <span className="hidden md:inline">{t('itsYou')}</span>
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="inline-flex items-center px-1 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                <Crown className="h-2 w-2 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                                <span className="hidden md:inline">{t('yourPosition')}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-500 italic hidden sm:block">
                            {description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap md:px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs md:text-sm text-gray-600">
                          {user.challengeCount} {user.challengeCount === 1 ? t('challenge_singular') : t('challenge_plural')}
                        </span>
                        {/* Expand indicator - always show for all users with challenges */}
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <CaretRight className={`h-3 w-3 md:h-4 md:w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          <span className="text-[10px] hidden md:inline">{t('details')}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 break-word md:px-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 md:gap-3">
                          {/* Barra de progreso */}
                          <div className="w-10 md:w-16 bg-gray-200 rounded-full h-1.5 md:h-2">
                            <div
                              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${getProgressBarColor(user.averagePercentage)}`}
                              style={{width: `${Math.min(user.averagePercentage, 100)}%`}}
                            ></div>
                          </div>
                          {/* Porcentaje con pill */}
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${getGradeBgColor(user.averagePercentage)} ${getGradeColor(user.averagePercentage)}`}>
                            {Math.round(user.averagePercentage)}%
                          </span>
                        </div>
                        {isCurrentUser && averageComparison && (
                          <div className={`flex items-center gap-1 text-xs font-medium ${comparisonColor}`}>
                            {comparisonIcon}
                            {averageComparison} ({t('classAverage')}: {averageGrade}%)
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Badge Column */}
                    <td className="px-1 py-3 whitespace-nowrap md:px-4">
                      {userBadge ? (
                        <div className="flex flex-col items-start">
                          <div className="inline-flex items-center gap-0.5 md:gap-1 px-1 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span>{getBadgeIcon(userBadge.icon, 14)}</span>
                            <span className="hidden lg:inline">{userBadge.name}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                  {/* Expanded row - show challenge details */}
                  {isExpanded && (
                    <tr key={`${rowKey}-details`} className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="ml-8 space-y-2">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {t('challengeDetails')} ({user.challengeCount})
                          </div>
                          {user.grades.map((grade) => {
                            // Each challenge is worth 100 points
                            const CHALLENGE_POINTS = 100
                            const pointsAwarded = Number(grade.points_awarded) || 0
                            // Handle NaN case
                            const safePointsAwarded = Number.isNaN(pointsAwarded) ? 0 : pointsAwarded
                            const gradePercentage = CHALLENGE_POINTS > 0 ? (safePointsAwarded / CHALLENGE_POINTS) * 100 : 0
                            const gradeFeedback = getFeedbackForAssignment(user.githubUsername, grade.assignment_name)
                            const gradeBadge = getAssignmentBadge(pointsAwarded, 100)
                            const gradeRowKey = `${user.githubUsername}-${grade.assignment_name}`
                            const isGradeExpanded = expandedRows.has(gradeRowKey)
                            
                            return (
                              <div key={gradeRowKey}>
                                <button
                                  type="button"
                                  className={`flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm w-full text-left ${gradeFeedback.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                  onClick={() => gradeFeedback.length > 0 && toggleRowExpanded(gradeRowKey)}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs md:text-sm text-gray-600">
                                      {grade.assignment_name}
                                    </span>
                                    {gradeBadge && (
                                      <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                                        {getBadgeIcon(gradeBadge.icon, 14)} {gradeBadge.name}
                                      </span>
                                    )}
                                    {gradeFeedback.length > 0 && (
                                      <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                                        <ChatCircleText className="h-2 w-2" />
                                        <CaretRight className={`h-2 w-2 transition-transform ${isGradeExpanded ? 'rotate-90' : ''}`} />
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getGradeBgColor(gradePercentage)} ${getGradeColor(gradePercentage)}`}>
                                      {safePointsAwarded}/100 ({Math.round(gradePercentage)}%)
                                    </span>
                                  </div>
                                </button>
                                {/* Feedback content - expandable */}
                                {gradeFeedback.length > 0 && isGradeExpanded && (
                                  <div className="bg-amber-50 border border-t-0 border-amber-200 rounded-b-lg p-3 -mt-1 mb-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-amber-800 mb-2">
                                      <ChatCircleText className="h-3 w-3" />
                                      {t('tutorFeedback')}
                                    </div>
                                    {gradeFeedback.map((fb) => (
                                      <div key={fb.reviewer_username || fb.assignment_name} className="bg-white border border-amber-200 rounded-lg p-3 shadow-sm mb-2 last:mb-0">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.feedback_for_student}</p>
                                        <p className="text-xs text-gray-500 mt-2 italic">
                                          — {fb.reviewer_username}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
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
             {t('showing')} {filteredAndSortedUsers.length} {t('of')} {groupedUsers.length} {t('records')}
           </span>
         </div>
       </div>
    </div>
  )
}