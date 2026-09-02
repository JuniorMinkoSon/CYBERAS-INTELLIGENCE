import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { apiClient } from '../services/apiClient'

export type SystemRole = 'ADMIN' | 'RSSI' | 'AUDITOR' | 'VIEWER'

export interface AuthUser {
  userId: string
  email: string
  name: string
  role: SystemRole
  token: string
  refreshToken?: string
  organizationId: string
  organization: string
}

interface AuthResponse {
  accessToken: string
  refreshToken?: string
  userId: string
  email: string
  role: string
  organizationId: string
  organizationName: string
  displayName?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (organizationName: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'auth_user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizeRole(role: string | undefined): SystemRole {
  const upper = (role ?? '').toUpperCase()
  if (upper === 'ADMIN' || upper === 'RSSI' || upper === 'AUDITOR' || upper === 'VIEWER') return upper
  return 'VIEWER'
}

function toAuthUser(response: AuthResponse): AuthUser {
  return {
    userId: response.userId,
    email: response.email,
    name: response.displayName || response.email.split('@')[0],
    role: normalizeRole(response.role),
    token: response.accessToken,
    refreshToken: response.refreshToken,
    organizationId: response.organizationId,
    organization: response.organizationName,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser
        if (parsed.token && parsed.organizationId) {
          setUser(parsed)
          apiClient.setToken(parsed.token)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const persist = (response: AuthResponse) => {
    const authUser = toAuthUser(response)
    setUser(authUser)
    apiClient.setToken(authUser.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      persist(await apiClient.post<AuthResponse>('/auth/login', { email, password }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    organizationName: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      persist(
        await apiClient.post<AuthResponse>('/auth/register', {
          organizationName,
          email,
          password,
          firstName,
          lastName,
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('authToken')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
