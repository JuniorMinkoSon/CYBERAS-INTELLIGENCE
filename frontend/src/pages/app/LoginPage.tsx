import { Link } from 'react-router-dom'
import { Logo } from '../../components/marketing/Logo'

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4">
      <div className="w-full max-w-md rounded-xl border border-border-dark bg-surface-dark p-8 shadow-xl">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-xl font-bold text-white">Connexion à la solution</h1>
        <p className="mt-2 text-center text-sm text-text-on-dark-muted">
          Accédez à votre espace Auditeur, Admin ou RSSI.
        </p>
        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block text-sm font-medium text-text-on-dark">
            Email
            <input
              type="email"
              className="mt-1.5 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white focus:border-brand focus:outline-none"
              placeholder="vous@entreprise.ci"
            />
          </label>
          <label className="block text-sm font-medium text-text-on-dark">
            Mot de passe
            <input
              type="password"
              className="mt-1.5 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white focus:border-brand focus:outline-none"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Se connecter →
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-text-on-dark-muted">
          <Link to="/" className="text-brand hover:underline">
            ← Retour au site
          </Link>
        </p>
      </div>
    </div>
  )
}
