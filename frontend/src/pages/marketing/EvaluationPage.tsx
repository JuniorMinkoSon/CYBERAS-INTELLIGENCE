import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Check, X, ShieldCheck, ArrowRight, UserPlus, MonitorPlay, Layers } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'
import { plans } from '../../data/content'

/**
 * Page Lancer une évaluation : les formules de collaboration et le passage à
 * l'acte.
 *
 * <p>Elle remplace l'ancienne page Tarifs, qui donnait les prix sans dire par
 * où commencer. Ici l'ordre est celui du visiteur : d'abord « comment je
 * démarre » — seul, accompagné, ou pour plusieurs sociétés — puis « avec
 * quelle formule ». Le prix vient après le chemin, pas avant.
 */

const WAYS = [
  {
    icon: UserPlus,
    title: 'Commencer seul, maintenant',
    text: 'Créez votre espace en deux minutes, déclarez un périmètre, répondez au questionnaire et lancez un scan. Le score et le rapport suivent — sans intervention commerciale.',
    cta: 'Créer mon espace',
    to: '/inscription',
    primary: true,
  },
  {
    icon: MonitorPlay,
    title: 'Être accompagné',
    text: 'Un diagnostic initial d’une heure avec SMARTEX Expertises, une démonstration sur votre contexte, puis une proposition adaptée.',
    cta: 'Prendre rendez-vous',
    to: '/demo',
    primary: false,
  },
  {
    icon: Layers,
    title: 'Évaluer plusieurs sociétés',
    text: 'Appel d’offres, filiales, prestataires : chaque société reçoit son accès, vous comparez les résultats et obtenez un classement par mérite.',
    cta: 'Demander un devis',
    to: '/contact',
    primary: false,
  },
]

export function EvaluationPage() {
  const { user } = useAuth()

  /**
   * Où mène le passage à l'acte.
   *
   * Un visiteur non connecté est envoyé à l'inscription : le renvoyer vers
   * l'espace de travail le ferait rebondir sur l'écran de connexion, ce qui se
   * lit comme un refus alors qu'il vient d'accepter. Un utilisateur déjà
   * connecté va directement à l'écran de scan.
   */
  const scanPath = user ? '/app/scans' : '/inscription'
  const questionnairePath = user ? '/app/questionnaire' : '/inscription'

  return (
    <>
      <PageHero
        label="Lancer une évaluation"
        title={
          <>
            Trois façons de démarrer, <span className="text-brand">deux formules et une offre sur mesure</span>.
          </>
        }
        subtitle="Choisissez le chemin qui vous ressemble ; la formule se décide ensuite, sans surcoût par module. TVA en sus."
      />

      {/* Par où commencer. */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Par où commencer</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">Seul, accompagné, ou à plusieurs.</h2>
          </FadeIn>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {WAYS.map((w, i) => (
              <FadeIn key={w.title} delay={i * 0.08}>
                <div className={`flex h-full flex-col rounded-xl border bg-white p-6 shadow-xs ${w.primary ? 'border-brand ring-1 ring-brand' : 'border-slate-200'}`}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                    <w.icon size={20} className="text-brand" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-text-on-light">{w.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-on-light-muted">{w.text}</p>
                  <Link
                    to={w.to}
                    className={`mt-5 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                      w.primary ? 'bg-brand text-white hover:bg-brand-dark' : 'border border-slate-300 text-text-on-light hover:border-slate-400'
                    }`}
                  >
                    {w.cta} <ArrowRight size={15} />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Formules. */}
      <section id="formules" className="scroll-mt-24 bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Formules de collaboration</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Un plan pour chaque niveau de maturité.</h2>
          </FadeIn>
          {/* Trois formules : la période est portée par l'offre elle-même, un
              sélecteur mensuel/annuel ferait double emploi. La troisième n'a
              pas de prix affiché — elle se négocie. */}
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
            {plans.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col rounded-xl border bg-white p-7 shadow-md ${
                    p.recommended ? 'border-brand ring-1 ring-brand' : 'border-slate-200'
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                      Recommandé
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-text-on-light">{p.name}</h3>
                  <p className="mt-1 text-sm text-text-on-light-muted">{p.description}</p>
                  <p className="mt-5">
                    <span className="text-3xl font-extrabold text-text-on-light">{p.price}</span>{' '}
                    <span className="text-sm text-text-on-light-muted">{p.period}</span>
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {p.onQuote ? (
                      <>
                        <Link to="/contact" className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
                          Demander un devis →
                        </Link>
                        <Link to="/demo" className="rounded-md border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-text-on-light transition-colors hover:border-slate-400">
                          Prendre rendez-vous
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to={`/inscription?plan=${p.name}`} className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
                          Commencer →
                        </Link>
                        <Link to="/inscription" className="rounded-md border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-text-on-light transition-colors hover:border-slate-400">
                          Essayer gratuitement
                        </Link>
                      </>
                    )}
                  </div>
                  <ul className="mt-7 space-y-3">
                    {p.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-2.5 text-sm">
                        {f.included ? (
                          <Check size={16} className="mt-0.5 shrink-0 text-status-compliant" />
                        ) : (
                          <X size={16} className="mt-0.5 shrink-0 text-slate-300" />
                        )}
                        <span className={f.included ? 'text-text-on-light' : 'text-text-on-light-muted line-through'}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Passage à l'acte pour qui est déjà décidé. */}
      <section className="bg-bg-light px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Essayer maintenant</SectionLabel>
          <h2 className="mt-4 text-2xl font-bold text-text-on-light sm:text-3xl">Lancer un premier scan ou évaluer votre maturité</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-text-on-light-muted sm:text-base">
            Déclarez votre périmètre, lancez un scan et répondez au questionnaire. CYBERAS produit le score, les
            recommandations et le rapport.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={scanPath} className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
              <ShieldCheck size={18} /> Faire un test d’intrusion
            </Link>
            <Link to={questionnairePath} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-text-on-light transition-colors hover:border-slate-400">
              Évaluer ma maturité
            </Link>
          </div>
          <p className="mt-5 text-xs text-text-on-light-muted">
            Un scan n’est lancé que sur un périmètre que vous avez déclaré et que vous êtes autorisé à tester.
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
