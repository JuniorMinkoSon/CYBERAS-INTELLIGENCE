import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ClipboardList, Gauge, ListChecks } from 'lucide-react'
import { Reveal, Eyebrow, STAGGER, REVEAL_EASE } from '../../components/marketing/SiteKit'
import { ProductTour } from '../../components/marketing/ProductTour'

/**
 * Page d'accueil.
 *
 * <p>Une seule surface claire, une accroche courte, le produit tout de suite
 * après. Le rythme vient du contenu et des filets, pas de l'alternance des
 * fonds : une page d'accueil se parcourt en un écran et demi, elle n'a pas à
 * se déplier comme un dossier.
 *
 * <p>Ce qui a disparu : la couverture verrouillée, le réseau animé, le
 * bandeau défilant, les deux chaînes de pastilles et les sections sombres.
 * Ce qui reste porte une décision : évaluer, voir le produit, demander une
 * démo.
 */

const REFERENTIELS = ['ISO/IEC 27001', 'NIST CSF 2.0', 'CIS Controls v8', 'OWASP Top 10', 'MITRE ATT&CK']

const ETAPES = [
  {
    icon: ClipboardList,
    n: '01',
    t: 'Évaluez',
    d: 'Choisissez un référentiel, répondez au questionnaire, joignez vos preuves. Vos équipes conduisent l’évaluation dans l’outil.',
  },
  {
    icon: Gauge,
    n: '02',
    t: 'Mesurez',
    d: 'Score de posture, écarts par domaine et cartographie des risques calculés de façon déterministe — recalculables à la main.',
  },
  {
    icon: ListChecks,
    n: '03',
    t: 'Remédiez',
    d: 'Chaque écart devient une action suivie : responsable, échéance, statut, preuve de clôture.',
  },
]

const LIVRABLES = [
  { t: 'Tableau de bord de posture', d: 'Score global, niveaux par domaine, tendance dans le temps.' },
  { t: 'Analyse des risques', d: 'Niveaux, priorités et exposition, prêts pour un comité.' },
  { t: 'Plan de remédiation', d: 'Actions, responsables, échéances — exportable.' },
]

const ENGAGEMENTS = [
  'Le score reste recalculable à la main',
  'L’analyse signale, elle ne décide pas',
  'Vos documents ne quittent pas la plateforme',
  'Une panne du service d’analyse n’arrête pas l’audit',
]

export function LandingPage() {
  const reduced = useReducedMotion()
  const entree = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: i * 0.07, ease: REVEAL_EASE },
        }

  return (
    <>
      {/* Accroche — centrée, courte, deux actions. */}
      <section className="s-surface-white pt-16 pb-10 md:pt-24 md:pb-14">
        <div className="s-wrap">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div {...entree(0)}>
              <Eyebrow>Plateforme d’audit et de pilotage cyber</Eyebrow>
            </motion.div>
            <motion.h1 {...entree(1)} className="s-h1 s-h1-hero mt-5">
              Mesurez et pilotez votre posture de cybersécurité.
            </motion.h1>
            <motion.p {...entree(2)} className="s-lead mx-auto mt-6 max-w-2xl">
              Référentiels, contrôles, preuves et plans de remédiation dans un seul espace — pour
              décider vite et suivre ce qui avance.
            </motion.p>
            <motion.div {...entree(3)} className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/evaluation" className="s-btn s-btn-primary">
                Lancer une évaluation
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/demo" className="s-btn s-btn-secondary">
                Demander une démo
              </Link>
            </motion.div>
            <motion.p
              {...entree(4)}
              className="mt-6 text-sm text-[color:var(--s-text-muted)]"
            >
              Évaluation conduite par vos équipes · Accompagnement par nos experts en option
            </motion.p>
          </div>

          {/* Le produit, tout de suite. Quatre onglets qu'on choisit ou qui
              défilent seuls jusqu'au premier clic. */}
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.6, delay: 0.3, ease: REVEAL_EASE },
                })}
            className="mt-12 md:mt-16"
          >
            <ProductTour />
          </motion.div>

          {/* Référentiels du socle : une ligne statique, lisible d'un coup. */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[color:var(--s-text-muted)]">
            <span className="font-semibold uppercase tracking-[0.12em] text-[0.6875rem]">
              Référentiels couverts
            </span>
            {REFERENTIELS.map((r) => (
              <span key={r} className="font-medium text-[color:var(--s-text)]">
                {r}
              </span>
            ))}
            <Link to="/referentiels" className="s-link text-sm">
              Tous les référentiels <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche — trois étapes, une ligne. */}
      <section className="s-surface-alt border-y border-[color:var(--s-border)] py-16 md:py-20">
        <div className="s-wrap">
          <Reveal className="max-w-2xl">
            <Eyebrow>Comment ça marche</Eyebrow>
            <h2 className="s-h2 mt-4">Trois étapes, conduites par vos équipes.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {ETAPES.map((e, i) => {
              const Icon = e.icon
              return (
                <Reveal key={e.t} delay={STAGGER[i]}>
                  <div className="s-card h-full">
                    <div className="flex items-center justify-between">
                      <span className="s-icon-tile">
                        <Icon size={20} />
                      </span>
                      <span className="text-sm font-bold tabular-nums text-[color:var(--s-text-muted)]">
                        {e.n}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-[color:var(--s-text-strong)]">{e.t}</h3>
                    <p className="s-small mt-2">{e.d}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <Reveal delay={STAGGER[3]} className="mt-8">
            <Link to="/methodologie" className="s-link">
              Voir la méthodologie en détail <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Ce que vous obtenez + les règles de l'analyse, côte à côte. */}
      <section className="s-surface-white py-16 md:py-20">
        <div className="s-wrap grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal>
            <Eyebrow>Les livrables</Eyebrow>
            <h2 className="s-h2 mt-4">Ce que vous obtenez</h2>
            <ul className="mt-8 divide-y divide-[color:var(--s-border)] border-y border-[color:var(--s-border)]">
              {LIVRABLES.map((l) => (
                <li key={l.t} className="flex items-start justify-between gap-6 py-4">
                  <div>
                    <p className="font-semibold text-[color:var(--s-text-strong)]">{l.t}</p>
                    <p className="s-small mt-1">{l.d}</p>
                  </div>
                  <Link
                    to="/solution#resultats"
                    aria-label={`En savoir plus : ${l.t}`}
                    className="mt-1 shrink-0 text-[color:var(--s-primary)]"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={STAGGER[1]}>
            <div className="s-card s-card-accent h-full">
              <Eyebrow>Gouvernance de l’IA</Eyebrow>
              <p className="mt-3 text-lg font-semibold text-[color:var(--s-text-strong)]">
                L’analyse assiste l’auditeur. Elle ne décide pas à sa place.
              </p>
              <ul className="mt-5 space-y-3">
                {ENGAGEMENTS.map((e) => (
                  <li key={e} className="flex items-start gap-3 text-[0.9375rem] text-[color:var(--s-text)]">
                    <Check size={18} className="mt-0.5 shrink-0 text-[color:var(--s-success)]" aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ul>
              <Link to="/ressources#documentation" className="s-link mt-6">
                Lire la documentation <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Clôture — une carte, deux actions, pas de fond sombre. */}
      <section className="s-surface-alt border-t border-[color:var(--s-border)] py-16 md:py-20">
        <div className="s-wrap">
          <Reveal>
            <div className="s-card flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:p-10">
              <div>
                <h2 className="s-h3">Prêt à obtenir une vision claire de vos risques ?</h2>
                <p className="s-body mt-2">
                  Commencez par une évaluation, ou demandez une démonstration sur votre contexte.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/evaluation" className="s-btn s-btn-primary">
                  Lancer une évaluation
                </Link>
                <Link to="/demo" className="s-btn s-btn-secondary">
                  Demander une démo
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
