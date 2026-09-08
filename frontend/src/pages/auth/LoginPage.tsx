import { useState, useEffect } from 'react'
import { Mail, Lock, ArrowRight, Shield, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE, TOKEN_STORAGE_KEY } from '../../services/apiClient'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Disponibilité de la connexion Google.
   *
   * Le bouton n'est affiché que si le serveur est réellement configuré. Le
   * montrer sans identifiants amènerait l'utilisateur sur un message d'erreur
   * après un aller-retour chez Google — une impasse qu'on peut éviter en
   * posant la question une fois.
   */
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/auth/google/status`)
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d) => setGoogleEnabled(Boolean(d?.enabled)))
      .catch(() => setGoogleEnabled(false))
  }, [])

  /**
   * Retour de la connexion Google.
   *
   * Le serveur renvoie ici avec `?token=` en cas de succès, `?error=` sinon.
   * Le paramètre est retiré de l'URL aussitôt lu : un jeton qui reste dans la
   * barre d'adresse finit dans l'historique, dans les journaux d'un proxy, et
   * dans le presse-papiers de qui copie le lien.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const failure = params.get('error')

    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      window.history.replaceState({}, '', '/login')
      // Rechargement plutôt que navigation : le contexte d'authentification
      // lit le jeton à son initialisation.
      window.location.replace('/app')
      return
    }
    if (failure) {
      setError(failure)
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-text-on-dark-muted hover:text-white transition"
        aria-label="Retour à l'accueil"
      >
        <ChevronLeft size={24} />
        <span className="text-sm font-medium hidden sm:inline">Retour</span>
      </button>

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-brand rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-brand rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield size={32} className="text-brand" />
              <span className="text-2xl font-bold text-white">CYBERAS</span>
            </div>
            <p className="text-text-on-dark-muted">Plateforme unifiée de cybersécurité</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 bg-surface-dark/50 backdrop-blur-sm border border-border-dark rounded-xl p-8">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Email</span>
              <div className="mt-2 relative">
                <Mail size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.ci"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none transition"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Mot de passe</span>
              <div className="mt-2 relative">
                <Lock size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none transition"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg hover:shadow-brand/50 disabled:opacity-50 disabled:shadow-none text-white font-semibold py-2.5 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {googleEnabled && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-border-dark" />
                <span className="text-sm text-text-on-dark-muted">ou</span>
                <div className="flex-1 border-t border-border-dark" />
              </div>

              {/* Un lien et non un bouton : la redirection est faite par le
                  serveur, et un <a> continue de fonctionner si le script de la
                  page n'a pas chargé. */}
              <a
                href={`${API_BASE}/auth/google/start`}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border-dark bg-white/5 py-2.5 font-semibold text-text-on-dark transition hover:border-brand hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-4H24v7.5h12c-.2 2-1.5 5-4.4 7l6.7 5.2C42.2 36 45 30.6 45 24z"/>
                  <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.9-12.5-9.2l-7.1 5.5C8 40.9 15.4 46 24 46z"/>
                  <path fill="#FBBC05" d="M11.5 28.3A13 13 0 0 1 11.5 19.7l-7.1-5.5a22 22 0 0 0 0 19.6l7.1-5.5z"/>
                  <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.3 3.2l6.2-6.2C34.9 3 29.9 1 24 1 15.4 1 8 6.1 4.4 13.6l7.1 5.5C13.3 13.4 18.2 9.5 24 9.5z"/>
                </svg>
                Continuer avec Google
              </a>

              <p className="text-center text-xs text-text-on-dark-muted">
                Votre compte CYBERAS doit déjà exister. La connexion Google
                identifie, elle ne crée pas d&apos;organisation.
              </p>
            </>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border-dark" />
            <span className="text-sm text-text-on-dark-muted">Nouveau ?</span>
            <div className="flex-1 border-t border-border-dark" />
          </div>

          <button
            onClick={() => navigate('/inscription')}
            className="w-full rounded-lg border border-border-dark hover:border-brand text-text-on-dark hover:text-white font-semibold py-2.5 transition"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  )
}
