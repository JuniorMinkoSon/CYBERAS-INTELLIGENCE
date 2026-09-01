import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { apiClient } from '../services/apiClient'

interface AuthUser {
  email: string
  role: 'rssi' | 'auditeur' | 'admin'
  name: string
  token: string
  organization?: string
  organizationId?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        if (parsed.token) {
          apiClient.setToken(parsed.token)
        }
      } catch (e) {
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<any>('/auth/login', { email, password })
      const newUser: AuthUser = {
        email,
        token: response.token,
        role: response.role || 'auditeur',
        name: response.name || email.split('@')[0],
        organization: response.organization,
        organizationId: response.organizationId,
      }
      setUser(newUser)
      apiClient.setToken(response.token)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } catch (err: any) {
      const message = err.message || 'Erreur de connexion'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, role: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<any>('/auth/register', { email, password, role })
      const newUser: AuthUser = {
        email,
        token: response.token,
        role: response.role || role,
        name: response.name || email.split('@')[0],
        organization: response.organization,
        organizationId: response.organizationId,
      }
      setUser(newUser)
      apiClient.setToken(response.token)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } catch (err: any) {
      const message = err.message || 'Erreur d\'inscription'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
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
