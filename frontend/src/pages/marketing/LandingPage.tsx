import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Crosshair, BarChart3, FileText, ShieldCheck, Layers, PlayCircle } from 'lucide-react'
import { Reveal, Eyebrow, FlowChain, STAGGER, REVEAL_EASE } from '../../components/marketing/SiteKit'
import { ProductTour } from '../../components/marketing/ProductTour'
import { VideoInline } from '../../components/marketing/VideoInline'

/**
 * Page d'accueil.
 *
 * <p>Les textes sont ceux de la version précédente, à l'identique. La
 * couverture est la seule surface sombre : la marque en grand, l'écusson et
 * les quatre piliers, puis le bandeau des standards. Le reste de la page est
 * clair et son rythme vient du contenu et des filets.
 */

const REFERENTIELS = [
  { nom: 'ISO/IEC 27001', detail: '2022', logo: '/images/logos/iso.svg' },
  { nom: 'ISO/IEC 27002', detail: '2022', logo: '/images/logos/iso.svg' },
  { nom: 'NIST Cybersecurity Framework', detail: '2.0', logo: '/images/logos/nist.svg' },
  { nom: 'CIS Critical Security Controls', detail: 'v8', logo: '/images/logos/cis.svg' },
  { nom: 'OWASP Top 10', detail: '2021', logo: '/images/logos/owasp.svg' },
  { nom: 'MITRE ATT&CK', detail: 'v15', logo: '/images/logos/mitre-attack.png' },
]

/* Bandeau sous le hero : les cadres et textes que les clients demandent en premier. */
const STANDARDS = [
  { nom: 'ISO 27001', logo: '/images/logos/iso.svg' },
  { nom: 'NIS2' },
  { nom: 'RGPD' },
  { nom: 'OWASP', logo: '/images/logos/owasp.svg' },
  { nom: 'CIS', logo: '/images/logos/cis.svg' },
  { nom: 'COBIT' },
  { nom: 'PCI DSS', logo: '/images/logos/pci-dss.svg' },
]

const PILIERS = [
  { t: 'Contrôles', s: 'Centralisés', icon: Crosshair, pos: 's-pilier-tl' },
  { t: 'Risques', s: 'En temps réel', icon: BarChart3, pos: 's-pilier-tr' },
  { t: 'Preuves', s: 'Traçables', icon: FileText, pos: 's-pilier-bl' },
  { t: 'Remédiation', s: 'Actionnable', icon: ShieldCheck, pos: 's-pilier-br' },
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
      {/* Couverture : fond bleu nuit, la marque en grand, l'écusson et les quatre piliers. */}
      <section className="s-surface-deep s-home-hero">
        <div className="s-wrap grid items-center gap-10 pt-12 pb-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          <div>
            <motion.p {...entree(0)} className="s-home-kicker">
              Pilotage <i /> Conformité <i /> Résilience
            </motion.p>
            <motion.h1 {...entree(1)} className="s-home-title mt-6">
              CYBERAS <span>INTELLIGENCE</span>
            </motion.h1>
            <motion.div {...entree(2)} className="s-home-rule mt-5" aria-hidden="true" />
            <motion.p {...entree(2)} className="s-home-sub mt-6">
              Anticipez les risques, renforcez <span>votre cybersécurité.</span>
            </motion.p>
            <motion.p {...entree(3)} className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-[color:var(--s-text)]">
              Un socle unifié pour piloter votre cybersécurité à partir d’une vision claire de vos
              risques. CYBERAS centralise vos référentiels, vos contrôles, vos preuves et vos plans
              de remédiation afin de vous offrir une vision consolidée de votre posture et de
              faciliter la prise de décision.
            </motion.p>
            <motion.div {...entree(4)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/solution" className="s-btn s-home-btn-main w-full sm:w-auto">
                Découvrir la solution
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/offres" className="s-btn s-btn-secondary w-full sm:w-auto">
                <Layers size={18} aria-hidden="true" />
                Formule de collaboration
              </Link>
              <Link to="/demo" className="s-btn s-btn-secondary w-full sm:w-auto">
                <PlayCircle size={18} aria-hidden="true" />
                Démo
              </Link>
            </motion.div>
          </div>

          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.96 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.8, delay: 0.15, ease: REVEAL_EASE },
                })}
            className="s-home-visual"
          >
            <img
              src="/images/produit/hero-shield.jpg"
              alt="Écusson CYBERAS devant un globe numérique centré sur l’Afrique"
              width={1024}
              height={1024}
            />
            {PILIERS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.t}
                  className={`s-pilier ${p.pos}`}
                  {...(reduced
                    ? {}
                    : {
                        initial: { opacity: 0, y: 10 },
                        animate: { opacity: 1, y: [0, -6, 0] },
                        transition: {
                          opacity: { duration: 0.5, delay: 0.5 + i * 0.12 },
                          y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 },
                        },
                      })}
                >
                  <Icon size={20} aria-hidden="true" />
                  <strong>{p.t}</strong>
                  <span>
                    <i aria-hidden="true" /> {p.s}
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        <div className="s-home-standards">
          <div className="s-wrap">
            <p className="s-eyebrow text-center">Référentiels &amp; standards</p>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10">
              {STANDARDS.map((s) => (
                <li key={s.nom} className="s-standard">
                  {s.logo ? <img src={s.logo} alt="" loading="lazy" /> : <span className="s-standard-mark" aria-hidden="true" />}
                  <span>{s.nom}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* La vidéo de présentation, en lecture dès l'arrivée et sans le son. */}
      <section className="s-surface-white pt-14 md:pt-20">
        <div className="s-wrap">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>CYBERAS en vidéo</Eyebrow>
            <h2 className="s-h2 mt-4">Deux minutes pour comprendre la plateforme</h2>
          </Reveal>
          <Reveal delay={0.1} className="mx-auto mt-10 max-w-5xl">
            <VideoInline />
          </Reveal>
        </div>
      </section>

      {/* Le produit tout de suite après, dans une visite à onglets. */}
      <section className="s-surface-white pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="s-wrap">
          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.6, delay: 0.3, ease: REVEAL_EASE },
                })}
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
                <li key={r.nom} className="flex items-center gap-2 whitespace-nowrap">
                  <img src={r.logo} alt="" loading="lazy" className="h-5 w-auto" />
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
