import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowDown,
  Database,
  Search,
  Layers,
  LayoutDashboard,
  ListChecks,
  RefreshCw,
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
import { DemoButton } from '../../components/marketing/DemoButton'
import { VisualPosture } from '../../components/marketing/SiteVisuals'

/**
 * Page « Méthodologie ».
 *
 * <p>Cinq étapes, de la collecte au pilotage. La page décrit ce qui se passe
 * pendant une mission, du point de vue de l'organisation auditée : ce qu'on
 * lui demande, ce qu'on en fait, ce qu'elle reçoit.
 *
 * <p>Ce qu'elle ne fait pas, et c'est délibéré : elle ne compare pas la
 * démarche à « l'audit classique », ne revendique pas une méthode maison et
 * n'explique pas pourquoi auditer. Ces trois registres étaient présents dans
 * la version précédente, sous la forme d'une section « l'audit est la première
 * étape » et d'un tableau qui opposait colonne par colonne « avant » et « avec
 * CYBERAS ». Ils demandaient au lecteur d'accepter un jugement sur sa pratique
 * actuelle avant d'avoir rien appris, et rendaient méfiant celui qu'il
 * s'agissait d'informer. Une méthodologie se décrit ; elle n'a pas à se
 * défendre.
 *
 * <p>L'étape 03 reçoit seule un développement. C'est la seule qui ne va pas de
 * soi : rapprocher les exigences de plusieurs référentiels d'un socle commun
 * avant de scorer demande d'être montré, là où « collecter » et « restituer »
 * se comprennent à l'énoncé.
 */

/* -------------------------------------------------------------------------- */
/* Les cinq étapes                                                             */
/* -------------------------------------------------------------------------- */

interface Etape {
  numero: string
  titre: string
  icon: LucideIcon
  texte: string
  elements: string[]
  /** Ce que l'étape produit. Absente quand l'énoncé se suffit. */
  produit?: string
}

const ETAPES: Etape[] = [
  {
    numero: '01',
    titre: 'Collecter les données',
    icon: Database,
    texte: 'Les informations nécessaires à l’évaluation sont recueillies.',
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
    produit: 'Les tableaux de bord suivent l’avancement et l’évolution des résultats.',
  },
]

/** Les cadres que le mapping rapproche, dans le schéma de l'étape 03. */
const CADRES_MAPPES = ['ISO 27001', 'NIST', 'CIS Controls', 'Exigences réglementaires']

/** Ce que le scoring produit, du contrôle au niveau cible. */
const CHAINE_SCORING = [
  'Score par contrôle',
  'Score par domaine',
  'Niveau de maturité',
  'Score global',
  'Écart au niveau cible',
]

/**
 * La boucle. La cinquième étape ramène à la première, et l'écrire en ligne
 * droite dirait le contraire.
 */
const CYCLE = ['Évaluer', 'Identifier les écarts', 'Prioriser', 'Agir', 'Mesurer', 'Réévaluer']

/* -------------------------------------------------------------------------- */
/* Schémas de l'étape 03                                                       */
/* -------------------------------------------------------------------------- */

/** Plusieurs cadres convergent vers un socle, puis vers une évaluation. */
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

/** Du contrôle au score global, puis à l'écart au niveau cible. */
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

export function MethodologiePage() {
  return (
    <>
      <PageCover
        eyebrow="Méthodologie"
        title={
          <>
            Une méthodologie qui transforme les exigences en{' '}
            <span className="text-[color:var(--s-primary)]">décisions</span>
          </>
        }
        lead="Cinq étapes, de la collecte des données au suivi des actions, conçues pour transformer les exigences de cybersécurité en résultats mesurables et en actions suivies."
        actions={
          <>
            <Link to="/evaluation" className="s-btn s-btn-primary">
              Lancer une évaluation <ArrowRight size={18} />
            </Link>
            <DemoButton />
          </>
        }
        image="/images/reunion.jpg"
        imageAlt="Réunion de travail autour d’un tableau, équipe en train de cadrer une évaluation"
        reperes={['Cinq étapes', 'Socle de contrôles unifié', 'Amélioration continue']}
      />

      {/* ------------------------------------------------------------------ */}
      {/* La frise                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="etapes" className={`s-section ${surfaceClass('white')}`}>
        <div className="s-wrap">
          <SectionHead
            eyebrow="Le déroulement"
            title="Cinq étapes, de la donnée à l’action"
            lead="Chaque étape reprend là où la précédente s’arrête, et produit ce dont la suivante a besoin."
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
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Le cœur : l'étape 03                                                */}
      {/* ------------------------------------------------------------------ */}
      {/* L'étape 03 reçoit seule un développement : c'est la seule qui ne va
          pas de soi. « Collecter » et « restituer » se comprennent à l'énoncé ;
          rapprocher plusieurs référentiels d'un socle commun avant de scorer
          demande d'être montré. */}
      <section id="mapping" className={`s-section ${surfaceClass('alt')}`}>
        <div className="s-wrap">
          <SectionHead
            eyebrow="03 · Mapper et évaluer"
            title="Plusieurs référentiels, un socle de contrôles commun"
            lead="Les exigences issues de différents cadres sont rapprochées d’un même socle, puis les résultats sont agrégés en indicateurs comparables dans le temps."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Reveal delay={STAGGER[1]}>
              <SchemaMapping />
            </Reveal>
            <Reveal delay={STAGGER[2]}>
              <SchemaScoring />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* La restitution                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section id="restitution" className={`s-section ${surfaceClass('white')}`}>
        <div className="s-wrap">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Eyebrow>04 · Restituer et prioriser</Eyebrow>
              <h2 className="s-h2 mt-4">Ce que vous recevez à la fin</h2>
              <p className="s-body s-measure mt-5">
                Les constats peuvent être associés à une analyse des risques, afin de distinguer les
                sujets qui demandent une attention immédiate de ceux qui peuvent être traités
                progressivement.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {['Scores', 'Maturité', 'Conformité', 'Écarts', 'Risques', 'Priorités'].map((t) => (
                  <li key={t} className="s-tag">
                    {t}
                  </li>
                ))}
              </ul>
              <Link to="/solution#livrables" className="s-link mt-8">
                Le détail des livrables <ArrowRight size={16} />
              </Link>
            </Reveal>
            <Reveal delay={STAGGER[1]}>
              <VisualPosture />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* La boucle                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="cycle" className={`s-section ${surfaceClass('navy')}`}>
        <div className="s-wrap">
          <SectionHead
            eyebrow="05 · Remédier et piloter"
            title="Le cycle se referme, et recommence"
            lead="La dernière étape ramène à la première. C’est ce qui distingue un pilotage continu d’un audit ponctuel."
            center
          />

          <Reveal delay={STAGGER[1]} className="mt-12">
            <ol className="flex flex-wrap items-center justify-center gap-2">
              {CYCLE.map((maillon) => (
                <li key={maillon} className="flex items-center gap-2">
                  <span className="rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-raised)] px-3 py-2 text-xs font-semibold text-[color:var(--s-text-strong)]">
                    {maillon}
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-[color:var(--s-primary)]"
                    aria-hidden="true"
                  />
                </li>
              ))}
              <li className="s-small font-medium text-[color:var(--s-primary)]">
                retour à l’évaluation
              </li>
            </ol>
          </Reveal>

          <Reveal delay={STAGGER[2]} className="mt-10">
            <p className="flex items-center justify-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]">
              <RefreshCw size={14} aria-hidden="true" />
              Amélioration continue
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Prêt à situer votre organisation ?"
        lead="Une évaluation part du périmètre que vous déclarez, et suit les cinq étapes décrites ici."
        primary={{ label: 'Lancer une évaluation', to: '/evaluation' }}
        secondaryAction={<DemoButton />}
      />
    </>
  )
}
