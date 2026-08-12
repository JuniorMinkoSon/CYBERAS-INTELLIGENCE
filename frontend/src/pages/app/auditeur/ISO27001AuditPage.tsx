import { useState } from 'react'
import { ChevronDown, Save, FileDown, CheckCircle2, AlertCircle } from 'lucide-react'
import { ProgressBar } from '../../../components/app/Shared'
import iso27001 from '../../../data/iso27001.json'

interface ControlAnswer {
  rating: 'conforme' | 'partiellement' | 'non-conforme' | 'non-applicable' | ''
  justification: string
  proofs: string[]
}

export function ISO27001AuditPage() {
  const [answers, setAnswers] = useState<Record<string, ControlAnswer>>({})
  const [activeCategory, setActiveCategory] = useState(iso27001.controls[0].category)
  const [expandedControl, setExpandedControl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const groupedControls = iso27001.controls.reduce((acc, control) => {
    if (!acc[control.category]) acc[control.category] = []
    acc[control.category].push(control)
    return acc
  }, {} as Record<string, typeof iso27001.controls>)

  const categories = Object.keys(groupedControls).sort()
  const answeredCount = Object.values(answers).filter(a => a.rating).length
  const completionPercent = Math.round((answeredCount / iso27001.controls.length) * 100)

  const categoryStats = categories.map(cat => {
    const total = groupedControls[cat].length
    const answered = groupedControls[cat].filter(c => answers[c.id]?.rating).length
    return { category: cat, answered, total, percent: Math.round((answered / total) * 100) }
  })

  const handleRatingChange = (controlId: string, rating: ControlAnswer['rating']) => {
    setAnswers(prev => ({
      ...prev,
      [controlId]: { ...prev[controlId] || { justification: '', proofs: [] }, rating }
    }))
  }

  const handleJustificationChange = (controlId: string, justification: string) => {
    setAnswers(prev => ({
      ...prev,
      [controlId]: { ...prev[controlId] || { rating: '', proofs: [] }, justification }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setTimeout(() => {
      console.log('Réponses sauvegardées:', answers)
      setSaving(false)
    }, 1000)
  }

  const ratingColors: Record<string, string> = {
    conforme: 'bg-green-600/20 text-green-300 border-green-500/50',
    partiellement: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/50',
    'non-conforme': 'bg-red-600/20 text-red-300 border-red-500/50',
    'non-applicable': 'bg-blue-600/20 text-blue-300 border-blue-500/50'
  }

  const ratingLabels: Record<string, string> = {
    conforme: 'Conforme',
    partiellement: 'Partiellement conforme',
    'non-conforme': 'Non conforme',
    'non-applicable': 'Non applicable'
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">ISO 27001:2022</h1>
        <p className="text-text-on-dark-muted">Questionnaire d'évaluation de conformité — Audit de sécurité informatique</p>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold uppercase tracking-wide text-text-on-dark-muted">Completion</p>
            <p className="text-3xl font-extrabold text-brand">{completionPercent}%</p>
          </div>
          <div className="h-3 rounded-full bg-border-dark overflow-hidden">
            <div className="h-full bg-brand transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <p className="text-xs text-text-on-dark-muted mt-3">{answeredCount} / {iso27001.controls.length} contrôles évalués</p>
        </div>

        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-text-on-dark-muted mb-3">Conformité estimée</p>
          <p className="text-3xl font-extrabold text-green-400">{Math.round((answeredCount / iso27001.controls.length) * 100 * 0.75)}%</p>
          <p className="text-xs text-text-on-dark-muted mt-3">Basée sur les réponses actuelles</p>
        </div>

        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-text-on-dark-muted mb-3">Catégories</p>
          <div className="space-y-2">
            {categoryStats.filter(s => s.answered > 0).slice(0, 2).map(stat => (
              <div key={stat.category} className="text-xs">
                <p className="text-white font-bold">{stat.category}</p>
                <p className="text-text-on-dark-muted">{stat.answered}/{stat.total}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar — Categories Navigation */}
        <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {categories.map((category) => {
            const stat = categoryStats.find(s => s.category === category)!
            const isActive = activeCategory === category

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`w-full text-left px-4 py-3 rounded-lg transition border-l-4 ${
                  isActive
                    ? 'border-l-brand bg-brand/10 text-white font-bold'
                    : 'border-l-border-dark text-text-on-dark hover:bg-bg-dark/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  {stat.answered === stat.total ? (
                    <span className="text-green-400 text-xs font-bold">✓</span>
                  ) : stat.answered > 0 ? (
                    <span className="text-xs font-bold text-brand">{stat.answered}/{stat.total}</span>
                  ) : null}
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-border-dark overflow-hidden">
                  <div
                    className="h-full bg-brand transition-all"
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Main Content — Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Category Header */}
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h2 className="text-2xl font-extrabold text-white mb-2">{activeCategory}</h2>
            <p className="text-sm text-text-on-dark-muted">
              {groupedControls[activeCategory].length} contrôles — {categoryStats.find(s => s.category === activeCategory)?.percent || 0}% complétés
            </p>
          </div>

          {/* Controls List */}
          <div className="space-y-4">
            {groupedControls[activeCategory].map((control) => {
              const answer = answers[control.id] || { rating: '', justification: '', proofs: [] }
              const isExpanded = expandedControl === control.id
              const isComplete = answer.rating !== ''

              return (
                <div
                  key={control.id}
                  className={`rounded-lg border-2 transition ${
                    isComplete
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-border-dark bg-bg-dark/50'
                  }`}
                >
                  <button
                    onClick={() => setExpandedControl(isExpanded ? null : control.id)}
                    className="w-full text-left px-6 py-4 flex items-start justify-between hover:bg-bg-dark/30 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm flex-shrink-0 ${
                            isComplete
                              ? 'bg-green-600 text-white'
                              : 'bg-brand/10 text-brand'
                          }`}
                        >
                          {isComplete ? '✓' : control.id.split('.')[1]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{control.question}</p>
                          <p className="text-xs text-text-on-dark-muted mt-0.5">{control.id} — {control.title}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      {answer.rating && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ratingColors[answer.rating]}`}>
                          {ratingLabels[answer.rating]}
                        </span>
                      )}
                      <ChevronDown
                        size={20}
                        className={`text-text-on-dark-muted transition ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border-dark px-6 py-4 space-y-4">
                      {/* Rating Options */}
                      <div>
                        <p className="text-xs font-bold text-text-on-dark-muted mb-3 uppercase">Évaluation du contrôle</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'conforme', label: '✓ Conforme', color: 'green' },
                            { value: 'partiellement', label: '⚠ Partiellement conforme', color: 'yellow' },
                            { value: 'non-conforme', label: '✕ Non conforme', color: 'red' },
                            { value: 'non-applicable', label: '⊘ Non applicable', color: 'blue' }
                          ].map(option => (
                            <button
                              key={option.value}
                              onClick={() => handleRatingChange(control.id, option.value as ControlAnswer['rating'])}
                              className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                                answer.rating === option.value
                                  ? `bg-${option.color}-600 text-white`
                                  : 'border border-border-dark text-text-on-dark hover:border-brand'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Justification */}
                      <div>
                        <label className="text-xs font-bold text-text-on-dark-muted mb-2 block uppercase">Justification</label>
                        <textarea
                          value={answer.justification}
                          onChange={(e) => handleJustificationChange(control.id, e.target.value)}
                          placeholder="Décrivez les éléments observés, politiques en place, mesures de contrôle identifiées..."
                          rows={3}
                          className="w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2 text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none text-sm"
                        />
                      </div>

                      {/* Proofs */}
                      <div>
                        <label className="text-xs font-bold text-text-on-dark-muted mb-2 block uppercase">Preuves/Documents</label>
                        <button className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-border-dark text-text-on-dark-muted hover:border-brand hover:text-brand transition text-sm">
                          + Ajouter un document
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-border-dark">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand text-white font-bold hover:bg-brand-dark transition disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Enregistrement...' : 'Enregistrer les réponses'}
        </button>
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-brand text-brand font-bold hover:bg-brand/10 transition">
          <FileDown size={16} />
          Exporter le rapport
        </button>
        {completionPercent === 100 && (
          <div className="ml-auto flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/20 border border-green-500/50 text-green-300">
            <CheckCircle2 size={16} />
            Questionnaire complété
          </div>
        )}
      </div>
    </div>
  )
}
