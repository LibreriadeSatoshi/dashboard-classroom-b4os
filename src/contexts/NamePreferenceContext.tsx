/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface NamePreferenceContextType {
  showRealName: boolean
  setShowRealName: (value: boolean) => void
  loading: boolean
}

const NamePreferenceContext = createContext<NamePreferenceContextType | undefined>(undefined)

export function NamePreferenceProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [showRealName, setShowRealNameState] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load user preference
  useEffect(() => {
    if (session?.user && (session.user as any).githubUsername) {
      loadUserPreference()
    }
  }, [session])

  const loadUserPreference = async () => {
    if (!session?.user || !(session.user as any).githubUsername) return

    try {
      const response = await fetch('/api/user-privacy')

      if (!response.ok) {
        console.error('Error loading user preference:', response.statusText)
        return
      }

      const data = await response.json()
      setShowRealNameState(data.show_real_name || false)
    } catch (error) {
      console.error('Error loading user preference:', error)
    }
  }

  const setShowRealName = async (newValue: boolean) => {
    if (!session?.user || !(session.user as any).githubUsername) return

    setLoading(true)
    try {
      console.log(`🔄 Updating identity preference to: ${newValue} for user: ${(session.user as any).githubUsername}`)

      // Optimistically update UI immediately
      setShowRealNameState(newValue)

      const response = await fetch('/api/user-privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ show_real_name: newValue })
      })

      if (!response.ok) {
        console.error('❌ Error updating preference:', response.statusText)
        // Revert optimistic update on error
        setShowRealNameState(!newValue)
        return
      }

      const data = await response.json()
      // Success - the optimistic update was correct
      console.log('✅ Identity preference updated successfully:', data)
    } catch (error) {
      console.error('Error updating preference:', error)
      // Revert optimistic update on error
      setShowRealNameState(!newValue)
    } finally {
      setLoading(false)
    }
  }

  return (
    <NamePreferenceContext.Provider value={{ showRealName, setShowRealName, loading }}>
      {children}
    </NamePreferenceContext.Provider>
  )
}

export function useNamePreference() {
  const context = useContext(NamePreferenceContext)
  if (context === undefined) {
    throw new Error('useNamePreference must be used within a NamePreferenceProvider')
  }
  return context
}
