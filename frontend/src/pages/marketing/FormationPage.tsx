import {
  BookOpenCheck,
  Compass,
  Search,
  ListChecks,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Reveal,
  PageHead,
  SectionHead,
  FeatureCard,
  CtaBand,
  FlowChain,
  STAGGER,
} from '../../components/marketing/SiteKit'

/**
 * Page « Formation ».
 *
 * <p>Message unique, tenu du début à la fin : CYBERAS ne sert pas seulement à
 * produire un résultat, il sert à le comprendre. Un rapport que personne ne
 * sait lire ne change rien à la posture de sécurité d'une organisation.
 *
 * <p>Page volontairement courte. Pas de catalogue de modules, pas de programme
 * détaillé : ce qui est enseigné dépend des résultats de l'organisation, et
 * afficher un sommaire figé reviendrait à promettre l'inverse de ce que la
 * page affirme. Aucune durée non plus — elle se décide au cadrage.
 *
 * <p>Quatre surfaces pour quatre temps : gris d'en-tête, blanc pour le message
 * central, gris pour les six moments, bleu très clair pour l'approche, sombre
 * pour la clôture. Une page courte supporte mal le blanc continu — sans fonds
 * qui changent, ses quatre blocs se lisaient comme un seul, trop long.
 */

interface Apport {
  icon: ReactNode
  title: string
  text: string
}

/**
 * Les six moments où l'accompagnement intervient.
 *
 * Ils suivent l'ordre réel d'une évaluation : on comprend d'abord ce qu'on
 * lit, ensuite ce qu'on en fait. L'ordre inverse produit des plans d'action
 * bâtis sur des constats mal interprétés.
 */
const APPORTS: Apport[] = [
  {
    icon: <BookOpenCheck size={20} />,
    title: 'Comprendre les résultats',
    text: 'Savoir ce que disent un score, un niveau de maturité et un écart — et ce qu’ils ne disent pas.',
  },
  {
    icon: <Compass size={20} />,
    title: 'Accompagner les audits',
    text: 'Préparer les équipes à l’exercice : qui répond, sur quoi, et avec quelles pièces à l’appui.',
  },
  {
    icon: <Search size={20} />,
    title: 'Interpréter les constats',
    text: 'Distinguer un écart de forme d’une faiblesse réelle, et situer chaque constat dans son contexte.',
  },
  {
    icon: <ListChecks size={20} />,
    title: 'S’approprier les recommandations',
    text: 'Comprendre ce qu’une recommandation demande concrètement avant de l’attribuer à quelqu’un.',
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Piloter la progression',
    text: 'Lire l’évolution des scores et de la maturité d’une évaluation à la suivante.',
  },
  {
    icon: <Wrench size={20} />,
    title: 'Conduire la remédiation',
    text: 'Transformer un plan d’action en travail tenu : responsables, échéances et statuts.',
  },
]

/** Le trajet que la formation rend possible, en quatre maillons. */
const TRAJET = ['Résultats', 'Compréhension', 'Décision', 'Progression']

export function FormationPage() {
  return (
    <>
      <PageHead
        eyebrow="Formation"
        title="Produire un résultat ne suffit pas, encore faut-il savoir le lire"
        lead="La formation CYBERAS accompagne les organisations dans la compréhension de leurs évaluations et dans tout ce qui en découle."
        actions={
          <Link to="/contact" className="s-btn s-btn-primary">
            Nous contacter
          </Link>
        }
      />

      {/* Le message central, seul dans sa section. Le mettre au milieu d'une
          grille l'aurait dilué : c'est la raison d'être de la page.

          Blanc, entre deux surfaces grises : le contraste le plus fort de la
          page revient à son affirmation la plus importante. */}
      <section className="s-section s-surface-white">
        <div className="s-wrap">
          <Reveal className="max-w-3xl">
            <p className="s-body">
              Une plateforme d’évaluation produit des scores, des écarts, des risques et des
              recommandations. Ces objets n’ont d’effet que si les équipes qui les reçoivent savent
              ce qu’ils signifient, ce qu’ils imposent et par où commencer.
            </p>
            <p className="s-body mt-4">
              C’est le rôle de la formation : faire passer une organisation d’un rapport reçu à une
              démarche tenue.
            </p>
          </Reveal>

          <Reveal delay={STAGGER[1]} className="mt-12">
            <FlowChain steps={TRAJET} compact />
          </Reveal>
        </div>
      </section>

      {/* Ce que l'accompagnement couvre. Six cartes, pas un catalogue : ce sont
          des moments de la démarche, pas des modules vendus séparément.

          Le gris remplace les deux filets : dès que la surface change, le trait
          qui la bornait ne dit plus rien que le fond ne dise déjà. */}
      <section className="s-section s-surface-alt">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Ce que nous accompagnons"
            title="Six moments où l’accompagnement change le résultat"
            lead="Chacun correspond à une étape réelle de la démarche d’évaluation, du premier rapport au suivi des actions."
            center
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {APPORTS.map((apport, i) => (
              <Reveal key={apport.title} delay={STAGGER[i % 3]}>
                <FeatureCard icon={apport.icon} title={apport.title}>
                  {apport.text}
                </FeatureCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comment cela se passe. Trois points, aucun programme : le contenu
          dépend des résultats de l'organisation, et un sommaire figé
          contredirait la promesse.

          La rupture de la page tombe ici : c'est ce qui distingue cette
          formation d'un catalogue, et la teinte l'annonce avant la lecture.
          Trois blocs à filet supérieur, sans carte — le fond coloré porte déjà
          le contraste, une carte en plus l'aurait doublé pour rien. */}
      <section className="s-section s-surface-soft">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Notre approche"
            title="Construite sur vos propres résultats"
          />

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                titre: 'Sur votre contexte',
                texte:
                  'Le contenu part de votre secteur, de votre organisation et de votre niveau de maturité.',
              },
              {
                titre: 'Sur vos évaluations',
                texte:
                  'Les exemples travaillés sont vos propres constats, pas des cas génériques.',
              },
              {
                titre: 'Avec vos équipes',
                texte:
                  'Chaque public reçoit la lecture qui correspond à ce qu’il devra décider ou faire.',
              },
            ].map((item, i) => (
              <Reveal key={item.titre} delay={STAGGER[i]}>
                <div className="border-t border-[color:var(--s-border)] pt-6">
                  <h3 className="text-lg font-semibold text-[color:var(--s-text-strong)]">
                    {item.titre}
                  </h3>
                  <p className="s-small mt-2">{item.texte}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Faites de vos résultats une démarche comprise"
        lead="Parlons de votre contexte et de ce que vos équipes doivent pouvoir lire, décider et suivre."
        primary={{ label: 'Nous contacter', to: '/contact' }}
        secondary={{ label: 'Demander une démo', to: '/demo' }}
      />
    </>
  )
}
