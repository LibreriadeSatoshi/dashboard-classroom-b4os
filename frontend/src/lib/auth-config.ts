import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client (uses non-public env vars)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
)

interface GitHubProfile {
  login: string
  name: string
  email: string
  avatar_url: string
}

// Export NextAuth configuration to be used in both route handler and getServerSession
export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ account, profile }: any) {
      if (account?.provider !== 'github') return false

      const githubProfile = profile as GitHubProfile
      const githubUsername = githubProfile?.login

      if (!githubUsername) return false

      try {
        // Check if user is in authorized_users table
        const { data: authorizedUser } = await supabase
          .from('authorized_users')
          .select('*')
          .eq('github_username', githubUsername)
          .single()

        if (authorizedUser) {
          return true
        }

        // Check if user is in consolidated_grades (students)
        const { data: studentUser } = await supabase
          .from('consolidated_grades')
          .select('github_username')
          .eq('github_username', githubUsername)
          .limit(1)
          .single()

        if (studentUser) {
          return true
        }

        // User not found in either table
        return false

      } catch (error) {
        console.error('Error checking user access:', error)
        return false
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        const githubProfile = profile as GitHubProfile
        const githubUsername = githubProfile?.login
        token.githubUsername = githubUsername
        token.name = githubProfile.name || githubUsername
        token.email = githubProfile.email
        token.image = githubProfile.avatar_url

        // NOTE: accessToken is NOT stored in token for security reasons
        // It remains only in the server-side account object and is never sent to client

        // Determine user role
        try {
          // Check if user is in authorized_users table first
          const { data: authorizedUser } = await supabase
            .from('authorized_users')
            .select('role')
            .eq('github_username', githubUsername)
            .single()

          if (authorizedUser) {
            token.role = 'administrator'
          } else {
            // Check if user is a student
            const { data: studentUser } = await supabase
              .from('consolidated_grades')
              .select('github_username')
              .eq('github_username', githubUsername)
              .limit(1)
              .single()

            if (studentUser) {
              token.role = 'dev'
            }
          }
        } catch (error) {
          console.error('Error determining user role:', error)
          token.role = 'dev' // Default role
        }
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      // NOTE: accessToken is NOT sent to client for security reasons
      // It remains only in the server-side JWT token
      if (token.githubUsername) {
        session.user.githubUsername = token.githubUsername as string
        session.user.role = token.role as 'administrator' | 'dev'
        // accessToken is intentionally NOT included here - stays server-side only
      }
      return session
    }
  },
  pages: {
    signIn: '/es/auth/signin',
    error: '/es/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
}

