import { useState } from 'react'
import { ArrowLeft, Send, MoreVertical, AlertCircle, Clock, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProgressBar } from '../../../components/app/Shared'

interface Message {
  id: string
  from: string
  text: string
  timestamp: string
}

export function MissionDetailsPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'Jean Dupont',
      text: "J'ai terminé les contrôles ISO du périmètre réseau.",
      timestamp: '12:31',
    },
    {
      id: '2',
      from: 'RSSI',
      text: 'Merci. Vérifiez également les 3 actifs critiques.',
      timestamp: '12:35',
    },
  ])
  const [newMessage, setNewMessage] = useState('')

  const steps = [
    { number: 1, name: 'Mission', status: 'done', progress: 100 },
    { number: 2, name: 'Configuration', status: 'done', progress: 100 },
    { number: 3, name: 'Questionnaire', status: 'active', progress: 50 },
    { number: 4, name: 'Collecte', status: 'pending', progress: 0 },
    { number: 5, name: 'Cartographie', status: 'pending', progress: 0 },
    { number: 6, name: 'Analyse', status: 'pending', progress: 0 },
    { number: 7, name: 'Rapport', status: 'pending', progress: 0 },
  ]

  const auditors = [
    { name: 'Jean Dupont', role: 'LEADER', status: 'En cours', etape: 'Questionnaire', progress: 50, time: '8h 30' },
    { name: 'Marie Martin', role: 'CONTRIBUTEUR', status: 'En attente', etape: '—', progress: 0, time: '0h' },
  ]

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setMessages([
      ...messages,
      {
        id: String(messages.length + 1),
        from: 'RSSI',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setNewMessage('')
  }

  const getStatusColor = (status: string) => {
    if (status === 'done') return 'bg-green-600/20 text-green-400'
    if (status === 'active') return 'bg-brand/20 text-brand'
    return 'bg-border-dark text-text-on-dark-muted'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'done') return '✓'
    if (status === 'active') return '●'
    return '○'
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/app/rssi/missions" className="flex items-center gap-2 text-text-on-dark-muted hover:text-white transition mb-4">
            <ArrowLeft size={16} />
            <span className="text-sm font-semibold">Retour</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Audit ISO 27001 — Société ABC</h1>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-text-on-dark">EN COURS</span>
            </span>
            <span className="text-text-on-dark-muted">Deadline: 18 août</span>
            <span className="text-yellow-400 font-semibold">J-6</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition">
            Envoyer message
          </button>
          <button className="p-2 rounded-lg hover:bg-surface-dark text-text-on-dark-muted transition">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Progression */}
          <section className="rounded-lg border border-border-dark bg-surface-dark/50 p-6">
            <h2 className="text-lg font-bold text-white mb-6">Progression des 7 étapes</h2>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={step.number}>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getStatusColor(step.status)}`}>
                      {getStatusIcon(step.status)} {step.number}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{step.name}</p>
                      <p className="text-xs text-text-on-dark-muted">{step.progress}%</p>
                    </div>
                  </div>
                  {step.progress > 0 && (
                    <div className="ml-14 mb-2">
                      <ProgressBar value={step.progress} />
                    </div>
                  )}
                  {idx < steps.length - 1 && <div className="ml-5 h-8 border-l border-border-dark" />}
                </div>
              ))}
            </div>
          </section>

          {/* Auditors Progress */}
          <section className="rounded-lg border border-border-dark bg-surface-dark/50 p-6">
            <h2 className="text-lg font-bold text-white mb-6">Progression des auditeurs</h2>
            <div className="space-y-4">
              {auditors.map((auditor) => (
                <div key={auditor.name} className="p-4 rounded-lg border border-border-dark bg-bg-dark/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{auditor.name}</p>
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-brand/20 text-brand">{auditor.role}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          auditor.status === 'En cours'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {auditor.status === 'En cours' ? '●' : '●'} {auditor.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-on-dark-muted mt-2">
                        Étape: <strong className="text-text-on-dark">{auditor.etape}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{auditor.progress}%</p>
                      <p className="text-xs text-text-on-dark-muted">Progression</p>
                    </div>
                  </div>
                  <ProgressBar value={auditor.progress} />
                  <div className="flex items-center gap-2 mt-3 text-xs text-text-on-dark-muted">
                    <Clock size={14} />
                    <span>Temps investi: <strong className="text-text-on-dark">{auditor.time}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Provisional Metrics */}
          <section className="rounded-lg border border-border-dark bg-surface-dark/50 p-6">
            <h2 className="text-lg font-bold text-white mb-6">Métriques provisoires</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-bg-dark">
                <p className="text-xs text-text-on-dark-muted uppercase tracking-wide">Score</p>
                <p className="text-3xl font-bold text-brand mt-1">68</p>
                <p className="text-xs text-text-on-dark-muted mt-1">/ 100</p>
              </div>
              <div className="p-4 rounded-lg bg-bg-dark">
                <p className="text-xs text-text-on-dark-muted uppercase tracking-wide">Conformité</p>
                <p className="text-3xl font-bold text-green-400 mt-1">64 %</p>
              </div>
              <div className="p-4 rounded-lg bg-bg-dark">
                <p className="text-xs text-text-on-dark-muted uppercase tracking-wide">Vulnérabilités</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">8</p>
              </div>
              <div className="p-4 rounded-lg bg-bg-dark">
                <p className="text-xs text-text-on-dark-muted uppercase tracking-wide">Critiques</p>
                <p className="text-3xl font-bold text-red-400 mt-1">3</p>
              </div>
            </div>
            <div className="text-xs text-text-on-dark-muted pt-4 border-t border-border-dark">
              Dernière mise à jour: Il y a 12 min
            </div>
          </section>

          {/* Communication */}
          <section className="rounded-lg border border-border-dark bg-surface-dark/50 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              Communication
            </h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'RSSI' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.from === 'RSSI'
                        ? 'bg-brand/20 text-brand'
                        : 'bg-bg-dark border border-border-dark text-text-on-dark'
                    }`}
                  >
                    {msg.from !== 'RSSI' && (
                      <p className="text-xs font-bold mb-1">{msg.from}</p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-75">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Envoyer message aux auditeurs..."
                className="flex-1 px-4 py-2 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition flex items-center gap-2"
              >
                <Send size={16} />
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mission Info */}
          <section className="rounded-lg border border-border-dark bg-surface-dark/50 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Détails de la mission</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-on-dark-muted text-xs mb-1">Type</p>
                <p className="font-semibold text-text-on-dark">Audit de conformité</p>
              </div>
              <div>
                <p className="text-text-on-dark-muted text-xs mb-1">Priorité</p>
                <p className="font-semibold text-text-on-dark">Haute</p>
              </div>
              <div>
                <p className="text-text-on-dark-muted text-xs mb-1">Référentiels</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 rounded text-xs bg-brand/20 text-brand">ISO 27001</span>
                  <span className="px-2 py-1 rounded text-xs bg-brand/20 text-brand">NIST</span>
                </div>
              </div>
              <div className="pt-3 border-t border-border-dark">
                <p className="text-text-on-dark-muted text-xs mb-1">Actifs</p>
                <p className="font-semibold text-text-on-dark">24 actifs</p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="rounded-lg border border-border-dark bg-surface-dark/50 p-6 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Actions</h3>
            <button className="w-full px-4 py-2 rounded-lg border border-brand text-brand hover:bg-brand/10 transition font-semibold text-sm">
              Étendre deadline
            </button>
            <button className="w-full px-4 py-2 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition font-semibold text-sm">
              Ajouter auditeur
            </button>
            <button className="w-full px-4 py-2 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition font-semibold text-sm">
              Télécharger rapport
            </button>
            <button className="w-full px-4 py-2 rounded-lg border border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10 transition font-semibold text-sm">
              Fermer audit
            </button>
            <button className="w-full px-4 py-2 rounded-lg border border-red-600/50 text-red-400 hover:bg-red-600/10 transition font-semibold text-sm">
              Archiver
            </button>
          </section>

          {/* Alerts */}
          <section className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-4">
            <div className="flex gap-3">
              <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-300 mb-1">Attention</p>
                <p className="text-yellow-200 text-xs">3 vulnérabilités critiques restent ouvertes</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
