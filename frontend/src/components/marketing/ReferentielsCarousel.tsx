import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Landmark, ShieldCheck, CreditCard,
  Globe, Crosshair, Server, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionLabel } from './Shared'

/**
 * Carrousel des familles de référentiels.
 *
 * Cartes sans illustration : un référentiel se juge sur ce qu'il couvre, pas
 * sur une image d'ambiance. L'information utile — famille, portée, normes
 * concernées — occupe donc toute la carte.
 *
 * Les cartes se chevauchent, celle du centre au premier plan : une grille de
 * six blocs obligerait à tout parcourir avant de choisir, le carrousel met une
 * famille en avant et laisse deviner la suite.
 *
 * L'avance automatique s'arrête à la première interaction et pendant le survol.
 */

interface Slide {
  /** Ancre de la famille détaillée plus bas dans la page. */
  anchor: string
  icon: LucideIcon
  /** Teinte propre à la famille, pour les distinguer d'un coup d'œil. */
  tint: string
  title: string
  purpose: string
  standards: string[]
  /** Ce que cette famille change dans la conduite de l'audit. */
  impact: string
}

const slides: Slide[] = [
  {
    anchor: 'gouvernance-et-management',
    icon: Landmark,
    tint: '#DC2626',
    title: 'Gouvernance et management',
    purpose: "Organiser la sécurité de l'information : périmètre, risques, mesures, amélioration continue.",
    standards: ['ISO/IEC 27001', 'ISO/IEC 27002', 'ISO/IEC 27005'],
    impact: 'Structure le questionnaire et la trame du rapport',
  },
  {
    anchor: 'cadres-de-cybersecurite',
    icon: ShieldCheck,
    tint: '#E85D2A',
    title: 'Cadres de cybersécurité',
    purpose: 'Lire la posture par capacité — identifier, protéger, détecter, répondre, rétablir.',
    standards: ['NIST CSF', 'NIST SP 800-53', 'CIS Controls'],
    impact: 'Donne un ordre de priorité aux actions',
  },
  {
    anchor: 'reglementaire-et-sectoriel',
    icon: CreditCard,
    tint: '#C2410C',
    title: 'Réglementaire et sectoriel',
    purpose: "Obligations qui s'imposent selon votre activité et les données que vous traitez.",
    standards: ['PCI DSS', 'RGPD', 'NIS 2'],
    impact: 'Détermine les contrôles non négociables',
  },
  {
    anchor: 'technique-et-applicatif',
    icon: Globe,
    tint: '#B91C1C',
    title: 'Technique et applicatif',
    purpose: 'Cadrer les tests et fixer un critère de réussite mesurable aux vérifications.',
    standards: ['OWASP Top 10', 'OWASP ASVS', 'MITRE ATT&CK'],
    impact: 'Définit la profondeur des tests menés',
  },
  {
    anchor: 'vulnerabilites-et-notation',
    icon: Crosshair,
    tint: '#EA580C',
    title: 'Vulnérabilités et notation',
    purpose: 'Identifier une faille, la noter, la rattacher à un scénario de risque.',
    standards: ['CVE · CVSS · CWE', 'MEHARI', 'ISO/IEC 27035'],
    impact: 'Alimente le calcul du score de risque',
  },
  {
    anchor: 'infrastructure-et-cloud',
    icon: Server,
    tint: '#991B1B',
    title: 'Infrastructure et cloud',
    purpose: 'Comparer vos configurations à des paramétrages de référence documentés.',
    standards: ['CIS Benchmarks', 'ISO 27017 · 27018', 'CSA CCM'],
    impact: 'Sert de base à l’audit de configuration',
  },
]

/** Rythme d'avance : assez long pour lire un titre, sa portée et ses normes. */
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
    return { offset, distance: Math.abs(offset) }
  }

  return (
    <section
      className="relative overflow-hidden bg-bg-dark px-4 py-20 sm:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(220,38,38,0.10), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Information en tête : ce que le visiteur doit comprendre avant de
            parcourir les familles. */}
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Référentiels</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Six familles, un cadre par activité
          </h2>
          <p className="mt-4 text-text-on-dark-muted">
            Chaque famille structure différemment l'évaluation. Parcourez-les pour situer
            celle qui correspond à votre activité.
          </p>
        </div>

        {/* Scène. Le glissement tactile est géré à la main : une dépendance
            entière pour un seul geste ne se justifie pas. */}
        <div
          className="relative mt-16 h-[400px] sm:h-[370px]"
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
            const { offset, distance } = positionOf(i)
            const isActive = distance === 0

            // Au-delà de deux rangs, la carte sort du rendu : la garder
            // n'apporterait rien et alourdirait la scène.
            if (distance > 2) return null

            return (
              <article
                key={s.anchor}
                aria-hidden={!isActive}
                className="absolute left-1/2 top-0 flex w-[min(88vw,23rem)] flex-col rounded-xl border p-7 transition-all duration-[600ms] ease-out"
                style={{
                  // La translation dépasse la moitié de la largeur : les cartes
                  // se chevauchent au lieu d'être alignées côte à côte.
                  transform: `translateX(-50%) translateX(${offset * 58}%) scale(${1 - distance * 0.12})`,
                  opacity: distance === 0 ? 1 : distance === 1 ? 0.6 : 0.28,
                  zIndex: total - distance,
                  // La teinte de la famille colore la carte active ; les
                  // latérales restent neutres pour ne pas brouiller la lecture.
                  background: isActive
                    ? `linear-gradient(160deg, ${s.tint}1F 0%, #0B0F14 55%)`
                    : '#0B0F14',
                  borderColor: isActive ? `${s.tint}66` : '#1E293B',
                  boxShadow: isActive
                    ? `0 28px 66px -30px ${s.tint}99`
                    : '0 14px 36px -26px rgba(0,0,0,0.8)',
                  // Seule la carte active est cliquable : les latérales ne sont
                  // que des indices de ce qui suit.
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${s.tint}26` }}
                >
                  <s.icon size={22} style={{ color: s.tint }} />
                </span>

                <h3 className="mt-5 text-xl font-bold leading-tight text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-on-dark-muted">{s.purpose}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {s.standards.map((std) => (
                    <span
                      key={std}
                      className="rounded border px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        borderColor: `${s.tint}4D`,
                        color: isActive ? s.tint : '#8B98A5',
                        backgroundColor: `${s.tint}14`,
                      }}
                    >
                      {std}
                    </span>
                  ))}
                </div>

                <p className="mt-5 border-t border-white/5 pt-4 text-xs text-text-on-dark-muted">
                  {s.impact}
                </p>

                <Link
                  to={`#${s.anchor}`}
                  tabIndex={isActive ? 0 : -1}
                  className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-white transition-colors hover:opacity-80"
                  style={{ color: isActive ? s.tint : '#8B98A5' }}
                >
                  Voir le détail <ArrowRight size={15} />
                </Link>
              </article>
            )
          })}

          {/* Commandes latérales, hors des cartes pour ne rien recouvrir. */}
          <button
            type="button"
            onClick={() => takeOver(index - 1)}
            aria-label="Famille précédente"
            className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-dark bg-surface-dark text-white transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => takeOver(index + 1)}
            aria-label="Famille suivante"
            className="absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-dark bg-surface-dark text-white transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Pagination. Le libellé nomme la famille plutôt que son rang. */}
        <div className="mt-10 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.anchor}
              type="button"
              onClick={() => takeOver(i)}
              aria-label={s.title}
              aria-current={i === index}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === index ? '2rem' : '0.375rem',
                backgroundColor: i === index ? s.tint : '#2D3D54',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
