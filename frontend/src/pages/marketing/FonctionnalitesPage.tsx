import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  CalendarClock,
  UserPlus,
  Activity,
  ListChecks,
  ShieldCheck,
  MessageSquare,
  Gauge,
  FileText,
  History,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Map,
  CheckCircle2,
  Users,
  KeyRound,
  UserCheck,
  Timer,
  Boxes,
  Lock,
  ScrollText,
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
import { ReferentielsGrid } from '../../components/marketing/ReferentielsGrid'

/**
 * Page « Fonctionnalités ».
 *
 * <p>Six domaines, un paragraphe chacun. La page dit ce que la plateforme
 * permet de faire, pas comment s'en servir : dès qu'un bloc prend trois
 * paragraphes, la page devient une documentation que personne ne lit avant
 * d'avoir acheté.
 *
 * <p>Tous les domaines partagent désormais la même composition : le numéro et
 * le titre à gauche, les objets manipulés en tuiles dessous, l'écran
 * correspondant à droite. La version précédente changeait de forme à chaque
 * domaine pour éviter la monotonie ; le résultat était qu'on ne savait plus si
 * deux blocs disaient la même chose sous deux mises en page, ou deux choses
 * différentes. La numérotation fait le travail que la variété faisait mal :
 * elle sépare sans déguiser.
 *
 * <p>Les écrans de droite sont dessinés en balises, pas photographiés. Une
 * capture d'écran vieillit à la première retouche d'interface et se lit mal sur
 * téléphone ; une maquette en balises suit les jetons de la charte, reste nette
 * à toute densité et ne promet que ce que les libellés disent.
 *
 * <p>Les ancres sont celles déclarées dans siteNav.ts. Elles manquaient
 * entièrement : le menu pointait sur `#audits`, `#controles`, `#preuves`,
 * `#tableaux-de-bord` et `#collaboration`, et aucune n'existait dans la page.
 */

/* -------------------------------------------------------------------------- */
/* Domaines                                                                    */
/* -------------------------------------------------------------------------- */

interface Tuile {
  icon: LucideIcon
  nom: string
  legende: string
}

interface Domaine {
  id: string
  numero: string
  label: string
  title: string
  text: string
  tuiles: Tuile[]
  /**
   * Où va le visiteur convaincu par ce domaine.
   *
   * Chaque destination existe réellement : aucune n'a été inventée pour
   * meubler la ligne.
   */
  lien: { label: string; to: string }
  surface: Surface
  /** L'écran de droite. Toujours présent : un domaine sans écran paraît moins réel. */
  panneau: React.ReactNode
}

/* -------------------------------------------------------------------------- */
/* Maquettes d'écran                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Cadre commun des maquettes.
 *
 * Barre de titre, filtres, contenu. Les six écrans de la page en héritent pour
 * qu'on les reconnaisse comme six vues d'un même produit, et non comme six
 * illustrations rassemblées.
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

/** Pastille d'état. Les trois tons sont ceux du produit, pas des couleurs libres. */
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

function EcranCampagnes() {
  const lignes = [
    { nom: 'Audit SI', ref: 'ISO 27001', etat: 'En cours', ton: 'var(--s-primary)', pct: 60 },
    { nom: 'Évaluation siège', ref: 'NIST CSF', etat: 'Planifié', ton: 'var(--s-warning)', pct: 0 },
    { nom: 'Fournisseurs', ref: 'CIS v8', etat: 'En cours', ton: 'var(--s-primary)', pct: 35 },
    { nom: 'Audit interne', ref: 'COBIT', etat: 'Terminé', ton: 'var(--s-success)', pct: 100 },
  ]
  return (
    <Ecran
      titre="Campagnes d’évaluation"
      action="Nouvelle campagne"
      filtres={['Toutes', 'En cours', 'Planifiées', 'Terminées']}
    >
      <div className="space-y-2">
        {lignes.map((l) => (
          <div
            key={l.nom}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--s-border)] px-3 py-2.5"
          >
            <span className="flex-1 truncate text-xs font-medium text-[color:var(--s-text-strong)]">
              {l.nom}
            </span>
            <span className="hidden shrink-0 text-[0.6875rem] text-[color:var(--s-text-muted)] sm:block">
              {l.ref}
            </span>
            <Etat valeur={l.etat} ton={l.ton} />
            <span className="w-16 shrink-0">
              <span className="block h-1.5 overflow-hidden rounded-full bg-[color:var(--s-bg-alt)]">
                <span
                  className="block h-full rounded-full bg-[color:var(--s-primary)]"
                  style={{ width: `${l.pct}%` }}
                />
              </span>
            </span>
          </div>
        ))}
      </div>
    </Ecran>
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

function EcranPreuves() {
  const lignes = [
    { nom: 'Politique de sécurité', ctrl: 'A.5.1', etat: 'Vérifiée', ton: 'var(--s-success)' },
    { nom: 'Rapport d’audit interne', ctrl: 'A.5.35', etat: 'Vérifiée', ton: 'var(--s-success)' },
    { nom: 'Plan de continuité', ctrl: 'A.5.29', etat: 'À vérifier', ton: 'var(--s-warning)' },
    { nom: 'Capture de configuration', ctrl: 'A.8.9', etat: 'Vérifiée', ton: 'var(--s-success)' },
  ]
  return (
    <Ecran
      titre="Preuves"
      action="Ajouter une preuve"
      filtres={['Toutes', 'Vérifiées', 'À vérifier']}
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
    { nom: 'Sauvegarder les configurations', resp: 'Infra', etat: 'À faire', ton: 'var(--s-warning)' },
    { nom: 'Former les équipes', resp: 'RH', etat: 'Terminée', ton: 'var(--s-success)' },
  ]
  return (
    <Ecran titre="Suivi des actions" action="Nouvelle action" filtres={['Toutes', 'Mes actions']}>
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

const DOMAINES: Domaine[] = [
  {
    id: 'audits',
    numero: '01',
    label: 'Audits & campagnes',
    title: 'Organisez vos audits simplement',
    text: 'Créez vos campagnes d’évaluation, définissez leur périmètre et suivez leur avancement depuis un espace centralisé.',
    tuiles: [
      { icon: ClipboardList, nom: 'Créer', legende: 'Configurez vos campagnes' },
      { icon: CalendarClock, nom: 'Planifier', legende: 'Définissez les échéances' },
      { icon: UserPlus, nom: 'Affecter', legende: 'Attribuez aux évaluateurs' },
      { icon: Activity, nom: 'Suivre', legende: 'Suivez l’avancement' },
    ],
    lien: { label: 'Lancer une évaluation', to: '/evaluation' },
    surface: 'soft',
    panneau: <EcranCampagnes />,
  },
  {
    id: 'controles',
    numero: '02',
    label: 'Contrôles & questionnaires',
    title: 'Évaluez chaque contrôle avec méthode',
    text: 'Construisez vos questionnaires, affectez les contrôles aux évaluateurs et centralisez les réponses dans une interface structurée.',
    tuiles: [
      { icon: ListChecks, nom: 'Questionnaires', legende: 'Modèles prédéfinis' },
      { icon: ShieldCheck, nom: 'Contrôles', legende: 'Par référentiel' },
      { icon: MessageSquare, nom: 'Réponses', legende: 'Centralisées' },
      { icon: Gauge, nom: 'Scores', legende: 'Calculés au fil de l’eau' },
    ],
    lien: { label: 'Les référentiels couverts', to: '/ressources#referentiels' },
    surface: 'white',
    panneau: <EcranQuestionnaire />,
  },
  {
    id: 'preuves',
    numero: '03',
    label: 'Preuves & conformité',
    title: 'Gardez chaque élément sous contrôle',
    text: 'Associez les preuves aux contrôles évalués et conservez une traçabilité claire des éléments utilisés pour justifier les résultats.',
    tuiles: [
      { icon: FileText, nom: 'Preuves', legende: 'Rattachées aux contrôles' },
      { icon: MessageSquare, nom: 'Commentaires', legende: 'Échanges et arbitrages' },
      { icon: AlertTriangle, nom: 'Écarts', legende: 'Déclaré contre démontré' },
      { icon: History, nom: 'Traçabilité', legende: 'Historique complet' },
    ],
    lien: { label: 'La documentation', to: '/ressources#documentation' },
    surface: 'alt',
    panneau: <EcranPreuves />,
  },
  {
    id: 'tableaux-de-bord',
    numero: '04',
    label: 'Tableaux de bord',
    title: 'Visualisez ce qui compte',
    text: 'Suivez les indicateurs essentiels de vos audits à travers des tableaux de bord clairs et directement exploitables.',
    tuiles: [
      { icon: BarChart3, nom: 'Scores', legende: 'Global et par domaine' },
      { icon: TrendingUp, nom: 'Maturité', legende: 'Évolution dans le temps' },
      { icon: AlertTriangle, nom: 'Écarts', legende: 'Critiques et prioritaires' },
      { icon: Map, nom: 'Risques', legende: 'Cartographie intégrée' },
      { icon: CheckCircle2, nom: 'Progression', legende: 'Suivi des actions' },
    ],
    lien: { label: 'Voir les livrables', to: '/solution#resultats' },
    surface: 'white',
    panneau: <VisualPosture />,
  },
  {
    id: 'collaboration',
    numero: '05',
    label: 'Collaboration & suivi',
    title: 'Faites travailler les équipes ensemble',
    text: 'Attribuez les contrôles et les actions, suivez les responsabilités et facilitez la coordination entre les différents acteurs de vos audits.',
    tuiles: [
      { icon: Users, nom: 'Utilisateurs', legende: 'Gestion des accès' },
      { icon: KeyRound, nom: 'Rôles', legende: 'Droits et profils' },
      { icon: UserCheck, nom: 'Responsabilités', legende: 'Attribution claire' },
      { icon: CheckCircle2, nom: 'Actions', legende: 'Suivi et relances' },
      { icon: Timer, nom: 'Échéances', legende: 'Dates tenues' },
    ],
    lien: { label: 'Le suivi dans la durée', to: '/suivi' },
    surface: 'alt',
    panneau: <EcranSuivi />,
  },
]

/**
 * Les livrables produits par une mission.
 *
 * Ils clôturent la page parce que c'est ce qui reste quand la mission est
 * finie : les cinq domaines précédents décrivent le travail, celui-ci décrit
 * ce qu'on emporte.
 */
const LIVRABLES: { titre: string; points: string[] }[] = [
  {
    titre: 'Rapport d’évaluation',
    points: ['Résultats et écarts', 'Niveaux de conformité', 'Synthèse exécutive'],
  },
  {
    titre: 'Cartographie des risques',
    points: ['Risques identifiés', 'Probabilité et impact', 'Priorités de traitement'],
  },
  {
    titre: 'Plan de remédiation',
    points: ['Actions correctives', 'Responsables et échéances', 'Suivi d’avancement'],
  },
  {
    titre: 'Matrice de conformité',
    points: ['Exigences et contrôles', 'Conforme, partiel ou écart', 'Preuves associées'],
  },
  {
    titre: 'Tableau de bord de posture',
    points: ['Score global et maturité', 'Évolution dans le temps', 'Écarts et actions en cours'],
  },
]

/** Les trois garanties de l'en-tête. Elles répondent aux objections, pas aux besoins. */
const REPERES: Tuile[] = [
  { icon: Boxes, nom: 'Centralisée', legende: 'Tous vos audits au même endroit' },
  { icon: Lock, nom: 'Sécurisée', legende: 'Données protégées' },
  { icon: ScrollText, nom: 'Conforme', legende: 'Référentiels internationaux' },
]

/* -------------------------------------------------------------------------- */
/* Fragments de rendu                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Objet manipulé par un domaine.
 *
 * Icône, nom, légende. Les pilules de la version précédente ne portaient qu'un
 * mot : « Suivre », « Écarts », « Rôles » ne disent rien seuls, et six pilules
 * alignées se lisaient comme un nuage de mots-clés.
 */
function TuileObjet({ tuile }: { tuile: Tuile }) {
  return (
    /* Icône à gauche, texte à droite : empilée, chaque tuile prenait trois
       lignes, et six domaines de cinq tuiles ajoutaient un écran entier de
       hauteur à la page. En ligne, elles en prennent deux. */
    <div className="s-card flex gap-3 p-3.5">
      <span className="s-icon-tile s-icon-tile-soft !h-9 !w-9 shrink-0">
        <tuile.icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight text-[color:var(--s-text-strong)]">
          {tuile.nom}
        </p>
        <p className="s-small mt-0.5 leading-snug">{tuile.legende}</p>
      </div>
    </div>
  )
}

/**
 * Un domaine : texte et tuiles à gauche, écran à droite.
 *
 * Le visuel passe à gauche un rang sur deux. Cinq blocs strictement identiques
 * font un catalogue ; l'alternance suffit à donner le rythme que la variété de
 * gabarits donnait trop cher.
 */
function BlocDomaine({ domaine, inverse }: { domaine: Domaine; inverse: boolean }) {
  return (
    <section id={domaine.id} className={`s-section ${surfaceClass(domaine.surface)}`}>
      <div className="s-wrap">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className={inverse ? 'lg:order-2' : ''}>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-[color:var(--s-primary-soft)] px-2.5 py-1 text-xs font-bold text-[color:var(--s-primary)]">
                {domaine.numero}
              </span>
              <Eyebrow>{domaine.label}</Eyebrow>
            </div>
            <h2 className="s-h2 mt-4">{domaine.title}</h2>
            <p className="s-body s-measure mt-5">{domaine.text}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {domaine.tuiles.map((t) => (
                <TuileObjet key={t.nom} tuile={t} />
              ))}
            </div>

            <Link to={domaine.lien.to} className="s-link mt-8">
              {domaine.lien.label} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={STAGGER[1]} className={inverse ? 'lg:order-1' : ''}>
            {domaine.panneau}
          </Reveal>
        </div>
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
        lead="Une plateforme conçue pour organiser vos évaluations, centraliser les preuves, analyser vos résultats et transformer vos constats en actions mesurables."
        actions={
          <>
            <Link to="/demo" className="s-btn s-btn-primary">
              Demander une démonstration <ArrowRight size={18} />
            </Link>
            <Link to="#livrables" className="s-btn s-btn-secondary">
              Voir les livrables
            </Link>
          </>
        }
        image="/images/produit/dashboard-laptop.jpg"
        imageAlt="Tableau de bord CYBERAS sur un ordinateur portable : score global, écarts et conformité par référentiel"
        reperes={REPERES.map((r) => r.nom)}
      />

      {/* Les référentiels, avec le logo de chaque organisme. Une galerie de
          logos clients répondrait à la même question, mais elle demande
          l'accord écrit de chacun ; les cadres, eux, s'appuient sur ce que le
          catalogue déclare. Nommer un référentiel sans le montrer demande au
          lecteur de reconnaître un sigle ; avec le logo, il le reconnaît. */}
      <section className={`s-section ${surfaceClass('alt')}`}>
        <div className="s-wrap">
          <SectionHead
            eyebrow="Référentiels & standards"
            title="Les cadres sur lesquels vos évaluations s’appuient"
            lead="Les contrôles de chaque évaluation sont rapprochés des cadres que vos régulateurs, vos partenaires et vos assureurs connaissent."
            action={{ label: 'Le détail de chaque référentiel', to: '/ressources#referentiels' }}
          />
          <div className="mt-10">
            <ReferentielsGrid />
          </div>
        </div>
      </section>

      {DOMAINES.map((d, i) => (
        <BlocDomaine key={d.id} domaine={d} inverse={i % 2 === 1} />
      ))}

      {/* ------------------------------------------------------------------ */}
      {/* Livrables                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="livrables" className={`s-section ${surfaceClass('soft')}`}>
        <div className="s-wrap">
          <SectionHead
            eyebrow="06 · Livrables"
            title="Des livrables factuels et exploitables"
            lead="CYBERAS transforme les données d’évaluation en livrables structurés pour faciliter la prise de décision, la conformité et le pilotage de la cybersécurité."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {LIVRABLES.map((l, i) => (
              <Reveal key={l.titre} delay={STAGGER[i % STAGGER.length]}>
                <article className="s-card flex h-full flex-col">
                  <h3 className="text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                    {l.titre}
                  </h3>
                  <ul className="mt-4 flex-1 space-y-2">
                    {l.points.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-[color:var(--s-primary)]"
                          aria-hidden="true"
                        />
                        <span className="s-small">{p}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Aucun exemple n'est publié à ce jour. Un bouton « Voir un
              exemple » par carte mènerait cinq fois au même écran vide ; la
              démonstration, elle, existe. */}
          <Reveal delay={STAGGER[2]} className="mt-10">
            <p className="s-small s-measure">
              Ces livrables se voient mieux qu’ils ne se décrivent.{' '}
              <Link to="/demo" className="s-link align-baseline">
                Demandez-en la démonstration
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Découvrez CYBERAS en action"
        lead="Demandez une démonstration et découvrez comment la plateforme peut s’intégrer à votre processus de pilotage de la cybersécurité."
        primary={{ label: 'Demander une démo', to: '/demo' }}
        secondary={{ label: 'Nous contacter', to: '/contact' }}
      />
    </>
  )
}
