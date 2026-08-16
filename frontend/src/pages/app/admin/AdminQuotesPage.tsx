import { useState } from 'react'
import { Download, Trash2, Eye, CheckCircle, AlertCircle, Archive } from 'lucide-react'
import { PageHero } from '../../../components/marketing/Shared'

export function AdminQuotesPage() {
  // Mock data: Rapports reçus avec types (gold, silver, medium)
  const [quotes, setQuotes] = useState([
    {
      id: 1,
      missionId: 101,
      orgName: 'Acme Corp',
      type: 'gold',
      score: 92,
      findings: 3,
      status: 'received',
      receivedAt: '2026-08-15T14:30:00',
      file: 'audit-report-acme-2026-08-15.pdf',
    },
    {
      id: 2,
      missionId: 102,
      orgName: 'TechStart Inc',
      type: 'silver',
      score: 78,
      findings: 8,
      status: 'received',
      receivedAt: '2026-08-14T10:15:00',
      file: 'audit-report-techstart-2026-08-14.pdf',
    },
    {
      id: 3,
      missionId: 103,
      orgName: 'FinanceFlow Ltd',
      type: 'medium',
      score: 65,
      findings: 15,
      status: 'received',
      receivedAt: '2026-08-13T16:45:00',
      file: 'audit-report-financeflow-2026-08-13.pdf',
    },
    {
      id: 4,
      missionId: 104,
      orgName: 'SecureBank Co',
      type: 'gold',
      score: 96,
      findings: 1,
      status: 'validated',
      receivedAt: '2026-08-12T09:20:00',
      file: 'audit-report-securebank-2026-08-12.pdf',
    },
  ])

  const [filter, setFilter] = useState<'all' | 'gold' | 'silver' | 'medium' | 'deleted'>('all')
  const [selectedQuote, setSelectedQuote] = useState<number | null>(null)
  const [showActionModal, setShowActionModal] = useState<{ id: number; action: 'catalog' | 'reject' } | null>(null)

  // Filtrer les quotes
  const filteredQuotes = quotes.filter(q => {
    if (filter === 'all') return !q.type.includes('deleted')
    if (filter === 'deleted') return q.type.includes('deleted')
    return q.type === filter
  })

  // Supprimer un quote
  const handleDelete = (id: number) => {
    setQuotes(quotes.map(q =>
      q.id === id ? { ...q, type: `deleted ${q.type}`, status: 'deleted' as any } : q
    ))
  }

  // Valider un quote
  const handleValidate = (id: number) => {
    setQuotes(quotes.map(q =>
      q.id === id ? { ...q, status: 'validated' } : q
    ))
  }

  // Type badge color
  const getTypeBadgeColor = (type: string) => {
    if (type.includes('gold')) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (type.includes('silver')) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (type.includes('medium')) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (type.includes('deleted')) return 'bg-red-100 text-red-800 border-red-300'
    return 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    if (type.includes('gold')) return '🏆'
    if (type.includes('silver')) return '🥈'
    if (type.includes('medium')) return '📊'
    if (type.includes('deleted')) return '🗑️'
    return '📋'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand/10 via-surface-dark/50 to-bg-dark rounded-2xl p-8 mb-8 border border-brand/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white">📋 Gestion des Rapports</h1>
            <p className="text-text-on-dark-muted mt-2">Rapports d'audit reçus - Validation et gestion</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-brand">{filteredQuotes.length}</div>
            <div className="text-sm text-text-on-dark-muted">Rapports {filter === 'all' ? 'actifs' : filter}</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { label: '📋 Tous', value: 'all' as const },
          { label: '🏆 Gold', value: 'gold' as const },
          { label: '🥈 Silver', value: 'silver' as const },
          { label: '📊 Medium', value: 'medium' as const },
          { label: '🗑️ Supprimés', value: 'deleted' as const },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              filter === value
                ? 'bg-brand text-white'
                : 'bg-surface-dark text-text-on-dark hover:bg-surface-dark/80 border border-border-dark'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-dark/50 rounded-xl border border-border-dark overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-dark/50 bg-bg-dark/50">
                <th className="px-6 py-4 text-left text-sm font-bold text-text-on-dark-muted">Type</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-text-on-dark-muted">Organisation</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-text-on-dark-muted">Score</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-text-on-dark-muted">Findings</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-text-on-dark-muted">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-text-on-dark-muted">Reçu le</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-text-on-dark-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-border-dark/30 hover:bg-brand/5 transition"
                >
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${getTypeBadgeColor(quote.type)}`}>
                      <span>{getTypeIcon(quote.type)}</span>
                      <span className="capitalize">{quote.type.replace('deleted ', '')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-semibold">{quote.orgName}</div>
                    <div className="text-xs text-text-on-dark-muted">Mission #{quote.missionId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-lg font-bold ${getScoreColor(quote.score)}`}>{quote.score}%</div>
                    <div className="w-20 h-1.5 bg-border-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full transition ${
                          quote.score >= 90 ? 'bg-green-500' :
                          quote.score >= 75 ? 'bg-blue-500' :
                          quote.score >= 60 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${quote.score}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle size={16} className="text-red-400" />
                      <span className="text-sm font-semibold text-red-300">{quote.findings}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {quote.status === 'validated' ? (
                        <>
                          <CheckCircle size={16} className="text-green-400" />
                          <span className="text-sm font-semibold text-green-300">Validé</span>
                        </>
                      ) : quote.status === 'deleted' ? (
                        <>
                          <Archive size={16} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-400">Supprimé</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} className="text-yellow-400" />
                          <span className="text-sm font-semibold text-yellow-300">En attente</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-on-dark-muted">
                    {new Date(quote.receivedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedQuote(quote.id)}
                        className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition"
                        title="Voir le rapport"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {}}
                        className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition"
                        title="Télécharger"
                      >
                        <Download size={18} />
                      </button>
                      {quote.status !== 'validated' && quote.status !== 'deleted' && (
                        <>
                          <button
                            onClick={() => setShowActionModal({ id: quote.id, action: 'catalog' })}
                            className="px-3 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition font-semibold"
                            title="Référencer au catalogue"
                          >
                            📚 Catalogue
                          </button>
                          <button
                            onClick={() => setShowActionModal({ id: quote.id, action: 'reject' })}
                            className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition font-semibold"
                            title="Rejeter"
                          >
                            ✕ Rejeter
                          </button>
                        </>
                      )}
                      {quote.status !== 'deleted' && (
                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal - Catalogue ou Rejeter */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-dark rounded-xl border border-border-dark max-w-lg w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {showActionModal.action === 'catalog' ? '📚 Référencer au Catalogue' : '✕ Rejeter le Rapport'}
            </h2>

            {showActionModal.action === 'catalog' ? (
              <div className="space-y-4">
                <p className="text-text-on-dark">Sélectionnez une catégorie pour référencer ce rapport :</p>
                <div className="grid gap-3">
                  {['Gold - Audit Excellent', 'Silver - Audit Bon', 'Medium - Audit Acceptable', 'Template Standard'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        handleValidate(showActionModal.id)
                        setShowActionModal(null)
                      }}
                      className="p-4 text-left border border-brand/50 rounded-lg hover:bg-brand/10 transition font-semibold text-white"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-text-on-dark">Raison du rejet :</p>
                <textarea
                  placeholder="Expliquez pourquoi ce rapport est rejeté..."
                  className="w-full p-3 rounded-lg bg-bg-dark border border-border-dark text-white placeholder-text-on-dark-muted focus:border-brand outline-none"
                  rows={4}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleDelete(showActionModal.id)
                      setShowActionModal(null)
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => setShowActionModal(null)}
                    className="flex-1 bg-border-dark hover:bg-border-dark/80 text-text-on-dark font-bold py-2 px-4 rounded-lg transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-dark rounded-xl border border-border-dark max-w-2xl w-full max-h-96 overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                {quotes.find(q => q.id === selectedQuote)?.file}
              </h2>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-text-on-dark-muted hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {quotes.find(q => q.id === selectedQuote) && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Organisation</p>
                    <p className="text-white font-bold">{quotes.find(q => q.id === selectedQuote)?.orgName}</p>
                  </div>
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Score</p>
                    <p className={`text-lg font-bold ${getScoreColor(quotes.find(q => q.id === selectedQuote)?.score || 0)}`}>
                      {quotes.find(q => q.id === selectedQuote)?.score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Findings</p>
                    <p className="text-red-300 font-bold">{quotes.find(q => q.id === selectedQuote)?.findings}</p>
                  </div>
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Type</p>
                    <p className="text-white font-bold capitalize">{quotes.find(q => q.id === selectedQuote)?.type.replace('deleted ', '')}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-dark/50">
                  <button className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg transition">
                    📥 Télécharger le rapport
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
