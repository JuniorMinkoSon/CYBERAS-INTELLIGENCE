import { useMemo, useState } from 'react'
import { Search, FileText, Download, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SeverityBadge, StatusPill, RiskMatrix } from '../../../components/app/Shared'
import { risks, riskMatrix, assets, reports, missions } from '../../../data/mock'
import { ProgressBar } from '../../../components/app/Shared'

const searchCls =
  'w-full rounded-md border border-border-dark bg-surface-dark py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none'

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative max-w-sm flex-1">
      <Search size={15} className="absolute left-3 top-3 text-text-on-dark-muted" />
      <input className={searchCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export function RisquesPage() {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('tous')

  const filtered = useMemo(
    () =>
      risks.filter(
        (r) =>
          (level === 'tous' || r.level === level) &&
          (r.label.toLowerCase().includes(query.toLowerCase()) || r.domain.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, level],
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Risques</h1>
        <p className="text-text-on-dark-muted mt-2">Cartographie et registre des risques (méthode MEHARI).</p>
      </div>

      <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <h2 className="font-bold text-white mb-4">Matrice des risques</h2>
        <div className="mt-4 max-w-xl">
          <RiskMatrix matrix={riskMatrix} dark />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={query} onChange={setQuery} placeholder="Rechercher un risque ou un domaine…" />
        <div className="flex gap-1.5">
          {['tous', 'tres-eleve', 'eleve', 'moyen'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                level === l ? 'bg-brand text-white' : 'bg-surface-dark text-text-on-dark-muted hover:text-white'
              }`}
            >
              {l === 'tous' ? 'Tous' : l === 'tres-eleve' ? 'Très élevé' : l === 'eleve' ? 'Élevé' : 'Moyen'}
            </button>
          ))}
        </div>
      </div>

<div className="rounded-lg border border-border-dark bg-surface-dark overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-dark text-left text-xs uppercase tracking-wide text-text-on-dark-muted">
              <th className="px-4 py-3">Risque</th>
              <th className="px-4 py-3">Domaine</th>
              <th className="px-4 py-3">Impact</th>
              <th className="px-4 py-3">Probabilité</th>
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border-dark last:border-0 hover:bg-bg-dark">
                <td className="px-4 py-3 font-semibold text-white">{r.label}</td>
                <td className="px-4 py-3 text-text-on-dark">{r.domain}</td>
                <td className="px-4 py-3 text-text-on-dark">{r.impact}/5</td>
                <td className="px-4 py-3 text-text-on-dark">{r.probability}/5</td>
                <td className="px-4 py-3"><SeverityBadge severity={r.level} /></td>
                <td className="px-4 py-3">
                  <button className="text-sm font-semibold text-brand hover:text-brand-light transition">
                    Détails →
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-on-dark-muted">Aucun risque ne correspond à votre recherche.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AssetsPage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () =>
      assets.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.type.toLowerCase().includes(query.toLowerCase()) ||
          a.ip.includes(query),
      ),
    [query],
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Assets</h1>
        <p className="text-sm text-text-on-dark-muted">Inventaire des actifs découverts par les scans.</p>
      </div>
      <SearchBox value={query} onChange={setQuery} placeholder="Rechercher par nom, type ou IP…" />
      <div className="overflow-x-auto rounded-lg border border-border-dark bg-surface-dark">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border-dark text-left text-xs uppercase tracking-wide text-text-on-dark-muted">
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Adresse IP</th>
              <th className="px-4 py-3">OS / Firmware</th>
              <th className="px-4 py-3">Criticité</th>
              <th className="px-4 py-3">Vulnérabilités</th>
              <th className="px-4 py-3">Dernier scan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.name} className="border-b border-border-dark last:border-0 hover:bg-bg-dark">
                <td className="px-4 py-3 font-mono text-xs font-bold text-white">{a.name}</td>
                <td className="px-4 py-3 text-text-on-dark">{a.type}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-on-dark">{a.ip}</td>
                <td className="px-4 py-3 text-text-on-dark">{a.os}</td>
                <td className="px-4 py-3"><SeverityBadge severity={a.criticality} /></td>
                <td className="px-4 py-3 font-bold text-white">{a.vulns}</td>
                <td className="px-4 py-3 text-text-on-dark">{a.lastScan}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-on-dark-muted">Aucun actif ne correspond à votre recherche.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RapportsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Rapports</h1>
        <p className="text-sm text-text-on-dark-muted">Rapports d'audit générés par la plateforme.</p>
      </div>
      <div className="grid gap-3">
        {reports.map((r) => (
          <div key={r.name} className="flex flex-wrap items-center gap-4 rounded-lg border border-border-dark bg-surface-dark p-4">
            <FileText size={20} className="shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{r.name}</p>
              <p className="text-xs text-text-on-dark-muted">
                {r.mission} · {r.type} · {r.pages} pages · {r.date}
              </p>
            </div>
            <StatusPill status={r.status} />
            <button type="button" className="flex items-center gap-1.5 rounded-md border border-border-dark px-3 py-2 text-xs font-semibold text-text-on-dark hover:border-brand hover:text-white">
              <Download size={14} /> PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RssiMissionsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Audits & Missions</h1>
          <p className="text-text-on-dark-muted mt-2">Suivi des missions d'audit menées sur votre organisation.</p>
        </div>
        <Link to="/app/rssi/missions/creer" className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition">
          + Nouvelle mission
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {missions.map((m) => (
          <Link
            key={m.id}
            to={`/app/rssi/missions/${m.id}`}
            className="rounded-lg border border-border-dark bg-surface-dark p-5 hover:border-brand transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white group-hover:text-brand transition">{m.name}</p>
              <StatusPill status={m.status} />
            </div>
            <p className="text-xs text-text-on-dark-muted mb-3">
              {m.organization} · {m.type} · Échéance <strong>{m.deadline}</strong>
            </p>
            <div className="mt-3 flex items-center gap-3 mb-3">
              <ProgressBar value={m.progress} dark />
              <span className="text-xs font-bold text-white">{m.progress}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand group-hover:text-brand-light transition">
              Voir détails <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
