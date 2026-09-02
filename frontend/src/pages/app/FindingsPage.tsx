import { useEffect, useState } from 'react'
import { Loader, AlertTriangle } from 'lucide-react'
import { findingsClient } from '../../services/findingsClient'
import type { Finding } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'

const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-500/10 text-red-400',
  HIGH: 'bg-orange-500/10 text-orange-400',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400',
  LOW: 'bg-blue-500/10 text-blue-400',
  INFO: 'bg-gray-500/10 text-gray-400',
}

export function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { notify } = useNotification()

  useEffect(() => {
    loadFindings()
  }, [])

  const loadFindings = async () => {
    setLoading(true)
    try {
      const data = await findingsClient.list()
      setFindings(Array.isArray(data) ? data : [])
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
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <AlertTriangle className="text-brand" size={32} />
        Findings
      </h1>

      {error && (
        <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {findings.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <p className="text-text-on-dark-muted">Aucun finding</p>
        </div>
      ) : (
        <div className="space-y-4">
          {findings.map((finding) => (
            <div key={finding.id} className="rounded-lg border border-border-dark bg-surface-dark p-6 hover:border-brand/50 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{finding.title}</h3>
                  <p className="text-sm text-text-on-dark-muted mt-1">{finding.description}</p>
                  <div className="flex gap-3 mt-3 text-xs">
                    <span className="text-text-on-dark-muted">Source: {finding.source}</span>
                    <span className="text-text-on-dark-muted">Status: {finding.status}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  SEVERITY_COLORS[finding.severity as keyof typeof SEVERITY_COLORS]
                }`}>
                  {finding.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
