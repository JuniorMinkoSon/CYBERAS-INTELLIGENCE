import { useEffect, useRef, useState } from 'react'

/**
 * Verrou de la couverture : la page reste sur le premier écran jusqu'au clic
 * sur « Découvrir ».
 *
 * <p>La mécanique vient du premier site, où elle avait été mise au point contre
 * trois pièges que rien ne laisse deviner. Elle est reprise telle quelle plutôt
 * que réécrite : chacun des trois se paie par un bouton qui ne fait rien.
 *
 * <p><strong>Un</strong> : le verrou se pose sur {@code <html>} et non sur
 * {@code <body>}. Sur iOS, seul l'élément racine arrête le défilement par
 * inertie ; posé sur le corps, la page continue de glisser.
 *
 * <p><strong>Deux</strong> : il ne se pose qu'en haut de page. Un rechargement
 * à mi-parcours, ou un retour arrière, ne doit pas ramener de force le visiteur
 * à la couverture qu'il avait déjà passée.
 *
 * <p><strong>Trois</strong> : libérer puis défiler dans la foulée ne produit
 * rien. Rendre {@code overflow} à sa valeur d'origine ne rend pas le document
 * défilable à l'instant même : le navigateur attend le recalcul de mise en page
 * suivant. D'où les deux passages par {@code requestAnimationFrame} avant de
 * demander le défilement, et la position calculée à la main plutôt que par
 * {@code scrollIntoView}, qui retombe parfois sur zéro juste après un déverrou.
 *
 * <p>Sorties possibles : le bouton, Échap et Tab : deux demandes de sortie —
 * et les touches de défilement, qui valent un clic. La molette et le doigt ne
 * sont pas écoutés : c'est une mise en scène, pas un piège, et le bouton reste
 * visible en permanence.
 *
 * <p>La préférence « moins de mouvement » ne lève plus le verrou, seulement le
 * défilement animé qui suit sa levée. C'est un changement assumé : cette
 * préférence porte sur le mouvement, et retenir une page n'en produit aucun.
 * Elle coupait l'effet pour tous les postes où les animations du système sont
 * désactivées, c'est-à-dire une bonne part des postes d'entreprise, et la
 * couverture n'était donc presque jamais figée. Les quatre sorties restent :
 * le bouton « Démo », Échap, Tab, et les touches de défilement.
 */
export function useCoverLock() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [locked, setLocked] = useState(() => {
    if (typeof window === 'undefined') return false
    /* Pas de verrou sur un écran étroit : en dessous de 1024 px la couverture
       passe en une colonne, texte et visuel s'empilent, et elle dépasse alors
       la hauteur disponible. Retenir la page y reviendrait à cacher une partie
       du contenu derrière un défilement qu'on vient d'interdire.

       Le seuil de hauteur était de 640 px, ce qui privait de l'effet la
       plupart des portables : un écran 1366 × 768 ou 1280 × 720 laisse, barres
       du navigateur déduites, une fenêtre de 600 à 660 px de haut. Le verrou
       ne se posait donc presque jamais. Il descend à 520 px, parce que la
       couverture tient désormais exactement un écran (`min-height` en `svh`
       dans styles/site.css) au lieu de prendre la hauteur de son contenu :
       c'est cette hauteur libre qui justifiait le seuil, et elle a disparu. */
    if (window.innerWidth < 1024 || window.innerHeight < 520) return false
    return window.scrollY <= 40
  })

  /** Pose le verrou sur la racine du document. */
  useEffect(() => {
    if (!locked) return
    if (window.scrollY > 40) {
      setLocked(false)
      return
    }

    const root = document.documentElement
    const precedent = root.style.overflow
    root.style.overflow = 'hidden'

    return () => {
      root.style.overflow = precedent
    }
  }, [locked])

  /**
   * Libère la page et l'amène à la section suivante.
   *
   * Un clic sur « Découvrir » demande la suite, pas un aperçu : le verrou tombe
   * et le défilement s'enchaîne d'un seul geste.
   */
  const reveal = () => {
    setLocked(false)

    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const suivante = sectionRef.current?.nextElementSibling as HTMLElement | null
        const cible = suivante
          ? suivante.getBoundingClientRect().top + window.scrollY
          : (sectionRef.current?.offsetHeight ?? window.innerHeight)

        window.scrollTo({ top: cible, behavior: reduit ? 'auto' : 'smooth' })
      })
    })
  }

  /** Sorties au clavier. */
  useEffect(() => {
    if (!locked) return

    const defilement = new Set(['PageDown', 'ArrowDown', 'End', ' ', 'Spacebar'])
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Tab') {
        setLocked(false)
        return
      }
      if (defilement.has(e.key)) {
        e.preventDefault()
        reveal()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // `reveal` ne dépend d'aucun état : le recréer à chaque rendu ne change
    // rien à ce que l'écouteur fait.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked])

  return { sectionRef, locked, reveal }
}
