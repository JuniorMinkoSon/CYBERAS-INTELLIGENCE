import { useState } from 'react'
import { Play, Pause, CheckCircle, Clock, AlertCircle, Zap, Shield, Target, Wrench, Cpu } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

const agentIcons: Record<string, any> = {
  nmap: Target,
  nessus: Zap,
  openvas: Shield,
  burp: Wrench,
  qualys: AlertCircle,
}

const agentCapabilities: Record<string, string[]> = {
  nmap: ['Découverte réseau', 'Scan ports', 'Détection OS'],
  nessus: ['Vulnérabilités', 'Compliance', 'Configuration'],
  openvas: ['Scannerité complète', 'Rapports détaillés', 'APIs'],
  burp: ['Pentest web', 'Analyse automatiqu', 'Proxy'],
  qualys: ['Gestion vulns', 'Conformité', 'Riskmetrics'],
}

export function AgentsIaPage() {
  const { user } = useAuth()
  const [scanningAgent, setScanningAgent] = useState<string | null>(null)

  const handleStartScan = (agentId: string) => {
    setScanningAgent(agentId)
    setTimeout(() => setScanningAgent(null), 3000)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
            <Cpu size={20} className="text-brand" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Agents IA & Scans</h1>
        </div>
        <p className="text-text-on-dark-muted max-w-2xl">Déployer et gérez vos outils de scan automatisés pour auditer votre infrastructure en temps réel.</p>
      </div>

      {/* Subscription Info Card */}
      {user?.subscription && (
        <div className="rounded-xl border border-border-dark bg-gradient-to-r from-surface-dark/50 to-bg-dark/50 backdrop-blur-sm p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Plan actuel</p>
              <p className="text-3xl font-bold text-white mt-2">{user.subscription.plan}</p>
              <p className="text-sm text-brand font-semibold mt-1">{user.subscription.price}/mois</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Agents inclus</p>
              <div className="flex flex-wrap gap-2">
                {user.agents?.map((agent) => (
                  <span key={agent.id} className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-medium">
                    {agent.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted mb-4">Agents disponibles</p>
        <div className="grid gap-6 md:grid-cols-2">
          {user?.agents?.map((agent) => {
            const IconComponent = agentIcons[agent.type] || Shield
            const isScanning = scanningAgent === agent.id
            const capabilities = agentCapabilities[agent.type] || []

            return (
              <div
                key={agent.id}
                className="group rounded-xl border border-border-dark bg-surface-dark/50 hover:border-brand/50 hover:bg-surface-dark transition p-6 space-y-4"
              >
                {/* Header with Icon and Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 group-hover:bg-brand/20 transition">
                      <IconComponent size={28} className="text-brand" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                      <p className="text-sm text-text-on-dark-muted mt-0.5">{agent.description}</p>
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                      agent.status === 'completed'
                        ? 'bg-green-500/20'
                        : agent.status === 'scanning'
                          ? 'bg-yellow-500/20'
                          : 'bg-text-on-dark-muted/10'
                    }`}
                  >
                    {agent.status === 'completed' ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : agent.status === 'scanning' ? (
                      <Zap size={18} className="text-yellow-400 animate-pulse" />
                    ) : (
                      <Clock size={18} className="text-text-on-dark-muted" />
                    )}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((cap, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-bg-dark text-text-on-dark-muted text-xs font-medium">
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Last Scan & Status */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-dark">
                  {agent.lastScan && (
                    <div>
                      <p className="text-xs text-text-on-dark-muted">Dernier scan</p>
                      <p className="text-sm font-semibold text-text-on-dark mt-0.5">{agent.lastScan}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-text-on-dark-muted">Statut</p>
                    <p className={`text-sm font-semibold mt-0.5 capitalize ${
                      agent.status === 'completed' ? 'text-green-400' :
                      agent.status === 'scanning' ? 'text-yellow-400' :
                      'text-text-on-dark-muted'
                    }`}>
                      {agent.status === 'completed' ? 'Actif' : agent.status === 'scanning' ? 'Scannage' : 'Inactif'}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleStartScan(agent.id)}
                  disabled={isScanning}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${
                    isScanning
                      ? 'bg-yellow-600/30 text-yellow-400 cursor-not-allowed border border-yellow-500/30'
                      : 'bg-brand hover:bg-brand-dark text-white border border-brand/50'
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

      {/* Info Box */}
      <div className="rounded-xl border border-border-dark bg-bg-dark/50 p-6">
        <p className="text-sm text-text-on-dark-muted">
          <strong className="text-text-on-dark">💡 Tip:</strong> Utilisez les agents pour automatiser vos scans de sécurité. Les résultats sont intégrés directement dans vos missions d'audit.
        </p>
      </div>
    </div>
  )
}
