import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Upload, FileText, Network, BrainCircuit, GaugeCircle, FileDown } from 'lucide-react'
import { Gauge, ProgressBar, SeverityBadge } from '../../../components/app/Shared'
import { missions, wizardSteps, vulnerabilities, complianceByReferential } from '../../../data/mock'

function StepBody({ slug }: { slug: string }) {
  switch (slug) {
    case 'mission':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Nom de la mission
            <input className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none" defaultValue="Audit ISO 27001" />
          </label>
          <label className="text-sm font-medium">
            Type d'audit
            <select className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none">
              <option>Conformité</option>
              <option>Technique</option>
              <option>Organisationnel</option>
            </select>
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium">Référentiels applicables</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {['ISO 27001', 'RGPD', 'NIS2', 'DORA', 'ANSSI'].map((r, i) => (
                <label key={r} className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold has-checked:border-brand has-checked:bg-brand/10 has-checked:text-brand">
                  <input type="checkbox" defaultChecked={i < 2} className="accent-brand" /> {r}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )
    case 'configuration':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold">A. Que voulez-vous auditer ?</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {['Infrastructure', 'Réseau', 'IAM', 'Cloud', 'Applications', 'Sécurité physique', 'Culture cyber'].map((m, i) => (
                <label key={m} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-2.5 text-xs font-semibold has-checked:border-brand has-checked:bg-brand/10">
                  <input type="checkbox" defaultChecked={i < 4} className="accent-brand" /> {m}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-4">
              <h3 className="text-sm font-bold">Ajouter au périmètre</h3>
              <select className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option>IP / CIDR</option>
                <option>Domaine</option>
                <option>Site physique</option>
                <option>Compte cloud</option>
                <option>Application</option>
              </select>
              <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Ex. 10.0.0.0/24" />
              <button type="button" className="mt-3 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white">
                Ajouter
              </button>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <h3 className="text-sm font-bold">Périmètre actuel</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ['IP/CIDR', '10.0.0.0/24'],
                  ['Domaine', 'banque-atlantique.ci'],
                  ['Cloud', 'AWS · compte production'],
                ].map(([type, val]) => (
                  <li key={val} className="flex items-center justify-between rounded border border-slate-100 px-3 py-2">
                    <span>
                      <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold">{type}</span>
                      {val}
                    </span>
                    <button type="button" className="text-xs text-brand hover:underline">Supprimer</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    case 'collecte':
      return (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Questionnaire', 100],
              ['Documents', 90],
              ['Nmap', 100],
              ['Nessus', 35],
            ].map(([label, pct]) => (
              <div key={label as string} className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-bold">{label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar value={pct as number} />
                  <span className="text-xs font-bold">{pct}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {['Nmap — Découverte des actifs (XML)', 'Nessus — Analyse des vulnérabilités (.nessus)'].map((t) => (
              <div key={t} className="rounded-md border border-dashed border-slate-300 p-6 text-center">
                <Upload size={22} className="mx-auto text-brand" />
                <p className="mt-2 text-sm font-semibold">{t}</p>
                <p className="mt-1 text-xs text-slate-500">Déposez le rapport ici — Upload → Scan antivirus → Parsing → Normalisation → Corrélation</p>
              </div>
            ))}
          </div>
        </div>
      )
    case 'cartographie':
      return (
        <div className="rounded-md border border-slate-200 p-6 text-center">
          <Network size={28} className="mx-auto text-brand" />
          <p className="mt-3 text-sm font-semibold">Topologie des actifs & heatmap des vulnérabilités</p>
          <p className="mt-1 text-xs text-slate-500">🔴 3 critiques · 🟠 12 élevées · 🟡 7 moyennes — construites automatiquement depuis vos scans importés.</p>
          <div className="mx-auto mt-5 grid max-w-md grid-cols-6 gap-1.5">
            {['bg-red-600','bg-orange-500','bg-emerald-500','bg-amber-400','bg-emerald-500','bg-red-600','bg-emerald-500','bg-amber-400','bg-orange-500','bg-emerald-500','bg-emerald-500','bg-amber-400','bg-emerald-500','bg-red-600','bg-emerald-500','bg-orange-500','bg-emerald-500','bg-emerald-500'].map((c, i) => (
              <div key={i} className={`h-8 rounded ${c}`} />
            ))}
          </div>
        </div>
      )
    case 'analyse':
      return (
        <div className="space-y-4">
          <p className="rounded-md border border-slate-200 bg-surface-light p-4 text-sm font-semibold">
            184 actifs analysés · 47 vulnérabilités · 32 contrôles évalués · 12 divergences détectées
          </p>
          <div className="space-y-3">
            {vulnerabilities.slice(0, 3).map((v) => (
              <div key={v.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{v.title}</p>
                  <SeverityBadge severity={v.severity} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Pourquoi : Exposition réseau · Vulnérabilité critique (CVSS {v.cvss}) · Actif métier critique ({v.asset})
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-bold"><BrainCircuit size={15} className="mr-1 inline text-brand" /> Divergence détectée — Vérification requise</p>
            <p className="mt-1 text-xs text-slate-600">
              Déclaration RSSI : « Segmentation réseau appliquée » — Observation technique : communication détectée entre VLAN Finance et VLAN Invités.
            </p>
          </div>
        </div>
      )
    case 'scoring':
      return (
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center">
            <Gauge value={78} size={170} />
            <p className="mt-2 text-sm font-bold">78 — Bon niveau</p>
            <div className="mt-4 rounded-md border border-slate-200 p-4 text-xs">
              <p className="font-bold">Pourquoi 78/100 ?</p>
              <ul className="mt-2 space-y-1">
                <li className="text-emerald-600">+12 conformité</li>
                <li className="text-red-600">−8 vulnérabilités critiques</li>
                <li className="text-red-600">−6 contrôles insuffisants</li>
                <li className="text-emerald-600">+4 mesures compensatoires</li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            {complianceByReferential.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{c.name}</span>
                  <span className="font-bold">{c.value}%</span>
                </div>
                <ProgressBar value={c.value} />
              </div>
            ))}
          </div>
        </div>
      )
    case 'rapport':
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold">Contenu du rapport</h3>
            <ul className="mt-3 space-y-2">
              {['Résumé exécutif', 'Méthodologie', 'Analyse de risques MEHARI', 'Cartographie des risques', 'Vulnérabilités', 'Constats & recommandations', "Plan d'action", 'Conclusion'].map((s, i) => (
                <li key={s}>
                  <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm has-checked:border-brand">
                    <input type="checkbox" defaultChecked={i !== 6} className="accent-brand" /> {s}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center rounded-md border border-slate-200 bg-bg-dark p-8 text-center">
            <FileText size={34} className="text-brand" />
            <p className="mt-3 text-sm font-bold text-white">RAPPORT D'AUDIT — Audit ISO 27001</p>
            <p className="mt-1 text-xs text-text-on-dark-muted">Période : 01/05/2026 — 21/05/2026</p>
            <GaugeCircle size={20} className="mt-4 text-status-compliant" />
            <button type="button" className="mt-5 flex items-center gap-1.5 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              <FileDown size={16} /> Générer le rapport (PDF)
            </button>
          </div>
        </div>
      )
    default:
      return null
  }
}

export function WizardStepPage() {
  const { id, step } = useParams()
  const mission = missions.find((m) => m.id === id) ?? missions[0]
  const idx = Math.max(0, wizardSteps.findIndex((s) => s.slug === step))
  const current = wizardSteps[idx]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          MISSION : {mission.type} — {mission.organization}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1 text-xs">
          {wizardSteps.map((s, i) => (
            <span key={s.slug} className="flex items-center gap-1">
              <Link
                to={`/app/auditeur/missions/${mission.id}/${s.slug}`}
                className={`rounded-full px-2.5 py-1 font-semibold ${
                  i === idx ? 'bg-brand text-white' : i < idx ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {s.label}
              </Link>
              {i < wizardSteps.length - 1 && <span className="text-slate-300">─</span>}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-2xl font-extrabold">
          Étape {idx + 1}/7 — {current.label}
        </h1>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
        <StepBody slug={current.slug} />
      </div>

      <div className="flex items-center justify-between">
        <Link to={`/app/auditeur/missions/${mission.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand">
          <ArrowLeft size={16} /> Retour au Command Center
        </Link>
        {idx < wizardSteps.length - 1 && (
          <Link
            to={`/app/auditeur/missions/${mission.id}/${wizardSteps[idx + 1].slug}`}
            className="flex items-center gap-1.5 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Enregistrer et continuer <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  )
}
