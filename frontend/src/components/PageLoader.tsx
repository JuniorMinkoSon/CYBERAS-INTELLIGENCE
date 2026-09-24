import { useLocation } from 'react-router-dom'

/**
 * Écran d'attente entre deux pages.
 *
 * <p>L'écusson CYBERAS se trace en boucle, l'arc rouge tourne, un halo bleu
 * respire derrière, et une barre fine progresse en haut de l'écran. Le tout
 * tient sur un fond uni qui suit le territoire visité : clair sur le site
 * vitrine, sombre dans l'espace de travail et sur les écrans de connexion,
 * pour qu'aucun éclair blanc ne coupe une session en cours.
 */
const DARK_PREFIXES = ['/app', '/login', '/inscription']

export function PageLoader({ label = 'Chargement' }: { label?: string }) {
  const { pathname } = useLocation()
  const dark = DARK_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  return (
    <div className={`cy-loader ${dark ? 'cy-loader-dark' : ''}`} role="status" aria-live="polite">
      <div className="cy-loader-bar" aria-hidden="true">
        <span />
      </div>
      <div className="cy-loader-mark" aria-hidden="true">
        <span className="cy-loader-halo" />
        <svg width={72} height={72} viewBox="0 0 48 48" fill="none">
          <path
            className="cy-loader-shield"
            d="M24 3L42 11v13c0 11.5-7.7 18.6-18 21C13.7 42.6 6 35.5 6 24V11L24 3z"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g className="cy-loader-spin">
            <path
              className="cy-loader-arc"
              d="M31 17.5A9.5 9.5 0 1 0 31 30.5"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      <p className="cy-loader-word">
        CYBERAS <span>INTELLIGENCE</span>
      </p>
      <p className="cy-loader-text">
        {label}
        <span className="cy-loader-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </p>
    </div>
  )
}
