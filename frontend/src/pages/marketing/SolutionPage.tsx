import { Link } from 'react-router-dom'
import {
  Cloud,
  Users,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Database,
  Search,
  Layers,
  LayoutDashboard,
  ListChecks,
  Gauge,
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
import {
  ApercuRapport,
  ApercuMatrice,
  ApercuCartographie,
  ApercuRemediation,
  ApercuTableauBord,
} from '../../components/marketing/SiteVisuals'
import { ReferentielsGrid } from '../../components/marketing/ReferentielsGrid'

/**
 * Page « La solution ».
 *
 * <p>Quatre sections, dans l'ordre du panneau déroulant : présentation,
 * méthodologie, référentiels, livrables. Les ancres `presentation`,
 * `methodologie`, `referentiels` et `livrables` sont celles que siteNav.ts
 * annonce. Les renommer casserait le panneau sans rien signaler à la
 * compilation, et un menu qui pointe dans le vide ne se remarque pas : le
 * visiteur croit seulement que la page a mal défilé.
 *
 * <p>La méthodologie est la pièce maîtresse. Les cinq étapes tiennent une
 * frise, et l'étape 03 reçoit seule un développement : c'est là que la
 * solution fait ce qu'aucune autre ne fait, en rapprochant plusieurs
 * référentiels d'un socle commun avant de scorer. Les quatre autres étapes
 * sont communes à toute démarche d'audit ; leur donner le même espace ferait
 * disparaître ce qui distingue celle-ci.
 *
 * <p>Rien n'est affirmé au-delà de ce que la plateforme fait. Les référentiels
 * cités sont ceux que le catalogue déclare, et le mot « notamment » n'est pas
 * une précaution de style : le périmètre retenu varie d'une organisation à
 * l'autre, et promettre une liste fermée serait promettre à tort.
 */

/* -------------------------------------------------------------------------- */
/* Couverture                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Les trois préalables.
 *
 * Ils répondent aux objections qui viennent avant la première question de
 * fond : faut-il installer quelque chose, qui conduit la mission, où vont les
 * données.
 */
const PREALABLES: { icon: LucideIcon; nom: string }[] = [
  { icon: Cloud, nom: '100 % en ligne' },
  { icon: Users, nom: 'Conduite par vos équipes' },
  { icon: ShieldCheck, nom: 'Sécurisé et confidentiel' },
]

/* -------------------------------------------------------------------------- */
/* Méthodologie                                                                */
/* -------------------------------------------------------------------------- */

interface Etape {
  numero: string
  titre: string
  icon: LucideIcon
  /** Ce que l'étape fait, en une phrase. */
  texte: string
  /** Les objets qu'elle manipule, nommés sans être détaillés. */
  elements: string[]
  /** La phrase qui dit ce que l'étape produit. Absente quand l'étape se suffit. */
  produit?: string
}

const ETAPES: Etape[] = [
  {
    numero: '01',
    titre: 'Collecter les données',
    icon: Database,
    texte: 'CYBERAS recueille les informations nécessaires à l’évaluation.',
    elements: [
      'Questionnaires',
      'Entretiens',
      'Analyse documentaire',
      'Preuves',
      'Données disponibles',
    ],
    produit:
      'L’objectif est de disposer d’informations suffisamment structurées pour évaluer les contrôles concernés.',
  },
  {
    numero: '02',
    titre: 'Analyser les données',
    icon: Search,
    texte:
      'Les réponses, documents et preuves sont analysés au regard des critères et contrôles définis.',
    elements: [
      'Présence des éléments attendus',
      'Niveau de maîtrise',
      'Preuves disponibles',
      'Écarts constatés',
      'Exigences concernées',
    ],
    produit: 'L’analyse transforme les données brutes en constats exploitables.',
  },
  {
    numero: '03',
    titre: 'Mapper et évaluer',
    icon: Layers,
    texte:
      'Les exigences de plusieurs référentiels sont mises en correspondance avec un socle de contrôles commun, puis les résultats sont agrégés.',
    elements: [
      'Mapping multi-référentiels',
      'Socle de contrôles unifié',
      'Scoring par contrôle et par domaine',
      'Niveaux de maturité',
      'Écart au niveau cible',
    ],
  },
  {
    numero: '04',
    titre: 'Restituer et prioriser',
    icon: LayoutDashboard,
    texte: 'Les résultats deviennent une vision directement exploitable.',
    elements: ['Scores', 'Maturité', 'Conformité', 'Écarts', 'Risques', 'Priorités'],
    produit:
      'Les recommandations sont priorisées selon les écarts, les risques et les objectifs de l’organisation.',
  },
  {
    numero: '05',
    titre: 'Remédier et piloter',
    icon: ListChecks,
    texte: 'Les constats deviennent des actions concrètes.',
    elements: ['Action', 'Priorité', 'Responsable', 'Échéance', 'Statut', 'Indicateur'],
    produit:
      'Les tableaux de bord suivent ensuite l’avancement et l’évolution des résultats.',
  },
]

/** Les cadres que le mapping rapproche, dans le schéma de l'étape 03. */
const CADRES_MAPPES = ['ISO 27001', 'NIST', 'CIS Controls', 'Exigences réglementaires']

/** Ce que le scoring produit, du contrôle au suivi dans le temps. */
const CHAINE_SCORING = [
  'Score par contrôle',
  'Score par domaine',
  'Niveau de maturité',
  'Score global',
  'Écart au niveau cible',
]

/**
 * La boucle d'amélioration.
 *
 * C'est elle qui distingue un pilotage continu d'un audit ponctuel. Elle
 * ferme la frise plutôt que de la prolonger : la cinquième étape ramène à la
 * première, et l'écrire en ligne droite dirait le contraire.
 */
const CYCLE = ['Évaluer', 'Identifier les écarts', 'Prioriser', 'Agir', 'Mesurer', 'Réévaluer']

/* -------------------------------------------------------------------------- */
/* Référentiels                                                                */
/* -------------------------------------------------------------------------- */

/** Ce que le socle apporte. Quatre effets, pas quatre promesses. */
const VALEUR_SOCLE: { titre: string; texte: string }[] = [
  {
    titre: 'Réduire la redondance',
    texte: 'Éviter de traiter séparément des exigences qui portent sur des contrôles communs.',
  },
  {
    titre: 'Consolider les résultats',
    texte: 'Obtenir une vision globale plutôt qu’une succession d’évaluations isolées.',
  },
  {
    titre: 'Faciliter les comparaisons',
    texte: 'Suivre l’évolution des résultats selon une base structurée.',
  },
  {
    titre: 'Adapter l’évaluation',
    texte: 'Prendre en compte les référentiels pertinents selon le contexte de l’organisation.',
  },
]

/* -------------------------------------------------------------------------- */
/* Livrables                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Les cinq livrables dont la forme se montre.
 *
 * Les neuf ne se distinguent pas tous visuellement : « recommandations » et
 * « dossier de preuves » ressemblent à du texte, et leur inventer un aperçu
 * reviendrait à décorer. Réutiliser un aperçu pour deux livrables vaudrait
 * moins que pas d'aperçu du tout.
 */
const APERCUS: { nom: string; apercu: React.ReactNode }[] = [
  { nom: 'Rapport d’audit', apercu: <ApercuRapport /> },
  { nom: 'Matrice de conformité', apercu: <ApercuMatrice /> },
  { nom: 'Cartographie des risques', apercu: <ApercuCartographie /> },
  { nom: 'Plan d’actions', apercu: <ApercuRemediation /> },
  { nom: 'Tableau de bord', apercu: <ApercuTableauBord /> },
]

/**
 * Les neuf livrables, avec leur objectif.
 *
 * En tableau plutôt qu'en cartes : chaque ligne oppose un nom à un objectif,
 * et c'est ce qu'un tableau à deux colonnes montre mieux que neuf cartes, où
 * la comparaison demande de balayer la grille.
 */
const LIVRABLES: { nom: string; objectif: string }[] = [
  { nom: 'Rapport d’audit', objectif: 'Présenter les principaux constats et résultats' },
  { nom: 'Matrice de conformité', objectif: 'Visualiser les exigences couvertes et les écarts' },
  { nom: 'Évaluation de maturité', objectif: 'Mesurer le niveau atteint par domaine' },
  { nom: 'Cartographie des risques', objectif: 'Identifier et visualiser les principaux risques' },
  {
    nom: 'Tableau de bord cybersécurité',
    objectif: 'Suivre les indicateurs et l’évolution de la situation',
  },
  { nom: 'Plan d’actions', objectif: 'Structurer les actions correctives et leur priorité' },
  { nom: 'Recommandations', objectif: 'Orienter les mesures d’amélioration' },
  { nom: 'Suivi de remédiation', objectif: 'Suivre l’avancement des actions dans le temps' },
  { nom: 'Dossier de preuves', objectif: 'Centraliser les éléments justificatifs collectés' },
]

/* -------------------------------------------------------------------------- */
/* Fragments de rendu                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Encadré du mapping multi-référentiels.
 *
 * Plusieurs cadres qui convergent vers un socle, puis une évaluation. Le
 * schéma dit en une image ce que le paragraphe met trois phrases à poser, et
 * c'est le seul endroit de la page où la forme porte l'argument.
 */
function SchemaMapping() {
  return (
    <div className="s-card flex h-full flex-col">
      <Eyebrow>Mapping multi-référentiels</Eyebrow>
      <p className="s-small mt-2">Plusieurs référentiels, un socle commun.</p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {CADRES_MAPPES.map((c) => (
          <span
            key={c}
            className="rounded-lg border border-[color:var(--s-primary)] bg-[color:var(--s-primary-soft)] px-3 py-2 text-center text-xs font-semibold text-[color:var(--s-primary)]"
          >
            {c}
          </span>
        ))}
      </div>

      <ArrowDown
        size={18}
        className="mx-auto my-3 text-[color:var(--s-border-strong)]"
        aria-hidden="true"
      />

      <div className="rounded-lg border border-[color:var(--s-primary)] bg-[color:var(--s-primary-soft)] px-4 py-3 text-center">
        <span className="block text-sm font-bold text-[color:var(--s-text-strong)]">
          Socle de contrôles unifié
        </span>
      </div>

      <ArrowDown
        size={18}
        className="mx-auto my-3 text-[color:var(--s-border-strong)]"
        aria-hidden="true"
      />

      <div className="rounded-lg border border-[color:var(--s-border)] px-4 py-3 text-center">
        <span className="block text-sm font-semibold text-[color:var(--s-text-strong)]">
          Évaluation consolidée
        </span>
      </div>

      <p className="s-small mt-5">
        Cette approche identifie les correspondances entre référentiels et réduit les évaluations
        redondantes.
      </p>
    </div>
  )
}

/**
 * Encadré du scoring.
 *
 * Du contrôle au score global, puis à l'évolution. La dernière phrase est la
 * plus importante de la section : un score qui devient une fin en soi produit
 * des organisations qui optimisent le chiffre plutôt que la sécurité.
 */
function SchemaScoring() {
  return (
    <div className="s-card flex h-full flex-col">
      <Eyebrow>Scoring & maturité</Eyebrow>
      <p className="s-small mt-2">Des contrôles au score global, puis à son évolution.</p>

      <ol className="mt-6 flex-1 space-y-2">
        {CHAINE_SCORING.map((etape, i) => (
          <li
            key={etape}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--s-border)] px-3 py-2.5"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--s-primary-soft)] text-[0.625rem] font-bold text-[color:var(--s-primary)]">
              {i + 1}
            </span>
            <span className="text-xs font-medium text-[color:var(--s-text-strong)]">{etape}</span>
          </li>
        ))}
      </ol>

      <p className="s-small mt-5">
        Le score ne constitue pas une fin en soi : il sert à comprendre la situation, identifier les
        priorités et orienter les décisions.
      </p>
    </div>
  )
}

export function SolutionPage() {
  return (
    <>
      <PageCover
        eyebrow="La solution"
        title={
          <>
            Une approche unifiée de la{' '}
            <span className="text-[color:var(--s-primary)]">cybersécurité</span>
          </>
        }
        lead="Structurer la démarche, évaluer le niveau de sécurité, identifier les écarts et suivre les actions d’amélioration, à partir d’un socle de contrôles commun à plusieurs référentiels."
        actions={
          <>
            <Link to="/demo" className="s-btn s-btn-primary">
              Demander une démonstration <ArrowRight size={18} />
            </Link>
            <Link to="#methodologie" className="s-btn s-btn-secondary">
              La méthode en cinq étapes
            </Link>
          </>
        }
        image="/images/soc.jpg"
        imageAlt="Centre opérationnel de sécurité : écrans de supervision et équipe au travail"
        reperes={PREALABLES.map((p) => p.nom)}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 01 · Présentation                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section id="presentation" className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead
            eyebrow="01 · Présentation"
            title="Comprendre la solution et sa valeur"
          />
          <Reveal delay={STAGGER[1]} className="mt-8 max-w-3xl space-y-5">
            <p className="s-body">
              CYBERAS Intelligence est une solution digitale d’audit et de pilotage de la
              cybersécurité qui permet aux organisations de structurer leur démarche, évaluer leur
              niveau de sécurité, identifier leurs écarts et suivre les actions d’amélioration.
            </p>
            <p className="s-body">
              La solution s’appuie sur un socle de contrôles unifié permettant de prendre en compte
              différents référentiels, normes et bonnes pratiques de cybersécurité, tels que
              l’ISO 27001, le NIST, les CIS Controls ou les exigences réglementaires sectorielles.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PREALABLES.map((p, i) => (
              <Reveal key={p.nom} delay={STAGGER[i]}>
                <div className="s-card flex items-center gap-3 p-4">
                  <span className="s-icon-tile s-icon-tile-soft !h-10 !w-10 shrink-0">
                    <p.icon size={18} />
                  </span>
                  <span className="text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                    {p.nom}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 02 · Méthodologie                                                   */}
      {/* ------------------------------------------------------------------ */}
      {/* La pièce maîtresse de la page : la frise des cinq étapes, le
          développement de la seule qui distingue la solution, puis la boucle
          qui referme le cycle. */}
      <section id="methodologie" className="s-section s-surface-alt">
        <div className="s-wrap">
          <SectionHead
            eyebrow="02 · Méthodologie"
            title="Une méthodologie qui transforme les exigences en décisions"
            lead="Cinq étapes, conçues pour transformer les exigences de cybersécurité en résultats mesurables et en actions suivies."
          />

          {/* Cinq colonnes sur grand écran, empilées en dessous : cinq cartes
              côte à côte sur téléphone tomberaient à deux mots par ligne. */}
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ETAPES.map((etape, i) => (
              <Reveal key={etape.numero} delay={STAGGER[i % STAGGER.length]}>
                <li className="s-card flex h-full list-none flex-col">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--s-primary)] text-[0.6875rem] font-bold text-white">
                      {etape.numero}
                    </span>
                    <span className="s-icon-tile s-icon-tile-soft !h-7 !w-7">
                      <etape.icon size={14} />
                    </span>
                  </div>
                  <h3 className="mt-4 text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                    {etape.titre}
                  </h3>
                  <p className="s-small mt-2">{etape.texte}</p>
                  <ul className="mt-4 flex-1 space-y-1.5 border-t border-[color:var(--s-border)] pt-4">
                    {etape.elements.map((e) => (
                      <li key={e} className="s-small flex items-start gap-2">
                        <span
                          className="mt-[0.4375rem] size-1 shrink-0 rounded-full bg-[color:var(--s-primary)]"
                          aria-hidden="true"
                        />
                        {e}
                      </li>
                    ))}
                  </ul>
                  {etape.produit && (
                    <p className="s-small mt-4 border-t border-[color:var(--s-border)] pt-3 italic">
                      {etape.produit}
                    </p>
                  )}
                </li>
              </Reveal>
            ))}
          </ol>

          {/* Le développement de l'étape 03, et d'elle seule. Les quatre autres
              sont communes à toute démarche d'audit ; leur donner le même
              espace ferait disparaître ce qui distingue celle-ci. */}
          <Reveal className="mt-16">
            <h3 className="s-h3">Au cœur de l’étape 03</h3>
            <p className="s-small s-measure mt-3">
              Le mapping rapproche les exigences d’un socle commun ; le scoring transforme les
              résultats en indicateurs lisibles et comparables dans le temps.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Reveal delay={STAGGER[1]}>
              <SchemaMapping />
            </Reveal>
            <Reveal delay={STAGGER[2]}>
              <SchemaScoring />
            </Reveal>
          </div>

          {/* La boucle. La cinquième étape ramène à la première, et l'écrire en
              ligne droite dirait le contraire. */}
          <Reveal delay={STAGGER[2]} className="mt-16">
            <div className="rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] p-6">
              <p className="flex items-center justify-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]">
                <RefreshCw size={14} aria-hidden="true" />
                Amélioration continue
              </p>
              <ol className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {CYCLE.map((maillon) => (
                  <li key={maillon} className="flex items-center gap-2">
                    <span className="rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-bg-alt)] px-3 py-1.5 text-xs font-semibold text-[color:var(--s-text-strong)]">
                      {maillon}
                    </span>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-[color:var(--s-primary)]"
                      aria-hidden="true"
                    />
                  </li>
                ))}
                {/* La flèche du dernier maillon revient au premier : c'est une
                    boucle, pas une file. */}
                <li className="s-small font-medium text-[color:var(--s-primary)]">
                  retour à l’évaluation
                </li>
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 03 · Référentiels                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section id="referentiels" className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead
            eyebrow="03 · Référentiels"
            title="Plusieurs référentiels. Une vision consolidée."
            lead="Les organisations sont souvent confrontées à une multiplication des normes, référentiels et exigences. CYBERAS y répond par un socle de contrôles unifié qui rapproche les exigences et construit une évaluation consolidée."
          />

          {/* Les cadres portés par le catalogue, avec le logo de chaque
              organisme. Nommer un référentiel sans le montrer demande au
              lecteur de reconnaître un sigle ; avec le logo, il le reconnaît. */}
          <div className="mt-10">
            <ReferentielsGrid />
          </div>

          <Reveal delay={STAGGER[1]} className="mt-8">
            <p className="s-small s-measure">
              Selon le périmètre retenu, CYBERAS peut également structurer des exigences
              réglementaires, sectorielles, ainsi que vos politiques et exigences internes. Une
              exigence est rapprochée d’un contrôle commun lorsque les correspondances
              méthodologiques le permettent.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALEUR_SOCLE.map((v, i) => (
              <Reveal key={v.titre} delay={STAGGER[i % STAGGER.length]}>
                <article className="s-card s-card-metric flex h-full flex-col">
                  <h3 className="text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                    {v.titre}
                  </h3>
                  <p className="s-small mt-2 flex-1">{v.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={STAGGER[2]} className="mt-10">
            <Link to="/ressources#referentiels" className="s-btn s-btn-secondary">
              Découvrir les référentiels <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 04 · Livrables                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section id="livrables" className="s-section s-surface-navy">
        <div className="s-wrap">
          <SectionHead
            eyebrow="04 · Livrables"
            title="Des résultats directement exploitables"
            lead="À l’issue de la démarche, l’organisation dispose de livrables permettant de comprendre sa situation et de piloter ses actions."
          />

          {/* Cinq aperçus avant la liste : un livrable dont on lit le nom et
              l'objectif reste une promesse, et « matrice de conformité » comme
              « cartographie des risques » n'évoquent rien tant qu'on ne les a
              pas vus. Cinq seulement, parce que les neuf ne se distinguent pas
              tous par leur forme, et qu'un aperçu réutilisé deux fois vaudrait
              moins que pas d'aperçu du tout. */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {APERCUS.map((a, i) => (
              <Reveal key={a.nom} delay={STAGGER[i % STAGGER.length]}>
                <figure className="s-card s-card-dark flex h-full flex-col">
                  {a.apercu}
                  <figcaption className="mt-3 text-[0.8125rem] font-semibold text-[color:var(--s-text-strong)]">
                    {a.nom}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          {/* Puis la liste complète. Un vrai tableau : chaque ligne oppose un
              nom à un objectif, et c'est ce qu'un tableau à deux colonnes
              montre mieux que neuf cartes, où la comparaison demande de
              balayer la grille. */}
          <Reveal delay={STAGGER[1]} className="mt-10 overflow-hidden rounded-xl border border-[color:var(--s-border)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[color:var(--s-bg-alt)]">
                  <th
                    scope="col"
                    className="px-5 py-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]"
                  >
                    Livrable
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]"
                  >
                    Objectif
                  </th>
                </tr>
              </thead>
              <tbody>
                {LIVRABLES.map((l) => (
                  <tr
                    key={l.nom}
                    className="border-t border-[color:var(--s-border)] bg-[color:var(--s-raised)]"
                  >
                    <th
                      scope="row"
                      className="px-5 py-3.5 align-top text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]"
                    >
                      {l.nom}
                    </th>
                    <td className="px-5 py-3.5 align-top">
                      <span className="s-small">{l.objectif}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <Reveal delay={STAGGER[2]} className="mt-10 flex flex-wrap items-center gap-4">
            <Gauge size={20} className="shrink-0 text-[color:var(--s-primary)]" aria-hidden="true" />
            <p className="s-body s-measure">
              De la collecte des données au suivi des actions, CYBERAS Intelligence transforme
              l’audit cybersécurité en une démarche structurée, mesurable et exploitable.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Votre cybersécurité mérite plus qu’un rapport d’audit."
        lead="Avec CYBERAS, transformez vos évaluations en une vision claire de vos risques, des priorités et des actions mesurables."
        primary={{ label: 'Découvrir la solution', to: '/fonctionnalites' }}
        secondary={{ label: 'Démo', to: '/demo' }}
      />
    </>
  )
}
