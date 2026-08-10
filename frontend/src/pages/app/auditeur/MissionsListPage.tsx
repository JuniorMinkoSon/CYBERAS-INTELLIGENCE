import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ProgressBar, StatusPill } from '../../../components/app/Shared'
import { missions } from '../../../data/mock'

export function MissionsListPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Missions d'audit</h1>
          <p className="text-sm text-slate-500">Suivez et gérez toutes vos missions d'audit.</p>
        </div>
        <button type="button" className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          <Plus size={16} /> Nouvelle mission
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Mission</th>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Périmètre</th>
              <th className="px-4 py-3">Avancement</th>
              <th className="px-4 py-3">Échéance</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-surface-light">
                <td className="px-4 py-3 font-semibold">
                  <Link to={`/app/auditeur/missions/${m.id}`} className="text-brand hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{m.organization}</td>
                <td className="px-4 py-3">{m.type}</td>
                <td className="px-4 py-3">{m.perimeter}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={m.progress} />
                    <span className="w-9 text-xs font-bold">{m.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">{m.deadline}</td>
                <td className="px-4 py-3">
                  <StatusPill status={m.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
