import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Fond abstrait de la couverture.
 *
 * <p>La couverture était une surface grise unie, et le vide entre la barre de
 * navigation et le surtitre se lisait comme un oubli plutôt que comme de
 * l'espace. Ce fond l'occupe sans rien y ajouter à lire : une trame de points
 * et quelques arcs, à une opacité où l'on perçoit une texture avant de
 * distinguer un motif.
 *
 * <p>Il évoque une infrastructure et un maillage, pas la cybersécurité par ses
 * clichés : ni cadenas, ni capuche, ni cerveau. Il ne décrit rien du produit,
 * ce qui est ici une qualité : un fond qui expliquerait le fonctionnement
 * interne en dirait trop.
 *
 * <p>Le mouvement de souris déplace la trame de six pixels au maximum, par
 * transition CSS plutôt qu'à chaque image : le pointeur n'est lu qu'une fois
 * par trame d'affichage, et la classe de mouvement réduit coupe la transition
 * sans que ce composant ait à le savoir. Sous préférence de mouvement réduit,
 * l'écouteur n'est même pas posé.
 */
export function HeroBackdrop() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const noeud = ref.current
    if (!noeud) return

    /* Le pointeur arrive bien plus souvent que l'écran ne se rafraîchit.
       On retient la dernière position et on n'écrit le style qu'une fois par
       trame, sans quoi la mise en page est recalculée des centaines de fois
       par seconde pour un déplacement de six pixels. */
    let trame = 0
    const bouger = (e: PointerEvent) => {
      if (trame) return
      trame = requestAnimationFrame(() => {
        trame = 0
        const x = (e.clientX / window.innerWidth - 0.5) * 12
        const y = (e.clientY / window.innerHeight - 0.5) * 12
        noeud.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      })
    }

    window.addEventListener('pointermove', bouger, { passive: true })
    return () => {
      window.removeEventListener('pointermove', bouger)
      if (trame) cancelAnimationFrame(trame)
    }
  }, [reduced])

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={ref}
        /* Débordement volontaire de 24 px de chaque côté : la translation ne
           doit jamais découvrir un bord de la trame. */
        className="absolute -inset-6 transition-transform duration-500 ease-out"
      >
        <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 720">
          <defs>
            {/* Trame de points. Le pas de 32 px est assez large pour rester une
                texture et pas un quadrillage. */}
            <pattern id="s-hero-points" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="var(--s-primary)" opacity="0.22" />
            </pattern>
            {/* La trame s'efface vers la gauche, là où se trouve le titre :
                un fond régulier derrière un texte de 52 px le rend sale.

                Les arrêts sont en blanc, pas en noir. Un masque SVG travaille
                par luminance : du noir, même à pleine opacité, masque tout. */}
            <linearGradient id="s-hero-fade" x1="0" y1="0" x2="1" y2="0.35">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0" />
              <stop offset="35%" stopColor="#FFF" stopOpacity="0" />
              <stop offset="70%" stopColor="#FFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFF" stopOpacity="1" />
            </linearGradient>
            <mask id="s-hero-mask">
              <rect width="1440" height="720" fill="url(#s-hero-fade)" />
            </mask>
          </defs>

          <g mask="url(#s-hero-mask)">
            <rect width="1440" height="720" fill="url(#s-hero-points)" />

            {/* Trois arcs concentriques, centrés hors cadre en haut à droite.
                Ils donnent une direction à la surface sans dessiner d'objet
                identifiable. */}
            {[280, 440, 600].map((r, i) => (
              <circle
                key={r}
                cx="1240"
                cy="120"
                r={r}
                fill="none"
                stroke="var(--s-primary)"
                strokeWidth="1"
                opacity={0.16 - i * 0.04}
              />
            ))}

            {/* Deux segments obliques, seuls éléments non circulaires : ils
                empêchent la composition de tourner en cible. */}
            <path
              d="M900 720 L1440 300"
              stroke="var(--s-primary)"
              strokeWidth="1"
              opacity="0.1"
              fill="none"
            />
            <path
              d="M1040 720 L1440 440"
              stroke="var(--s-cyan)"
              strokeWidth="1"
              opacity="0.12"
              fill="none"
            />
          </g>
        </svg>
      </div>
    </div>
  )
}
