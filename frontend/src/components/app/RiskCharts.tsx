import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

/**
 * Graphiques du tableau de bord, alimentés par les endpoints de risque.
 *
 * Aucun score n'est calculé ici. Le moteur de risque est la seule autorité : le
 * frontend affiche ce que le backend lui donne. Les seuls calculs présents sont
 * des comptages d'affichage — combien de risques par niveau — qui ne modifient
 * ni le score ni le classement.
 */

/** Couleurs alignées sur les niveaux de risque du moteur. */
const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH: '#FF6B35',
  MEDIUM: '#FFB020',
  LOW: '#10b981',
  INFORMATION: '#8B98A5',
}

const LEVEL_LABELS: Record<string, string> = {
  CRITICAL: 'Critique',
  HIGH: 'Élevé',
  MEDIUM: 'Moyen',
  LOW: 'Faible',
  INFORMATION: 'Information',
}

/** Ordre de gravité décroissante : ce qui compte se lit en premier. */
const LEVEL_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATION']

export interface RiskSummary {
  id: string
  title: string
  score: number
  severity: string
  probability: string
  impact: string
  confidence: number
  needsReview: boolean
}

const tooltipStyle = {
  backgroundColor: '#111826',
  border: '1px solid #1E293B',
  borderRadius: '8px',
  color: '#E6EDF3',
}

/**
 * Score d'exposition.
 *
 * Un score absent n'est pas un score de zéro : ne rien avoir mesuré ne veut pas
 * dire n'avoir aucun risque. L'état non évalué est donc affiché comme tel, avec
 * l'action qui permet d'en sortir.
 */
export function ExposureScore({
  score,
  level,
  rationale,
  onStart,
}: {
  score: number | null
  level: string | null
  rationale?: string
  onStart?: () => void
}) {
  if (score === null || level === null) {
    return (
      <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
          Exposition cyber
        </p>
        <p className="mt-4 text-2xl font-bold text-text-on-dark-muted">Non évaluée</p>
        <p className="mt-2 text-sm text-text-on-dark-muted">
          {rationale ?? "Aucun audit n'a encore été évalué."}
        </p>
        {onStart && (
          <button
            type="button"
            onClick={onStart}
            className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Créer mon premier audit
          </button>
        )}
      </div>
    )
  }

  const color = LEVEL_COLORS[level] ?? '#8B98A5'

  return (
    <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
        Exposition cyber
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-extrabold text-white">{score}</span>
        <span className="text-lg text-text-on-dark-muted">/100</span>
      </div>

      <p className="mt-1 text-sm font-bold uppercase tracking-wide" style={{ color }}>
        {LEVEL_LABELS[level] ?? level}
      </p>

      {/* Barre de niveau : lecture immédiate sans avoir à interpréter le nombre. */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-bg-dark">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>

      {rationale && (
        <p className="mt-4 text-xs leading-relaxed text-text-on-dark-muted">{rationale}</p>
      )}
    </div>
  )
}

/** Répartition des risques par niveau. */
export function RiskDistribution({ risks }: { risks: RiskSummary[] }) {
  const counts = risks.reduce<Record<string, number>>((acc, r) => {
    acc[r.severity] = (acc[r.severity] ?? 0) + 1
    return acc
  }, {})

  const data = LEVEL_ORDER
    .filter((level) => counts[level] > 0)
    .map((level) => ({
      name: LEVEL_LABELS[level] ?? level,
      value: counts[level],
      level,
    }))

  if (data.length === 0) {
    return <EmptyChart title="Répartition des risques" />
  }

  return (
    <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
      <h3 className="mb-4 font-bold text-white">Répartition des risques</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
          >
            {data.map((d) => (
              <Cell key={d.level} fill={LEVEL_COLORS[d.level] ?? '#8B98A5'} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ color: '#8B98A5', fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Risques les plus élevés.
 *
 * Un histogramme plutôt qu'un tableau : la hiérarchie des priorités se lit d'un
 * coup d'œil, ce qui est précisément la décision que cet écran doit servir.
 */
export function TopRisks({ risks, limit = 6 }: { risks: RiskSummary[]; limit?: number }) {
  const data = [...risks]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({
      // Les titres longs écrasent l'axe : on tronque à l'affichage seulement.
      name: r.title.length > 26 ? `${r.title.slice(0, 26)}…` : r.title,
      score: r.score,
      severity: r.severity,
    }))

  if (data.length === 0) {
    return <EmptyChart title="Risques prioritaires" />
  }

  return (
    <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
      <h3 className="mb-4 font-bold text-white">Risques prioritaires</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke="#8B98A5" fontSize={11} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#8B98A5"
            fontSize={11}
            width={150}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(220,38,38,0.06)' }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={LEVEL_COLORS[d.severity] ?? '#8B98A5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** État vide explicite : mieux qu'un graphique à zéro, qui se lirait comme une mesure. */
function EmptyChart({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
      <h3 className="mb-4 font-bold text-white">{title}</h3>
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-sm text-text-on-dark-muted">
          Aucun risque évalué pour l'instant.
        </p>
      </div>
    </div>
  )
}
