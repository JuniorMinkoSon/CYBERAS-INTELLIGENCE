import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus, Loader2, ShieldAlert, Users, CheckCircle2, ClipboardList, ArrowRight } from 'lucide-react'
import { projectsClient, type ProjectSummary } from '../../services/projectsClient'
import { useNotification } from '../../contexts/NotificationContext'

/**
 * Projets d'évaluation : liste et création.
 *
 * Un projet réunit plusieurs sociétés à évaluer ensemble : appel d'offres,
 * campagne sectorielle, programme de mise à niveau. Cette page ne fait que
 * les lister et en ouvrir un ; tout le travail se passe dans le détail.
 */

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AdminProjectsPage() {
  const { notify } = useNotification()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', deadline: '' })

  useEffect(() => {
    projectsClient
      .list()
      .then((list) => setProjects(list ?? []))
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Chargement impossible'
        if (/403|réservé|forbidden/i.test(message)) setDenied(true)
        else notify(message, 'error')
      })
      .finally(() => setLoading(false))
  }, [notify])

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 3) {
      notify('Le nom du projet doit faire au moins 3 caractères.', 'error')
      return
    }
    setSaving(true)
    try {
      const created = await projectsClient.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        deadline: form.deadline || undefined,
      })
      setProjects((list) => [created, ...list])
      setForm({ name: '', description: '', deadline: '' })
      setCreating(false)
      notify(`Projet « ${created.name} » créé. Ajoutez-y des sociétés.`, 'success')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Création impossible', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    )
  }

  if (denied) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-lg border border-border-dark bg-surface-dark p-10 text-center">
          <ShieldAlert className="mx-auto mb-4 text-orange-400" size={36} />
          <h1 className="text-xl font-bold text-white">Espace réservé</h1>
          <p className="mt-3 text-sm text-text-on-dark-muted">
            Les projets d’évaluation sont pilotés par l’administration de la plateforme.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Administration</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Projets d’évaluation</h1>
          <p className="mt-1 max-w-2xl text-sm text-text-on-dark-muted">
            Inscrivez plusieurs sociétés, remettez-leur un lien d’accès, puis comparez leurs réponses,
            leurs scans et leur score pour les classer par ordre de mérite.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus size={16} /> Nouveau projet
        </button>
      </div>

      {creating && (
        <form onSubmit={create} className="grid gap-4 rounded-xl border border-brand/40 bg-surface-dark p-5 md:grid-cols-[2fr_1fr]">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-text-on-dark">Nom du projet</span>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Appel d’offres hébergement 2026"
              className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2.5 text-white outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-on-dark">Objet <span className="text-text-on-dark-muted">(facultatif)</span></span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Ce que le projet évalue et pour qui."
              className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2.5 text-white outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-on-dark">Date limite <span className="text-text-on-dark-muted">(facultatif)</span></span>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border-dark bg-bg-dark px-3 py-2.5 text-white outline-none focus:border-brand"
            />
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Créer le projet
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md border border-border-dark px-4 py-2 text-sm font-semibold text-text-on-dark-muted hover:text-white"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-dark bg-surface-dark p-12 text-center">
          <FolderKanban className="mx-auto mb-3 text-text-on-dark-muted" size={32} />
          <p className="font-semibold text-white">Aucun projet pour l’instant</p>
          <p className="mt-1 text-sm text-text-on-dark-muted">Créez-en un, puis inscrivez-y les sociétés à évaluer.</p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                to={`/app/admin/projets/${p.id}`}
                className="flex h-full flex-col rounded-xl border border-border-dark bg-surface-dark p-5 transition hover:border-brand"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">{p.name}</h2>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      p.status === 'OPEN'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-border-dark bg-bg-dark text-text-on-dark-muted'
                    }`}
                  >
                    {p.status === 'OPEN' ? 'En cours' : 'Clos'}
                  </span>
                </div>
                {p.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-text-on-dark-muted">{p.description}</p>
                )}
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-bg-dark p-2">
                    <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-text-on-dark-muted"><Users size={11} /> Sociétés</dt>
                    <dd className="mt-0.5 text-lg font-bold text-white">{p.participants}</dd>
                  </div>
                  <div className="rounded-lg bg-bg-dark p-2">
                    <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-text-on-dark-muted"><CheckCircle2 size={11} /> Entrées</dt>
                    <dd className="mt-0.5 text-lg font-bold text-white">{p.joined}</dd>
                  </div>
                  <div className="rounded-lg bg-bg-dark p-2">
                    <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-text-on-dark-muted"><ClipboardList size={11} /> Répondent</dt>
                    <dd className="mt-0.5 text-lg font-bold text-white">{p.answering}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between text-xs text-text-on-dark-muted">
                  <span>Échéance : {formatDate(p.deadline)}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-brand">Ouvrir <ArrowRight size={13} /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
