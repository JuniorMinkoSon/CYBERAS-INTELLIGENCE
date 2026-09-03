import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, AlertCircle, ClipboardList, ArrowRight, Plus } from 'lucide-react'
import { auditsClient } from '../../services/auditsClient'
import { questionnaireClient, type QuestionnaireSummary } from '../../services/questionnaireClient'
import type { Audit } from '../../types/entities'

/**
 * Choix de l'audit dont on veut remplir le questionnaire.
 *
 * Un questionnaire n'existe pas en soi : il évalue un périmètre selon un
 * référentiel, tous deux portés par l'audit. L'entrée de menu conduit donc
 * ici plutôt que vers une page qui n'aurait rien à charger.
 *
 * La progression de chaque audit est affichée pour éviter d'ouvrir un
 * questionnaire déjà complet en croyant reprendre là où on s'était arrêté.
 */
export function QuestionnaireAuditPicker() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [summaries, setSummaries] = useState<Record<string, QuestionnaireSummary>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const list = await auditsClient.list()
        if (cancelled) return

        const items = Array.isArray(list) ? list : []
        setAudits(items)

        // Les synthèses sont chargées en parallèle : les demander l'une après
        // l'autre rendrait la page lente dès quelques audits.
        const results = await Promise.allSettled(
          items.map((a) => questionnaireClient.getSummary(a.id))
        )
        if (cancelled) return

        const map: Record<string, QuestionnaireSummary> = {}
        results.forEach((r, i) => {
          // Une synthèse indisponible ne doit pas masquer l'audit : on affiche
          // la ligne sans progression plutôt que de la retirer.
          if (r.status === 'fulfilled') map[items[i].id] = r.value
        })
        setSummaries(map)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Chargement impossible')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

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
        <h2 className="mt-4 font-bold text-white">Chargement impossible</h2>
        <p className="mt-2 text-sm text-text-on-dark-muted">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Questionnaire</h1>
        <p className="mt-1 text-sm text-text-on-dark-muted">
          Sélectionnez l'audit dont vous souhaitez compléter l'évaluation de maturité.
        </p>
      </header>

      {audits.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <ClipboardList size={32} className="mx-auto text-text-on-dark-muted" />
          <h2 className="mt-4 font-bold text-white">Aucun audit à évaluer</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-text-on-dark-muted">
            Le questionnaire évalue la maturité d'un périmètre selon un référentiel.
            Créez d'abord un audit pour en définir le cadre.
          </p>
          <Link
            to="/app/audits"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Plus size={16} />
            Créer un audit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => {
            const summary = summaries[audit.id]
            const completion = summary ? Math.round(summary.completionRate * 100) : null

            return (
              <Link
                key={audit.id}
                to={`/app/audits/${audit.id}/questionnaire`}
                className="block rounded-lg border border-border-dark bg-surface-dark p-5 transition-all hover:-translate-y-0.5 hover:border-brand/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">
                        {audit.auditCode}
                      </span>
                      <span className="rounded bg-bg-dark px-2 py-0.5 text-[11px] text-text-on-dark-muted">
                        {audit.status}
                      </span>
                    </div>
                    <h2 className="mt-1.5 font-bold text-white">{audit.title}</h2>

                    {summary && (
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-on-dark-muted">
                        <span>
                          {summary.answeredQuestions} / {summary.applicableQuestions} questions
                        </span>
                        {summary.maturityScore !== null && (
                          <span>Maturité {summary.maturityScore.toFixed(1)} / 4</span>
                        )}
                        {summary.weakControls > 0 && (
                          <span className="text-status-high">
                            {summary.weakControls} contrôle(s) faible(s)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {completion !== null && (
                      <div className="w-28">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-on-dark-muted">Progression</span>
                          <span className="font-bold text-white">{completion}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-dark">
                          <div
                            className="h-full rounded-full bg-brand transition-[width] duration-500"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <ArrowRight size={18} className="shrink-0 text-text-on-dark-muted" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
