import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, Loader2, ClipboardCheck, ScanSearch, FileBarChart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { API_BASE, TOKEN_STORAGE_KEY } from '../../services/apiClient'
import { AuthShell, AuthCard, FormError, FieldLabel, fieldCls, type Reassurance } from '../../components/auth/AuthShell'
import { PasswordField } from '../../components/auth/PasswordField'
import { friendlyAuthError } from '../../components/auth/authErrors'

const REASSURANCES: Reassurance[] = [
  { icon: ClipboardCheck, title: 'Reprenez vos audits là où vous les avez laissés', text: 'Questionnaires, preuves et constats sont conservés à chaque étape.' },
  { icon: ScanSearch, title: 'Vos scans et vos scores à jour', text: 'Le tableau de bord reflète la dernière analyse de votre périmètre.' },
  { icon: FileBarChart, title: 'Vos rapports prêts à partager', text: 'Exportez le rapport d’audit dès que la mission est close.' },
]

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
   * après un aller-retour chez Google : une impasse qu'on peut éviter en
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
      setError(friendlyAuthError(failure, 'La connexion Google a échoué.'))
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate('/app')
    } catch (err) {
      setError(friendlyAuthError(err, 'La connexion a échoué. Réessayez dans un instant.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      headline={<>Bon retour. Votre espace d’audit vous attend.</>}
      reassurances={REASSURANCES}
    >
      <AuthCard title="Se connecter" subtitle="Entrez l’adresse et le mot de passe de votre compte.">
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <FormError message={error} />

          <label className="block">
            <FieldLabel>Adresse de courriel</FieldLabel>
            <div className="relative mt-1.5">
              <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.ci"
                className={`${fieldCls} pl-10 pr-4`}
              />
            </div>
          </label>

          <PasswordField
            label="Mot de passe"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            placeholder="Votre mot de passe"
          />

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Connexion en cours…
              </>
            ) : (
              <>
                Se connecter <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Pas de réinitialisation en libre-service côté serveur : promettre
              un lien « mot de passe oublié » qui n'existe pas serait pire que
              d'indiquer à qui s'adresser. */}
          <p className="text-center text-xs leading-relaxed text-text-on-dark-muted">
            Mot de passe oublié ?{' '}
            <Link to="/contact" className="font-medium text-text-on-dark hover:text-brand">
              Écrivez-nous
            </Link>
            , nous vous aidons à récupérer l’accès.
          </p>
        </form>

        {googleEnabled && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border-dark" />
              <span className="text-xs uppercase tracking-wider text-text-on-dark-muted">ou</span>
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
              Votre compte doit déjà exister : Google identifie, il ne crée pas d’organisation.
            </p>
          </div>
        )}
      </AuthCard>

      <p className="mt-5 text-center text-sm text-text-on-dark-muted">
        Première visite ?{' '}
        <Link to="/inscription" className="font-semibold text-brand hover:underline">
          Créez votre organisation en deux minutes
        </Link>
      </p>
    </AuthShell>
  )
}
