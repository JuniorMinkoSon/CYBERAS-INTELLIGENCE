import { SectionLabel, FadeIn } from './Shared'

/**
 * Prise en main du produit, étape par étape.
 *
 * <p>La page disait pourquoi l'audit compte et selon quelle méthode on
 * travaille, jamais ce que le visiteur aurait à faire une fois inscrit. Or
 * c'est la question qui décide d'un essai : combien de temps, par où on
 * commence, ce qu'on obtient au bout.
 *
 * <p>Les étapes décrivent le produit tel qu'il fonctionne aujourd'hui, pas une
 * cible. Les durées sont celles d'un premier audit sur un petit périmètre —
 * annoncer moins ferait mentir la démonstration dès la première mission.
 */

interface Step {
  title: string
  body: string
  duration: string
  /** Ce que l'étape produit concrètement, et qui reste après elle. */
  outcome: string
}

const STEPS: Step[] = [
  {
    title: 'Créez votre espace',
    body: 'Compte, organisation, secteur. Rien à installer : Cyberas est un service en ligne, '
      + 'et vos données restent dans votre espace.',
    duration: '2 min',
    outcome: 'Un espace de travail prêt',
  },
  {
    title: 'Ouvrez une mission et choisissez votre référentiel',
    body: 'Vous nommez le périmètre à auditer et cochez le référentiel visé. ISO/IEC 27001 est '
      + 'disponible avec ses 93 contrôles ; NIST CSF et RGPD suivront sans changer votre saisie.',
    duration: '3 min',
    outcome: 'Une mission cadrée',
  },
  {
    title: 'Invitez les personnes concernées',
    body: 'Un audit ne se remplit pas seul. Chaque session peut être confiée à qui la maîtrise — '
      + "la gouvernance au RSSI, la technique à l'exploitation — et chacun ne voit que la mission "
      + 'à laquelle vous l\'avez invité.',
    duration: '2 min',
    outcome: 'Une équipe rattachée à la mission',
  },
  {
    title: 'Répondez, session par session',
    body: 'Cinq sessions courtes — organisationnel, conformité, technique, physique, humain — '
      + 'au lieu d\'un formulaire interminable. Les réponses vont de « pas du tout » à '
      + '« totalement » : aucun vocabulaire d\'auditeur à connaître. Tout est enregistré au fil '
      + 'de l\'eau, vous reprenez quand vous voulez.',
    duration: '25 à 40 min',
    outcome: 'Un état des lieux déclaré',
  },
  {
    title: 'Joignez vos pièces, lancez vos scans',
    body: 'Politique signée, registre, capture de configuration : chaque pièce se dépose sur la '
      + 'question qu\'elle étaye. Sur le périmètre technique que vous déclarez, un scan complète '
      + 'la photo. Une pièce illisible n\'a jamais valu une non-conformité chez nous — elle '
      + 'demande une vérification humaine.',
    duration: '10 min',
    outcome: 'Des réponses étayées, pas seulement déclarées',
  },
  {
    title: 'Obtenez votre score, vos écarts et votre rapport',
    body: 'Score de conformité par référentiel, affiché avec sa couverture — 75 sur 12 contrôles '
      + 'évalués ne vaut pas 75 sur 93, et nous le disons. Chaque écart nomme les questions à '
      + 'corriger, avec le motif du calcul en clair.',
    duration: 'immédiat',
    outcome: 'Un score défendable et un plan d\'action',
  },
]

export function PriseEnMain() {
  return (
    <section className="bg-bg-light px-4 py-20 sm:px-6" id="prise-en-main">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <SectionLabel>Comment ça se passe</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-text-on-light sm:text-4xl">
            De l'inscription au rapport, en une demi-journée
          </h2>
          <p className="mt-5 max-w-2xl text-text-on-light-muted">
            Six étapes, aucune installation, aucun consultant requis pour démarrer.
            Vous pouvez vous arrêter après chacune et reprendre plus tard.
          </p>
        </FadeIn>

        <ol className="mt-12 space-y-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={0.05 * i}>
              <li className="grid grid-cols-[2.25rem_1fr] gap-x-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-[2.25rem_1fr_auto]">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
                >
                  {i + 1}
                </span>

                <div className="min-w-0">
                  <h3 className="font-bold text-text-on-light">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-on-light-muted">
                    {step.body}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-brand">
                    → {step.outcome}
                  </p>
                </div>

                {/* La durée est annoncée d'emblée : c'est la première chose
                    qu'on veut savoir avant de s'engager dans un formulaire. */}
                <span className="col-start-2 mt-3 justify-self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-text-on-light-muted sm:col-start-3 sm:row-start-1 sm:mt-0 sm:justify-self-end">
                  {step.duration}
                </span>
              </li>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  )
}
