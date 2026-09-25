import { useEffect, useMemo, useState } from 'react'
import { Loader, Lightbulb, RefreshCw, AlertTriangle, ShieldCheck, CircleDot } from 'lucide-react'
import { riskClient } from '../../services/riskClient'
import { auditsClient } from '../../services/auditsClient'
import { postureClient, type OrganizationalRecommendation } from '../../services/postureClient'
import { FrameworkScoreCard } from '../../components/app/FrameworkScoreCard'
import type { Audit, Recommendation, UUID } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'
import {
  answerProjectionClient,
  agregerParFamille,
  LIBELLES_FAMILLE,
} from '../../services/answerProjectionClient'

/**
 * Recommandations d'un audit, dans leurs deux origines.
 *
 * <b>Techniques</b> : déduites des constats de scan évalués par le moteur de
 * risque. Elles se pilotent : avancement, échéance.
 *
 * <b>Organisationnelles</b> : déduites du questionnaire, sans aucun scan. La
 * page ne lisait que la première source, si bien qu'un audit purement
 * documentaire : le cas de la grande majorité des premières missions —
 * n'affichait rien du tout. L'utilisateur en concluait, à raison, que la page
 * ne marchait pas : elle exigeait silencieusement un scan.
 *
 * Chaque fiche suit la même lecture qu'un rapport d'audit : ce qui a été
 * constaté, ce que cela fait courir, ce qu'il faut faire. Séparer les trois
 * évite la formulation creuse : « corriger la vulnérabilité », qui ne dit ni
 * pourquoi ni comment.
 */

const PRIORITY = {
  CRITICAL: { label: 'Critique', badge: 'bg-red-500/10 text-red-400 border-red-500/30', bar: 'bg-red-500', rank: 0 },
  HIGH: { label: 'Haute', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', bar: 'bg-orange-500', rank: 1 },
  MEDIUM: { label: 'Moyenne', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-500', rank: 2 },
  LOW: { label: 'Faible', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', bar: 'bg-emerald-500', rank: 3 },
} as const

const STATUS = {
  OPEN: { label: 'À traiter', icon: CircleDot, tone: 'text-text-on-dark-muted' },
  IN_PROGRESS: { label: 'En cours', icon: RefreshCw, tone: 'text-blue-400' },
  DONE: { label: 'Traitée', icon: ShieldCheck, tone: 'text-emerald-400' },
} as const

type StatusKey = keyof typeof STATUS
type Filter = 'ALL' | StatusKey

function priorityOf(p: string) {
  return PRIORITY[p as keyof typeof PRIORITY] ?? {
    label: p, badge: 'border-border-dark text-text-on-dark-muted', bar: 'bg-slate-500', rank: 4,
  }
}

/** Les références de référentiel arrivent en forme libre : on les aplatit sans rien inventer. */
function frameworkLabels(refs: unknown): string[] {
  if (!refs) return []
  if (Array.isArray(refs)) return refs.map((r) => (typeof r === 'string' ? r : JSON.stringify(r)))
  if (typeof refs === 'string') return [refs]
  if (typeof refs === 'object') {
    return Object.entries(refs as Record<string, unknown>)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k} ${Array.isArray(v) ? v.join(', ') : String(v)}`)
  }
  return []
}

export function RecommendationsPage() {
  const { notify } = useNotification()
  const [items, setItems] = useState<Recommendation[]>([])
  const [audits, setAudits] = useState<Audit[]>([])
  const [auditId, setAuditId] = useState<UUID | ''>('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [organisational, setOrganisational] = useState<OrganizationalRecommendation[]>([])
  const [familyFilter, setFamilyFilter] = useState<string>('ALL')
  // Charge de remediation, par famille. Les fiches ci-dessous disent quoi
  // faire ; ceci dit combien il en reste, et se lit aussi quand aucun audit
  // n'est selectionne — la ou les fiches organisationnelles ne s'affichent pas.
  const [charge, setCharge] = useState<ReturnType<typeof agregerParFamille>>([])

  /** Domaines réellement présents, dans l'ordre où le serveur les a rendus. */
  const organisationalFamilies = useMemo(() => {
    const counts = new Map<string, { family: string; label: string; count: number }>()
    organisational.forEach((r) => {
      const entry = counts.get(r.family)
      if (entry) entry.count += 1
      else counts.set(r.family, { family: r.family, label: r.familyLabel, count: 1 })
    })
    return Array.from(counts.values())
  }, [organisational])

  const visibleOrganisational = useMemo(
    () => (familyFilter === 'ALL'
      ? organisational
      : organisational.filter((r) => r.family === familyFilter)),
    [organisational, familyFilter]
  )

  useEffect(() => {
    auditsClient.list()
      .then((d) => setAudits(Array.isArray(d) ? d : []))
      .catch(() => setAudits([]))
  }, [])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await riskClient.listRecommendations(auditId || undefined)
      setItems(Array.isArray(data) ? data : [])

      // Les recommandations organisationnelles dépendent d'un audit précis :
      // elles se déduisent de ses réponses. Leur indisponibilité ne doit pas
      // masquer les recommandations techniques, d'où le repli silencieux.
      if (auditId) {
        setOrganisational(await postureClient.recommendations(auditId).catch(() => []))
      } else {
        setOrganisational([])
      }

      // La projection suit le meme perimetre que la page : un audit precis, ou
      // l'organisation entiere. Elle reste un complement, d'où le repli.
      const projection = await (auditId
        ? answerProjectionClient.forAudit(auditId)
        : answerProjectionClient.forOrganization()
      ).catch(() => [])
      setCharge(agregerParFamille(Array.isArray(projection) ? projection : []))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chargement impossible'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const generate = async () => {
    if (!auditId) {
      notify('Sélectionnez un audit pour générer ses recommandations.', 'error')
      return
    }
    setGenerating(true)
    try {
      await riskClient.generateRecommendations(auditId)
      notify('Recommandations régénérées à partir des risques évalués', 'success')
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Génération impossible', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const setStatus = async (rec: Recommendation, status: StatusKey) => {
    setSavingId(rec.id)
    try {
      await riskClient.updateRecommendation(rec.id, { status })
      // Mise à jour locale : recharger la liste entière ferait sauter la page
      // sous le curseur pour un changement d'une seule ligne.
      setItems((list) => list.map((r) => (r.id === rec.id ? { ...r, status } : r)))
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Mise à jour impossible', 'error')
    } finally {
      setSavingId(null)
    }
  }

  /** Les priorités les plus fortes en premier : c'est l'ordre de traitement. */
  const visible = useMemo(() => {
    return items
      .filter((r) => filter === 'ALL' || r.status === filter)
      .slice()
      .sort((a, b) => priorityOf(a.priority).rank - priorityOf(b.priority).rank)
  }, [items, filter])

  const counts = useMemo(() => ({
    ALL: items.length,
    OPEN: items.filter((r) => r.status === 'OPEN').length,
    IN_PROGRESS: items.filter((r) => r.status === 'IN_PROGRESS').length,
    DONE: items.filter((r) => r.status === 'DONE').length,
  }), [items])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin text-brand" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Recommandations</h1>
          <p className="mt-1 text-sm text-text-on-dark-muted">
            {counts.ALL} recommandation(s) : dérivées des constats évalués, jamais saisies à la main.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={auditId}
            onChange={(e) => setAuditId(e.target.value as UUID | '')}
            className="rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
          >
            <option value="">Tous les audits</option>
            {audits.map((a) => (
              <option key={a.id} value={a.id}>{a.auditCode} : {a.title}</option>
            ))}
          </select>
          <button
            onClick={generate}
            disabled={generating || !auditId}
            title={!auditId ? 'Sélectionnez un audit' : 'Régénérer à partir des risques évalués'}
            className="flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            Régénérer
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'DONE'] as Filter[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filter === key
                ? 'border-brand bg-brand/15 text-white'
                : 'border-border-dark text-text-on-dark-muted hover:text-white'
            }`}
          >
            {key === 'ALL' ? 'Toutes' : STATUS[key].label}
            <span className="ml-2 opacity-60">{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Le score du référentiel, avant les recommandations : il dit d'où
          viennent les écarts que la liste détaille ensuite. */}
      {auditId && <FrameworkScoreCard auditId={auditId} />}

      {/* Charge restante, par famille. Placée avant les fiches : combien il en
          reste se lit avant quoi traiter en premier. */}
      <ChargeParFamille familles={charge} pourUnAudit={Boolean(auditId)} />

      {/* Recommandations organisationnelles : issues du questionnaire seul.
          Affichées avant les techniques parce qu'elles existent dès les
          premières réponses, alors que les techniques attendent un scan. */}
      {organisational.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-bold text-white">
              Issues du questionnaire ({visibleOrganisational.length})
            </h2>
            <span className="text-xs text-text-on-dark-muted">
              Déduites de vos réponses : aucun scan requis
            </span>
          </div>

          {/* Filtre par domaine. Le compteur évite d'ouvrir un domaine pour
              découvrir qu'il n'a rien à corriger. */}
          {organisationalFamilies.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFamilyFilter('ALL')}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  familyFilter === 'ALL'
                    ? 'bg-brand text-white'
                    : 'border border-border-dark text-text-on-dark-muted hover:text-white'
                }`}
              >
                Tous <span className="ml-1 opacity-70">{organisational.length}</span>
              </button>
              {organisationalFamilies.map((f) => (
                <button
                  key={f.family}
                  type="button"
                  onClick={() => setFamilyFilter(f.family)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                    familyFilter === f.family
                      ? 'bg-brand text-white'
                      : 'border border-border-dark text-text-on-dark-muted hover:text-white'
                  }`}
                >
                  {f.label} <span className="ml-1 opacity-70">{f.count}</span>
                </button>
              ))}
            </div>
          )}

          {visibleOrganisational.map((rec) => {
            const p = priorityOf(rec.priority)
            return (
              <article
                key={`${rec.domain}-${rec.title}`}
                className="rounded-lg border border-border-dark bg-surface-dark p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${p.badge}`}>
                        {p.label}
                      </span>
                      {/* La famille avant le domaine : c'est le niveau auquel
                          l'utilisateur raisonne depuis le questionnaire. */}
                      <span className="rounded bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
                        {rec.familyLabel}
                      </span>
                      <span className="rounded bg-bg-dark px-2 py-0.5 text-[11px] text-text-on-dark-muted">
                        {rec.domain}
                      </span>
                      {rec.foundational && (
                        <span className="rounded bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
                          Domaine fondateur
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-semibold text-white">{rec.title}</h3>
                  </div>
                </div>

                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-text-on-dark-muted">Constat</dt>
                    <dd className="mt-0.5 text-text-on-dark-muted">{rec.problem}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-text-on-dark-muted">Action</dt>
                    <dd className="mt-0.5 text-text-on-dark-muted">{rec.action}</dd>
                  </div>
                </dl>

                {/* Les questions elles-mêmes, pas seulement la note du domaine.
                    Nommer un domaine sans dire quelles réponses l'ont fait
                    chuter ne dit pas quoi corriger. */}
                {rec.weakQuestions?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-text-on-dark-muted">
                      Questions à améliorer
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {rec.weakQuestions.map((q) => (
                        <li
                          key={q.code}
                          className="flex items-start gap-3 rounded-md bg-bg-dark px-3 py-2"
                        >
                          <span className="font-mono text-xs font-bold text-status-high">
                            {q.code}
                          </span>
                          <span className="min-w-0 flex-1 text-sm text-text-on-dark-muted">
                            {q.text}
                          </span>
                          <span className="shrink-0 font-mono text-xs text-text-on-dark-muted">
                            {q.level}/4
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-3 text-xs text-text-on-dark-muted">
                  niveau moyen {rec.averageLevel.toFixed(1)}/4
                  {rec.frameworkRefs?.length > 0 && (
                    <> · {rec.frameworkRefs.map((r) => `${r.framework} ${r.controlId}`).join(', ')}</>
                  )}
                </p>
              </article>
            )
          })}
        </section>
      )}

      {visible.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <Lightbulb className="mx-auto mb-3 text-text-on-dark-muted" size={32} />
          <p className="text-text-on-dark-muted">
            {items.length === 0
              ? 'Aucune recommandation technique pour le moment.'
              : 'Aucune recommandation dans cet état.'}
          </p>
          {items.length === 0 && (
            <p className="mx-auto mt-2 max-w-lg text-sm text-text-on-dark-muted">
              Les recommandations techniques se déduisent des constats de scan.
              {organisational.length > 0
                ? ' Celles issues de votre questionnaire sont affichées ci-dessus.'
                : ' Sélectionnez un audit pour voir celles issues de son questionnaire, ou lancez un scan.'}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((rec) => {
            const p = priorityOf(rec.priority)
            const s = STATUS[rec.status as StatusKey] ?? STATUS.OPEN
            const StatusIcon = s.icon
            const refs = frameworkLabels(rec.frameworkRefs)

            return (
              <article
                key={rec.id}
                className="overflow-hidden rounded-lg border border-border-dark bg-surface-dark"
              >
                {/* Le liseré de priorité donne l'ordre de traitement au premier regard. */}
                <div className={`h-1 ${p.bar}`} />

                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-white">
                      {rec.problem || rec.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`rounded border px-2 py-1 text-xs font-medium ${p.badge}`}>
                        {p.label}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.tone}`}>
                        <StatusIcon size={14} /> {s.label}
                      </span>
                    </div>
                  </div>

                  {rec.risk && (
                    <div className="flex gap-2.5 rounded border border-orange-500/20 bg-orange-500/5 p-3">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-400" />
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                          Risque encouru
                        </div>
                        <p className="mt-1 text-sm text-text-on-dark">{rec.risk}</p>
                      </div>
                    </div>
                  )}

                  {rec.description && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-text-on-dark-muted">
                        Action recommandée
                      </div>
                      <p className="mt-1 text-sm text-text-on-dark">{rec.description}</p>
                    </div>
                  )}

                  {refs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {refs.map((r) => (
                        <span key={r} className="rounded border border-border-dark px-2 py-0.5 text-xs text-text-on-dark-muted">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-dark pt-3">
                    <div className="text-xs text-text-on-dark-muted">
                      {rec.responsible && <span>Responsable : {rec.responsible}</span>}
                      {rec.dueDate && <span className="ml-3">Échéance : {rec.dueDate}</span>}
                    </div>
                    <div className="flex gap-2">
                      {(Object.keys(STATUS) as StatusKey[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => setStatus(rec, key)}
                          disabled={savingId === rec.id || rec.status === key}
                          className={`rounded border px-3 py-1.5 text-xs font-medium transition disabled:cursor-default ${
                            rec.status === key
                              ? 'border-brand bg-brand/15 text-white'
                              : 'border-border-dark text-text-on-dark-muted hover:border-brand/60 hover:text-white'
                          }`}
                        >
                          {STATUS[key].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Charge de remediation restante, par famille de domaines.
 *
 * <p>Les fiches qui suivent disent quoi faire, une par une. Celle-ci dit
 * combien il en reste et ou : c'est ce qu'un responsable regarde pour repartir
 * l'effort, avant d'ouvrir la premiere fiche.
 *
 * <p>Elle se lit aussi quand aucun audit n'est selectionne, la ou les fiches
 * organisationnelles restent vides puisqu'elles se deduisent d'un audit precis.
 */
function ChargeParFamille({
  familles,
  pourUnAudit,
}: {
  familles: ReturnType<typeof agregerParFamille>
  pourUnAudit: boolean
}) {
  if (familles.length === 0) return null

  const totalEcarts = familles.reduce((n, f) => n + f.ecarts, 0)
  const totalRepondues = familles.reduce((n, f) => n + f.repondues, 0)

  return (
    <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold text-white">Charge par famille</h2>
        <span className="text-xs text-text-on-dark-muted">
          {pourUnAudit ? 'Sur cet audit' : 'Sur tous les audits'} : {totalEcarts} écart
          {totalEcarts > 1 ? 's' : ''} sur {totalRepondues} réponse{totalRepondues > 1 ? 's' : ''}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {familles.map((f) => {
          // La barre rapporte les ecarts aux reponses de la famille, pas au
          // total : une famille de cinq questions dont trois sont en ecart est
          // plus abimee qu'une famille de cent qui en compte dix.
          const part = f.repondues > 0 ? (f.ecarts / f.repondues) * 100 : 0
          return (
            <div key={f.famille}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-text-on-dark">
                  {LIBELLES_FAMILLE[f.famille] ?? f.famille}
                </span>
                <span className="text-xs text-text-on-dark-muted">
                  {f.ecarts === 0 ? 'Aucun écart' : `${f.ecarts} à traiter`}
                  {f.maturiteMoyenne !== null
                    ? ` · maturité ${f.maturiteMoyenne.toFixed(1)}/4`
                    : ' · non évaluée'}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${part > 50 ? 'bg-red-500' : part > 20 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(part, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
