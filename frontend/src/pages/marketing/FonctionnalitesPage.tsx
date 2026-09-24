import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowDown,
  Database,
  FileText,
  LineChart,
  ShieldCheck,
  Building2,
  UserCog,
  Wrench,
  AlertTriangle,
  CalendarClock,
  CircleDot,
  Radar,
  Crosshair,
  Bug,
  Network,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Reveal,
  Eyebrow,
  PageCover,
  SectionHead,
  CtaBand,
  STAGGER,
  surfaceClass,
} from '../../components/marketing/SiteKit'
import type { Surface } from '../../components/marketing/SiteKit'
import { VisualPosture } from '../../components/marketing/SiteVisuals'
import { DemoButton } from '../../components/marketing/DemoButton'

/**
 * Page « Fonctionnalités ».
 *
 * <p>Quatre fonctionnalités, dans l'ordre du panneau déroulant et dans celui
 * de la démarche : collecter, documenter, analyser et restituer, remédier et
 * piloter. Les ancres `collecter`, `documenter`, `analyser` et `remedier` sont
 * celles que siteNav.ts annonce ; les renommer casserait le panneau sans rien
 * signaler à la compilation.
 *
 * <p>La page dit ce que la plateforme permet de faire, pas comment s'en
 * servir. Chaque fonction suit la même construction : ce qu'elle manipule, la
 * chaîne qui la structure, ce qu'elle produit, et la valeur en une phrase.
 * Quatre blocs de même forme se comparent ; quatre blocs de formes différentes
 * se lisent quatre fois.
 *
 * <p>Deux contenus refusent ce gabarit et reçoivent leur propre section : les
 * trois niveaux de lecture d'un tableau de bord, qui sont des publics et non
 * des objets manipulés, et les trois horizons de priorisation, qui sont des
 * décisions et non des champs. Les fondre dans une liste de plus les aurait
 * fait passer pour des indicateurs supplémentaires.
 *
 * <p>Les écrans sont dessinés en balises, pas photographiés. Une capture
 * vieillit à la première retouche d'interface et se lit mal sur téléphone ;
 * une maquette en balises suit les jetons de la charte, reste nette à toute
 * densité et ne promet que ce que ses libellés disent.
 */

/* -------------------------------------------------------------------------- */
/* Maquettes d'écran                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Cadre commun des maquettes.
 *
 * Barre de titre, filtres, contenu. Les écrans de la page en héritent pour
 * qu'on les reconnaisse comme plusieurs vues d'un même produit, et non comme
 * des illustrations rassemblées.
 */
function Ecran({
  titre,
  filtres,
  action,
  children,
}: {
  titre: string
  filtres?: string[]
  action?: string
  children: React.ReactNode
}) {
  return (
    <figure
      className="overflow-hidden rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
      aria-label={`Aperçu de l’écran ${titre}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--s-border)] px-4 py-3">
        <span className="text-[0.8125rem] font-semibold text-[color:var(--s-text-strong)]">
          {titre}
        </span>
        {action && (
          <span className="rounded-md bg-[color:var(--s-primary)] px-2.5 py-1 text-[0.6875rem] font-semibold text-white">
            {action}
          </span>
        )}
      </div>
      {filtres && (
        <div className="flex flex-wrap gap-1.5 border-b border-[color:var(--s-border)] px-4 py-2.5">
          {filtres.map((f, i) => (
            <span
              key={f}
              className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-medium ${
                i === 0
                  ? 'bg-[color:var(--s-primary-soft)] text-[color:var(--s-primary)]'
                  : 'text-[color:var(--s-text-muted)]'
              }`}
            >
              {f}
            </span>
          ))}
        </div>
      )}
      <div className="p-4">{children}</div>
    </figure>
  )
}

/** Pastille d'état. Les tons sont ceux du produit, pas des couleurs libres. */
function Etat({ valeur, ton }: { valeur: string; ton: string }) {
  return (
    <span
      className="whitespace-nowrap rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
      style={{ color: ton, backgroundColor: `color-mix(in srgb, ${ton} 12%, transparent)` }}
    >
      {valeur}
    </span>
  )
}

function EcranQuestionnaire() {
  const lignes = [
    { code: 'A.5', nom: 'Politiques de sécurité', repondu: '12 / 12', pct: 100 },
    { code: 'A.6', nom: 'Organisation de la sécurité', repondu: '8 / 10', pct: 80 },
    { code: 'A.8', nom: 'Gestion des actifs', repondu: '6 / 10', pct: 60 },
    { code: 'A.9', nom: 'Contrôle d’accès', repondu: '4 / 10', pct: 40 },
  ]
  return (
    <Ecran titre="Questionnaire ISO 27001">
      <div className="rounded-lg bg-[color:var(--s-bg-alt)] px-3 py-2.5">
        <div className="flex items-center justify-between text-[0.6875rem]">
          <span className="text-[color:var(--s-text-muted)]">Avancement global</span>
          <span className="font-semibold text-[color:var(--s-text-strong)]">68 %</span>
        </div>
        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[color:var(--s-raised)]">
          <span
            className="block h-full rounded-full bg-[color:var(--s-success)]"
            style={{ width: '68%' }}
          />
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {lignes.map((l) => (
          <div
            key={l.code}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--s-border)] px-3 py-2.5"
          >
            <span className="shrink-0 text-[0.6875rem] font-semibold text-[color:var(--s-text-muted)]">
              {l.code}
            </span>
            <span className="flex-1 truncate text-xs text-[color:var(--s-text-strong)]">
              {l.nom}
            </span>
            <span className="shrink-0 text-[0.6875rem] text-[color:var(--s-text-muted)]">
              {l.repondu}
            </span>
            <span className="w-10 shrink-0 text-right text-[0.6875rem] font-semibold text-[color:var(--s-text-strong)]">
              {l.pct} %
            </span>
          </div>
        ))}
      </div>
    </Ecran>
  )
}

/**
 * Résultats d'un scan.
 *
 * Les identifiants CVE sont réels et connus ; les scores CVSS sont ceux
 * publiés. Inventer un « CVE-2024-99999 » ferait une maquette qu'un
 * responsable sécurité repère en une seconde, et le doute se reporterait sur
 * tout le reste de la page.
 */
function EcranScans() {
  const constats = [
    { cve: 'CVE-2021-44228', cvss: '10.0', gravite: 'Critique', ton: 'var(--s-critical)' },
    { cve: 'CVE-2023-44487', cvss: '7.5', gravite: 'Élevée', ton: 'var(--s-high)' },
    { cve: 'CVE-2022-22965', cvss: '9.8', gravite: 'Critique', ton: 'var(--s-critical)' },
    { cve: 'CVE-2023-38545', cvss: '5.9', gravite: 'Moyenne', ton: 'var(--s-warning)' },
  ]
  return (
    <Ecran
      titre="Constats de scan"
      action="Lancer un scan"
      filtres={['Tous', 'Critiques', 'Élevés', 'Moyens']}
    >
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-[color:var(--s-primary-soft)] px-3 py-2">
        <ShieldCheck
          size={14}
          className="shrink-0 text-[color:var(--s-primary)]"
          aria-hidden="true"
        />
        <span className="text-[0.6875rem] font-medium text-[color:var(--s-text)]">
          Périmètre déclaré et autorisé
        </span>
      </div>
      <div className="space-y-2">
        {constats.map((c) => (
          <div
            key={c.cve}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--s-border)] px-3 py-2.5"
          >
            <span className="flex-1 truncate font-mono text-[0.6875rem] text-[color:var(--s-text-strong)]">
              {c.cve}
            </span>
            <span className="shrink-0 rounded bg-[color:var(--s-bg-alt)] px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold text-[color:var(--s-text-muted)]">
              CVSS {c.cvss}
            </span>
            <Etat valeur={c.gravite} ton={c.ton} />
          </div>
        ))}
      </div>
    </Ecran>
  )
}

function EcranPreuves() {
  const lignes = [
    { nom: 'Politique de sécurité', ctrl: 'A.5.1', etat: 'Vérifiée', ton: 'var(--s-success)' },
    { nom: 'Rapport d’audit interne', ctrl: 'A.5.35', etat: 'Vérifiée', ton: 'var(--s-success)' },
    { nom: 'Plan de continuité', ctrl: 'A.5.29', etat: 'À vérifier', ton: 'var(--s-warning)' },
    { nom: 'Certificat expiré', ctrl: 'A.8.24', etat: 'Écart', ton: 'var(--s-critical)' },
  ]
  return (
    <Ecran
      titre="Dossier de preuves"
      action="Ajouter une preuve"
      filtres={['Toutes', 'Vérifiées', 'À vérifier', 'En écart']}
    >
      <div className="space-y-2">
        {lignes.map((l) => (
          <div
            key={l.nom}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--s-border)] px-3 py-2.5"
          >
            <FileText
              size={14}
              className="shrink-0 text-[color:var(--s-text-muted)]"
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-xs text-[color:var(--s-text-strong)]">
              {l.nom}
            </span>
            <span className="hidden shrink-0 text-[0.6875rem] text-[color:var(--s-text-muted)] sm:block">
              {l.ctrl}
            </span>
            <Etat valeur={l.etat} ton={l.ton} />
          </div>
        ))}
      </div>
    </Ecran>
  )
}

function EcranSuivi() {
  const lignes = [
    { nom: 'Renforcer l’authentification', resp: 'DSI', etat: 'En cours', ton: 'var(--s-primary)' },
    { nom: 'Mettre à jour la politique', resp: 'RSSI', etat: 'À faire', ton: 'var(--s-warning)' },
    { nom: 'Cloisonner le réseau', resp: 'Infra', etat: 'En retard', ton: 'var(--s-critical)' },
    { nom: 'Former les équipes', resp: 'RH', etat: 'Terminée', ton: 'var(--s-success)' },
  ]
  return (
    <Ecran
      titre="Suivi de la remédiation"
      action="Nouvelle action"
      filtres={['Toutes', 'En cours', 'En retard', 'Terminées']}
    >
      <div className="space-y-2">
        {lignes.map((l) => (
          <div
            key={l.nom}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--s-border)] px-3 py-2.5"
          >
            <span className="flex-1 truncate text-xs text-[color:var(--s-text-strong)]">
              {l.nom}
            </span>
            <span className="shrink-0 rounded-full bg-[color:var(--s-bg-alt)] px-2 py-0.5 text-[0.625rem] font-medium text-[color:var(--s-text-muted)]">
              {l.resp}
            </span>
            <Etat valeur={l.etat} ton={l.ton} />
          </div>
        ))}
      </div>
    </Ecran>
  )
}

/* -------------------------------------------------------------------------- */
/* Contenu                                                                     */
/* -------------------------------------------------------------------------- */

interface Fonction {
  id: string
  numero: string
  label: string
  titre: string
  intro: string
  /** La chaîne qui structure la fonction. Lue de gauche à droite, elle dit l'ordre. */
  chaine: { titre: string; maillons: string[]; note: string }
  surface: Surface
  ecran: React.ReactNode
  icon: LucideIcon
}

/**
 * Les quatre fonctionnalités.
 *
 * <p>Chacune tient en un titre, une phrase, une chaîne et un écran. Elle
 * portait auparavant deux listes à puces de huit à dix entrées : « ce que
 * CYBERAS permet de collecter », « ce que vous pouvez documenter », « ce que la
 * restitution présente ». Soixante-cinq puces au total, qui énuméraient des
 * champs de formulaire là où le visiteur cherchait à savoir ce que la
 * plateforme fait. L'écran de droite les montre toutes à la fois, et sans
 * demander à être lu.
 */
const FONCTIONS: Fonction[] = [
  {
    id: 'collecter',
    numero: '01',
    label: 'Collecter les données',
    titre: 'Transformez les informations de l’organisation en données d’évaluation exploitables',
    intro:
      'Questionnaires, entretiens, documents et preuves sont recueillis au même endroit, chacun rattaché au contrôle qu’il permet d’évaluer.',
    chaine: {
      titre: 'Une collecte structurée',
      maillons: ['Référentiels', 'Domaines', 'Exigences', 'Contrôles', 'Questions'],
      note: 'Chaque donnée collectée reste reliée à l’élément de sécurité qu’elle permet d’évaluer.',
    },
    surface: 'white',
    ecran: <EcranQuestionnaire />,
    icon: Database,
  },
  {
    id: 'documenter',
    numero: '02',
    label: 'Documenter',
    titre: 'Centralisez les preuves et construisez une base d’audit traçable',
    intro:
      'Politiques, procédures, captures et rapports sont rattachés au contrôle qu’ils justifient. La plateforme signale ce qui manque : preuve absente, insuffisante, expirée ou non vérifiée.',
    chaine: {
      titre: 'Une preuve, un contrôle',
      maillons: ['Exigence', 'Contrôle', 'Preuve', 'Évaluation'],
      note: 'Le rattachement facilite la vérification des réponses, la traçabilité des constats et la préparation des audits.',
    },
    surface: 'alt',
    ecran: <EcranPreuves />,
    icon: FileText,
  },
  {
    id: 'analyser',
    numero: '03',
    label: 'Analyse & Résultats',
    titre: 'Transformez les données collectées en résultats compréhensibles',
    intro:
      'Réponses et preuves sont confrontées aux contrôles applicables. Le mapping rapproche les exigences de plusieurs référentiels d’un socle commun, et le scoring en tire des scores, des niveaux de maturité et des écarts.',
    chaine: {
      titre: 'Du contrôle au niveau de maturité',
      maillons: [
        'Réponses et preuves',
        'Score par contrôle',
        'Score par domaine',
        'Score global',
        'Niveau de maturité',
      ],
      note: 'Le scoring ne constitue pas une finalité : il sert à objectiver la situation, comparer les niveaux de maîtrise et faciliter la priorisation des actions.',
    },
    surface: 'white',
    ecran: <VisualPosture />,
    icon: LineChart,
  },
  {
    id: 'remedier',
    numero: '04',
    label: 'Remédier & Piloter',
    titre: 'Transformez les constats d’audit en actions concrètes',
    intro:
      'Chaque écart devient une action qui porte son responsable, son échéance et son statut. Les tableaux de bord suivent l’avancement, l’évolution des risques et celle des scores.',
    chaine: {
      titre: 'La boucle d’amélioration',
      maillons: ['Évaluer', 'Identifier les écarts', 'Prioriser', 'Agir', 'Mesurer', 'Réévaluer'],
      note: 'La dernière étape ramène à la première : l’audit ponctuel devient une démarche de pilotage continu.',
    },
    surface: 'alt',
    ecran: <EcranSuivi />,
    icon: ShieldCheck,
  },
]

/**
 * Ce que les scans apportent.
 *
 * Quatre faits vérifiables dans le produit : le périmètre est déclaré avant
 * l'exécution, les constats portent leur CVE et leur score CVSS, ils sont
 * classés par gravité, et ils sont rattachés au risque et au contrôle
 * concernés. Rien sur la fréquence ni sur les outils employés : ils varient
 * selon l'offre et le périmètre, et les nommer ici reviendrait à promettre une
 * configuration qui n'est pas celle de tout le monde.
 */
const SCANS: { icon: LucideIcon; nom: string; texte: string }[] = [
  {
    icon: Crosshair,
    nom: 'Périmètre déclaré',
    texte: 'Cibles déclarées et autorisées avant toute exécution.',
  },
  {
    icon: Bug,
    nom: 'CVE et CVSS',
    texte: 'Chaque constat porte son identifiant et son score public.',
  },
  {
    icon: AlertTriangle,
    nom: 'Classés par gravité',
    texte: 'Du critique au faible, dans l’ordre où l’on doit traiter.',
  },
  {
    icon: Network,
    nom: 'Reliés aux risques',
    texte: 'Un constat rejoint le risque et le contrôle qu’il concerne.',
  },
]

/** Les trois niveaux de lecture d'un tableau de bord. Des publics, pas des indicateurs. */
const PUBLICS: { icon: LucideIcon; role: string; besoin: string }[] = [
  { icon: Building2, role: 'Direction', besoin: 'Vision synthétique et indicateurs clés.' },
  { icon: UserCog, role: 'RSSI et DSI', besoin: 'Niveau de maîtrise, risques et priorités.' },
  {
    icon: Wrench,
    role: 'Responsables de contrôles',
    besoin: 'Écarts, preuves et actions à réaliser.',
  },
]

/** Les trois horizons de priorisation. Des décisions, pas des champs. */
const HORIZONS: { icon: LucideIcon; quand: string; quoi: string; ton: string }[] = [
  {
    icon: AlertTriangle,
    quand: 'À traiter immédiatement',
    quoi: 'Ce qui expose l’organisation dès maintenant.',
    ton: 'var(--s-critical)',
  },
  {
    icon: CalendarClock,
    quand: 'À planifier',
    quoi: 'Ce qui demande un budget, un projet ou une coordination.',
    ton: 'var(--s-warning)',
  },
  {
    icon: CircleDot,
    quand: 'À améliorer progressivement',
    quoi: 'Ce qui relève de l’amélioration continue.',
    ton: 'var(--s-success)',
  },
]

/* -------------------------------------------------------------------------- */
/* Fragments de rendu                                                          */
/* -------------------------------------------------------------------------- */


/**
 * La chaîne qui structure une fonction.
 *
 * Horizontale sur grand écran, verticale sur téléphone. Les flèches ne sortent
 * qu'à l'horizontale, où elles ont un sens : empilée, la lecture de haut en bas
 * dit déjà l'ordre, et une flèche à chaque maillon n'ajouterait que du bruit.
 */
function Chaine({ chaine }: { chaine: Fonction['chaine'] }) {
  return (
    <div className="rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] p-5">
      <Eyebrow>{chaine.titre}</Eyebrow>
      <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {chaine.maillons.map((maillon, i) => (
          <li key={maillon} className="flex items-center gap-2">
            <span className="rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-bg-alt)] px-3 py-1.5 text-xs font-semibold text-[color:var(--s-text-strong)]">
              {maillon}
            </span>
            {i < chaine.maillons.length - 1 && (
              <ArrowRight
                size={14}
                className="hidden shrink-0 text-[color:var(--s-primary)] sm:block"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
      <p className="s-small mt-4">{chaine.note}</p>
    </div>
  )
}

/**
 * Une fonction : texte et listes à gauche, écran à droite.
 *
 * Le visuel passe à gauche un rang sur deux. Quatre blocs strictement
 * identiques font un catalogue ; l'alternance donne le rythme sans changer le
 * gabarit, donc sans empêcher de les comparer.
 */
function BlocFonction({ fonction, inverse }: { fonction: Fonction; inverse: boolean }) {
  return (
    <section id={fonction.id} className={`s-section ${surfaceClass(fonction.surface)}`}>
      <div className="s-wrap">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className={inverse ? 'lg:order-2' : ''}>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-[color:var(--s-primary-soft)] px-2.5 py-1 text-xs font-bold text-[color:var(--s-primary)]">
                {fonction.numero}
              </span>
              <span className="s-icon-tile s-icon-tile-soft !h-8 !w-8">
                <fonction.icon size={16} />
              </span>
              <Eyebrow>{fonction.label}</Eyebrow>
            </div>
            <h2 className="s-h2 mt-4">{fonction.titre}</h2>
            <p className="s-body s-measure mt-5">{fonction.intro}</p>
          </Reveal>

          <Reveal delay={STAGGER[1]} className={inverse ? 'lg:order-1' : ''}>
            {fonction.ecran}
          </Reveal>
        </div>

        <Reveal delay={STAGGER[2]} className="mt-10">
          <Chaine chaine={fonction.chaine} />
        </Reveal>
      </div>

    </section>
  )
}

export function FonctionnalitesPage() {
  return (
    <>
      <PageCover
        eyebrow="Fonctionnalités"
        title={
          <>
            Les fonctionnalités essentielles pour piloter{' '}
            <span className="text-[color:var(--s-primary)]">vos audits</span>
          </>
        }
        lead="Collecter, documenter, analyser, remédier : quatre fonctionnalités qui suivent l’ordre de la démarche et transforment les informations de votre organisation en décisions suivies."
        actions={
          <>
            <Link to="/inscription" className="s-btn s-btn-primary">
              Créer un compte <ArrowRight size={18} />
            </Link>
            <DemoButton />
            <Link to="/solution#livrables" className="s-btn s-btn-secondary">
              Voir les livrables
            </Link>
          </>
        }
        image="/images/produit/dashboard-laptop.jpg"
        imageAlt="Tableau de bord CYBERAS sur un ordinateur portable : score global, écarts et conformité par référentiel"
      />

      <BlocFonction fonction={FONCTIONS[0]} inverse={false} />

      {/* Les scans, juste après la collecte déclarative dont ils sont le
          contrepoint. Un questionnaire dit ce que l'organisation croit
          appliquer ; un scan dit ce que ses machines exposent. La section est à
          part plutôt que fondue dans la collecte : c'est la seule fonction où
          la plateforme va chercher la donnée elle-même, et la noyer dans une
          liste de sources en ferait une ligne parmi huit. */}
      <section id="scans" className={`s-section ${surfaceClass('navy')}`}>
        <div className="s-wrap">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="s-icon-tile">
                  <Radar size={20} />
                </span>
                <Eyebrow>Scans de vulnérabilités</Eyebrow>
              </div>
              <h2 className="s-h2 mt-4">Ce que vous déclarez, et ce que vos machines exposent</h2>
              <p className="s-body s-measure mt-5">
                Le questionnaire dit ce que l’organisation applique ; le scan dit ce qui est
                réellement exposé. CYBERAS confronte les deux, et l’écart entre le déclaré et le
                constaté devient une information à part entière.
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {SCANS.map((s) => (
                  <li key={s.nom} className="s-card s-card-dark flex gap-3 p-4">
                    <span className="s-icon-tile s-icon-tile-soft !h-9 !w-9 shrink-0">
                      <s.icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-[color:var(--s-text-strong)]">
                        {s.nom}
                      </p>
                      <p className="s-small mt-0.5 leading-snug">{s.texte}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* L'autorisation n'est pas une mention légale posée en bas de
                  page : c'est une condition technique, vérifiée par le serveur
                  avant l'exécution. Elle se lit donc avec le reste. */}
              <p className="s-small mt-6 flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[color:var(--s-success)]"
                  aria-hidden="true"
                />
                Un scan ne part que sur une cible que vous avez déclarée et que vous êtes autorisé à
                tester. Toute autre est refusée par le serveur : l’autorisation est une condition
                d’exécution, pas une case à cocher.
              </p>
            </Reveal>

            <Reveal delay={STAGGER[1]}>
              <EcranScans />
            </Reveal>
          </div>
        </div>
      </section>

      <BlocFonction fonction={FONCTIONS[1]} inverse={true} />
      <BlocFonction fonction={FONCTIONS[2]} inverse={false} />

      {/* Les trois niveaux de lecture appartiennent à l'analyse, mais n'entrent
          pas dans son gabarit : ce sont des publics, pas des objets manipulés. */}
      <section className={`s-section ${surfaceClass('soft')}`}>
        <div className="s-wrap">
          <SectionHead
            eyebrow="Tableaux de bord"
            title="Trois niveaux de lecture, un même jeu de résultats"
            lead="Les mêmes données se présentent différemment selon qui les regarde. Un tableau unique obligerait la direction à traverser le détail des contrôles, et le responsable de contrôle à deviner ce qui le concerne."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PUBLICS.map((p, i) => (
              <Reveal key={p.role} delay={STAGGER[i]}>
                <article className="s-card flex h-full flex-col">
                  <span className="s-icon-tile s-icon-tile-soft !h-10 !w-10">
                    <p.icon size={18} />
                  </span>
                  <h3 className="mt-4 text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                    {p.role}
                  </h3>
                  <p className="s-small mt-2 flex-1">{p.besoin}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <BlocFonction fonction={FONCTIONS[3]} inverse={true} />

      {/* Les trois horizons de priorisation, pour la même raison : ce sont des
          décisions, pas des champs de formulaire. */}
      <section className={`s-section ${surfaceClass('navy')}`}>
        <div className="s-wrap">
          <SectionHead
            eyebrow="Priorisation"
            title="Distinguer ce qui presse de ce qui peut attendre"
            lead="Les actions sont priorisées selon l’écart, le risque, la criticité et le contexte de l’organisation."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HORIZONS.map((h, i) => (
              <Reveal key={h.quand} delay={STAGGER[i]}>
                <article
                  className="s-card s-card-dark flex h-full flex-col border-l-4"
                  style={{ borderLeftColor: h.ton }}
                >
                  <span className="s-icon-tile">
                    <h.icon size={20} />
                  </span>
                  <h3 className="mt-4 text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                    {h.quand}
                  </h3>
                  <p className="s-small mt-2 flex-1">{h.quoi}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={STAGGER[3]} className="mt-10 flex items-center justify-center gap-2">
            <ArrowDown size={16} className="text-[color:var(--s-primary)]" aria-hidden="true" />
            <p className="s-small">
              Les résultats reviennent ensuite dans l’évaluation suivante, et le cycle recommence.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Découvrez CYBERAS en action"
        lead="Demandez une démonstration et voyez comment la plateforme s’intègre à votre pilotage de la cybersécurité."
        primary={{ label: 'Nous contacter', to: '/contact' }}
        secondaryAction={<DemoButton />}
      />
    </>
  )
}
