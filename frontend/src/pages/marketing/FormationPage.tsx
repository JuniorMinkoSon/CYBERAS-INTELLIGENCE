import {
  BookOpenCheck,
  Compass,
  Search,
  ListChecks,
  TrendingUp,
  Wrench,
  ShieldCheck,
  Scale,
  Server,
  Crosshair,
  Radar,
  Code2,
  Siren,
  Briefcase,
  Award,
  ArrowRight,
  Check,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Reveal,
  Eyebrow,
  PageHead,
  SectionHead,
  FeatureCard,
  FlowChain,
  STAGGER,
} from '../../components/marketing/SiteKit'

/**
 * Page « Formation ».
 *
 * <p>Deux volets. Le premier, nouveau, est le catalogue : toutes les
 * formations en cybersécurité qui font monter en compétence dans le domaine,
 * filtrables par public. Le second est l'accompagnement sur les résultats
 * issus de l'audit, dont les textes sont ceux de la page précédente.
 *
 * <p>Ni durée ni programme figé : ils se décident au cadrage, avec vous.
 */

interface Apport {
  icon: ReactNode
  title: string
  text: string
}

type Public = 'tous' | 'direction' | 'securite' | 'it' | 'dev' | 'collaborateurs'

const PUBLICS: { id: Public; label: string }[] = [
  { id: 'tous', label: 'Tous les publics' },
  { id: 'direction', label: 'Direction' },
  { id: 'securite', label: 'Équipe sécurité' },
  { id: 'it', label: 'Équipes IT' },
  { id: 'dev', label: 'Développeurs' },
  { id: 'collaborateurs', label: 'Collaborateurs' },
]

interface Formation {
  id: string
  icon: ReactNode
  domaine: string
  titre: string
  texte: string
  themes: string[]
  publics: Public[]
}

/** Le catalogue : neuf domaines qui couvrent la montée en compétence en cybersécurité. */
const CATALOGUE: Formation[] = [
  {
    id: 'sensibilisation',
    icon: <ShieldCheck size={20} />,
    domaine: 'Sensibilisation',
    titre: 'Sensibilisation à la cybersécurité',
    texte: 'Donner à chaque collaborateur les réflexes qui évitent la majorité des incidents.',
    themes: ['Hameçonnage et ingénierie sociale', 'Mots de passe et authentification', 'Hygiène numérique au quotidien', 'Signaler un incident'],
    publics: ['collaborateurs', 'direction'],
  },
  {
    id: 'gouvernance',
    icon: <Scale size={20} />,
    domaine: 'Gouvernance et conformité',
    titre: 'Gouvernance, risques et conformité',
    texte: 'Structurer la sécurité : politique, organisation, gestion des risques et exigences réglementaires.',
    themes: ['ISO/IEC 27001 et 27002', 'NIST CSF 2.0', 'Analyse de risques (ISO 27005, EBIOS RM)', 'Protection des données personnelles'],
    publics: ['direction', 'securite'],
  },
  {
    id: 'infrastructure',
    icon: <Server size={20} />,
    domaine: 'Sécurité technique',
    titre: 'Sécurité des systèmes, réseaux et cloud',
    texte: 'Durcir et exploiter l’infrastructure conformément aux bonnes pratiques.',
    themes: ['Durcissement des systèmes (CIS Controls v8)', 'Segmentation, pare-feu, VPN', 'Annuaire et gestion des identités', 'Sécurité des environnements cloud'],
    publics: ['it', 'securite'],
  },
  {
    id: 'offensive',
    icon: <Crosshair size={20} />,
    domaine: 'Sécurité offensive',
    titre: 'Tests d’intrusion et hacking éthique',
    texte: 'Comprendre les techniques d’attaque pour mieux évaluer et protéger son périmètre.',
    themes: ['Méthodologie de test d’intrusion', 'Vulnérabilités web (OWASP Top 10)', 'Tactiques et techniques (MITRE ATT&CK)', 'Exercices Capture The Flag'],
    publics: ['securite', 'it', 'dev'],
  },
  {
    id: 'defensive',
    icon: <Radar size={20} />,
    domaine: 'Sécurité défensive',
    titre: 'Détection, réponse à incident et investigation',
    texte: 'Voir venir, contenir et analyser un incident de sécurité.',
    themes: ['Supervision et SIEM', 'Réponse à incident', 'Analyse forensique', 'Renseignement sur les menaces'],
    publics: ['securite', 'it'],
  },
  {
    id: 'developpement',
    icon: <Code2 size={20} />,
    domaine: 'Développement sécurisé',
    titre: 'Sécurité des applications et DevSecOps',
    texte: 'Concevoir et livrer des applications sûres dès la conception.',
    themes: ['OWASP Top 10 et revue de code', 'Sécurité des API', 'Intégration de la sécurité dans la chaîne CI/CD', 'Gestion des secrets et des dépendances'],
    publics: ['dev', 'securite'],
  },
  {
    id: 'crise',
    icon: <Siren size={20} />,
    domaine: 'Gestion de crise',
    titre: 'Gestion de crise et continuité d’activité',
    texte: 'Tenir l’organisation quand l’incident survient, et redémarrer.',
    themes: ['Exercices de crise cyber', 'Plan de continuité et plan de reprise', 'Communication de crise', 'Sauvegardes et restauration'],
    publics: ['direction', 'securite', 'it'],
  },
  {
    id: 'dirigeants',
    icon: <Briefcase size={20} />,
    domaine: 'Direction',
    titre: 'Cybersécurité pour les dirigeants',
    texte: 'Décider et arbitrer en matière de cybersécurité sans être spécialiste.',
    themes: ['Lire un tableau de bord et un score', 'Responsabilités et obligations', 'Budget, priorités et arbitrages', 'Cyber-assurance et sous-traitance'],
    publics: ['direction'],
  },
  {
    id: 'certifications',
    icon: <Award size={20} />,
    domaine: 'Certifications',
    titre: 'Préparation aux certifications',
    texte: 'Préparer les certifications reconnues du domaine.',
    themes: ['ISO 27001 Lead Implementer / Lead Auditor', 'CISSP, CISM', 'CEH, OSCP', 'CompTIA Security+'],
    publics: ['securite', 'it', 'dev'],
  },
]

/**
 * Les six moments où l'accompagnement intervient.
 *
 * Ils suivent l'ordre réel d'une évaluation : on comprend d'abord ce qu'on
 * lit, ensuite ce qu'on en fait.
 */
const APPORTS: Apport[] = [
  {
    icon: <BookOpenCheck size={20} />,
    title: 'Comprendre les résultats',
    text: 'Savoir ce que disent un score, un niveau de maturité et un écart, et ce qu’ils ne disent pas.',
  },
  {
    icon: <Compass size={20} />,
    title: 'Accompagner les audits',
    text: 'Préparer les équipes à l’exercice : qui répond, sur quoi, et avec quelles pièces à l’appui.',
  },
  {
    icon: <Search size={20} />,
    title: 'Interpréter les constats',
    text: 'Distinguer un écart de forme d’une faiblesse réelle, et situer chaque constat dans son contexte.',
  },
  {
    icon: <ListChecks size={20} />,
    title: 'S’approprier les recommandations',
    text: 'Comprendre ce qu’une recommandation demande concrètement avant de l’attribuer à quelqu’un.',
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Piloter la progression',
    text: 'Lire l’évolution des scores et de la maturité d’une évaluation à la suivante.',
  },
  {
    icon: <Wrench size={20} />,
    title: 'Conduire la remédiation',
    text: 'Transformer un plan d’action en travail tenu : responsables, échéances et statuts.',
  },
]

/** Le trajet que la formation rend possible, en quatre maillons. */
const TRAJET = ['Résultats', 'Compréhension', 'Décision', 'Progression']

const APPROCHE = [
  {
    titre: 'Sur votre contexte',
    texte: 'Le contenu part de votre secteur, de votre organisation et de votre niveau de maturité.',
  },
  {
    titre: 'Sur vos évaluations',
    texte: 'Les exemples travaillés sont vos propres constats, pas des cas génériques.',
  },
  {
    titre: 'Avec vos équipes',
    texte: 'Chaque public reçoit la lecture qui correspond à ce qu’il devra décider ou faire.',
  },
]

function Catalogue() {
  const reduced = useReducedMotion()
  const [publicActif, setPublicActif] = useState<Public>('tous')
  const [ouvert, setOuvert] = useState<string | null>(null)

  const visibles = useMemo(
    () =>
      publicActif === 'tous'
        ? CATALOGUE
        : CATALOGUE.filter((f) => f.publics.includes(publicActif)),
    [publicActif],
  )

  return (
    <div id="catalogue">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par public">
        {PUBLICS.map((p) => {
          const actif = p.id === publicActif
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={actif}
              onClick={() => {
                setPublicActif(p.id)
                setOuvert(null)
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                actif
                  ? 'border-[color:var(--s-primary)] bg-[color:var(--s-primary)] text-white'
                  : 'border-[color:var(--s-border)] bg-[color:var(--s-raised)] text-[color:var(--s-text)] hover:border-[color:var(--s-border-strong)]'
              }`}
            >
              {p.label}
            </button>
          )
        })}
        <span className="s-small ml-auto" aria-live="polite">
          {visibles.length} formation{visibles.length > 1 ? 's' : ''}
        </span>
      </div>

      <motion.ul layout={!reduced} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {visibles.map((f) => {
            const estOuvert = ouvert === f.id
            return (
              <motion.li
                key={f.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`s-card s-card-hover flex h-full flex-col ${
                  estOuvert ? 'border-[color:var(--s-primary)]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="s-icon-tile">{f.icon}</span>
                  <span className="s-eyebrow">{f.domaine}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[color:var(--s-text-strong)]">
                  {f.titre}
                </h3>
                <p className="s-small mt-2">{f.texte}</p>

                <AnimatePresence initial={false}>
                  {estOuvert && (
                    <motion.ul
                      key="themes" id={`themes-${f.id}`}
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 space-y-2 overflow-hidden border-t border-[color:var(--s-border)] pt-4"
                    >
                      {f.themes.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-[color:var(--s-text)]">
                          <Check size={16} className="mt-0.5 shrink-0 text-[color:var(--s-success)]" aria-hidden="true" />
                          {t}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <button
                    type="button"
                    aria-expanded={estOuvert}
                    aria-controls={`themes-${f.id}`}
                    onClick={() => setOuvert(estOuvert ? null : f.id)}
                    className="s-link text-sm"
                  >
                    {estOuvert ? 'Masquer les thèmes' : 'Voir les thèmes'}
                  </button>
                  <Link
                    to="/contact"
                    className="s-link text-sm"
                  >
                    Nous contacter <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  )
}

export function FormationPage() {
  return (
    <>
      <PageHead
        eyebrow="Formation"
        title="Produire un résultat ne suffit pas, encore faut-il savoir le lire"
        lead="La formation CYBERAS fait monter en compétence vos équipes sur l’ensemble des domaines de la cybersécurité, et accompagne les organisations dans la compréhension de leurs évaluations et dans tout ce qui en découle."
        actions={
          <>
            <a href="#catalogue" className="s-btn s-btn-primary">
              Voir les formations
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link to="/contact" className="s-btn s-btn-secondary">
              Nous contacter
            </Link>
          </>
        }
      />

      {/* Le catalogue : toutes les formations qui font monter en compétence. */}
      <section className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Catalogue"
            title="Toutes les formations en cybersécurité"
            lead="De la sensibilisation des collaborateurs à la préparation des certifications, chaque domaine se décline selon votre public et votre niveau de maturité. Format et durée se décident au cadrage."
          />
          <div className="mt-10">
            <Catalogue />
          </div>
        </div>
      </section>

      {/* L'accompagnement sur les résultats de l'audit : le message d'origine. */}
      <section className="s-section s-surface-alt border-y border-[color:var(--s-border)]">
        <div className="s-wrap">
          <Reveal className="max-w-3xl">
            <Eyebrow>Accompagnement sur vos résultats</Eyebrow>
            <h2 className="s-h2 mt-4">Faire passer une organisation d’un rapport reçu à une démarche tenue</h2>
            <p className="s-body mt-6">
              Une plateforme d’évaluation produit des scores, des écarts, des risques et des
              recommandations. Ces objets n’ont d’effet que si les équipes qui les reçoivent savent
              ce qu’ils signifient, ce qu’ils imposent et par où commencer.
            </p>
            <p className="s-body mt-4">
              C’est le rôle de la formation : faire passer une organisation d’un rapport reçu à une
              démarche tenue.
            </p>
          </Reveal>

          <Reveal delay={STAGGER[1]} className="mt-10">
            <FlowChain steps={TRAJET} compact />
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {APPORTS.map((apport, i) => (
              <Reveal key={apport.title} delay={STAGGER[i % 3]}>
                <FeatureCard icon={apport.icon} title={apport.title}>
                  {apport.text}
                </FeatureCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Notre approche, en trois points, puis l'appel à l'action. */}
      <section className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead eyebrow="Notre approche" title="Construite sur vos propres résultats" />

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {APPROCHE.map((item, i) => (
              <Reveal key={item.titre} delay={STAGGER[i]}>
                <div className="border-t-2 border-[color:var(--s-primary)] pt-5">
                  <h3 className="text-lg font-semibold text-[color:var(--s-text-strong)]">
                    {item.titre}
                  </h3>
                  <p className="s-small mt-2">{item.texte}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={STAGGER[3]} className="mt-14">
            <div className="s-card flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:p-10">
              <div>
                <h2 className="s-h3">Faites de vos résultats une démarche comprise</h2>
                <p className="s-body mt-2">
                  Parlons de votre contexte et de ce que vos équipes doivent pouvoir lire, décider
                  et suivre.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="s-btn s-btn-primary">
                  Nous contacter
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
