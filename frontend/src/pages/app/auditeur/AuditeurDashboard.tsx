import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, Zap, FileText, ArrowRight, Shield } from 'lucide-react'
import { ProgressBar } from '../../../components/app/Shared'
import { missions, vulnerabilities } from '../../../data/mock'

export function AuditeurDashboard() {
  const auditName = 'Jean Dupont'
  const missionsActive = missions.filter(m => m.status === 'En cours').length
  const missionsOverdue = missions.filter(m => new Date(m.deadline) < new Date()).length
  const totalVulns = vulnerabilities.length
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critique').length

  const priorityActions = [
    { id: 1, mission: 'Audit Sécurité Q3', action: 'Compléter questionnaire ISO 27001', priority: 'critique', mission_id: 1 },
    { id: 2, mission: 'Conformité ISO 27001', action: 'Vérifier 2 documents', priority: 'eleve', mission_id: 2 },
    { id: 3, mission: 'Audit Sécurité Q3', action: 'Analyser 3 vulnérabilités critiques', priority: 'critique', mission_id: 1 },
    { id: 4, mission: 'Audit Technique Acme', action: 'Générer rapport final', priority: 'moyen', mission_id: 2 },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-brand/10 via-surface-dark/50 to-bg-dark rounded-2xl p-8 border border-brand/20">
        <h1 className="text-4xl font-extrabold text-white">Bonjour {auditName} 👋</h1>
        <p className="text-lg text-text-on-dark-muted mt-3">Bienvenue dans votre centre de contrôle d'audit</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Missions */}
        <Link
          to="/app/auditeur/missions"
          className="group relative overflow-hidden rounded-xl border border-brand/30 bg-gradient-to-br from-brand/20 via-bg-dark to-bg-dark p-6 hover:border-brand/60 transition-all hover:shadow-lg hover:shadow-brand/20"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/10 group-hover:bg-brand/20 transition-all" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-brand/80 uppercase tracking-wide">Missions actives</p>
              <p className="text-4xl font-extrabold text-white mt-2">{missionsActive}</p>
            </div>
            <div className="p-3 rounded-lg bg-brand/20 group-hover:bg-brand/30 transition">
              <Zap className="text-brand group-hover:scale-110 transition" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-on-dark-muted">En cours maintenant</p>
        </Link>

        {/* Overdue */}
        <div className="group relative overflow-hidden rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/20 via-bg-dark to-bg-dark p-6 hover:border-yellow-500/60 transition-all hover:shadow-lg hover:shadow-yellow-500/20">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-yellow-400/80 uppercase tracking-wide">En retard</p>
              <p className="text-4xl font-extrabold text-yellow-300 mt-2">{missionsOverdue}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition">
              <Clock className="text-yellow-400 group-hover:scale-110 transition" size={24} />
            </div>
          </div>
          <p className="text-xs text-yellow-200">À accélérer</p>
        </div>

        {/* Vulnerabilities */}
        <div className="group relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 via-bg-dark to-bg-dark p-6 hover:border-cyan-500/60 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-cyan-400/80 uppercase tracking-wide">Vulnérabilités</p>
              <p className="text-4xl font-extrabold text-cyan-300 mt-2">{totalVulns}</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition">
              <AlertTriangle className="text-cyan-400 group-hover:scale-110 transition" size={24} />
            </div>
          </div>
          <p className="text-xs text-cyan-200">Détectées</p>
        </div>

        {/* Critical */}
        <div className="group relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/20 via-bg-dark to-bg-dark p-6 hover:border-red-500/60 transition-all hover:shadow-lg hover:shadow-red-500/20">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-all" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-red-400/80 uppercase tracking-wide">Critiques</p>
              <p className="text-4xl font-extrabold text-red-300 mt-2">{criticalVulns}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition">
              <Shield className="text-red-400 group-hover:scale-110 transition" size={24} />
            </div>
          </div>
          <p className="text-xs text-red-200">Action immédiate</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Mes Missions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mes missions */}
          <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-surface-dark/80 to-bg-dark/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">📋 Mes missions</h2>
              <Link to="/app/auditeur/missions" className="text-sm font-bold text-brand hover:text-brand-light transition flex items-center gap-1">
                Voir tout <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-3">
              {missions.slice(0, 3).map(m => (
                <Link
                  key={m.id}
                  to={`/app/auditeur/missions/${m.id}`}
                  className="group rounded-xl border border-border-dark/50 hover:border-brand/50 transition-all p-5 bg-gradient-to-r from-bg-dark/50 to-bg-dark/20 hover:from-brand/10 hover:to-bg-dark/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-white group-hover:text-brand transition">{m.name}</p>
                      <p className="text-xs text-text-on-dark-muted mt-1">{m.organization}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-2xl font-extrabold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">{m.progress}%</p>
                      <p className="text-xs text-text-on-dark-muted">Progression</p>
                    </div>
                  </div>

                  <ProgressBar value={m.progress} />
                </Link>
              ))}
            </div>
          </div>

          {/* Progression globale */}
          <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-surface-dark/80 to-bg-dark/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6">📊 Progression globale</h2>

            <div className="space-y-6">
              {[
                { label: 'Questionnaires', value: 12, total: 18, color: 'from-blue-500 to-blue-600', icon: '✓' },
                { label: 'Collecte de données', value: 8, total: 18, color: 'from-emerald-500 to-emerald-600', icon: '📥' },
                { label: 'Analyses', value: 5, total: 18, color: 'from-orange-500 to-orange-600', icon: '🔬' },
                { label: 'Rapports', value: 3, total: 18, color: 'from-purple-500 to-purple-600', icon: '📄' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-sm font-bold text-white">{item.icon} {item.label}</p>
                    <p className="text-sm font-bold text-brand">{item.value}/{item.total}</p>
                  </div>
                  <div className="h-2.5 rounded-full bg-border-dark/50 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} transition-all`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions Prioritaires */}
        <div className="space-y-6">
          {/* Actions prioritaires */}
          <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-surface-dark/80 to-bg-dark/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-5">⚡ Actions prioritaires</h2>

            <div className="space-y-3">
              {priorityActions.map(action => (
                <Link
                  key={action.id}
                  to={`/app/auditeur/missions/${action.mission_id}`}
                  className={`rounded-xl border-l-4 p-3.5 transition group ${
                    action.priority === 'critique'
                      ? 'border-l-red-500 bg-red-500/10 hover:bg-red-500/20 hover:border-l-red-400'
                      : action.priority === 'eleve'
                      ? 'border-l-orange-500 bg-orange-500/10 hover:bg-orange-500/20 hover:border-l-orange-400'
                      : 'border-l-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-l-yellow-400'
                  }`}
                >
                  <p className="text-xs font-bold text-text-on-dark-muted mb-1">{action.mission}</p>
                  <p className="text-sm font-bold text-white group-hover:text-brand transition">{action.action}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-surface-dark/80 to-bg-dark/50 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">📈 Statistiques</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-dark/30 hover:bg-bg-dark/50 transition">
                <p className="text-text-on-dark-muted">Temps d'audit</p>
                <p className="font-bold text-white">3h 45m</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-dark/30 hover:bg-bg-dark/50 transition">
                <p className="text-text-on-dark-muted">Documents</p>
                <p className="font-bold text-white">12 uploadés</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-dark/30 hover:bg-bg-dark/50 transition">
                <p className="text-text-on-dark-muted">Questions</p>
                <p className="font-bold text-white">24 répondues</p>
              </div>
              <div className="border-t border-border-dark pt-4 mt-4 flex items-center justify-between p-3 rounded-lg bg-bg-dark/30">
                <p className="text-text-on-dark-muted">Prochaine</p>
                <p className="font-bold text-brand">Étape collecte</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/app/auditeur/missions/1"
            className="rounded-xl border-2 border-brand bg-gradient-to-r from-brand to-brand-light p-6 hover:shadow-lg hover:shadow-brand/30 transition block group"
          >
            <div className="flex items-start gap-3">
              <Zap className="text-white flex-shrink-0 mt-1 group-hover:scale-110 transition" size={22} />
              <div>
                <p className="font-bold text-white mb-1">Reprendre où vous l'aviez laissé</p>
                <p className="text-sm text-white/90">Audit Sécurité Q3 — Étape collecte</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Vulnerabilities */}
      <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-surface-dark/80 to-bg-dark/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">🔴 Vulnérabilités récentes</h2>
          <Link to="/app/auditeur/vulnerabilites" className="text-sm font-bold text-brand hover:text-brand-light transition flex items-center gap-1">
            Voir tout <ArrowRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark/30">
                <th className="text-left px-4 py-3 font-bold text-text-on-dark-muted">CVE</th>
                <th className="text-left px-4 py-3 font-bold text-text-on-dark-muted">Asset</th>
                <th className="text-center px-4 py-3 font-bold text-text-on-dark-muted">CVSS</th>
                <th className="text-center px-4 py-3 font-bold text-text-on-dark-muted">Sévérité</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.slice(0, 5).map(v => (
                <tr key={v.id} className="border-b border-border-dark/20 hover:bg-bg-dark/50 transition">
                  <td className="px-4 py-3 font-bold text-white font-mono text-xs">{v.cve}</td>
                  <td className="px-4 py-3 text-text-on-dark">{v.asset}</td>
                  <td className="px-4 py-3 text-center font-bold text-brand">{v.cvss}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                      v.severity === 'critique' ? 'bg-red-600/30 text-red-300' :
                      v.severity === 'eleve' ? 'bg-orange-600/30 text-orange-300' :
                      'bg-yellow-600/30 text-yellow-300'
                    }`}>
                      {v.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
