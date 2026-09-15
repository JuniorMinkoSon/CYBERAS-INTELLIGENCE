import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Plus, Loader2, ShieldAlert, Trophy, Link2, Copy, Check, RefreshCw, Trash2,
  ClipboardList, Radar, Calculator, Lock, Unlock, X, Medal, AlertTriangle,
} from 'lucide-react'
import {
  projectsClient, type ProjectDetail, type ParticipantRow, type AddedParticipant, type ParticipantAnswers,
} from '../../services/projectsClient'
import { useNotification } from '../../contexts/NotificationContext'

/**
 * Détail d'un projet d'évaluation : les sociétés, leur avancement, leur score
 * et leur rang.
 *
 * Le tableau est déjà dans l'ordre du mérite tel que le serveur le calcule.
 * L'écran n'invente aucun classement : il montre celui du serveur, et le
 * bouton « Évaluer » demande au serveur de le recalculer à partir des
 * derniers constats.
 */

const SECTORS = [
  ['', 'Secteur (facultatif)'], ['FINANCE', 'Banque, finance, assurance'], ['SANTE', 'Santé et médico-social'],
  ['PUBLIC_SECTOR', 'Secteur public et administration'], ['ENERGIE_UTILITIES', 'Énergie, eau, transport'],
  ['TELECOM', 'Télécommunications et hébergement'], ['INDUSTRIE', 'Industrie et production'],
  ['COMMERCE', 'Commerce et distribution'], ['TECHNOLOGIE', 'Technologie et services numériques'],
  ['EDUCATION', 'Enseignement et recherche'], ['SERVICES_PRO', 'Services professionnels et conseil'],
  ['ASSOCIATIF', 'Associatif et ONG'], ['AUTRE', 'Autre'],
]

const LEVEL_STYLE: Record<string, string> = {
  CRITICAL: 'text-red-400', HIGH: 'text-orange-400', MEDIUM: 'text-yellow-400', LOW: 'text-emerald-400', INFORMATION: 'text-blue-400',
}

const MATURITY_LABEL = ['Inexistant', 'Initial', 'Reproductible', 'Défini', 'Maîtrisé']

function formatDate(value?: string | null, withTime = false) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return withTime
    ? d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fullLink(path: string) {
  return `${window.location.origin}${path}`
}

/** État d'accès d'une société, en un mot et une couleur. */
function accessBadge(p: ParticipantRow) {
  if (p.joined) return { label: 'Accès activé', cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
  switch (p.invitationStatus) {
    case 'PENDING': return { label: 'Compte créé · à activer', cls: 'border-blue-500/30 bg-blue-500/10 text-blue-300' }
    case 'EXPIRED': return { label: 'Lien expiré', cls: 'border-orange-500/30 bg-orange-500/10 text-orange-300' }
    case 'REVOKED': return { label: 'Lien révoqué', cls: 'border-border-dark bg-bg-dark text-text-on-dark-muted' }
    default: return { label: 'Sans lien', cls: 'border-border-dark bg-bg-dark text-text-on-dark-muted' }
  }
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) return <span className="text-text-on-dark-muted">—</span>
  const tone = rank === 1 ? 'bg-amber-400 text-black' : rank === 2 ? 'bg-slate-300 text-black' : rank === 3 ? 'bg-amber-700 text-white' : 'bg-bg-dark text-white border border-border-dark'
  return (
    <span className={`inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-2 text-sm font-extrabold ${tone}`}>
      {rank <= 3 && <Medal size={13} />}{rank}
    </span>
  )
}

export function AdminProjectDetailPage() {
  const { projectId = '' } = useParams()
  const { notify } = useNotification()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ organizationName: '', sector: '', contactName: '', contactEmail: '' })
  /** Lien fraîchement émis : seule occasion de le voir en entier. */
  const [issued, setIssued] = useState<AddedParticipant | null>(null)
  const [copied, setCopied] = useState(false)
  const [answers, setAnswers] = useState<ParticipantAnswers | null>(null)
  const [answersLoading, setAnswersLoading] = useState(false)

  const load = useCallback(async () => {
    try {
      setProject(await projectsClient.detail(projectId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chargement impossible'
      if (/403|réservé|forbidden/i.test(message)) setDenied(true)
      else notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [projectId, notify])

  useEffect(() => { load() }, [load])

  const addParticipant = async (e: FormEvent) => {
    e.preventDefault()
    if (form.organizationName.trim().length < 2) {
      notify('Indiquez le nom de la société.', 'error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      notify('Le courriel du responsable est requis : c’est le compte que le lien activera.', 'error')
      return
    }
    setSaving(true)
    try {
      const added = await projectsClient.addParticipant(projectId, {
        organizationName: form.organizationName.trim(),
        sector: form.sector || undefined,
        contactName: form.contactName.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
      })
      setIssued(added)
      setCopied(false)
      setForm({ organizationName: '', sector: '', contactName: '', contactEmail: '' })
      setAdding(false)
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Ajout impossible', 'error')
    } finally {
      setSaving(false)
    }
  }

  const renew = async (p: ParticipantRow) => {
    try {
      const added = await projectsClient.renewInvitation(projectId, p.id)
      setIssued(added)
      setCopied(false)
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Émission impossible', 'error')
    }
  }

  const remove = async (p: ParticipantRow) => {
    if (!window.confirm(`Retirer « ${p.organizationName} » du projet ? Son espace et ses réponses sont conservés.`)) return
    try {
      await projectsClient.removeParticipant(projectId, p.id)
      notify(`${p.organizationName} retirée du projet.`, 'success')
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Retrait impossible', 'error')
    }
  }

  const evaluate = async () => {
    setEvaluating(true)
    try {
      setProject(await projectsClient.evaluate(projectId))
      notify('Scores recalculés et classement mis à jour.', 'success')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Évaluation impossible', 'error')
    } finally {
      setEvaluating(false)
    }
  }

  const toggleClose = async () => {
    if (!project) return
    try {
      if (project.status === 'OPEN') await projectsClient.close(projectId)
      else await projectsClient.reopen(projectId)
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Opération impossible', 'error')
    }
  }

  const showAnswers = async (p: ParticipantRow) => {
    setAnswersLoading(true)
    try {
      setAnswers(await projectsClient.answers(projectId, p.id))
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Lecture impossible', 'error')
    } finally {
      setAnswersLoading(false)
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      notify('Copie impossible : sélectionnez le lien et copiez-le à la main.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    )
  }

  if (denied || !project) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-lg border border-border-dark bg-surface-dark p-10 text-center">
          <ShieldAlert className="mx-auto mb-4 text-orange-400" size={36} />
          <h1 className="text-xl font-bold text-white">{denied ? 'Espace réservé' : 'Projet introuvable'}</h1>
          <Link to="/app/admin/projets" className="mt-4 inline-block text-sm font-semibold text-brand">← Retour aux projets</Link>
        </div>
      </div>
    )
  }

  const ranked = project.participants.filter((p) => p.rank !== null)
  const isOpen = project.status === 'OPEN'

  return (
    <div className="space-y-6 p-6">
      <Link to="/app/admin/projets" className="inline-flex items-center gap-1.5 text-sm text-text-on-dark-muted hover:text-white">
        <ArrowLeft size={15} /> Projets d’évaluation
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${isOpen ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-border-dark bg-bg-dark text-text-on-dark-muted'}`}>
              {isOpen ? 'En cours' : 'Clos'}
            </span>
          </div>
          {project.description && <p className="mt-1 max-w-2xl text-sm text-text-on-dark-muted">{project.description}</p>}
          <p className="mt-1 text-xs text-text-on-dark-muted">
            Créé le {formatDate(project.createdAt)} · Échéance : {formatDate(project.deadline)}
            {project.closedAt && ` · Clos le ${formatDate(project.closedAt)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOpen && (
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <Plus size={16} /> Ajouter une société
            </button>
          )}
          <button
            type="button"
            onClick={evaluate}
            disabled={evaluating || project.participants.length === 0}
            className="inline-flex items-center gap-2 rounded-md border border-border-dark px-4 py-2.5 text-sm font-semibold text-white hover:border-brand disabled:opacity-50"
          >
            {evaluating ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />} Évaluer et classer
          </button>
          <button
            type="button"
            onClick={toggleClose}
            className="inline-flex items-center gap-2 rounded-md border border-border-dark px-4 py-2.5 text-sm font-semibold text-text-on-dark-muted hover:text-white"
          >
            {isOpen ? <><Lock size={15} /> Clore</> : <><Unlock size={15} /> Rouvrir</>}
          </button>
        </div>
      </div>

      {/* Lien fraîchement émis : affiché une seule fois, en évidence. */}
      {issued && (
        <div className="rounded-xl border border-brand/50 bg-brand/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-bold text-white">
                <Link2 size={16} className="text-brand" />
                Lien d’accès pour {issued.participant.organizationName}
              </p>
              <p className="mt-1 text-sm text-text-on-dark-muted">
                {issued.organizationCreated ? 'Espace créé. ' : 'Espace existant réutilisé. '}
                Compte administrateur créé pour <strong className="text-text-on-dark">{issued.participant.contactEmail}</strong>.
                Transmettez ce lien à {issued.participant.contactName || 'son responsable'} :
                il choisit son mot de passe et accède directement au questionnaire.
                <strong className="text-text-on-dark"> Il n’est affiché qu’une fois</strong> et expire le {formatDate(issued.participant.invitationExpiresAt)}.
              </p>
            </div>
            <button type="button" onClick={() => setIssued(null)} aria-label="Fermer" className="text-text-on-dark-muted hover:text-white"><X size={18} /></button>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={fullLink(issued.invitationPath)}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 rounded-lg border border-border-dark bg-bg-dark px-3 py-2.5 font-mono text-sm text-white"
            />
            <button
              type="button"
              onClick={() => copy(fullLink(issued.invitationPath))}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              {copied ? <><Check size={16} /> Copié</> : <><Copy size={16} /> Copier le lien</>}
            </button>
          </div>
        </div>
      )}

      {adding && (
        <form onSubmit={addParticipant} className="grid gap-4 rounded-xl border border-brand/40 bg-surface-dark p-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-text-on-dark">Nom de la société</span>
            <input autoFocus value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
              placeholder="Ex. Alpha Télécom" className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2.5 text-white outline-none focus:border-brand" />
            <span className="mt-1 block text-xs text-text-on-dark-muted">Si une organisation porte déjà ce nom, son espace est réutilisé.</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-on-dark">Secteur d’activité</span>
            <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2.5 text-white outline-none focus:border-brand">
              {SECTORS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-on-dark">Responsable <span className="text-text-on-dark-muted">(prénom et nom)</span></span>
            <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="Prénom et nom" className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2.5 text-white outline-none focus:border-brand" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-on-dark">Courriel du responsable</span>
            <input type="email" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="dsi@societe.ci" className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2.5 text-white outline-none focus:border-brand" />
            <span className="mt-1 block text-xs text-text-on-dark-muted">Son compte administrateur est créé tout de suite ; le lien lui sert à choisir son mot de passe.</span>
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />} Inscrire et générer le lien
            </button>
            <button type="button" onClick={() => setAdding(false)} className="rounded-md border border-border-dark px-4 py-2 text-sm font-semibold text-text-on-dark-muted hover:text-white">Annuler</button>
          </div>
        </form>
      )}

      {/* Podium : lisible d'un coup d'œil, avant le tableau. */}
      {ranked.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {ranked.slice(0, 3).map((p) => (
            <div key={p.id} className={`rounded-xl border p-4 ${p.rank === 1 ? 'border-amber-400/50 bg-amber-400/5' : 'border-border-dark bg-surface-dark'}`}>
              <div className="flex items-center justify-between">
                <RankBadge rank={p.rank} />
                <Trophy size={16} className={p.rank === 1 ? 'text-amber-400' : 'text-text-on-dark-muted'} />
              </div>
              <p className="mt-3 truncate font-bold text-white">{p.organizationName}</p>
              <p className="text-xs text-text-on-dark-muted">{p.sectorLabel}</p>
              <p className="mt-2 text-2xl font-extrabold text-white">{p.meritScore}<span className="text-sm font-semibold text-text-on-dark-muted"> / 100</span></p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border-dark bg-surface-dark">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-bg-dark text-left text-[11px] uppercase tracking-wider text-text-on-dark-muted">
            <tr>
              <th className="px-4 py-3">Rang</th>
              <th className="px-4 py-3">Société</th>
              <th className="px-4 py-3">Accès</th>
              <th className="px-4 py-3">Questionnaire</th>
              <th className="px-4 py-3">Maturité</th>
              <th className="px-4 py-3">Scans</th>
              <th className="px-4 py-3">Exposition</th>
              <th className="px-4 py-3">Mérite</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {project.participants.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-text-on-dark-muted">Aucune société inscrite. Ajoutez-en une pour générer son lien d’accès.</td></tr>
            )}
            {project.participants.map((p) => {
              const badge = accessBadge(p)
              return (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-3"><RankBadge rank={p.rank} /></td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{p.organizationName}</p>
                    <p className="text-xs text-text-on-dark-muted">{p.sectorLabel}</p>
                    {(p.contactName || p.contactEmail) && (
                      <p className="mt-0.5 text-xs text-text-on-dark-muted">{[p.contactName, p.contactEmail].filter(Boolean).join(' · ')}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.label}</span>
                    <p className="mt-1 text-xs text-text-on-dark-muted">{p.members} compte{p.members > 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-bg-dark">
                        <div className="h-full bg-brand" style={{ width: `${Math.min(100, p.completionRate)}%` }} />
                      </div>
                      <span className="text-white">{Math.round(p.completionRate)} %</span>
                    </div>
                    <p className="mt-1 text-xs text-text-on-dark-muted">{p.answeredQuestions}/{p.applicableQuestions} · {p.lastAnswerAt ? formatDate(p.lastAnswerAt, true) : 'aucune réponse'}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.maturityScore === null ? <span className="text-text-on-dark-muted">—</span> : (
                      <>
                        <span className="font-semibold text-white">{p.maturityScore.toFixed(2)} / 4</span>
                        <p className="text-xs text-text-on-dark-muted">{MATURITY_LABEL[Math.round(p.maturityScore)] ?? ''}</p>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-white"><Radar size={13} className="text-text-on-dark-muted" /> {p.scansCompleted}/{p.scansTotal}</span>
                    {(p.criticalFindings > 0 || p.highFindings > 0) && (
                      <p className="mt-0.5 text-xs"><span className="text-red-400">{p.criticalFindings} crit.</span> · <span className="text-orange-400">{p.highFindings} élevés</span></p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.scansCompleted === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-text-on-dark-muted" title="Aucun scan abouti : l’exposition n’entre pas dans le mérite."><AlertTriangle size={12} /> sans scan</span>
                    ) : p.riskScore === null ? <span className="text-text-on-dark-muted">—</span> : (
                      <span className={`font-semibold ${LEVEL_STYLE[p.riskLevel ?? ''] ?? 'text-white'}`}>{p.riskScore} <span className="text-xs font-normal">/ 100</span></span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.meritScore === null ? <span className="text-xs text-text-on-dark-muted">non classée</span> : <span className="text-lg font-extrabold text-white">{p.meritScore}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => showAnswers(p)} title="Voir les réponses" className="rounded-md p-2 text-text-on-dark-muted hover:bg-bg-dark hover:text-white"><ClipboardList size={16} /></button>
                      {isOpen && !p.joined && (
                        <button type="button" onClick={() => renew(p)} title="Nouveau lien d’activation" className="rounded-md p-2 text-text-on-dark-muted hover:bg-bg-dark hover:text-white"><RefreshCw size={16} /></button>
                      )}
                      {isOpen && (
                        <button type="button" onClick={() => remove(p)} title="Retirer du projet" className="rounded-md p-2 text-text-on-dark-muted hover:bg-bg-dark hover:text-red-400"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-text-on-dark-muted">
        Mérite sur 100 : 70 % de maturité déclarée (questionnaire) et 30 % de sécurité constatée (100 − exposition)
        lorsqu’au moins un scan a abouti ; sinon la maturité seule. Une société sans réponse n’est pas classée.
      </p>

      {/* Réponses d'une société : panneau latéral. */}
      {(answers || answersLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setAnswers(null)}>
          <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-border-dark bg-surface-dark p-6" onClick={(e) => e.stopPropagation()}>
            {answersLoading || !answers ? (
              <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-brand" size={32} /></div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">Réponses au questionnaire</p>
                    <h2 className="mt-1 text-xl font-bold text-white">{answers.participant.organizationName}</h2>
                    <p className="text-sm text-text-on-dark-muted">
                      {answers.participant.answeredQuestions}/{answers.participant.applicableQuestions} questions ·
                      maturité {answers.participant.maturityScore?.toFixed(2) ?? '—'} / 4
                    </p>
                  </div>
                  <button type="button" onClick={() => setAnswers(null)} aria-label="Fermer" className="text-text-on-dark-muted hover:text-white"><X size={20} /></button>
                </div>
                <ul className="mt-5 space-y-2">
                  {answers.answers.map((a) => (
                    <li key={a.code} className={`rounded-lg border p-3 ${a.maturityLevel === null ? 'border-dashed border-border-dark opacity-70' : 'border-border-dark bg-bg-dark'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-on-dark-muted">{a.domain} · {a.code}</p>
                          <p className="mt-0.5 text-sm text-white">{a.text}</p>
                          {a.comment && <p className="mt-1 text-xs italic text-text-on-dark-muted">« {a.comment} »</p>}
                        </div>
                        <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${a.maturityLevel === null ? 'bg-bg-dark text-text-on-dark-muted' : 'bg-brand/15 text-white'}`}>
                          {a.maturityLevel === null ? 'Sans réponse' : `${a.maturityLevel} · ${MATURITY_LABEL[a.maturityLevel] ?? ''}`}
                        </span>
                      </div>
                      {a.answeredAt && <p className="mt-1.5 text-[11px] text-text-on-dark-muted">{formatDate(a.answeredAt, true)}{a.answeredBy && ` · ${a.answeredBy}`}</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
