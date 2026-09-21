import type { ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { CyberNetworkCanvas } from './CyberNetworkCanvas'

/**
 * Section sombre avec réseau animé en arrière-plan.
 *
 * <p>C'est le point de rencontre des deux styles. Le premier site tenait sa
 * présence de ses grandes surfaces sombres et de ce réseau de nœuds reliés ; la
 * refonte, elle, a apporté une palette claire et un rythme de lecture. Garder
 * l'un et jeter l'autre appauvrissait : les surfaces claires seules donnaient
 * une documentation institutionnelle, le sombre partout ramenait le site
 * d'avant.
 *
 * <p>Le réseau revient donc, mais à sa place : deux ou trois sections par site,
 * jamais derrière du texte de lecture longue. Il est bleu et non plus rouge,
 * son opacité est basse, et il s'arrête dès que le système demande moins de
 * mouvement. Il montre un maillage : des points reliés, des signaux qui
 * circulent : ce que la charte autorise explicitement sous le nom de réseaux
 * abstraits, par opposition aux clichés qu'elle proscrit.
 *
 * <p>Un voile est posé entre le canevas et le contenu. Sans lui, les nœuds
 * passent derrière les lettres et le texte perd son fond.
 */
export function DeepSection({
  children,
  id,
  variant = 'navy',
  network = true,
  className = '',
}: {
  children: ReactNode
  id?: string
  /** `navy` pour une section de contenu, `deep` pour une clôture de page. */
  variant?: 'navy' | 'deep'
  /** Le réseau se retire là où le contenu est dense. */
  network?: boolean
  className?: string
}) {
  const reduced = useReducedMotion()
  const surface = variant === 'deep' ? 's-surface-deep' : 's-surface-navy'

  return (
    <section id={id} className={`s-section relative overflow-hidden ${surface} ${className}`}>
      {network && !reduced && (
        <>
          {/* Densité plus basse sur la clôture : elle porte peu de contenu, le
              réseau y deviendrait le sujet. */}
          <CyberNetworkCanvas
            nodeCount={variant === 'deep' ? 26 : 38}
            className="opacity-[0.55]"
          />
          {/* Voile de lisibilité. Plus dense au centre, où vit le texte. */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                variant === 'deep'
                  ? 'radial-gradient(ellipse at center, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.62) 100%)'
                  : 'radial-gradient(ellipse at center, rgba(23,32,51,0.86) 0%, rgba(23,32,51,0.58) 100%)',
            }}
            aria-hidden="true"
          />
        </>
      )}
      <div className="s-wrap relative">{children}</div>
    </section>
  )
}
