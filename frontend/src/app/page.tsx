'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase, type Student, type Assignment, type ConsolidatedGrade } from '@/lib/supabase'
import { Users, BookOpen, Medal, TrendUp, Crown, Sword, Shield } from 'phosphor-react'
import StatsCard from '@/components/StatsCard'
import StudentsTable from '@/components/StudentsTable'

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [grades, setGrades] = useState<ConsolidatedGrade[]>([])
  const [lastSync, setLastSync] = useState<string>('')

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [studentsResult, assignmentsResult, gradesResult] = await Promise.all([
        supabase.from('students').select('*').order('github_username'),
        supabase.from('assignments').select('*').order('name'),
        supabase.from('consolidated_grades').select('*').order('github_username')
      ])

      if (studentsResult.error) throw studentsResult.error
      if (assignmentsResult.error) throw assignmentsResult.error
      if (gradesResult.error) throw gradesResult.error

      setStudents(studentsResult.data || [])
      setAssignments(assignmentsResult.data || [])
      setGrades(gradesResult.data || [])
      
      setLastSync(new Date().toLocaleString('es-ES'))
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Calculate statistics with proper percentage calculation
  const calculatePercentage = (pointsAwarded: number, pointsAvailable: number) => {
    if (pointsAvailable > 0) {
      return (pointsAwarded / pointsAvailable) * 100
    } else if (pointsAwarded > 0) {
      return 100 // Si hay puntos otorgados pero no disponibles, considerar 100%
    }
    return 0
  }

  const validGrades = grades.filter(grade => {
    const pointsAwarded = grade.points_awarded || 0
    const pointsAvailable = grade.points_available || 0
    return pointsAwarded > 0 || pointsAvailable > 0
  })

  const stats = {
    totalStudents: students.length,
    totalAssignments: assignments.length,
    totalGrades: validGrades.length,
    averageGrade: validGrades.length > 0 
      ? Math.round(validGrades.reduce((sum, grade) => {
          const percentage = calculatePercentage(grade.points_awarded || 0, grade.points_available || 0)
          return sum + percentage
        }, 0) / validGrades.length)
      : 0
  }

  useEffect(() => {
    fetchData()
  }, [])


  return (
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
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400 rounded-full animate-drift opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-2 h-2 bg-blue-300 rounded-full animate-glow-pulse opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        {/* Epic ring glow effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl animate-glow-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* Ancient runes pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 text-6xl text-amber-400 font-mono rotate-12 animate-float">⚔</div>
          <div className="absolute top-40 right-32 text-4xl text-blue-400 font-mono -rotate-12 animate-drift">🛡</div>
          <div className="absolute bottom-40 left-32 text-5xl text-green-400 font-mono rotate-45 animate-glow-pulse">🏰</div>
          <div className="absolute bottom-20 right-20 text-3xl text-purple-400 font-mono -rotate-45 animate-float" style={{animationDelay: '2s'}}>👑</div>
          <div className="absolute top-1/3 left-1/2 text-2xl text-indigo-400 font-mono animate-drift" style={{animationDelay: '1s'}}>🗡</div>
          <div className="absolute bottom-1/2 right-1/3 text-4xl text-cyan-400 font-mono animate-glow-pulse" style={{animationDelay: '3s'}}>🧙‍♂️</div>
        </div>
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-16 relative">
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
                  <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
                  <Image 
                    src="/web-app-manifest-192x192.png" 
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
                    <span className="absolute inset-0 text-amber-500 blur-sm opacity-40">Consejo de la Tierra Media</span>
                    <span className="relative font-bold">Consejo de la Tierra Media</span>
                  </h1>
                </div>
              </div>
              <p className="text-xl text-slate-300 mb-4 font-medium">Dashboard de Aventuras y Logros del Reino</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Última sync: {lastSync || 'Nunca'}
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
                  <span className="text-amber-200 kingdom-text drop-shadow-lg">Estado del Reino</span>
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 px-5 bg-slate-700/60 rounded-xl border border-slate-500/40 backdrop-blur-sm hover:bg-slate-600/60 transition-all duration-300 shadow-lg">
                    <span className="text-slate-100 font-semibold">Habitantes activos:</span>
                    <span className="text-amber-300 font-bold text-2xl ml-4 drop-shadow-lg">{stats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-5 bg-slate-700/60 rounded-xl border border-slate-500/40 backdrop-blur-sm hover:bg-slate-600/60 transition-all duration-300 shadow-lg">
                    <span className="text-slate-100 font-semibold">Aventuras disponibles:</span>
                    <span className="text-blue-300 font-bold text-2xl ml-4 drop-shadow-lg">{stats.totalAssignments}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 px-5 bg-slate-700/60 rounded-xl border border-slate-500/40 backdrop-blur-sm hover:bg-slate-600/60 transition-all duration-300 shadow-lg">
                    <span className="text-slate-100 font-semibold">Aventuras aceptadas:</span>
                    <span className="text-green-300 font-bold text-2xl ml-4 drop-shadow-lg">{stats.totalGrades}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Habitantes de la Tierra Media"
            value={stats.totalStudents}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Aventuras Épicas"
            value={stats.totalAssignments}
            icon={Sword}
            color="green"
          />
          <StatsCard
            title="Desafíos Aceptados/En-Progreso"
            value={stats.totalGrades}
            icon={Shield}
            color="purple"
          />
          <StatsCard
            title="Gloria del Reino"
            value={`${stats.averageGrade}%`}
            icon={Crown}
            color="orange"
          />
        </div>


        {/* Students Table */}
        <StudentsTable 
          students={students}
          assignments={assignments}
          grades={grades}
        />
      </div>
      </div>
    </div>
  )
}