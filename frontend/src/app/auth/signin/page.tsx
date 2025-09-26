'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass } from 'phosphor-react'
import Image from 'next/image'

export default function SignIn() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      if (session) {
        router.push('/')
      }
    })
  }, [router])

  const handleSignIn = async () => {
    await signIn('github', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex items-center justify-center">
      {/* Epic LOTR Background - Reused from main page */}
      <div className="fixed inset-0 z-0">
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

        {/* Floating particles */}
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
        </div>

        {/* Epic glow effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl animate-glow-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-600/40 shadow-2xl">
          <div className="text-center">
            {/* Logo */}
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-600/15 rounded-full blur-2xl opacity-80 animate-glow-pulse"></div>
              <div className="relative bg-white rounded-2xl p-4 mx-auto w-20 h-20 flex items-center justify-center shadow-2xl">
                <Image 
                  src="https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png" 
                  alt="B4OS - Bitcoin 4 Open Source" 
                  width={48}
                  height={48}
                  className="relative z-10 drop-shadow-lg"
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2 epic-title">
              B4OS Dashboard
            </h1>
            <p className="text-slate-300 mb-2">Programa Bitcoin 4 Open Source</p>

            {/* Description */}
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              "Bienvenido al Reino del Código Abierto. 
              Solo los miembros de la hermandad pueden acceder a estas tierras."
            </p>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 group"
            >
              <MagnifyingGlass size={20} className="group-hover:scale-110 transition-transform" />
              Sign In
            </button>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -10px) rotate(90deg); }
          50% { transform: translate(-5px, 5px) rotate(180deg); }
          75% { transform: translate(-10px, -5px) rotate(270deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-drift {
          animation: drift 8s ease-in-out infinite;
        }
        .animate-glow-pulse {
          animation: glow-pulse 4s ease-in-out infinite;
        }
        .epic-title {
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        }
      `}</style>
    </div>
  )
}