
import { Badge as BadgeType, UserBadge } from '@/types/badges';
import Badge from './Badge';

interface BadgeListProps {
  badges: BadgeType[];
  userBadges: UserBadge[];
}

export default function BadgeList({ badges, userBadges }: BadgeListProps) {
  const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  return (
    <div className="flex gap-2">
      {badges.map(badge => {
        if (unlockedBadgeIds.has(badge.id)) {
          return <Badge key={badge.id} badge={badge} />;
        }
        return null;
      })}
    </div>
  );
}
    