import { useEffect, useState } from 'react'
import { Plus, Loader } from 'lucide-react'
import { assetsClient } from '../../services/assetsClient'
import type { Asset } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'

export function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Assets</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded transition">
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
          <p className="text-text-on-dark-muted">Aucun asset trouvé</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border-dark bg-surface-dark overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark">
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Hostname</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">IP</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Type</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Env</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Criticité</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-border-dark hover:bg-surface-dark/50">
                  <td className="px-6 py-4">{asset.hostname || '-'}</td>
                  <td className="px-6 py-4 font-mono text-sm">{asset.ipAddress || '-'}</td>
                  <td className="px-6 py-4">{asset.assetType}</td>
                  <td className="px-6 py-4">{asset.environment}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      asset.criticality === 'CRITICAL' ? 'bg-red-500/10 text-red-400' :
                      asset.criticality === 'HIGH' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {asset.criticality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
