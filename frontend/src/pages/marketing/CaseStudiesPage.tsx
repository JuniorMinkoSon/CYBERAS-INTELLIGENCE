import { Link } from 'react-router-dom'
import {
  ArrowRight, Radar, ClipboardCheck, ShieldCheck, ListChecks, Building2,
} from 'lucide-react'
import { FadeIn, CtaBanner } from '../../components/marketing/Shared'

/**
 * Ce à quoi la plateforme sert, sans client imaginaire.
 *
 * <p>Cette page portait quatre études de cas et cinq ressources, toutes
 * inventées : « réduction de 65 % des risques critiques », « 50 % d'économies »,
 * « conformité HIPAA atteinte 100 % » — HIPAA étant une loi américaine sur la
 * santé, sans rapport avec le marché visé. Aucun de ces clients n'existe,
 * aucun de ces chiffres n'a été mesuré, et les cinq tuiles « livre blanc,
 * webinaire, article » étaient des boutons sans action.
 *
 * <p>Un chiffre inventé ne se rattrape pas : le premier prospect qui demande
 * la référence derrière « -65 % » met en doute tout le reste de la démonstration,
 * y compris ce qui est vrai. Et il y a de quoi tenir une page sans cela — la
 * plateforme fait réellement ces cinq choses.
 *
 * <p>Chaque scénario ci-dessous décrit donc un parcours que l'application
 * exécute, et renvoie vers l'écran qui le porte. Le jour où un client accepte
 * d'être cité, avec ses chiffres et son accord écrit, une étude de cas pourra
 * s'ajouter ici — nommée, datée, vérifiable.
 */

interface CasDUsage {
  icon: typeof Radar
  secteur: string
  titre: string
  situation: string
  demarche: string[]
  resultat: string
  lien: { label: string; to: string }
}

const CAS_DUSAGE: CasDUsage[] = [
  {
    icon: ClipboardCheck,
    secteur: 'Toutes activités',
    titre: 'Établir sa posture de sécurité',
    situation:
      'La direction demande où en est l’organisation, et personne ne dispose d’un chiffre qu’il puisse défendre.',
    demarche: [
      'Questionnaire de maturité, dix-huit domaines, cent dix-huit questions pondérées',
      'Pièces justificatives déposées et confrontées à ce qui est déclaré',
      'Score par domaine calculé côté serveur, contrôles faibles ordonnés',
    ],
    resultat:
      'Un niveau de maturité par domaine, les écarts entre le déclaré et le démontré, et la liste des contrôles à traiter en premier.',
    lien: { label: 'Voir la méthode', to: '/methodologie' },
  },
  {
    icon: Radar,
    secteur: 'Infrastructures exposées',
    titre: 'Connaître sa surface exposée',
    situation:
      'Des services ont été ouverts au fil des années, et l’inventaire de ce qui répond depuis l’extérieur n’existe plus.',
    demarche: [
      'Déclaration du périmètre, puis autorisation explicite de chaque cible',
      'Analyse des ports et des services par Nmap, sur le profil retenu',
      'Constats rattachés aux actifs, cotés selon l’exposition et la criticité',
    ],
    resultat:
      'La liste des services joignables, leur version lorsqu’elle est identifiable, et le niveau de risque de chaque exposition.',
    lien: { label: 'Voir la plateforme', to: '/plateforme' },
  },
  {
    icon: ShieldCheck,
    secteur: 'Certification, appels d’offres',
    titre: 'Se situer face à ISO 27001',
    situation:
      'Un client, un assureur ou un appel d’offres réclame une position claire sur les exigences de la norme.',
    demarche: [
      'Réponses du questionnaire rapprochées des contrôles de l’Annexe A',
      'État par contrôle : conforme, partiel, non conforme, ou non évalué',
      'Lecture parallèle sur le NIST CSF 2.0, par correspondance publiée',
    ],
    resultat:
      'Un état contrôle par contrôle, avec ce qui n’a pas encore été évalué distingué de ce qui est en défaut.',
    lien: { label: 'Voir les référentiels', to: '/referentiels' },
  },
  {
    icon: ListChecks,
    secteur: 'Toutes activités',
    titre: 'Tenir un plan d’action',
    situation:
      'Les recommandations du dernier audit sont dans un document que plus personne n’ouvre.',
    demarche: [
      'Chaque écart devient une action, rattachée au contrôle qui la motive',
      'Responsable, échéance et statut portés par l’action elle-même',
      'Échéance déduite du niveau de risque, pas choisie arbitrairement',
    ],
    resultat:
      'Un plan d’action dont l’avancement se mesure, et une réévaluation qui montre ce que les actions ont changé.',
    lien: { label: 'Voir le suivi', to: '/suivi' },
  },
  {
    icon: Building2,
    secteur: 'Groupes, multi-sites',
    titre: 'Évaluer plusieurs entités',
    situation:
      'Un groupe veut comparer ses filiales ou ses sites sur une même grille, sans refaire l’exercice à la main.',
    demarche: [
      'Un projet d’évaluation, plusieurs participants invités par code',
      'Même questionnaire, même pondération, donc des scores comparables',
      'Classements par domaine et par secteur une fois la campagne close',
    ],
    resultat:
      'Une vue consolidée du groupe, et la possibilité de situer chaque entité par rapport aux autres.',
    lien: { label: 'Voir les offres', to: '/offres' },
  },
]

export function CaseStudiesPage() {
  return (
    <div className="bg-bg-dark">
      <section className="px-4 pt-24 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="max-w-3xl">
            <span className="inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
              Cas d&rsquo;usage
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Ce que CYBERAS permet de <span className="text-brand">faire</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-text-on-dark-muted">
              Cinq situations courantes et le parcours que la plateforme propose pour chacune. Ce sont des
              scénarios d&rsquo;usage, pas des références clients : les missions menées ne sont pas publiées
              sans l&rsquo;accord écrit de l&rsquo;organisation concernée.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
          {CAS_DUSAGE.map((cas, i) => (
            <FadeIn key={cas.titre} delay={(i % 2) * 0.06}>
              <article className="flex h-full flex-col rounded-xl border border-border-dark bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10">
                    <cas.icon size={20} className="text-brand" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-on-dark-muted">
                    {cas.secteur}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold text-white">{cas.titre}</h2>
                <p className="mt-2 text-sm leading-relaxed text-text-on-dark-muted">{cas.situation}</p>

                <ul className="mt-5 space-y-2 border-t border-border-dark pt-5">
                  {cas.demarche.map((etape) => (
                    <li key={etape} className="flex gap-2.5 text-sm text-text-on-dark-muted">
                      <ArrowRight size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                      <span>{etape}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 rounded-lg border border-border-dark bg-black/20 p-4 text-sm leading-relaxed text-white">
                  {cas.resultat}
                </p>

                <Link
                  to={cas.lien.to}
                  className="group/btn mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-brand transition hover:text-brand-dark"
                >
                  {cas.lien.label}
                  <ArrowRight size={16} className="transition group-hover/btn:translate-x-1" />
                </Link>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      <CtaBanner />
    </div>
  )
}
