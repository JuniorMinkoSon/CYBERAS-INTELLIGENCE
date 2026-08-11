import { useState } from 'react'
import { Search, Check, X, Lock, FileText, Calendar, User } from 'lucide-react'

interface AuditSession {
  id: string
  missionName: string
  organization: string
  auditeur: string
  startDate: string
  status: 'en_cours' | 'fermé' | 'annulé'
  vulnsFound: number
  progress: number
}

const mockAudits: AuditSession[] = [
  {
    id: '1',
    missionName: 'Audit Sécurité Q3 2026',
    organization: 'TechCorp SA',
    auditeur: 'Jean Dupont',
    startDate: '2026-08-01',
    status: 'en_cours',
    vulnsFound: 12,
    progress: 75,
  },
  {
    id: '2',
    missionName: 'Conformité ISO 27001',
    organization: 'FinanceBank',
    auditeur: 'Marie Renaud',
    startDate: '2026-07-15',
    status: 'en_cours',
    vulnsFound: 5,
    progress: 90,
  },
  {
    id: '3',
    missionName: 'Audit Infrastructure',
    organization: 'HealthCare Plus',
    auditeur: 'Pierre Martin',
    startDate: '2026-07-01',
    status: 'fermé',
    vulnsFound: 8,
    progress: 100,
  },
  {
    id: '4',
    missionName: 'Audit Réglementaire',
    organization: 'GovAgency',
    auditeur: 'Sophie Laurent',
    startDate: '2026-06-15',
    status: 'fermé',
    vulnsFound: 3,
    progress: 100,
  },
]

export function AdminAuditActionsPage() {
  const [audits, setAudits] = useState<AuditSession[]>(mockAudits)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'en_cours' | 'fermé' | 'annulé'>('all')
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null)

  const filtered = audits.filter((audit) => {
    const matchesSearch = audit.missionName.toLowerCase().includes(search.toLowerCase()) ||
      audit.organization.toLowerCase().includes(search.toLowerCase()) ||
      audit.auditeur.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || audit.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleCloseAudit = (auditId: string) => {
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === auditId ? { ...audit, status: 'fermé' as const, progress: 100 } : audit,
      ),
    )
    setSelectedAudit(null)
    alert('Audit fermé avec succès!')
  }

  const handleCancelAudit = (auditId: string) => {
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === auditId ? { ...audit, status: 'annulé' as const } : audit,
      ),
    )
    setSelectedAudit(null)
    alert('Audit annulé!')
  }

  const stats = {
    total: audits.length,
    enCours: audits.filter((a) => a.status === 'en_cours').length,
    fermes: audits.filter((a) => a.status === 'fermé').length,
    totalVulns: audits.reduce((sum, a) => sum + a.vulnsFound, 0),
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Gestion des Audits</h1>
        <p className="text-sm text-text-on-dark-muted mt-2">Superviser et clôturer les missions d'audit en cours</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Total d'audits</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">En cours</p>
          <p className="text-2xl font-bold text-blue-400">{stats.enCours}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Fermés</p>
          <p className="text-2xl font-bold text-green-400">{stats.fermes}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Vulnérabilités totales</p>
          <p className="text-2xl font-bold text-orange-400">{stats.totalVulns}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
          <input
            type="text"
            placeholder="Chercher par mission, organisation ou auditeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none transition"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'en_cours', 'fermé', 'annulé'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedStatus === status
                  ? 'bg-brand text-white'
                  : 'border border-border-dark text-text-on-dark hover:border-brand/50'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'en_cours' ? 'En cours' : status === 'fermé' ? 'Fermés' : 'Annulés'}
            </button>
          ))}
        </div>
      </div>

      {/* Audits Grid */}
      <div className="space-y-4">
        {filtered.map((audit) => (
          <div
            key={audit.id}
            className="rounded-lg border border-border-dark bg-surface-dark/50 p-4 sm:p-6 space-y-4 hover:border-brand/50 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{audit.missionName}</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      audit.status === 'en_cours'
                        ? 'bg-blue-500/20 text-blue-400'
                        : audit.status === 'fermé'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {audit.status === 'en_cours' ? 'En cours' : audit.status === 'fermé' ? 'Fermé' : 'Annulé'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 text-sm text-text-on-dark-muted">
                  <div className="flex items-center gap-2">
                    <FileText size={14} />
                    {audit.organization}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    {audit.auditeur}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    Depuis le {audit.startDate}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-on-dark-muted">Progression</span>
                    <span className="text-xs font-bold text-brand">{audit.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-dark overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-300"
                      style={{ width: `${audit.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 sm:border-l sm:border-border-dark sm:pl-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{audit.vulnsFound}</p>
                  <p className="text-xs text-text-on-dark-muted">Vulnérabilités</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {audit.status === 'en_cours' && (
              <div className="flex gap-2 pt-4 border-t border-border-dark">
                <button
                  onClick={() => setSelectedAudit(audit.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 font-semibold transition"
                >
                  <Check size={16} /> Clôturer l'audit
                </button>
                <button
                  onClick={() => handleCancelAudit(audit.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold transition"
                >
                  <X size={16} /> Annuler
                </button>
              </div>
            )}

            {audit.status === 'fermé' && (
              <div className="flex items-center gap-2 pt-4 border-t border-border-dark text-green-400 text-sm font-medium">
                <Lock size={16} /> Audit clôturé et verrouillé
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-lg bg-surface-dark border border-border-dark p-6 max-w-md space-y-4">
            <h2 className="text-xl font-bold text-white">Confirmer la clôture d'audit</h2>
            <p className="text-sm text-text-on-dark-muted">
              Êtes-vous sûr de vouloir clôturer cet audit ? Cette action est irréversible et l'audit sera verrouillé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCloseAudit(selectedAudit)}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
              >
                Confirmer
              </button>
              <button
                onClick={() => setSelectedAudit(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
