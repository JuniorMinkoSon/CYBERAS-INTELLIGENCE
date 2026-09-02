import { useEffect, useState } from 'react'
import { Plus, MoreVertical, Loader } from 'lucide-react'
import { auditsClient } from '../../services/auditsClient'
import type { Audit } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'

export function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { notify } = useNotification()

  useEffect(() => {
    loadAudits()
  }, [])

  const loadAudits = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditsClient.list()
      setAudits(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement'
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Audits</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded transition">
          <Plus size={20} />
          Nouvel audit
        </button>
      </div>

      {error && (
        <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {audits.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <p className="text-text-on-dark-muted">Aucun audit trouvé</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border-dark bg-surface-dark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-dark">
                <th className="px-6 py-3 text-left text-sm font-semibold text-text-on-dark">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text-on-dark">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text-on-dark">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text-on-dark">Créateur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text-on-dark">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-text-on-dark"></th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit) => (
                <tr key={audit.id} className="border-b border-border-dark hover:bg-surface-dark/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-brand">{audit.auditCode}</td>
                  <td className="px-6 py-4 text-sm text-text-on-dark">{audit.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-on-dark-muted">{audit.createdByEmail}</td>
                  <td className="px-6 py-4 text-sm text-text-on-dark-muted">
                    {new Date(audit.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-surface-dark/50 rounded transition">
                      <MoreVertical size={16} className="text-text-on-dark-muted" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
