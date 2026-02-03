
import type { Badge, UserBadge } from '@/types/badges';

const hardcodedBadges: Badge[] = [
  { id: 1, name: 'Pionero de la Comarca', description: 'Completa tu primer desafío.', icon: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png', points_required: 1 },
  { id: 2, name: 'Explorador de la Tierra Media', description: 'Completa 5 desafíos.', icon: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png', points_required: 5 },
  { id: 3, name: 'Héroe de Gondor', description: 'Consigue 100 puntos.', icon: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png', points_required: 100 },
];

const hardcodedUserBadges: UserBadge[] = [
  { id: 1, user_id: 'gandalf', badge_id: 1, unlocked_at: new Date().toISOString() },
  { id: 2, user_id: 'gandalf', badge_id: 2, unlocked_at: new Date().toISOString() },
  { id: 3, user_id: 'aragorn', badge_id: 1, unlocked_at: new Date().toISOString() },
];

export async function getBadges(): Promise<Badge[]> {
  return hardcodedBadges;
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const userBadges = hardcodedUserBadges.filter(ub => ub.user_id === userId);
  return userBadges;
}

export async function unlockBadge(userId: string, badgeId: number): Promise<UserBadge | null> {
  const newUserBadge: UserBadge = {
    id: hardcodedUserBadges.length + 1,
    user_id: userId,
    badge_id: badgeId,
    unlocked_at: new Date().toISOString(),
  };
  hardcodedUserBadges.push(newUserBadge);
  return newUserBadge;
}
    