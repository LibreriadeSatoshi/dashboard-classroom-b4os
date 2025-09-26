'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

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
      const { data, error } = await supabase
        .from('user_privacy')
        .select('show_real_name')
        .eq('github_username', (session.user as any).githubUsername)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error loading user preference:', error)
        return
      }

      const preference = data?.show_real_name || false
      setShowRealNameState(preference)
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

      const { data, error } = await supabase
        .from('user_privacy')
        .upsert({
          github_username: (session.user as any).githubUsername,
          show_real_name: newValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'github_username'
        })

      if (error) {
        console.error('❌ Error updating preference:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        // Revert optimistic update on error
        setShowRealNameState(!newValue)
        return
      }

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
