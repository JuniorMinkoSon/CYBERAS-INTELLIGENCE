import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import { riskClient } from '../../services/riskClient'
import type { Risk } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'

const SEVERITY_COLORS = {
  LOW: 'bg-blue-500/10 text-blue-400',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400',
  HIGH: 'bg-orange-500/10 text-orange-400',
  CRITICAL: 'bg-red-500/10 text-red-400',
}

export function RiskMapPage() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { notify } = useNotification()

  useEffect(() => {
    loadRisks()
  }, [])

  const loadRisks = async () => {
    setLoading(true)
    try {
      const data = await riskClient.listRisks()
      setRisks(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-brand" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Cartographie des Risques</h1>

      {error && (
        <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {risks.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <p className="text-text-on-dark-muted">Aucun risque</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
              <p className="text-text-on-dark-muted text-sm">Risques critiques</p>
              <p className="text-2xl font-bold text-red-400">
                {risks.filter(r => r.severity === 'CRITICAL').length}
              </p>
            </div>
            <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
              <p className="text-text-on-dark-muted text-sm">Risques élevés</p>
              <p className="text-2xl font-bold text-orange-400">
                {risks.filter(r => r.severity === 'HIGH').length}
              </p>
            </div>
            <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
              <p className="text-text-on-dark-muted text-sm">Risques moyens</p>
              <p className="text-2xl font-bold text-yellow-400">
                {risks.filter(r => r.severity === 'MEDIUM').length}
              </p>
            </div>
            <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
              <p className="text-text-on-dark-muted text-sm">Score moyen</p>
              <p className="text-2xl font-bold text-brand">
                {risks.length > 0 ? (risks.reduce((sum, r) => sum + r.score, 0) / risks.length).toFixed(1) : '0'}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border-dark bg-surface-dark overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Titre</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Probabilité</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Impact</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Score</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Sévérité</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Responsable</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Statut</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk.id} className="border-b border-border-dark hover:bg-surface-dark/50">
                    <td className="px-6 py-4">{risk.title}</td>
                    <td className="px-6 py-4">{risk.probability}</td>
                    <td className="px-6 py-4">{risk.impact}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-brand">{risk.score}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        SEVERITY_COLORS[risk.severity as keyof typeof SEVERITY_COLORS]
                      }`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">{risk.responsible || '-'}</td>
                    <td className="px-6 py-4">{risk.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
