import { useEffect, useRef, useState } from 'react'
import { UserPlus, FolderPlus, Users, ListChecks, Paperclip, Gauge } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionLabel } from './Shared'

/**
 * Prise en main du produit, en six étapes.
 *
 * <p>Cette section remplace la méthodologie d'audit qui occupait la même place.
 * Celle-ci décrivait une démarche de conseil — planification, collecte,
 * analyse — quand la question du visiteur est autre : qu'est-ce que je fais,
 * moi, une fois inscrit, et combien de temps ça me prend.
 *
 * <p>La mise en scène est conservée telle quelle. Le trait qui relie les jalons
 * n'est pas décoratif : il dit que les étapes s'enchaînent et se conditionnent.
 * Il se remplit au défilement, ce qui donne à lire une progression plutôt
 * qu'une liste.
 *
 * <p>Deux orientations, une seule source de contenu :
 *   - à partir de lg, ligne horizontale sous les jalons ;
 *   - en dessous, ligne verticale à gauche, plus lisible sur écran étroit
 *     qu'une horizontale compressée.
 *
 * <p>Les étapes décrivent le produit tel qu'il fonctionne aujourd'hui, pas une
 * cible. Les durées sont celles d'un premier audit sur un petit périmètre :
 * les annoncer plus courtes ferait mentir la démonstration dès la première
 * mission.
 */

interface Step {
  number: string
  icon: LucideIcon
  title: string
  duration: string
  description: string
  /** Ce que l'étape produit concrètement, et qui reste après elle. */
  outputs: string[]
}

const steps: Step[] = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Votre espace',
    duration: '2 min',
    description: "Compte, organisation, secteur. Rien à installer : Cyberas est un service en ligne.",
    outputs: ['Espace de travail', 'Aucune installation', 'Vos données chez vous'],
  },
  {
    number: '02',
    icon: FolderPlus,
    title: 'Votre mission',
    duration: '3 min',
    description: 'Vous nommez le périmètre à auditer et cochez le référentiel visé.',
    outputs: ['Périmètre déclaré', 'ISO 27001 · 93 contrôles', 'Mission cadrée'],
  },
  {
    number: '03',
    icon: Users,
    title: 'Votre équipe',
    duration: '2 min',
    description: "Un audit ne se remplit pas seul. Chaque session va à qui la maîtrise.",
    outputs: ['Invitations par lien', 'Rôles par mission', 'Accès limité à la mission'],
  },
  {
    number: '04',
    icon: ListChecks,
    title: 'Vos réponses',
    duration: '25 à 40 min',
    description: "Cinq sessions courtes, de « pas du tout » à « totalement ». Aucun jargon d'auditeur.",
    outputs: ['5 sessions', 'Enregistré au fil de l’eau', 'Reprise à tout moment'],
  },
  {
    number: '05',
    icon: Paperclip,
    title: 'Vos preuves',
    duration: '10 min',
    description: "Chaque pièce se dépose sur la question qu'elle étaye. Un scan complète la photo.",
    outputs: ['Pièces par question', 'Scan du périmètre déclaré', 'Écart déclaré / démontré'],
  },
  {
    number: '06',
    icon: Gauge,
    title: 'Votre score',
    duration: 'immédiat',
    description: "Score par référentiel, affiché avec sa couverture, et les questions à corriger.",
    outputs: ['Score et couverture', 'Écarts nommés', 'Rapport et plan d’action'],
  },
]

export function PriseEnMain() {
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
    <section id="prise-en-main" className="scroll-mt-24 bg-bg-dark px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>Comment ça se passe</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
          Une collaboration en 6 étapes
        </h2>
        <p className="mt-4 max-w-2xl text-text-on-dark-muted">
          Six étapes, aucune installation, aucun consultant requis pour démarrer.
          Vous pouvez vous arrêter après chacune et reprendre plus tard.
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

                    {/* La durée est annoncée avec le titre : c'est la première
                        chose qu'on veut savoir avant de s'engager. */}
                    <span className="mt-2 inline-block rounded-full bg-[#1E293B] px-2.5 py-0.5 text-[11px] font-semibold text-text-on-dark-muted">
                      {step.duration}
                    </span>

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
