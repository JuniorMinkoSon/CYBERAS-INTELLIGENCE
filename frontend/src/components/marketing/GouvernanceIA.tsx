import { Link } from 'react-router-dom'
import { Reveal, Eyebrow, STAGGER, VISUAL_DELAY } from './SiteKit'

/**
 * Gouvernance de l'intelligence artificielle.
 *
 * <p>Le discours courant sur le sujet tient en une promesse : « une IA
 * gouvernée et transparente au service de l'expertise humaine » : que rien ne
 * permet de vérifier. Elle rassure une fois, puis elle s'use, parce que tous
 * les concurrents l'écrivent dans les mêmes termes.
 *
 * <p>Cette section prend le parti inverse : quatre engagements, chacun formulé
 * de façon qu'un client puisse le contredire s'il est faux. Ils ne sont pas
 * rédigés pour l'occasion, ils décrivent des séparations déjà actées dans le
 * produit :
 *
 * <ul>
 *   <li>le moteur de risque est déterministe et ne lit jamais le verdict du
 *       modèle, précisément pour que le score reste recalculable à la main ;</li>
 *   <li>le verdict du modèle est consultatif : il signale une incohérence
 *       apparente entre le niveau déclaré et les pièces, sans corriger le
 *       score ;</li>
 *   <li>aucun contenu de document ne quitte la plateforme vers le service
 *       d'analyse, qui ne reçoit que des nombres agrégés ;</li>
 *   <li>si ce service est indisponible, l'analyse bascule sur une méthode
 *       simple plutôt que d'interrompre l'audit.</li>
 * </ul>
 *
 * <p>La composition suit la même logique : à gauche le principe, à droite le
 * contrat. Une grille de trois cartes aurait mis les quatre engagements sur le
 * même plan qu'un argument commercial ; une liste numérotée se lit comme ce
 * qu'elle est, une série de garanties.
 */

const ENGAGEMENTS = [
  {
    titre: 'Le score reste recalculable à la main',
    texte:
      'Le calcul de risque est déterministe : les mêmes entrées donnent toujours le même résultat. Le modèle n’y entre pas.',
  },
  {
    titre: 'Le modèle signale, il ne corrige pas',
    texte:
      'Il attire l’attention sur une réponse dont le niveau déclaré cadre mal avec les preuves jointes. La décision reste à l’auditeur.',
  },
  {
    titre: 'Vos documents ne sortent pas',
    texte:
      'Le service d’analyse ne reçoit aucun contenu de pièce justificative, seulement des valeurs agrégées.',
  },
  {
    titre: 'Une panne n’arrête pas l’audit',
    texte:
      'Si le service d’analyse est indisponible, la plateforme bascule sur une méthode simple et le travail continue.',
  },
]

export function GouvernanceIA() {
  return (
    <section id="gouvernance-ia" className="s-section s-surface-white">
      <div className="s-wrap">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <Eyebrow>Gouvernance de l’IA</Eyebrow>
            <h2 className="s-h2 mt-4">
              L’analyse assiste l’auditeur.
              <br />
              Elle ne décide pas à sa place.
            </h2>
            <p className="s-body s-measure mt-6">
              CYBERAS emploie des technologies d’analyse automatisée là où elles font gagner du
              temps, et nulle part ailleurs. Les quatre règles ci-contre sont inscrites dans
              l’architecture du produit, pas dans une charte.
            </p>
            <Link to="/ressources#documentation" className="s-link mt-8">
              Voir la documentation
            </Link>
          </Reveal>

          <Reveal delay={VISUAL_DELAY}>
            {/* Liste numérotée plutôt que cartes : quatre garanties alignées se
                lisent comme un contrat, quatre cartes comme un argumentaire. */}
            <ol className="divide-y divide-[color:var(--s-border)] overflow-hidden rounded-[12px] border border-[color:var(--s-border)] bg-[color:var(--s-bg-alt)]">
              {ENGAGEMENTS.map((e, i) => (
                <li key={e.titre} className="flex gap-4 px-6 py-5">
                  <span
                    className="mt-0.5 shrink-0 text-sm font-bold tabular-nums text-[color:var(--s-primary)]"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                      {e.titre}
                    </span>
                    <span className="s-small mt-1 block">{e.texte}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/**
 * Variante courte, pour les pages qui n'ont pas la place d'un bloc entier.
 *
 * Reprend les mêmes engagements, en une ligne chacun, et renvoie à la section
 * complète. Deux formulations différentes du même contrat finiraient par
 * diverger, d'où la source unique ci-dessus.
 */
export function GouvernanceIABreve() {
  return (
    <Reveal>
      <div className="s-card s-card-accent">
        <Eyebrow>Gouvernance de l’IA</Eyebrow>
        <p className="s-body mt-3">
          L’analyse assiste l’auditeur, elle ne décide pas à sa place.
        </p>
        <ul className="mt-4 space-y-1.5">
          {ENGAGEMENTS.map((e, i) => (
            <li key={e.titre} className="s-small flex gap-2.5">
              <span
                className="shrink-0 font-bold tabular-nums text-[color:var(--s-primary)]"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {e.titre}
            </li>
          ))}
        </ul>
        <Link to="/#gouvernance-ia" className="s-link mt-5">
          Le détail des quatre règles
        </Link>
      </div>
    </Reveal>
  )
}

/** Exposé pour les pages qui veulent décaler leurs propres entrées à la suite. */
export const GOUVERNANCE_STAGGER = STAGGER
