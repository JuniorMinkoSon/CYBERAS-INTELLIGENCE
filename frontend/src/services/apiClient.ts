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

  /**
   * Un 401 signifie « session expirée » partout, sauf sur les appels
   * d'authentification eux-mêmes : là, il signifie « mauvais identifiants ».
   * Rediriger vers /login dans ce cas rechargeait la page de connexion sous
   * les yeux de l'utilisateur, qui ne voyait jamais pourquoi sa tentative
   * avait échoué. Ces appels laissent l'erreur remonter au formulaire.
   */
  private isAuthAttempt(path: string): boolean {
    return /^\/auth\/(login|register|refresh|accept-invitation)\b/.test(path)
  }

  private async handleResponse(response: Response, path = '') {
    if (response.status === 401 && !this.isAuthAttempt(path)) {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('authToken')
      window.location.href = '/login'
      throw new Error('Unauthorized - redirecting to login')
    }

    // Réponse HTML là où du JSON est attendu : l'appel n'a pas atteint l'API.
    //
    // En production, le frontend et le backend vivent sur deux origines. Quand
    // VITE_API_URL n'est pas renseignée, les appels partent vers /api sur le
    // domaine du frontend, où la réécriture SPA rend index.html. Le client
    // recevait alors une page HTML, échouait à l'analyser, et n'affichait qu'un
    // « load failed » qui ne désignait rien.
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('text/html')) {
      throw new ApiError(
        response.status,
        "L'API est injoignable : la réponse reçue est une page HTML, pas des données. "
          + "Vérifiez que VITE_API_URL pointe vers le backend."
      )
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new ApiError(response.status, messageFrom(body, response.statusText))
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  /**
   * Rafraîchissement du jeton d'accès.
   *
   * Le jeton d'accès vit une heure ; le jeton de rafraîchissement, sept
   * jours. Sur un 401 hors authentification, on tente une fois d'obtenir un
   * nouveau jeton d'accès puis on rejoue la requête. Si le rafraîchissement
   * échoue à son tour, la session est réellement finie : on la ferme.
   *
   * Un seul rafraîchissement à la fois : dix requêtes qui expirent ensemble
   * ne doivent pas déclencher dix appels — elles attendent le même.
   */
  private refreshing: Promise<boolean> | null = null

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshing) return this.refreshing
    this.refreshing = (async () => {
      try {
        const stored = localStorage.getItem('auth_user')
        const refreshToken = stored ? (JSON.parse(stored) as { refreshToken?: string }).refreshToken : undefined
        if (!refreshToken) return false
        const response = await fetch(this.baseUrl + '/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!response.ok) return false
        const data = (await response.json()) as { accessToken?: string }
        if (!data.accessToken) return false
        this.setToken(data.accessToken)
        const user = stored ? JSON.parse(stored) : {}
        localStorage.setItem('auth_user', JSON.stringify({ ...user, token: data.accessToken }))
        return true
      } catch {
        return false
      } finally {
        this.refreshing = null
      }
    })()
    return this.refreshing
  }

  private async send<T>(method: string, url: string, path: string, body?: any): Promise<T> {
    const doFetch = () =>
      fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })

    let response = await doFetch()
    if (response.status === 401 && !this.isAuthAttempt(path) && (await this.tryRefresh())) {
      response = await doFetch()
    }
    return this.handleResponse(response, path)
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
    return this.send('GET', url.toString(), path)
  }

  async post<T>(path: string, body?: any): Promise<T> {
    return this.send('POST', this.baseUrl + path, path, body)
  }

  async put<T>(path: string, body?: any): Promise<T> {
    return this.send('PUT', this.baseUrl + path, path, body)
  }

  async patch<T>(path: string, body?: any): Promise<T> {
    return this.send('PATCH', this.baseUrl + path, path, body)
  }

  async delete<T>(path: string): Promise<T | null> {
    return this.send('DELETE', this.baseUrl + path, path)
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

/**
 * Message lisible tiré d'une réponse d'erreur.
 *
 * Le serveur a trois façons de refuser une requête, et une seule portait un
 * champ `error` :
 *
 *   1. refus métier      → { error: "Audit code already exists…" }
 *   2. validation        → { violations: [{ field, message }] }
 *   3. corps illisible   → { objectName, attributeName, value }
 *
 * Seule la première était lue. Les deux autres retombaient sur le texte du
 * code HTTP, si bien qu'un titre trop court — que le serveur signalait par
 * « la taille doit être comprise entre 5 et 200 » — s'affichait « Bad
 * Request ». L'utilisateur ne pouvait pas savoir quoi corriger.
 */
function messageFrom(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const data = body as Record<string, unknown>

  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error
  }

  // Validation : les messages sont déjà rédigés pour être lus, et plusieurs
  // contraintes peuvent tomber sur le même champ.
  if (Array.isArray(data.violations) && data.violations.length > 0) {
    const messages = (data.violations as Array<Record<string, unknown>>)
      .map((v) => (typeof v.message === 'string' ? v.message : null))
      .filter((m): m is string => Boolean(m))
    if (messages.length > 0) {
      return messages.join(' · ')
    }
  }

  // Corps illisible : le serveur nomme le champ fautif et la valeur reçue.
  if (typeof data.attributeName === 'string') {
    return `Valeur incorrecte pour « ${data.attributeName} »`
      + (data.value === undefined ? '' : ` : ${String(data.value)}`)
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  return fallback
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

/**
 * Base des appels API, exposee pour les envois qui ne passent pas par le
 * client JSON — un televersement multipart, notamment, doit laisser le
 * navigateur poser lui-meme son en-tete `Content-Type`.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api'

/** Cle sous laquelle le jeton est conserve. Partagee pour les memes raisons. */
export const TOKEN_STORAGE_KEY = 'authToken'
