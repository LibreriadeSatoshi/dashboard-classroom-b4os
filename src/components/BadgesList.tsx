'use client'

import { useTranslations } from 'next-intl'
import { BADGE_DEFINITIONS, BadgeInfo } from '@/lib/badges'
import { getBadgeIcon } from '@/lib/badgeIcons'

interface BadgesListProps {
  readonly badges: BadgeInfo[];
  readonly currentPoints: number;
}

export default function BadgesList({ badges, currentPoints }: BadgesListProps) {
  const t = useTranslations('badges')
  const tc = useTranslations('common')

  const earnedCount = badges.filter(b => b.earned).length
  const nextBadge = badges.find(b => !b.earned)

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-600/40 shadow-xl">
      <h3 className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
        <span>🏆</span>
        {t('title')}
      </h3>

      {/* Stats */}
      <div className="mb-4 text-sm text-slate-300">
        <span className="text-amber-400 font-bold">{earnedCount}</span>
        {' / '}
        <span>{BADGE_DEFINITIONS.length}</span>
        {' '}
        <span className="text-slate-400">badges</span>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{tc('yourScore')}: {currentPoints}</span>
          {nextBadge && (
            <span>{nextBadge.level - currentPoints} pts to next badge</span>
          )}
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-linear-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            style={{ width: `${(earnedCount / BADGE_DEFINITIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges grid - LOTR themed */}
      <div className="grid grid-cols-5 gap-2">
        {BADGE_DEFINITIONS.map((def) => {
          const badge = badges.find(b => b.level === def.level)
          const isEarned = badge?.earned

          return (
            <div
              key={def.level}
              className={`
                relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300
                ${isEarned 
                  ? 'bg-amber-900/50 border-amber-400 shadow-lg shadow-amber-400/20' 
                  : 'bg-slate-800/50 border-slate-600 opacity-50'
                }
              `}
            >
              {/* Badge icon */}
              <div className="text-2xl mb-1">
                {isEarned ? getBadgeIcon(def.icon, 24) : '🔒'}
              </div>

              {/* Name */}
              <div className={`text-xs font-bold ${isEarned ? 'text-amber-300' : 'text-slate-500'}`}>
                {def.name}
              </div>

              {/* Points */}
              <div className="text-[10px] text-slate-500 mt-0.5">
                {def.level} pts
              </div>

              {/* Earned indicator */}
              {isEarned && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
              )}
            </div>
          )
        })}
      </div>

      {/* Next badge info */}
      {nextBadge && (
        <div className="mt-4 p-3 bg-slate-700/50 rounded-xl text-center">
          <p className="text-sm text-slate-300">
            <span className="text-amber-400 font-bold">{nextBadge.level - currentPoints}</span>
            {' '}pts to unlock {getBadgeIcon(nextBadge.icon, 24)} {nextBadge.name}
          </p>
        </div>
      )}

      {/* All earned message */}
      {!nextBadge && earnedCount === BADGE_DEFINITIONS.length && (
        <div className="mt-4 p-3 bg-amber-900/50 rounded-xl text-center border border-amber-500/50">
          <p className="text-sm text-amber-300 font-bold">✨ All badges earned! ✨</p>
        </div>
      )}
    </div>
  )
}
