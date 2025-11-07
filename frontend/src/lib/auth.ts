import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './auth-config'

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/es/auth/signin')
  }

  return session
}

export async function getSession() {
  return await getServerSession(authOptions)
}