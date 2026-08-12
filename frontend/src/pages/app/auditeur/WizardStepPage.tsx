import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Upload, FileText, Network, BrainCircuit, GaugeCircle, FileDown, CheckCircle2, AlertTriangle, AlertCircle, FileCheck, Trash2 } from 'lucide-react'
import { Gauge, ProgressBar, SeverityBadge } from '../../../components/app/Shared'
import { missions, wizardSteps, vulnerabilities, complianceByReferential } from '../../../data/mock'
import iso27001 from '../../../data/iso27001.json'

// ============================================================================
// ÉTAPE 1 — MISSION INFO
// ============================================================================
function MissionInfoStep() {
  const [formData, setFormData] = useState({
    name: 'Audit cybersécurité — Société ABC',
    organization: 'Société ABC',
    type: 'Audit de conformité',
    description: 'Évaluation du SMSI et de la sécurité du SI',
    auditor: 'Jean Dupont',
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    priority: 'Haute'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h2 className="text-lg font-bold text-white mb-2">Créez le contexte de votre mission</h2>
        <p className="text-sm text-text-on-dark-muted">Avant de définir son périmètre, remplissez les informations de base de l'audit.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col">
          <span className="text-sm font-bold text-white mb-2">Nom de la mission</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="rounded-lg border border-border-dark bg-bg-dark px-4 py-3 text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-bold text-white mb-2">Organisation auditée</span>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            className="rounded-lg border border-border-dark bg-bg-dark px-4 py-3 text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-bold text-white mb-2">Type d'audit</span>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="rounded-lg border border-border-dark bg-bg-dark px-4 py-3 text-white focus:border-brand focus:outline-none"
          >
            <option>Audit de conformité</option>
            <option>Audit technique</option>
            <option>Audit organisationnel</option>
            <option>Audit intégré</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-bold text-white mb-2">Auditeur responsable</span>
          <select
            name="auditor"
            value={formData.auditor}
            onChange={handleChange}
            className="rounded-lg border border-border-dark bg-bg-dark px-4 py-3 text-white focus:border-brand focus:outline-none"
          >
            <option>Jean Dupont</option>
            <option>Marie Martin</option>
            <option>Pierre Durand</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-bold text-white mb-2">Date de début</span>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="rounded-lg border border-border-dark bg-bg-dark px-4 py-3 text-white focus:border-brand focus:outline-none"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-bold text-white mb-2">Date d'échéance</span>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="rounded-lg border border-border-dark bg-bg-dark px-4 py-3 text-white focus:border-brand focus:outline-none"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-bold text-white mb-2">Priorité</span>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="rounded-lg border border-border-dark bg-bg-dark px-4 py-3 text-white focus:border-brand focus:outline-none"
          >
            <option>Basse</option>
            <option>Moyenne</option>
            <option>Haute</option>
            <option>Critique</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col">
        <span className="text-sm font-bold text-white mb-2">Description</span>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="rounded-lg border border-border-dark bg-bg-dark px-4 py-3 text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none"
        />
      </label>
    </div>
  )
}

// ============================================================================
// ÉTAPE 2 — CONFIGURATION
// ============================================================================
function ConfigurationStep() {
  const referentiels = ['ISO 27001', 'ISO 27002', 'NIST CSF', 'RGPD', 'DORA']
  const perimeterOptions = ['Infrastructure', 'Réseau', 'IAM', 'Cloud', 'Applications', 'Sécurité physique', 'Culture cyber']
  const assetTypes = ['Sites', 'Réseaux', 'Applications', 'Serveurs', 'Bases de données', 'Cloud', 'Postes de travail']

  const [selectedReferentiels, setSelectedReferentiels] = useState(['ISO 27001'])
  const [selectedPerimeter, setSelectedPerimeter] = useState(['Infrastructure', 'Réseau', 'Applications'])
  const [assets, setAssets] = useState([
    { id: 1, type: 'IP/CIDR', value: '10.0.0.0/24', label: 'Réseau production' },
    { id: 2, type: 'Domaine', value: 'banque-atlantique.ci', label: 'Domaine principal' },
  ])
  const [newAsset, setNewAsset] = useState({ type: 'IP/CIDR', value: '' })

  const toggleReferentiel = (ref: string) => {
    setSelectedReferentiels(prev =>
      prev.includes(ref) ? prev.filter(r => r !== ref) : [...prev, ref]
    )
  }

  const togglePerimeter = (item: string) => {
    setSelectedPerimeter(prev =>
      prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]
    )
  }

  const addAsset = () => {
    if (newAsset.value) {
      setAssets([...assets, { id: Date.now(), ...newAsset, label: newAsset.value }])
      setNewAsset({ type: 'IP/CIDR', value: '' })
    }
  }

  const removeAsset = (id: number) => {
    setAssets(assets.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Référentiels */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Référentiels applicables</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {referentiels.map(ref => (
            <label
              key={ref}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition ${
                selectedReferentiels.includes(ref)
                  ? 'border-brand bg-brand/10'
                  : 'border-border-dark hover:border-brand/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedReferentiels.includes(ref)}
                onChange={() => toggleReferentiel(ref)}
                className="w-5 h-5 accent-brand"
              />
              <span className="font-bold text-white">{ref}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Périmètre */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Périmètre d'audit</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {perimeterOptions.map(item => (
            <label
              key={item}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition ${
                selectedPerimeter.includes(item)
                  ? 'border-brand bg-brand/10'
                  : 'border-border-dark hover:border-brand/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPerimeter.includes(item)}
                onChange={() => togglePerimeter(item)}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm font-bold text-white">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actifs à auditer */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Actifs à auditer</h3>

        {/* Ajouter actif */}
        <div className="rounded-lg border-2 border-border-dark bg-bg-dark/50 p-4 mb-4">
          <div className="flex gap-2 mb-3">
            <select
              value={newAsset.type}
              onChange={e => setNewAsset({ ...newAsset, type: e.target.value })}
              className="rounded-lg border border-border-dark bg-bg-dark px-3 py-2 text-white focus:border-brand focus:outline-none"
            >
              <option>IP / CIDR</option>
              <option>Domaine</option>
              <option>Site physique</option>
              <option>Compte cloud</option>
              <option>Application</option>
            </select>
            <input
              type="text"
              placeholder="Ex. 10.0.0.0/24"
              value={newAsset.value}
              onChange={e => setNewAsset({ ...newAsset, value: e.target.value })}
              className="flex-1 rounded-lg border border-border-dark bg-bg-dark px-3 py-2 text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none"
            />
            <button
              onClick={addAsset}
              className="px-4 py-2 rounded-lg bg-brand text-white font-bold hover:bg-brand-dark transition"
            >
              + Ajouter
            </button>
          </div>
        </div>

        {/* Liste actifs */}
        <div className="space-y-2">
          {assets.map(asset => (
            <div key={asset.id} className="flex items-center justify-between rounded-lg border border-border-dark bg-bg-dark/50 p-3">
              <div>
                <p className="font-bold text-white">{asset.label}</p>
                <p className="text-xs text-text-on-dark-muted">{asset.type}</p>
              </div>
              <button
                onClick={() => removeAsset(asset.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ÉTAPE 3 — QUESTIONNAIRE ISO 27001
// ============================================================================
function QuestionnaireStep({
  answers,
  setAnswers,
  allAnswered
}: {
  answers: Record<string, { rating: string; justification: string; proofs: string[] }>
  setAnswers: (a: any) => void
  allAnswered: boolean
}) {
  const groupedControls = iso27001.controls.reduce((acc, control) => {
    if (!acc[control.category]) acc[control.category] = []
    acc[control.category].push(control)
    return acc
  }, {} as Record<string, typeof iso27001.controls>)

  const categories = Object.keys(groupedControls).sort()
  const answeredCount = Object.values(answers).filter(a => a?.rating).length
  const completionPercent = Math.round((answeredCount / iso27001.controls.length) * 100)

  const [activeCategory, setActiveCategory] = useState(categories[0])
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null)

  const selectedControl = selectedControlId
    ? iso27001.controls.find(c => c.id === selectedControlId)
    : null

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-2">
        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-4 mb-4">
          <h3 className="text-sm font-bold text-white mb-1">ISO 27001:2022</h3>
          <p className="text-2xl font-extrabold text-brand">{completionPercent}%</p>
          <p className="text-xs text-text-on-dark-muted mt-1">{answeredCount}/{iso27001.controls.length} évalués</p>
        </div>

        <div className="space-y-1">
          {categories.map((category, idx) => {
            const categoryAnswered = groupedControls[category].filter(c =>
              answers[c.id]?.rating
            ).length
            const categoryTotal = groupedControls[category].length
            const isCategoryComplete = categoryAnswered === categoryTotal

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  activeCategory === category
                    ? 'bg-brand text-white font-bold'
                    : 'text-text-on-dark hover:bg-bg-dark/50'
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {String(idx + 1).padStart(2, '0')} {category}
                  </span>
                  {isCategoryComplete ? (
                    <span className="text-green-400">✓</span>
                  ) : categoryAnswered > 0 ? (
                    <span className="text-xs font-bold">{categoryAnswered}/{categoryTotal}</span>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Category Header */}
        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
          <h2 className="text-2xl font-extrabold text-white mb-2">{activeCategory}</h2>
          <p className="text-sm text-text-on-dark-muted">
            {groupedControls[activeCategory].length} contrôles à évaluer
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {groupedControls[activeCategory].map((control) => {
            const answer = answers[control.id] || { rating: '', justification: '', proofs: [] }
            const isComplete = answer.rating !== ''

            return (
              <div
                key={control.id}
                className={`rounded-lg border-2 transition ${
                  isComplete
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-border-dark bg-bg-dark/50'
                } p-5 cursor-pointer hover:border-brand`}
                onClick={() => setSelectedControlId(control.id)}
              >
                <div className="flex items-start justify-between mb-3">
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
                        <p className="font-bold text-white">{control.question}</p>
                        <p className="text-xs text-text-on-dark-muted mt-0.5">
                          {control.id} — {control.title}
                        </p>
                      </div>
                    </div>
                  </div>
                  {answer.rating && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-2 ${
                        answer.rating === 'conforme'
                          ? 'bg-green-600/20 text-green-300'
                          : answer.rating === 'partiellement'
                          ? 'bg-yellow-600/20 text-yellow-300'
                          : 'bg-red-600/20 text-red-300'
                      }`}
                    >
                      {answer.rating === 'conforme' ? 'Conforme' : answer.rating === 'partiellement' ? 'Partiellement' : 'Non conforme'}
                    </span>
                  )}
                </div>

                {selectedControlId === control.id && (
                  <div className="mt-4 pt-4 border-t border-border-dark space-y-4">
                    {/* Rating Options */}
                    <div>
                      <p className="text-xs font-bold text-text-on-dark-muted mb-3 uppercase">Évaluation du contrôle</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'conforme', label: 'Conforme', color: 'green' },
                          { value: 'partiellement', label: 'Partiellement conforme', color: 'yellow' },
                          { value: 'non-conforme', label: 'Non conforme', color: 'red' },
                          { value: 'non-applicable', label: 'Non applicable', color: 'blue' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() =>
                              setAnswers({
                                ...answers,
                                [control.id]: { ...answer, rating: option.value }
                              })
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                              answer.rating === option.value
                                ? `bg-${option.color}-600 text-white`
                                : `border border-border-dark text-text-on-dark hover:border-${option.color}-500`
                            }`}
                          >
                            ○ {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Justification */}
                    <div>
                      <p className="text-xs font-bold text-text-on-dark-muted mb-2 uppercase">Justification</p>
                      <textarea
                        value={answer.justification}
                        onChange={e =>
                          setAnswers({
                            ...answers,
                            [control.id]: { ...answer, justification: e.target.value }
                          })
                        }
                        placeholder="Décrivez les éléments observés, politiques en place, contrôles identifiés..."
                        rows={3}
                        className="w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2 text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none text-sm"
                      />
                    </div>

                    {/* Proofs */}
                    <div>
                      <p className="text-xs font-bold text-text-on-dark-muted mb-2 uppercase">Preuves/Documents</p>
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

        {allAnswered && (
          <div className="bg-green-600/20 border-2 border-green-500 rounded-lg p-5 flex gap-3">
            <CheckCircle2 size={24} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-300 text-lg">✓ Questionnaire complété</p>
              <p className="text-sm text-green-200 mt-1">Tous les {iso27001.controls.length} contrôles ont été évalués. Vous pouvez maintenant avancer à l'étape suivante.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ÉTAPE 4 — COLLECTE (UPLOAD)
// ============================================================================
function CollecteStep({ allAnswered }: { allAnswered: boolean }) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({})

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, scanType: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [scanType]: file }))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, scanType: string) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [scanType]: file }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Questionnaire', allAnswered ? 100 : 0],
          ['Documents', 90],
          ['Nmap', uploadedFiles['nmap'] ? 100 : 0],
          ['Nessus', uploadedFiles['nessus'] ? 100 : 0],
        ].map(([label, pct]) => (
          <div key={label as string} className={`rounded-lg border-2 p-4 ${
            (pct as number) === 100 ? 'border-green-500 bg-green-500/10' : 'border-border-dark bg-bg-dark/50'
          }`}>
            <p className="text-sm font-bold text-white">{label}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-border-dark overflow-hidden">
                <div className="h-full bg-brand transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-sm font-bold w-10 text-right ${
                (pct as number) === 100 ? 'text-green-400' : 'text-brand'
              }`}>{pct}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { key: 'nmap', label: 'Nmap — Découverte des actifs (XML)' },
          { key: 'nessus', label: 'Nessus — Analyse des vulnérabilités (.nessus)' }
        ].map(({ key, label }) => (
          <label
            key={key}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, key)}
            className="cursor-pointer rounded-lg border-2 border-dashed border-border-dark bg-bg-dark/50 p-8 text-center hover:border-brand hover:bg-bg-dark/70 transition"
          >
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleUpload(e, key)}
              accept={key === 'nmap' ? '.xml' : '.nessus'}
            />
            {uploadedFiles[key] ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={28} className="text-green-400 mb-3" />
                <p className="text-sm font-bold text-green-400">{uploadedFiles[key]?.name}</p>
                <p className="text-xs text-text-on-dark-muted mt-2">Fichier importé avec succès</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={24} className="mx-auto text-brand mb-3" />
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="mt-2 text-xs text-text-on-dark-muted">Cliquez ou déposez le fichier ici</p>
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// ÉTAPE 5 — CARTOGRAPHIE
// ============================================================================
function CartographieStep({ selectedControlId, setSelectedControlId }: any) {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  const assets = [
    { name: 'SRV-WEB-01', ip: '192.168.1.20', os: 'Ubuntu 24.04', criticality: 'critique', services: ['HTTP', 'HTTPS', 'SSH'], vulns: [{ id: 'CVE-2024-1234', cvss: 9.8, severity: 'critique' }, { id: 'CVE-2024-5555', cvss: 7.2, severity: 'eleve' }] },
    { name: 'SRV-DB-01', ip: '192.168.1.50', os: 'CentOS 7', criticality: 'haute', services: ['MySQL', 'SSH'], vulns: [{ id: 'CVE-2024-5678', cvss: 6.5, severity: 'eleve' }] },
    { name: 'API-GATEWAY', ip: '192.168.1.100', os: 'Debian 11', criticality: 'critique', services: ['HTTP', 'HTTPS', 'gRPC'], vulns: [{ id: 'CVE-2024-9012', cvss: 8.8, severity: 'critique' }] },
    { name: 'WS-ADMIN-01', ip: '192.168.1.150', os: 'Windows Server 2022', criticality: 'moyenne', services: ['RDP', 'WinRM'], vulns: [] },
    { name: 'NAS-DATA-01', ip: '10.0.0.50', os: 'Synology DSM 7', criticality: 'haute', services: ['SMB', 'NFS', 'HTTPS'], vulns: [{ id: 'CVE-2024-7890', cvss: 9.1, severity: 'critique' }] },
  ]

  const totalAssets = assets.length
  const criticalVulns = assets.flatMap(a => a.vulns.filter(v => v.severity === 'critique'))
  const topology = `INTERNET → FIREWALL → [WEB-01(critique) → DB-01(haute)] | [API-GATEWAY(critique)]`

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-5">
          <p className="text-sm font-bold text-text-on-dark-muted uppercase">Total Actifs</p>
          <p className="text-4xl font-extrabold text-brand mt-3">{totalAssets}</p>
        </div>
        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-5">
          <p className="text-sm font-bold text-text-on-dark-muted uppercase">Vulnérabilités</p>
          <p className="text-4xl font-extrabold text-orange-400 mt-3">{assets.flatMap(a => a.vulns).length}</p>
        </div>
        <div className="rounded-lg border-2 border-red-500/30 bg-red-500/10 p-5">
          <p className="text-sm font-bold text-red-300 uppercase">Critiques</p>
          <p className="text-4xl font-extrabold text-red-400 mt-3">{criticalVulns.length}</p>
        </div>
        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-5">
          <p className="text-sm font-bold text-text-on-dark-muted uppercase">Score Risque</p>
          <p className="text-3xl font-extrabold text-red-400 mt-3">ÉLEVÉ</p>
        </div>
      </div>

      {/* Topologie */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Topologie réseau</h3>
        <div className="rounded-lg bg-bg-dark/50 border border-border-dark p-6 font-mono text-sm text-text-on-dark-muted">
          <pre className="overflow-x-auto">{topology}</pre>
        </div>
      </div>

      {/* Assets & Vulnerabilities */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Inventaire des actifs</h3>

        <div className="space-y-3">
          {assets.map((asset) => (
            <div
              key={asset.name}
              onClick={() => setSelectedAsset(selectedAsset === asset.name ? null : asset.name)}
              className={`rounded-lg border-2 cursor-pointer transition ${
                selectedAsset === asset.name
                  ? 'border-brand bg-brand/10'
                  : 'border-border-dark hover:border-brand/50'
              } p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        asset.criticality === 'critique' ? 'bg-red-600/20 text-red-300' :
                        asset.criticality === 'haute' ? 'bg-orange-600/20 text-orange-300' :
                        'bg-blue-600/20 text-blue-300'
                      }`}
                    >
                      {asset.criticality.toUpperCase()}
                    </div>
                    <p className="font-bold text-white">{asset.name}</p>
                  </div>
                  <p className="text-xs text-text-on-dark-muted">{asset.ip} • {asset.os}</p>
                </div>
                {asset.vulns.length > 0 && (
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className={`text-2xl font-extrabold ${
                      asset.vulns.some(v => v.severity === 'critique') ? 'text-red-400' : 'text-orange-400'
                    }`}>
                      {asset.vulns.length}
                    </p>
                    <p className="text-xs text-text-on-dark-muted">Vulns</p>
                  </div>
                )}
              </div>

              {selectedAsset === asset.name && (
                <div className="border-t border-border-dark pt-4 mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-text-on-dark-muted mb-2 uppercase">Services détectés</p>
                    <div className="flex flex-wrap gap-2">
                      {asset.services.map(svc => (
                        <span key={svc} className="px-2 py-1 rounded-full bg-border-dark text-text-on-dark text-xs font-bold">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {asset.vulns.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-text-on-dark-muted mb-2 uppercase">Vulnérabilités</p>
                      <div className="space-y-2">
                        {asset.vulns.map(vuln => (
                          <div key={vuln.id} className={`rounded-lg border-l-4 p-3 ${
                            vuln.severity === 'critique' ? 'border-l-red-500 bg-red-500/5' : 'border-l-orange-500 bg-orange-500/5'
                          }`}>
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-white text-sm">{vuln.id}</p>
                              <span className={`font-bold text-sm ${
                                vuln.severity === 'critique' ? 'text-red-400' : 'text-orange-400'
                              }`}>
                                CVSS {vuln.cvss}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap CVSS */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Heatmap CVSS par actif</h3>
        <div className="space-y-3">
          {assets.filter(a => a.vulns.length > 0).map((asset) => {
            const maxCvss = Math.max(...asset.vulns.map(v => v.cvss))
            return (
              <div key={asset.name} className="flex items-center gap-3">
                <span className="w-32 text-xs font-bold text-text-on-dark truncate">{asset.name}</span>
                <div className="flex-1 h-6 rounded-lg bg-bg-dark/50 border border-border-dark overflow-hidden">
                  <div
                    className={`h-full transition ${
                      maxCvss >= 9 ? 'bg-red-600' :
                      maxCvss >= 7 ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${(maxCvss / 10) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-12 text-right ${
                  maxCvss >= 9 ? 'text-red-400' :
                  maxCvss >= 7 ? 'text-orange-400' :
                  'text-yellow-400'
                }`}>
                  {maxCvss.toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ÉTAPE 6 — ANALYSE
// ============================================================================
function AnalyseStep() {
  const correlations = [
    {
      id: 1,
      type: 'Divergence',
      control: 'A.5.1 - Politiques de sécurité',
      status: 'Conforme (déclaré)',
      observation: 'Aucune preuve documentaire fournie',
      impact: 'critique'
    },
    {
      id: 2,
      type: 'Configuration',
      control: 'A.9.1 - Gestion des droits d\'accès',
      status: 'Partiellement conforme',
      observation: '2 comptes administrateurs détectés avec mots de passe faibles',
      impact: 'critique'
    },
    {
      id: 3,
      type: 'Exposition',
      control: 'A.12.4 - Gestion des événements de sécurité',
      status: 'Non conforme',
      observation: 'Logs non centralisés - 3 actifs sans trace d\'activité',
      impact: 'eleve'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Score Global */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6 text-center">
          <p className="text-xs font-bold text-text-on-dark-muted mb-2 uppercase">CYBERAS SCORE</p>
          <p className="text-5xl font-extrabold text-brand">68</p>
          <p className="text-sm text-red-400 font-bold mt-2">Risque ÉLEVÉ</p>
        </div>

        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6 text-center">
          <p className="text-xs font-bold text-text-on-dark-muted mb-2 uppercase">CONFORMITÉ MOYENNE</p>
          <p className="text-5xl font-extrabold text-orange-400">64%</p>
          <p className="text-sm text-text-on-dark-muted mt-2">vs. attendu 80%</p>
        </div>

        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6 text-center">
          <p className="text-xs font-bold text-text-on-dark-muted mb-2 uppercase">ÉCARTS CRITIQUES</p>
          <p className="text-5xl font-extrabold text-red-400">3</p>
          <p className="text-sm text-text-on-dark-muted mt-2">Nécessitent correction</p>
        </div>

        <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6 text-center">
          <p className="text-xs font-bold text-text-on-dark-muted mb-2 uppercase">DÉLAI REMÉDIATION</p>
          <p className="text-5xl font-extrabold text-orange-400">30j</p>
          <p className="text-sm text-text-on-dark-muted mt-2">Recommandé</p>
        </div>
      </div>

      {/* Conformité par référentiel */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h3 className="text-lg font-bold text-white mb-6">Conformité par référentiel</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {complianceByReferential.map(c => (
            <div key={c.name}>
              <div className="flex justify-between items-baseline mb-3">
                <p className="font-bold text-white">{c.name}</p>
                <p className={`text-2xl font-extrabold ${
                  c.value >= 80 ? 'text-green-400' :
                  c.value >= 70 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {c.value}%
                </p>
              </div>
              <ProgressBar value={c.value} />
              <p className="text-xs text-text-on-dark-muted mt-2">
                {c.value >= 80 ? '✓ Conforme' : c.value >= 70 ? '⚠ À améliorer' : '✕ Non conforme'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnérabilités */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h3 className="text-lg font-bold text-white mb-6">Distribution des vulnérabilités</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'CRITIQUES', value: 3, color: 'red' },
            { label: 'ÉLEVÉES', value: 7, color: 'orange' },
            { label: 'MOYENNES', value: 12, color: 'yellow' },
            { label: 'FAIBLES', value: 18, color: 'green' }
          ].map(item => (
            <div key={item.label} className={`rounded-lg border-2 border-${item.color}-500/30 bg-${item.color}-500/10 p-5 text-center`}>
              <p className={`text-4xl font-extrabold text-${item.color}-400`}>{item.value}</p>
              <p className="text-xs font-bold text-text-on-dark-muted mt-2 uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Corrélations IA */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h3 className="text-lg font-bold text-white mb-6">Corrélations IA détectées</h3>
        <div className="space-y-4">
          {correlations.map(corr => (
            <div
              key={corr.id}
              className={`rounded-lg border-l-4 p-5 ${
                corr.impact === 'critique'
                  ? 'border-l-red-500 bg-red-500/5'
                  : 'border-l-orange-500 bg-orange-500/5'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      corr.impact === 'critique'
                        ? 'bg-red-600/20 text-red-300'
                        : 'bg-orange-600/20 text-orange-300'
                    }`}>
                      {corr.type}
                    </span>
                    <span className="text-xs text-text-on-dark-muted">{corr.control}</span>
                  </div>
                  <p className="font-bold text-white mb-2">{corr.observation}</p>
                  <p className="text-sm text-text-on-dark-muted">
                    Statut déclaré: <span className="font-bold">{corr.status}</span>
                  </p>
                </div>
                <button className="px-3 py-1 rounded-lg bg-brand/20 text-brand text-xs font-bold hover:bg-brand/30 transition flex-shrink-0 ml-4">
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations Prioritaires */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h3 className="text-lg font-bold text-white mb-6">Top 5 recommandations</h3>
        <ol className="space-y-3">
          {[
            { priority: 1, action: 'Documenter et formellement approuver la politique de sécurité informatique', days: '7j' },
            { priority: 2, action: 'Renforcer les droits d\'accès - changer les mots de passe administrateur', days: '3j' },
            { priority: 3, action: 'Centraliser les logs de sécurité avec analyse en temps réel', days: '14j' },
            { priority: 4, action: 'Déployer MFA sur tous les comptes critiques', days: '10j' },
            { priority: 5, action: 'Mettre en place une politique de gestion des correctifs', days: '21j' }
          ].map(rec => (
            <li key={rec.priority} className="flex gap-4 items-start p-4 rounded-lg bg-bg-dark/50 border border-border-dark hover:border-brand transition">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white font-bold flex-shrink-0">
                {rec.priority}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{rec.action}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-brand">{rec.days}</p>
                <p className="text-xs text-text-on-dark-muted">estimé</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// ============================================================================
// ÉTAPE 7 — RAPPORT
// ============================================================================
function RapportStep() {
  const [sections, setSections] = useState({
    executive: true,
    scope: true,
    methodology: true,
    iso27001: true,
    vulns: true,
    risks: true,
    ai: true,
    recommendations: true,
    remediation: true,
    annexes: true,
  })
  const [showPreview, setShowPreview] = useState(false)

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectedCount = Object.values(sections).filter(Boolean).length
  const totalSections = Object.keys(sections).length

  return (
    <div className="space-y-8">
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <h2 className="text-lg font-bold text-white mb-2">Générer le rapport d'audit</h2>
        <p className="text-sm text-text-on-dark-muted">Sélectionnez les sections à inclure dans le rapport final PDF.</p>
      </div>

      {/* Selection Summary */}
      <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Sections sélectionnées</p>
            <p className="text-xs text-text-on-dark-muted mt-1">{selectedCount} sur {totalSections} sections</p>
          </div>
          <div className="text-4xl font-extrabold text-brand">{selectedCount}</div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-border-dark overflow-hidden">
          <div className="h-full bg-brand transition-all" style={{ width: `${(selectedCount / totalSections) * 100}%` }} />
        </div>
      </div>

      {/* Section Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Sélection des sections</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { key: 'executive', label: 'Executive Summary', icon: '📋', desc: 'Résumé exécutif pour la direction' },
            { key: 'scope', label: 'Périmètre', icon: '🎯', desc: 'Domaines et actifs audités' },
            { key: 'methodology', label: 'Méthodologie', icon: '📐', desc: 'Processus et standards appliqués' },
            { key: 'iso27001', label: 'Conformité ISO 27001', icon: '✓', desc: 'Évaluation des 118 contrôles' },
            { key: 'vulns', label: 'Vulnérabilités', icon: '⚠', desc: 'Catalogue des failles détectées' },
            { key: 'risks', label: 'Analyse des risques', icon: '📊', desc: 'Matrice MEHARI et scoring' },
            { key: 'ai', label: 'Analyse IA', icon: '🤖', desc: 'Corrélations et divergences détectées' },
            { key: 'recommendations', label: 'Recommandations', icon: '💡', desc: 'Actions correctrices prioritaires' },
            { key: 'remediation', label: 'Plan de remédiation', icon: '📋', desc: 'Calendrier et responsabilités' },
            { key: 'annexes', label: 'Annexes', icon: '📎', desc: 'Détails techniques complets' }
          ].map(item => (
            <label
              key={item.key}
              className={`rounded-lg border-2 p-4 cursor-pointer transition ${
                sections[item.key as keyof typeof sections]
                  ? 'border-brand bg-brand/10'
                  : 'border-border-dark hover:border-brand/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={sections[item.key as keyof typeof sections]}
                  onChange={() => toggleSection(item.key as keyof typeof sections)}
                  className="w-5 h-5 accent-brand mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{item.icon}</span>
                    <p className="font-bold text-white">{item.label}</p>
                  </div>
                  <p className="text-xs text-text-on-dark-muted">{item.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Preview Mode */}
      {showPreview && (
        <div className="rounded-lg border-2 border-brand/30 bg-bg-dark/50 p-8 space-y-6">
          <h3 className="text-2xl font-bold text-white">Aperçu du rapport</h3>

          <div className="space-y-4 text-sm text-text-on-dark-muted">
            {sections.executive && <div><strong>📋 Executive Summary</strong><br/>Synthèse exécutive destinée aux décideurs...</div>}
            {sections.scope && <div><strong>🎯 Périmètre</strong><br/>Audit réalisé sur 5 actifs critiques...</div>}
            {sections.methodology && <div><strong>📐 Méthodologie</strong><br/>Conformité ISO/IEC 27001:2022 et NIST CSF...</div>}
            {sections.iso27001 && <div><strong>✓ Conformité ISO 27001</strong><br/>Évaluation de 8 contrôles principaux...</div>}
            {sections.vulns && <div><strong>⚠ Vulnérabilités</strong><br/>3 vulnérabilités critiques détectées...</div>}
            {sections.risks && <div><strong>📊 Analyse des risques</strong><br/>Score global: 68/100 - Risque ÉLEVÉ...</div>}
            {sections.ai && <div><strong>🤖 Analyse IA</strong><br/>3 corrélations et divergences détectées...</div>}
            {sections.recommendations && <div><strong>💡 Recommandations</strong><br/>5 actions prioritaires sur 30 jours...</div>}
            {sections.remediation && <div><strong>📋 Plan de remédiation</strong><br/>Calendrier détaillé de correction...</div>}
            {sections.annexes && <div><strong>📎 Annexes</strong><br/>Détails techniques complets...</div>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex-1 px-4 py-3 rounded-lg border-2 border-brand text-brand font-bold hover:bg-brand/10 transition"
        >
          {showPreview ? 'Fermer aperçu' : 'Prévisualiser'}
        </button>
        <button disabled={selectedCount === 0} className="flex-1 px-4 py-3 rounded-lg bg-brand text-white font-bold hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <FileDown size={16} />
          Générer le rapport (PDF)
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border-2 border-blue-500/30 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-200">
          💡 <strong>Astuce:</strong> Le rapport PDF sera généré avec les sections sélectionnées. Format A4, logos CYBERAS Intelligence et données en en-tête/pied de page. Estimé: 45-60 pages.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function WizardStepPage() {
  const { id, step } = useParams()
  const [answers, setAnswers] = useState<Record<string, { rating: string; justification: string; proofs: string[] }>>({})
  const mission = missions.find((m) => m.id === Number(id)) ?? missions[0]
  const idx = Math.max(0, wizardSteps.findIndex((s) => s.slug === step))
  const current = wizardSteps[idx]
  const allAnswered = Object.values(answers).filter(a => a?.rating).length === iso27001.controls.length
  const canAdvance = current.slug === 'questionnaire' ? allAnswered : true

  const renderStep = () => {
    switch (current.slug) {
      case 'mission':
        return <MissionInfoStep />
      case 'configuration':
        return <ConfigurationStep />
      case 'questionnaire':
        return <QuestionnaireStep answers={answers} setAnswers={setAnswers} allAnswered={allAnswered} />
      case 'collecte':
        return <CollecteStep allAnswered={allAnswered} />
      case 'cartographie':
        return <CartographieStep />
      case 'analyse':
        return <AnalyseStep />
      case 'rapport':
        return <RapportStep />
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">
          MISSION : {mission.type} — {mission.organization}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1 text-xs">
          {wizardSteps.map((s, i) => (
            <span key={s.slug} className="flex items-center gap-1">
              <Link
                to={`/app/auditeur/missions/${mission.id}/${s.slug}`}
                className={`rounded-full px-2.5 py-1 font-bold transition ${
                  i === idx ? 'bg-brand text-white ring-2 ring-brand/30' : i < idx ? 'bg-green-500 text-white' : 'bg-border-dark text-text-on-dark-muted'
                }`}
              >
                {i < idx ? '✓' : ''} {s.label}
              </Link>
              {i < wizardSteps.length - 1 && <span className="text-text-on-dark-muted/50">•</span>}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-sm text-text-on-dark-muted mb-1">Étape {idx + 1} sur {wizardSteps.length}</p>
          <h1 className="text-4xl font-extrabold text-white">{current.label}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border-dark">
        <Link
          to={`/app/auditeur/missions/${mission.id}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-text-on-dark-muted hover:text-brand transition"
        >
          <ArrowLeft size={16} /> Retour
        </Link>

        {idx < wizardSteps.length - 1 && (
          <button
            disabled={!canAdvance}
            onClick={() => {
              window.location.href = `/app/auditeur/missions/${mission.id}/${wizardSteps[idx + 1].slug}`
            }}
            className={`flex items-center gap-1.5 rounded-lg px-6 py-3 text-sm font-bold transition ${
              canAdvance
                ? 'bg-brand text-white hover:bg-brand-dark'
                : 'bg-bg-dark text-text-on-dark-muted border border-border-dark cursor-not-allowed opacity-50'
            }`}
          >
            Continuer <ArrowRight size={16} />
          </button>
        )}

        {idx === wizardSteps.length - 1 && (
          <button className="flex items-center gap-1.5 rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition">
            <CheckCircle2 size={16} /> Finaliser l'audit
          </button>
        )}
      </div>
    </div>
  )
}
