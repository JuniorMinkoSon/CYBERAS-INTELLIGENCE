import { useState } from 'react'
import { Save, ArrowRight, ChevronLeft, CheckCircle2, Plus } from 'lucide-react'

interface Mission {
  name: string
  type: string
  priority: string
  organization: string
  startDate: string
  deadline: string
  budget: string
  description: string
  referentiels: string[]
  perimeterDomains: string[]
  perimeterAssets: string[]
  auditorsAssigned: { name: string; role: 'leader' | 'contributor' }[]
  instructions: string
}

const referentielsData: Record<string, { title: string; description: string; controlCount: number }> = {
  'ISO 27001': {
    title: 'ISO 27001:2022',
    description: 'Système de management de la sécurité de l\'information',
    controlCount: 118,
  },
  'ISO 27002': {
    title: 'ISO 27002:2022',
    description: 'Code de bonne pratique pour la gestion de la sécurité de l\'information',
    controlCount: 118,
  },
  'NIST CSF': {
    title: 'NIST Cybersecurity Framework',
    description: 'Cadre de cybersécurité du NIST',
    controlCount: 43,
  },
  'RGPD': {
    title: 'Règlement Général sur la Protection des Données',
    description: 'Conformité européenne sur la protection des données',
    controlCount: 99,
  },
  'PCI-DSS': {
    title: 'Payment Card Industry Data Security Standard',
    description: 'Normes de sécurité pour les données de cartes bancaires',
    controlCount: 192,
  },
}

const domainsData = ['Infrastructure', 'Réseau', 'Applications', 'Cloud', 'IAM', 'Sécurité physique', 'Données']

const assetsData = [
  { name: 'SRV-WEB-01', ip: '192.168.1.20', type: 'Serveur', criticality: 'Critique' },
  { name: 'DB-01', ip: '192.168.1.30', type: 'Base de données', criticality: 'Critique' },
  { name: 'FW-MAIN', ip: '10.0.0.1', type: 'Firewall', criticality: 'Critique' },
]

const auditorsAvailable = [
  { name: 'Jean Dupont', status: 'Disponible', specialties: ['ISO 27001', 'Pentest'] },
  { name: 'Marie Martin', status: 'Disponible', specialties: ['NIST', 'Risk Management'] },
  { name: 'Pierre Durand', status: 'En mission', specialties: ['RGPD', 'Audit technique'] },
]

export function MissionCreationPage() {
  const steps = ['info', 'referentiels', 'perimetre', 'auditeurs', 'validation', 'confirmation'] as const
  const [step, setStep] = useState<typeof steps[number]>('info')
  const [mission, setMission] = useState<Mission>({
    name: '',
    type: '',
    priority: '',
    organization: '',
    startDate: '',
    deadline: '',
    budget: '',
    description: '',
    referentiels: [],
    perimeterDomains: [],
    perimeterAssets: [],
    auditorsAssigned: [],
    instructions: '',
  })
  const [loading, setLoading] = useState(false)

  const currentStepIndex = steps.indexOf(step)

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1])
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1])
    }
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const missionId = `AUDIT-${Date.now()}`
      alert(`Mission créée avec succès! ID: ${missionId}`)
      // Reset form
      setMission({
        name: '',
        type: '',
        priority: '',
        organization: '',
        startDate: '',
        deadline: '',
        budget: '',
        description: '',
        referentiels: [],
        perimeterDomains: [],
        perimeterAssets: [],
        auditorsAssigned: [],
        instructions: '',
      })
      setStep('info')
    } finally {
      setLoading(false)
    }
  }

  const totalControls = mission.referentiels.reduce((sum, ref) => sum + (referentielsData[ref]?.controlCount || 0), 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handlePrev} className="text-text-on-dark-muted hover:text-white" disabled={currentStepIndex === 0}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-white">Créer une Mission</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
                i < currentStepIndex
                  ? 'bg-green-600/30 text-green-400 border border-green-600'
                  : i === currentStepIndex
                  ? 'bg-brand text-white border border-brand'
                  : 'bg-border-dark text-text-on-dark-muted border border-border-dark'
              }`}
            >
              {i < currentStepIndex ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-1 ${i < currentStepIndex ? 'bg-green-600/30' : 'bg-border-dark'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Informations */}
      {step === 'info' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-4">
          <h2 className="text-lg font-bold text-white mb-6">Étape 1 — Informations</h2>

          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="text-sm font-medium text-text-on-dark">Nom de la mission</span>
              <input
                type="text"
                value={mission.name}
                onChange={(e) => setMission({ ...mission, name: e.target.value })}
                placeholder="Audit Sécurité Q3 2026"
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-text-on-dark">Type d'audit</span>
              <select
                value={mission.type}
                onChange={(e) => setMission({ ...mission, type: e.target.value })}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              >
                <option value="">Sélectionner</option>
                <option value="Conformité">Audit de conformité</option>
                <option value="Cybersécurité">Audit cybersécurité</option>
                <option value="Technique">Audit technique</option>
                <option value="ISO 27001">Audit ISO 27001</option>
                <option value="Pentest">Pentest</option>
                <option value="Hybride">Audit hybride</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="text-sm font-medium text-text-on-dark">Priorité</span>
              <select
                value={mission.priority}
                onChange={(e) => setMission({ ...mission, priority: e.target.value })}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              >
                <option value="">Sélectionner</option>
                <option value="Basse">Basse</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
                <option value="Critique">Critique</option>
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-text-on-dark">Organisation</span>
              <input
                type="text"
                value={mission.organization}
                onChange={(e) => setMission({ ...mission, organization: e.target.value })}
                placeholder="Nom de l'organisation"
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="text-sm font-medium text-text-on-dark">Date de début</span>
              <input
                type="date"
                value={mission.startDate}
                onChange={(e) => setMission({ ...mission, startDate: e.target.value })}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-text-on-dark">Échéance</span>
              <input
                type="date"
                value={mission.deadline}
                onChange={(e) => setMission({ ...mission, deadline: e.target.value })}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              />
            </label>
          </div>

          <label>
            <span className="text-sm font-medium text-text-on-dark">Budget estimé (€)</span>
            <input
              type="number"
              value={mission.budget}
              onChange={(e) => setMission({ ...mission, budget: e.target.value })}
              placeholder="0"
              className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
            />
          </label>

          <label>
            <span className="text-sm font-medium text-text-on-dark">Description / Contexte</span>
            <textarea
              value={mission.description}
              onChange={(e) => setMission({ ...mission, description: e.target.value })}
              placeholder="Décrire le contexte et les objectifs de cette mission..."
              rows={3}
              className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
            />
          </label>
        </div>
      )}

      {/* Step 2: Référentiels */}
      {step === 'referentiels' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Étape 2 — Référentiels</h2>

          <div className="space-y-3">
            {Object.entries(referentielsData).map(([key, ref]) => (
              <div
                key={key}
                onClick={() => {
                  const isSelected = mission.referentiels.includes(key)
                  setMission({
                    ...mission,
                    referentiels: isSelected
                      ? mission.referentiels.filter((r) => r !== key)
                      : [...mission.referentiels, key],
                  })
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  mission.referentiels.includes(key)
                    ? 'border-brand bg-brand/10'
                    : 'border-border-dark bg-bg-dark hover:border-brand/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={mission.referentiels.includes(key)}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-white">{ref.title}</p>
                    <p className="text-sm text-text-on-dark-muted mt-1">{ref.description}</p>
                    <p className="text-xs text-brand font-semibold mt-2">{ref.controlCount} contrôles</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-bg-dark border border-border-dark">
            <p className="text-sm text-text-on-dark-muted mb-2">Résumé</p>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-xs text-text-on-dark-muted">Référentiels sélectionnés</p>
                <p className="text-lg font-bold text-white">{mission.referentiels.length}</p>
              </div>
              <div>
                <p className="text-xs text-text-on-dark-muted">Contrôles à évaluer</p>
                <p className="text-lg font-bold text-brand">{totalControls}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Périmètre */}
      {step === 'perimetre' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Étape 3 — Périmètre</h2>

          <div>
            <h3 className="text-sm font-bold text-white mb-3">Domaines</h3>
            <div className="space-y-2">
              {domainsData.map((domain) => (
                <label key={domain} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={mission.perimeterDomains.includes(domain)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMission({ ...mission, perimeterDomains: [...mission.perimeterDomains, domain] })
                      } else {
                        setMission({
                          ...mission,
                          perimeterDomains: mission.perimeterDomains.filter((d) => d !== domain),
                        })
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-text-on-dark">{domain}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border-dark pt-6">
            <h3 className="text-sm font-bold text-white mb-3">Actifs inclus</h3>
            <div className="space-y-2 mb-4">
              {assetsData.map((asset) => (
                <label key={asset.name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={mission.perimeterAssets.includes(asset.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMission({ ...mission, perimeterAssets: [...mission.perimeterAssets, asset.name] })
                      } else {
                        setMission({
                          ...mission,
                          perimeterAssets: mission.perimeterAssets.filter((a) => a !== asset.name),
                        })
                      }
                    }}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{asset.name}</p>
                    <p className="text-xs text-text-on-dark-muted">{asset.ip} — {asset.type}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    asset.criticality === 'Critique' ? 'bg-red-600/20 text-red-300' : 'bg-yellow-600/20 text-yellow-300'
                  }`}>
                    {asset.criticality}
                  </span>
                </label>
              ))}
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-light transition">
              <Plus size={16} /> Ajouter un actif
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Auditeurs */}
      {step === 'auditeurs' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Étape 4 — Auditeurs</h2>

          <div className="flex items-center justify-between p-4 rounded-lg bg-bg-dark border border-border-dark">
            <span className="text-sm text-text-on-dark-muted">Auditeurs assignés</span>
            <span className="text-lg font-bold text-brand">{mission.auditorsAssigned.length} / 2</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-3">Sélection</h3>
            <div className="space-y-2">
              {auditorsAvailable.map((auditor) => (
                <div key={auditor.name} className="flex items-start justify-between p-4 rounded-lg border border-border-dark bg-bg-dark/50">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{auditor.name}</p>
                    <p className={`text-xs mt-1 ${auditor.status === 'Disponible' ? 'text-green-400' : 'text-yellow-400'}`}>
                      ● {auditor.status}
                    </p>
                    <p className="text-xs text-text-on-dark-muted mt-2">Spécialités: {auditor.specialties.join(', ')}</p>
                  </div>
                  {mission.auditorsAssigned.length < 2 && (
                    <button
                      onClick={() => {
                        if (!mission.auditorsAssigned.some((a) => a.name === auditor.name)) {
                          setMission({
                            ...mission,
                            auditorsAssigned: [...mission.auditorsAssigned, { name: auditor.name, role: 'leader' }],
                          })
                        }
                      }}
                      className="ml-4 px-3 py-1 rounded bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition"
                    >
                      Assigner
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {mission.auditorsAssigned.length > 0 && (
            <div className="border-t border-border-dark pt-6">
              <h3 className="text-sm font-bold text-white mb-3">Répartition des tâches</h3>
              <div className="space-y-4">
                {mission.auditorsAssigned.map((auditor, idx) => (
                  <div key={auditor.name} className="p-4 rounded-lg border border-border-dark bg-bg-dark/50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-white">{auditor.name}</p>
                      <select
                        value={auditor.role}
                        onChange={(e) => {
                          const updated = [...mission.auditorsAssigned]
                          updated[idx].role = e.target.value as 'leader' | 'contributor'
                          setMission({ ...mission, auditorsAssigned: updated })
                        }}
                        className="px-2 py-1 rounded text-xs bg-bg-dark border border-border-dark text-white"
                      >
                        <option value="leader">LEADER</option>
                        <option value="contributor">CONTRIBUTEUR</option>
                      </select>
                    </div>
                    <div className="space-y-1 text-sm">
                      {['Questionnaire', 'Collecte', 'Cartographie', 'Analyse', 'Rapport'].map((task) => (
                        <label key={task} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked={Math.random() > 0.5} />
                          <span className="text-text-on-dark-muted">{task}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label>
              <span className="text-sm font-medium text-text-on-dark">Instructions pour les auditeurs</span>
              <textarea
                value={mission.instructions}
                onChange={(e) => setMission({ ...mission, instructions: e.target.value })}
                placeholder="Priorité sur les actifs critiques..."
                rows={2}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
              />
            </label>
          </div>
        </div>
      )}

      {/* Step 5: Validation */}
      {step === 'validation' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Étape 5 — Validation</h2>

          <div className="grid gap-4">
            <div className="p-4 rounded-lg bg-bg-dark border border-border-dark">
              <p className="text-xs text-text-on-dark-muted mb-1">MISSION</p>
              <p className="text-lg font-bold text-white">{mission.name || '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-bg-dark border border-border-dark">
                <p className="text-xs text-text-on-dark-muted mb-1">TYPE</p>
                <p className="font-bold text-text-on-dark">{mission.type || '—'}</p>
              </div>
              <div className="p-4 rounded-lg bg-bg-dark border border-border-dark">
                <p className="text-xs text-text-on-dark-muted mb-1">PRIORITÉ</p>
                <p className="font-bold text-text-on-dark">{mission.priority || '—'}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-bg-dark border border-border-dark">
              <p className="text-xs text-text-on-dark-muted mb-2">RÉFÉRENTIELS</p>
              <div className="flex flex-wrap gap-2">
                {mission.referentiels.length > 0 ? (
                  mission.referentiels.map((ref) => (
                    <span key={ref} className="px-2 py-1 rounded bg-brand/30 text-brand text-sm font-semibold">
                      {ref}
                    </span>
                  ))
                ) : (
                  <span className="text-text-on-dark-muted">—</span>
                )}
              </div>
              <p className="text-xs text-text-on-dark-muted mt-2">{totalControls} contrôles</p>
            </div>

            <div className="p-4 rounded-lg bg-bg-dark border border-border-dark">
              <p className="text-xs text-text-on-dark-muted mb-2">PÉRIMÈTRE</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {mission.perimeterDomains.length > 0 ? (
                  mission.perimeterDomains.map((domain) => (
                    <span key={domain} className="px-2 py-1 rounded bg-green-600/30 text-green-300 text-xs">
                      {domain}
                    </span>
                  ))
                ) : (
                  <span className="text-text-on-dark-muted">—</span>
                )}
              </div>
              <p className="text-xs text-text-on-dark-muted">{mission.perimeterAssets.length} actifs</p>
            </div>

            <div className="p-4 rounded-lg bg-bg-dark border border-border-dark">
              <p className="text-xs text-text-on-dark-muted mb-2">AUDITEURS</p>
              {mission.auditorsAssigned.length > 0 ? (
                <div className="space-y-1">
                  {mission.auditorsAssigned.map((a) => (
                    <p key={a.name} className="text-sm text-text-on-dark">
                      {a.name} — <span className="text-brand text-xs uppercase font-bold">{a.role}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <span className="text-text-on-dark-muted">—</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Confirmation */}
      {step === 'confirmation' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-600/20 border border-green-600 flex items-center justify-center">
              <CheckCircle2 className="text-green-400" size={32} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Mission créée</h2>
            <p className="text-brand font-mono font-bold">AUDIT-{Date.now().toString().slice(-6)}</p>
          </div>

          <div className="p-4 rounded-lg bg-bg-dark border border-border-dark">
            <p className="font-bold text-white text-lg">{mission.name}</p>
            <p className="text-sm text-text-on-dark-muted mt-1">Statut: <span className="text-yellow-400 font-semibold">EN ATTENTE DE DÉMARRAGE</span></p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={16} />
              <span>Mission créée</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={16} />
              <span>Auditeurs assignés</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={16} />
              <span>Invitations préparées</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={16} />
              <span>Périmètre enregistré</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={16} />
              <span>Référentiels configurés</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 rounded-lg border border-border-dark text-text-on-dark hover:text-white disabled:opacity-50 font-semibold transition"
        >
          Retour
        </button>
        <div className="flex-1" />
        {step !== 'confirmation' ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition"
          >
            Continuer <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold transition"
          >
            <Save size={16} /> {loading ? 'Création...' : 'Créer mission'}
          </button>
        )}
      </div>
    </div>
  )
}
