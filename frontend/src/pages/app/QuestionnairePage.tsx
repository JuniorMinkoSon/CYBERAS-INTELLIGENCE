import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Loader2, AlertCircle, Check, ChevronDown, MessageSquare,
  SlashIcon, TrendingDown, FileQuestion, Paperclip, Upload, FileText, X,
  ChevronLeft, ArrowRight,
} from 'lucide-react'
import {
  questionnaireClient, LIKERT_LEVELS,
  type Questionnaire, type Question, type Answer,
} from '../../services/questionnaireClient'
import { evidenceClient, type EvidenceLink } from '../../services/evidenceClient'

/**
 * Questionnaire d'audit.
 *
 * Le score de maturité vient du serveur et n'est jamais recalculé ici : c'est
 * lui qui alimente le moteur de risque, et deux calculs concurrents finiraient
 * par diverger.
 *
 * Chaque réponse est enregistrée dès la saisie, sans bouton d'envoi global :
 * un questionnaire de trente-neuf questions se remplit en plusieurs fois, et
 * perdre une saisie parce qu'on a quitté la page serait inacceptable. L'état
 * d'enregistrement est visible par question.
 */

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function QuestionnairePage() {
  const { auditId } = useParams<{ auditId: string }>()

  const [data, setData] = useState<Questionnaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeDomain, setActiveDomain] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({})

  const [links, setLinks] = useState<EvidenceLink[]>([])
  const [uploadStates, setUploadStates] = useState<Record<string, SaveState>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    if (!auditId) return
    try {
      setLoading(true)
      setError(null)
      const [questionnaire, evidences] = await Promise.all([
        questionnaireClient.getForAudit(auditId),
        // Les pièces ne conditionnent pas la saisie : leur indisponibilité ne
        // doit pas empêcher de répondre au questionnaire.
        evidenceClient.listLinks(auditId).catch(() => [] as EvidenceLink[]),
      ])
      setData(questionnaire)
      setLinks(evidences)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [auditId])

  useEffect(() => { void load() }, [load])

  /** Index des réponses par code de question, pour un accès direct au rendu. */
  const answersByCode = useMemo(() => {
    const map = new Map<string, Answer>()
    data?.answers.forEach((a) => map.set(a.questionCode, a))
    return map
  }, [data])

  /** Pièces rattachées, groupées par code de question. */
  const linksByCode = useMemo(() => {
    const map = new Map<string, EvidenceLink[]>()
    links.forEach((link) => {
      if (!link.questionCode) return
      const existing = map.get(link.questionCode)
      if (existing) existing.push(link)
      else map.set(link.questionCode, [link])
    })
    return map
  }, [links])

  const domains = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.questions.map((q) => q.domain))).sort()
  }, [data])

  const visibleQuestions = useMemo(() => {
    if (!data) return []
    const list = activeDomain === 'all'
      ? data.questions
      : data.questions.filter((q) => q.domain === activeDomain)
    return [...list].sort((a, b) => a.position - b.position)
  }, [data, activeDomain])

  /**
   * Enregistre une réponse puis recharge la synthèse.
   *
   * La synthèse est rechargée depuis le serveur plutôt que recalculée : la
   * pondération par domaine appartient au backend, la reproduire ici
   * introduirait une seconde vérité.
   */
  const saveAnswer = async (
    question: Question,
    maturityLevel: number | null,
    notApplicable: boolean,
    comment?: string
  ) => {
    if (!auditId) return

    setSaveStates((s) => ({ ...s, [question.code]: 'saving' }))

    // Mise à jour optimiste : la sélection doit répondre immédiatement, même
    // si la confirmation serveur prend quelques centaines de millisecondes.
    setData((current) => {
      if (!current) return current
      const existing = current.answers.find((a) => a.questionCode === question.code)
      const updated: Answer = {
        id: existing?.id ?? (`pending-${question.code}` as never),
        questionCode: question.code,
        maturityLevel,
        notApplicable,
        comment: comment ?? existing?.comment,
        answeredAt: new Date().toISOString(),
        answeredByEmail: existing?.answeredByEmail,
      }
      return {
        ...current,
        answers: existing
          ? current.answers.map((a) => (a.questionCode === question.code ? updated : a))
          : [...current.answers, updated],
      }
    })

    try {
      await questionnaireClient.answer(auditId, question.code, {
        maturityLevel,
        notApplicable,
        comment,
      })
      const summary = await questionnaireClient.getSummary(auditId)
      setData((current) => (current ? { ...current, summary } : current))
      setSaveStates((s) => ({ ...s, [question.code]: 'saved' }))

      // L'indicateur de succès s'efface : le laisser en permanence ferait
      // perdre sa valeur de signal.
      window.setTimeout(
        () => setSaveStates((s) => ({ ...s, [question.code]: 'idle' })),
        2000
      )
    } catch {
      setSaveStates((s) => ({ ...s, [question.code]: 'error' }))
      // L'état local ne reflète plus le serveur : on recharge pour éviter
      // d'afficher une réponse qui n'a pas été enregistrée.
      void load()
    }
  }

  /**
   * Verse une pièce et la rattache à la question.
   *
   * La liste est relue depuis le serveur plutôt que complétée localement : le
   * rattachement porte un identifiant que seul le serveur attribue, et
   * l'inventer ici rendrait le bouton de retrait inopérant jusqu'au prochain
   * chargement de la page.
   */
  const attachFile = async (question: Question, file: File) => {
    if (!auditId) return

    setUploadStates((s) => ({ ...s, [question.code]: 'saving' }))
    setUploadErrors((e) => ({ ...e, [question.code]: '' }))

    try {
      await evidenceClient.attachToQuestion(auditId, question.code, file)
      setLinks(await evidenceClient.listLinks(auditId))
      setUploadStates((s) => ({ ...s, [question.code]: 'saved' }))
      window.setTimeout(
        () => setUploadStates((s) => ({ ...s, [question.code]: 'idle' })),
        2000
      )
    } catch (err) {
      setUploadStates((s) => ({ ...s, [question.code]: 'error' }))
      setUploadErrors((e) => ({
        ...e,
        [question.code]: err instanceof Error ? err.message : 'Téléversement impossible',
      }))
    }
  }

  /**
   * Détache une pièce de la question.
   *
   * Le retrait n'est appliqué à l'affichage qu'une fois le serveur d'accord :
   * faire disparaître la ligne d'abord laisserait croire qu'une pièce a été
   * retirée alors qu'elle étaye toujours la réponse.
   */
  const detachFile = async (question: Question, link: EvidenceLink) => {
    if (!auditId) return

    setUploadStates((s) => ({ ...s, [question.code]: 'saving' }))
    try {
      await evidenceClient.unlink(auditId, link.id)
      setLinks((current) => current.filter((l) => l.id !== link.id))
      setUploadStates((s) => ({ ...s, [question.code]: 'idle' }))
    } catch (err) {
      setUploadStates((s) => ({ ...s, [question.code]: 'error' }))
      setUploadErrors((e) => ({
        ...e,
        [question.code]: err instanceof Error ? err.message : 'Retrait impossible',
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <AlertCircle size={32} className="mx-auto text-status-critical" />
        <h2 className="mt-4 font-bold text-white">Questionnaire indisponible</h2>
        <p className="mt-2 text-sm text-text-on-dark-muted">{error}</p>
        <button
          onClick={() => void load()}
          className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (!data || data.questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <FileQuestion size={32} className="mx-auto text-text-on-dark-muted" />
        <h2 className="mt-4 font-bold text-white">Aucune question disponible</h2>
        <p className="mt-2 text-sm text-text-on-dark-muted">
          Le catalogue de questions n'est pas encore chargé pour cet audit.
        </p>
      </div>
    )
  }

  const { summary } = data
  const completion = Math.round(summary.completionRate * 100)

  return (
    <div className="space-y-6">
      <header>
        {/* Le questionnaire est une étape du parcours, pas une destination.
            Sans ce retour, le client arrivait ici et perdait de vue les six
            autres étapes — or c'est le parcours qui le guide. */}
        {auditId && (
          <Link
            to={`/app/audits/${auditId}/parcours`}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-text-on-dark-muted transition-colors hover:text-white"
          >
            <ChevronLeft size={14} />
            Retour au parcours de la mission
          </Link>
        )}
        <h1 className="text-2xl font-bold text-white">
          Questionnaire
          <span className="ml-2 text-sm font-semibold text-text-on-dark-muted">
            étape 1 sur 7
          </span>
        </h1>
        <p className="mt-1 text-sm text-text-on-dark-muted">
          Répondez à chaque point selon ce qui est réellement en place chez vous.
          Chaque réponse est enregistrée immédiatement.
        </p>
      </header>

      {/* Synthèse. Les valeurs viennent du serveur, aucune n'est recalculée ici. */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border-dark bg-surface-dark p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
            Progression
          </p>
          <p className="mt-2 text-3xl font-extrabold text-white">{completion}%</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-dark">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-text-on-dark-muted">
            {summary.answeredQuestions} / {summary.applicableQuestions} questions applicables
          </p>
        </div>

        <div className="rounded-lg border border-border-dark bg-surface-dark p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
            Niveau déclaré
          </p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {summary.maturityScore !== null ? summary.maturityScore.toFixed(1) : '—'}
            <span className="text-base font-semibold text-text-on-dark-muted"> / 4</span>
          </p>
          <p className="mt-3 text-xs text-text-on-dark-muted">
            {summary.maturityScore === null
              ? 'Aucune réponse enregistrée'
              : 'Moyenne pondérée par domaine'}
          </p>
        </div>

        <div className="rounded-lg border border-border-dark bg-surface-dark p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
            Contrôles faibles
          </p>
          <p className="mt-2 text-3xl font-extrabold text-status-high">{summary.weakControls}</p>
          <p className="mt-3 text-xs text-text-on-dark-muted">Répondus « pas du tout » ou « juste un peu »</p>
        </div>

        <div className="rounded-lg border border-border-dark bg-surface-dark p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
            Domaines
          </p>
          <p className="mt-2 text-3xl font-extrabold text-white">{summary.domains.length}</p>
          <p className="mt-3 text-xs text-text-on-dark-muted">
            {summary.totalQuestions} questions au catalogue
          </p>
        </div>
      </section>

      {/* Filtre par domaine. Le compteur par onglet évite d'ouvrir un domaine
          pour découvrir qu'il ne reste rien à y saisir. */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveDomain('all')}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
            activeDomain === 'all'
              ? 'bg-brand text-white'
              : 'border border-border-dark text-text-on-dark-muted hover:text-white'
          }`}
        >
          Tous ({data.questions.length})
        </button>
        {domains.map((d) => {
          const domainSummary = summary.domains.find((s) => s.domain === d)
          const answered = domainSummary?.answeredQuestions ?? 0
          const total = domainSummary?.totalQuestions ?? 0
          const complete = total > 0 && answered === total

          return (
            <button
              key={d}
              onClick={() => setActiveDomain(d)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                activeDomain === d
                  ? 'bg-brand text-white'
                  : 'border border-border-dark text-text-on-dark-muted hover:text-white'
              }`}
            >
              {complete && <Check size={13} className="text-status-compliant" />}
              {d}
              <span className="text-xs opacity-70">{answered}/{total}</span>
            </button>
          )
        })}
      </div>

      {/* Questions. */}
      <div className="space-y-3">
        {visibleQuestions.map((q) => {
          const answer = answersByCode.get(q.code)
          const state = saveStates[q.code] ?? 'idle'
          const isOpen = expanded === q.code
          const attachments = linksByCode.get(q.code) ?? []
          const uploadState = uploadStates[q.code] ?? 'idle'

          return (
            <article
              key={q.code}
              className={`rounded-lg border bg-surface-dark transition-colors ${
                state === 'error'
                  ? 'border-status-critical/50'
                  : answer
                    ? 'border-border-dark'
                    : 'border-border-dark/60'
              }`}
            >
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">{q.code}</span>
                      <span className="rounded bg-bg-dark px-2 py-0.5 text-[11px] text-text-on-dark-muted">
                        {q.domain}
                      </span>
                      {q.weight > 1 && (
                        <span className="rounded bg-status-high/15 px-2 py-0.5 text-[11px] font-semibold text-status-high">
                          Poids {q.weight}
                        </span>
                      )}
                      {/* Le compteur est visible replié : savoir quelles
                          réponses sont étayées sans ouvrir chaque question est
                          précisément ce que l'on vient vérifier. */}
                      {attachments.length > 0 && (
                        <span
                          className="inline-flex items-center gap-1 rounded bg-bg-dark px-2 py-0.5 text-[11px] text-text-on-dark-muted"
                          title={`${attachments.length} pièce${attachments.length > 1 ? 's' : ''} rattachée${attachments.length > 1 ? 's' : ''}`}
                        >
                          <Paperclip size={10} />
                          {attachments.length}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-white">{q.text}</p>
                  </div>

                  {/* Indicateur d'enregistrement, par question. */}
                  <div className="shrink-0">
                    {state === 'saving' && <Loader2 size={16} className="animate-spin text-brand" />}
                    {state === 'saved' && <Check size={16} className="text-status-compliant" />}
                    {state === 'error' && (
                      <AlertCircle size={16} className="text-status-critical" />
                    )}
                  </div>
                </div>

                {/* Échelle de Likert : cinq degrés que l'audité situe sans
                    connaître le vocabulaire d'audit. */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {LIKERT_LEVELS.map((level) => {
                    const selected = !answer?.notApplicable && answer?.maturityLevel === level.value
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => void saveAnswer(q, level.value, false, answer?.comment)}
                        title={level.description}
                        className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                          selected
                            ? 'border-brand bg-brand text-white'
                            : 'border-border-dark bg-bg-dark text-text-on-dark-muted hover:border-border-dark-hover hover:text-white'
                        }`}
                      >
                        <span className="mr-1.5 font-mono">{level.value}</span>
                        {level.label}
                      </button>
                    )
                  })}

                  {/* Non applicable : distinct de « pas du tout ». Une mesure
                      hors périmètre ne doit pas peser comme une mesure absente. */}
                  <button
                    type="button"
                    onClick={() => void saveAnswer(q, null, true, answer?.comment)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                      answer?.notApplicable
                        ? 'border-text-on-dark-muted bg-bg-dark text-white'
                        : 'border-border-dark bg-bg-dark text-text-on-dark-muted hover:text-white'
                    }`}
                  >
                    <SlashIcon size={12} />
                    Non applicable
                  </button>
                </div>

                {/* Repli : conseils, référentiels et commentaire. */}
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : q.code)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-text-on-dark-muted hover:text-white"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                  {isOpen ? 'Masquer le détail' : 'Détail, référentiels et commentaire'}
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-4 border-t border-border-dark pt-4">
                    {q.guidance && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-text-on-dark-muted">
                          Ce qui est attendu
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-text-on-dark-muted">
                          {q.guidance}
                        </p>
                      </div>
                    )}

                    {q.frameworkRefs?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-text-on-dark-muted">
                          Contrôles rattachés
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {q.frameworkRefs.map((ref, i) => (
                            <span
                              key={`${ref.framework}-${ref.controlId}-${i}`}
                              className="rounded border border-border-dark bg-bg-dark px-2 py-1 text-[11px] text-text-on-dark-muted"
                            >
                              <span className="font-semibold text-brand">{ref.framework}</span>
                              {' · '}{ref.controlId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor={`comment-${q.code}`}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-on-dark-muted"
                      >
                        <MessageSquare size={12} />
                        Commentaire et justification
                      </label>
                      <textarea
                        id={`comment-${q.code}`}
                        defaultValue={answer?.comment ?? ''}
                        rows={2}
                        placeholder="Preuve, référence documentaire, exception assumée…"
                        // Enregistré à la perte du focus plutôt qu'à chaque frappe :
                        // une requête par caractère saturerait le serveur.
                        onBlur={(e) => {
                          const value = e.target.value.trim()
                          if (value !== (answer?.comment ?? '')) {
                            void saveAnswer(
                              q,
                              answer?.maturityLevel ?? null,
                              answer?.notApplicable ?? false,
                              value
                            )
                          }
                        }}
                        className="mt-2 w-full resize-y rounded-md border border-border-dark bg-bg-dark px-3 py-2 text-sm text-white placeholder:text-text-on-dark-muted/50 focus:border-brand focus:outline-none"
                      />
                    </div>

                    {/* Pièces justificatives. Le rattachement se fait ici plutôt
                        que sur la seule page des preuves : c'est au moment où
                        l'on déclare un niveau que l'on a la pièce sous la main,
                        et c'est la question qui donne son sens au document. */}
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-on-dark-muted">
                        <Paperclip size={12} />
                        Pièces justificatives
                      </p>

                      {attachments.length > 0 ? (
                        <ul className="mt-2 space-y-1.5">
                          {attachments.map((link) => (
                            <li
                              key={link.id}
                              className="flex items-center gap-2 rounded-md bg-bg-dark px-3 py-2"
                            >
                              <FileText size={13} className="shrink-0 text-text-on-dark-muted" />
                              <span className="min-w-0 flex-1 truncate text-sm text-white">
                                {link.documentName}
                              </span>
                              <button
                                type="button"
                                onClick={() => void detachFile(q, link)}
                                disabled={uploadState === 'saving'}
                                aria-label={`Détacher ${link.documentName}`}
                                title="Détacher de cette question"
                                className="shrink-0 rounded p-1 text-text-on-dark-muted transition-colors hover:bg-status-critical/15 hover:text-status-critical disabled:opacity-40"
                              >
                                <X size={13} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1.5 text-sm text-text-on-dark-muted">
                          Aucune pièce rattachée : le niveau déclaré n'est pas étayé.
                        </p>
                      )}

                      {/* Le champ natif est masqué derrière son libellé : un
                          <input type="file"> brut ne se met pas au style du
                          reste et son rendu diffère d'un navigateur à l'autre. */}
                      <label
                        className={`mt-2 inline-flex items-center gap-1.5 rounded-md border border-border-dark bg-bg-dark px-3 py-2 text-xs font-semibold transition-colors ${
                          uploadState === 'saving'
                            ? 'pointer-events-none text-text-on-dark-muted opacity-60'
                            : 'cursor-pointer text-text-on-dark-muted hover:border-border-dark-hover hover:text-white'
                        }`}
                      >
                        {uploadState === 'saving' ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : uploadState === 'saved' ? (
                          <Check size={13} className="text-status-compliant" />
                        ) : (
                          <Upload size={13} />
                        )}
                        {uploadState === 'saving' ? 'Envoi en cours…' : 'Ajouter un fichier'}
                        <input
                          type="file"
                          className="hidden"
                          disabled={uploadState === 'saving'}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            // Le champ est vidé aussitôt : sans cela, choisir à
                            // nouveau le même fichier n'émet aucun événement et
                            // le second envoi semble ignoré.
                            e.target.value = ''
                            if (file) void attachFile(q, file)
                          }}
                        />
                      </label>

                      {uploadErrors[q.code] && (
                        <p className="mt-2 text-xs text-status-critical">
                          {uploadErrors[q.code]}
                        </p>
                      )}
                    </div>

                    {answer?.answeredByEmail && (
                      <p className="text-xs text-text-on-dark-muted">
                        Dernière réponse par {answer.answeredByEmail}
                        {answer.answeredAt &&
                          ` le ${new Date(answer.answeredAt).toLocaleDateString('fr-FR')}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Contrôles faibles : ils alimentent directement la priorisation, donc
          ils sont rappelés en fin de page plutôt que noyés dans la liste. */}
      {summary.weakControlDetails.length > 0 && (
        <section className="rounded-lg border border-status-high/40 bg-status-high/5 p-5">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="text-status-high" />
            <h2 className="font-bold text-white">
              Contrôles faibles ({summary.weakControlDetails.length})
            </h2>
          </div>
          <p className="mt-1 text-sm text-text-on-dark-muted">
            Ces domaines pèsent sur le score de risque : une maturité basse augmente la
            probabilité qu'une vulnérabilité passe inaperçue.
          </p>
          <ul className="mt-4 space-y-2">
            {summary.weakControlDetails.map((w) => (
              <li
                key={w.questionCode}
                className="flex items-start gap-3 rounded-md bg-bg-dark p-3"
              >
                <span className="font-mono text-xs font-bold text-status-high">
                  {w.questionCode}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-white">{w.text}</span>
                  <span className="mt-0.5 block text-xs text-text-on-dark-muted">
                    {w.domain} · niveau déclaré {w.maturityLevel}/4
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sortie vers la suite. Le questionnaire ne se « termine » pas : on peut
          le reprendre plus tard, mais il ne doit jamais laisser le client sans
          savoir ce qui vient après. Le libellé change selon l'avancement, sans
          jamais bloquer le passage à l'étape suivante. */}
      {auditId && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border-dark bg-surface-dark p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              {completion >= 100
                ? 'Toutes les questions sont renseignées.'
                : `Il reste ${summary.applicableQuestions - summary.answeredQuestions} question${
                    summary.applicableQuestions - summary.answeredQuestions > 1 ? 's' : ''
                  } à renseigner.`}
            </p>
            <p className="mt-1 text-xs text-text-on-dark-muted">
              Vos réponses sont enregistrées au fur et à mesure : vous pouvez revenir plus tard.
            </p>
          </div>
          <Link
            to={`/app/audits/${auditId}/parcours`}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Voir l'étape suivante
            <ArrowRight size={16} />
          </Link>
        </section>
      )}
    </div>
  )
}
