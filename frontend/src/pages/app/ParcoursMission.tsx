import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Loader2, AlertCircle, Check, ArrowRight, ListChecks, Paperclip,
  UserPlus, Radar, Sparkles, Gauge, Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { auditsClient } from '../../services/auditsClient'
import { questionnaireClient, type QuestionnaireSummary } from '../../services/questionnaireClient'
import { evidenceClient, type EvidenceLink } from '../../services/evidenceClient'
import { scansClient } from '../../services/scansClient'
import type { Audit, Scan } from '../../types/entities'

/**
 * Parcours guidé d'une mission.
 *
 * Le reste de l'espace expose une douzaine de pages, chacune correspondant à un
 * concept d'auditeur. Cette page fait l'inverse : elle n'affiche qu'une seule
 * chose à faire maintenant, et relègue le reste au rang d'étapes déjà franchies
 * ou encore à venir. Un client qui ouvre Cyberas pour connaître son niveau de
 * sécurité ne devrait pas avoir à choisir par où commencer.
 *
 * L'avancement n'est jamais déclaratif : chaque étape lit l'état réel du
 * serveur. Une étape se marque terminée parce que la donnée existe, pas parce
 * qu'on a cliqué dessus.
 */

type StepState = 'done' | 'current' | 'todo'

interface Step {
  key: string
  label: string
  icon: LucideIcon
  /** Ce qui reste à faire, formulé du côté de l'utilisateur. */
  action: string
  /** Où mène le bouton. Absent quand l'étape déclenche un traitement. */
  to?: string
  /** Traitement déclenché sur place, quand l'étape n'est pas une page. */
  run?: () => Promise<void>
  done: boolean
  /** Avancement 0 à 1, affiché en barre. Absent quand l'étape est binaire. */
  progress?: number
  /** Ce que l'étape a produit, une fois franchie. */
  result?: string
  note?: string
}

export function ParcoursMission() {
  const { auditId } = useParams<{ auditId: string }>()
  const navigate = useNavigate()

  const [audit, setAudit] = useState<Audit | null>(null)
  const [summary, setSummary] = useState<QuestionnaireSummary | null>(null)
  const [links, setLinks] = useState<EvidenceLink[]>([])
  const [scans, setScans] = useState<Scan[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!auditId) return
    try {
      setLoading(true)
      setError(null)
      // Seule la mission est indispensable. Les quatre autres sources décrivent
      // l'avancement : leur absence doit dégrader l'affichage, pas le bloquer.
      const [missionData, summaryData, linksData, scansData] = await Promise.all([
        auditsClient.getById(auditId),
        questionnaireClient.getSummary(auditId).catch(() => null),
        evidenceClient.listLinks(auditId).catch(() => [] as EvidenceLink[]),
        scansClient.list(auditId).catch(() => [] as Scan[]),
      ])
      setAudit(missionData)
      setSummary(summaryData)
      setLinks(linksData)
      setScans(scansData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mission introuvable')
    } finally {
      setLoading(false)
    }
  }, [auditId])

  useEffect(() => { void load() }, [load])

  const runAnalysis = useCallback(async () => {
    if (!auditId) return
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      await evidenceClient.analyze(auditId, false)
      await load()
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analyse impossible')
    } finally {
      setAnalyzing(false)
    }
  }, [auditId, load])

  const steps = useMemo<Step[]>(() => {
    const completion = summary?.completionRate ?? 0
    const answered = summary?.answeredQuestions ?? 0
    const applicable = summary?.applicableQuestions ?? 0
    const score = summary?.maturityScore ?? null
    const weak = summary?.weakControls ?? 0

    return [
      {
        key: 'questions',
        label: 'Répondez aux questions',
        icon: ListChecks,
        action: 'Répondre aux questions',
        to: `/app/audits/${auditId}/questionnaire`,
        done: applicable > 0 && answered >= applicable,
        progress: completion,
        result: applicable > 0 ? `${answered} / ${applicable} questions` : undefined,
      },
      {
        key: 'pieces',
        label: 'Ajoutez vos pièces justificatives',
        icon: Paperclip,
        action: 'Joindre des pièces',
        to: `/app/audits/${auditId}/questionnaire`,
        done: links.length > 0,
        result: links.length > 0
          ? `${links.length} pièce${links.length > 1 ? 's' : ''} rattachée${links.length > 1 ? 's' : ''}`
          : undefined,
        note: 'Les pièces se joignent directement sur la question qu\'elles étayent.',
      },
      {
        key: 'equipe',
        label: 'Invitez vos collaborateurs',
        icon: UserPlus,
        action: 'Inviter quelqu\'un',
        to: '/app/organization',
        // Les invitations sont aujourd'hui rattachées à l'organisation, pas à la
        // mission : l'étape reste franchissable mais ne peut pas se vérifier ici.
        done: false,
        note: 'Étape facultative. Les invitations portent sur l\'organisation, pas encore sur la mission seule.',
      },
      {
        key: 'scans',
        label: 'Lancez vos scans',
        icon: Radar,
        action: 'Lancer un scan',
        to: '/app/scans',
        done: scans.length > 0,
        result: scans.length > 0
          ? `${scans.length} scan${scans.length > 1 ? 's' : ''} enregistré${scans.length > 1 ? 's' : ''}`
          : undefined,
        note: 'Facultatif pour un audit documentaire.',
      },
      {
        key: 'analyse',
        label: 'Cyberas analyse vos pièces',
        icon: Sparkles,
        action: analyzing ? 'Analyse en cours…' : 'Lancer l\'analyse',
        run: runAnalysis,
        done: false,
        note: 'L\'analyse compare ce que vous déclarez à ce que vos pièces démontrent. Une pièce illisible n\'annule jamais votre réponse.',
      },
      {
        key: 'score',
        label: 'Consultez votre score',
        icon: Gauge,
        action: 'Voir le score',
        to: `/app/audits/${auditId}/questionnaire`,
        done: score !== null,
        result: score !== null ? `${score.toFixed(1)} / 4` : undefined,
      },
      {
        key: 'ecarts',
        label: 'Corrigez vos écarts',
        icon: Wrench,
        action: 'Voir les recommandations',
        to: '/app/recommendations',
        done: false,
        result: weak > 0 ? `${weak} contrôle${weak > 1 ? 's' : ''} sous le seuil` : undefined,
      },
    ]
  }, [auditId, summary, links, scans, analyzing, runAnalysis])

  /** Première étape non franchie : c'est la seule action mise en avant. */
  const currentIndex = useMemo(() => {
    const idx = steps.findIndex((s) => !s.done)
    return idx === -1 ? steps.length - 1 : idx
  }, [steps])

  const doneCount = steps.filter((s) => s.done).length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand" />
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <AlertCircle size={32} className="mx-auto text-status-critical" />
        <h2 className="mt-4 font-bold text-white">Mission indisponible</h2>
        <p className="mt-2 text-sm text-text-on-dark-muted">{error}</p>
        <button
          onClick={() => navigate('/app/audits')}
          className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Retour aux missions
        </button>
      </div>
    )
  }

  const current = steps[currentIndex]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-brand">
          {audit.auditCode}
        </p>
        <h1 className="mt-1.5 text-2xl font-bold text-white">{audit.title}</h1>
        <p className="mt-1 text-sm text-text-on-dark-muted">
          {doneCount} étape{doneCount > 1 ? 's' : ''} sur {steps.length} — Cyberas vous indique
          quoi faire ensuite.
        </p>
      </header>

      {/* La prochaine action, seule mise en avant. Tout le reste de la page est
          du contexte : c'est ce déséquilibre qui remplace le menu. */}
      <section className="rounded-lg border border-brand/40 bg-surface-dark p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">
          Prochaine action
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white">{current.label}</h2>
            {current.note && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-on-dark-muted">
                {current.note}
              </p>
            )}
            {analyzeError && current.key === 'analyse' && (
              <p className="mt-2 text-sm text-status-critical">{analyzeError}</p>
            )}
          </div>
          <button
            type="button"
            disabled={analyzing && current.key === 'analyse'}
            onClick={() => {
              if (current.run) void current.run()
              else if (current.to) navigate(current.to)
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {analyzing && current.key === 'analyse'
              ? <Loader2 size={16} className="animate-spin" />
              : <ArrowRight size={16} />}
            {current.action}
          </button>
        </div>

        {current.progress !== undefined && current.progress > 0 && (
          <div className="mt-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-bg-dark">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500"
                style={{ width: `${Math.round(current.progress * 100)}%` }}
              />
            </div>
            {current.result && (
              <p className="mt-2 text-xs text-text-on-dark-muted">{current.result}</p>
            )}
          </div>
        )}
      </section>

      {/* Le parcours complet, en retrait. Il sert à se situer, pas à naviguer. */}
      <section className="overflow-hidden rounded-lg border border-border-dark">
        {steps.map((step, i) => {
          const state: StepState = step.done ? 'done' : i === currentIndex ? 'current' : 'todo'
          const Icon = step.icon

          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 border-b border-border-dark px-5 py-4 last:border-b-0 ${
                state === 'current' ? 'bg-surface-dark' : 'bg-surface-dark/40'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  state === 'done'
                    ? 'bg-status-compliant/15 text-status-compliant'
                    : state === 'current'
                      ? 'bg-brand text-white'
                      : 'bg-bg-dark text-text-on-dark-muted'
                }`}
              >
                {state === 'done' ? <Check size={15} /> : <Icon size={15} />}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    state === 'todo' ? 'text-text-on-dark-muted' : 'text-white'
                  }`}
                >
                  {i + 1}. {step.label}
                </p>
                {step.result && (
                  <p className="mt-0.5 text-xs text-text-on-dark-muted">{step.result}</p>
                )}
              </div>

              {state !== 'current' && (step.to || step.run) && (
                <button
                  type="button"
                  onClick={() => {
                    if (step.run) void step.run()
                    else if (step.to) navigate(step.to)
                  }}
                  className="shrink-0 rounded-md border border-border-dark px-3 py-1.5 text-xs font-semibold text-text-on-dark-muted transition-colors hover:border-border-dark-hover hover:text-white"
                >
                  Ouvrir
                </button>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
