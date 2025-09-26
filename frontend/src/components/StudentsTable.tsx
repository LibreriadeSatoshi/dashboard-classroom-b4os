/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { type Student, type Assignment, type ConsolidatedGrade, supabase } from '@/lib/supabase'
import { MagnifyingGlass, Funnel, CaretUp, CaretDown, Crown } from 'phosphor-react'
import {
  generateAnonymousId,
  findUserByRealUsername,
  getAnonymousDescription
} from '@/utils/anonymization'
import LOTRAvatar from './LOTRAvatar'
import { useNamePreference } from '@/contexts/NamePreferenceContext'

interface StudentsTableProps {
  students: Student[]
  assignments: Assignment[]
  grades: ConsolidatedGrade[]
  showRealNames?: boolean
}

type SortField = 'github_username' | 'assignment_name' | 'points_awarded' | 'points_available' | 'percentage'
type SortDirection = 'asc' | 'desc'

export default function StudentsTable({ assignments, grades, showRealNames = false }: StudentsTableProps) {
  const { data: session } = useSession()
  const { showRealName } = useNamePreference() // Get current user's preference to trigger updates
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [sortField, setSortField] = useState<SortField>('github_username')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [userPreferences, setUserPreferences] = useState<Record<string, boolean>>({})

  // Load all user preferences
  useEffect(() => {
    const loadAllUserPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_privacy')
          .select('github_username, show_real_name')

        if (error) {
          console.error('Error loading user preferences:', error)
          return
        }

        const preferences: Record<string, boolean> = {}
        data?.forEach(pref => {
          preferences[pref.github_username] = pref.show_real_name
        })
        setUserPreferences(preferences)
      } catch (error) {
        console.error('Error loading user preferences:', error)
      }
    }

    loadAllUserPreferences()

    // Listen for changes in user_privacy table
    const channel = supabase
      .channel('user_privacy_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_privacy' },
        () => {
          console.log('✅ User preferences change detected, reloading preferences...')
          loadAllUserPreferences()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Also reload preferences when the current user's preference changes
  useEffect(() => {
    const loadAllUserPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_privacy')
          .select('github_username, show_real_name')

        if (error) {
          console.error('Error loading user preferences:', error)
          return
        }

        const preferences: Record<string, boolean> = {}
        data?.forEach(pref => {
          preferences[pref.github_username] = pref.show_real_name
        })
        setUserPreferences(preferences)
      } catch (error) {
        console.error('Error loading user preferences:', error)
      }
    }

    loadAllUserPreferences()
  }, [session?.user, showRealName]) // Reload when session or current user's preference changes

  // Calculate percentage
  const calculatePercentage = (pointsAwarded: number, pointsAvailable: number) => {
    if (pointsAvailable > 0) {
      return Math.round((pointsAwarded / pointsAvailable) * 100)
    } else if (pointsAwarded > 0) {
      return 100
    }
    return 0
  }

  // Function to determine what name to display
  const getDisplayName = (githubUsername: string) => {
    // Check if this user has chosen to show their real name
    const userWantsToShowRealName = userPreferences[githubUsername] || false
    
    // If the user chose to show their real name, show it to everyone
    if (userWantsToShowRealName) {
      return githubUsername
    }

    // Otherwise show anonymous ID
    return generateAnonymousId(githubUsername)
  }

  // Function to get display description
  const getDisplayDescription = (githubUsername: string) => {
    // Check if this user has chosen to show their real name
    const userWantsToShowRealName = userPreferences[githubUsername] || false
    
    // If the user chose to show their real name, show GitHub info to everyone
    if (userWantsToShowRealName) {
      return `GitHub: @${githubUsername}`
    }

    // Otherwise show anonymous description
    const anonymousId = generateAnonymousId(githubUsername)
    return getAnonymousDescription(anonymousId)
  }

  // Check if search term matches a real username (exact match for self-identification)
  const searchedUserInfo = useMemo(() => {
    if (!searchTerm) return null
    
    const currentUserRole = (session?.user as any)?.role
    const currentUserUsername = (session?.user as any)?.githubUsername
    
    // First check for exact match (for self-identification feature)
    const allUsernames = grades.map(g => g.github_username)
    const exactMatch = allUsernames.find(username => 
      username.toLowerCase() === searchTerm.toLowerCase()
    )
    
    if (exactMatch) {
      // If user is dev, only allow searching for their own username
      if (currentUserRole === 'dev' && exactMatch !== currentUserUsername) {
        return null // Don't allow devs to search for other users' real usernames
      }
      
      const result = findUserByRealUsername(exactMatch, allUsernames)
      return result.found ? {
        realUsername: exactMatch,
        anonymousId: result.anonymousId
      } : null
    }
    
    return null
  }, [searchTerm, grades, session])

  // Filter and sort data
  const filteredAndSortedGrades = useMemo(() => {
    let filtered = grades

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(grade => {
        const anonymousId = generateAnonymousId(grade.github_username)
        const currentUserRole = (session?.user as any)?.role || 'dev'
        const currentUserUsername = (session?.user as any)?.githubUsername
        
        // Check if this user has chosen to show their real name
        const userWantsToShowRealName = userPreferences[grade.github_username] || false
        
        return (
          // Search by anonymous ID (always allowed)
          anonymousId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // Search by assignment name (always allowed)
          grade.assignment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // Search by real username (if user chose to show it OR if admin or searching for own username)
          (userWantsToShowRealName || currentUserRole === 'administrator' || grade.github_username === currentUserUsername) &&
          grade.github_username.toLowerCase().includes(searchTerm.toLowerCase())
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
        aValue = calculatePercentage(a.points_awarded || 0, a.points_available || 0)
        bValue = calculatePercentage(b.points_awarded || 0, b.points_available || 0)
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
  }, [grades, searchTerm, selectedAssignment, sortField, sortDirection])


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
            Habitantes de la Tierra Media
          </h2>
          
          {/* Search result indicator */}
          {searchedUserInfo && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
              <div className="flex-shrink-0">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-amber-900 mb-1">
                  🎯 ¡Identidad Revelada!
                </div>
                <div className="text-sm text-amber-800">
                  Tu identidad secreta en la Tierra Media es: 
                  <span className="font-bold text-amber-900 ml-1 px-2 py-1 bg-amber-100 rounded">
                    {searchedUserInfo.anonymousId}
                  </span>
                </div>
                <div className="text-xs text-amber-700 mt-1 italic">
                  Solo tú puedes ver este mensaje
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
                placeholder={
                  (session?.user as any)?.role === 'dev' 
                    ? "Busca por nombre anónimo, tu username, o nombres revelados..." 
                    : "Busca por username de GitHub, nombres anónimos, o nombres revelados..."
                }
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
                <option value="">Todas las aventuras</option>
                {assignments.map(assignment => (
                  <option key={assignment.id} value={assignment.name}>
                    {assignment.name} ({assignment.points_available} pts)
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
                  Habitante de la Tierra Media
                  {getSortIcon('github_username')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('assignment_name')}
              >
                <div className="flex items-center gap-2">
                  Challenge
                  {getSortIcon('assignment_name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('points_awarded')}
              >
                <div className="flex items-center gap-2">
                  Puntos Obtenidos
                  {getSortIcon('points_awarded')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('points_available')}
              >
                <div className="flex items-center gap-2">
                  Puntos Disponibles
                  {getSortIcon('points_available')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percentage')}
              >
                <div className="flex items-center gap-2">
                  Porcentaje
                  {getSortIcon('percentage')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedGrades.map((grade, index) => {
              const percentage = calculatePercentage(grade.points_awarded || 0, grade.points_available || 0)
              const displayName = getDisplayName(grade.github_username)
              const description = getDisplayDescription(grade.github_username)
              const isSearchedUser = searchedUserInfo?.realUsername.toLowerCase() === grade.github_username.toLowerCase()
              const isCurrentUser = (session?.user as any)?.githubUsername === grade.github_username
              
              return (
                <tr 
                  key={`${grade.github_username}-${grade.assignment_name}-${index}`} 
                  className={`hover:bg-gray-50 transition-colors duration-200 ${
                    isSearchedUser ? 'bg-amber-50 border-l-4 border-amber-500 shadow-sm' : ''
                  }`}
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
                              ¡Eres tú!
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 italic">
                          {description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {grade.assignment_name}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* Barra de progreso */}
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentage >= 80 ? 'bg-green-500' :
                            percentage >= 60 ? 'bg-yellow-500' :
                            percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{width: `${Math.min(percentage, 100)}%`}}
                        ></div>
                      </div>
                      {/* Porcentaje con pill */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBgColor(percentage)} ${getGradeColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

       {/* Footer */}
       <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
         <div className="flex items-center justify-center text-sm text-gray-600">
           <span>
             Mostrando {filteredAndSortedGrades.length} de {grades.length} registros
           </span>
         </div>
       </div>
    </div>
  )
}