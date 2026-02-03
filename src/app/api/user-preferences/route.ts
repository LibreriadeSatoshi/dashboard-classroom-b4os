import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS - safe because this runs server-side only
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY  || ''
)

// GET: Fetch all users' privacy preferences
export async function GET() {
  try {
    const session: Session | null = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('zzz_user_privacy')
      .select('github_username, show_real_name')

    if (error) {
      console.error('Error loading user preferences:', error)
      return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 })
    }

    return NextResponse.json({ preferences: data || [] })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
