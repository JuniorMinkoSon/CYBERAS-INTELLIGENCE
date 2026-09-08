import { useEffect, useState } from 'react'
import { Plus, Loader, Settings2, Globe, Trash2 } from 'lucide-react'
import { assetsClient } from '../../services/assetsClient'
import type { Asset } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'
import { AssetForm } from './AssetForm'

/** Teinte de la criticité — la même partout où l'inventaire est présenté. */
const CRITICALITY_STYLE: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const CRITICALITY_LABEL: Record<string, string> = {
  CRITICAL: 'Critique', HIGH: 'Haute', MEDIUM: 'Moyenne', LOW: 'Faible',
}

export function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // null = fermé ; undefined = ouvert en création ; un actif = ouvert en édition.
  const [editing, setEditing] = useState<Asset | null | undefined>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { notify } = useNotification()

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    setLoading(true)
    try {
      const data = await assetsClient.list()
      setAssets(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-brand" size={48} />
      </div>
    )
  }

  const remove = async (asset: Asset) => {
    const name = asset.hostname || asset.ipAddress || 'cet actif'
    if (!window.confirm(`Retirer ${name} de l’inventaire ?`)) return
    setDeleting(asset.id)
    try {
      await assetsClient.delete(asset.id)
      notify('Actif retiré', 'success')
      await loadAssets()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Suppression impossible', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Assets</h1>
          <p className="mt-1 text-sm text-text-on-dark-muted">
            {assets.length} actif(s) — la criticité et l&apos;exposition saisies ici
            pondèrent le score de risque de chaque constat.
          </p>
        </div>
        <button
          onClick={() => setEditing(undefined)}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded transition"
        >
          <Plus size={20} />
          Nouvel asset
        </button>
      </div>

      {error && (
        <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {assets.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <p className="text-text-on-dark-muted">Aucun actif dans l&apos;inventaire.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-on-dark-muted">
            Sans inventaire, les constats d&apos;un scan ne sont rattachés à aucune
            machine et le risque ne peut pas être contextualisé.
          </p>
          <button
            onClick={() => setEditing(undefined)}
            className="mt-5 inline-flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <Plus size={18} />
            Déclarer un premier actif
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-dark bg-surface-dark">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="border-b border-border-dark">
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Hostname</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">IP</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Type</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Env</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Criticité</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Exposition</th>
                <th className="px-6 py-3 text-right font-semibold text-text-on-dark">Configurer</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-border-dark hover:bg-surface-dark/50">
                  <td className="px-6 py-4">
                    {asset.hostname || <span className="text-text-on-dark-muted">—</span>}
                    {asset.owner && (
                      <span className="mt-0.5 block text-xs text-text-on-dark-muted">{asset.owner}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{asset.ipAddress || '—'}</td>
                  <td className="px-6 py-4">
                    {asset.assetType}
                    {asset.operatingSystem && (
                      <span className="mt-0.5 block text-xs text-text-on-dark-muted">{asset.operatingSystem}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{asset.environment}</td>
                  <td className="px-6 py-4">
                    {/* Une criticité inconnue n'est pas rangée avec les moyennes :
                        elle s'affiche telle quelle, en neutre, pour rester visible. */}
                    <span className={`rounded border px-2 py-1 text-xs font-medium ${
                      CRITICALITY_STYLE[asset.criticality] ?? 'border-border-dark text-text-on-dark-muted'
                    }`}>
                      {CRITICALITY_LABEL[asset.criticality] ?? asset.criticality}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {asset.internetExposed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                        <Globe size={14} /> Internet
                      </span>
                    ) : (
                      <span className="text-xs text-text-on-dark-muted">Interne</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(asset)}
                        className="inline-flex items-center gap-1.5 rounded border border-border-dark px-2.5 py-1.5 text-xs font-medium text-text-on-dark-muted transition hover:border-brand hover:text-white"
                      >
                        <Settings2 size={14} /> Configurer
                      </button>
                      <button
                        onClick={() => remove(asset)}
                        disabled={deleting === asset.id}
                        aria-label="Retirer de l'inventaire"
                        className="rounded border border-border-dark p-1.5 text-text-on-dark-muted transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <AssetForm
          asset={editing}
          onClose={() => setEditing(null)}
          onSaved={loadAssets}
        />
      )}
    </div>
  )
}
