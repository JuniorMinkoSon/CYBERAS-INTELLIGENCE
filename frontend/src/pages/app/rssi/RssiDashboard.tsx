import { Link } from 'react-router-dom'
import { KpiCard, Gauge, RiskMatrix, ProgressBar } from '../../../components/app/Shared'
import { riskMatrix, complianceByReferential, activities, missions } from '../../../data/mock'

export function RssiDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Bienvenue, Armand T.</h1>
        <p className="text-sm text-text-on-dark-muted">Voici la posture de sécurité globale de votre organisation.</p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-lg border border-border-dark bg-surface-dark p-6 sm:flex-row">
        <Gauge value={78} size={150} dark />
        <div>
          <p className="text-lg font-bold text-white">78/100 — Bon niveau (+6 vs mois dernier)</p>
          <div className="mt-3 grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-4">
            <span><span className="block text-2xl font-extrabold text-status-critical">12</span><span className="text-text-on-dark-muted">Risques critiques</span></span>
            <span><span className="block text-2xl font-extrabold text-white">248</span><span className="text-text-on-dark-muted">Vulnérabilités</span></span>
            <span><span className="block text-2xl font-extrabold text-status-compliant">78%</span><span className="text-text-on-dark-muted">Conformité</span></span>
            <span><span className="block text-2xl font-extrabold text-status-high">9</span><span className="text-text-on-dark-muted">Actions en retard</span></span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand/40 bg-brand/10 p-4">
        <p className="text-sm font-semibold text-white">
          Ce qui demande votre attention : 3 risques critiques · 11 vulnérabilités élevées · 4 actions en retard
        </p>
        <Link to="/app/rssi/risques" className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Voir les priorités →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
          <h2 className="font-bold text-white">Cartographie des risques (méthode MEHARI)</h2>
          <div className="mt-4">
            <RiskMatrix matrix={riskMatrix} dark />
          </div>
        </section>
        <div className="space-y-4">
          <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
            <h2 className="font-bold text-white">Conformité par référentiel</h2>
            <div className="mt-4 space-y-3">
              {complianceByReferential.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-text-on-dark">{c.name}</span>
                    <span className="font-bold text-white">{c.value}%</span>
                  </div>
                  <ProgressBar value={c.value} dark />
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
            <h2 className="font-bold text-white">Activités récentes</h2>
            <ul className="mt-3 space-y-2.5">
              {activities.slice(0, 3).map((a) => (
                <li key={a.title} className="text-sm">
                  <span className="font-semibold text-text-on-dark">{a.title}</span>
                  <span className="block text-xs text-text-on-dark-muted">{a.detail} · {a.time}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white">Missions / Audits en cours</h2>
          <Link to="/app/rssi/missions" className="text-sm font-semibold text-brand hover:underline">Voir toutes les missions →</Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {missions.slice(0, 4).map((m) => (
            <KpiCard key={m.id} dark value={`${m.progress}%`} label={`${m.name} · ${m.deadline}`} />
          ))}
        </div>
      </section>
    </div>
  )
}
