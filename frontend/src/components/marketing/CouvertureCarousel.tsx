import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionLabel } from './Shared'

/**
 * Ce que l'audit couvre : cinq domaines, et les contrôles derrière chacun.
 *
 * <h2>Pourquoi un carrousel plutôt qu'une grille</h2>
 *
 * <p>Cinq cartes côte à côte sur une page d'accueil produisent cinq colonnes
 * étroites que personne ne lit. Le défilement horizontal en met une ou deux en
 * avant et laisse deviner la suite, ce qui invite à parcourir au lieu de
 * survoler.
 *
 * <p>Il repose sur l'ancrage de défilement natif plutôt que sur une mécanique
 * de cartes superposées : le geste tactile fonctionne sans code, la navigation
 * au clavier aussi, et la section reste légère — ce que la page d'accueil,
 * précisément, cherchait à redevenir.
 *
 * <h2>Sur le domaine « Physique »</h2>
 *
 * <p>Il annonce zéro question et le dit. Le masquer laisserait croire à une
 * couverture complète ; l'afficher vide indique ce qui reste à écrire. Un
 * chiffre gonflé sur une page d'accueil se paye au premier audit.
 */

interface Domaine {
  nom: string
  couvre: string
  questions: number
  /** Contrôles de l'Annexe A ISO/IEC 27001:2022 rattachés à ce domaine. */
  controles: string
  referentiels: string[]
  tint: string
}

const DOMAINES: Domaine[] = [
  {
    nom: 'Organisationnel',
    couvre: 'Gouvernance, analyse de risque, gestion des incidents, continuité.',
    questions: 12,
    controles: 'A.5 · 37 contrôles',
    referentiels: ['ISO/IEC 27001', 'NIST CSF · GV', 'CIS 17'],
    tint: '#DC2626',
  },
  {
    nom: 'Conformité',
    couvre: 'Obligations réglementaires, audits internes, maîtrise des fournisseurs.',
    questions: 6,
    controles: 'A.5.19 à 5.36',
    referentiels: ['ISO/IEC 27001', 'RGPD', 'ISO/IEC 27701'],
    tint: '#E85D2A',
  },
  {
    nom: 'Technique',
    couvre: 'Actifs, accès, réseau, applications, vulnérabilités, données, détection.',
    questions: 21,
    controles: 'A.8 · 34 contrôles',
    referentiels: ['ISO/IEC 27002', 'NIST CSF · PR/DE', 'CIS Controls', 'OWASP'],
    tint: '#B91C1C',
  },
  {
    nom: 'Physique',
    couvre: 'Locaux, zones sécurisées, protection et mise au rebut du matériel.',
    questions: 0,
    controles: 'A.7 · 14 contrôles',
    referentiels: ['ISO/IEC 27002'],
    tint: '#C2410C',
  },
  {
    nom: 'Humain',
    couvre: 'Sensibilisation, arrivées et départs, signalement des messages suspects.',
    questions: 3,
    controles: 'A.6 · 8 contrôles',
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
    const step = card ? card.getBoundingClientRect().width + 16 : rail.clientWidth * 0.8
    rail.scrollBy({ left: step * direction, behavior: 'smooth' })
  }

  return (
    <section className="bg-bg-light px-4 py-20 sm:px-6" id="couverture">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Ce que l'audit couvre</SectionLabel>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-text-on-light sm:text-4xl">
              Cinq domaines, et les contrôles derrière chacun
            </h2>
            <p className="mt-4 max-w-2xl text-text-on-light-muted">
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-text-on-light transition-colors hover:border-brand hover:text-brand disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-text-on-light"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              aria-label="Domaine suivant"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-text-on-light transition-colors hover:border-brand hover:text-brand disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-text-on-light"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <ul
          ref={railRef}
          onScroll={syncEdges}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {DOMAINES.map((d) => (
            <li
              key={d.nom}
              className="flex w-[19rem] shrink-0 snap-start flex-col rounded-xl border border-slate-200 bg-white p-6 sm:w-[21rem]"
            >
              <span
                aria-hidden="true"
                className="block h-1 w-10 rounded-full"
                style={{ backgroundColor: d.tint }}
              />
              <h3 className="mt-4 text-lg font-bold text-text-on-light">{d.nom}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-text-on-light-muted">
                {d.couvre}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-on-light-muted">
                    Questions
                  </dt>
                  <dd className="mt-0.5 text-lg font-extrabold text-text-on-light">
                    {d.questions > 0 ? d.questions : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-on-light-muted">
                    Contrôles ISO
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-text-on-light">
                    {d.controles}
                  </dd>
                </div>
              </dl>

              {d.questions === 0 && (
                <p className="mt-3 rounded-md bg-slate-100 px-3 py-2 text-xs text-text-on-light-muted">
                  Contrôles rattachés, questionnaire en cours d'écriture.
                </p>
              )}

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {d.referentiels.map((r) => (
                  <li
                    key={r}
                    className="rounded border border-slate-200 px-2 py-1 text-[11px] text-text-on-light-muted"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
