'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Shield, Warning, XCircle } from 'phosphor-react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: '¡Acceso Denegado!',
          message: 'Solo los miembros del Consejo de la Tierra Media y los aprendices de la hermandad pueden acceder a estas tierras.',
          icon: Shield,
          iconColor: 'text-red-500'
        }
      case 'Configuration':
        return {
          title: 'El Reino se Ha Corrompido',
          message: 'Algo oscuro ha perturbado la magia del sistema. Los sabios del Consejo deben ser notificados de esta falla.',
          icon: Warning,
          iconColor: 'text-orange-500'
        }
      default:
        return {
          title: 'La Sombra se Extiende',
          message: 'Un mal presagio ha interrumpido tu viaje. El poder oscuro interfiere con la autenticación. Intenta nuevamente, valiente aventurero.',
          icon: XCircle,
          iconColor: 'text-red-600'
        }
    }
  }

  const getBackgroundColor = (iconColor: string) => {
    if (iconColor === 'text-red-500') return 'bg-red-100'
    if (iconColor === 'text-orange-500') return 'bg-orange-100'
    return 'bg-red-100'
  }

  const errorInfo = getErrorMessage(error)
  const bgColor = getBackgroundColor(errorInfo.iconColor)

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex items-center justify-center">
      {/* Background similar to signin */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/8 rounded-full blur-3xl animate-glow-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-orange-500/8 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Error Card */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 border border-red-600/40 shadow-2xl">
          <div className="text-center">
            {/* Icon */}
            <div className="relative mb-6">
              <div className={`absolute -inset-4 bg-linear-to-r from-red-500/15 via-orange-400/10 to-red-600/15 rounded-full blur-2xl opacity-80 animate-glow-pulse`}></div>
              <div className={`relative rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center shadow-2xl ${bgColor}`}>
                <errorInfo.icon size={32} className={errorInfo.iconColor} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-4 epic-title">
              {errorInfo.title}
            </h1>

            {/* Message */}
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
              {errorInfo.message}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full bg-linear-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
              >
                Intentar el Cruce
              </Link>

              <div className="text-slate-400 text-xs">
                <p>¿Eres un miembro del Consejo?</p>
                <p className="mt-1">Contacta a los sabios del Reino para obtener acceso</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 4s ease-in-out infinite;
        }
        .epic-title {
          text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
        }
      `}</style>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}