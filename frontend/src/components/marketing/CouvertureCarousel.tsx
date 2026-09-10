import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Landmark, Scale, Server, Building2, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionLabel } from './Shared'

/**
 * Ce que l'audit couvre : cinq domaines, et les contrôles derrière chacun.
 *
 * <h2>Pourquoi un carrousel plutôt qu'une grille</h2>
 *
 * <p>Cinq cartes côte à côte sur une page d'accueil produisent cinq colonnes
 * étroites que personne ne lit. Le défilement horizontal en met deux en avant
 * et laisse deviner la suite, ce qui invite à parcourir au lieu de survoler.
 *
 * <p>Il repose sur l'ancrage de défilement natif plutôt que sur une mécanique
 * de cartes superposées : le geste tactile fonctionne sans code, la navigation
 * au clavier aussi, et la section reste légère — ce que la page d'accueil,
 * précisément, cherchait à redevenir.
 *
 * <h2>La barre de répartition</h2>
 *
 * <p>Chaque carte montre la part que ses questions représentent dans le
 * questionnaire. Ce n'est pas un ornement : elle rend visible un déséquilibre
 * réel — la moitié des questions porte sur le technique — que cinq chiffres
 * alignés laisseraient passer.
 *
 * <h2>Sur le domaine « Physique »</h2>
 *
 * <p>Il annonce zéro question et le dit. Le masquer laisserait croire à une
 * couverture complète ; l'afficher vide indique ce qui reste à écrire. Un
 * chiffre gonflé sur une page d'accueil se paye au premier audit.
 */

interface Domaine {
  nom: string
  icon: LucideIcon
  couvre: string
  questions: number
  /** Contrôles de l'Annexe A ISO/IEC 27001:2022 rattachés à ce domaine. */
  theme: string
  controles: number
  referentiels: string[]
  tint: string
}

const TOTAL_QUESTIONS = 42

const DOMAINES: Domaine[] = [
  {
    nom: 'Organisationnel',
    icon: Landmark,
    couvre: 'Gouvernance, analyse de risque, gestion des incidents, continuité.',
    questions: 12,
    theme: 'A.5',
    controles: 37,
    referentiels: ['ISO/IEC 27001', 'NIST CSF · GV', 'CIS 17'],
    tint: '#DC2626',
  },
  {
    nom: 'Conformité',
    icon: Scale,
    couvre: 'Obligations réglementaires, audits internes, maîtrise des fournisseurs.',
    questions: 6,
    theme: 'A.5.19 – 5.36',
    controles: 18,
    referentiels: ['ISO/IEC 27001', 'RGPD', 'ISO/IEC 27701'],
    tint: '#E85D2A',
  },
  {
    nom: 'Technique',
    icon: Server,
    couvre: 'Actifs, accès, réseau, applications, vulnérabilités, données, détection.',
    questions: 21,
    theme: 'A.8',
    controles: 34,
    referentiels: ['ISO/IEC 27002', 'NIST CSF · PR/DE', 'CIS Controls', 'OWASP'],
    tint: '#B91C1C',
  },
  {
    nom: 'Physique',
    icon: Building2,
    couvre: 'Locaux, zones sécurisées, protection et mise au rebut du matériel.',
    questions: 0,
    theme: 'A.7',
    controles: 14,
    referentiels: ['ISO/IEC 27002'],
    tint: '#C2410C',
  },
  {
    nom: 'Humain',
    icon: Users,
    couvre: 'Sensibilisation, arrivées et départs, signalement des messages suspects.',
    questions: 3,
    theme: 'A.6',
    controles: 8,
    referentiels: ['ISO/IEC 27002', 'NIST CSF · PR.AT', 'CIS 14'],
    tint: '#EA580C',
  },
]

export function CouvertureCarousel() {
  const railRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  /** Les flèches se désactivent aux extrémités plutôt que de ne rien faire. */
  const syncEdges = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    setAtStart(rail.scrollLeft <= 4)
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4)
  }, [])

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector('li')
    const step = card ? card.getBoundingClientRect().width + 20 : rail.clientWidth * 0.8
    rail.scrollBy({ left: step * direction, behavior: 'smooth' })
  }

  return (
    // Fond plus sombre que la section précédente, comme celui des services :
    // trois sections au même noir se liraient comme un seul bloc, et le palier
    // suffit à séparer sans introduire une bande claire qui casserait la page.
    <section className="overflow-hidden bg-[#050505] px-4 py-20 sm:px-6" id="couverture">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>Ce que l'audit couvre</SectionLabel>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
              Cinq domaines, et les contrôles derrière chacun
            </h2>
            <p className="mt-4 max-w-2xl text-text-on-dark-muted">
              Chaque domaine est une session du questionnaire, rattachée aux contrôles
              du référentiel retenu. Le score se calcule par référentiel, jamais
              d'un domaine à l'autre.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              aria-label="Domaine précédent"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1E293B] text-text-on-dark-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-25 disabled:hover:border-[#1E293B] disabled:hover:text-text-on-dark-muted"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              aria-label="Domaine suivant"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1E293B] text-text-on-dark-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-25 disabled:hover:border-[#1E293B] disabled:hover:text-text-on-dark-muted"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <ul
          ref={railRef}
          onScroll={syncEdges}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {DOMAINES.map((d) => {
            const vide = d.questions === 0
            const part = Math.round((d.questions / TOTAL_QUESTIONS) * 100)

            return (
              <li
                key={d.nom}
                className="flex w-[min(85vw,21rem)] shrink-0 snap-start flex-col rounded-xl border p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
                style={{
                  // Même traitement que le carrousel des référentiels : la
                  // teinte du domaine irrigue la carte au lieu de se réduire à
                  // un filet de couleur.
                  background: `linear-gradient(160deg, ${d.tint}1F 0%, #0B0F14 55%)`,
                  borderColor: `${d.tint}59`,
                  boxShadow: `0 28px 66px -34px ${d.tint}99`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${d.tint}26` }}
                  >
                    <d.icon size={22} style={{ color: d.tint }} />
                  </span>

                  {/* Le thème ISO en tête : c'est l'ancrage normatif du domaine,
                      il se lit avant le détail. */}
                  <span
                    className="rounded border px-2.5 py-1 font-mono text-[11px] font-semibold"
                    style={{
                      borderColor: `${d.tint}4D`,
                      backgroundColor: `${d.tint}14`,
                      color: d.tint,
                    }}
                  >
                    {d.theme}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold leading-tight text-white">{d.nom}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text-on-dark-muted">
                  {d.couvre}
                </p>

                <div className="mt-6 flex items-end gap-6">
                  <div>
                    <span className="block text-3xl font-extrabold leading-none text-white">
                      {vide ? '—' : d.questions}
                    </span>
                    <span className="mt-1.5 block text-[11px] uppercase tracking-wider text-text-on-dark-muted">
                      questions
                    </span>
                  </div>
                  <div>
                    <span className="block text-3xl font-extrabold leading-none text-white">
                      {d.controles}
                    </span>
                    <span className="mt-1.5 block text-[11px] uppercase tracking-wider text-text-on-dark-muted">
                      contrôles ISO
                    </span>
                  </div>
                </div>

                {/* Part du questionnaire. Le déséquilibre entre domaines est une
                    information, pas un défaut à masquer. */}
                <div className="mt-5">
                  <div className="h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${part}%`, backgroundColor: d.tint }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-text-on-dark-muted">
                    {vide
                      ? 'Contrôles rattachés, questionnaire en cours d’écriture'
                      : `${part} % du questionnaire`}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-5">
                  {d.referentiels.map((r) => (
                    <span
                      key={r}
                      className="rounded border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-text-on-dark-muted"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
