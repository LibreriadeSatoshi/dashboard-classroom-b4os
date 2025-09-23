import { Icon } from 'phosphor-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: Icon
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  blue: 'text-gray-600 bg-gray-100',
  green: 'text-gray-600 bg-gray-100',
  purple: 'text-gray-600 bg-gray-100',
  orange: 'text-gray-600 bg-gray-100'
}

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const getEmoji = (title: string) => {
    switch (title) {
      case 'Estudiantes': return '👥'
      case 'Habitantes de la Tierra Media': return '🏰'
      case 'Challenges liberados': return '📚'
      case 'Aventuras Épicas': return '⚔️'
      case 'Challenges resueltos/en-progreso': return '🎓'
      case 'Logros Conseguidos': return '🏆'
      case 'Promedio': return '📊'
      case 'Gloria del Reino': return '👑'
      default: return '🎯'
    }
  }

  const getDescription = (title: string, value: string | number) => {
    switch (title) {
      case 'Estudiantes': return `${value} desarrolladores en formación`
      case 'Habitantes de la Tierra Media': return `${value} aventurero${value !== 1 ? 's' : ''} en el reino`
      case 'Challenges liberados': return `${value} challenge${value !== 1 ? 's' : ''} activo${value !== 1 ? 's' : ''}`
      case 'Aventuras Épicas': return `${value} misión${value !== 1 ? 'es' : ''} disponible${value !== 1 ? 's' : ''}`
      case 'Challenges resueltos/en-progreso': return `${value} evaluación${value !== 1 ? 'es' : ''} completada${value !== 1 ? 's' : ''}`
      case 'Logros Conseguidos': return `${value} hazaña${value !== 1 ? 's' : ''} completada${value !== 1 ? 's' : ''}`
      case 'Promedio': return `Rendimiento general del curso`
      case 'Gloria del Reino': return `Honor y prestigio del reino`
      default: return 'Métrica del sistema'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[1]} shadow-sm`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[0]}`} weight="duotone" />
        </div>
        <span className="text-2xl">{getEmoji(title)}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{getDescription(title, value)}</p>
      </div>
    </div>
  )
}
