import { Link } from 'react-router-dom'
import { History, ScrollText, Gauge } from 'lucide-react'
import {
  Reveal,
  PageHead,
  SectionHead,
  SplitSection,
  FeatureCard,
  CtaBand,
  FlowChain,
  STAGGER,
} from '../../components/marketing/SiteKit'

/**
 * Page « Suivi ».
 *
 * <p>Onglet principal, distinct de la méthodologie : la méthodologie dit
 * comment on évalue, le suivi dit ce qui se passe après. La page reste donc
 * sur le terrain du pilotage — responsables, échéances, statuts, évolution —
 * et n'explique pas la démarche d'audit une seconde fois.
 *
 * <p>Rien n'est affirmé au-delà de ce que la plateforme fait : une
 * recommandation porte un responsable, une échéance et un statut ; les scores
 * sont calculés par domaine et par référentiel ; les évaluations sont
 * conservées et versionnées ; un journal d'audit trace les événements. Pas
 * d'alerte, pas de relance automatique, pas de promesse empruntée.
 *
 * <p>Les surfaces descendent du gris de l'en-tête vers le blanc des actions,
 * passent au bleu très clair pour la progression, puis au gris pour la
 * traçabilité avant la clôture sombre. La rupture tombe sur la courbe : c'est
 * le seul endroit de la page où l'on regarde un chiffre bouger, et la surface
 * teintée fait ce qu'un encadré de plus aurait fait moins bien.
 */

/** Cadre commun aux deux visuels, aligné sur celui de SiteVisuals. */
function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure
      className="rounded-xl border border-[color:var(--s-border)] bg-white p-6 shadow-[var(--s-shadow-sm)]"
      aria-label={label}
    >
      {children}
    </figure>
  )
}

/**
 * Maquette de liste d'actions.
 *
 * Les libellés sont génériques et les statuts réels : le visiteur reconnaît
 * la structure de l'écran sans qu'on lui invente des données de client.
 */
function VisuelActions() {
  const actions = [
    { titre: 'Recommandation issue d’un écart', statut: 'En cours', ton: 'var(--s-warning)' },
    { titre: 'Recommandation issue d’un écart', statut: 'Terminée', ton: 'var(--s-success)' },
    { titre: 'Recommandation issue d’un écart', statut: 'À traiter', ton: 'var(--s-high)' },
  ]
  return (
    <Frame label="Liste d’actions de suivi : responsable, échéance et statut">
      <div className="space-y-2">
        {actions.map((a, i) => (
          <div key={i} className="rounded-lg border border-[color:var(--s-border)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[color:var(--s-text-strong)]">{a.titre}</span>
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold uppercase"
                style={{ color: a.ton, backgroundColor: `color-mix(in srgb, ${a.ton} 10%, white)` }}
              >
                {a.statut}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.6875rem] text-[color:var(--s-text-muted)]">
              <span>Responsable</span>
              <span aria-hidden="true">·</span>
              <span>Échéance</span>
              <span aria-hidden="true">·</span>
              <span>Domaine</span>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

/**
 * Courbe de progression schématique.
 *
 * Les abscisses sont des versions d'évaluation, pas des dates : le rythme des
 * réévaluations appartient au client, la plateforme ne le fixe pas.
 */
function VisuelProgression() {
  const points = [
    { x: 20, y: 118, v: 'v1' },
    { x: 100, y: 96, v: 'v2' },
    { x: 180, y: 70, v: 'v3' },
    { x: 260, y: 42, v: 'v4' },
  ]
  const ligne = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <Frame label="Évolution schématique du score de maturité au fil des évaluations">
      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]">
        Maturité suivie d’une évaluation à l’autre
      </span>

      <svg viewBox="0 0 280 150" className="mt-4 w-full" role="img" aria-hidden="true">
        {/* Lignes de repère : elles donnent l'échelle sans encombrer le tracé. */}
        {[30, 65, 100, 135].map((y) => (
          <line key={y} x1="10" y1={y} x2="270" y2={y} stroke="var(--s-border)" strokeWidth="1" />
        ))}

        <polygon
          points={`${ligne} 260,135 20,135`}
          fill="var(--s-primary-soft)"
        />
        <polyline
          points={ligne}
          fill="none"
          stroke="var(--s-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <circle key={p.v} cx={p.x} cy={p.y} r="4" fill="white" stroke="var(--s-primary)" strokeWidth="2" />
        ))}
      </svg>

      <div className="mt-2 flex justify-between px-1 text-[0.6875rem] text-[color:var(--s-text-muted)]">
        {points.map((p) => (
          <span key={p.v}>{p.v}</span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[color:var(--s-border)] pt-4">
        {['Par domaine', 'Par référentiel'].map((l) => (
          <span
            key={l}
            className="rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-bg-alt)] px-3 py-2 text-center text-xs text-[color:var(--s-text-muted)]"
          >
            {l}
          </span>
        ))}
      </div>
    </Frame>
  )
}

const TRACE = [
  {
    icon: <History size={20} />,
    title: 'Historique versionné',
    text: 'Chaque évaluation est conservée dans sa version : on retrouve l’état exact sur lequel une décision a été prise.',
  },
  {
    icon: <Gauge size={20} />,
    title: 'Scores par domaine et par référentiel',
    text: 'La maturité est calculée à ces deux niveaux, ce qui permet de voir où la progression a lieu et où elle s’arrête.',
  },
  {
    icon: <ScrollText size={20} />,
    title: 'Journal d’audit',
    text: 'Les événements sont tracés : qui a modifié quoi, et quand. La démarche reste défendable devant un tiers.',
  },
]

export function SuiviPage() {
  return (
    <>
      <PageHead
        eyebrow="Suivi"
        title="L’audit devient une démarche continue."
        lead="Une évaluation dit où vous en êtes. Le suivi dit ce qui a été fait depuis, par qui, et ce que cela a changé."
        actions={
          <Link to="/demo" className="s-btn s-btn-primary">
            Demander une démonstration
          </Link>
        }
      />

      {/* La chaîne du suivi, sans paragraphe : l'enchaînement se lit seul et
          montre la boucle plutôt que la ligne droite.

          Blanche, elle détache l'en-tête gris du corps de la page ; le filet
          bas suffit à la borner, une troisième teinte sur dix lignes de haut
          n'aurait produit qu'un empilement de bandes. */}
      <section className="s-surface-white border-b border-[color:var(--s-border)] py-10 md:py-12">
        <div className="s-wrap">
          <Reveal>
            <FlowChain
              steps={['Recommandations', 'Actions', 'Responsables', 'Échéances', 'Réévaluation']}
              compact
            />
          </Reveal>
        </div>
      </section>

      <SplitSection
        eyebrow="Tenir les actions"
        title="Une recommandation sans responsable ne se traite pas."
        visual={<VisuelActions />}
        /* Grise : la bande de la chaîne, juste au-dessus, occupe déjà le blanc.
           Deux fonds identiques d'affilée annulent l'alternance. */
        surface="alt"
      >
        <p>
          Chaque recommandation issue d’une évaluation porte un responsable, une échéance et un
          statut. Le plan d’actions cesse d’être une annexe de rapport : il devient une liste que
          quelqu’un tient, et dont l’avancement se lit sans réunion.
        </p>
        <p>
          Les actions restent rattachées à l’écart qui les a fait naître. On sait toujours pourquoi
          une tâche est là, et ce qu’elle referme.
        </p>
      </SplitSection>

      <SplitSection
        eyebrow="Voir l’évolution"
        title="La progression se mesure, elle ne s’estime pas."
        visual={<VisuelProgression />}
        reverse
        surface="soft"
      >
        <p>
          Les scores de maturité sont calculés par domaine et par référentiel. D’une évaluation à
          la suivante, la comparaison montre où le niveau monte, où il stagne, et quelles actions
          l’accompagnent.
        </p>
        <p>
          Les évaluations précédentes ne sont pas écrasées : elles sont conservées et versionnées.
          L’écart entre deux versions est une information, pas une reconstitution.
        </p>
      </SplitSection>

      {/* Ce qui est conservé. Section courte : trois faits vérifiables.

          Gris, parce que les trois cartes sont blanches : posées sur du blanc,
          elles auraient flotté sans contour lisible, et c'est précisément
          l'effet plat que cette passe corrige. */}
      <section className="s-section s-surface-alt">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Traçabilité"
            title="Ce que la plateforme conserve."
            lead="Un suivi n’a de valeur que s’il résiste à la question « sur quoi vous fondez-vous ? »."
            center
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TRACE.map((t, i) => (
              <Reveal key={t.title} delay={STAGGER[i]}>
                <FeatureCard icon={t.icon} title={t.title}>
                  {t.text}
                </FeatureCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Passez du constat au pilotage."
        lead="Lancez une évaluation, ou voyons ensemble comment le suivi s’installe chez vous."
        primary={{ label: 'Lancer une évaluation', to: '/evaluation' }}
        secondary={{ label: 'Demander une démo', to: '/demo' }}
      />
    </>
  )
}
