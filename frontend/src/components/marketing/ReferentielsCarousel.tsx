import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GenerativeVisual } from './GenerativeVisual'

/**
 * Carrousel des familles de référentiels.
 *
 * Les cartes se chevauchent, celle du centre au premier plan : la profondeur
 * dit qu'il y a une suite sans obliger à tout afficher. Une grille de six
 * blocs demanderait au visiteur de tout parcourir avant de choisir.
 *
 * L'avance automatique s'arrête dès la première interaction, et pendant le
 * survol — reprendre la main sur un contenu qui bouge est une attente
 * légitime, surtout quand chaque carte porte un lien.
 */

interface Slide {
  /** Ancre de la famille correspondante sur la page. */
  anchor: string
  title: string
  subtitle: string
  items: string[]
  seed: string
  variant: 'network' | 'grid' | 'pulse' | 'layers'
}

const slides: Slide[] = [
  {
    anchor: 'gouvernance-et-management',
    title: 'Gouvernance et management',
    subtitle: 'Organiser la sécurité de l’information',
    items: ['ISO/IEC 27001', 'ISO/IEC 27002', 'ISO/IEC 27005'],
    seed: 'ref-gouvernance',
    variant: 'layers',
  },
  {
    anchor: 'cadres-de-cybersecurite',
    title: 'Cadres de cybersécurité',
    subtitle: 'Lire la posture par capacité',
    items: ['NIST CSF', 'NIST SP 800-53', 'CIS Controls'],
    seed: 'ref-cadres',
    variant: 'network',
  },
  {
    anchor: 'reglementaire-et-sectoriel',
    title: 'Réglementaire et sectoriel',
    subtitle: 'Obligations propres à votre activité',
    items: ['PCI DSS', 'RGPD', 'NIS 2'],
    seed: 'ref-reglementaire',
    variant: 'grid',
  },
  {
    anchor: 'technique-et-applicatif',
    title: 'Technique et applicatif',
    subtitle: 'Cadrer les tests et la vérification',
    items: ['OWASP Top 10', 'OWASP ASVS', 'MITRE ATT&CK'],
    seed: 'ref-technique',
    variant: 'pulse',
  },
  {
    anchor: 'vulnerabilites-et-notation',
    title: 'Vulnérabilités et notation',
    subtitle: 'Identifier, noter, rattacher',
    items: ['CVE · CVSS · CWE', 'MEHARI', 'ISO/IEC 27035'],
    seed: 'ref-vulnerabilites',
    variant: 'network',
  },
  {
    anchor: 'infrastructure-et-cloud',
    title: 'Infrastructure et cloud',
    subtitle: 'Configurations de référence',
    items: ['CIS Benchmarks', 'ISO 27017 · 27018', 'CSA CCM'],
    seed: 'ref-cloud',
    variant: 'layers',
  },
]

/** Rythme d'avance. Assez long pour lire un titre et ses trois entrées. */
const AUTOPLAY_MS = 3300

export function ReferentielsCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const total = slides.length

  const goTo = useCallback((next: number) => {
    // Modulo positif : l'index reste valide même en reculant depuis 0.
    setIndex(((next % total) + total) % total)
  }, [total])

  /** Une action délibérée suspend l'avance : le visiteur garde la main. */
  const takeOver = useCallback((next: number) => {
    setPaused(true)
    goTo(next)
  }, [goTo])

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, index, goTo])

  /**
   * Position d'une carte selon sa distance à la carte active.
   *
   * La distance est circulaire : la dernière carte est à un rang de la
   * première, sinon le passage de la fin au début produirait un saut.
   */
  const positionOf = (i: number) => {
    let offset = i - index
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total

    const distance = Math.abs(offset)

    // Au-delà de deux rangs, la carte sort du rendu : la garder n'apporte rien.
    if (distance > 2) {
      return { hidden: true, offset, distance }
    }
    return { hidden: false, offset, distance }
  }

  return (
    <section
      className="relative overflow-hidden bg-bg-light px-4 py-20 sm:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl">
        {/* Trait court en tête, repris de l'identité de marque. */}
        <div className="mx-auto h-1 w-16 rounded-full bg-brand" />

        <h2 className="mt-8 text-center text-3xl font-extrabold text-text-on-light sm:text-4xl">
          Les familles de référentiels
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-text-on-light-muted">
          Chaque famille structure différemment l'évaluation. Le choix dépend de votre
          activité, de vos obligations et de votre niveau de maturité.
        </p>

        {/* Scène. Le glissement tactile est géré à la main : une dépendance
            entière pour un seul geste ne se justifie pas. */}
        <div
          className="relative mt-16 h-[420px] sm:h-[400px]"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const delta = e.changedTouches[0].clientX - touchStartX.current
            // Seuil de 50 px : en deçà, le geste est plus probablement un
            // défilement vertical qu'un changement de carte.
            if (Math.abs(delta) > 50) takeOver(index + (delta < 0 ? 1 : -1))
            touchStartX.current = null
          }}
        >
          {slides.map((s, i) => {
            const { hidden, offset, distance } = positionOf(i)
            const isActive = distance === 0

            return (
              <article
                key={s.anchor}
                aria-hidden={!isActive}
                className="absolute left-1/2 top-0 w-[min(88vw,22rem)] overflow-hidden rounded-xl bg-white transition-all duration-[600ms] ease-out"
                style={{
                  display: hidden ? 'none' : undefined,
                  // La translation dépasse la moitié de la largeur : les cartes
                  // se chevauchent au lieu d'être alignées côte à côte.
                  transform: `translateX(-50%) translateX(${offset * 58}%) scale(${1 - distance * 0.12})`,
                  opacity: distance === 0 ? 1 : distance === 1 ? 0.72 : 0.35,
                  zIndex: total - distance,
                  boxShadow: isActive
                    ? '0 30px 70px -30px rgba(220,38,38,0.5), 0 0 0 1px rgba(220,38,38,0.28)'
                    : '0 16px 40px -24px rgba(15,23,42,0.4)',
                  // Seule la carte active est cliquable : les latérales ne sont
                  // que des indices de ce qui suit.
                  pointerEvents: isActive ? 'auto' : 'none',
                  filter: isActive ? 'none' : 'saturate(0.6)',
                }}
              >
                <div className="h-48 w-full overflow-hidden">
                  <GenerativeVisual seed={s.seed} variant={s.variant} />
                </div>

                <div className="bg-gradient-to-b from-white to-slate-50 px-6 pb-7 pt-6 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                    {s.subtitle}
                  </p>
                  <h3 className="mt-2 text-lg font-extrabold text-text-on-light sm:text-xl">
                    {s.title}
                  </h3>

                  <ul className="mt-4 space-y-1">
                    {s.items.map((item) => (
                      <li key={item} className="text-sm text-text-on-light-muted">
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`#${s.anchor}`}
                    tabIndex={isActive ? 0 : -1}
                    className="mt-6 inline-block rounded-md bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
                  >
                    En savoir plus
                  </Link>
                </div>
              </article>
            )
          })}

          {/* Commandes latérales, positionnées hors des cartes pour ne pas
              recouvrir le bouton central. */}
          <button
            type="button"
            onClick={() => takeOver(index - 1)}
            aria-label="Famille précédente"
            className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-text-on-light shadow-md transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => takeOver(index + 1)}
            aria-label="Famille suivante"
            className="absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-text-on-light shadow-md transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Pagination. Le libellé nomme la famille plutôt que son rang. */}
        <div className="mt-12 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.anchor}
              type="button"
              onClick={() => takeOver(i)}
              aria-label={s.title}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-brand' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
