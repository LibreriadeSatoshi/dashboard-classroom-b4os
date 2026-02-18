'use client'

import { useState, useEffect } from 'react'
import { BadgeInfo } from '@/lib/badges'

interface UseUserBadgesReturn {
  badges: BadgeInfo[]
  currentPoints: number
  loading: boolean
  error: string | null
  newlyEarnedBadge: BadgeInfo | null
  clearNewlyEarnedBadge: () => void
}

const STORAGE_KEY = 'b4os_earned_badges'

export function useUserBadges(githubUsername: string | null): UseUserBadgesReturn {
  const [badges, setBadges] = useState<BadgeInfo[]>([])
  const [currentPoints, setCurrentPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<BadgeInfo | null>(null)

  useEffect(() => {
    if (!githubUsername) {
      setLoading(false)
      setBadges([])
      setCurrentPoints(0)
      return
    }

    async function fetchBadges() {
      try {
        setLoading(true)
        const response = await fetch('/api/badges')
        
        if (!response.ok) {
          throw new Error('Failed to fetch badges')
        }

        const data = await response.json()
        const fetchedBadges = data.badges || []
        const points = Number(data.points) || 0
        
        setBadges(fetchedBadges)
        setCurrentPoints(points)

        // Check for newly earned badges
        const storedBadges = localStorage.getItem(`${STORAGE_KEY}_${githubUsername}`)
        const earnedBadgeIds = storedBadges ? JSON.parse(storedBadges) : []

        // Find badges that are earned now but weren't before
        const newlyEarned = fetchedBadges.find(
          (b: BadgeInfo) => b.earned && !earnedBadgeIds.includes(b.level)
        )

        if (newlyEarned) {
          setNewlyEarnedBadge(newlyEarned)
          // Update stored badges
          const updatedEarned = [...earnedBadgeIds, newlyEarned.level]
          localStorage.setItem(
            `${STORAGE_KEY}_${githubUsername}`, 
            JSON.stringify(updatedEarned)
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [githubUsername])

  const clearNewlyEarnedBadge = () => {
    setNewlyEarnedBadge(null)
  }

  return { badges, currentPoints, loading, error, newlyEarnedBadge, clearNewlyEarnedBadge }
}
