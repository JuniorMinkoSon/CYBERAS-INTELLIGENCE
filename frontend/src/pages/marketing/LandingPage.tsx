import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { Reveal, Eyebrow, FlowChain, STAGGER, REVEAL_EASE } from '../../components/marketing/SiteKit'
import { ProductTour } from '../../components/marketing/ProductTour'

/**
 * Page d'accueil.
 *
 * <p>Les textes sont ceux de la version précédente, à l'identique. Ce qui
 * change est ce qui les porte : une seule surface claire, une accroche
 * centrée, le produit tout de suite après dans une visite à onglets. Le rythme
 * vient du contenu et des filets, pas de l'alternance des fonds.
 *
 * <p>Ce qui a disparu : la couverture verrouillée, le réseau animé, le
 * bandeau défilant et les sections sombres.
 */

const REFERENTIELS = [
  { nom: 'ISO/IEC 27001', detail: '2022' },
  { nom: 'ISO/IEC 27002', detail: '2022' },
  { nom: 'NIST Cybersecurity Framework', detail: '2.0' },
  { nom: 'CIS Critical Security Controls', detail: 'v8' },
  { nom: 'OWASP Top 10', detail: '2021' },
  { nom: 'MITRE ATT&CK', detail: 'v15' },
]

const RESULTATS = [
  { t: 'Tableau de bord', d: 'Vision globale de la posture.', c: 'var(--s-primary)' },
  { t: 'Analyse des risques', d: 'Niveaux et priorités.', c: 'var(--s-high)' },
  { t: 'Plan de remédiation', d: 'Actions, responsables, échéances.', c: 'var(--s-success)' },
]

const ENGAGEMENTS = [
  'Le score reste recalculable à la main',
  'Le modèle signale, il ne corrige pas',
  'Vos documents ne sortent pas',
  'Une panne n’arrête pas l’audit',
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
      {/* Couverture : centrée, deux actions, puis le produit. */}
      <section className="s-surface-white pt-16 pb-10 md:pt-24 md:pb-14">
        <div className="s-wrap">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div {...entree(0)}>
              <Eyebrow>CYBERAS Intelligence</Eyebrow>
            </motion.div>
            <motion.h1 {...entree(1)} className="s-h1 s-h1-hero mt-5">
              Renforcez votre posture de cybersécurité.
            </motion.h1>
            <motion.p {...entree(2)} className="s-lead mx-auto mt-6 max-w-2xl">
              Un socle unifié pour piloter votre cybersécurité à partir d’une vision claire de vos
              risques. CYBERAS centralise vos référentiels, vos contrôles, vos preuves et vos plans
              de remédiation afin de vous offrir une vision consolidée de votre posture et de
              faciliter la prise de décision.
            </motion.p>
            <motion.div {...entree(3)} className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/evaluation" className="s-btn s-btn-primary">
                Lancer une évaluation
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/solution" className="s-btn s-btn-secondary">
                Découvrir la solution
              </Link>
            </motion.div>
          </div>

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
        </div>
      </section>

      {/* La chaîne de valeur et les référentiels du socle, en deux lignes
          statiques. Le bandeau défilait ; une ligne se lit d'un coup. */}
      <section className="s-surface-alt border-y border-[color:var(--s-border)] py-10">
        <div className="s-wrap">
          <Reveal>
            <FlowChain
              steps={['Audit', 'Analyse', 'Risques', 'Recommandations', 'Remédiation']}
              compact
            />
          </Reveal>
          <Reveal delay={STAGGER[1]} className="mt-8 border-t border-[color:var(--s-border)] pt-8">
            <p className="s-eyebrow text-center">Référentiels couverts</p>
            <ul className="mt-4 flex flex-wrap items-baseline justify-center gap-x-8 gap-y-2">
              {REFERENTIELS.map((r) => (
                <li key={r.nom} className="flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-[0.9375rem] font-semibold text-[color:var(--s-text)]">{r.nom}</span>
                  <span className="text-xs text-[color:var(--s-text-muted)]">{r.detail}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-center">
              <Link to="/ressources#referentiels" className="s-link text-sm">
                Le détail de chaque référentiel <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* La technologie et ses règles, côte à côte. */}
      <section className="s-surface-white py-16 md:py-20">
        <div className="s-wrap grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal>
            <Eyebrow>Technologie</Eyebrow>
            <h2 className="s-h2 mt-4">Un diagnostic optimisé par la technologie</h2>
            <p className="s-body s-measure mt-6">
              CYBERAS combine questionnaires structurés, collecte de preuves, analyses automatisées,
              scans techniques et technologies d’intelligence artificielle pour accélérer le
              diagnostic et faciliter l’identification des risques.
            </p>
            <div className="mt-10">
              <Eyebrow>La méthode</Eyebrow>
            </div>
            <h3 className="s-h3 mt-3">Collecte, analyse, résultats.</h3>
            <div className="mt-5 sm:[&>ol]:justify-start">
              <FlowChain steps={['Collecte', 'Analyse', 'Résultats']} compact />
            </div>
          </Reveal>
          <Reveal delay={STAGGER[1]}>
            <div id="gouvernance-ia" className="s-card s-card-accent h-full">
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
                Voir la documentation <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Les résultats. */}
      <section className="s-surface-alt border-t border-[color:var(--s-border)] py-16 md:py-20">
        <div className="s-wrap">
          <Reveal className="max-w-2xl">
            <Eyebrow>Les résultats</Eyebrow>
            <h2 className="s-h2 mt-4">Ce que vous obtenez</h2>
            <p className="s-lead mt-5">Des livrables structurés, faits pour décider et pour suivre.</p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {RESULTATS.map((r, i) => (
              <Reveal key={r.t} delay={STAGGER[i]}>
                <div className="s-card s-card-result h-full" style={{ ['--s-accent' as string]: r.c }}>
                  <h3 className="text-lg font-semibold text-[color:var(--s-text-strong)]">{r.t}</h3>
                  <p className="s-small mt-2">{r.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={STAGGER[3]} className="mt-8">
            <Link to="/solution#resultats" className="s-link">
              Voir tous les livrables <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Clôture : une carte, deux actions, pas de fond sombre. */}
      <section className="s-surface-white border-t border-[color:var(--s-border)] py-16 md:py-20">
        <div className="s-wrap">
          <Reveal>
            <div className="s-card flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:p-10">
              <div>
                <h2 className="s-h3">Prêt à obtenir une vision claire de vos risques ?</h2>
                <p className="s-body mt-2">
                  Lancez une évaluation, ou demandez une démonstration sur votre contexte.
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
