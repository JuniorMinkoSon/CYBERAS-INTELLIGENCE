class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    // En développement, '/api' passe par le proxy Vite vers le backend local.
    // En production le frontend est servi par Vercel et le backend par Render :
    // les deux origines diffèrent, VITE_API_URL doit donc porter l'URL absolue
    // du backend, suffixe /api compris.
    this.baseUrl = import.meta.env.VITE_API_URL || '/api'
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        try {
          const user = JSON.parse(stored)
          this.token = user.token
        } catch (e) {
          // Invalid storage, ignore
        }
      }
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('authToken')
      window.location.href = '/login'
      throw new Error('Unauthorized - redirecting to login')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new ApiError(response.status, errorData.error || response.statusText)
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(this.baseUrl + path, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    })
    return this.handleResponse(response)
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const response = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse(response)
  }

  async put<T>(path: string, body?: any): Promise<T> {
    const response = await fetch(this.baseUrl + path, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse(response)
  }

  async patch<T>(path: string, body?: any): Promise<T> {
    const response = await fetch(this.baseUrl + path, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse(response)
  }

  async delete<T>(path: string): Promise<T | null> {
    const response = await fetch(this.baseUrl + path, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    return this.handleResponse(response)
  }

  async uploadFile<T>(path: string, file: File, description?: string): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }

    const headers: Record<string, string> = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers,
      body: formData,
    })
    return this.handleResponse(response)
  }

  async downloadFile(path: string): Promise<Blob> {
    const response = await fetch(this.baseUrl + path, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (response.status === 401) {
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText)
    }

    return response.blob()
  }
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const apiClient = new ApiClient()
