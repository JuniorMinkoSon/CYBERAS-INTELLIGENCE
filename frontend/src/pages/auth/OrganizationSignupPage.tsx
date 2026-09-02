import { useState } from 'react'
import { Mail, Lock, Building2, ArrowRight, Shield, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'

export function OrganizationSignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { notify } = useNotification()
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.organizationName.trim()) {
      setError("Le nom de l'organisation est requis")
      return
    }
    if (!formData.email.trim()) {
      setError('Email requis')
      return
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      await signup(formData.email, formData.password, 'owner')
      notify('Organisation créée avec succès!', 'success')
      navigate('/app/auditeur')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création'
      setError(message)
      notify(message, 'error')
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
            <p className="text-text-on-dark-muted">Créez votre organisation d'audit</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-surface-dark/50 backdrop-blur-sm border border-border-dark rounded-xl p-8">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Nom de l'organisation</span>
              <div className="mt-2 relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="ex: Acme Corp"
                  className="w-full rounded-lg border border-border-dark bg-bg-dark pl-10 py-2.5 text-text-on-dark placeholder:text-text-on-dark-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Email (Administrateur)</span>
              <div className="mt-2 relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@acme.ci"
                  className="w-full rounded-lg border border-border-dark bg-bg-dark pl-10 py-2.5 text-text-on-dark placeholder:text-text-on-dark-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Mot de passe</span>
              <div className="mt-2 relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border-dark bg-bg-dark pl-10 py-2.5 text-text-on-dark placeholder:text-text-on-dark-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Confirmer le mot de passe</span>
              <div className="mt-2 relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border-dark bg-bg-dark pl-10 py-2.5 text-text-on-dark placeholder:text-text-on-dark-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Création...' : 'Créer organisation'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-text-on-dark-muted text-sm">
            Vous avez déjà une organisation?{' '}
            <button onClick={() => navigate('/login')} className="text-brand hover:text-brand-dark font-semibold">
              Connectez-vous
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
