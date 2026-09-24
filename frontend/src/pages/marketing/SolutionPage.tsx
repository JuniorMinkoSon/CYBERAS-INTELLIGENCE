import { Link } from 'react-router-dom'
import {
  Cloud,
  Users,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Reveal,
  PageCover,
  SectionHead,
  SplitSection,
  CtaBand,
  STAGGER,
} from '../../components/marketing/SiteKit'
import {
  VisualSocle,
  VisualEvaluation,
  VisualRemediation,
  ApercuRapport,
  ApercuCartographie,
  ApercuRemediation,
  ApercuMatrice,
  ApercuTableauBord,
} from '../../components/marketing/SiteVisuals'
import { ReferentielsGrid } from '../../components/marketing/ReferentielsGrid'

/**
 * Page « La solution ».
 *
 * <p>Elle suit le trajet d'une évaluation plutôt que l'inventaire des modules :
 * ce qu'on rapproche (le socle), ce qu'on en tire (l'évaluation), ce qu'on en
 * fait (la remédiation), ce qu'il en reste (les résultats). Un visiteur qui
 * arrive ici ne cherche pas une liste de fonctions : il cherche à savoir si la
 * démarche tient debout.
 *
 * <p>Les ancres `socle`, `evaluation`, `remediation` et `resultats` sont celles
 * que le menu déroulant annonce dans siteNav.ts. Les renommer casserait le
 * panneau sans rien signaler à la compilation.
 *
 * <p>Les fonds suivent le trajet plutôt que de l'alterner mécaniquement : navy
 * pour la couverture, bleu très clair pour la méthodologie, gris pour le
 * socle, blanc pour l'évaluation, bleu très clair au moment où le constat
 * devient action, navy pour les livrables. Le blanc / gris en alternance
 * régulière ne séparait rien : deux nuances aussi proches se lisent comme une
 * seule page, et la lecture s'y aplatit.
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

/**
 * Les livrables. Chacun montre sa forme, pas seulement son nom.
 *
 * Les cartes ne portaient qu'une icône : cinq pictogrammes gris pour cinq
 * documents qu'on ne pouvait pas se représenter. Une cartographie des risques
 * est une grille de chaleur, un plan de remédiation une liste de barres
 * d'avancement ; les montrer dit en un coup d'œil ce que trois lignes de
 * texte peinent à décrire. Les aperçus sont partagés avec la page
 * Fonctionnalités, où figure la même rubrique.
 */
const LIVRABLES = [
  {
    apercu: <ApercuTableauBord />,
    title: 'Tableau de bord',
    text: 'Vision globale de la posture de cybersécurité.',
  },
  {
    apercu: <ApercuRapport />,
    title: "Rapport d'évaluation",
    text: "Résultats, écarts, constats et niveaux d'évaluation.",
  },
  {
    apercu: <ApercuCartographie />,
    title: 'Analyse des risques',
    text: 'Risques identifiés, niveaux et priorités.',
  },
  {
    apercu: <ApercuRemediation />,
    title: 'Plan de remédiation',
    text: 'Actions, responsables, échéances et statuts.',
  },
  {
    apercu: <ApercuMatrice />,
    title: 'Conformité par référentiel',
    text: 'Contrôles conformes, partiels ou en écart, cadre par cadre.',
  },
]

/**
 * Les trois préalables, sous l'en-tête.
 *
 * Ils répondent aux objections qui viennent avant la première question de
 * fond : faut-il installer quelque chose, qui conduit la mission, où vont les
 * données. Les laisser pour plus bas revenait à faire lire toute la page à
 * quelqu'un qui n'a pas encore obtenu ces trois réponses.
 */
const PREALABLES: { icon: LucideIcon; nom: string; legende: string }[] = [
  { icon: Cloud, nom: '100 % en ligne', legende: 'Sans installation' },
  { icon: Users, nom: 'Conduite par vos équipes', legende: 'En autonomie' },
  { icon: ShieldCheck, nom: 'Sécurisé et confidentiel', legende: 'Données protégées' },
]

/**
 * Le cycle d'une mission, en cinq étapes.
 *
 * <p>La page démontrait le parcours section par section sans jamais le poser
 * d'un seul tenant : on ne pouvait pas savoir, en arrivant, combien d'étapes
 * il fallait franchir ni où l'on s'engageait. Les cinq étapes le disent avant
 * le détail, et chacune ne liste que ce que les sections suivantes montrent.
 *
 * <p>Le cycle boucle : la remédiation ramène à la collecte. C'est ce qui
 * distingue un pilotage continu d'un audit ponctuel, et c'est la seule raison
 * d'afficher « amélioration continue » sous la chaîne.
 */
const ETAPES: { titre: string; points: string[] }[] = [
  {
    titre: 'Collecte des données',
    points: ['Questionnaires', 'Données déclaratives', 'Preuves et documents', 'Scans autorisés'],
  },
  {
    titre: 'Analyse',
    points: [
      'Identification des pratiques existantes',
      'Analyse des écarts',
      'Alignement avec les référentiels',
    ],
  },
  {
    titre: 'Évaluation',
    points: ['Mesure des niveaux de conformité', 'Évaluation des risques', 'Priorisation des écarts'],
  },
  {
    titre: 'Restitution',
    points: [
      'Tableaux de bord',
      'Rapports d’évaluation',
      'Cartographie des risques',
      'Recommandations',
    ],
  },
  {
    titre: 'Suivi de la remédiation',
    points: [
      'Plan d’actions',
      'Suivi des responsables',
      'Échéances et statuts',
      'Amélioration continue',
    ],
  },
]

export function SolutionPage() {
  return (
    <>
      <PageCover
        eyebrow="01 · Présentation"
        title={
          <>
            Une approche unifiée de la{' '}
            <span className="text-[color:var(--s-primary)]">cybersécurité</span>
          </>
        }
        lead="Plusieurs référentiels. Un seul socle pour structurer, évaluer et piloter votre cybersécurité. Les audits et les scans s’exécutent en ligne, conduits par vos équipes, sans installation ni intervention sur site."
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
      {/* Méthodologie                                                        */}
      {/* ------------------------------------------------------------------ */}
      {/* Le cycle avant le détail. Les sections suivantes le démontrent une à
          une, mais sans cette vue d'ensemble on ne savait pas, en arrivant,
          combien d'étapes il fallait franchir ni où l'on s'engageait. */}
      <section id="methodologie" className="s-section s-surface-soft">
        <div className="s-wrap">
          <SectionHead
            eyebrow="02 · Méthodologie"
            title="Un cycle simple et complet pour piloter votre cybersécurité"
            lead="CYBERAS s’appuie sur une méthodologie éprouvée en cinq étapes, de l’audit à l’action, pour une amélioration continue de votre posture de sécurité."
          />

          {/* Cinq colonnes sur grand écran, empilées en dessous : cinq cartes
              côte à côte sur téléphone tomberaient à deux mots par ligne. La
              flèche entre deux étapes ne sort qu'à l'horizontale, où elle a un
              sens ; empilée, la lecture de haut en bas dit déjà l'ordre. */}
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ETAPES.map((etape, i) => (
              <Reveal key={etape.titre} delay={STAGGER[i % STAGGER.length]}>
                <li className="s-card flex h-full list-none flex-col">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--s-primary)] text-[0.6875rem] font-bold text-white">
                      {i + 1}
                    </span>
                    <h3 className="text-[0.9375rem] font-semibold text-[color:var(--s-text-strong)]">
                      {etape.titre}
                    </h3>
                  </div>
                  <ul className="mt-4 flex-1 space-y-2">
                    {etape.points.map((p) => (
                      <li key={p} className="s-small flex items-start gap-2">
                        <span
                          className="mt-[0.4375rem] size-1 shrink-0 rounded-full bg-[color:var(--s-primary)]"
                          aria-hidden="true"
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                </li>
              </Reveal>
            ))}
          </ol>

          {/* La boucle. C'est elle qui distingue un pilotage continu d'un audit
              ponctuel, et c'est la seule raison d'écrire la mention. */}
          <Reveal delay={STAGGER[2]} className="mt-8">
            <p className="flex items-center justify-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]">
              <RefreshCw size={14} aria-hidden="true" />
              Amélioration continue
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Référentiels                                                        */}
      {/* ------------------------------------------------------------------ */}
      {/* Les logos des organismes, et le schéma du socle en dessous. Le schéma
          seul nommait « ISO 27001 », « NIST CSF » et « CIS v8 » en texte dans
          trois rectangles : il fallait reconnaître des sigles là où les logos
          se reconnaissent d'eux-mêmes. Le schéma reste, parce qu'il montre ce
          que la grille ne montre pas : la convergence vers un contrôle commun. */}
      <section id="socle" className="s-section s-surface-alt">
        <div className="s-wrap">
          <SectionHead
            eyebrow="03 · Référentiels"
            title="Un socle unifié pour plusieurs référentiels"
            lead="CYBERAS rapproche les exigences et les contrôles issus de différents référentiels au sein d’un socle commun : six cadres, cinq dimensions d’analyse."
            action={{ label: 'Le détail de chaque cadre', to: '/ressources#referentiels' }}
          />
          <div className="mt-10">
            <ReferentielsGrid />
          </div>
          <Reveal delay={STAGGER[2]} className="mx-auto mt-10 max-w-2xl">
            <VisualSocle />
          </Reveal>
        </div>
      </section>

      {/* Visuel à gauche ici, à droite ailleurs : l'inversion marque la section
          centrale du parcours plutôt que d'installer un zigzag régulier. */}
      <SplitSection
        id="evaluation"
        eyebrow="04 · Évaluation"
        title="Évaluez. Documentez. Comprenez."
        visual={<VisualEvaluation />}
        reverse
        surface="white"

        action={{ label: 'En savoir plus', to: '/ressources#referentiels' }}>
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
        eyebrow="05 · Actions & remédiation"
        title="Transformez vos constats en actions"
        visual={<VisualRemediation />}
        surface="soft"
      
        action={{ label: 'En savoir plus', to: '/ressources#referentiels' }}>
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
            eyebrow="06 · Livrables"
            title="Des livrables factuels et exploitables"
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
                  {livrable.apercu}
                  <h3 className="mt-4 text-lg font-semibold text-[color:var(--s-text-strong)]">
                    {livrable.title}
                  </h3>
                  <p className="s-small mt-2 flex-1">{livrable.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* La chaîne « De l'audit à l'action » tenait ici : cinq maillons qui
          résumaient le parcours. Elle disait la même chose que les cinq étapes
          de la Méthodologie, deux écrans plus haut, et la page se terminait
          donc en répétant son milieu. */}

      <CtaBand
        title="Votre cybersécurité mérite plus qu’un rapport d’audit."
        lead="Avec CYBERAS, transformez vos évaluations en une vision claire de vos risques, des priorités et des actions mesurables."
        primary={{ label: 'Lancer une évaluation', to: '/evaluation' }}
        secondary={{ label: 'Demander une démo', to: '/demo' }}
      />
    </>
  )
}
