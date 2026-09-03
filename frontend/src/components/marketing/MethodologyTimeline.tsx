import { useEffect, useRef, useState } from 'react'
import { ClipboardList, Database, Search, Map, Gauge, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionLabel } from './Shared'

/**
 * Méthodologie d'audit en six étapes.
 *
 * Le trait qui relie les jalons n'est pas décoratif : il dit que les étapes
 * s'enchaînent et se conditionnent. Il se remplit au défilement, ce qui donne
 * à lire une progression plutôt qu'une liste.
 *
 * Deux orientations, une seule source de contenu :
 *   - à partir de lg, ligne horizontale sous les jalons ;
 *   - en dessous, ligne verticale à gauche, plus lisible sur écran étroit
 *     qu'une horizontale compressée.
 *
 * Le trait est un élément décoratif au sens de l'accessibilité : la relation
 * d'ordre est déjà portée par la numérotation et l'ordre du document.
 */

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
  /** Ce que l'étape produit concrètement. */
  outputs: string[]
}

const steps: Step[] = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Planification',
    description: "Définition du périmètre, des objectifs et du référentiel applicable.",
    outputs: ['Périmètre autorisé', 'Référentiel retenu', 'Objectifs de mission'],
  },
  {
    number: '02',
    icon: Database,
    title: 'Collecte',
    description: 'Rassemblement des preuves : questionnaire, documents, scans techniques.',
    outputs: ['Réponses au questionnaire', 'Preuves documentaires', 'Résultats de scan'],
  },
  {
    number: '03',
    icon: Search,
    title: 'Analyse',
    description: 'Évaluation des contrôles et qualification des constats.',
    outputs: ['Constats qualifiés', 'CVE et CVSS associés', 'Écarts aux contrôles'],
  },
  {
    number: '04',
    icon: Map,
    title: 'Cartographie',
    description: 'Mise en relation des constats, des actifs et des scénarios de risque.',
    outputs: ['Cartographie des risques', 'Actifs concernés', 'Corrélations établies'],
  },
  {
    number: '05',
    icon: Gauge,
    title: 'Scoring',
    description: 'Calcul du score contextualisé et du niveau de conformité.',
    outputs: ['Score Cyberas', 'Score de conformité', 'Priorités de traitement'],
  },
  {
    number: '06',
    icon: FileText,
    title: 'Rapport',
    description: "Restitution : constats, recommandations et plan d'action.",
    outputs: ['Rapport d’audit', 'Plan de remédiation', 'Suivi des actions'],
  },
]

export function MethodologyTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  /**
   * Remplit le trait à mesure que la section traverse l'écran.
   *
   * Le calcul est déclenché par IntersectionObserver plutôt que par un écouteur
   * de défilement permanent : hors champ, la section ne coûte rien.
   */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1)
      return
    }

    let frame = 0
    let active = false

    const update = () => {
      const rect = el.getBoundingClientRect()
      const viewport = window.innerHeight

      // La progression court du moment où la section entre par le bas jusqu'à
      // ce que son milieu atteigne le milieu de l'écran.
      const start = viewport * 0.85
      const end = viewport * 0.35
      const ratio = (start - rect.top) / (start - end)

      setProgress(Math.max(0, Math.min(1, ratio)))
      frame = active ? requestAnimationFrame(update) : 0
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting
        if (active && !frame) {
          frame = requestAnimationFrame(update)
        } else if (!active && frame) {
          cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { threshold: 0 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="methodologie" className="scroll-mt-24 bg-bg-dark px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>Notre méthodologie</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
          Six étapes qui s'enchaînent, du périmètre au plan d'action
        </h2>
        <p className="mt-4 max-w-2xl text-text-on-dark-muted">
          Chaque étape produit ce dont la suivante a besoin. Aucun score n'est avancé
          sans les preuves collectées en amont.
        </p>

        <div ref={containerRef} className="relative mt-16">

          {/* Trait horizontal, à partir de lg. Positionné à la hauteur du centre
              des pastilles pour les traverser, et non passer à côté. */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-7 hidden lg:block">
            <div className="h-px w-full bg-[#1E293B]" />
            <div
              className="absolute left-0 top-0 h-px bg-gradient-to-r from-[#DC2626] to-[#ff5a5a] transition-[width] duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Trait vertical, en dessous de lg. Aligné sur l'axe des pastilles. */}
          <div aria-hidden="true" className="absolute bottom-0 left-7 top-0 w-px lg:hidden">
            <div className="h-full w-px bg-[#1E293B]" />
            <div
              className="absolute left-0 top-0 w-px bg-gradient-to-b from-[#DC2626] to-[#ff5a5a] transition-[height] duration-300 ease-out"
              style={{ height: `${progress * 100}%` }}
            />
          </div>

          <ol className="relative grid gap-10 lg:grid-cols-6 lg:gap-5">
            {steps.map((step, i) => {
              // Un jalon s'allume quand le trait l'a dépassé : la couleur suit
              // la progression au lieu d'être acquise dès l'affichage.
              const reached = progress >= (i + 0.5) / steps.length

              return (
                <li key={step.number} className="relative flex gap-5 lg:block">

                  {/* Pastille. Fond opaque pour masquer le trait qui passe
                      derrière, sinon la ligne barrerait le numéro. */}
                  <div
                    className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-[#0B0F14] transition-colors duration-500 ${
                      reached
                        ? 'border-[#DC2626] text-[#DC2626]'
                        : 'border-[#1E293B] text-[#8B98A5]'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{step.number}</span>

                    {/* Halo, uniquement sur les jalons atteints. */}
                    {reached && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full"
                        style={{ boxShadow: '0 0 18px -2px rgba(220,38,38,0.55)' }}
                      />
                    )}
                  </div>

                  <div className="pb-2 lg:mt-6">
                    <div className="flex items-center gap-2">
                      <step.icon
                        size={16}
                        className={reached ? 'text-[#DC2626]' : 'text-[#8B98A5]'}
                      />
                      <h3 className="font-bold text-white">{step.title}</h3>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-text-on-dark-muted">
                      {step.description}
                    </p>

                    <ul className="mt-3 space-y-1">
                      {step.outputs.map((o) => (
                        <li
                          key={o}
                          className="flex items-start gap-2 text-xs text-text-on-dark-muted"
                        >
                          <span
                            className={`mt-1.5 block h-1 w-1 shrink-0 rounded-full transition-colors duration-500 ${
                              reached ? 'bg-[#DC2626]' : 'bg-[#2D3D54]'
                            }`}
                          />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
