'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type Student, type Assignment, type ConsolidatedGrade, type StudentFeedback } from '@/lib/supabase'
import { type Feedback } from '@/lib/feedback'
import { type AssignmentProgress } from '@/lib/dashboard'
import { Users, Crown, Sword, Shield } from 'phosphor-react'
import StatsCard from '@/components/StatsCard'
import StudentsTable from '@/components/StudentsTable'
import Header from '@/components/Header'
import AssignmentProgressChart from '@/components/AssignmentProgressChart'
import { useNamePreference } from '@/contexts/NamePreferenceContext'
import { useTranslations } from 'next-intl'
import { filterValidGrades, calculateGradePercentage } from '@/utils/gradeFilters'
import { Badge, UserBadge } from '@/types/badges'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface DashboardClientProps {
  initialData: {
    students: Student[]
    assignments: Assignment[]
    grades: ConsolidatedGrade[]
    feedback: StudentFeedback[]
    badges: Badge[]
    userBadges: UserBadge[]
  }
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const { students, assignments, grades, feedback, badges, userBadges } = initialData
  const { showRealName } = useNamePreference()

  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const { data: session } = useSession()
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([])

  useEffect(() => {
    if (session?.user?.githubUsername) {
      const currentUserGrades = grades.filter(grade => grade.github_username === session.user.githubUsername)
      const totalPoints = currentUserGrades.reduce((sum, grade) => sum + (grade.points_awarded || 0), 0)
      const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badge_id))

      const newlyUnlockedBadges = badges.filter(badge => {
        return !unlockedBadgeIds.has(badge.id) && totalPoints >= badge.points_required
      })

      if (newlyUnlockedBadges.length > 0) {
        setUnlockedBadges(newlyUnlockedBadges)
        newlyUnlockedBadges.forEach(badge => {
          fetch('/api/badges', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ badgeId: badge.id }),
          })
        })
      }
    }
  }, [session, grades, badges, userBadges])

  // Transform StudentFeedback to Feedback format (only completed feedback)
  // Note: Some records may have id:null - logs added to track this issue
  const feedbackList: Feedback[] = feedback
    .filter((fb): fb is StudentFeedback & { status: 'completed' } => fb.status === 'completed' && !!fb.feedback_for_student)
    .map(fb => ({
      id: `reviewer-${fb.id}`,
      studentId: fb.student_username,
      content: fb.feedback_for_student!,
      read: false,
      createdAt: fb.completed_at || new Date().toISOString()
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // State for feedback dropdown
  const [isFeedbackDropdownOpen, setFeedbackDropdownOpen] = useState(false)
  const [hasUnreadFeedback, setHasUnreadFeedback] = useState(initialData.hasUnreadFeedback)

  // Handlers for feedback dropdown
  const handleToggleFeedbackDropdown = () => {
    setFeedbackDropdownOpen(prev => {
      if (!prev) { // If opening the dropdown
        setHasUnreadFeedback(false); // Mark all as read visually
      }
      return !prev;
    });
  }

  const handleFeedbackRead = () => {
    // This function is a callback for the panel.
    // We can re-fetch the dashboard data or simply turn off the bell.
    // For now, let's assume reading any feedback might clear the "new" status.
    // A more robust solution might check if *any* unread feedback remains.
    setHasUnreadFeedback(false) // Simplistic approach: hide indicator after interaction
  }

  // Filter valid grades using centralized business logic
  const validGrades = filterValidGrades(grades)

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    totalAssignments: assignments.length,
    totalGrades: validGrades.length,
    averageGrade: validGrades.length > 0
      ? Math.round(validGrades.reduce((sum, grade) => {
        const percentage = calculateGradePercentage(grade.points_awarded || 0, grade.points_available || 0)
        return sum + percentage
      }, 0) / validGrades.length)
      : 0
  }

  const lastSync = new Date().toLocaleString('es-ES')

  return (
    <>
      <Header />
      {unlockedBadges.length > 0 && (
        <div className="fixed top-20 right-5 z-50">
          {unlockedBadges.map(badge => (
            <div key={badge.id} className="bg-green-500 text-white p-4 rounded-lg shadow-lg mb-2">
              <h3 className="font-bold">¡Insígnia desbloqueada!</h3>
              <p>Has ganado la insígnia: {badge.name}</p>
            </div>
          ))}
        </div>
      )}
      <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
        {/* Epic LOTR Background */}
        <div className="fixed inset-0 z-0">
          {/* Base gradient - Deep Middle-earth atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>

          {/* Mountain silhouettes */}
          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
            <svg className="absolute bottom-0 left-0 w-full h-64" viewBox="0 0 1200 300" preserveAspectRatio="none">
              <path d="M0,300 L0,200 Q150,150 300,180 Q450,210 600,160 Q750,110 900,140 Q1050,170 1200,120 L1200,300 Z"
                fill="rgba(15, 23, 42, 0.8)" />
              <path d="M0,300 L0,220 Q200,170 400,200 Q600,230 800,180 Q1000,130 1200,160 L1200,300 Z"
                fill="rgba(30, 41, 59, 0.6)" />
            </svg>
          </div>

          {/* Floating particles - like fireflies or magic */}
          <div className="absolute inset-0 overflow-hidden">
            {[
              { left: '15%', top: '20%', delay: '0s', duration: '8s' },
              { left: '35%', top: '60%', delay: '1s', duration: '7s' },
              { left: '75%', top: '30%', delay: '2s', duration: '9s' },
              { left: '60%', top: '80%', delay: '3s', duration: '6s' },
              { left: '20%', top: '70%', delay: '4s', duration: '8s' },
              { left: '80%', top: '15%', delay: '0.5s', duration: '7.5s' },
              { left: '45%', top: '40%', delay: '1.5s', duration: '8.5s' },
              { left: '90%', top: '55%', delay: '2.5s', duration: '6.5s' },
              { left: '25%', top: '90%', delay: '3.5s', duration: '7.8s' },
              { left: '65%', top: '10%', delay: '4.5s', duration: '9.2s' },
              { left: '10%', top: '45%', delay: '0.8s', duration: '8.8s' },
              { left: '85%', top: '75%', delay: '1.8s', duration: '7.2s' },
              { left: '40%', top: '25%', delay: '2.8s', duration: '6.8s' },
              { left: '70%', top: '65%', delay: '3.8s', duration: '9.5s' },
              { left: '30%', top: '85%', delay: '4.8s', duration: '7.7s' }
            ].map((particle, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full animate-drift opacity-60"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration
                }}
              />
            ))}
            {[
              { left: '25%', top: '35%', delay: '0s' },
              { left: '65%', top: '20%', delay: '1s' },
              { left: '45%', top: '70%', delay: '2s' },
              { left: '85%', top: '50%', delay: '3s' },
              { left: '15%', top: '60%', delay: '0.5s' },
              { left: '75%', top: '85%', delay: '1.5s' },
              { left: '35%', top: '15%', delay: '2.5s' },
              { left: '55%', top: '45%', delay: '3.5s' },
              { left: '90%', top: '25%', delay: '1.2s' },
              { left: '10%', top: '80%', delay: '2.7s' }
            ].map((star, i) => (
              <div
                key={`star-${i}`}
                className="absolute w-2 h-2 bg-blue-300 rounded-full animate-glow-pulse opacity-40"
                style={{
                  left: star.left,
                  top: star.top,
                  animationDelay: star.delay,
                }}
              />
            ))}
          </div>

          {/* Epic ring glow effects */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '3s' }}></div>

          {/* Ancient runes pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 text-6xl text-amber-400 font-mono rotate-12 animate-float">⚔</div>
            <div className="absolute top-40 right-32 text-4xl text-blue-400 font-mono -rotate-12 animate-drift">🛡</div>
            <div className="absolute bottom-40 left-32 text-5xl text-green-400 font-mono rotate-45 animate-glow-pulse">🏰</div>
            <div className="absolute bottom-20 right-20 text-3xl text-purple-400 font-mono -rotate-45 animate-float" style={{ animationDelay: '2s' }}>👑</div>
            <div className="absolute top-1/3 left-1/2 text-2xl text-indigo-400 font-mono animate-drift" style={{ animationDelay: '1s' }}>🗡</div>
            <div className="absolute bottom-1/2 right-1/3 text-4xl text-cyan-400 font-mono animate-glow-pulse" style={{ animationDelay: '3s' }}>🧙‍♂️</div>
          </div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="py-18 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center justify-between bg-slate-800/40 backdrop-blur-lg rounded-3xl p-8 border border-slate-600/40 shadow-2xl relative overflow-hidden">
                {/* Subtle overlay to improve readability without blocking background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-slate-800/20 to-slate-900/30 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900/5 via-transparent to-blue-900/5 rounded-3xl"></div>
                <div className="text-center lg:text-left mb-8 lg:mb-0 relative z-10">
                  {/* B4OS Main Branding */}
                  <div className="flex flex-col items-center lg:items-start mb-6 relative">
                    {/* Epic logo with enhanced effects */}
                    <div className="relative mb-4">
                      <div className="absolute -inset-8 bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-600/15 rounded-full blur-2xl opacity-80 animate-glow-pulse"></div>
                      <div className="absolute inset-0 bg-amber-400/50 rounded-full blur-xl animate-glow-pulse"></div>
                      <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <Image
                        src="https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png"
                        alt="B4OS - Bitcoin 4 Open Source"
                        width={96}
                        height={96}
                        className="relative z-10 drop-shadow-2xl animate-float"
                      />
                    </div>

                    {/* Subtitle with crown */}
                    <div className="flex items-center gap-3">
                      <Crown className="h-7 w-7 text-amber-400 drop-shadow-lg animate-glow-pulse" />
                      <h1 className="text-3xl font-bold text-amber-200 drop-shadow-xl relative epic-title">
                        <span className="absolute inset-0 text-amber-500 blur-sm opacity-40">{t('title')}</span>
                        <span className="relative font-bold">{t('title')}</span>
                      </h1>
                    </div>
                  </div>
                  <p className="text-xl text-slate-300 mb-4 font-medium">{tc('dashboard')} {t('subtitle')}</p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-400">
                    <span className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      {t('lastSync')}: {lastSync}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/50 shadow-2xl relative overflow-hidden z-10">
                  {/* Enhanced glass effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-md"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-blue-500/5"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                  <div className="relative z-10">
                    <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                      <Shield className="h-7 w-7 text-amber-400 drop-shadow-lg" />
                      <span className="text-amber-200 kingdom-text drop-shadow-lg">{t('kingdomStatus')}</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-4 px-5 bg-slate-700/60 rounded-xl border border-slate-500/40 backdrop-blur-sm hover:bg-slate-600/60 transition-all duration-300 shadow-lg">
                        <span className="text-slate-100 font-semibold">{t('activeInhabitants')}:</span>
                        <span className="text-amber-300 font-bold text-2xl ml-4 drop-shadow-lg">{stats.totalStudents}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 px-5 bg-slate-700/60 rounded-xl border border-slate-500/40 backdrop-blur-sm hover:bg-slate-600/60 transition-all duration-300 shadow-lg">
                        <span className="text-slate-100 font-semibold">{t('availableAdventures')}:</span>
                        <span className="text-blue-300 font-bold text-2xl ml-4 drop-shadow-lg">{stats.totalAssignments}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 px-5 bg-slate-700/60 rounded-xl border border-slate-500/40 backdrop-blur-sm hover:bg-slate-600/60 transition-all duration-300 shadow-lg">
                        <span className="text-slate-100 font-semibold">{t('acceptedAdventures')}:</span>
                        <span className="text-green-300 font-bold text-2xl ml-4 drop-shadow-lg">{stats.totalGrades}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title={`${tc('students')} ${t('middleEarthInhabitants')}`}
                value={stats.totalStudents}
                icon={Users}
                color="blue"
                descriptionKey="inhabitants"
              />
              <StatsCard
                title={t('epicAdventures')}
                value={stats.totalAssignments}
                icon={Sword}
                color="green"
                descriptionKey="missions"
              />
              <StatsCard
                title={t('acceptedChallenges')}
                value={stats.totalGrades}
                icon={Shield}
                color="purple"
                descriptionKey="challenges"
              />
              <StatsCard
                title={t('kingdomGlory')}
                value={`${stats.averageGrade}%`}
                icon={Crown}
                color="orange"
                descriptionKey="kingdomGlory"
              />
            </div>

        {/* Assignment Progress Chart */}
        <div className="mb-8">
          <AssignmentProgressChart data={assignmentProgressData} />
        </div>

            {/* Students Table */}
            <StudentsTable
              students={students}
              assignments={assignments}
              grades={grades}
              feedback={feedback}
              showRealNames={showRealName}
              averageGrade={stats.averageGrade}
              badges={badges}
              userBadges={userBadges}
            />
          </div>
        </div>
      </div>
    </>
  )
}

