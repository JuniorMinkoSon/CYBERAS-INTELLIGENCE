import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { VisualEvaluation, VisualPosture, VisualRemediation, VisualSocle } from './SiteVisuals'

/**
 * Visite guidée du produit : quatre onglets, un écran par onglet.
 *
 * Remplace la suite de sections « socle / méthode / technologie / résultats »
 * de l'ancien accueil. Le visiteur choisit ce qu'il veut voir au lieu de
 * défiler devant tout ; chaque écran se termine par l'action qui lui
 * correspond.
 *
 * Défilement automatique tant que rien n'a été cliqué : la première visite
 * voit les quatre écrans sans effort ; la première interaction rend la main.
 */

interface Etape {
  id: string
  onglet: string
  titre: string
  texte: string
  action: { label: string; to: string }
  Visuel: ComponentType
}

const ETAPES: Etape[] = [
  {
    id: 'evaluer',
    onglet: 'Évaluer',
    titre: 'Répondez, joignez vos preuves, laissez l’analyse croiser le tout.',
    texte:
      'Questionnaires structurés par référentiel, pièces justificatives rattachées à chaque contrôle, écarts signalés automatiquement.',
    action: { label: 'Lancer une évaluation', to: '/evaluation' },
    Visuel: VisualEvaluation,
  },
  {
    id: 'mesurer',
    onglet: 'Mesurer',
    titre: 'Une posture consolidée, lisible par la direction.',
    texte:
      'Score global, niveau par domaine, écarts et actions en cours sur un même tableau de bord — recalculable à la main.',
    action: { label: 'Voir les tableaux de bord', to: '/fonctionnalites#tableaux-de-bord' },
    Visuel: VisualPosture,
  },
  {
    id: 'remedier',
    onglet: 'Remédier',
    titre: 'Chaque écart devient une action avec un responsable et une échéance.',
    texte:
      'Le plan de remédiation se suit dans l’outil : priorité, statut, preuves de clôture. Rien ne se perd dans un tableur.',
    action: { label: 'Découvrir la remédiation', to: '/solution#remediation' },
    Visuel: VisualRemediation,
  },
  {
    id: 'unifier',
    onglet: 'Unifier',
    titre: 'Un contrôle évalué une fois, valable pour plusieurs référentiels.',
    texte:
      'ISO 27001, NIST CSF, CIS v8 et les autres convergent vers un socle commun : moins de questions posées, plus de cadres couverts.',
    action: { label: 'Comprendre le socle', to: '/solution#socle' },
    Visuel: VisualSocle,
  },
]

const AUTO_MS = 6000

export function ProductTour() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [auto, setAuto] = useState(!reduced)
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!auto) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % ETAPES.length), AUTO_MS)
    return () => window.clearInterval(t)
  }, [auto])

  const choisir = (i: number) => {
    setAuto(false)
    setIndex(i)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = e.key === 'ArrowRight' ? (index + 1) % ETAPES.length : (index - 1 + ETAPES.length) % ETAPES.length
    choisir(next)
    tabsRef.current[next]?.focus()
  }

  const etape = ETAPES[index]
  const Visuel = etape.Visuel

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--s-border)] bg-[color:var(--s-bg-alt)]">
      <div
        role="tablist"
        aria-label="Visite du produit"
        onKeyDown={onKey}
        className="flex gap-1 overflow-x-auto border-b border-[color:var(--s-border)] bg-white px-2 py-2"
      >
        {ETAPES.map((e, i) => {
          const actif = i === index
          return (
            <button
              key={e.id}
              ref={(el) => {
                tabsRef.current[i] = el
              }}
              role="tab"
              id={`tour-tab-${e.id}`}
              aria-selected={actif}
              aria-controls={`tour-panel-${e.id}`}
              tabIndex={actif ? 0 : -1}
              type="button"
              onClick={() => choisir(i)}
              className={`relative shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                actif
                  ? 'bg-[color:var(--s-primary-soft)] text-[color:var(--s-primary)]'
                  : 'text-[color:var(--s-text-muted)] hover:bg-[color:var(--s-bg-alt)] hover:text-[color:var(--s-text-strong)]'
              }`}
            >
              <span className="mr-2 tabular-nums opacity-60">{String(i + 1).padStart(2, '0')}</span>
              {e.onglet}
              {actif && auto && !reduced && (
                <motion.span
                  key={`bar-${e.id}`}
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0.5 h-0.5 origin-left rounded-full bg-[color:var(--s-primary)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
                />
              )}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`tour-panel-${etape.id}`}
        aria-labelledby={`tour-tab-${etape.id}`}
        className="grid items-center gap-8 p-6 md:grid-cols-[1fr_1.1fr] md:gap-12 md:p-10"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={etape.id}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="s-h3">{etape.titre}</h3>
            <p className="s-body mt-4">{etape.texte}</p>
            <Link to={etape.action.to} className="s-link mt-6">
              {etape.action.label} <ArrowRight size={16} />
            </Link>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`v-${etape.id}`}
            initial={reduced ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <Visuel />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
