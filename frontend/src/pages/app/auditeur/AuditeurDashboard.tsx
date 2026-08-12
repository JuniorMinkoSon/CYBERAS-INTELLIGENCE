import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, Zap, FileText, ArrowRight } from 'lucide-react'
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
      <div>
        <h1 className="text-4xl font-extrabold text-white">Bonjour {auditName} 👋</h1>
        <p className="text-lg text-text-on-dark-muted mt-2">Gérez vos audits de sécurité en temps réel</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/app/auditeur/missions"
          className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6 hover:border-brand transition group"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-bold text-text-on-dark-muted uppercase">Missions actives</p>
            <Zap className="text-brand group-hover:scale-110 transition" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-brand">{missionsActive}</p>
          <p className="text-xs text-text-on-dark-muted mt-2">En cours</p>
        </Link>

        <div className="rounded-lg border-2 border-orange-500/30 bg-orange-500/10 p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-bold text-orange-300 uppercase">En retard</p>
            <Clock className="text-orange-400" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-orange-400">{missionsOverdue}</p>
          <p className="text-xs text-orange-200 mt-2">À accélérer</p>
        </div>

        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-bold text-text-on-dark-muted uppercase">Vulnérabilités</p>
            <AlertTriangle className="text-brand" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-brand">{totalVulns}</p>
          <p className="text-xs text-text-on-dark-muted mt-2">Détectées</p>
        </div>

        <div className="rounded-lg border-2 border-red-500/30 bg-red-500/10 p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-bold text-red-300 uppercase">Critiques</p>
            <AlertTriangle className="text-red-400" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-red-400">{criticalVulns}</p>
          <p className="text-xs text-red-200 mt-2">Action immédiate</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Mes Missions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mes missions */}
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Mes missions</h2>
              <Link to="/app/auditeur/missions" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {missions.map(m => (
                <Link
                  key={m.id}
                  to={`/app/auditeur/missions/${m.id}`}
                  className="rounded-lg border-2 border-border-dark hover:border-brand transition p-5 bg-bg-dark/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-white">{m.name}</p>
                      <p className="text-xs text-text-on-dark-muted mt-1">{m.organization}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-2xl font-extrabold text-brand">{m.progress}%</p>
                      <p className="text-xs text-text-on-dark-muted">Progression</p>
                    </div>
                  </div>

                  <ProgressBar value={m.progress} />

                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      m.status === 'Complétée' ? 'bg-green-600/20 text-green-300' :
                      m.status === 'En cours' ? 'bg-blue-600/20 text-blue-300' :
                      'bg-yellow-600/20 text-yellow-300'
                    }`}>
                      {m.status}
                    </span>
                    <span className="text-xs text-text-on-dark-muted">
                      Échéance: <strong>{m.deadline}</strong>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Progression globale */}
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h2 className="text-lg font-bold text-white mb-6">Progression globale des audits</h2>

            <div className="space-y-6">
              {[
                { label: 'Questionnaires complétés', value: 12, total: 18, color: 'blue' },
                { label: 'Collecte de données', value: 8, total: 18, color: 'green' },
                { label: 'Analyses terminées', value: 5, total: 18, color: 'orange' },
                { label: 'Rapports générés', value: 3, total: 18, color: 'purple' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className={`text-sm font-bold text-${item.color}-400`}>{item.value}/{item.total}</p>
                  </div>
                  <div className="h-2 rounded-full bg-border-dark overflow-hidden">
                    <div
                      className={`h-full bg-${item.color}-500 transition-all`}
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
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Actions prioritaires</h2>

            <div className="space-y-3">
              {priorityActions.map(action => (
                <Link
                  key={action.id}
                  to={`/app/auditeur/missions/${action.mission_id}`}
                  className={`rounded-lg border-l-4 p-3 transition group ${
                    action.priority === 'critique'
                      ? 'border-l-red-500 bg-red-500/5 hover:border-l-red-400'
                      : action.priority === 'eleve'
                      ? 'border-l-orange-500 bg-orange-500/5 hover:border-l-orange-400'
                      : 'border-l-yellow-500 bg-yellow-500/5 hover:border-l-yellow-400'
                  }`}
                >
                  <p className="text-xs font-bold text-text-on-dark-muted mb-1">{action.mission}</p>
                  <p className="text-sm font-bold text-white group-hover:text-brand transition">{action.action}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Aujourd'hui</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-on-dark-muted">Temps d'audit</p>
                <p className="font-bold text-white">3h 45m</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-text-on-dark-muted">Documents</p>
                <p className="font-bold text-white">12 uploadés</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-text-on-dark-muted">Questions</p>
                <p className="font-bold text-white">24 répondues</p>
              </div>
              <div className="border-t border-border-dark pt-4 mt-4 flex items-center justify-between">
                <p className="text-text-on-dark-muted">Prochaine</p>
                <p className="font-bold text-brand">Étape collecte</p>
              </div>
            </div>
          </div>

          {/* Recommended Next Step */}
          <Link
            to="/app/auditeur/missions/1"
            className="rounded-lg border-2 border-brand bg-brand/10 p-6 hover:bg-brand/20 transition block"
          >
            <div className="flex items-start gap-3">
              <Zap className="text-brand flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-white mb-1">Reprendre là où vous l'aviez laissé</p>
                <p className="text-sm text-text-on-dark-muted">Audit Sécurité Q3 — Étape collecte</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Vulnerabilities */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Vulnérabilités récentes</h2>
          <Link to="/app/auditeur/vulnerabilites" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark">
                <th className="text-left px-4 py-3 font-bold text-text-on-dark-muted">CVE</th>
                <th className="text-left px-4 py-3 font-bold text-text-on-dark-muted">Asset</th>
                <th className="text-center px-4 py-3 font-bold text-text-on-dark-muted">CVSS</th>
                <th className="text-center px-4 py-3 font-bold text-text-on-dark-muted">Sévérité</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.slice(0, 5).map(v => (
                <tr key={v.id} className="border-b border-border-dark hover:bg-bg-dark/50 transition">
                  <td className="px-4 py-3 font-bold text-white">{v.cve}</td>
                  <td className="px-4 py-3 text-text-on-dark">{v.asset}</td>
                  <td className="px-4 py-3 text-center font-bold text-brand">{v.cvss}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      v.severity === 'critique' ? 'bg-red-600/20 text-red-300' :
                      v.severity === 'eleve' ? 'bg-orange-600/20 text-orange-300' :
                      'bg-yellow-600/20 text-yellow-300'
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
