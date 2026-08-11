import { useState } from 'react'
import { ArrowRight, CheckCircle, Save } from 'lucide-react'
import { ProgressBar } from '../../../components/app/Shared'

interface AuditForm {
  missionName: string
  organization: string
  auditType: string
  scope: string
  startDate: string
  endDate: string
  auditorsCount: number
  selectedDimensions: string[]
  normsApplicable: string[]
}

const auditDimensions = [
  { id: 'governance', label: 'Gouvernance SSI', description: 'Politiques, SMSI, gestion des risques' },
  { id: 'compliance', label: 'Conformité', description: 'RGPD, ISO 27001, PCI-DSS, HIPAA' },
  { id: 'infrastructure', label: 'Infrastructure', description: 'Serveurs, systèmes, configurations' },
  { id: 'network', label: 'Réseau', description: 'Segmentation, pare-feu, VPN, architecture' },
  { id: 'iam', label: 'IAM & Active Directory', description: 'Identités, accès, privilèges' },
  { id: 'applications', label: 'Applications', description: 'Code, vulnérabilités, OWASP' },
  { id: 'physical', label: 'Sécurité Physique', description: 'Accès physiques, locaux, équipements' },
  { id: 'awareness', label: 'Sensibilisation', description: 'Facteur humain, formations, phishing' },
]

const applicableNorms = [
  'ISO 27001',
  'ISO 27002',
  'RGPD',
  'NIST Cybersecurity Framework',
  'CIS Controls',
  'PCI-DSS',
  'HIPAA',
  'ANSSI',
  'COBIT',
]

export function AuditFormPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<AuditForm>({
    missionName: '',
    organization: '',
    auditType: 'complet',
    scope: '',
    startDate: '',
    endDate: '',
    auditorsCount: 1,
    selectedDimensions: [],
    normsApplicable: [],
  })
  const [saving, setSaving] = useState(false)

  const progress = (step / 4) * 100

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simuler une sauvegarde
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert('Audit sauvegardé avec succès!')
    } finally {
      setSaving(false)
    }
  }

  const toggleDimension = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedDimensions: prev.selectedDimensions.includes(id)
        ? prev.selectedDimensions.filter((d) => d !== id)
        : [...prev.selectedDimensions, id],
    }))
  }

  const toggleNorm = (norm: string) => {
    setForm((prev) => ({
      ...prev,
      normsApplicable: prev.normsApplicable.includes(norm)
        ? prev.normsApplicable.filter((n) => n !== norm)
        : [...prev.normsApplicable, norm],
    }))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Créer une nouvelle mission d'audit</h1>
        <p className="text-sm text-text-on-dark-muted mt-2">Étape {step} / 4</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <ProgressBar value={progress} dark />
      </div>

      {/* Form Steps */}
      <div className="rounded-lg border border-border-dark bg-surface-dark/50 backdrop-blur-sm p-8 space-y-6">
        {/* Step 1: Informations Générales */}
        {step === 1 && (
          <div className="space-y-4 fade-in-up">
            <h2 className="text-lg font-bold text-white">Informations générales</h2>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Nom de la mission</span>
              <input
                type="text"
                value={form.missionName}
                onChange={(e) => setForm({ ...form, missionName: e.target.value })}
                placeholder="Audit Sécurité 2026 Q3"
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Organisation auditée</span>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="Acme Corp"
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Type d'audit</span>
              <select
                value={form.auditType}
                onChange={(e) => setForm({ ...form, auditType: e.target.value })}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition"
              >
                <option value="complet">Audit complet</option>
                <option value="conformite">Audit de conformité</option>
                <option value="technique">Audit technique</option>
                <option value="gouvernance">Audit de gouvernance</option>
              </select>
            </label>
          </div>
        )}

        {/* Step 2: Périmètre et Calendrier */}
        {step === 2 && (
          <div className="space-y-4 fade-in-up">
            <h2 className="text-lg font-bold text-white">Périmètre et calendrier</h2>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Périmètre d'audit</span>
              <textarea
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
                placeholder="Infrastructure complète, 5 bureaux, 200 utilisateurs..."
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition"
                rows={3}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-text-on-dark">Date de début</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-text-on-dark">Date de fin</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Nombre d'auditeurs</span>
              <input
                type="number"
                min="1"
                value={form.auditorsCount}
                onChange={(e) => setForm({ ...form, auditorsCount: parseInt(e.target.value) || 1 })}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition"
              />
            </label>
          </div>
        )}

        {/* Step 3: Dimensions d'Audit */}
        {step === 3 && (
          <div className="space-y-4 fade-in-up">
            <h2 className="text-lg font-bold text-white">Dimensions à auditer</h2>
            <p className="text-sm text-text-on-dark-muted">Sélectionnez les domaines à évaluer</p>

            <div className="grid gap-3">
              {auditDimensions.map((dim) => (
                <button
                  key={dim.id}
                  onClick={() => toggleDimension(dim.id)}
                  className={`text-left p-4 rounded-lg border transition ${
                    form.selectedDimensions.includes(dim.id)
                      ? 'border-brand bg-brand/10'
                      : 'border-border-dark bg-bg-dark hover:border-brand/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-5 w-5 rounded border mt-0.5 flex items-center justify-center transition ${
                        form.selectedDimensions.includes(dim.id)
                          ? 'bg-brand border-brand'
                          : 'border-border-dark'
                      }`}
                    >
                      {form.selectedDimensions.includes(dim.id) && (
                        <CheckCircle size={16} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{dim.label}</p>
                      <p className="text-xs text-text-on-dark-muted">{dim.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Normes Applicables */}
        {step === 4 && (
          <div className="space-y-4 fade-in-up">
            <h2 className="text-lg font-bold text-white">Normes et référentiels</h2>
            <p className="text-sm text-text-on-dark-muted">Sélectionnez les normes applicables</p>

            <div className="grid grid-cols-2 gap-3">
              {applicableNorms.map((norm) => (
                <button
                  key={norm}
                  onClick={() => toggleNorm(norm)}
                  className={`p-3 rounded-lg border transition text-sm font-semibold ${
                    form.normsApplicable.includes(norm)
                      ? 'border-brand bg-brand text-white'
                      : 'border-border-dark bg-bg-dark text-text-on-dark hover:border-brand/50'
                  }`}
                >
                  {norm}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={step === 1}
          className="px-4 py-2 rounded-lg border border-border-dark text-text-on-dark hover:text-white disabled:opacity-50 transition"
        >
          ← Retour
        </button>

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition"
          >
            Continuer <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold transition"
          >
            <Save size={16} /> {saving ? 'Sauvegarde...' : 'Créer la mission'}
          </button>
        )}
      </div>
    </div>
  )
}
