'use client'

import { useTranslations } from 'next-intl'
import { BADGE_DEFINITIONS, BadgeInfo } from '@/lib/badges'
import { Trophy } from 'phosphor-react'
import { getBadgeIcon } from '@/lib/badgeIcons';

interface UserBadgesDropdownProps {
  readonly badges: BadgeInfo[];
  readonly currentPoints: number;
}

export default function UserBadgesDropdown({ badges, currentPoints }: UserBadgesDropdownProps) {
  const t = useTranslations('badges')

  // Get the highest earned badge (last one)
  const earnedBadges = badges.filter(b => b.earned)
  const highestBadge = earnedBadges.length > 0 
    ? earnedBadges.at(-1)
    : null
  
  // Calculate progress to next badge
  const nextBadge = badges.find(b => !b.earned)

  return (
    <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <Trophy size={14} className="text-amber-500" />
        <span className="text-xs font-semibold text-amber-800">
          {t('title')}
        </span>
      </div>

      {/* Current Badge - Compact display */}
      {highestBadge ? (
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-md border border-amber-200">
          <div className="text-xl leading-none">
            {getBadgeIcon(highestBadge.icon, 20)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-amber-800 truncate">
              {highestBadge.name}
            </div>
            <div className="text-[10px] text-amber-600">
              {currentPoints} pts total
            </div>
          </div>
          {nextBadge && (
            <div className="text-[10px] text-amber-600 text-right flex-shrink-0">
              <div>+{nextBadge.level - currentPoints}</div>
              <div className="text-gray-400">to next</div>
            </div>
          )}
        </div>
      ) : (
        // No badges yet - compact message
        <div className="p-1.5 text-center">
          <div className="text-xs text-gray-500">
            🔒 {nextBadge ? `${nextBadge.level - currentPoints} pts to first badge` : 'Complete challenges!'}
          </div>
        </div>
      )}

      {/* All badges unlocked celebration */}
      {!nextBadge && earnedBadges.length === BADGE_DEFINITIONS.length && (
        <div className="mt-1.5 text-center">
          <span className="text-[10px] text-amber-700 font-medium">✨ All badges earned! ✨</span>
        </div>
      )}
    </div>
  )
}
