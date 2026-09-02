import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../contexts/OrganizationContext'
import { useNotification } from '../../contexts/NotificationContext'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Plus, AlertTriangle, TrendingUp, Users, Eye, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../services/apiClient'

interface DashboardStats {
  audits: number
  scans: number
  findings: number
  riskScore: number
  criticalFindings: number
  recommendations: number
}

interface RecentActivity {
  id: string
  actor: string
  action: string
  timestamp: string
  icon: string
}

export function DashboardUnified() {
  const { organization, currentUser, isOwner, hasPermission } = useOrganization()
  const { notify } = useNotification()
  const [stats, setStats] = useState<DashboardStats>({
    audits: 0,
    scans: 0,
    findings: 0,
    riskScore: 0,
    criticalFindings: 0,
    recommendations: 0,
  })
  const [activity, setActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [organization])

  const loadDashboardData = async () => {
    if (!organization) return
    try {
      const audits = await apiClient.get<any>('/audits')
      const mockStats: DashboardStats = {
        audits: Array.isArray(audits) ? audits.length : 0,
        scans: 38,
        findings: 147,
        riskScore: 72,
        criticalFindings: 8,
        recommendations: 31,
      }
      setStats(mockStats)

      const mockActivity: RecentActivity[] = [
        { id: '1', actor: 'Jean Martin', action: 'a modifié une réponse', timestamp: 'il y a 4 min', icon: '✓' },
        { id: '2', actor: 'Marie Kouassi', action: 'a ajouté un document', timestamp: 'il y a 12 min', icon: '📄' },
        { id: '3', actor: 'Paul', action: 'a lancé un scan', timestamp: 'il y a 18 min', icon: '🔍' },
        { id: '4', actor: 'Risk Engine', action: '17 findings détectés', timestamp: 'il y a 21 min', icon: '⚠️' },
      ]
      setActivity(mockActivity)
    } catch (err) {
      console.error('Failed to load dashboard', err)
      notify('Erreur lors du chargement du dashboard', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            👋 Bonjour {organization?.name || 'Entreprise'}
          </h1>
          <p className="text-sm text-text-on-dark-muted mt-1">
            {currentUser?.role === 'owner' ? 'Propriétaire' : currentUser?.role === 'member' ? 'Collaborateur' : 'Utilisateur'}
            {' • '}
            {organization?.name}
          </p>
        </div>
        {hasPermission('canCreateAudits') && (
          <Link
            to="/app/audits/new"
            className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg transition"
          >
            <Plus size={18} />
            Nouvel audit
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Audits" value={stats.audits} unit="" trend="+2 ce mois" />
        <KpiCard label="Scans" value={stats.scans} unit="" trend="+5 ce mois" />
        <KpiCard label="Findings" value={stats.findings} unit="" trend="+18 ce mois" />
        <KpiCard label="Risque global" value={stats.riskScore} unit="/100" trend="↑8%" />
        <KpiCard label="Critiques" value={stats.criticalFindings} unit="" trend="Actions requises" color="red" />
        <KpiCard label="Recommandations" value={stats.recommendations} unit="" trend="À traiter" color="orange" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-lg border border-border-dark bg-surface-dark p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-brand" />
            Activité récente
          </h2>
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-border-dark last:border-0">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-white">{item.actor}</span>
                    <span className="text-text-on-dark-muted"> {item.action}</span>
                  </p>
                  <p className="text-xs text-text-on-dark-muted">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          {hasPermission('canViewAudits') && (
            <QuickAccessCard
              title="Audits actifs"
              icon={<LayoutDashboard size={20} />}
              href="/app/audits"
              count={stats.audits}
            />
          )}
          {hasPermission('canViewFindings') && (
            <QuickAccessCard
              title="Findings"
              icon={<AlertTriangle size={20} />}
              href="/app/audits/findings"
              count={stats.findings}
            />
          )}
          {hasPermission('canViewRisks') && (
            <QuickAccessCard
              title="Risque"
              icon={<Eye size={20} />}
              href="/app/audits/risk"
              count={`${stats.riskScore}/100`}
            />
          )}
          {isOwner() && (
            <QuickAccessCard
              title="Utilisateurs"
              icon={<Users size={20} />}
              href="/app/organization/members"
            />
          )}
        </div>
      </div>

      {/* Audits List */}
      {hasPermission('canViewAudits') && (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={20} className="text-brand" />
            Audits actifs
          </h2>
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-4 text-xs font-semibold uppercase text-text-on-dark-muted pb-2 border-b border-border-dark">
              <span>Nom</span>
              <span>Statut</span>
              <span>Progrès</span>
              <span>Créé</span>
              <span></span>
            </div>
            <div className="text-sm text-text-on-dark-muted py-4">Aucun audit créé. Commencez par en créer un.</div>
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({
  label,
  value,
  unit,
  trend,
  color,
}: {
  label: string
  value: number | string
  unit: string
  trend?: string
  color?: 'red' | 'orange'
}) {
  const colorClass = color === 'red' ? 'text-red-400' : color === 'orange' ? 'text-orange-400' : 'text-brand'

  return (
    <div className="rounded-lg border border-border-dark bg-bg-dark/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <p className={`text-2xl font-extrabold ${colorClass}`}>{value}</p>
        {unit && <span className="text-xs text-text-on-dark-muted">{unit}</span>}
      </div>
      {trend && <p className="text-xs text-text-on-dark-muted mt-1">{trend}</p>}
    </div>
  )
}

function QuickAccessCard({
  title,
  icon,
  href,
  count,
}: {
  title: string
  icon: React.ReactNode
  href: string
  count?: number | string
}) {
  return (
    <Link
      to={href}
      className="rounded-lg border border-brand/30 bg-brand/5 hover:bg-brand/10 p-4 transition flex items-start justify-between"
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        {count !== undefined && <p className="text-2xl font-bold text-brand mt-1">{count}</p>}
      </div>
      <div className="text-brand">{icon}</div>
    </Link>
  )
}
