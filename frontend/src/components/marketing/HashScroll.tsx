import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Amène la page à l'ancre demandée dans l'URL.
 *
 * React Router ne le fait pas : il change la route sans toucher au défilement,
 * si bien qu'un lien vers /solutions#gouvernance ouvre la page en haut et laisse
 * le visiteur chercher la section lui-même.
 *
 * Deux cas à couvrir, et c'est le second qui pose problème :
 *   - navigation depuis la même page : la cible existe déjà dans le document ;
 *   - navigation depuis une autre page : la cible n'existe pas encore au moment
 *     où l'URL change, car le composant de destination n'est pas monté.
 *
 * D'où l'attente active plutôt qu'un simple scrollIntoView immédiat.
 */
export function HashScroll() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    // Sans ancre, une navigation doit ramener en haut — sinon on arrive au
    // milieu de la nouvelle page, à la hauteur qu'occupait la précédente.
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    const id = decodeURIComponent(hash.slice(1))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let attempts = 0
    let frame = 0

    const tryScroll = () => {
      const target = document.getElementById(id)

      if (target) {
        // La barre de navigation est fixe : viser le haut exact de la section
        // la ferait passer dessous.
        const offset = 88
        const top = target.getBoundingClientRect().top + window.scrollY - offset

        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })

        // Le focus suit le défilement, sans quoi la navigation au clavier
        // resterait en haut de page alors que l'écran a bougé.
        target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
        return
      }

      // La cible peut n'apparaître qu'après le montage du composant de
      // destination. On réessaie sur une vingtaine de frames — environ un tiers
      // de seconde — puis on renonce plutôt que de boucler indéfiniment.
      if (attempts++ < 20) {
        frame = requestAnimationFrame(tryScroll)
      }
    }

    frame = requestAnimationFrame(tryScroll)
    return () => cancelAnimationFrame(frame)
  }, [hash, pathname])

  return null
}
