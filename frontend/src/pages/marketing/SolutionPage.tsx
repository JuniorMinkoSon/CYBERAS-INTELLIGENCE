import { Link } from 'react-router-dom'
import { LayoutDashboard, FileCheck, AlertTriangle, ListChecks, LineChart } from 'lucide-react'
import {
  Reveal,
  PageHead,
  SectionHead,
  SplitSection,
  CtaBand,
  FlowChain,
  STAGGER,
} from '../../components/marketing/SiteKit'
import {
  VisualSocle,
  VisualEvaluation,
  VisualRemediation,
} from '../../components/marketing/SiteVisuals'

/**
 * Page « La solution ».
 *
 * <p>Elle suit le trajet d'une évaluation plutôt que l'inventaire des modules :
 * ce qu'on rapproche (le socle), ce qu'on en tire (l'évaluation), ce qu'on en
 * fait (la remédiation), ce qu'il en reste (les résultats). Un visiteur qui
 * arrive ici ne cherche pas une liste de fonctions — il cherche à savoir si la
 * démarche tient debout.
 *
 * <p>Les ancres `socle`, `evaluation`, `remediation` et `resultats` sont celles
 * que le menu déroulant annonce dans siteNav.ts. Les renommer casserait le
 * panneau sans rien signaler à la compilation.
 *
 * <p>Les fonds suivent le trajet plutôt que de l'alterner mécaniquement : gris
 * pour l'en-tête et son cadrage, blanc pour le socle, gris pour l'évaluation,
 * bleu très clair au moment où le constat devient action, navy pour les
 * livrables, gris pour la chaîne finale, presque noir pour la clôture. Le
 * blanc / gris en alternance régulière ne séparait rien : deux nuances aussi
 * proches se lisent comme une seule page, et la lecture s'y aplatit.
 *
 * <p>Les livrables sont la seule grille de cartes sombres de la page. Ils sont
 * le point d'arrivée du parcours ; leur donner la surface la plus marquée,
 * c'est dire où le document culmine sans écrire un mot de plus.
 */

/** Ce qui alimente une évaluation, côté visiteur. Rien sur le fonctionnement interne. */
const SOURCES_EVALUATION = [
  'Questionnaires',
  'Preuves',
  'Données déclaratives',
  'Scans autorisés',
  'Analyse automatisée',
]

const LIVRABLES = [
  {
    icon: <LayoutDashboard size={20} />,
    title: 'Tableau de bord',
    text: 'Vision globale de la posture de cybersécurité.',
  },
  {
    icon: <FileCheck size={20} />,
    title: "Rapport d'évaluation",
    text: "Résultats, écarts, constats et niveaux d'évaluation.",
  },
  {
    icon: <AlertTriangle size={20} />,
    title: 'Analyse des risques',
    text: 'Risques identifiés, niveaux et priorités.',
  },
  {
    icon: <ListChecks size={20} />,
    title: 'Plan de remédiation',
    text: 'Actions, responsables, échéances et statuts.',
  },
  {
    icon: <LineChart size={20} />,
    title: 'Suivi de progression',
    text: 'Évolution des scores, de la maturité et des actions.',
  },
]

const LOGIQUE = [
  'Plusieurs référentiels',
  'Un socle unifié',
  'Une vision claire',
  'Des priorités',
  'Des actions mesurables',
]

export function SolutionPage() {
  return (
    <>
      <PageHead
        eyebrow="La solution"
        title="Une approche unifiée de la cybersécurité"
        lead="Plusieurs référentiels. Un seul socle pour structurer, évaluer et piloter votre cybersécurité."
        actions={
          <Link to="/demo" className="s-btn s-btn-primary">
            Demander une démonstration
          </Link>
        }
      />

      {/* Une seule phrase de cadrage, dans une bande volontairement plus courte
          qu'une section : l'en-tête a déjà posé la promesse, et lui donner
          96 px de haut ferait attendre le premier vrai contenu.

          Elle passe au blanc et ouvre donc le bloc du socle au lieu de former
          un palier de plus : sur sa propre surface, elle aurait compté comme
          une étape du parcours, ce qu'elle n'est pas. */}
      <section className="s-surface-white py-12 md:py-16">
        <div className="s-wrap">
          <Reveal>
            <p className="s-body s-measure">
              CYBERAS Intelligence est une plateforme de pilotage de la cybersécurité conçue pour
              simplifier la gestion des exigences, des contrôles et des évaluations de sécurité.
              Elle s’utilise en ligne : les audits et les scans s’exécutent dans le logiciel,
              conduits par vos équipes, sans installation ni intervention sur site.
            </p>
          </Reveal>
        </div>
      </section>

      <SplitSection
        id="socle"
        title="Un socle unifié pour plusieurs référentiels"
        visual={<VisualSocle />}
        /* Grise, alors que la bande de cadrage juste au-dessus est blanche.
           Les deux partageaient le blanc pour se lire d'un seul tenant, mais
           deux surfaces identiques qui se suivent suppriment justement le
           rythme que l'alternance installe ailleurs. La bande reste collée au
           socle par la proximité, plus par la couleur. */
        surface="alt"

        action={{ label: 'En savoir plus', to: '/ressources#concepts' }}>
        <p>
          CYBERAS rapproche les exigences et les contrôles issus de différents référentiels au sein
          d’un socle commun : six cadres, cinq dimensions d’analyse.
        </p>
      </SplitSection>

      {/* Visuel à gauche ici, à droite ailleurs : l'inversion marque la section
          centrale du parcours plutôt que d'installer un zigzag régulier. */}
      <SplitSection
        id="evaluation"
        title="Évaluez. Documentez. Comprenez."
        visual={<VisualEvaluation />}
        reverse
        surface="white"

        action={{ label: 'En savoir plus', to: '/ressources#concepts' }}>
        <p>
          CYBERAS permet de structurer les évaluations, de conserver les preuves associées et
          d’identifier les écarts.
        </p>
        {/* Ce qui entre dans l'évaluation, nommé sans être détaillé : le filet
            supérieur sépare ces étiquettes du texte, qu'elles complètent sans
            en faire partie. */}
        <div className="flex flex-wrap gap-2 border-t border-[color:var(--s-border)] pt-5">
          {SOURCES_EVALUATION.map((source) => (
            <span key={source} className="s-badge">
              {source}
            </span>
          ))}
        </div>
      </SplitSection>

      {/* Le bleu très clair marque le basculement du constat vers l'action :
          c'est la charnière du parcours, et le visuel encadré de blanc s'y
          détache mieux que sur le gris des deux sections précédentes. */}
      <SplitSection
        id="remediation"
        title="Transformez vos constats en actions"
        visual={<VisualRemediation />}
        surface="soft"
      
        action={{ label: 'En savoir plus', to: '/ressources#concepts' }}>
        <p>
          Les écarts identifiés sont transformés en recommandations et en actions de remédiation,
          avec un suivi des responsables, des échéances et des statuts.
        </p>
      </SplitSection>

      {/* Les livrables. Cinq cartes en grille de trois puis deux : une grille à
          cinq colonnes écraserait chaque libellé sur deux lignes. */}
      <section id="resultats" className="s-section s-surface-navy">
        <div className="s-wrap">
          <SectionHead
            title="Des résultats directement exploitables"
            lead="CYBERAS transforme les données issues des évaluations en livrables structurés pour faciliter la prise de décision, la priorisation et le suivi de la cybersécurité."
            center
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LIVRABLES.map((livrable, i) => (
              /* La grille repart à zéro à chaque rangée de trois : un décalage
                 continu ferait entrer la cinquième carte une demi-seconde après
                 la première, et l'attente se verrait. */
              <Reveal key={livrable.title} delay={STAGGER[i % 3]}>
                <div className="s-card s-card-dark s-card-hover flex h-full flex-col">
                  <span className="s-icon-tile">{livrable.icon}</span>
                  <h3 className="mt-5 text-lg font-semibold text-[color:var(--s-text-strong)]">
                    {livrable.title}
                  </h3>
                  <p className="s-small mt-2 flex-1">{livrable.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Un titre et la chaîne, rien d'autre. Les cinq maillons résument le
          parcours que les sections précédentes viennent de démontrer ; un
          paragraphe de plus ne ferait que le redire.

          Le gris redonne de l'air entre les livrables sombres et la clôture,
          et il fait ressortir les maillons, qui sont blancs : sur fond blanc,
          ils n'auraient tenu que par leur filet. */}
      <section className="s-section s-surface-alt">
        <div className="s-wrap">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="s-h2">De l’audit à l’action</h2>
          </Reveal>
          <Reveal delay={STAGGER[1]} className="mt-14">
            <FlowChain steps={LOGIQUE} />
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Votre cybersécurité mérite plus qu’un rapport d’audit."
        lead="Avec CYBERAS, transformez vos évaluations en une vision claire de vos risques, des priorités et des actions mesurables."
        primary={{ label: 'Lancer une évaluation', to: '/evaluation' }}
        secondary={{ label: 'Demander une démo', to: '/demo' }}
      />
    </>
  )
}
