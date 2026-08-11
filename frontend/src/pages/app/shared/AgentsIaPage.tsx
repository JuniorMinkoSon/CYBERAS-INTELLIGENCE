import { useState } from 'react'
import { Play, Pause, CheckCircle, Clock, AlertCircle, Zap, Shield, Target, Wrench } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

const agentIcons: Record<string, any> = {
  nmap: Target,
  nessus: Zap,
  openvas: Shield,
  burp: Wrench,
  qualys: AlertCircle,
}

export function AgentsIaPage() {
  const { user } = useAuth()
  const [scanningAgent, setScanningAgent] = useState<string | null>(null)

  const handleStartScan = (agentId: string) => {
    setScanningAgent(agentId)
    setTimeout(() => setScanningAgent(null), 3000)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Agents IA & Scans</h1>
        <p className="text-sm text-text-on-dark-muted">Gérez vos outils de scan automatisés</p>
      </div>

      {/* Subscription Info */}
      {user?.subscription && (
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-on-dark-muted">Plan actuel</p>
              <p className="text-2xl font-bold text-white">{user.subscription.plan}</p>
              <p className="text-sm text-brand">{user.subscription.price}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {user.subscription.features.slice(0, 4).map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-text-on-dark-muted">
                  <CheckCircle size={12} className="text-green-400" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {user?.agents?.map((agent) => {
          const IconComponent = agentIcons[agent.type] || Shield
          const isScanning = scanningAgent === agent.id

          return (
            <div
              key={agent.id}
              className="card-hover group rounded-lg border border-border-dark bg-gradient-to-br from-surface-dark to-bg-dark p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 group-hover:bg-brand/20 transition">
                  <IconComponent size={24} className="text-brand" />
                </div>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    agent.status === 'completed'
                      ? 'bg-green-500/20'
                      : agent.status === 'scanning'
                        ? 'bg-yellow-500/20'
                        : 'bg-gray-500/20'
                  }`}
                >
                  {agent.status === 'completed' ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : agent.status === 'scanning' ? (
                    <Zap size={16} className="text-yellow-400 animate-pulse" />
                  ) : (
                    <Clock size={16} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div>
                <h3 className="font-bold text-white">{agent.name}</h3>
                <p className="mt-1 text-xs text-text-on-dark-muted">{agent.description}</p>
              </div>

              {/* Last Scan */}
              {agent.lastScan && (
                <p className="text-xs text-text-on-dark-muted">
                  Dernier scan: <span className="text-text-on-dark">{agent.lastScan}</span>
                </p>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleStartScan(agent.id)}
                disabled={isScanning}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${
                  isScanning
                    ? 'bg-yellow-600 text-white cursor-not-allowed'
                    : 'bg-brand/20 text-brand hover:bg-brand/30'
                }`}
              >
                {isScanning ? (
                  <>
                    <Pause size={16} /> Scan en cours...
                  </>
                ) : (
                  <>
                    <Play size={16} /> Lancer scan
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
