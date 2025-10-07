'use client'

import { Icon } from 'phosphor-react'
import { useTranslations } from 'next-intl'

interface StatsCardProps {
  title: string
  value: string | number
  icon: Icon
  color: 'blue' | 'green' | 'purple' | 'orange'
  descriptionKey: 'students' | 'inhabitants' | 'missions' | 'challenges' | 'kingdomGlory'
}

const colorClasses = {
  blue: 'text-gray-600 bg-gray-100',
  green: 'text-gray-600 bg-gray-100',
  purple: 'text-gray-600 bg-gray-100',
  orange: 'text-gray-600 bg-gray-100'
}

export default function StatsCard({ title, value, icon: Icon, color, descriptionKey }: StatsCardProps) {
  const t = useTranslations('stats')

  const getDescription = (key: string, value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value
    const isPlural = numValue !== 1

    switch (key) {
      case 'students':
        return `${value} ${isPlural ? t('studentsDescPlural') : t('studentsDesc')}`
      case 'inhabitants':
        return `${value} ${isPlural ? t('inhabitantsDescPlural') : t('inhabitantsDesc')}`
      case 'missions':
        return `${value} ${isPlural ? t('missionsDescPlural') : t('missionsDesc')}`
      case 'challenges':
        return `${value} ${isPlural ? t('challengesDescPlural') : t('challengesDesc')}`
      case 'kingdomGlory':
        return t('kingdomGloryDesc')
      default:
        return t('systemMetricsDesc')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[1]} shadow-sm`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[0]}`} weight="duotone" />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{getDescription(descriptionKey, value)}</p>
      </div>
    </div>
  )
}
