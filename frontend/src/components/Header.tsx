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

interface HeaderProps {
  hasUnreadFeedback: boolean;
  isFeedbackOpen: boolean;
  onFeedbackClick: () => void;
  onFeedbackRead: () => void;
  onCloseFeedback: () => void;
}

export default function Header({ hasUnreadFeedback, isFeedbackOpen, onFeedbackClick, onFeedbackRead, onCloseFeedback }: HeaderProps) {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const { showRealName, setShowRealName, loading } = useNamePreference()
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const locale = useLocale()

  if (!session) return null

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}/auth/signin` })
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'administrator'
      ? 'bg-gray-100 text-gray-800 border-gray-200'
      : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRoleIcon = (role: string) => {
    return role === 'administrator' ?
      <Crown size={20} className="text-white" /> :
      <Sword size={20} className="text-white" />
  }


  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end gap-4 h-16">
          {/* Feedback Bell & Dropdown */}
          <div className="relative">
            <FeedbackBell hasUnreadFeedback={hasUnreadFeedback} onClick={onFeedbackClick} />
            <FeedbackDropdown 
              isOpen={isFeedbackOpen}
              onClose={onCloseFeedback}
              onFeedbackRead={onFeedbackRead}
            />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 text-white bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 rounded-lg px-3 py-2 transition-all duration-200 border border-slate-600/40 shadow-lg"
            >
              {/* Role Icon */}
              {getRoleIcon((session.user as any)?.role || 'dev')}
              
              {/* Avatar */}
              <div className="relative">
                <Image
                  src={session.user?.image || '/default-avatar.png'}
                  alt={(session.user as any)?.githubUsername || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-slate-600"
                />
              </div>

              {/* Username */}
              <span className="text-sm font-medium hidden sm:block">
                {(session.user as any)?.githubUsername}
              </span>

              {/* Dropdown arrow */}
              <CaretDown
                size={16}
                className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                  <div className="p-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <Image
                        src={session.user?.image || '/default-avatar.png'}
                        alt={(session.user as any)?.githubUsername || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {(session.user as any)?.githubUsername}
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.user?.email || `${(session.user as any)?.githubUsername}@github`}
                        </div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleBadgeColor((session.user as any)?.role || 'dev')}`}>
                        {(session.user as any)?.role === 'administrator' ? tc('admin') : tc('dev')}
                      </div>
                    </div>

                    {/* Name Preference Toggle - Only for students */}
                    {(session.user as any)?.role === 'dev' && (
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