import { Link } from 'react-router-dom'
import {
  Newspaper,
  BookOpen,
  FileText,
  ChevronDown,
  ArrowRight,
  Library,
  HelpCircle,
  GraduationCap,
  Building2,
  Server,
  Users,
  ScrollText,
  Lock,
  Layers,
  Target,
  BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Reveal,
  Eyebrow,
  PageCover,
  SectionHead,
  CtaBand,
  STAGGER,
} from '../../components/marketing/SiteKit'
import { ReferentielsGrid } from '../../components/marketing/ReferentielsGrid'

/**
 * Page « Ressources ».
 *
 * <p>Le reste du site sert à comprendre vite ; cette page sert à approfondir.
 * C'est donc la seule où le détail est le bienvenu. Elle n'a pas à être longue
 * pour autant : elle l'était de dix rubriques, dont deux vides qui annonçaient
 * la même chose que deux autres. Les Études rejoignent les Articles, les
 * Concepts rejoignent les Référentiels, et la Documentation passe de huit
 * cartes à une liste, parce que huit cartes pour huit liens font une grille là
 * où il ne fallait qu'un sommaire.
 *
 * <p>La couverture et les images suivent « Solutions par secteur », qui a
 * établi la forme : photo réelle en couverture, photos dans les cartes,
 * logos partout où un référentiel est nommé. Un référentiel cité sans son
 * logo demande au lecteur de reconnaître un sigle ; avec, il le reconnaît.
 *
 * <p>Les ancres `articles`, `guides`, `referentiels`, `documentation`, `faq` et
 * `formation` sont celles que le panneau déroulant annonce dans siteNav.ts. Les
 * renommer casserait le menu sans rien signaler à la compilation.
 *
 * <p>Règle tenue partout ici : rien n'est affirmé qui ne soit vérifiable dans
 * le produit. Ce qui n'existe pas encore est montré comme un emplacement, pas
 * comme un contenu : une carte vide se comble, une fausse carte se croit.
 */

/* -------------------------------------------------------------------------- */
/* Sommaire                                                                    */
/* -------------------------------------------------------------------------- */

const SOMMAIRE: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '#articles', label: 'Articles & analyses', icon: Newspaper },
  { to: '#guides', label: 'Guides', icon: BookOpen },
  { to: '#referentiels', label: 'Référentiels & concepts', icon: Library },
  { to: '#documentation', label: 'Documentation', icon: FileText },
  { to: '#faq', label: 'FAQ', icon: HelpCircle },
  { to: '#formation', label: 'Formation', icon: GraduationCap },
]

/* -------------------------------------------------------------------------- */
/* Articles & analyses                                                         */
/* -------------------------------------------------------------------------- */

/** Les sujets que la rubrique couvrira. Ce sont des thèmes, pas des promesses de titres. */
const SUJETS_ARTICLES = [
  'Audit',
  'Risques',
  'Conformité',
  'Nouvelles menaces',
  'Technologies',
  'Gouvernance',
]

/**
 * Les emplacements de la rubrique.
 *
 * Trois, et non cinq : les deux emplacements d'« Études & analyses » disaient
 * exactement ce que disent ceux-ci, sur une section à part. Deux rubriques
 * vides valent moins qu'une.
 */
const EMPLACEMENTS: { categorie: string; image: string; alt: string }[] = [
  {
    categorie: 'Audit et conformité',
    image: '/images/datacenter.jpg',
    alt: 'Allée de baies dans un centre de données',
  },
  {
    categorie: 'Risques et menaces',
    image: '/images/cyber.jpg',
    alt: 'Écran de supervision de sécurité',
  },
  {
    categorie: 'Maturité et écarts observés',
    image: '/images/soc.jpg',
    alt: 'Centre opérationnel de sécurité en activité',
  },
]

/* -------------------------------------------------------------------------- */
/* Guides                                                                      */
/* -------------------------------------------------------------------------- */

const GUIDES: { titre: string; texte: string }[] = [
  {
    titre: 'Préparer une évaluation',
    texte: 'Cadrer les objectifs, identifier les interlocuteurs et réunir ce qui sera demandé.',
  },
  {
    titre: 'Collecter les preuves',
    texte: 'Savoir quelle pièce justifie quoi, et la rattacher au contrôle qu’elle documente.',
  },
  {
    titre: 'Gérer les risques',
    texte: 'Passer d’un écart constaté à un risque qualifié, situé et priorisé.',
  },
  {
    titre: 'Conduire la remédiation',
    texte: 'Transformer une recommandation en action tenue par quelqu’un, avec une échéance.',
  },
  {
    titre: 'Structurer la gouvernance',
    texte: 'Répartir les rôles, les responsabilités et les décisions autour de la sécurité.',
  },
  {
    titre: 'Sécurité technique',
    texte: 'Les mesures techniques les plus souvent en écart, et ce qu’elles supposent en amont.',
  },
]

/* -------------------------------------------------------------------------- */
/* Référentiels & concepts                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Les cinq dimensions d'analyse.
 *
 * <p>Reprises de {@code DomainFamily}. La dimension physique est déclarée mais
 * aucune question ne la renseigne encore : le serveur la restitue « non
 * évaluée », et la page le dit plutôt que de laisser croire à une couverture
 * complète. Une famille absente ne se remarque pas ; une famille vide se voit.
 */
const DIMENSIONS: { nom: string; texte: string; evaluee: boolean; icon: LucideIcon }[] = [
  {
    nom: 'Organisationnel',
    icon: Building2,
    texte: 'Stratégie, gouvernance, suivi, incidents, actifs et fournisseurs.',
    evaluee: true,
  },
  {
    nom: 'Technique',
    icon: Server,
    texte: 'Infrastructure, réseau, identités, applications, sauvegardes.',
    evaluee: true,
  },
  { nom: 'Humain', icon: Users, texte: 'Sensibilisation, pratiques et comportements.', evaluee: true },
  {
    nom: 'Conformité',
    icon: ScrollText,
    texte: 'Exigences externes, politiques, données personnelles.',
    evaluee: true,
  },
  { nom: 'Physique', icon: Lock, texte: 'Locaux, équipements et sécurité physique.', evaluee: false },
]

/**
 * Les trois principes, repris des pages Solution et Suivi.
 *
 * Ils formaient une rubrique à eux seuls, entre les Référentiels qu'ils
 * expliquent et la Documentation qui les recense. Rattachés au socle, ils
 * disent ce que la grille de logos montre sans le dire.
 */
const CONCEPTS: { titre: string; texte: string; icon: LucideIcon; to: string }[] = [
  {
    titre: 'Le socle unifié',
    icon: Layers,
    to: '/solution#socle',
    texte:
      'Une même mesure de sécurité est exploitée dans plusieurs cadres d’évaluation : les travaux déjà réalisés sont capitalisés, la duplication est évitée et les résultats se consolident.',
  },
  {
    titre: 'De l’évaluation à la décision',
    icon: BarChart3,
    to: '/suivi',
    texte:
      'Les résultats obtenus deviennent une base pour comprendre les risques, définir les priorités et orienter les décisions.',
  },
  {
    titre: 'De la décision à l’action',
    icon: Target,
    to: '/methodologie',
    texte:
      'L’audit passe d’un exercice ponctuel à une démarche continue de pilotage et d’amélioration de la cybersécurité.',
  },
]

/* -------------------------------------------------------------------------- */
/* Documentation                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Entrées de documentation.
 *
 * Celles qui ont une destination réelle sont des liens ; les autres restent
 * annoncées mais inertes. Un lien qui ne mène nulle part coûte plus cher en
 * confiance qu'une entrée qui dit franchement « à venir ».
 *
 * En liste et non plus en cartes : huit cartes pour huit liens faisaient une
 * grille de la hauteur d'un écran là où il ne fallait qu'un sommaire.
 */
const DOCUMENTATION: { titre: string; texte: string; to?: string }[] = [
  {
    titre: 'Présentation de la plateforme',
    texte: 'Ce que CYBERAS fait, pour qui, et ce qu’il produit.',
    to: '/solution',
  },
  {
    titre: 'Fonctionnalités',
    texte: 'Le détail des fonctions disponibles, domaine par domaine.',
    to: '/fonctionnalites',
  },
  {
    titre: 'Solutions par secteur',
    texte: 'Les prestations d’audit et ce qu’elles couvrent, secteur par secteur.',
    to: '/solutions',
  },
  {
    titre: 'Méthodologie',
    texte: 'La méthode d’audit, les cadres de référence et les étapes d’une mission.',
    to: '/methodologie',
  },
  {
    titre: 'Le catalogue des référentiels',
    texte: 'Une vingtaine de cadres classés par famille, avec leur objet et leur public.',
    to: '/referentiels',
  },
  { titre: 'Guides d’utilisation', texte: 'Prise en main des écrans d’évaluation et de suivi.' },
  { titre: 'Documentation technique', texte: 'Intégration, interfaces et éléments techniques.' },
]

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Questions fréquentes.
 *
 * Chaque réponse ne dit que ce qui est vérifié dans le produit. Une FAQ qui
 * extrapole se retourne contre le produit au premier essai, parce que c'est
 * exactement la page que le visiteur relit quand il est déçu.
 */
const FAQ: { question: string; reponse: string }[] = [
  {
    question: 'Comment fonctionne une évaluation CYBERAS ?',
    reponse:
      'L’évaluation repose sur des questionnaires structurés. Chaque réponse déclare un niveau de maturité et peut être étayée par des pièces justificatives. Les résultats alimentent ensuite les scores, les risques et les recommandations.',
  },
  {
    question: 'Comment les questionnaires sont-ils organisés ?',
    reponse:
      'Ils sont organisés en cinq dimensions : Organisationnel, Conformité, Technique, Humain et Physique. Chaque réponse déclare un niveau de maturité de 0 à 4.',
  },
  {
    question: 'Comment le score est-il calculé ?',
    reponse:
      'Le score est une moyenne pondérée par domaine. Il se lit donc aussi bien globalement que domaine par domaine.',
  },
  {
    question: 'Que deviennent les documents que je dépose ?',
    reponse:
      'Les pièces justificatives sont rattachées aux réponses qu’elles étayent, et elles figurent dans le rapport final parmi les pièces.',
  },
  {
    question: 'Sur quelles cibles un scan technique peut-il être lancé ?',
    reponse:
      'Uniquement sur une cible préalablement déclarée et autorisée. Toute autre cible est refusée par le serveur : l’autorisation n’est pas une case à cocher, c’est une condition technique.',
  },
  {
    question: 'Que contient le rapport ?',
    reponse:
      'Une synthèse, une lecture par famille, un détail par domaine, la conformité par référentiel, une cartographie des risques, les recommandations, les pièces et la méthodologie.',
  },
  {
    question: 'Comment les recommandations sont-elles suivies ?',
    reponse:
      'Chaque recommandation porte un responsable, une échéance et un statut. C’est ce qui permet de suivre la remédiation plutôt que de la constater.',
  },
  {
    question: 'Quelle offre choisir ?',
    reponse:
      'Les offres et leurs différences sont présentées sur la page Offres. Une démonstration permet de les confronter à votre contexte avant de trancher.',
  },
]

/* -------------------------------------------------------------------------- */
/* Fragments de rendu                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Carte d'emplacement : un contenu annoncé qui n'existe pas encore.
 *
 * Elle prend la forme qu'aura la carte publiée, photo comprise, pour que la
 * rubrique ne change pas de silhouette le jour où elle se remplit. La photo
 * est réelle et non un aplat : une vignette grise annonce un contenu gris.
 */
function Emplacement({ categorie, image, alt }: { categorie: string; image: string; alt: string }) {
  return (
    <article className="s-card s-card-hover flex h-full flex-col overflow-hidden !p-0">
      <div className="s-sector-media relative">
        <img src={image} alt={alt} width={1536} height={1024} loading="lazy" />
        <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          À venir
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-[color:var(--s-text-strong)]">{categorie}</h3>
        <p className="s-small mt-2 flex-1">
          Cet emplacement accueillera un contenu dès sa publication.
        </p>
      </div>
    </article>
  )
}

export function RessourcesPage() {
  return (
    <>
      <PageCover
        eyebrow="Ressources"
        title={
          <>
            Comprendre, approfondir,{' '}
            <span className="text-[color:var(--s-primary)]">décider</span>
          </>
        }
        lead="Des repères clairs et fiables sur les méthodes, les référentiels, la documentation et les bonnes pratiques pour renforcer votre cybersécurité."
        actions={
          <>
            <Link to="/evaluation" className="s-btn s-btn-primary">
              Lancer une évaluation <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="s-btn s-btn-secondary">
              Demander une démo
            </Link>
          </>
        }
        image="/images/cyber.jpg"
        imageAlt="Console de supervision de cybersécurité, graphiques et alertes en cours de lecture"
        flottant={{
          icon: <BookOpen size={22} />,
          texte:
            'Méthodes, référentiels, bonnes pratiques, documentation et formation, réunis en une page.',
        }}
        reperes={['Six référentiels couverts', 'Cinq dimensions d’analyse', 'Méthode explicable']}
      />

      {/* Sommaire. Des liens d'ancre simples : la page reste la plus longue du
          site, et le visiteur doit pouvoir viser la rubrique qui l'intéresse
          sans dérouler tout le reste. */}
      <section className="s-surface-alt py-8">
        <div className="s-wrap">
          <Reveal>
            <nav aria-label="Sommaire des rubriques">
              <ul className="flex flex-wrap gap-2">
                {SOMMAIRE.map((entree) => (
                  <li key={entree.to}>
                    <a
                      href={entree.to}
                      className="s-badge inline-flex items-center gap-2 hover:border-[color:var(--s-primary)]"
                    >
                      <entree.icon
                        size={14}
                        className="text-[color:var(--s-primary)]"
                        aria-hidden="true"
                      />
                      {entree.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Articles & analyses                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section id="articles" className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Articles & analyses"
            title="Analyses et actualités en cybersécurité"
            lead="Des analyses sur l’audit, les risques, la conformité, les nouvelles menaces, les technologies et la gouvernance de la sécurité."
          />

          <Reveal delay={STAGGER[1]} className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {SUJETS_ARTICLES.map((sujet) => (
                <li key={sujet} className="s-tag">
                  {sujet}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Aucun article n'est publié à ce jour. Des emplacements plutôt que
              de faux titres avec de fausses dates : l'attente est une
              information honnête, l'invention n'en est pas une. */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {EMPLACEMENTS.map((e, i) => (
              <Reveal key={e.categorie} delay={STAGGER[i]}>
                <Emplacement categorie={e.categorie} image={e.image} alt={e.alt} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={STAGGER[3]} className="mt-8">
            <p className="s-small s-measure">
              Aucun article n’est encore publié. Pour être prévenu des premières parutions,{' '}
              <Link to="/contact" className="s-link align-baseline">
                écrivez-nous
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Guides                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section id="guides" className="s-section s-surface-alt">
        <div className="s-wrap">
          {/* En-tête à deux colonnes, la photo à droite : c'est la forme
              établie par « Solutions par secteur », et elle ouvre la rubrique
              sans lui coûter la hauteur d'un bandeau pleine largeur. */}
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal>
              <Eyebrow>Guides & bonnes pratiques</Eyebrow>
              <h2 className="s-h2 mt-4">Des guides concrets pour passer à l’action</h2>
              <p className="s-lead s-measure mt-5">
                Six sujets, du cadrage d’une évaluation jusqu’au suivi de la remédiation. Chacun
                répond à une question que les équipes se posent au moment de commencer.
              </p>
              <span className="s-badge mt-6 inline-flex">Guides en préparation</span>
            </Reveal>
            <Reveal delay={STAGGER[1]}>
              <div className="s-hero-visual">
                <img
                  src="/images/reunion.jpg"
                  alt="Réunion de travail autour d’un tableau, équipe en train de cadrer une démarche"
                  width={1536}
                  height={1024}
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide, i) => (
              <Reveal key={guide.titre} delay={STAGGER[i % 3]}>
                <article className="s-card s-card-hover flex h-full gap-3 p-4">
                  <span className="s-icon-tile s-icon-tile-soft !h-10 !w-10 shrink-0">
                    <BookOpen size={18} />
                  </span>
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                      {guide.titre}
                    </h3>
                    <p className="s-small mt-1">{guide.texte}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Référentiels & concepts                                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="referentiels" className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Référentiels & concepts"
            title="Plusieurs référentiels, un seul socle de contrôles"
            lead="Les exigences de ces cadres sont rapprochées au sein d’un socle commun. Une mesure évaluée une fois alimente tous ceux qui la réclament."
            action={{ label: 'Voir le catalogue complet', to: '/referentiels' }}
          />

          {/* La grille porte les logos des organismes. Nommer un référentiel
              sans le montrer demande au lecteur de reconnaître un sigle ; avec
              le logo, il le reconnaît. */}
          <div className="mt-10">
            <ReferentielsGrid />
          </div>

          {/* Les cinq dimensions. La physique est déclarée mais aucune question
              ne la renseigne encore : le serveur la restitue « non évaluée ».
              La page le dit, plutôt que de la compter comme les autres. */}
          <Reveal className="mt-16">
            <h3 className="s-h3">Cinq dimensions d’analyse</h3>
            <p className="s-small s-measure mt-3">
              Chaque contrôle du socle est rattaché à l’une de ces dimensions, et le score se lit
              dimension par dimension.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DIMENSIONS.map((d, i) => (
              <Reveal key={d.nom} delay={STAGGER[i % STAGGER.length]}>
                <article className="s-card s-card-metric flex h-full flex-col p-4">
                  <span className="s-icon-tile s-icon-tile-soft !h-10 !w-10">
                    <d.icon size={18} />
                  </span>
                  <h4 className="mt-3 text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                    {d.nom}
                  </h4>
                  <p className="s-small mt-1 flex-1">{d.texte}</p>
                  {!d.evaluee && (
                    <span className="s-badge mt-3 self-start">Pas encore questionnée</span>
                  )}
                </article>
              </Reveal>
            ))}
          </div>

          {/* Les trois principes, rattachés au socle qu'ils expliquent plutôt
              qu'isolés dans une rubrique à eux. */}
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {CONCEPTS.map((c, i) => (
              <Reveal key={c.titre} delay={STAGGER[i]}>
                <article className="s-card s-card-metric flex h-full flex-col">
                  <span className="s-icon-tile s-icon-tile-soft !h-10 !w-10">
                    <c.icon size={18} />
                  </span>
                  <h3 className="mt-3 text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                    {c.titre}
                  </h3>
                  <p className="s-small mt-2 flex-1">{c.texte}</p>
                  <Link to={c.to} className="s-link mt-4 text-sm">
                    En savoir plus <ArrowRight size={14} />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Documentation                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="documentation" className="s-section s-surface-alt">
        <div className="s-wrap">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow>Documentation</Eyebrow>
              <h2 className="s-h2 mt-4">Toute la documentation à portée de main</h2>
              <p className="s-lead s-measure mt-5">
                Les supports et ressources pour exploiter pleinement la plateforme, sa méthode et son
                vocabulaire.
              </p>
              <div className="s-hero-visual mt-8 hidden lg:block">
                <img
                  src="/images/equipe.jpg"
                  alt="Deux personnes consultant une documentation sur un écran"
                  width={1536}
                  height={1024}
                  loading="lazy"
                />
              </div>
            </Reveal>

            {/* En liste et non en cartes : huit cartes pour huit liens
                faisaient une grille de la hauteur d'un écran là où il ne
                fallait qu'un sommaire. */}
            <div className="divide-y divide-[color:var(--s-border)] overflow-hidden rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)]">
              {DOCUMENTATION.map((entree) => {
                const contenu = (
                  <>
                    <FileText
                      size={18}
                      className="mt-0.5 shrink-0 text-[color:var(--s-primary)]"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                        {entree.titre}
                      </span>
                      <span className="s-small mt-0.5 block">{entree.texte}</span>
                    </span>
                    {entree.to ? (
                      <ArrowRight
                        size={16}
                        className="mt-1 shrink-0 text-[color:var(--s-primary)]"
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="s-badge mt-0.5 shrink-0">À venir</span>
                    )}
                  </>
                )

                return entree.to ? (
                  <Link
                    key={entree.titre}
                    to={entree.to}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[color:var(--s-bg-alt)]"
                  >
                    {contenu}
                  </Link>
                ) : (
                  <div key={entree.titre} className="flex items-start gap-3 px-5 py-4">
                    {contenu}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section id="faq" className="s-section s-surface-white">
        <div className="s-wrap">
          {/* Deux colonnes : l'en-tête reste visible pendant qu'on parcourt les
              huit questions. Empilé au-dessus, il quittait l'écran dès la
              troisième, et l'on ne savait plus dans quelle rubrique on lisait. */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Eyebrow>FAQ</Eyebrow>
                <h2 className="s-h2 mt-4">Les réponses à vos questions</h2>
                <p className="s-lead s-measure mt-5">
                  Fonctionnement, évaluations, données, questionnaires, scans, rapports et offres.
                </p>
                <Link to="/contact" className="s-btn s-btn-secondary mt-8">
                  Poser une question <ArrowRight size={16} />
                </Link>
              </Reveal>
            </div>

            {/* <details> natif plutôt qu'un accordéon à état : le navigateur gère
                l'ouverture, le clavier et la recherche dans la page, et la
                rubrique reste lisible même si le JavaScript ne s'exécute pas. */}
            <div className="grid gap-3">
              {FAQ.map((item, i) => (
                <Reveal key={item.question} delay={STAGGER[Math.min(i, STAGGER.length - 1)]}>
                  <details className="s-card group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)] [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <ChevronDown
                        size={18}
                        className="shrink-0 text-[color:var(--s-primary)] transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="s-small mt-4 border-t border-[color:var(--s-border)] pt-4">
                      {item.reponse}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Formation                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="formation" className="s-section s-surface-alt">
        <div className="s-wrap">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal>
              <Eyebrow>Formation</Eyebrow>
              <h2 className="s-h2 mt-4">Une évaluation ne vaut que si elle est comprise</h2>
              <p className="s-body s-measure mt-6">
                La formation CYBERAS accompagne les organisations dans la lecture de leurs résultats,
                l’interprétation des constats et la conduite de la remédiation. Elle a sa propre
                page.
              </p>
              <Link to="/formation" className="s-btn s-btn-primary mt-8">
                Découvrir la formation <ArrowRight size={18} />
              </Link>
            </Reveal>
            <Reveal delay={STAGGER[1]}>
              <div className="s-hero-visual">
                <img
                  src="/images/formation.jpg"
                  alt="Session de formation en salle, participants devant un écran de présentation"
                  width={1536}
                  height={1024}
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand
        title="Besoin d’aller plus loin sur votre contexte ?"
        lead="Lancez une évaluation, ou demandez une démonstration pour confronter la plateforme à votre organisation."
        primary={{ label: 'Lancer une évaluation', to: '/evaluation' }}
        secondary={{ label: 'Demander une démo', to: '/demo' }}
      />
    </>
  )
}
