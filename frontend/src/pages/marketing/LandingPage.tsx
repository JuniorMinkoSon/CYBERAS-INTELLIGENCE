import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ClipboardCheck, LineChart, ListTodo } from 'lucide-react'
import { useCoverLock } from '../../components/marketing/useCoverLock'
import {
  Reveal,
  Eyebrow,
  SectionHead,
  FlowChain,
  STAGGER,
  VISUAL_DELAY,
  REVEAL_EASE,
} from '../../components/marketing/SiteKit'
import { HeroVisual } from '../../components/marketing/HeroVisual'
import { HeroBackdrop } from '../../components/marketing/HeroBackdrop'
import { ReferentielsBand } from '../../components/marketing/ReferencesBand'
import { DeepSection } from '../../components/marketing/DeepSection'
import { GouvernanceIA } from '../../components/marketing/GouvernanceIA'
import { VisualSocle } from '../../components/marketing/SiteVisuals'

/**
 * Page d'accueil.
 *
 * <p>Six surfaces qui alternent du clair au sombre, dans cet ordre : gris pour
 * la couverture, blanc pour le socle, bleu très clair pour la méthode, navy
 * pour la technologie, gris pour les résultats, presque noir pour la clôture.
 * Le fond porte le rythme de la page ; les cartes restent neutres. Le blanc
 * partout donnait une succession de blocs flottants où rien ne se détachait.
 *
 * <p>Le contenu n'a pas changé. Ce qui change, c'est ce qui le porte.
 *
 * <p>Toutes les entrées passent par {@link Reveal} : même durée, même courbe,
 * même distance. Les décalages viennent de STAGGER, jamais d'une valeur
 * inventée sur place.
 */

const APPORTS = [
  {
    icon: ClipboardCheck,
    title: 'Collecter plus efficacement',
    text: 'Centraliser les données nécessaires à l’évaluation depuis différentes sources.',
    teinte: 'var(--s-cyan)',
  },
  {
    icon: LineChart,
    title: 'Analyser plus rapidement',
    /* La formulation nommait la technique employée. Le site dit ce que
       l'analyse apporte ; comment elle est obtenue relève de la documentation,
       pas de la page d'accueil. */
    text: 'Automatiser certaines analyses, croiser les données et accélérer l’identification des écarts.',
    teinte: 'var(--s-violet)',
  },
  {
    icon: ListTodo,
    title: 'Prioriser avec précision',
    text: 'Transformer les résultats en indicateurs, risques et recommandations exploitables.',
    teinte: 'var(--s-blue-light)',
  },
]

export function LandingPage() {
  const reduced = useReducedMotion()
  /* La couverture retient la page jusqu'au clic sur « Découvrir ». Voir
     useCoverLock pour les trois pièges que ce verrou évite. */
  const { sectionRef, locked, reveal } = useCoverLock()

  /**
   * Séquence du hero : label, titre, paragraphe, boutons, puis visuel.
   *
   * C'est le seul endroit du site où les éléments entrent un par un. La
   * couverture est la première chose qu'on voit, elle a le droit de se poser ;
   * ailleurs, un bloc entre d'un seul tenant.
   */
  const apparition = (index: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: index * 0.08, ease: REVEAL_EASE },
        }

  return (
    <>
      {/* Couverture — surface grise, tenue sur un écran tant que le verrou
          n'est pas levé. La barre fixe fait 72 px : la hauteur les déduit,
          sans quoi le bouton « Découvrir » tombe sous la ligne de flottaison
          et l'écran paraît coupé. */}
      <section
        ref={sectionRef}
        className={`s-surface-alt relative flex flex-col justify-center ${
          locked ? 'h-[calc(100vh-72px)] overflow-hidden' : 's-section'
        }`}
      >
        <HeroBackdrop />

        <div className="s-wrap relative">
          {/* Colonne de texte élargie : à parts presque égales, le titre
              cassait sur trois lignes. Le visuel garde assez de place pour
              rester lisible — il perd une cinquantaine de pixels, le titre
              gagne une ligne. */}
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <div>
              <motion.div {...apparition(0)}>
                <Eyebrow>CYBERAS Intelligence</Eyebrow>
              </motion.div>
              {/* Le titre précédent faisait une phrase entière et tombait sur
                  six lignes : à 56 px, une phrase ne se lit plus, elle se
                  déchiffre. Il est ramené à une affirmation courte, et tout ce
                  qu'il disait — le socle unifié, la vision des risques — est
                  passé dans l'accroche juste en dessous, où la taille du texte
                  le supporte. Rien n'a été perdu, seul le niveau a changé. */}
              <motion.h1 {...apparition(1)} className="s-h1 s-h1-hero mt-4 max-w-[22ch]">
                Renforcez votre posture de cybersécurité.
              </motion.h1>
              <motion.p {...apparition(2)} className="s-lead s-measure mt-6">
                Un socle unifié pour piloter votre cybersécurité à partir d’une vision claire de vos
                risques. CYBERAS centralise vos référentiels, vos contrôles, vos preuves et vos plans
                de remédiation afin de vous offrir une vision consolidée de votre posture et de
                faciliter la prise de décision.
              </motion.p>
              <motion.div {...apparition(3)} className="mt-8 flex flex-wrap gap-3">
                <Link to="/evaluation" className="s-btn s-btn-primary">
                  Lancer une évaluation
                </Link>
                <Link to="/solution" className="s-btn s-btn-secondary">
                  Découvrir la solution
                </Link>
              </motion.div>
            </div>

            <motion.div
              {...(reduced
                ? {}
                : {
                    initial: { opacity: 0, y: 24 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.6, delay: 0.32, ease: REVEAL_EASE },
                  })}
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>

        {/* Sortie du verrou. Le bouton reste affiché même une fois la page
            libérée : il devient alors un simple raccourci vers la suite, et le
            faire disparaître au clic donnerait l'impression que la commande
            s'est évaporée. */}
        {locked && (
          <motion.button
            type="button"
            onClick={reveal}
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { duration: 0.6, delay: 0.5, ease: REVEAL_EASE },
                })}
            /* Il était gris clair sur gris clair, donc invisible : la commande
               qui libère la page ne peut pas être l'élément le moins contrasté
               de l'écran. Fond bleu plein, texte blanc, et la flèche descend
               d'un cheveu au survol pour dire dans quel sens ça va. */
            className="group absolute inset-x-0 bottom-8 mx-auto s-btn s-btn-primary w-fit"
          >
            Découvrir
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="transition-transform group-hover:translate-y-0.5"
            />
          </motion.button>
        )}
      </section>

      {/* La chaîne de valeur. Bande étroite sur fond blanc : elle sépare la
          couverture de la suite sans peser comme une section. */}
      <section className="s-surface-white border-y border-[color:var(--s-border)] py-10 md:py-12">
        <div className="s-wrap">
          <Reveal>
            <FlowChain
              steps={['Audit', 'Analyse', 'Risques', 'Recommandations', 'Remédiation']}
              compact
            />
          </Reveal>
        </div>
      </section>

      {/* Les six référentiels du socle, en bandeau défilant. Sa place est ici,
          juste après la couverture : la question « sur quoi vous appuyez-vous ? »
          arrive avant l'argumentaire ou n'arrive pas.

          Le bandeau de clients existe aussi dans le même module, mais sa liste
          est vide tant qu'aucun accord écrit n'est confirmé, et il ne rend donc
          rien. */}
      <ReferentielsBand />

      {/* Le socle — surface blanche, visuel à droite.

          La page enchaîne gris, blanc, gris, blanc, bleu pâle, sombre, blanc,
          gris, très sombre : jamais deux fois la même surface d'affilée, ce qui
          était le défaut de la version précédente. */}
      <section className="s-section s-surface-white">
        <div className="s-wrap">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Eyebrow>Le socle</Eyebrow>
              <h2 className="s-h2 mt-4">Un socle unifié pour plusieurs référentiels</h2>
              <p className="s-body s-measure mt-6">
                CYBERAS rapproche les exigences et les contrôles issus de différents référentiels au
                sein d’un socle commun.
              </p>
              <Link to="/solution#socle" className="s-link mt-8">
                Découvrir la solution
              </Link>
            </Reveal>
            <Reveal delay={VISUAL_DELAY}>
              <VisualSocle />
            </Reveal>
          </div>
        </div>
      </section>

      {/* La méthode — surface bleu très clair. Trois maillons, rien d'autre :
          le détail vit dans « Lancer une évaluation ». */}
      <section className="s-section s-surface-soft">
        <div className="s-wrap">
          <SectionHead eyebrow="La méthode" title="Collecte, analyse, résultats." center />
          <Reveal delay={STAGGER[1]} className="mt-12">
            <FlowChain steps={['Collecte', 'Analyse', 'Résultats']} />
          </Reveal>
        </div>
      </section>

      {/* La technologie — grande section sombre, avec le réseau animé hérité du
          premier site. Elle casse la succession de surfaces claires, et c'est
          le seul endroit de la page où les accents cyan et violet apparaissent
          hors visualisation. Le réseau y a sa place : la section parle
          précisément de ce qui circule et se croise. */}
      <DeepSection>
        <>
          <SectionHead
            eyebrow="Technologie"
            title="Un diagnostic optimisé par la technologie"
            lead="CYBERAS combine questionnaires structurés, collecte de preuves, analyses automatisées, scans techniques et technologies d’intelligence artificielle pour accélérer le diagnostic et faciliter l’identification des risques."
            center
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {APPORTS.map((a, i) => {
              const Icon = a.icon
              return (
                <Reveal key={a.title} delay={STAGGER[i]}>
                  <div className="s-card s-card-dark flex h-full flex-col">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${a.teinte} 18%, transparent)`,
                        color: a.teinte,
                      }}
                    >
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{a.title}</h3>
                    <p className="s-small mt-2 flex-1">{a.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </>
      </DeepSection>

      {/* La section précédente annonce ce que la technologie apporte ; celle-ci
          dit sous quelles règles elle tourne. Les séparer laisserait la
          première sans contrepartie, ce qui est exactement le reproche fait aux
          discours sur l'IA. Fond blanc entre deux surfaces plus marquées : le
          contrat se lit mieux sans décor. */}
      <GouvernanceIA />

      {/* Les résultats — retour au gris, cartes blanches à filet coloré. */}
      <section className="s-section s-surface-alt">
        <div className="s-wrap">
          <SectionHead
            eyebrow="Les résultats"
            title="Ce que vous obtenez"
            lead="Des livrables structurés, faits pour décider et pour suivre."
            center
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { t: 'Tableau de bord', d: 'Vision globale de la posture.', c: 'var(--s-primary)' },
              { t: 'Analyse des risques', d: 'Niveaux et priorités.', c: 'var(--s-high)' },
              { t: 'Plan de remédiation', d: 'Actions, responsables, échéances.', c: 'var(--s-success)' },
            ].map((r, i) => (
              <Reveal key={r.t} delay={STAGGER[i]}>
                <div
                  className="s-card s-card-result h-full"
                  style={{ ['--s-accent' as string]: r.c }}
                >
                  <h3 className="text-lg font-semibold text-[color:var(--s-text-strong)]">{r.t}</h3>
                  <p className="s-small mt-2">{r.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={STAGGER[3]} className="mt-10 text-center">
            <Link to="/solution#resultats" className="s-link">
              Voir tous les livrables
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Clôture — le réseau revient une dernière fois, en retrait. Il relie le
          bas de page au haut sans répéter la section technologie. */}
      <DeepSection variant="deep">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="s-h2">Prêt à obtenir une vision claire de vos risques ?</h2>
          <p className="s-lead mt-5">
            Lancez une évaluation, ou demandez une démonstration sur votre contexte.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/evaluation" className="s-btn s-btn-primary">
              Lancer une évaluation
            </Link>
            <Link to="/demo" className="s-btn s-btn-secondary">
              Demander une démo
            </Link>
          </div>
        </Reveal>
      </DeepSection>
    </>
  )
}
