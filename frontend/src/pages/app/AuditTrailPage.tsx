import { useEffect, useState } from 'react'
import { Clock, AlertCircle, Loader } from 'lucide-react'
import { auditTrailClient } from '../../services/auditTrailClient'
import type { AuditEvent } from '../../types/auditTrail'

export function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterEventType, setFilterEventType] = useState<string>('')
  const [filterActor, setFilterActor] = useState<string>('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditTrailClient.listForOrganization(500)
      setEvents(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit trail')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesEventType = !filterEventType || event.eventType === filterEventType
    const matchesActor = !filterActor || event.actorEmail?.includes(filterActor)
    return matchesEventType && matchesActor
  })

  const eventTypes = [...new Set(events.map((e) => e.eventType))]

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('CREATED')) return '✓'
    if (eventType.includes('UPDATED')) return '📝'
    if (eventType.includes('DELETED')) return '🗑️'
    if (eventType.includes('LOGIN')) return '🔓'
    if (eventType.includes('SCAN')) return '🔍'
    if (eventType.includes('FINDING')) return '⚠️'
    return '📋'
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin text-brand mx-auto mb-4" size={48} />
          <p className="text-text-on-dark-muted">Chargement de l'audit trail...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
          <h2 className="font-bold text-red-400 mb-2 flex items-center gap-2">
            <AlertCircle size={20} />
            Erreur
          </h2>
          <p className="text-text-on-dark-muted text-sm">{error}</p>
          <button
            onClick={loadEvents}
            className="mt-4 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Clock size={32} className="text-brand" />
          Audit Trail
        </h1>
        <p className="text-sm text-text-on-dark-muted">{filteredEvents.length} événements</p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Type d'événement</label>
          <select
            value={filterEventType}
            onChange={(e) => setFilterEventType(e.target.value)}
            className="w-full px-3 py-2 rounded border border-border-dark bg-surface-dark text-white focus:outline-none focus:border-brand"
          >
            <option value="">Tous les types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Utilisateur</label>
          <input
            type="text"
            placeholder="Filtrer par email..."
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
            className="w-full px-3 py-2 rounded border border-border-dark bg-surface-dark text-white placeholder-text-on-dark-muted focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <p className="text-text-on-dark-muted">Aucun événement trouvé.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border-dark bg-surface-dark divide-y divide-border-dark">
          {filteredEvents.map((event) => (
            <div key={event.id} className="p-4 hover:bg-surface-dark/50 transition">
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{getEventIcon(event.eventType)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-white text-sm">{event.eventType}</p>
                      <p className="text-xs text-text-on-dark-muted">
                        {event.actorEmail || 'System'} • {event.resourceType} • {event.action}
                      </p>
                    </div>
                    <div className="text-xs text-text-on-dark-muted whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>

                  {/* IP & User-Agent */}
                  <div className="flex gap-4 text-xs text-text-on-dark-muted mt-2">
                    {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                    {event.userAgent && <span className="truncate">UA: {event.userAgent}</span>}
                  </div>

                  {/* Details */}
                  {event.details && Object.keys(event.details).length > 0 && (
                    <div className="mt-2 p-2 rounded bg-surface-dark/50 text-xs text-text-on-dark-muted">
                      <pre className="whitespace-pre-wrap overflow-hidden">
                        {JSON.stringify(event.details, null, 2).substring(0, 200)}
                        {JSON.stringify(event.details, null, 2).length > 200 ? '...' : ''}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
