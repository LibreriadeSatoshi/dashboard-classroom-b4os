import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
)

// GET: Fetch user's privacy preference
export async function GET() {
  try {
    const session: Session | null = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const githubUsername = (session.user as any).githubUsername

    const { data, error } = await supabase
      .from('zzz_user_privacy')
      .select('show_real_name')
      .eq('github_username', githubUsername)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error loading user preference:', error)
      return NextResponse.json({ error: 'Failed to load preference' }, { status: 500 })
    }

    return NextResponse.json({
      show_real_name: data?.show_real_name || false
    })
  } catch (error) {
    console.error('Error fetching user privacy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Update user's privacy preference
export async function POST(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const githubUsername = (session.user as any).githubUsername
    const { show_real_name } = await request.json()

    const { data, error } = await supabase
      .from('zzz_user_privacy')
      .upsert({
        github_username: githubUsername,
        show_real_name,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'github_username'
      })
      .select()

    if (error) {
      console.error('Error updating preference:', error)
      return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating user privacy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
