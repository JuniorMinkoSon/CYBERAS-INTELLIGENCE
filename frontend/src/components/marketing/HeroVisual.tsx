import { motion, useReducedMotion } from 'framer-motion'
import { REVEAL_EASE } from './SiteKit'

/**
 * Visualisation du hero : la signature visuelle du site.
 *
 * <p>Elle montre la chaîne que le produit exécute : contrôles évalués, analyse,
 * cartographie des risques, actions : plutôt qu'une métaphore de la
 * cybersécurité. Le visiteur reconnaît l'objet qu'il va manipuler, ce
 * qu'aucun réseau de points lumineux ne lui apprend.
 *
 * <p>Chaque étage porte sa couleur de catégorie : bleu pour les contrôles,
 * violet pour l'analyse, dégradé vert-orange-rouge pour le risque, bleu à
 * nouveau pour les actions. Les teintes ne décorent pas, elles classent ; un
 * même code se retrouve dans les autres visuels du site.
 *
 * <p>L'animation d'entrée suit le langage commun, étage par étage. Un seul
 * mouvement se poursuit après l'apparition : le trait qui relie les étages se
 * trace une fois. Il montre le sens de lecture, puis s'arrête : une animation
 * permanente, ici, deviendrait un clignotant.
 */

/** Étages du schéma, dans l'ordre de lecture. */
const ETAGES = [
  /* La légende disait « 93 contrôles, 4 familles ». Le catalogue en déclare
     cinq : technique, organisationnel, humain, conformité, physique, et le
     nombre de contrôles dépend du référentiel retenu : l'annoncer en dur au
     premier écran promettait un chiffre que le produit ne garantit pas. */
  { titre: 'Contrôles évalués', legende: 'Plusieurs référentiels, cinq dimensions' },
  { titre: 'Analyse', legende: 'Croisement des réponses et des preuves' },
  { titre: 'Cartographie des risques', legende: 'Niveaux et priorités' },
  { titre: 'Actions', legende: 'Responsable, échéance, statut' },
]

/** Répartition des niveaux de risque. Les largeurs font 100. */
const RISQUES = [
  { part: 34, teinte: 'var(--s-success)' },
  { part: 26, teinte: 'var(--s-warning)' },
  { part: 22, teinte: 'var(--s-high)' },
  { part: 18, teinte: 'var(--s-critical)' },
]

export function HeroVisual() {
  const reduced = useReducedMotion()

  /** Entrée d'un étage : même courbe et même durée que partout, décalée. */
  const etage = (index: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.25 + index * 0.08, ease: REVEAL_EASE },
        }

  return (
    <figure
      className="relative rounded-xl border border-[color:var(--s-border)] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
      aria-label="Schéma du parcours CYBERAS : des contrôles évalués à l’analyse, à la cartographie des risques puis aux actions"
    >
      {/* Le trait vertical qui relie les étages. Il se trace une fois, du haut
          vers le bas, pour donner le sens de lecture. */}
      <span
        className="pointer-events-none absolute bottom-6 left-[2.35rem] top-24 w-px"
        aria-hidden="true"
      >
        <motion.span
          className="block w-px origin-top bg-[color:var(--s-border-strong)]"
          initial={reduced ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: REVEAL_EASE }}
          style={{ height: '100%' }}
        />
      </span>

      {/* Étage 1 : les contrôles. Cinq dimensions, bleu. */}
      <motion.div {...etage(0)} className="relative">
        <Etiquette numero="01" titre={ETAGES[0].titre} legende={ETAGES[0].legende} />
        <div className="ml-12 mt-3 grid grid-cols-5 gap-1.5">
          {['Orga.', 'Conf.', 'Tech.', 'Hum.', 'Phys.'].map((f, i) => (
            <span
              key={f}
              className="rounded-md px-1.5 py-2 text-center text-[0.625rem] font-medium"
              style={{
                /* Quatre intensités d'une même teinte : les familles sont de
                   même nature, seule leur couverture diffère. */
                backgroundColor: `color-mix(in srgb, var(--s-primary) ${12 + i * 8}%, white)`,
                color: 'var(--s-text-strong)',
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Étage 2 : l'analyse. Violet, la seule teinte réservée à ce moment. */}
      <motion.div {...etage(1)} className="relative mt-6">
        <Etiquette numero="02" titre={ETAGES[1].titre} legende={ETAGES[1].legende} accent="violet" />
        <div className="ml-12 mt-3 flex items-center gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.span
              key={i}
              className="h-7 flex-1 rounded"
              style={{
                backgroundColor: `color-mix(in srgb, var(--s-violet) ${10 + (i % 4) * 12}%, white)`,
              }}
              initial={reduced ? false : { scaleY: 0.4, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.03, ease: REVEAL_EASE }}
            />
          ))}
        </div>
      </motion.div>

      {/* Étage 3 : le risque. La seule bande multicolore de la page. */}
      <motion.div {...etage(2)} className="relative mt-6">
        <Etiquette numero="03" titre={ETAGES[2].titre} legende={ETAGES[2].legende} accent="risk" />
        <div className="ml-12 mt-3 flex h-8 overflow-hidden rounded-md">
          {RISQUES.map((r, i) => (
            <motion.span
              key={i}
              style={{ backgroundColor: r.teinte, width: `${r.part}%` }}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.06, ease: REVEAL_EASE }}
            />
          ))}
        </div>
      </motion.div>

      {/* Étage 4 : les actions. Retour au bleu : la boucle se referme. */}
      <motion.div {...etage(3)} className="relative mt-6">
        <Etiquette numero="04" titre={ETAGES[3].titre} legende={ETAGES[3].legende} />
        <div className="ml-12 mt-3 space-y-1.5">
          {[
            { teinte: 'var(--s-critical)', label: 'Action critique' },
            { teinte: 'var(--s-high)', label: 'Action élevée' },
          ].map((a) => (
            <div
              key={a.label}
              className="flex items-center justify-between rounded-md border border-[color:var(--s-border)] bg-[color:var(--s-bg-alt)] px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: a.teinte }}
                  aria-hidden="true"
                />
                <span className="text-[0.6875rem] text-[color:var(--s-text)]">{a.label}</span>
              </span>
              <span className="text-[0.625rem] text-[color:var(--s-text-muted)]">
                Responsable · Échéance
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </figure>
  )
}

/** Puce numérotée, titre, légende. Commune aux quatre étages. */
function Etiquette({
  numero,
  titre,
  legende,
  accent = 'blue',
}: {
  numero: string
  titre: string
  legende: string
  accent?: 'blue' | 'violet' | 'risk'
}) {
  const fond =
    accent === 'violet'
      ? 'color-mix(in srgb, var(--s-violet) 12%, white)'
      : accent === 'risk'
        ? 'color-mix(in srgb, var(--s-high) 14%, white)'
        : 'var(--s-primary-soft)'
  const texte =
    accent === 'violet'
      ? 'var(--s-violet)'
      : accent === 'risk'
        ? 'var(--s-high)'
        : 'var(--s-primary)'

  return (
    <div className="flex items-start gap-3">
      <span
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[0.6875rem] font-bold"
        style={{ backgroundColor: fond, color: texte }}
      >
        {numero}
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block text-sm font-semibold text-[color:var(--s-text-strong)]">
          {titre}
        </span>
        <span className="block text-xs text-[color:var(--s-text-muted)]">{legende}</span>
      </span>
    </div>
  )
}
