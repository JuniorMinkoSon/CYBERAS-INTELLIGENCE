import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, Users } from 'lucide-react'
import {
  Reveal,
  Eyebrow,
  PageHead,
  SplitSection,
  CtaBand,
  STAGGER,
} from '../../components/marketing/SiteKit'
import { VisualPosture } from '../../components/marketing/SiteVisuals'

/**
 * Page « Fonctionnalités ».
 *
 * <p>Cinq domaines, un paragraphe chacun. La page dit ce que la plateforme
 * permet de faire, pas comment s'en servir : dès qu'un bloc prend trois
 * paragraphes, la page devient une documentation que personne ne lit avant
 * d'avoir acheté.
 *
 * <p>La composition change délibérément d'un domaine à l'autre — deux colonnes
 * asymétriques, une grille de deux cartes, une composition avec visuel, un bloc
 * centré. Cinq blocs bâtis sur le même gabarit et inversés une fois sur deux se
 * lisent comme une seule section répétée cinq fois : l'œil décroche au
 * troisième. Varier la forme oblige à regarder, et sépare les domaines mieux
 * qu'un trait.
 *
 * <p>Chaque forme reçoit maintenant sa surface, parce que la variété de
 * composition ne suffisait pas : cinq blocs différents posés sur le même blanc
 * se lisaient quand même comme une seule nappe. Gris pour l'en-tête, bleu très
 * clair pour les audits, navy pour le couple contrôles / preuves, gris pour
 * les tableaux de bord, blanc pour la collaboration.
 *
 * <p>Les ancres sont celles déclarées dans siteNav.ts. Elles sont posées sur
 * l'élément qui porte le titre du domaine, y compris quand ce n'est pas une
 * balise `section` : le décalage de la barre fixe s'applique à tout `[id]`.
 */

interface Domaine {
  id: string
  label: string
  title: string
  text: string
  objets: string[]
  /**
   * Où va le visiteur convaincu par ce domaine.
   *
   * La page n'en avait aucun : cinq domaines décrits, rien à cliquer, et le
   * seul chemin de sortie était la bande de fin. Chaque destination existe
   * réellement — aucune n'a été inventée pour meubler la ligne.
   */
  lien: { label: string; to: string }
}

const DOMAINES: Record<string, Domaine> = {
  audits: {
    id: 'audits',
    label: 'Audits & campagnes',
    title: 'Organisez vos audits simplement',
    text: 'Créez vos campagnes d’évaluation, définissez leur périmètre et suivez leur avancement depuis un espace centralisé.',
    objets: ['Créer', 'Planifier', 'Affecter', 'Suivre'],
    lien: { label: 'Lancer une évaluation', to: '/evaluation' },
  },
  controles: {
    id: 'controles',
    label: 'Contrôles & questionnaires',
    title: 'Évaluez chaque contrôle avec méthode',
    text: 'Construisez vos questionnaires, affectez les contrôles aux évaluateurs et centralisez les réponses dans une interface structurée.',
    objets: ['Questionnaires', 'Contrôles', 'Réponses', 'Scores'],
    lien: { label: 'Les référentiels couverts', to: '/ressources#referentiels' },
  },
  preuves: {
    id: 'preuves',
    label: 'Preuves & conformité',
    title: 'Gardez chaque élément sous contrôle',
    text: 'Associez les preuves aux contrôles évalués et conservez une traçabilité claire des éléments utilisés pour justifier les résultats.',
    objets: ['Preuves', 'Commentaires', 'Écarts', 'Traçabilité'],
    lien: { label: 'La documentation', to: '/ressources#documentation' },
  },
  tableaux: {
    id: 'tableaux-de-bord',
    label: 'Tableaux de bord',
    title: 'Visualisez ce qui compte',
    text: 'Suivez les indicateurs essentiels de vos audits à travers des tableaux de bord clairs et directement exploitables.',
    objets: ['Scores', 'Maturité', 'Écarts', 'Risques', 'Progression'],
    lien: { label: 'Voir les livrables', to: '/solution#resultats' },
  },
  collaboration: {
    id: 'collaboration',
    label: 'Collaboration & suivi',
    title: 'Faites travailler les équipes ensemble',
    text: 'Attribuez les contrôles et les actions, suivez les responsabilités et facilitez la coordination entre les différents acteurs de vos audits.',
    objets: ['Utilisateurs', 'Rôles', 'Responsabilités', 'Actions', 'Échéances'],
    lien: { label: 'Le suivi dans la durée', to: '/suivi' },
  },
}

/**
 * Les objets manipulés par un domaine.
 *
 * Toujours rendus en pilules, quelle que soit la composition du bloc : c'est le
 * seul repère constant de la page, et il permet de comparer deux domaines d'un
 * coup d'œil malgré des mises en page différentes.
 */
function Objets({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((objet) => (
        <span key={objet} className="s-badge">
          {objet}
        </span>
      ))}
    </div>
  )
}

/**
 * Carte de domaine, pour les deux blocs présentés côte à côte.
 *
 * La variante sombre est en dur parce que ces deux cartes sont les seules de
 * la page à être posées sur la surface navy : une carte blanche y aurait vu son
 * titre, réglé sur le jeton de texte fort, virer au blanc lui aussi.
 */
function CarteDomaine({ domaine }: { domaine: Domaine }) {
  return (
    <article id={domaine.id} className="s-card s-card-dark s-card-hover flex h-full flex-col">
      <Eyebrow>{domaine.label}</Eyebrow>
      <h2 className="s-h3 mt-3">{domaine.title}</h2>
      <p className="s-body mt-4 flex-1">{domaine.text}</p>
      <Objets
        items={domaine.objets}
        className="mt-6 border-t border-[color:var(--s-border)] pt-5"
      />
      <LienDomaine lien={domaine.lien} className="mt-5" />
    </article>
  )
}

/**
 * Sortie d'un bloc de domaine.
 *
 * Toujours le même traitement — lien d'action et flèche — quelle que soit la
 * composition qui l'accueille : cinq blocs de formes différentes ont besoin
 * d'un repère constant pour qu'on comprenne que la sortie est au même endroit
 * partout.
 */
function LienDomaine({
  lien,
  className = '',
}: {
  lien: { label: string; to: string }
  className?: string
}) {
  return (
    <Link to={lien.to} className={`s-link ${className}`}>
      {lien.label} <ArrowRight size={16} aria-hidden="true" />
    </Link>
  )
}

export function FonctionnalitesPage() {
  return (
    <>
      {/* L'en-tête n'avait aucun bouton : il fallait dérouler toute la page
          pour trouver une action. Un seul appel principal, et un lien
          secondaire vers les référentiels couverts — la question qui suit
          immédiatement « qu'est-ce que ça fait ? ». */}
      <PageHead
        eyebrow="Fonctionnalités"
        title="Les fonctionnalités essentielles pour piloter vos audits"
        lead="Une plateforme conçue pour organiser vos campagnes, structurer vos évaluations et suivre vos résultats depuis un même environnement."
        actions={
          <>
            <Link to="/demo" className="s-btn s-btn-primary">
              Demander une démonstration
            </Link>
            <Link to="/ressources#referentiels" className="s-btn s-btn-secondary">
              Les référentiels couverts
            </Link>
          </>
        }
      />

      {/* Audits & campagnes — deux colonnes inégales : le texte porte, la carte
          de droite ne fait qu'énumérer. Leur donner la même largeur laisserait
          croire qu'elles pèsent autant.

          Le bleu très clair sert ici de fond, pas d'accent : la carte reste
          blanche et se détache d'elle-même, alors que sur blanc elle n'aurait
          eu que son filet pour exister. */}
      <section id={DOMAINES.audits.id} className="s-section s-surface-soft">
        <div className="s-wrap">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
            <Reveal>
              <Eyebrow>{DOMAINES.audits.label}</Eyebrow>
              <h2 className="s-h2 mt-4">{DOMAINES.audits.title}</h2>
              <p className="s-body s-measure mt-6">{DOMAINES.audits.text}</p>
              <LienDomaine lien={DOMAINES.audits.lien} className="mt-8" />
            </Reveal>
            <Reveal delay={STAGGER[1]}>
              <div className="s-card">
                <span className="s-icon-tile">
                  <ClipboardList size={20} />
                </span>
                <Objets items={DOMAINES.audits.objets} className="mt-6" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Contrôles et Preuves partagent une grille : les deux domaines décrivent
          les deux faces d'un même geste — évaluer, puis justifier. Côte à côte,
          le lien se voit ; empilés, il faut l'écrire.

          C'est la seule section sombre de la page, et elle tombe au milieu :
          le couple évaluer / justifier est le cœur du métier, et le noircir le
          désigne comme tel. Répéter le navy plus bas lui ferait perdre
          exactement ce que cette place lui donne. */}
      <section className="s-section s-surface-navy">
        <div className="s-wrap">
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <CarteDomaine domaine={DOMAINES.controles} />
            </Reveal>
            <Reveal delay={STAGGER[1]}>
              <CarteDomaine domaine={DOMAINES.preuves} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Tableaux de bord — le seul domaine qui se montre mieux qu'il ne se
          décrit, donc le seul à recevoir un visuel. */}
      <SplitSection
        id={DOMAINES.tableaux.id}
        eyebrow={DOMAINES.tableaux.label}
        title={DOMAINES.tableaux.title}
        visual={<VisualPosture />}
        reverse
        surface="alt"
        action={DOMAINES.tableaux.lien}
      >
        <p>{DOMAINES.tableaux.text}</p>
        <Objets
          items={DOMAINES.tableaux.objets}
          className="border-t border-[color:var(--s-border)] pt-5"
        />
      </SplitSection>

      {/* Collaboration & suivi — bloc centré pour clore la page : le domaine
          concerne tous les autres, il n'appartient pas à une colonne.

          Blanc, et sans carte : le filet supérieur ne sert plus à rien dès que
          la section précédente a sa propre couleur, et le vide autour du texte
          est ici la mise en forme. */}
      <section id={DOMAINES.collaboration.id} className="s-section s-surface-white">
        <div className="s-wrap">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="s-icon-tile mb-5">
              <Users size={20} />
            </span>
            <Eyebrow>{DOMAINES.collaboration.label}</Eyebrow>
            <h2 className="s-h2 mt-4">{DOMAINES.collaboration.title}</h2>
            <p className="s-body mt-6">{DOMAINES.collaboration.text}</p>
          </Reveal>
          <Reveal delay={STAGGER[1]}>
            <Objets items={DOMAINES.collaboration.objets} className="mt-8 justify-center" />
            <div className="mt-8 flex justify-center">
              <LienDomaine lien={DOMAINES.collaboration.lien} />
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Découvrez CYBERAS en action"
        primary={{ label: 'Demander une démo', to: '/demo' }}
      />
    </>
  )
}
