import { Link } from 'react-router-dom'
import {
  Cloud,
  Users,
  ShieldCheck,
  ArrowRight,
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
import { ReferentielsLogos } from '../../components/marketing/ReferentielsGrid'
import { DemoButton } from '../../components/marketing/DemoButton'

/**
 * Page « La solution ».
 *
 * <p>Trois temps : la présentation, portée par la couverture elle-même, les
 * référentiels, et les livrables. Les ancres `presentation`, `referentiels` et
 * `livrables` sont celles que siteNav.ts annonce. Les renommer casserait le
 * panneau sans rien signaler à la compilation, et un menu qui pointe dans le
 * vide ne se remarque pas : le visiteur croit seulement que la page a mal
 * défilé.
 *
 * <p>La présentation n'a plus de section à elle. Elle en avait une, juste sous
 * la couverture, qui redisait la couverture en plus long : on lisait deux fois
 * la même chose avant d'apprendre quoi que ce soit. Le texte de présentation
 * est donc devenu l'accroche de la couverture.
 *
 * <p>La méthodologie en cinq étapes a quitté cette page. Elle racontait la
 * même démarche que les quatre fonctions de l'onglet Fonctionnalités, à un
 * niveau de détail près, et le site la donnait donc deux fois. La page
 * /methodologie, qui traite du sujet pour elle-même, reste atteignable par le
 * pied de page.
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

export function SolutionPage() {
  return (
    <>
      {/* La couverture porte la présentation, et l'ancre `presentation` s'y
          pose. Le texte de présentation vivait dans une section juste en
          dessous, qui redisait la couverture en plus long : on lisait deux fois
          la même chose avant d'apprendre quoi que ce soit. */}
      <div id="presentation">
        <PageCover
          eyebrow="La solution"
          title={
            <>
              Une approche unifiée de la{' '}
              <span className="text-[color:var(--s-primary)]">cybersécurité</span>
            </>
          }
          lead="CYBERAS Intelligence est une solution digitale d’audit et de pilotage de la cybersécurité qui permet de structurer votre démarche, d’évaluer votre niveau de sécurité, d’identifier vos écarts et de suivre les actions d’amélioration. Elle s’appuie sur un socle de contrôles unifié prenant en compte différents référentiels, normes et bonnes pratiques."
          actions={
            <>
              <Link to="/inscription" className="s-btn s-btn-primary">
                Créer un compte <ArrowRight size={18} />
              </Link>
              <DemoButton />
              <Link to="/fonctionnalites" className="s-btn s-btn-secondary">
                Voir les fonctionnalités
              </Link>
            </>
          }
          image="/images/soc.jpg"
          imageAlt="Centre opérationnel de sécurité : écrans de supervision et équipe au travail"
          reperes={PREALABLES.map((p) => p.nom)}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 02 · Référentiels                                                   */}
      {/* ------------------------------------------------------------------ */}
      {/* Le texte à gauche, les marques à droite, et un seul lien de sortie.
          La grille complète tenait ici : neuf cartes portant chacune l'objet du
          cadre et son propre lien « Détail », soit neuf renvois vers la même
          page. C'était une page de référence posée au milieu d'une page qui
          parle de la démarche. Les logos disent sur quoi le socle s'appuie, le
          lien unique mène à ceux qui veulent le détail. */}
      <section id="referentiels" className="s-section s-surface-white">
        <div className="s-wrap">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-[color:var(--s-primary-soft)] px-2.5 py-1 text-xs font-bold text-[color:var(--s-primary)]">
                  02
                </span>
                <Eyebrow>Référentiels</Eyebrow>
              </div>
              <h2 className="s-h2 mt-4">Plusieurs référentiels. Une vision consolidée.</h2>
              <p className="s-body s-measure mt-5">
                Les organisations sont souvent confrontées à une multiplication des normes,
                référentiels et exigences. CYBERAS y répond par un socle de contrôles unifié qui
                rapproche les exigences et construit une évaluation consolidée.
              </p>
              <p className="s-small s-measure mt-4">
                Selon le périmètre retenu, CYBERAS peut également structurer des exigences
                réglementaires, sectorielles, ainsi que vos politiques et exigences internes. Une
                exigence est rapprochée d’un contrôle commun lorsque les correspondances
                méthodologiques le permettent.
              </p>
              <Link to="/ressources#referentiels" className="s-btn s-btn-secondary mt-8">
                Découvrir les référentiels <ArrowRight size={16} />
              </Link>
            </Reveal>

            <Reveal delay={STAGGER[1]}>
              <ReferentielsLogos />
            </Reveal>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 04 · Livrables                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section id="livrables" className="s-section s-surface-navy">
        <div className="s-wrap">
          <SectionHead
            eyebrow="03 · Livrables"
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
        secondaryAction={<DemoButton />}
      />
    </>
  )
}
