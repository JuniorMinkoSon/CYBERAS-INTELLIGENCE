import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardCheck, Server, Code2, Globe, Cloud, Crosshair, Bell, Compass,
  ChevronLeft, ChevronRight, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionLabel } from './Shared'

/**
 * Carrousel des prestations.
 *
 * Les cartes défilent l'une devant l'autre plutôt que d'être juxtaposées : une
 * grille de huit cartes oblige à tout parcourir du regard, là où le carrousel
 * met une prestation en avant et laisse deviner les suivantes.
 *
 * La profondeur est rendue par échelle et opacité, pas par une bibliothèque :
 * trois cartes visibles, celle du centre à pleine échelle, les latérales en
 * retrait. Tout passe par transform et opacity, animables sans recalcul de
 * mise en page.
 *
 * L'avance automatique s'arrête dès que le visiteur interagit — reprendre la
 * main sur un contenu qui bouge est une attente légitime.
 */

interface Solution {
  icon: LucideIcon
  title: string
  summary: string
  points: string[]
  referentials: string
  /** Ancre de la prestation détaillée sur /solutions. */
  to: string
}

const solutions: Solution[] = [
  {
    icon: ClipboardCheck,
    title: 'Audit organisationnel',
    summary: "La part de la sécurité qu'aucun scan ne peut mesurer.",
    points: ['Politiques et gouvernance', 'Rôles et responsabilités', 'Continuité d’activité'],
    referentials: 'ISO 27001 · ISO 27002',
    to: '/solutions#audit-organisationnel',
  },
  {
    icon: Server,
    title: 'Sécurité des infrastructures',
    summary: 'Serveurs, réseau et configurations confrontés aux références.',
    points: ['Durcissement système', 'Segmentation réseau', 'Correctifs et versions'],
    referentials: 'CIS Benchmarks · NIST 800-53',
    to: '/solutions#infrastructures',
  },
  {
    icon: Code2,
    title: 'Sécurité des applications',
    summary: 'Applications web et interfaces, sur critères vérifiables.',
    points: ['Authentification', 'Contrôle d’accès', 'Exposition des API'],
    referentials: 'OWASP Top 10 · ASVS',
    to: '/solutions#applications',
  },
  {
    icon: Globe,
    title: 'Test d’intrusion externe',
    summary: "Ce qu'un attaquant atteint depuis Internet, dans un périmètre autorisé.",
    points: ['Surface exposée', 'Vulnérabilités exploitables', 'Chemins d’accès'],
    referentials: 'PTES · NIST 800-115',
    to: '/solutions#intrusion-externe',
  },
  {
    icon: Cloud,
    title: 'Sécurité cloud',
    summary: 'Configurations, identités et ressources en responsabilité partagée.',
    points: ['Identités et permissions', 'Stockages exposés', 'Conteneurs'],
    referentials: 'CSA CCM · ISO 27017',
    to: '/solutions#securite-cloud',
  },
  {
    icon: Crosshair,
    title: 'Gestion des risques',
    summary: 'Analyse par scénario : actif, événement redouté, risque résiduel.',
    points: ['Vraisemblance et impact', 'Mesures existantes', 'Décisions de traitement'],
    referentials: 'ISO 27005 · MEHARI',
    to: '/solutions#risques',
  },
  {
    icon: Bell,
    title: 'Réponse aux incidents',
    summary: 'Capacité à détecter, qualifier et traiter un incident.',
    points: ['Détection et signalement', 'Procédures', 'Retour d’expérience'],
    referentials: 'ISO 27035 · NIST 800-61',
    to: '/solutions#incidents',
  },
  {
    icon: Compass,
    title: 'Conseil et stratégie',
    summary: 'Trajectoire tenant compte du niveau de départ et du budget.',
    points: ['Ambition et cible', 'Priorisation', 'Indicateurs de pilotage'],
    referentials: 'ISO 27001 · NIST CSF · COBIT',
    to: '/solutions#conseil',
  },
]

const AUTOPLAY_MS = 5200

export function SolutionsCarousel() {
  const [index, setIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const touchStartX = useRef<number | null>(null)

  const total = solutions.length

  const goTo = useCallback((next: number) => {
    // Modulo positif : l'index reste dans les bornes même en reculant depuis 0.
    setIndex(((next % total) + total) % total)
  }, [total])

  /** Toute action du visiteur reprend la main sur l'avance automatique. */
  const takeOver = useCallback((next: number) => {
    setAutoplay(false)
    goTo(next)
  }, [goTo])

  useEffect(() => {
    if (!autoplay) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [autoplay, index, goTo])

  /**
   * Place une carte selon sa distance à la carte active.
   *
   * La distance est calculée de façon circulaire : la dernière carte est à une
   * position de la première, sinon le passage de la fin au début produirait un
   * saut visuel.
   */
  const positionOf = (i: number) => {
    let offset = i - index
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total

    const distance = Math.abs(offset)

    // Au-delà de deux rangs, la carte est retirée du flux : la garder
    // n'apporterait rien et alourdirait le rendu.
    if (distance > 2) {
      return { display: 'none' as const, opacity: 0, transform: 'scale(0.7)', zIndex: 0 }
    }

    return {
      opacity: distance === 0 ? 1 : distance === 1 ? 0.55 : 0.22,
      transform: `translateX(${offset * 62}%) scale(${1 - distance * 0.14})`,
      zIndex: total - distance,
      filter: distance === 0 ? 'none' : 'saturate(0.5)',
    }
  }

  return (
    <section className="relative overflow-hidden bg-bg-dark px-4 py-20 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(220,38,38,0.10), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>Nos prestations</SectionLabel>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
              Une mission, un livrable, une preuve
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => takeOver(index - 1)}
              aria-label="Prestation précédente"
              className="cy-btn flex h-11 w-11 items-center justify-center rounded-full border border-[#1E293B] text-white transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => takeOver(index + 1)}
              aria-label="Prestation suivante"
              className="cy-btn flex h-11 w-11 items-center justify-center rounded-full border border-[#1E293B] text-white transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scène du carrousel. Le glissement tactile est géré à la main : une
            dépendance entière pour un seul geste ne se justifie pas. */}
        <div
          className="relative mt-14 h-[430px] sm:h-[400px]"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const delta = e.changedTouches[0].clientX - touchStartX.current
            // Seuil de 50 px : en deçà, le geste est plus probablement un
            // défilement vertical qu'une intention de changer de carte.
            if (Math.abs(delta) > 50) takeOver(index + (delta < 0 ? 1 : -1))
            touchStartX.current = null
          }}
        >
          {solutions.map((s, i) => {
            const style = positionOf(i)
            const isActive = i === index

            return (
              <article
                key={s.title}
                aria-hidden={!isActive}
                className="absolute left-1/2 top-0 w-[min(92vw,25rem)] -translate-x-1/2 rounded-xl border border-[#1E293B] bg-[#0B0F14] p-7 transition-all duration-500 ease-out"
                style={{
                  ...style,
                  transform: `translateX(-50%) ${style.transform}`,
                  borderColor: isActive ? 'rgba(220,38,38,0.45)' : undefined,
                  boxShadow: isActive ? '0 24px 60px -28px rgba(220,38,38,0.55)' : 'none',
                  // Seule la carte active est cliquable : les latérales ne sont
                  // que des indices de contenu.
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(220,38,38,0.12)]">
                  <s.icon size={22} className="text-[#DC2626]" />
                </span>

                <h3 className="mt-5 text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-on-dark-muted">{s.summary}</p>

                <ul className="mt-5 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-text-on-dark-muted">
                      <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-[#DC2626]" />
                      {p}
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-[#DC2626]">
                  {s.referentials}
                </p>

                <Link
                  to={s.to}
                  tabIndex={isActive ? 0 : -1}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#DC2626]"
                >
                  En savoir plus <ArrowRight size={15} />
                </Link>
              </article>
            )
          })}
        </div>

        {/* Pagination. Le libellé accessible nomme la prestation plutôt que son
            rang : « Audit organisationnel » est plus utile que « aller à 1 ». */}
        <div className="mt-10 flex justify-center gap-2">
          {solutions.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => takeOver(i)}
              aria-label={s.title}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-[#DC2626]' : 'w-1.5 bg-[#2D3D54] hover:bg-[#8B98A5]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
