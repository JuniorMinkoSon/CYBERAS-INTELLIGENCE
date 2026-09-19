import { Link } from 'react-router-dom'
import {
  Newspaper,
  BookOpen,
  FileText,
  BarChart3,
  GraduationCap,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Reveal,
  Eyebrow,
  PageHead,
  SectionHead,
  CtaBand,
  STAGGER,
} from '../../components/marketing/SiteKit'

/**
 * Page « Ressources ».
 *
 * <p>Le reste du site sert à comprendre vite ; cette page sert à approfondir.
 * C'est donc la seule où le détail est le bienvenu, et la seule qui assume
 * d'être longue. D'où le sommaire en tête : sur une page dense, un visiteur qui
 * ne voit pas le plan croit avoir tout lu quand il a lu le premier tiers.
 *
 * <p>Les ancres `articles`, `guides`, `referentiels`, `documentation`, `faq` et
 * `etudes` sont celles que le panneau déroulant annonce dans siteNav.ts. Les
 * renommer casserait le menu sans rien signaler à la compilation.
 *
 * <p>Règle tenue partout ici : rien n'est affirmé qui ne soit vérifiable dans
 * le produit. Ce qui n'existe pas encore est montré comme un emplacement, pas
 * comme un contenu — une carte vide se comble, une fausse carte se croit.
 *
 * <p>La page se lit comme un journal, pas comme un catalogue. Deux moyens pour
 * cela, et aucun qui touche au texte : les rubriques alternent sur les quatre
 * surfaces — gris, blanc, bleu très clair, navy une seule fois — et les
 * Articles abandonnent la grille régulière pour un emplacement principal
 * flanqué de deux emplacements secondaires. Huit rubriques de même fond et de
 * même grille donnaient une page où l'on ne savait plus où l'on en était.
 */

/* -------------------------------------------------------------------------- */
/* Sommaire                                                                    */
/* -------------------------------------------------------------------------- */

const SOMMAIRE: { to: string; label: string }[] = [
  { to: '#articles', label: 'Articles' },
  { to: '#guides', label: 'Guides & bonnes pratiques' },
  { to: '#referentiels', label: 'Référentiels' },
  { to: '#concepts', label: 'Concepts' },
  { to: '#documentation', label: 'Documentation' },
  { to: '#faq', label: 'FAQ' },
  { to: '#etudes', label: 'Études & analyses' },
  { to: '#formation', label: 'Formation' },
]

/* -------------------------------------------------------------------------- */
/* Articles                                                                    */
/* -------------------------------------------------------------------------- */

/** Les sujets que la rubrique couvrira. Ce sont des thèmes, pas des promesses de titres. */
const SUJETS_ARTICLES = [
  'Audit',
  'Risques',
  'Conformité',
  'Cybersécurité',
  'Nouvelles menaces',
  'Technologies',
  'Gouvernance',
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
/* Référentiels                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Les référentiels du socle.
 *
 * <p>Repris de {@code FrameworkCatalog} côté serveur : ce sont ceux dont les
 * contrôles portent des correspondances dans le catalogue, et c'est ce qui
 * rend le socle unifié concret. Une réponse donnée une fois alimente les six.
 *
 * <p>La version est celle que le catalogue déclare. L'écrire ici plutôt que de
 * la sous-entendre évite d'annoncer une édition pour une autre : un client
 * certifié sur l'édition 2022 ne lit pas « ISO 27001 » de la même façon qu'un
 * prospect.
 */
const REFERENTIELS: { nom: string; version: string; texte: string }[] = [
  {
    nom: 'ISO/IEC 27001',
    version: '2022',
    texte: 'Système de management de la sécurité de l’information. Les 93 contrôles de l’Annexe A sont exploités.',
  },
  {
    nom: 'ISO/IEC 27002',
    version: '2022',
    texte: 'Le recueil de mesures qui détaille la mise en œuvre des contrôles de l’Annexe A.',
  },
  {
    nom: 'NIST Cybersecurity Framework',
    version: '2.0',
    texte: 'Cadre d’organisation de la sécurité par grandes fonctions, de la gouvernance au rétablissement.',
  },
  {
    nom: 'CIS Critical Security Controls',
    version: '8',
    texte: 'Mesures techniques prioritaires, ordonnées par effet attendu.',
  },
  {
    nom: 'OWASP Top 10',
    version: '2021',
    texte: 'Les risques applicatifs les plus répandus, rattachés aux contrôles concernés.',
  },
  {
    nom: 'MITRE ATT&CK',
    version: 'v15',
    texte: 'Tactiques et techniques adverses, pour relier un écart à la façon dont il serait exploité.',
  },
]

/**
 * Les cinq dimensions d'analyse.
 *
 * <p>Reprises de {@code DomainFamily}. La dimension physique est déclarée mais
 * aucune question ne la renseigne encore : le serveur la restitue « non
 * évaluée », et la page le dit plutôt que de laisser croire à une couverture
 * complète. Une famille absente ne se remarque pas ; une famille vide se voit.
 */
const DIMENSIONS: { nom: string; texte: string; evaluee: boolean }[] = [
  {
    nom: 'Organisationnel',
    texte: 'Pilotage de la sécurité : stratégie, gouvernance, suivi, incidents, amélioration continue, actifs et fournisseurs.',
    evaluee: true,
  },
  {
    nom: 'Technique',
    texte: 'Protection des systèmes : infrastructure, réseau, identités, applications, sauvegarde et continuité.',
    evaluee: true,
  },
  {
    nom: 'Humain',
    texte: 'Personnes et pratiques : sensibilisation, comportements au quotidien, et tests grandeur nature.',
    evaluee: true,
  },
  {
    nom: 'Conformité',
    texte: 'Exigences externes : politiques approuvées et appliquées, données personnelles, conformité technique.',
    evaluee: true,
  },
  {
    nom: 'Physique',
    texte: 'Locaux et équipements : contrôle des accès physiques, zones sécurisées, protection et mise au rebut du matériel.',
    evaluee: false,
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
    titre: 'Guides d’utilisation',
    texte: 'Prise en main des écrans d’évaluation, de preuves et de suivi.',
  },
  {
    titre: 'Concepts',
    texte: 'Contrôle, preuve, écart, maturité, risque : le vocabulaire commun.',
    to: '#concepts',
  },
  {
    titre: 'Référentiels',
    texte: 'Ce que la plateforme exploite aujourd’hui, et ce qui reste documentaire.',
    to: '#referentiels',
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
    titre: 'Documentation technique',
    texte: 'Intégration, interfaces et éléments destinés aux équipes techniques.',
  },
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
 * `grand` donne la version de tête des Articles : même trait pointillé, même
 * badge, même phrase — seules la respiration et la taille du titre changent.
 * C'est ce qui permet une hiérarchie éditoriale sans inventer de titre ni de
 * date pour l'article principal, qui n'existe pas plus que les autres.
 *
 * Tout est posé en jetons, y compris le fond : l'emplacement se retrouve
 * ailleurs sur surface sombre, où `--s-bg-alt` et `--s-border-strong`
 * s'inversent d'eux-mêmes.
 */
function Emplacement({
  icon: Icon,
  categorie,
  grand = false,
}: {
  icon: LucideIcon
  categorie: string
  grand?: boolean
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-[12px] border border-dashed border-[color:var(--s-border-strong)] bg-[color:var(--s-bg-alt)] ${
        grand ? 'p-8 md:p-10' : 'p-6'
      }`}
    >
      <span className="s-icon-tile">
        <Icon size={20} />
      </span>
      <span className="s-badge mt-5 self-start">À venir</span>
      {grand ? (
        <h3 className="s-h3 mt-3">{categorie}</h3>
      ) : (
        <h3 className="mt-3 text-lg font-semibold text-[color:var(--s-text-strong)]">{categorie}</h3>
      )}
      <p className={`s-small mt-2 flex-1 ${grand ? 's-measure' : ''}`}>
        Cet emplacement accueillera un contenu dès sa publication. Il est laissé vide tant qu’il
        n’y a rien à y mettre.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Concepts                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Développements repris des pages Solution et Suivi.
 *
 * Ces paragraphes y figuraient en second, après le principe qu'ils
 * développent. Les pages commerciales ne gardent qu'une idée par section ;
 * le texte n'est pas coupé pour autant, il est déplacé ici, à l'identique.
 */
const CONCEPTS: { titre: string; texte: string }[] = [
  {
    titre: 'Le socle unifié',
    texte:
      'Une même mesure de sécurité peut ainsi être exploitée dans plusieurs cadres d’évaluation, permettant de capitaliser sur les travaux déjà réalisés, de limiter la duplication des efforts et de faciliter la consolidation des résultats.',
  },
  {
    titre: 'De l’évaluation à la décision',
    texte:
      'Les résultats obtenus deviennent une base pour comprendre les risques, définir les priorités et orienter les décisions.',
  },
  {
    titre: 'De la décision à l’action',
    texte:
      'CYBERAS Intelligence permet ainsi de faire évoluer l’audit d’un exercice ponctuel vers une démarche continue de pilotage et d’amélioration de la cybersécurité.',
  },
]

export function RessourcesPage() {
  return (
    <>
      <PageHead
        eyebrow="Ressources"
        title="Comprendre, approfondir, décider"
        lead="Le reste du site va à l’essentiel. Cette page entre dans le détail : méthodes, référentiels, documentation et réponses précises sur le fonctionnement de la plateforme."
        actions={
          <Link to="/evaluation" className="s-btn s-btn-primary">
            Lancer une évaluation
          </Link>
        }
      />

      {/* Sommaire. Des liens d'ancre simples : la page est longue, et le
          visiteur doit pouvoir viser la rubrique qui l'intéresse sans dérouler
          tout le reste.

          Il reste sur le gris de l'en-tête, sans filet entre les deux : le
          sommaire appartient à la couverture de la page, il n'en est pas la
          première rubrique. Posé sur blanc, il ouvrait une section fantôme. */}
      <section className="s-surface-alt pb-10 md:pb-12">
        <div className="s-wrap">
          <Reveal>
            <nav aria-label="Sommaire des rubriques">
              <ul className="flex flex-wrap gap-2">
                {SOMMAIRE.map((entree) => (
                  <li key={entree.to}>
                    <a href={entree.to} className="s-badge hover:border-[color:var(--s-primary)]">
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
      {/* Articles                                                            */}
      {/* ------------------------------------------------------------------ */}
      {/* Blanc : les emplacements sont des cartes gris pâle à trait pointillé.
          Sur le gris de section, elles disparaissaient dans leur propre fond. */}
      <section id="articles" className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Articles"
            title="Analyses et actualités en cybersécurité"
            lead="Des analyses sur l’audit, les risques, la conformité, les nouvelles menaces, les technologies et la gouvernance de la sécurité."
          />

          <Reveal delay={STAGGER[1]} className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {SUJETS_ARTICLES.map((sujet) => (
                <li key={sujet} className="s-badge">
                  {sujet}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Aucun article n'est publié à ce jour. Des emplacements plutôt que
              de faux titres avec de fausses dates : l'attente est une
              information honnête, l'invention n'en est pas une.

              La composition, elle, est celle d'une rubrique éditoriale : une
              tête d'affiche sur deux colonnes, deux entrées secondaires
              empilées à côté. Trois cartes de taille égale annonçaient trois
              contenus interchangeables ; ici la hiérarchie du futur sommaire
              est déjà lisible, sans qu'aucun titre soit avancé. */}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <Reveal delay={STAGGER[0]} className="lg:col-span-2">
              <Emplacement icon={Newspaper} categorie="Audit et conformité" grand />
            </Reveal>
            {/* Deux rangées égales : sans cela, la colonne secondaire
                s'arrêterait à la hauteur de son texte et laisserait un vide
                sous la tête d'affiche. */}
            <div className="grid grid-rows-2 gap-6">
              {['Risques et menaces', 'Technologies et gouvernance'].map((categorie, i) => (
                <Reveal key={categorie} delay={STAGGER[i + 1]}>
                  <Emplacement icon={Newspaper} categorie={categorie} />
                </Reveal>
              ))}
            </div>
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
      {/* Gris : la grille de cartes blanches a besoin d'un fond qui la porte.
          Six cartes blanches sur blanc ne se détachent que par leur filet. */}
      <section id="guides" className="s-section s-surface-alt">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Guides & bonnes pratiques"
            title="Des méthodes pour structurer votre démarche"
            lead="Six sujets, du cadrage d’une évaluation jusqu’au suivi de la remédiation. Chacun répond à une question que les équipes se posent au moment de commencer."
          />

          <Reveal delay={STAGGER[1]} className="mt-6">
            <span className="s-badge">Guides en préparation</span>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide, i) => (
              <Reveal key={guide.titre} delay={STAGGER[i % 3]}>
                <article className="s-card s-card-hover flex h-full flex-col">
                  <span className="s-icon-tile">
                    <BookOpen size={20} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-[color:var(--s-text-strong)]">
                    {guide.titre}
                  </h3>
                  <p className="s-small mt-2 flex-1">{guide.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Référentiels                                                        */}
      {/* ------------------------------------------------------------------ */}
      {/* Bleu très clair. La section repose sur une opposition — un référentiel
          pris en charge, cinq repères qui ne le sont pas — et cette opposition
          se joue en blanc sur teinte : les deux blocs qui existent dans le
          produit remontent, le fond les sépare du reste de la page. */}
      <section id="referentiels" className="s-section s-surface-soft">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Référentiels"
            title="Six référentiels, un seul socle de contrôles"
            lead="Les exigences de ces six cadres sont rapprochées au sein d’un socle commun. Une mesure évaluée une fois alimente tous ceux qui la réclament."
          />

          {/* Les six référentiels du catalogue. Grille de cartes plutôt que
              liste : la version compte autant que le nom, et une liste la
              relègue en fin de ligne où personne ne la lit. */}
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REFERENTIELS.map((r, i) => (
              <Reveal key={r.nom} delay={STAGGER[i % STAGGER.length]}>
                <article className="s-card h-full">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                      {r.nom}
                    </h3>
                    <span className="s-small shrink-0 font-medium">{r.version}</span>
                  </div>
                  <p className="s-small mt-2">{r.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Les cinq dimensions. La physique est déclarée mais aucune question
              ne la renseigne encore : le serveur la restitue « non évaluée ».
              La page le dit, plutôt que de la compter comme les autres — une
              couverture annoncée puis absente du rapport se paie cher. */}
          <Reveal delay={STAGGER[1]} className="mt-16">
            <h3 className="s-h3">Cinq dimensions d’analyse</h3>
            <p className="s-small s-measure mt-3">
              Chaque contrôle du socle est rattaché à l’une de ces dimensions, et le score se lit
              dimension par dimension.
            </p>
            <ul className="mt-8 divide-y divide-[color:var(--s-border)] rounded-[12px] border border-[color:var(--s-border)] bg-[color:var(--s-raised)]">
              {DIMENSIONS.map((d) => (
                <li
                  key={d.nom}
                  className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 px-5 py-4"
                >
                  <div>
                    <span className="text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                      {d.nom}
                    </span>
                    <p className="s-small mt-1 max-w-xl">{d.texte}</p>
                  </div>
                  {!d.evaluee && (
                    <span className="s-small shrink-0 font-medium">
                      Déclarée, pas encore questionnée
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Le catalogue complet existe depuis l'origine du site : une
              vingtaine de référentiels classés par famille, chacun avec son
              objet, ce qu'il couvre et à qui il s'adresse. Cette section n'en
              montre que le socle ; le renvoi évite d'avoir l'air d'avoir
              réduit ce qui est simplement ailleurs. */}
          <Reveal delay={STAGGER[2]}>
            <Link to="/referentiels" className="s-link mt-10">
              Voir le catalogue complet des référentiels <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Grise : « Concepts » et « Documentation » se suivaient toutes deux sur
          blanc, et la frontière entre deux rubriques pourtant distinctes
          disparaissait. */}
      <section id="concepts" className="s-section s-surface-alt">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Concepts"
            title="Ce que recouvrent le socle, l’évaluation et la remédiation"
            lead="Le détail des trois principes sur lesquels repose la plateforme."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CONCEPTS.map((c, i) => (
              <Reveal key={c.titre} delay={STAGGER[i]}>
                <article className="s-card s-card-metric h-full">
                  <h3 className="text-lg font-semibold text-[color:var(--s-text-strong)]">
                    {c.titre}
                  </h3>
                  <p className="s-small mt-3">{c.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Documentation                                                       */}
      {/* ------------------------------------------------------------------ */}
      {/* Blanc, mais cartes de mesure : six cartes blanches sur fond blanc
          n'auraient tenu que par leur filet. L'inverse — fond clair, cartes à
          peine teintées — donne le même contraste sans assombrir la page, et
          évite un troisième gris d'affilée. */}
      <section id="documentation" className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Documentation"
            title="Tout savoir sur CYBERAS"
            lead="Six entrées pour comprendre la plateforme, ses fonctions, son vocabulaire et les principes qui structurent son fonctionnement."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DOCUMENTATION.map((entree, i) => {
              const contenu = (
                <>
                  <span className="s-icon-tile">
                    <FileText size={20} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-[color:var(--s-text-strong)]">
                    {entree.titre}
                  </h3>
                  <p className="s-small mt-2 flex-1">{entree.texte}</p>
                  {entree.to ? (
                    <span className="s-link mt-5">
                      Consulter <ArrowRight size={16} />
                    </span>
                  ) : (
                    <span className="s-badge mt-5 self-start">À venir</span>
                  )}
                </>
              )

              return (
                <Reveal key={entree.titre} delay={STAGGER[i % 3]}>
                  {entree.to ? (
                    entree.to.startsWith('#') ? (
                      <a
                        href={entree.to}
                        className="s-card s-card-metric s-card-hover flex h-full flex-col"
                      >
                        {contenu}
                      </a>
                    ) : (
                      <Link
                        to={entree.to}
                        className="s-card s-card-metric s-card-hover flex h-full flex-col"
                      >
                        {contenu}
                      </Link>
                    )
                  ) : (
                    <div className="s-card s-card-metric flex h-full flex-col">{contenu}</div>
                  )}
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                 */}
      {/* ------------------------------------------------------------------ */}
      {/* Gris : huit lignes blanches empilées ont besoin d'un fond pour se
          lire comme une liste et non comme une suite de blocs flottants. */}
      <section id="faq" className="s-section s-surface-alt">
        <div className="s-wrap">
          <SectionHead
            eyebrow="FAQ"
            title="Les réponses à vos questions"
            lead="Fonctionnement, évaluations, données, sécurité, questionnaires, scans, rapports et offres."
          />

          {/* <details> natif plutôt qu'un accordéon à état : le navigateur gère
              l'ouverture, le clavier et la recherche dans la page, et la
              rubrique reste lisible même si le JavaScript ne s'exécute pas. */}
          <div className="mt-12 grid gap-3 lg:max-w-4xl">
            {FAQ.map((item, i) => (
              /* Liste d'une seule colonne : le décalage s'arrête au quatrième
                 cran, sinon la huitième question entrerait bien après que
                 l'œil s'y est posé. */
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

          <Reveal delay={STAGGER[3]} className="mt-10">
            <p className="s-small">
              Une question qui ne figure pas ici ?{' '}
              <Link to="/contact" className="s-link align-baseline">
                Posez-la
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Études & analyses                                                   */}
      {/* ------------------------------------------------------------------ */}
      {/* L'unique section sombre de la page, et elle ne l'est qu'une fois : le
          navy répété redeviendrait un fond de plus. Placé ici, il marque la
          rupture entre les rubriques de référence, qui se consultent, et les
          travaux de fond, qui se lisent — et il coupe la succession de
          surfaces claires avant la fin de page.

          Les emplacements n'ont rien à changer : leurs fonds et bordures
          viennent des jetons, que la surface sombre inverse pour eux. */}
      <section id="etudes" className="s-section s-surface-navy">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Études & analyses"
            title="Études et analyses"
            lead="Travaux de fond sur la maturité, les écarts observés et l’évolution des postures de sécurité."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {['Maturité et niveaux observés', 'Écarts récurrents et priorités'].map((sujet, i) => (
              <Reveal key={sujet} delay={STAGGER[i]}>
                <Emplacement icon={BarChart3} categorie={sujet} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Formation                                                           */}
      {/* ------------------------------------------------------------------ */}
      {/* Retour au clair après le navy, avant la clôture sombre : deux bandes
          foncées de suite auraient fait paraître la page finie deux fois. */}
      <section id="formation" className="s-section s-surface-white">
        <div className="s-wrap">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <Reveal>
              <Eyebrow>Formation</Eyebrow>
              <h2 className="s-h2 mt-4">Une évaluation ne vaut que si elle est comprise</h2>
              <p className="s-body s-measure mt-6">
                La formation CYBERAS accompagne les organisations dans la lecture de leurs
                résultats, l’interprétation des constats et la conduite de la remédiation. Elle a sa
                propre page.
              </p>
              <Link to="/formation" className="s-link mt-8">
                Découvrir la formation <ArrowRight size={16} />
              </Link>
            </Reveal>

            {/* Carte accent, seule de sa section : sur fond blanc, une carte
                blanche de plus n'aurait rien porté. */}
            <Reveal delay={STAGGER[1]}>
              <div className="s-card s-card-accent flex items-center gap-4">
                {/* La pastille passe au blanc : son fond habituel est celui de
                    la carte accent, elle y disparaîtrait. Écrit en style et
                    non en classe utilitaire — la charte n'est pas dans une
                    couche, elle gagnerait sur l'utilitaire. Le blanc reste
                    pris au jeton, jamais posé en dur. */}
                <span className="s-icon-tile" style={{ backgroundColor: 'var(--s-bg)' }}>
                  <GraduationCap size={20} />
                </span>
                <p className="s-small">
                  Comprendre les résultats, accompagner les audits, interpréter les constats, suivre
                  la progression.
                </p>
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
