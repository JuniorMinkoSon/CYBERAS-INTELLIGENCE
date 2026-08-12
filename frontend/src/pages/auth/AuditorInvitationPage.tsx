import { useState } from 'react'
import { ArrowRight, CheckCircle2, Shield, ChevronLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AuditorInvitationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signup } = useAuth()
  const [step, setStep] = useState<'password' | 'confirmation' | 'done'>('password')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inviteEmail = searchParams.get('email') || 'auditeur@example.com'
  const orgName = searchParams.get('org') || 'Organisation'

  const handleSetPassword = () => {
    if (!password || !confirmPassword) {
      setError('Les deux mots de passe sont requis')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      setError('Minimum 8 caracteres')
      return
    }
    setStep('confirmation')
    setError('')
  }

  const handleAccept = async () => {
    setLoading(true)
    try {
      await signup(inviteEmail, password, 'auditeur')
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-text-on-dark-muted hover:text-white transition"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="mx-auto max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={32} className="text-brand" />
            <span className="text-2xl font-bold text-white">CYBERAS</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-6">
          {/* Step 1: Set Password */}
          {step === 'password' && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Bienvenue Auditeur!</h1>
                <p className="text-text-on-dark-muted text-sm">Vous avez ete invite a rejoindre</p>
                <p className="text-brand font-semibold">{orgName}</p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text-on-dark-muted mb-2">Email</p>
                  <p className="px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white">
                    {inviteEmail}
                  </p>
                </div>

                <label>
                  <span className="text-sm font-medium text-text-on-dark">Mot de passe</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium text-text-on-dark">Confirmer mot de passe</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                  />
                </label>

                <button
                  onClick={handleSetPassword}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition"
                >
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* Step 2: Confirmation */}
          {step === 'confirmation' && (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Accepter l'invitation</h1>
                <p className="text-text-on-dark-muted text-sm">
                  Vous allez rejoindre {orgName} en tant qu'auditeur
                </p>
              </div>

              <div className="bg-bg-dark/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-on-dark-muted">Email</span>
                  <span className="text-white">{inviteEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-muted">Organisation</span>
                  <span className="text-white">{orgName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-muted">Role</span>
                  <span className="text-brand font-semibold">Auditeur</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold transition"
                >
                  {loading ? 'Creation...' : 'Accepter et creer compte'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-dark text-text-on-dark hover:text-white font-semibold transition"
                >
                  Refuser
                </button>
              </div>
            </>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <>
              <div className="text-center space-y-4">
                <CheckCircle2 size={48} className="text-green-400 mx-auto" />
                <h1 className="text-2xl font-bold text-white">Compte crée!</h1>
                <p className="text-text-on-dark-muted">
                  Vous pouvez maintenant acceder a votre dashboard
                </p>
              </div>

              <button
                onClick={() => navigate('/app/auditeur')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition"
              >
                Acceder au dashboard <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
