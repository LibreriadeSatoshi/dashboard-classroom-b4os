'use client'

import { Heart, GithubLogo, TwitterLogo, LinkedinLogo, Envelope, DiscordLogo, FacebookLogo } from 'phosphor-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const t = useTranslations('footer')


  return (
    <footer className="relative bg-slate-900 border-t border-slate-700/50 overflow-hidden">
      {/* Epic background effects */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-linear-to-r from-amber-900/5 via-transparent to-blue-900/5"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { id: 'particle-1', left: '20%', top: '30%', delay: '0s', duration: '3s' },
          { id: 'particle-2', left: '60%', top: '70%', delay: '1s', duration: '4s' },
          { id: 'particle-3', left: '80%', top: '20%', delay: '2s', duration: '3.5s' },
          { id: 'particle-4', left: '30%', top: '80%', delay: '0.5s', duration: '4.5s' },
          { id: 'particle-5', left: '70%', top: '40%', delay: '1.5s', duration: '2.5s' },
          { id: 'particle-6', left: '10%', top: '60%', delay: '2.5s', duration: '3.8s' },
          { id: 'particle-7', left: '90%', top: '50%', delay: '0.8s', duration: '4.2s' },
          { id: 'particle-8', left: '40%', top: '15%', delay: '1.8s', duration: '3.2s' }
        ].map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-30"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* B4OS Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg blur-lg animate-pulse" style={{ backgroundColor: '#f7931a33' }}></div>
                <Image 
                  src="https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png" 
                  alt="B4OS Logo"
                  width={62} 
                  height={62} 
                  className="relative z-10 rounded-lg"
                />
              </div>            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              <strong style={{ color: '#f7931a' }}>Bitcoin 4 Open Source</strong> - 
              {t('program')}
            </p>
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold kingdom-text" style={{ color: '#f7931a' }}>{t('contact')}</h4>
            <div className="space-y-3">
              <a 
                href="mailto:hola@b4os.dev"
                className="flex items-center gap-2 text-slate-300 hover:text-[#f7931a] transition-colors duration-200 text-sm"
              >
                <Envelope className="h-4 w-4" style={{ color: '#f7931a' }} />
                hola@b4os.dev
              </a>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.facebook.com/libsatoshi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#f7931a] transition-colors duration-200"
                  aria-label="Facebook B4OS"
                >
                  <FacebookLogo className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/libdesatoshi/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#f7931a] transition-colors duration-200"
                  aria-label="LinkedIn B4OS"
                >
                  <LinkedinLogo className="h-5 w-5" />
                </a>
                <a 
                  href="https://x.com/libdesatoshi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#f7931a] transition-colors duration-200"
                  aria-label="Twitter B4OS"
                >
                  <TwitterLogo className="h-5 w-5" />
                </a>
                <a 
                  href="https://github.com/LibreriadeSatoshi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#f7931a] transition-colors duration-200"
                  aria-label="GitHub B4OS"
                >
                  <GithubLogo className="h-5 w-5" />
                </a>
                <a 
                  href="https://discord.gg/MSrtGYf4Jh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#f7931a] transition-colors duration-200"
                  aria-label="Discord B4OS"
                >
                  <DiscordLogo className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>© {currentYear}</span>
              <span className="font-semibold" style={{ color: '#f7931a' }}>B4OS</span>
              <span>(Bitcoin 4 Open Source)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>{t('made')}</span>
              <Heart className="h-4 w-4 text-red-400 animate-pulse" weight="fill" />
              <span>{t('made-continue')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
