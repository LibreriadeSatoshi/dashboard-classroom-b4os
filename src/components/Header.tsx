/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'
import { CaretDown, SignOut, Crown, Eye, EyeSlash, Sword } from 'phosphor-react'
import { useNamePreference } from '@/contexts/NamePreferenceContext'
import { useTranslations, useLocale } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import FeedbackBell from './FeedbackBell'
import FeedbackDropdown from './FeedbackDropdown'
import { Feedback } from '@/lib/feedback'
import UserBadgesDropdown from './UserBadgesDropdown'
import { useUserBadges } from '@/hooks/useUserBadges'

interface HeaderProps {
  readonly hasUnreadFeedback: boolean;
  readonly isFeedbackOpen: boolean;
  readonly onFeedbackClick: () => void;
  readonly onFeedbackRead: () => void;
  readonly onCloseFeedback: () => void;
  readonly initialFeedback?: Feedback[];
}

export default function Header({ hasUnreadFeedback, isFeedbackOpen, onFeedbackClick, onFeedbackRead, onCloseFeedback, initialFeedback }: Readonly<HeaderProps>) {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const { showRealName, setShowRealName, loading } = useNamePreference()
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const locale = useLocale()

  // Get user badges - call hook before early return
  const githubUsername = session ? (session.user as any)?.githubUsername : null
  const { badges, currentPoints, loading: badgesLoading, newlyEarnedBadge, clearNewlyEarnedBadge } = useUserBadges(githubUsername)

  if (!session) return null

  const userRole = (session.user as any)?.role || 'dev'

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}/auth/signin` })
  }

  const getRoleBadgeColor = () => {
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRoleIcon = (role: string) => {
    return role === 'administrator' ?
      <Crown size={20} className="text-amber-400" /> :
      <Sword size={20} className="text-emerald-400" />
  }


  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end gap-4 h-16">
          {/* Feedback Bell & Dropdown */}
          <div className="relative">
            <FeedbackBell 
              hasUnreadFeedback={hasUnreadFeedback} 
              onClick={onFeedbackClick}
              newlyEarnedBadge={newlyEarnedBadge}
              onBadgeNotificationSeen={clearNewlyEarnedBadge}
            />
            <FeedbackDropdown 
              isOpen={isFeedbackOpen}
              onClose={onCloseFeedback}
              onFeedbackRead={onFeedbackRead}
              initialFeedback={initialFeedback || []}
            />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 text-white bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg px-3 py-2 transition-all duration-200 border border-slate-600/40 shadow-lg max-w-50 sm:max-w-60"
            >
              {/* Role Icon */}
              {getRoleIcon((session.user as any)?.role || 'dev')}
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <Image
                  src={session.user?.image || '/default-avatar.png'}
                  alt={(session.user as any)?.githubUsername || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-slate-600"
                />
              </div>

              {/* Username */}
              <span className="text-sm font-medium hidden sm:block truncate min-w-0">
                {(session.user as any)?.githubUsername}
              </span>

              {/* Dropdown arrow */}
              <CaretDown
                size={16}
                className={`transition-transform duration-200 shrink-0 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop */}
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setShowDropdown(false)}
                  aria-label="Close menu"
                />

                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                  <div className="p-3 sm:p-4">
                    {/* User Info */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <Image
                        src={session.user?.image || '/default-avatar.png'}
                        alt={githubUsername || 'User'}
                        width={36}
                        height={36}
                        className="rounded-full shrink-0 aspect-square object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {githubUsername}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate" title={session.user?.email || `${githubUsername}@github`}>
                          {session.user?.email || `${githubUsername}@github`}
                        </div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="mb-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleBadgeColor()}`}>
                        {userRole === 'administrator' ? tc('admin') : tc('dev')}
                      </div>
                    </div>

                    {/* User Badges Dropdown - Show for all users with points */}
                    {(!badgesLoading && badges.length > 0) && (
                      <div className="mb-3 -mx-1">
                        <UserBadgesDropdown 
                          badges={badges} 
                          currentPoints={currentPoints} 
                        />
                      </div>
                    )}

                    {/* Name Preference Toggle - Only for students */}
                    {userRole === 'dev' && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {showRealName ? (
                              <Eye size={16} className="text-green-500" />
                            ) : (
                              <EyeSlash size={16} className="text-amber-500" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {t('namePreference')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {showRealName ? t('realName') : t('anonymousIdentity')}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowRealName(!showRealName)}
                            disabled={loading}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                              showRealName
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                                showRealName ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200 mb-4"></div>

                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <SignOut size={16} />
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
