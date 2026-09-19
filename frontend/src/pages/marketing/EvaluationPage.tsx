import { Link } from 'react-router-dom'
import {
  Compass,
  Crosshair,
  FolderOpen,
  LineChart,
  FileText,
  TrendingUp,
  UserCheck,
  Network,
  FileSignature,
  Files,
} from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Reveal,
  Eyebrow,
  PageHead,
  SectionHead,
  CtaBand,
  FlowChain,
  STAGGER,
} from '../../components/marketing/SiteKit'

/**
 * Page « Lancer une évaluation ».
 *
 * <p>C'est la destination du bouton principal du site. Le visiteur qui arrive
 * ici a déjà été convaincu ailleurs : il ne cherche plus d'arguments, il
 * cherche à savoir ce qui va se passer et ce qu'on attend de lui. La page est
 * donc un parcours, pas un argumentaire.
 *
 * <p>Les tarifs ne sont plus ici : ils vivent sur la page Offres. Une page qui
 * explique un déroulé et vend une formule dans le même écran fait hésiter au
 * moment précis où elle devrait rassurer.
 *
 * <p>Aucune durée n'est annoncée nulle part. Un délai affiché sur une page
 * vitrine devient une promesse, et une promesse de calendrier tenue sur des
 * contextes inconnus n'en est pas une.
 *
 * <p>C'est la page qui reçoit le plus de visiteurs décidés, donc celle dont le
 * rythme est le plus travaillé : gris d'en-tête, blanc pour le déroulé, navy
 * pour la frise de collaboration, gris pour ce que le client fournit, bleu très
 * clair pour la méthodologie, sombre pour la clôture. Les cinq surfaces du
 * site y passent, chacune une seule fois.
 *
 * <p>Le navy est réservé à la frise. Elle est le seul endroit de la page où
 * l'on voit les deux parties travailler ensemble, et c'est aussi la seule
 * composition entièrement construite sur les jetons : elle s'inverse sur fond
 * sombre sans une ligne de plus. Les cartes des autres sections, elles,
 * resteraient blanches et y deviendraient illisibles.
 */

/* -------------------------------------------------------------------------- */
/* Déroulé                                                                     */
/* -------------------------------------------------------------------------- */

interface Etape {
  icon: ReactNode
  titre: string
  texte: string
}

const DEROULE: Etape[] = [
  {
    icon: <Compass size={20} />,
    titre: 'Cadrer',
    texte:
      'Nous précisons l’objectif de l’évaluation, le contexte de votre organisation et le référentiel visé.',
  },
  {
    icon: <Crosshair size={20} />,
    titre: 'Définir le périmètre',
    texte:
      'Les domaines, adresses et applications à évaluer sont déclarés, puis autorisés par écrit.',
  },
  {
    icon: <FolderOpen size={20} />,
    titre: 'Collecter',
    texte:
      'Vos référents répondent aux questionnaires et rattachent les pièces justificatives aux réponses.',
  },
  {
    icon: <LineChart size={20} />,
    titre: 'Analyser',
    texte:
      'Réponses, preuves et résultats de scans autorisés sont croisés, puis vérifiés par un auditeur.',
  },
  {
    icon: <FileText size={20} />,
    titre: 'Restituer',
    texte:
      'Le rapport présente la synthèse, les scores par domaine, les écarts, les risques et les recommandations.',
  },
  {
    icon: <TrendingUp size={20} />,
    titre: 'Suivre',
    texte:
      'Chaque recommandation porte un responsable, une échéance et un statut, jusqu’à sa clôture.',
  },
]

/* -------------------------------------------------------------------------- */
/* Collaboration                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Le déroulé d'une évaluation, du cadrage à la restitution.
 *
 * <p>La version précédente décrivait une mission de conseil : nous comprenons,
 * nous testons, nos auditeurs vérifient, nous restituons. C'est faux pour un
 * produit vendu en SaaS. L'évaluation se conduit dans la plateforme, par les
 * équipes de l'organisation ; nous ne sommes pas nécessairement dans la boucle,
 * et les jalons le disent maintenant.
 *
 * <p>Volontairement télégraphique : la frise sert à voir d'un coup d'œil qui
 * fait quoi et dans quel ordre. Un paragraphe sous chaque jalon la
 * transformerait en liste à puces déguisée.
 */
const COLLABORATION: { titre: string; texte: string }[] = [
  { titre: 'Ouverture de l’espace', texte: 'Vous créez votre organisation et votre première mission.' },
  { titre: 'Cadrage', texte: 'Objectifs, périmètre et interlocuteurs se déclarent dans la plateforme.' },
  { titre: 'Autorisation', texte: 'Vous confirmez par écrit le périmètre sur lequel les scans s’exécutent.' },
  { titre: 'Évaluation', texte: 'Vos référents renseignent les contrôles, le logiciel analyse et recoupe.' },
  { titre: 'Restitution', texte: 'Les résultats sont dans votre espace, vous pilotez la remédiation.' },
]

/* -------------------------------------------------------------------------- */
/* Ce que vous fournissez                                                      */
/* -------------------------------------------------------------------------- */

const PREREQUIS: { icon: ReactNode; texte: string }[] = [
  {
    icon: <UserCheck size={20} />,
    texte: 'Un interlocuteur qui connaît le système d’information',
  },
  {
    icon: <Network size={20} />,
    texte: 'Le périmètre à évaluer : domaines, adresses, applications',
  },
  {
    icon: <FileSignature size={20} />,
    texte: 'L’autorisation écrite de tester ce périmètre',
  },
  {
    icon: <Files size={20} />,
    texte: 'Les documents existants : politiques, procédures, schémas',
  },
]

/* -------------------------------------------------------------------------- */
/* Méthodologie                                                                */
/* -------------------------------------------------------------------------- */

const METHODE: { titre: string; elements: string[]; note?: string }[] = [
  {
    titre: 'Collecte',
    elements: [
      'Questionnaires structurés',
      'Questionnaires de type Likert',
      'Pièces justificatives',
      'Documents',
      'Données déclaratives',
      'Données techniques',
      'Scans autorisés',
    ],
  },
  {
    titre: 'Analyse',
    elements: [
      'Analyse de données',
      'Automatisation',
      'Scans techniques',
      'Technologies avancées',
      'Machine learning',
      'Intelligence artificielle',
    ],
    note: 'La technologie assiste et accélère le diagnostic. Elle ne remplace jamais l’auditeur : c’est lui qui tranche.',
  },
  {
    titre: 'Résultats',
    elements: [
      'KPI',
      'Scores',
      'Écarts',
      'Cartographie des risques',
      'Niveaux de maturité',
      'Recommandations',
      'Actions de remédiation',
      'Suivi',
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* Frise de collaboration                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Frise horizontale sur grand écran, verticale sur téléphone.
 *
 * Le trait de liaison est un élément absolu propre à chaque jalon plutôt
 * qu'une ligne unique posée derrière la frise : il suit alors la même bascule
 * que la grille, et le dernier jalon n'a simplement pas de trait — ce qui
 * évite la ligne qui dépasse dans le vide.
 */
function FriseCollaboration() {
  return (
    <ol className="grid gap-x-4 md:grid-cols-5">
      {COLLABORATION.map((jalon, i) => (
        <li
          key={jalon.titre}
          className="relative pb-9 pl-14 last:pb-0 md:pb-0 md:pl-0 md:pt-16 md:text-center"
        >
          {i < COLLABORATION.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-[19px] top-11 w-px bg-[color:var(--s-border)] md:bottom-auto md:left-1/2 md:top-5 md:h-px md:w-[calc(100%+1rem)]"
            />
          )}
          <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--s-border-strong)] bg-[color:var(--s-bg)] text-sm font-bold text-[color:var(--s-primary)] md:left-1/2 md:-translate-x-1/2">
            {i + 1}
          </span>
          <h3 className="text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
            {jalon.titre}
          </h3>
          <p className="s-small mt-1.5">{jalon.texte}</p>
        </li>
      ))}
    </ol>
  )
}

export function EvaluationPage() {
  return (
    <>
      <PageHead
        eyebrow="Lancer une évaluation"
        title="Voici exactement ce qui va se passer"
        lead="De la première prise de contact au suivi des actions, le parcours est le même pour tout le monde. Cette page le décrit sans détour."
        actions={
          <>
            <Link to="/inscription" className="s-btn s-btn-primary">
              Créer mon compte
            </Link>
            <Link to="/demo" className="s-btn s-btn-secondary">
              Demander une démo
            </Link>
          </>
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* Le déroulé en six étapes                                            */}
      {/* ------------------------------------------------------------------ */}
      {/* Surface blanche, cartes à peine grisées : l'inverse du réflexe. Six
          cartes blanches sur du blanc ne tenaient que par leur filet, et la
          grille se lisait comme un tableau vide. En donnant le fond aux cartes
          plutôt qu'à la section, chaque étape redevient un objet posé. */}
      <section className="s-section s-surface-white">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Déroulement"
            title="Voici comment va se dérouler votre évaluation"
            lead="Six étapes, dans cet ordre. Chacune produit ce dont la suivante a besoin."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DEROULE.map((etape, i) => (
              /* Le décalage repart à chaque rangée : sur six cartes, un
                 décalage continu ferait attendre la dernière. */
              <Reveal key={etape.titre} delay={STAGGER[i % 3]}>
                <article className="s-card s-card-metric s-card-hover flex h-full flex-col">
                  <div className="flex items-center gap-4">
                    <span className="s-icon-tile">{etape.icon}</span>
                    {/* Le numéro est discret : l'ordre se lit déjà dans la
                        grille, il sert de repère, pas de titre. */}
                    <span className="text-2xl font-bold text-[color:var(--s-border-strong)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[color:var(--s-text-strong)]">
                    {etape.titre}
                  </h3>
                  <p className="s-small mt-2 flex-1">{etape.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Collaboration                                                       */}
      {/* ------------------------------------------------------------------ */}
      {/* La seule section sombre de la page, et son point culminant. Les filets
          hauts et bas disparaissent : une surface qui change n'a plus besoin
          qu'on trace sa limite. */}
      <section id="collaboration" className="s-section s-surface-navy">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Déroulé"
            title="Qui fait quoi, et dans quel ordre"
            /* Disait « elle se conduit à deux », ce qui décrivait une mission
               de conseil. L'évaluation se conduit avec le logiciel ; notre
               présence est une option, pas une étape du parcours. */
            lead="L’évaluation se conduit dans la plateforme, par vos équipes. Un accompagnement est possible, il n’est pas nécessaire."
            center
          />

          <Reveal delay={STAGGER[1]} className="mt-14">
            <FriseCollaboration />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Ce que vous fournissez                                              */}
      {/* ------------------------------------------------------------------ */}
      {/* Retour au gris après le navy : la page respire avant la dernière
          couleur, et les quatre cartes blanches y trouvent enfin un fond sur
          lequel se détacher. */}
      <section className="s-section s-surface-alt">
        <div className="s-wrap">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal>
              <Eyebrow>Votre part</Eyebrow>
              <h2 className="s-h2 mt-4">Ce que vous fournissez</h2>
              <p className="s-body s-measure mt-6">
                Quatre éléments, pas davantage. Tout le reste est produit par la démarche
                elle-même.
              </p>
            </Reveal>

            <Reveal delay={STAGGER[1]}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {PREREQUIS.map((item) => (
                  <li key={item.texte} className="s-card flex h-full flex-col">
                    <span className="s-icon-tile">{item.icon}</span>
                    <p className="s-body mt-5 font-medium text-[color:var(--s-text-strong)]">
                      {item.texte}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Méthodologie                                                        */}
      {/* ------------------------------------------------------------------ */}
      {/* Bleu très clair pour la dernière section claire : les maillons et les
          trois cartes sont blancs, et c'est la teinte qui les porte. Elle
          annonce aussi la bascule vers la clôture sombre, au lieu de la faire
          surgir d'un gris de plus. */}
      <section className="s-section s-surface-soft">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Méthodologie"
            title="Trois temps, toujours les mêmes"
            center
          />

          <Reveal delay={STAGGER[1]} className="mt-12">
            <FlowChain steps={['Collecte', 'Analyse', 'Résultats']} />
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {METHODE.map((temps, i) => (
              <Reveal key={temps.titre} delay={STAGGER[i]}>
                <article className="s-card flex h-full flex-col">
                  <h3 className="s-h3">{temps.titre}</h3>
                  <ul className="mt-5 flex flex-1 flex-wrap content-start gap-2">
                    {temps.elements.map((element) => (
                      <li key={element} className="s-badge">
                        {element}
                      </li>
                    ))}
                  </ul>
                  {temps.note && (
                    <p className="s-small mt-5 border-t border-[color:var(--s-border)] pt-4">
                      {temps.note}
                    </p>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Prêt à lancer votre évaluation ?"
        lead="Créez votre compte pour démarrer, ou demandez une démonstration si vous préférez voir la plateforme avant de vous engager."
        primary={{ label: 'Créer mon compte', to: '/inscription' }}
        secondary={{ label: 'Demander une démo', to: '/demo' }}
      />
    </>
  )
}
