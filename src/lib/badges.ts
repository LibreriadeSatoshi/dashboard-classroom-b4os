import { createClient } from './supabase/server'
import { TABLE_NAMES } from './constants'

// 5 badges based on points - LOTR Theme
// Each challenge = 100 points, max 500 points = 5 challenges
export const BADGE_DEFINITIONS = [
  { level: 100, name: 'Hobbit', icon: '🍽️', description: 'First Step - Completa tu primer reto' },
  { level: 200, name: 'Ranger', icon: '🌲', description: 'The Road Goes Ever On - Completa 2 retos' },
  { level: 300, name: 'Elf', icon: '🌿', description: 'Elven Wisdom - Completa 3 retos' },
  { level: 400, name: 'Dwarf', icon: '⛏️', description: 'Under the Mountain - Completa 4 retos' },
  { level: 500, name: 'King', icon: '👑', description: 'The Return of the King - Completa todos los retos' },
] as const

export type BadgeLevel = typeof BADGE_DEFINITIONS[number]['level']

export interface BadgeInfo {
  level: BadgeLevel
  name: string
  icon: string
  description: string
  earned: boolean
  earnedAt?: string
}

// Get total points from consolidated_grades
export async function getUserPoints(githubUsername: string): Promise<number> {
  const supabase = createClient()

  const { data: grades } = await supabase
    .from(TABLE_NAMES.CONSOLIDATED_GRADES)
    .select('points_awarded')
    .eq('github_username', githubUsername)

  const totalPoints = grades?.reduce((sum, g) => sum + Number(g.points_awarded || 0), 0) || 0

  return totalPoints
}

// Get all badges for a user based on their points
export async function getUserBadges(githubUsername: string): Promise<BadgeInfo[]> {
  const points = await getUserPoints(githubUsername)

  return BADGE_DEFINITIONS.map((def) => ({
    ...def,
    earned: points >= def.level,
    earnedAt: points >= def.level ? new Date().toISOString() : undefined
  }))
}

// Get count of earned badges
export async function getEarnedBadgeCount(githubUsername: string): Promise<number> {
  const badges = await getUserBadges(githubUsername)
  return badges.filter(b => b.earned).length
}

// Get the next badge threshold the user is working towards
export async function getNextBadgeThreshold(githubUsername: string): Promise<number | null> {
  const points = await getUserPoints(githubUsername)
  
  const nextThreshold = BADGE_DEFINITIONS.find(d => d.level > points)?.level || null
  return nextThreshold
}

// Get progress percentage towards next badge
export async function getNextBadgeProgress(githubUsername: string): Promise<{ current: number; next: number; percentage: number } | null> {
  const points = await getUserPoints(githubUsername)
  const nextDef = BADGE_DEFINITIONS.find(d => d.level > points)

  if (!nextDef) {
    return null // All badges earned
  }

  const prevDef = BADGE_DEFINITIONS.find(d => d.level < nextDef.level)
  const currentThreshold = prevDef ? prevDef.level : 0

  const percentage = Math.min(((points - currentThreshold) / (nextDef.level - currentThreshold)) * 100, 100)

  return {
    current: points,
    next: nextDef.level,
    percentage: Math.round(percentage)
  }
}
