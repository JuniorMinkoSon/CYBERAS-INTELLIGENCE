import { useOrganization } from '../../contexts/OrganizationContext'
import { useNotification } from '../../contexts/NotificationContext'
import { useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Plus, AlertTriangle, TrendingUp, Users, Eye, FileText, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../services/apiClient'

interface DashboardStats {
  audits: number
  scans: number
  findings: number
  completedScans: number
  criticalFindings: number
}

interface RecentActivity {
  id: string
  actor: string
  action: string
  timestamp: string
  icon: string
}

interface Audit {
  id: string
  title: string
  status: string
  createdAt: string
}

interface Scan {
  id: string
  target: string
  status: string
  scannerType: string
  progress: number
  startedAt: string | null
  finishedAt: string | null
}

interface Finding {
  id: string
  title: string
  severity: string
  scanId: string
}

export function DashboardUnified() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const { notify } = useNotification()
  const [stats, setStats] = useState<DashboardStats>({
    audits: 0,
    scans: 0,
    findings: 0,
    completedScans: 0,
    criticalFindings: 0,
  })
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentAudits, setRecentAudits] = useState<Audit[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    if (!organization) return
    setLoading(true)
    setError(null)
    try {
      const [auditsData, scansData, findingsData] = await Promise.all([
        apiClient.get<Audit[]>('/audits'),
        apiClient.get<Scan[]>('/scans').catch(() => []),
        apiClient.get<Finding[]>('/findings').catch(() => []),
      ])

      const audits = Array.isArray(auditsData) ? auditsData : []
      const scans = Array.isArray(scansData) ? scansData : []
      const findings = Array.isArray(findingsData) ? findingsData : []

      const completedScans = scans.filter((s) => s.status === 'COMPLETED').length
      const criticalFindings = findings.filter((f) => f.severity === 'CRITICAL').length

      setStats({
        audits: audits.length,
        scans: scans.length,
        findings: findings.length,
        completedScans,
        criticalFindings,
      })

      setRecentAudits(audits.slice(0, 3))

      const mockActivity: RecentActivity[] = [
        { id: '1', actor: 'Dashboard', action: `${audits.length} audits chargés`, timestamp: 'maintenant', icon: '📋' },
        { id: '2', actor: 'Dashboard', action: `${scans.length} scans détectés`, timestamp: 'maintenant', icon: '🔍' },
        { id: '3', actor: 'Dashboard', action: `${findings.length} findings trouvés`, timestamp: 'maintenant', icon: '⚠️' },
      ]
      setActivity(mockActivity)
    } catch (err) {
      console.error('Failed to load dashboard', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      notify('Erreur lors du chargement du dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin text-brand mx-auto mb-4" size={48} />
          <p className="text-text-on-dark-muted">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
          <h2 className="font-bold text-red-400 mb-2">Erreur de chargement</h2>
          <p className="text-text-on-dark-muted text-sm">{error}</p>
          <button
            onClick={loadDashboardData}
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
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            👋 Bonjour {organization?.name || 'Entreprise'}
          </h1>
          <p className="text-sm text-text-on-dark-muted mt-1">
            Workspace cybersécurité
            {' • '}
            {organization?.name}
          </p>
        </div>
        <button
          onClick={() => navigate('/app/audits')}
          className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg transition"
        >
          <Plus size={18} />
          Audits
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Audits" value={stats.audits} unit="" trend="actifs" />
        <KpiCard label="Scans" value={stats.scans} unit="" trend={`${stats.completedScans} complétés`} />
        <KpiCard label="Findings" value={stats.findings} unit="" trend={`${stats.criticalFindings} critiques`} color="red" />
        <KpiCard label="Scans complétés" value={stats.completedScans} unit="" trend={`/${stats.scans}`} />
        <KpiCard label="Critiques" value={stats.criticalFindings} unit="" trend="Action requise" color="red" />
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
          <QuickAccessCard
            title="Audits actifs"
            icon={<LayoutDashboard size={20} />}
            href="/app/audits"
            count={stats.audits}
          />
          <QuickAccessCard
            title="Findings"
            icon={<AlertTriangle size={20} />}
            href="/app/findings"
            count={stats.findings}
          />
          <QuickAccessCard
            title="Scans en cours"
            icon={<Eye size={20} />}
            href="/app/scans"
            count={stats.scans - stats.completedScans}
          />
          <QuickAccessCard
            title="Utilisateurs"
            icon={<Users size={20} />}
            href="/app/organization/members"
          />
        </div>
      </div>

      {/* Audits List */}
      <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <FileText size={20} className="text-brand" />
          Audits ({stats.audits})
        </h2>
        <div className="space-y-2">
          {recentAudits.length > 0 ? (
            <div className="space-y-3">
              {recentAudits.map((audit) => (
                <Link
                  key={audit.id}
                  to={`/app/audits/${audit.id}`}
                  className="flex items-center justify-between p-3 rounded border border-border-dark hover:bg-surface-dark/50 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{audit.title}</p>
                    <p className="text-xs text-text-on-dark-muted">
                      {new Date(audit.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    audit.status === 'COMPLETED'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {audit.status}
                  </span>
                </Link>
              ))}
              {stats.audits > 3 && (
                <Link to="/app/audits" className="text-sm text-brand hover:text-brand-dark transition block text-center py-2 border-t border-border-dark mt-2">
                  Voir tous les audits ({stats.audits})
                </Link>
              )}
            </div>
          ) : (
            <div className="text-sm text-text-on-dark-muted py-8 text-center">
              <p className="mb-3">Aucun audit créé.</p>
              <button
                onClick={() => navigate('/app/audits')}
                className="text-brand hover:text-brand-dark transition inline-flex items-center gap-1"
              >
                <Plus size={16} />
                Voir les audits
              </button>
            </div>
          )}
        </div>
      </div>
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
