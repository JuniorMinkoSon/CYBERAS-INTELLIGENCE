import { useEffect, useState } from 'react'
import { Loader2, Info } from 'lucide-react'
import { frameworkClient, type FrameworkScore } from '../../services/frameworkClient'
import type { UUID } from '../../types/entities'

/**
 * Score de conformité d'un référentiel, pour un audit.
 *
 * <h2>Pourquoi la couverture est aussi grosse que le score</h2>
 *
 * Un score de 75 sur 2 contrôles évalués ne vaut pas un score de 75 sur 93. Le
 * chiffre seul flatte : il donne l'impression d'une conformité établie alors
 * qu'il ne repose parfois que sur une poignée de réponses. Les deux valeurs
 * sont donc affichées côte à côte, avec le même poids typographique.
 *
 * <h2>Ce que la carte ne fait jamais</h2>
 *
 * Elle n'affiche pas zéro quand rien n'est évaluable. Zéro voudrait dire « non
 * conforme » ; l'absence de données se dit « non évalué ». C'est le serveur qui
 * renvoie `null`, et la carte le respecte plutôt que de le convertir.
 */
export function FrameworkScoreCard({
  auditId,
  frameworkCode = 'ISO27001',
}: {
  auditId: UUID
  frameworkCode?: string
}) {
  const [data, setData] = useState<FrameworkScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    frameworkClient
      .score(auditId, frameworkCode)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Score indisponible')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [auditId, frameworkCode])

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border-dark bg-surface-dark p-5">
        <Loader2 size={16} className="animate-spin text-brand" />
        <span className="text-sm text-text-on-dark-muted">Calcul du score {frameworkCode}…</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <p className="text-sm text-text-on-dark-muted">
          Score {frameworkCode} indisponible{error ? ` — ${error}` : ''}.
        </p>
      </div>
    )
  }

  const coveragePct = Math.round(data.coverage * 100)

  return (
    <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold text-white">
          {data.frameworkName}
          <span className="ml-2 font-mono text-xs font-semibold text-text-on-dark-muted">
            {data.version}
          </span>
        </h2>
        <span className="font-mono text-[11px] text-text-on-dark-muted">
          moteur {data.engineVersion}
        </span>
      </div>

      {/* Score et couverture au même rang : l'un ne se lit pas sans l'autre. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
            Score de conformité
          </p>
          <p className="mt-1 text-3xl font-extrabold text-white">
            {data.score === null ? 'Non évalué' : data.score.toFixed(1)}
            {data.score !== null && (
              <span className="text-base font-semibold text-text-on-dark-muted"> / 100</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
            Couverture
          </p>
          <p className="mt-1 text-3xl font-extrabold text-white">
            {coveragePct}
            <span className="text-base font-semibold text-text-on-dark-muted"> %</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-dark">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-text-on-dark-muted">
            {data.assessedControls} / {data.totalControls} contrôles évalués
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Tile label="Conformes" value={data.compliant} tone="text-status-compliant" />
        <Tile label="Partiels" value={data.partiallyCompliant} tone="text-status-high" />
        <Tile label="Non conformes" value={data.nonCompliant} tone="text-status-critical" />
        <Tile label="Non évalués" value={data.notAssessed} tone="text-text-on-dark-muted" />
        <Tile label="Non applicables" value={data.notApplicable} tone="text-text-on-dark-muted" />
      </div>

      {/* Le motif du calcul est rendu tel quel : un score d'audit doit pouvoir
          être expliqué au client sans que quiconque ait à ouvrir le code. */}
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-text-on-dark-muted">
        <Info size={13} className="mt-0.5 shrink-0" />
        {data.rationale}
      </p>

      {data.controlsWithReviewRequiredMapping > 0 && (
        <p className="mt-2 text-xs text-status-high">
          {data.controlsWithReviewRequiredMapping} contrôle
          {data.controlsWithReviewRequiredMapping > 1 ? 's ont' : ' a'} un rattachement à faire
          valider par un auditeur : {data.controlsWithReviewRequiredMapping > 1 ? 'ils sont' : 'il est'} exclu
          {data.controlsWithReviewRequiredMapping > 1 ? 's' : ''} du calcul.
        </p>
      )}
    </section>
  )
}

function Tile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-md bg-bg-dark px-3 py-2">
      <p className={`font-mono text-lg font-bold ${tone}`}>{value}</p>
      <p className="text-[11px] text-text-on-dark-muted">{label}</p>
    </div>
  )
}
