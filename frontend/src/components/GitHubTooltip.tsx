'use client'

import { useState, useEffect, useRef } from 'react'
import { GithubLogo, Calendar } from 'phosphor-react'
import GitHubAvatar from './GitHubAvatar'

interface GitHubTooltipProps {
  username: string
  isVisible: boolean
  position: { x: number; y: number }
}

interface GitHubProfile {
  login: string
  name: string
  bio: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  avatar_url: string
  html_url: string
}

interface GitHubEvent {
  id: string
  type: string
  repo: {
    name: string
    url: string
  }
  created_at: string
  payload?: {
    commits?: Array<{
      message: string
      url: string
    }>
  }
}

// Cache global para evitar llamadas repetidas
const profileCache = new Map<string, { data: GitHubProfile; timestamp: number }>()
const eventsCache = new Map<string, { data: GitHubEvent[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export default function GitHubTooltip({ username, isVisible, position }: GitHubTooltipProps) {
  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && username) {
      fetchGitHubData()
    }
  }, [isVisible, username])

  const fetchGitHubData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Verificar cache para profile
      const cachedProfile = profileCache.get(username)
      if (cachedProfile && Date.now() - cachedProfile.timestamp < CACHE_DURATION) {
        setProfile(cachedProfile.data)
      } else {
        const profileData = await fetchWithRetry<GitHubProfile>(`https://api.github.com/users/${username}`)
        setProfile(profileData)
        profileCache.set(username, { data: profileData, timestamp: Date.now() })
      }

      // Verificar cache para events
      const cachedEvents = eventsCache.get(username)
      if (cachedEvents && Date.now() - cachedEvents.timestamp < CACHE_DURATION) {
        setEvents(cachedEvents.data)
      } else {
        try {
          const eventsData = await fetchWithRetry<GitHubEvent[]>(`https://api.github.com/users/${username}/events?per_page=10`)
          // Filter for PushEvents and PullRequestEvents
          const contributionEvents = eventsData.filter(event => 
            event.type === 'PushEvent' || event.type === 'PullRequestEvent'
          )
          setEvents(contributionEvents.slice(0, 5)) // Show top 5 contributions
          eventsCache.set(username, { data: contributionEvents.slice(0, 5), timestamp: Date.now() })
        } catch (eventsError) {
          console.warn('No se pudieron cargar los eventos:', eventsError)
          // Continuar sin eventos - el perfil es suficiente
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'B4OS-Dashboard/1.0',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })

        // Manejar diferentes códigos de estado
        if (response.status === 404) {
          throw new Error('Usuario no encontrado')
        }
        
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
          const rateLimitReset = response.headers.get('X-RateLimit-Reset')
          
          if (rateLimitRemaining === '0' && rateLimitReset) {
            const resetTime = new Date(parseInt(rateLimitReset) * 1000)
            const waitTime = resetTime.getTime() - Date.now() + 1000 // +1 segundo de buffer
            throw new Error(`Límite de API alcanzado. Intenta después de ${new Date(resetTime).toLocaleTimeString()}`)
          }
          
          if (i < retries) {
            // Esperar antes del reintento
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
            continue
          }
          throw new Error('Límite de API alcanzado')
        }

        if (response.status === 422) {
          throw new Error('Username inválido')
        }

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        if (i === retries) throw error
        // Esperar antes del reintento con backoff exponencial
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
    throw new Error('Máximo de reintentos alcanzado')
  }

  if (!isVisible) return null

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm w-80"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Cargando...</span>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      ) : profile ? (
        <div className="space-y-3">
          {/* Profile Header */}
          <div className="flex items-center gap-3">
            <GitHubAvatar 
              username={profile.login} 
              size="lg"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{profile.name || profile.login}</h3>
              <p className="text-sm text-gray-600">@{profile.login}</p>
            </div>
            <a
              href={profile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <GithubLogo className="h-4 w-4" />
            </a>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-700 line-clamp-2">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-gray-900">{profile.public_repos}</div>
              <div className="text-xs text-gray-600">Repos</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-gray-900">{profile.followers}</div>
              <div className="text-xs text-gray-600">Followers</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-gray-900">{profile.following}</div>
              <div className="text-xs text-gray-600">Following</div>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>Miembro desde {new Date(profile.created_at).getFullYear()}</span>
          </div>

          {/* Recent Contributions */}
          {events.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Contribuciones recientes</h4>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <a
                          href={`https://github.com/${event.repo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm truncate block"
                        >
                          {event.repo.name}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            event.type === 'PushEvent' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {event.type === 'PushEvent' ? 'Push' : 'Pull Request'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(event.created_at).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                        {event.payload?.commits && event.payload.commits.length > 0 && (
                          <p className="text-gray-600 text-xs mt-1 line-clamp-1">
                            {event.payload.commits[0].message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
