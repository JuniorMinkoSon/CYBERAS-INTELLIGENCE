import { useState } from 'react'
import { Search, CheckCircle2, Clock, XCircle, Lock, Calendar, Users, TrendingUp, Filter, ChevronRight } from 'lucide-react'

interface AuditSession {
  id: string
  missionName: string
  organization: string
  auditeur: string
  startDate: string
  status: 'en_cours' | 'fermé' | 'annulé'
  vulnsFound: number
  progress: number
  referentiels: string[]
  score?: number
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
    referentiels: ['ISO 27001', 'NIST'],
    score: 76,
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
    referentiels: ['ISO 27001', 'PCI-DSS'],
    score: 88,
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
    referentiels: ['NIST', 'ISO 27002'],
    score: 82,
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
    referentiels: ['ISO 27001'],
    score: 91,
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'en_cours':
      return {
        icon: Clock,
        label: 'En cours',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
      }
    case 'fermé':
      return {
        icon: CheckCircle2,
        label: 'Fermé',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
      }
    case 'annulé':
      return {
        icon: XCircle,
        label: 'Annulé',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
      }
    default:
      return {
        icon: Clock,
        label: 'Inconnu',
        color: 'text-gray-400',
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/30',
      }
  }
}

const getRiskLevel = (vulns: number) => {
  if (vulns > 15) return { label: 'Critique', color: 'text-red-400', bg: 'bg-red-500/10' }
  if (vulns > 8) return { label: 'Élevé', color: 'text-orange-400', bg: 'bg-orange-500/10' }
  if (vulns > 3) return { label: 'Moyen', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  return { label: 'Faible', color: 'text-green-400', bg: 'bg-green-500/10' }
}

export function AdminAuditActionsPage() {
  const [audits, setAudits] = useState<AuditSession[]>(mockAudits)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'en_cours' | 'fermé' | 'annulé'>('all')
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null)

  const filtered = audits.filter((audit) => {
    const matchesSearch =
      audit.missionName.toLowerCase().includes(search.toLowerCase()) ||
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
    avgScore: Math.round(audits.reduce((sum, a) => sum + (a.score || 0), 0) / audits.length),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Gestion des Audits</h1>
            <p className="text-sm text-text-on-dark-muted mt-2">Supervisez et cloturez les missions en cours</p>
          </div>
          <div className="hidden sm:block">
            <TrendingUp size={32} className="text-brand opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border-dark bg-surface-dark/50 backdrop-blur-sm p-6 space-y-2 hover:border-brand/50 transition">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">Total</p>
          <p className="text-3xl font-extrabold text-white">{stats.total}</p>
          <p className="text-xs text-text-on-dark-muted">audits enregistres</p>
        </div>

        <div className="rounded-xl border border-border-dark bg-surface-dark/50 backdrop-blur-sm p-6 space-y-2 hover:border-blue-500/50 transition">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">En cours</p>
          <p className="text-3xl font-extrabold text-blue-400">{stats.enCours}</p>
          <p className="text-xs text-text-on-dark-muted">missions actives</p>
        </div>

        <div className="rounded-xl border border-border-dark bg-surface-dark/50 backdrop-blur-sm p-6 space-y-2 hover:border-green-500/50 transition">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">Fermes</p>
          <p className="text-3xl font-extrabold text-green-400">{stats.fermes}</p>
          <p className="text-xs text-text-on-dark-muted">termines</p>
        </div>

        <div className="rounded-xl border border-border-dark bg-surface-dark/50 backdrop-blur-sm p-6 space-y-2 hover:border-orange-500/50 transition">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">Vulns</p>
          <p className="text-3xl font-extrabold text-orange-400">{stats.totalVulns}</p>
          <p className="text-xs text-text-on-dark-muted">trouvees au total</p>
        </div>

        <div className="rounded-xl border border-border-dark bg-surface-dark/50 backdrop-blur-sm p-6 space-y-2 hover:border-brand/50 transition">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">Score moy</p>
          <p className="text-3xl font-extrabold text-brand">{stats.avgScore}%</p>
          <p className="text-xs text-text-on-dark-muted">conformite</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
          <input
            type="text"
            placeholder="Chercher par mission, organisation ou auditeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
          />
        </div>
        <div className="flex gap-2">
          <Filter size={18} className="text-text-on-dark-muted self-center" />
          {(['all', 'en_cours', 'fermé', 'annulé'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedStatus === status
                  ? 'bg-brand text-white'
                  : 'border border-border-dark text-text-on-dark hover:border-brand/50'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'en_cours' ? 'En cours' : status === 'fermé' ? 'Fermes' : 'Annules'}
            </button>
          ))}
        </div>
      </div>

      {/* Audits List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border-dark bg-surface-dark/50 p-12 text-center">
            <p className="text-text-on-dark-muted">Aucun audit trouvé</p>
          </div>
        ) : (
          filtered.map((audit) => {
            const statusConfig = getStatusConfig(audit.status)
            const riskLevel = getRiskLevel(audit.vulnsFound)
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={audit.id}
                className="group rounded-xl border border-border-dark bg-surface-dark/50 backdrop-blur-sm hover:border-brand/50 hover:bg-surface-dark/70 transition p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{audit.missionName}</h3>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.border} ${statusConfig.bg}`}>
                        <StatusIcon size={14} className={statusConfig.color} />
                        <span className={`text-xs font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-text-on-dark-muted">
                        <Users size={14} />
                        {audit.organization}
                      </div>
                      <div className="flex items-center gap-2 text-text-on-dark-muted">
                        <Users size={14} />
                        {audit.auditeur}
                      </div>
                      <div className="flex items-center gap-2 text-text-on-dark-muted">
                        <Calendar size={14} />
                        Depuis {audit.startDate}
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={20} className="text-text-on-dark-muted group-hover:text-brand transition mt-1" />
                </div>

                {/* Content Grid */}
                <div className="grid gap-4 sm:grid-cols-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">Progression</span>
                      <span className="text-sm font-bold text-brand">{audit.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-dark overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-300"
                        style={{ width: `${audit.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Vulnerabilities */}
                  <div className={`rounded-lg ${riskLevel.bg} p-3`}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted mb-1">Vulnerabilites</p>
                    <p className={`text-2xl font-extrabold ${riskLevel.color}`}>{audit.vulnsFound}</p>
                    <p className={`text-xs ${riskLevel.color} font-medium`}>{riskLevel.label}</p>
                  </div>

                  {/* Score */}
                  {audit.score !== undefined && (
                    <div className="rounded-lg bg-brand/10 border border-brand/30 p-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted mb-1">Score</p>
                      <p className="text-2xl font-extrabold text-brand">{audit.score}%</p>
                      <p className="text-xs text-brand/80">Conformite</p>
                    </div>
                  )}

                  {/* Referentiels */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted mb-2">Normes</p>
                    <div className="flex flex-wrap gap-2">
                      {audit.referentiels.slice(0, 2).map((ref) => (
                        <span
                          key={ref}
                          className="px-2 py-1 rounded text-xs font-medium bg-bg-dark border border-border-dark text-text-on-dark-muted"
                        >
                          {ref}
                        </span>
                      ))}
                      {audit.referentiels.length > 2 && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-bg-dark border border-border-dark text-text-on-dark-muted">
                          +{audit.referentiels.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {audit.status === 'en_cours' && (
                  <div className="flex gap-2 pt-4 border-t border-border-dark">
                    <button
                      onClick={() => setSelectedAudit(audit.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 font-semibold transition"
                    >
                      <CheckCircle2 size={16} /> Cloturer
                    </button>
                    <button
                      onClick={() => handleCancelAudit(audit.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold transition"
                    >
                      <XCircle size={16} /> Annuler
                    </button>
                  </div>
                )}

                {audit.status === 'fermé' && (
                  <div className="flex items-center gap-2 pt-4 border-t border-border-dark text-green-400 text-sm font-medium">
                    <Lock size={16} /> Audit verrouille et archive
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="rounded-xl bg-surface-dark border border-border-dark p-8 max-w-md space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Confirmer la cloture</h2>
              <p className="text-sm text-text-on-dark-muted mt-2">
                Etes-vous sur de vouloir cloturer cet audit? Cette action est irreversible et l'audit sera verrouille.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
              <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">Une cloture d'audit ne peut pas etre annulee</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleCloseAudit(selectedAudit)}
                className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition"
              >
                Confirmer la cloture
              </button>
              <button
                onClick={() => setSelectedAudit(null)}
                className="flex-1 px-4 py-3 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition font-semibold"
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

function AlertCircle({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
