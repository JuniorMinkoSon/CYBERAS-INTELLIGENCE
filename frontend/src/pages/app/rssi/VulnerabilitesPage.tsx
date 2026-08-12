import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { SeverityBadge } from '../../../components/app/Shared'

interface Vulnerability {
  id: string
  cve: string
  title: string
  severity: 'critique' | 'eleve' | 'moyen' | 'faible'
  cvss: number
  asset: string
  source: string
  missionId?: string
  missionName?: string
  slaDay?: number
  deadline?: string
  remediationStatus?: 'a_faire' | 'en_cours' | 'fermee'
  discoveredDate: string
}

const vulnerabilitiesData: Vulnerability[] = [
  {
    id: '1',
    cve: 'CVE-2024-1234',
    title: 'Crypto weakness in SSL/TLS',
    severity: 'critique',
    cvss: 9.8,
    asset: 'SRV-WEB-01',
    source: 'Nessus',
    missionId: '1',
    missionName: 'Audit ISO 27001 — Société ABC',
    slaDay: 7,
    deadline: '2026-08-19',
    remediationStatus: 'a_faire',
    discoveredDate: '2026-08-12',
  },
  {
    id: '2',
    cve: 'CVE-2024-5678',
    title: 'Weak authentication mechanisms',
    severity: 'eleve',
    cvss: 8.2,
    asset: 'DB-01',
    source: 'Nmap',
    missionId: '1',
    missionName: 'Audit ISO 27001 — Société ABC',
    slaDay: 14,
    deadline: '2026-08-26',
    remediationStatus: 'en_cours',
    discoveredDate: '2026-08-10',
  },
  {
    id: '3',
    cve: 'CVE-2024-9012',
    title: 'Missing security headers',
    severity: 'moyen',
    cvss: 6.5,
    asset: 'WEB-APP-01',
    source: 'Qualys',
    missionId: '2',
    missionName: 'Audit Technique — TechStart',
    discoveredDate: '2026-08-08',
  },
]

export function VulnerabilitesPage() {
  const [query, setQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('tous')
  const [statusFilter, setStatusFilter] = useState('tous')

  const filtered = useMemo(() => {
    return vulnerabilitiesData.filter((v) => {
      const matchQuery = v.cve.toLowerCase().includes(query.toLowerCase()) ||
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.asset.toLowerCase().includes(query.toLowerCase())

      const matchSeverity = severityFilter === 'tous' || v.severity === severityFilter

      const matchStatus = statusFilter === 'tous' ||
        (statusFilter === 'avec_remediation' && v.remediationStatus) ||
        (statusFilter === 'sans_action' && !v.remediationStatus)

      return matchQuery && matchSeverity && matchStatus
    })
  }, [query, severityFilter, statusFilter])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Vulnérabilités</h1>
        <p className="text-text-on-dark-muted mt-2">Inventaire des vulnérabilités découvertes et plans de remédiation.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-xs">
          <Search size={16} className="absolute left-3 top-3 text-text-on-dark-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par CVE, titre ou actif..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-dark bg-surface-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border-dark bg-surface-dark text-white text-sm focus:border-brand focus:outline-none"
          >
            <option value="tous">Tous les niveaux</option>
            <option value="critique">Critique</option>
            <option value="eleve">Élevé</option>
            <option value="moyen">Moyen</option>
            <option value="faible">Faible</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border-dark bg-surface-dark text-white text-sm focus:border-brand focus:outline-none"
          >
            <option value="tous">Tous les statuts</option>
            <option value="avec_remediation">Avec action remédiation</option>
            <option value="sans_action">Sans action</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted uppercase">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{filtered.length}</p>
        </div>
        <div className="rounded-lg border border-red-600/30 bg-red-600/10 p-4">
          <p className="text-xs text-red-300 uppercase">Critiques</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{filtered.filter(v => v.severity === 'critique').length}</p>
        </div>
        <div className="rounded-lg border border-orange-600/30 bg-orange-600/10 p-4">
          <p className="text-xs text-orange-300 uppercase">Élevées</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{filtered.filter(v => v.severity === 'eleve').length}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted uppercase">En cours</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{filtered.filter(v => v.remediationStatus === 'en_cours').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border-dark bg-surface-dark overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-dark text-left text-xs uppercase tracking-wide text-text-on-dark-muted">
              <th className="px-4 py-3">CVE</th>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">CVSS</th>
              <th className="px-4 py-3">Sévérité</th>
              <th className="px-4 py-3">Mission</th>
              <th className="px-4 py-3">Statut Remédiation</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-border-dark last:border-0 hover:bg-bg-dark">
                <td className="px-4 py-3 font-mono font-bold text-white text-xs">{v.cve}</td>
                <td className="px-4 py-3 text-text-on-dark max-w-xs truncate">{v.title}</td>
                <td className="px-4 py-3 text-text-on-dark font-mono text-xs">{v.asset}</td>
                <td className="px-4 py-3 font-bold text-white">{v.cvss}</td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={v.severity} />
                </td>
                <td className="px-4 py-3 text-xs text-text-on-dark-muted">
                  {v.missionName ? (
                    <span className="text-text-on-dark">{v.missionName}</span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {v.remediationStatus ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        v.remediationStatus === 'a_faire'
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : v.remediationStatus === 'en_cours'
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'bg-green-600/20 text-green-400'
                      }`}>
                        {v.remediationStatus === 'a_faire' ? '⏳ À faire' : v.remediationStatus === 'en_cours' ? '🔄 En cours' : '✓ Fermée'}
                      </span>
                      <span className="text-xs text-text-on-dark-muted">{v.deadline}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-on-dark-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!v.remediationStatus ? (
                    <button className="text-sm font-semibold text-brand hover:text-brand-light transition">
                      Créer action →
                    </button>
                  ) : (
                    <button className="text-sm font-semibold text-text-on-dark hover:text-white transition">
                      Modifier →
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-on-dark-muted">
                  Aucune vulnérabilité ne correspond à votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
