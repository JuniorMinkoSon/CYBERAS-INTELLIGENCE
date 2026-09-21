import { Link } from 'react-router-dom'
import {
  Check,
  /* La poignée de main de cette version de lucide s'appelle HeartHandshake ;
     `Handshake` n'existe pas encore et la page ne se rendait pas. L'alias
     garde le nom qui dit ce que l'icône signifie ici : une prestation menée
     avec l'équipe, par opposition à la coche de ce que la plateforme fait. */
  HeartHandshake as Handshake,
  Layers, ClipboardCheck, FolderOpen, BarChart3, ListChecks, LayoutDashboard,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal, SectionHead, CtaBand, PageHead, STAGGER } from '../../components/marketing/SiteKit'

/**
 * Page « Offres ».
 *
 * <p>Le niveau d'offre ne se vend pas au nombre d'utilisateurs mais à la
 * profondeur de couverture : ce qui change d'une carte à l'autre, c'est
 * jusqu'où la cybersécurité est examinée. Une tarification au siège pousserait
 * à compter des comptes ; ici le client compare ce qu'il couvre.
 *
 * <p>Deux natures de lignes cohabitent dans les cartes, et la page les
 * distingue par l'icône plutôt que par un avertissement : ce que la plateforme
 * fait seule, et ce que l'équipe conduit avec le client. Le produit ne réalise
 * pas les campagnes de phishing ni les tests d'intrusion en autonomie ; les
 * annoncer comme des fonctions de l'outil serait une promesse fausse, les
 * taire priverait l'offre Business de sa substance.
 *
 * <p>Les prix ne sont pas arrêtés. Ils sont affichés « à définir » plutôt
 * qu'omis : une carte sans ligne de prix se lit comme une carte inachevée.
 *
 * <p>Les trois offres ne se distinguent plus par un label mais par leur
 * surface : neutre, accent bleu, navy. Un badge « le plus choisi » désigne un
 * gagnant et transforme un comparatif en classement ; le traitement visuel,
 * lui, donne un rythme de lecture sans rien recommander. Les fonds des
 * sections alternent pour la même raison : le blanc n'est qu'une surface
 * parmi quatre, et une page monochrome fait tout paraître de même poids.
 */

interface Ligne {
  label: string
  /** Vrai quand la ligne est une prestation conduite avec l'équipe, hors plateforme. */
  accompagne?: boolean
}

/**
 * Traitement visuel d'une carte d'offre.
 *
 * Trois valeurs, une par offre : la répétition d'un même ton sur deux cartes
 * annulerait la distinction qu'on cherche à produire.
 */
type Ton = 'neutre' | 'accent' | 'navy'

interface Offre {
  name: string
  promesse: string
  pitch: string
  lignes: Ligne[]
  price: string
  pricePrefix?: string
  cta: string
  to: string
  ton: Ton
}

/**
 * Classes de carte par ton.
 *
 * Le navy cumule `s-card-dark` et `s-surface-navy` : la première pose le fond,
 * la seconde inverse les jetons de texte et de bordure. Sans elle, les
 * `var(--s-text-strong)` posés dans la carte resteraient en navy sur navy —
 * l'inversion vient des surfaces, pas de la variante de carte.
 */
const TON_CARTE: Record<Ton, string> = {
  neutre: 's-card',
  accent: 's-card s-card-accent',
  navy: 's-card s-card-dark s-surface-navy',
}

const OFFRES: Offre[] = [
  {
    name: 'Essential',
    promesse: 'Évaluer et piloter',
    pitch: 'Le socle complet pour mesurer sa posture et la tenir dans le temps.',
    lignes: [
      { label: 'Évaluation globale de la posture' },
      { label: 'Évaluation sur les six référentiels du socle' },
      { label: 'Questionnaires structurés' },
      { label: 'Collecte et traçabilité des preuves' },
      { label: 'Analyse des écarts et scoring' },
      { label: 'Risques et recommandations' },
      { label: 'Suivi des actions de remédiation' },
    ],
    pricePrefix: 'À partir de',
    price: 'À définir',
    cta: 'Lancer une évaluation',
    to: '/evaluation',
    ton: 'neutre',
  },
  {
    name: 'Business',
    promesse: 'Évaluer, approfondir, tester, élargir la couverture',
    pitch: 'Tout l’Essential, plus les campagnes et les capacités techniques qui vont chercher ce qu’un questionnaire ne montre pas.',
    lignes: [
      { label: 'Tout le contenu de l’offre Essential' },
      { label: 'Campagnes de sécurité supplémentaires' },
      { label: 'Scans et analyses techniques' },
      { label: 'Campagnes récurrentes' },
      { label: 'Couverture élargie des domaines' },
      { label: 'Campagnes de phishing', accompagne: true },
      { label: 'Tests d’intrusion', accompagne: true },
    ],
    pricePrefix: 'À partir de',
    price: 'À définir',
    cta: 'Lancer une évaluation',
    to: '/evaluation',
    ton: 'accent',
  },
  {
    name: 'Enterprise',
    promesse: 'Adapter CYBERAS aux environnements complexes',
    pitch: 'Pour les organisations dont le périmètre ne tient pas dans une configuration standard.',
    lignes: [
      { label: 'Multi-entités et multi-périmètres' },
      { label: 'Vision consolidée du groupe' },
      { label: 'Besoins spécifiques de configuration' },
      { label: 'Intégrations avec votre environnement' },
      { label: 'Accompagnement dédié', accompagne: true },
    ],
    price: 'Sur devis',
    cta: 'Nous contacter',
    to: '/contact',
    ton: 'navy',
  },
]

const SOCLE: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Layers, title: 'Référentiels', text: 'Un socle de contrôles commun à plusieurs cadres.' },
  { icon: ClipboardCheck, title: 'Évaluations', text: 'Questionnaires, contrôles et campagnes.' },
  { icon: FolderOpen, title: 'Preuves', text: 'Collecte centralisée et traçabilité.' },
  { icon: BarChart3, title: 'Analyse', text: 'Écarts, scores de maturité et risques.' },
  { icon: ListChecks, title: 'Remédiation', text: 'Recommandations et actions suivies.' },
  { icon: LayoutDashboard, title: 'Pilotage', text: 'Indicateurs, historique et rapports.' },
]

export function OffresPage() {
  return (
    <>
      <PageHead
        eyebrow="Offres"
        title="Trois niveaux de couverture, un même produit."
        lead="Ce qui distingue les offres, ce n’est pas le nombre d’utilisateurs : c’est jusqu’où va l’examen de votre cybersécurité."
        /* Une page d'offres où l'on ne peut rien faire sans avoir déroulé
            jusqu'aux cartes demande un geste de trop. */
        actions={
          <Link to="/contact" className="s-btn s-btn-primary">
            Nous contacter
          </Link>
        }
      />

      {/* Les trois offres, sur blanc : c'est la surface la plus neutre, donc
          celle qui laisse les trois traitements de carte se distinguer. Une
          carte accentuée ne se voit que si son fond ne l'est pas. */}
      <section className="s-section s-surface-white">
        <div className="s-wrap">
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {OFFRES.map((o, i) => (
              <Reveal key={o.name} delay={STAGGER[i]} className="h-full">
                <div className={`${TON_CARTE[o.ton]} flex h-full flex-col`}>
                  <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-strong)]">
                    {o.name}
                  </h2>
                  <p className="mt-2 text-base font-semibold text-[color:var(--s-primary)]">
                    {o.promesse}
                  </p>
                  <p className="s-small mt-3">{o.pitch}</p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {o.lignes.map((l) => (
                      <li key={l.label} className="flex items-start gap-2.5">
                        {/* L'icône porte la distinction : coche pour ce que la
                            plateforme fait, poignée de main pour ce que
                            l'équipe conduit avec vous. */}
                        {l.accompagne ? (
                          <Handshake
                            size={16}
                            className="mt-0.5 shrink-0 text-[color:var(--s-primary)]"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-[color:var(--s-success)]"
                            aria-hidden="true"
                          />
                        )}
                        <span className="text-[0.9375rem] leading-snug text-[color:var(--s-text)]">
                          {l.label}
                          {l.accompagne && (
                            <span className="s-small block">Prestation conduite avec notre équipe</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 border-t border-[color:var(--s-border)] pt-5">
                    {o.pricePrefix && <span className="s-small block">{o.pricePrefix}</span>}
                    <span className="mt-1 block text-2xl font-bold text-[color:var(--s-text-strong)]">
                      {o.price}
                    </span>
                    {/* Un seul bouton par carte : deux CTA de même poids font
                        hésiter, et l'hésitation ne convertit pas.

                        Le bouton plein n'est posé que sur la carte accent, où
                        il a un fond clair à trancher. Sur la carte navy il
                        resterait du blanc sur bleu clair, illisible ; la
                        variante secondaire y devient transparente à filet
                        blanc, ce que la surface sombre prévoit déjà. */}
                    <Link
                      to={o.to}
                      className={`s-btn mt-5 w-full ${
                        o.ton === 'accent' ? 's-btn-primary' : 's-btn-secondary'
                      }`}
                    >
                      {o.cta}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* La légende des icônes, sous les trois cartes plutôt que répétée
              dans chacune : elle éclaire sans dramatiser. */}
          <Reveal delay={STAGGER[3]} className="mt-8">
            <p className="s-small flex items-start gap-2">
              <Handshake size={16} className="mt-0.5 shrink-0 text-[color:var(--s-primary)]" aria-hidden="true" />
              Les lignes marquées de ce signe sont les seules à mobiliser nos experts, sur un
              périmètre que vous autorisez ; leurs résultats reviennent dans la plateforme, où ils
              alimentent l’analyse, les risques et le plan d’actions. Tout le reste s’exécute dans
              le logiciel, conduit par vos équipes, sans intervention de notre part.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Le socle commun. Il évite de recopier sept lignes identiques dans
          chaque carte, et dit que rien n'est amputé à l'offre d'entrée.

          Bleu très clair : après le blanc des offres, une troisième surface
          plutôt qu'un retour au gris. Les cartes y restent blanches : le fond
          porte la couleur, les cartes restent neutres. */}
      <section className="s-section s-surface-soft">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Le même socle fonctionnel"
            title="Le cœur du produit est partagé par les trois offres."
            center
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SOCLE.map((s, i) => (
              /* Grille à trois colonnes : le décalage se reprend à chaque
                 rangée, sinon la sixième carte entrerait une demi-seconde
                 après la première et l'attente se verrait. */
              <Reveal key={s.title} delay={STAGGER[i % 3]}>
                <div className="s-card flex h-full gap-4">
                  <span className="s-icon-tile shrink-0">
                    <s.icon size={20} />
                  </span>
                  <span>
                    <span className="block font-semibold text-[color:var(--s-text-strong)]">
                      {s.title}
                    </span>
                    <span className="s-small mt-1 block">{s.text}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Quelle couverture pour votre organisation ?"
        lead="Commencez par une évaluation, ou parlons de votre périmètre avant de choisir."
        primary={{ label: 'Lancer une évaluation', to: '/evaluation' }}
        secondary={{ label: 'Nous contacter', to: '/contact' }}
      />
    </>
  )
}
