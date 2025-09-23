'use client'

import React from 'react'
import { generateAnonymousId, getAvatarColor } from '@/utils/anonymization'

interface LOTRAvatarProps {
  githubUsername: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm', 
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base'
}

// SVG Icons for different races/locations
const getAvatarIcon = (anonymousId: string): string => {
  const id = anonymousId.toLowerCase()
  
  // Hobbits - Round door theme
  if (id.includes('hobbit') || id.includes('shire')) {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="15" cy="12" r="1"/>
        <path d="M8 12h8M12 8v8"/>
      </svg>
    `
  }
  
  // Elves - Pointed leaf theme
  if (id.includes('elf') || id.includes('rivendell') || id.includes('lothlorien') || 
      id.includes('mirkwood') || id.includes('dol') || id.includes('cair')) {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8 6 8 12 12 16C16 12 16 6 12 2z"/>
        <path d="M12 16L8 20C10 20 12 18 12 16z"/>
        <path d="M12 16L16 20C14 20 12 18 12 16z"/>
        <path d="M12 8L10 10L12 12L14 10L12 8z" fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>
    `
  }
  
  // Dwarves - Hammer/Pickaxe theme
  if (id.includes('dwarf') || id.includes('moria') || id.includes('erebor') || 
      id.includes('dale') || id.includes('esgaroth') || id.includes('smith')) {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="10" y="2" width="4" height="8"/>
        <rect x="8" y="8" width="8" height="3"/>
        <rect x="11" y="11" width="2" height="11"/>
        <path d="M6 14L12 8L18 14L12 20L6 14z" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `
  }
  
  // Rangers/Kings - Crown theme  
  if (id.includes('ranger') || id.includes('king') || id.includes('gondor') || id.includes('lord') || 
      id.includes('captain') || id.includes('prince') || id.includes('duke') || id.includes('earl') || 
      id.includes('baron') || id.includes('steward') || id.includes('minastirith') || id.includes('osgiliath')) {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 14L7 10L9 14L12 8L15 14L17 10L19 14V18H5V14z"/>
        <circle cx="7" cy="10" r="1"/>
        <circle cx="12" cy="8" r="1"/>
        <circle cx="17" cy="10" r="1"/>
        <rect x="5" y="18" width="14" height="2"/>
      </svg>
    `
  }
  
  // Wizards - Pointed hat theme
  if (id.includes('wizard') || id.includes('mage') || id.includes('isengard') || 
      id.includes('orthanc') || id.includes('barad')) {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L8 18H16L12 2z"/>
        <ellipse cx="12" cy="18" rx="6" ry="2"/>
        <path d="M12 6L10 8L12 10L14 8L12 6z" fill="none" stroke="currentColor" stroke-width="1"/>
        <circle cx="15" cy="5" r="1" fill="currentColor"/>
      </svg>
    `
  }
  
  // Riders/Warriors - Shield theme
  if (id.includes('rider') || id.includes('warrior') || id.includes('rohan') || id.includes('knight') ||
      id.includes('guardian') || id.includes('archer') || id.includes('scout') || id.includes('warden') ||
      id.includes('edoras') || id.includes('helm') || id.includes('dunharrow')) {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 6V12C4 18 8 22 12 22C16 22 20 18 20 12V6L12 2z"/>
        <path d="M12 6L8 10L12 14L16 10L12 6z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 10H14M11 12H13" stroke="currentColor" stroke-width="1"/>
      </svg>
    `
  }
  
  // Travelers/Merchants - Compass/Path theme
  if (id.includes('bree') || id.includes('weathertop') || id.includes('fangorn') || 
      id.includes('pelennor') || id.includes('healer') || id.includes('bard')) {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M12 4L14 10L12 16L10 10L12 4z" fill="currentColor"/>
        <path d="M4 12L10 14L16 12L10 10L4 12z" fill="currentColor"/>
        <circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>
    `
  }
  
  // Default - One Ring theme (without text)
  return `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <path d="M12 4L13 6L12 8L11 6L12 4z" fill="currentColor"/>
      <path d="M12 16L13 18L12 20L11 18L12 16z" fill="currentColor"/>
      <path d="M4 12L6 13L8 12L6 11L4 12z" fill="currentColor"/>
      <path d="M16 12L18 13L20 12L18 11L16 12z" fill="currentColor"/>
    </svg>
  `
}

export default function LOTRAvatar({ 
  githubUsername, 
  size = 'md', 
  className = '' 
}: LOTRAvatarProps) {
  const anonymousId = generateAnonymousId(githubUsername)
  const avatarColors = getAvatarColor(anonymousId)
  const icon = getAvatarIcon(anonymousId)
  
  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        bg-gradient-to-br 
        ${avatarColors.from} 
        ${avatarColors.to} 
        flex 
        items-center 
        justify-center 
        text-white 
        shadow-md 
        ring-2 
        ring-white 
        ${className}
      `}
      title={`${anonymousId} - Avatar temático de LOTR`}
    >
      <div 
        className="w-3/4 h-3/4 opacity-90"
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    </div>
  )
}
