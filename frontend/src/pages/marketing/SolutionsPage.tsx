import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, CheckCircle, AlertTriangle, ChevronDown, Star, Quote,
  Mountain, Zap, Fuel, Landmark, BarChart3, HeartPulse,
  LayoutDashboard, ShieldAlert, ListChecks, History, FileBarChart, Network,
  ShieldCheck, MapPin,
} from 'lucide-react'
import { Reveal, Eyebrow, CtaBand } from '../../components/marketing/SiteKit'
import { PrestationsSections } from '../../components/marketing/PrestationsSections'

/* =============================================================================
   Secteurs
   ============================================================================= */

/**
 * Les grands enjeux transverses. Un secteur en porte plusieurs ; le lecteur
 * filtre par celui qui le préoccupe et voit d'un coup d'œil qui est concerné.
 */
const ENJEUX = [
  { id: 'ot', label: 'Systèmes industriels' },
  { id: 'donnees', label: 'Données sensibles' },
  { id: 'conformite', label: 'Conformité' },
  { id: 'continuite', label: 'Continuité de service' },
] as const

type Enjeu = (typeof ENJEUX)[number]['id']

interface Secteur {
  id: string
  nom: string
  icon: ComponentType<{ size?: number; className?: string }>
  image: string
  teinte: string
  accroche: string
  tags: string[]
  enjeux: Enjeu[]
  contexte: string
  paires: { defi: string; reponse: string }[]
}

const SECTEURS: Secteur[] = [
  {
    id: 'mines',
    nom: 'Mines et industrie extractive',
    icon: Mountain,
    image: '/images/secteurs/mines.jpg',
    teinte: '#B45309',
    accroche: 'Sécuriser les opérations, protéger les infrastructures et maîtriser les risques OT/IT.',
    tags: ['OT/ICS', 'Sites isolés', "Contrôle d'accès", 'Conformité'],
    enjeux: ['ot', 'continuite', 'conformite'],
    contexte: 'Sites éloignés, automates industriels connectés et sous-traitants nombreux sur un même réseau.',
    paires: [
      { defi: 'Réseaux industriels et bureautique mêlés', reponse: 'Cartographie du périmètre OT/IT et cloisonnement vérifié' },
      { defi: 'Accès physiques et logiques de prestataires', reponse: 'Revue des habilitations et des comptes à privilèges' },
      { defi: 'Sites isolés difficiles à superviser', reponse: 'Suivi multi-périmètres, un tableau de bord par site' },
    ],
  },
  {
    id: 'energie',
    nom: 'Énergie et utilities',
    icon: Zap,
    image: '/images/secteurs/energie.jpg',
    teinte: '#2563EB',
    accroche: 'Renforcer la résilience des systèmes industriels et assurer la continuité de service.',
    tags: ['SCADA', 'Réseaux industriels', 'Continuité', 'Conformité'],
    enjeux: ['ot', 'continuite'],
    contexte: 'Production et distribution pilotées par des systèmes SCADA dont l’arrêt se voit immédiatement.',
    paires: [
      { defi: 'Systèmes SCADA exposés', reponse: 'Contrôles CIS et NIST CSF appliqués au périmètre industriel' },
      { defi: 'Continuité de service exigée', reponse: 'Plans de reprise évalués et étayés par des preuves' },
      { defi: 'Obligations d’opérateur essentiel', reponse: 'Score par référentiel et rapport reproductible' },
    ],
  },
  {
    id: 'petrole-gaz',
    nom: 'Pétrole et gaz',
    icon: Fuel,
    image: '/images/secteurs/petrole-gaz.jpg',
    teinte: '#DC2626',
    accroche: 'Maîtriser les risques OT/IT et protéger les infrastructures critiques.',
    tags: ['OT/ICS', 'Sûreté', 'Données sensibles', 'Réglementations'],
    enjeux: ['ot', 'donnees', 'conformite'],
    contexte: 'Terminaux, raffineries et dépôts où sûreté physique et cybersécurité se rejoignent.',
    paires: [
      { defi: 'Incident cyber aux conséquences physiques', reponse: 'Risques cotés par gravité et plan de remédiation priorisé' },
      { defi: 'Données d’exploration et contrats sensibles', reponse: 'Classification et chiffrement vérifiés par les preuves' },
      { defi: 'Exigences de partenaires internationaux', reponse: 'Alignement ISO 27001 démontré, écarts documentés' },
    ],
  },
  {
    id: 'secteur-public',
    nom: 'Secteur public',
    icon: Landmark,
    image: '/images/secteurs/secteur-public.jpg',
    teinte: '#1D4ED8',
    accroche: 'Sécuriser les données, les services et les infrastructures critiques au service des citoyens.',
    tags: ['Cloud', 'Identités', 'Conformité', 'Services critiques'],
    enjeux: ['donnees', 'conformite', 'continuite'],
    contexte: 'Exigences de souveraineté et redevabilité devant des autorités de contrôle.',
    paires: [
      { defi: 'Conformité réglementaire à prouver', reponse: 'Score par référentiel, avec sa couverture affichée' },
      { defi: 'Contrôles externes réguliers', reponse: 'Rapport reproductible, calcul explicable' },
      { defi: 'Hébergement et périmètre maîtrisés', reponse: 'Périmètre de scan déclaré et vérifié avant exécution' },
    ],
  },
  {
    id: 'banque-finance',
    nom: 'Banque, finance et services',
    icon: BarChart3,
    image: '/images/secteurs/banque-finance.jpg',
    teinte: '#7C3AED',
    accroche: 'Protéger les données sensibles, renforcer la confiance et répondre aux exigences réglementaires.',
    tags: ['Fraude', 'Données clients', 'Réglementation', 'Résilience'],
    enjeux: ['donnees', 'conformite', 'continuite'],
    contexte: 'Contraintes réglementaires denses et données dont la valeur est immédiate pour un attaquant.',
    paires: [
      { defi: 'Conformité PCI DSS à démontrer', reponse: 'Contrôles PCI DSS rattachés au questionnaire' },
      { defi: 'Données sensibles très exposées', reponse: 'Classification et chiffrement vérifiés par les preuves' },
      { defi: 'Traçabilité exigée par le régulateur', reponse: 'Journal d’audit horodaté et exportable' },
    ],
  },
  {
    id: 'sante',
    nom: 'Santé',
    icon: HeartPulse,
    image: '/images/secteurs/sante.jpg',
    teinte: '#16A34A',
    accroche: 'Protéger les données de santé et assurer la continuité des soins.',
    tags: ['Données de santé', 'RGPD', 'Continuité', 'Dispositifs médicaux'],
    enjeux: ['donnees', 'continuite', 'conformite'],
    contexte: 'Données personnelles de santé et systèmes dont l’indisponibilité a des conséquences directes.',
    paires: [
      { defi: 'Protection des données de patients', reponse: 'Domaine Conformité aligné RGPD et ISO 27701' },
      { defi: 'Disponibilité critique des systèmes', reponse: 'Sauvegardes et continuité évaluées et étayées' },
      { defi: 'Accès partagés entre services', reponse: 'Revue des habilitations et authentification renforcée' },
    ],
  },
]

/* =============================================================================
   Hero
   ============================================================================= */

/**
 * Carte flottante du hero. Elle suit légèrement le curseur : assez pour donner
 * de la profondeur à la photo, pas assez pour distraire. Coupée sous
 * préférence de mouvement réduit et au toucher.
 */
function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || window.matchMedia('(pointer: coarse)').matches) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--px', `${x * 14}px`)
      el.style.setProperty('--py', `${y * 10}px`)
    }
    const onLeave = () => {
      el.style.setProperty('--px', '0px')
      el.style.setProperty('--py', '0px')
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [reduced])

  return (
    <div ref={ref} className="s-hero-visual">
      <img
        src="/images/secteurs/hero-abidjan.jpg"
        alt="Abidjan la nuit, le Plateau et le pont Henri Konan Bédié"
        width={1536}
        height={1024}
      />
      <div className="s-hero-float">
        <div className="s-hero-float-map" aria-hidden="true">
          <MapPin size={22} />
        </div>
        <p>
          Une cybersécurité adaptée au contexte africain, aux réalités ivoiriennes et aux exigences
          internationales.
        </p>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="s-surface-navy relative overflow-hidden">
      <div className="s-wrap grid items-center gap-10 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:py-20">
        <Reveal>
          <Eyebrow>Solutions par secteur</Eyebrow>
          <h1 className="mt-5 text-[2.25rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[3rem] lg:text-[3.375rem]">
            Des réponses adaptées à{' '}
            <span className="text-[color:var(--s-primary)]">vos enjeux sectoriels</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--s-text)]">
            Chaque secteur fait face à des risques spécifiques. CYBERAS vous aide à évaluer, prioriser et
            traiter les plus pertinents pour votre environnement.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/evaluation" className="s-btn s-btn-primary">
              Lancer une évaluation <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="s-btn s-btn-secondary">
              Demander une démo
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[color:var(--s-text-muted)]">
            {['Six secteurs couverts', 'Référentiels internationaux', 'Ancrage Côte d’Ivoire'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[color:var(--s-success)]" />
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  )
}

/* =============================================================================
   Grille des secteurs
   ============================================================================= */

function CarteSecteur({ s, ouvert, attenue, onToggle }: { s: Secteur; ouvert: boolean; attenue: boolean; onToggle: () => void }) {
  const Icon = s.icon
  return (
    <motion.article
      layout
      animate={{ opacity: attenue ? 0.38 : 1, scale: attenue ? 0.985 : 1 }}
      transition={{ duration: 0.3 }}
      className={`s-card s-sector ${ouvert ? 's-sector-open' : ''}`}
      style={{ ['--sector' as string]: s.teinte }}
    >
      <div className="s-sector-media">
        <img src={s.image} alt="" width={1536} height={1024} loading="lazy" />
      </div>
      <div className="s-sector-body p-5 sm:p-6">
        <span className="s-sector-icon" aria-hidden="true">
          <Icon size={22} />
        </span>
        <h3 className="text-lg font-bold text-[color:var(--s-text-strong)]">{s.nom}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--s-text-muted)]">{s.accroche}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {s.tags.map((t) => (
            <li key={t} className="s-tag">
              {t}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={ouvert}
          aria-controls={`secteur-${s.id}`}
          className="s-link mt-5 inline-flex items-center gap-1.5 text-sm"
        >
          Voir la solution
          <ChevronDown size={16} className={`transition-transform duration-300 ${ouvert ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {ouvert && (
            <motion.div
              id={`secteur-${s.id}`}
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-5 border-t border-[color:var(--s-border)] pt-5">
                <p className="text-sm text-[color:var(--s-text)]">{s.contexte}</p>
                <ul className="mt-4 space-y-3">
                  {s.paires.map((p) => (
                    <li key={p.defi} className="grid gap-2 text-sm sm:grid-cols-2 sm:gap-4">
                      <span className="flex gap-2 font-medium text-[color:var(--s-text-strong)]">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[color:var(--s-high)]" />
                        {p.defi}
                      </span>
                      <span className="flex gap-2 text-[color:var(--s-text-muted)]">
                        <CheckCircle size={16} className="mt-0.5 shrink-0 text-[color:var(--s-success)]" />
                        {p.reponse}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to="/evaluation" className="s-btn s-btn-primary s-btn-sm mt-5">
                  Évaluer mon organisation <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

function SecteursSection() {
  const [enjeu, setEnjeu] = useState<Enjeu | null>(null)
  const [ouvert, setOuvert] = useState<string | null>(null)

  return (
    <section id="secteurs" className="s-section s-surface-white">
      <div className="s-wrap">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Solutions par secteur</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--s-text-strong)] sm:text-[2.5rem]">
                Des enjeux spécifiques. Des réponses concrètes.
              </h2>
              <p className="mt-4 text-lg text-[color:var(--s-text-muted)]">
                Découvrez comment CYBERAS s'adapte aux réalités de votre secteur en Côte d'Ivoire pour évaluer
                vos risques, renforcer votre résilience et piloter votre cybersécurité.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par enjeu">
              <button
                type="button"
                onClick={() => setEnjeu(null)}
                aria-pressed={enjeu === null}
                className={`s-chip ${enjeu === null ? 's-chip-active' : ''}`}
              >
                Tous les secteurs
              </button>
              {ENJEUX.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEnjeu((cur) => (cur === e.id ? null : e.id))}
                  aria-pressed={enjeu === e.id}
                  className={`s-chip ${enjeu === e.id ? 's-chip-active' : ''}`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SECTEURS.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i * 0.06, 0.3)}>
              <CarteSecteur
                s={s}
                ouvert={ouvert === s.id}
                attenue={enjeu !== null && !s.enjeux.includes(enjeu)}
                onToggle={() => setOuvert((cur) => (cur === s.id ? null : s.id))}
              />
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[color:var(--s-text-muted)]">
          Votre secteur n'est pas là ?{' '}
          <Link to="/contact" className="s-link">
            Parlons-en
          </Link>
          . Un premier audit se mène en une demi-journée, sans installation.
        </p>
      </div>
    </section>
  )
}

/* =============================================================================
   Suivi
   ============================================================================= */

const SUIVI = [
  { icon: LayoutDashboard, titre: 'Tableaux de bord', texte: 'Une vision claire de votre niveau de sécurité.' },
  { icon: ShieldAlert, titre: 'Risques et écarts', texte: 'Suivi des criticités et des plans d’action.' },
  { icon: ListChecks, titre: 'Actions de remédiation', texte: 'Responsables, échéances et avancement.' },
  { icon: History, titre: 'Historique', texte: 'Suivi des évaluations et des campagnes.' },
  { icon: FileBarChart, titre: 'Indicateurs et rapports', texte: 'Suivi de vos progrès et génération de rapports.' },
  { icon: Network, titre: 'Multi-périmètres', texte: 'Suivi par entité, site ou environnement.' },
]

function Compteur({ vers, suffixe = '' }: { vers: number; suffixe?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      setVal(vers)
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1100)
        setVal(Math.round(vers * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [vers, reduced])

  return (
    <span ref={ref}>
      {val}
      {suffixe}
    </span>
  )
}

function SuiviSection() {
  return (
    <section id="suivi" className="s-section s-surface-alt overflow-hidden">
      <div className="s-wrap grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <Eyebrow>Suivi</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--s-text-strong)] sm:text-[2.5rem]">
            Pilotez votre cybersécurité <span className="text-[color:var(--s-primary)]">dans la durée</span>
          </h2>
          <p className="mt-4 text-lg text-[color:var(--s-text-muted)]">
            Suivez l'évolution de votre posture, visualisez vos risques, vos écarts et vos actions, et mesurez
            vos progrès au fil du temps.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {SUIVI.map((f) => (
              <li key={f.titre} className="s-card s-card-hover flex gap-3 p-4">
                <span className="s-icon-tile s-icon-tile-soft shrink-0 !h-10 !w-10">
                  <f.icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--s-text-strong)]">{f.titre}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[color:var(--s-text-muted)]">{f.texte}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/evaluation" className="s-btn s-btn-primary">
              Lancer une évaluation <ArrowRight size={18} />
            </Link>
            <Link to="/suivi" className="s-btn s-btn-secondary">
              Découvrir le suivi
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <img
            src="/images/produit/dashboard-laptop.jpg"
            alt="Tableau de bord CYBERAS sur un ordinateur portable : score global, risques critiques, actions et conformité par référentiel"
            width={1536}
            height={1024}
            loading="lazy"
            className="s-laptop"
          />
          <div className="s-float s-float-a">
            <p className="text-xs font-medium text-[color:var(--s-text-muted)]">Score global</p>
            <p className="text-2xl font-extrabold text-[color:var(--s-text-strong)]">
              <Compteur vers={78} />
              <span className="text-base font-semibold text-[color:var(--s-text-muted)]">/100</span>
            </p>
            <p className="text-xs font-semibold text-[color:var(--s-success)]">+12 pts sur 12 mois</p>
          </div>
          <div className="s-float s-float-b">
            <p className="text-xs font-medium text-[color:var(--s-text-muted)]">Actions clôturées</p>
            <p className="text-2xl font-extrabold text-[color:var(--s-text-strong)]">
              <Compteur vers={36} />
            </p>
            <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-[color:var(--s-primary-soft)]">
              <span className="block h-full w-[64%] rounded-full bg-[color:var(--s-primary)]" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* =============================================================================
   Témoignages
   ============================================================================= */

const AVIS = [
  {
    initiales: 'KN',
    nom: 'Koffi N.',
    role: 'DSI',
    org: 'Port Autonome d’Abidjan',
    logo: '/images/logos/port-autonome-abidjan.png',
    secteur: 'Secteur public',
    teinte: '#1D4ED8',
    texte: 'CYBERAS nous a permis de structurer notre démarche de sécurité et de renforcer la protection de nos systèmes critiques.',
  },
  {
    initiales: 'AK',
    nom: 'Awa K.',
    role: 'Responsable conformité',
    org: 'BRVM',
    logo: '/images/logos/brvm.png',
    secteur: 'Banque',
    teinte: '#7C3AED',
    texte: 'La plateforme nous aide à piloter nos risques et à répondre aux exigences réglementaires du secteur financier.',
  },
  {
    initiales: 'MT',
    nom: 'Moussa T.',
    role: 'Responsable IT',
    org: 'CIE',
    logo: '/images/logos/cie.jpg',
    secteur: 'Industrie',
    teinte: '#2563EB',
    texte: 'Un outil clair et adapté à nos réalités, qui nous permet de suivre les risques et les plans d’action sur plusieurs sites industriels.',
  },
  {
    initiales: 'FB',
    nom: 'Dr Fatou B.',
    role: 'Responsable SI',
    org: 'CHU de Cocody',
    logo: '/images/logos/chu-cocody.png',
    secteur: 'Santé',
    teinte: '#16A34A',
    texte: 'CYBERAS nous accompagne dans la protection de nos données de santé et la continuité de nos services.',
  },
]

function AvisSection() {
  const [actif, setActif] = useState(0)
  const [pause, setPause] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (pause || reduced) return
    const id = window.setInterval(() => setActif((a) => (a + 1) % AVIS.length), 4200)
    return () => window.clearInterval(id)
  }, [pause, reduced])

  return (
    <section id="avis" className="s-section s-surface-white">
      <div className="s-wrap">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Avis clients</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--s-text-strong)] sm:text-[2.5rem]">
                Ils nous font <span className="text-[color:var(--s-primary)]">confiance</span>
              </h2>
              <p className="mt-4 text-lg text-[color:var(--s-text-muted)]">
                Des organisations en Côte d'Ivoire et en Afrique de l'Ouest utilisent CYBERAS pour renforcer leur
                cybersécurité et répondre à leurs exigences réglementaires.
              </p>
            </div>
            <Link to="/contact" className="s-btn s-btn-secondary s-btn-sm">
              Échanger avec un client <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <ul className="s-logo-strip mt-10" aria-label="Organisations clientes">
            {AVIS.map((a) => (
              <li key={a.org}>
                <img src={a.logo} alt={a.org} title={a.org} loading="lazy" />
              </li>
            ))}
          </ul>
        </Reveal>

        <div
          className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          onMouseEnter={() => setPause(true)}
          onMouseLeave={() => setPause(false)}
          onFocusCapture={() => setPause(true)}
          onBlurCapture={() => setPause(false)}
        >
          {AVIS.map((a, i) => (
            <Reveal key={a.nom} delay={i * 0.06} className="h-full">
              <article
                className={`s-card s-avis flex h-full flex-col p-5 ${actif === i ? 's-avis-active' : ''}`}
                style={{ ['--avatar' as string]: a.teinte }}
                onMouseEnter={() => setActif(i)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="s-avatar" aria-hidden="true">
                      {a.initiales}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[color:var(--s-text-strong)]">{a.nom}</p>
                      <p className="text-xs leading-snug text-[color:var(--s-text-muted)]">{a.role}</p>
                    </div>
                  </div>
                  <span className="s-tag">{a.secteur}</span>
                </div>
                <div className="mt-4 flex items-center gap-0.5 text-[color:var(--s-warning)]" aria-label="Cinq étoiles sur cinq">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={14} fill="currentColor" />
                  ))}
                </div>
                <Quote size={18} className="mt-3 text-[color:var(--s-primary)]" aria-hidden="true" />
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--s-text)]">« {a.texte} »</p>
                <div className="s-avis-org mt-auto pt-5">
                  <img src={a.logo} alt="" loading="lazy" className="s-avis-logo" />
                  <span className="text-xs font-semibold text-[color:var(--s-text-strong)]">{a.org}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* =============================================================================
   Page
   ============================================================================= */

export function SolutionsPage() {
  return (
    <>
      <Hero />
      <SecteursSection />
      <SuiviSection />

      {/* La grille des huit référentiels tenait ici aussi. Elle figurait alors
          sur trois pages, à l'identique, en plus du catalogue complet et de la
          bande de logos de l'accueil : un visiteur qui parcourait le site la
          croisait cinq fois, et la cinquième ne lui apprenait rien de plus que
          la première.

          Elle reste sur les deux pages que le menu désigne, « Solution » et
          « Ressources ». Ici, où le sujet est le secteur et non le cadre, le
          renvoi suffit. */}
      <section id="referentiels" className="s-section s-surface-white border-t border-[color:var(--s-border)]">
        <div className="s-wrap">
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>Référentiels</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--s-text-strong)] sm:text-[2.5rem]">
                Des exigences internationales, lues avec votre secteur
              </h2>
              <p className="mt-4 text-lg text-[color:var(--s-text-muted)]">
                Les contrôles de chaque évaluation sont rapprochés des cadres que vos régulateurs, vos partenaires
                et vos assureurs connaissent : ISO 27001 et 27002, NIST CSF, CIS Controls, OWASP, MITRE ATT&amp;CK,
                auxquels s&rsquo;ajoutent les exigences sectorielles de votre activité.
              </p>
              <Link to="/ressources#referentiels" className="s-btn s-btn-secondary mt-8">
                Voir les référentiels couverts <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <AvisSection />
      <PrestationsSections />

      <CtaBand
        title="Évaluez votre posture de sécurité dès aujourd'hui"
        lead="Un premier audit se mène en une demi-journée, sans installation, sur le périmètre que vous déclarez."
        primary={{ label: 'Lancer une évaluation', to: '/evaluation' }}
        secondary={{ label: 'Demander une démo', to: '/contact' }}
      />
    </>
  )
}
