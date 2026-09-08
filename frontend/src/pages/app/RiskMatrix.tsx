import { Fragment } from 'react'
import type { Risk } from '../../types/entities'

/**
 * Matrice probabilité × impact.
 *
 * <p>La page annonçait une « cartographie » et n'affichait qu'un tableau trié.
 * Or c'est la grille qui porte la lecture attendue d'une analyse de risque :
 * elle montre d'un coup d'œil où se concentre l'exposition, ce qu'une liste de
 * lignes ne dit pas. Le coin haut-droit — forte probabilité, fort impact — est
 * ce qu'on traite en premier.
 *
 * <p>Trois niveaux et non cinq : c'est ce que le serveur produit
 * ({@code band()} découpe la vraisemblance en LOW / MEDIUM / HIGH). Afficher
 * une grille 5×5 dont six colonnes resteraient vides donnerait une fausse
 * impression de finesse.
 */

const LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const
type Level = (typeof LEVELS)[number]

const LEVEL_LABEL: Record<Level, string> = {
  HIGH: 'Élevé', MEDIUM: 'Moyen', LOW: 'Faible',
}

/**
 * Couleur d'une case, croisant les deux axes.
 *
 * La teinte vient de la position dans la grille, pas de la sévérité des
 * risques qui s'y trouvent : une case doit garder la même couleur qu'elle
 * contienne un risque ou dix, sinon la grille ne se lit plus comme une matrice.
 */
function cellTone(probability: Level, impact: Level): string {
  const weight = { LOW: 0, MEDIUM: 1, HIGH: 2 }
  const total = weight[probability] + weight[impact]
  if (total >= 4) return 'bg-red-500/20 border-red-500/40'
  if (total === 3) return 'bg-orange-500/15 border-orange-500/35'
  if (total === 2) return 'bg-yellow-500/15 border-yellow-500/30'
  return 'bg-emerald-500/10 border-emerald-500/25'
}

interface Props {
  risks: Risk[]
  /** Case actuellement retenue, pour filtrer la liste sous la grille. */
  selected: { probability: Level; impact: Level } | null
  onSelect: (cell: { probability: Level; impact: Level } | null) => void
}

export function RiskMatrix({ risks, selected, onSelect }: Props) {
  // Une valeur hors des trois niveaux attendus n'est pas rangée d'office au
  // milieu : elle est comptée à part et signalée sous la grille, faute de quoi
  // un risque disparaîtrait de la cartographie sans que personne ne le sache.
  const inGrid = risks.filter(
    (r) => LEVELS.includes(r.probability as Level) && LEVELS.includes(r.impact as Level),
  )
  const unclassified = risks.length - inGrid.length

  const at = (probability: Level, impact: Level) =>
    inGrid.filter((r) => r.probability === probability && r.impact === impact)

  return (
    <div className="rounded-lg border border-border-dark bg-surface-dark p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">Matrice des risques</h2>
        <p className="text-xs text-text-on-dark-muted">
          Probabilité × impact — cliquez une case pour filtrer la liste
        </p>
      </div>

      <div className="flex gap-3">
        {/* Axe vertical : la probabilité décroît de haut en bas, convention
            partagée par la plupart des méthodes d'analyse de risque. */}
        <div
          className="flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Probabilité
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-1.5">
            {LEVELS.map((probability) => (
              // Fragment porteur de clé : une ligne de la grille produit deux
              // types d'éléments (libellé + cases), qui ne peuvent pas être
              // regroupés dans un conteneur sans casser la grille CSS.
              <Fragment key={probability}>
                <div className="flex items-center pr-2 text-right text-xs font-medium text-text-on-dark-muted">
                  {LEVEL_LABEL[probability]}
                </div>

                {LEVELS.slice().reverse().map((impact) => {
                  const cell = at(probability, impact)
                  const active =
                    selected?.probability === probability && selected?.impact === impact
                  return (
                    <button
                      key={`${probability}-${impact}`}
                      type="button"
                      onClick={() => onSelect(active ? null : { probability, impact })}
                      aria-pressed={active}
                      aria-label={`Probabilité ${LEVEL_LABEL[probability]}, impact ${LEVEL_LABEL[impact]} : ${cell.length} risque(s)`}
                      className={`aspect-[4/3] rounded border transition ${cellTone(probability, impact)} ${
                        active ? 'ring-2 ring-white/70' : 'hover:brightness-125'
                      } ${cell.length === 0 ? 'opacity-45' : ''}`}
                    >
                      <span className="block text-xl font-bold text-white">{cell.length}</span>
                      {cell.length > 0 && (
                        <span className="block text-[10px] uppercase tracking-wide text-white/60">
                          risque{cell.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  )
                })}
              </Fragment>
            ))}

            <div />
            {LEVELS.slice().reverse().map((impact) => (
              <div key={`ax-${impact}`} className="pt-1 text-center text-xs font-medium text-text-on-dark-muted">
                {LEVEL_LABEL[impact]}
              </div>
            ))}
          </div>

          <div className="mt-2 text-center text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted">
            Impact
          </div>
        </div>
      </div>

      {unclassified > 0 && (
        <p className="mt-3 border-t border-border-dark pt-3 text-xs text-orange-400">
          {unclassified} risque(s) hors grille : probabilité ou impact non renseigné.
          Ils restent visibles dans la liste ci-dessous.
        </p>
      )}

      {selected && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-3 text-xs font-medium text-brand hover:underline"
        >
          Effacer le filtre de la matrice
        </button>
      )}
    </div>
  )
}
