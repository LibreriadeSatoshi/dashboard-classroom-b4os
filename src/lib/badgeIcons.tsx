import { Trophy, Heart, Sword, Shield, Crown, Tree, Cookie } from 'phosphor-react'
import { ReactNode } from 'react'

/**
 * Get a phosphor-react icon component based on badge icon name
 * @param iconName - The icon identifier (cookie, heart, sword, tree, shield, crown)
 * @param size - The size of the icon (default: 20)
 * @returns ReactNode - The phosphor-react icon component
 */
export function getBadgeIcon(iconName: string, size: number = 20): ReactNode {
  const iconProps = { size }
  
  switch (iconName) {
    case 'cookie':
      return <Cookie {...iconProps} className="text-amber-600" weight="fill" />
    case 'heart':
      return <Heart {...iconProps} className="text-rose-500" weight="fill" />
    case 'sword':
      return <Sword {...iconProps} className="text-emerald-500" weight="duotone" />
    case 'tree':
      return <Tree {...iconProps} className="text-green-500" weight="fill" />
    case 'shield':
      return <Shield {...iconProps} className="text-gray-500" weight="duotone" />
    case 'crown':
      return <Crown {...iconProps} className="text-amber-500" weight="fill" />
    default:
      return <Trophy {...iconProps} className="text-amber-500" />
  }
}
