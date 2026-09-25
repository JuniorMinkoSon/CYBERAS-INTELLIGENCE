import { Link } from 'react-router-dom'
import { ArrowRight, Check, Building2, UserCheck, Layers, Lock, History, KeyRound, ShieldCheck } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'
import { DemoButton } from '../../components/marketing/DemoButton'
import { capabilities } from '../../data/content'

/**
 * Page Plateforme.
 *
 * <p>Elle promettait « dix modules » en en montrant cinq, chacun suivi du même
 * « Voir en démo → ». Elle dit maintenant ce que la plateforme fait, écran par
 * écran, avec la voix de l'accueil : ce qu'on obtient, pas ce qu'on vend.
 * Un seul appel à l'action par section, et les ancres que le pied de page
 * utilise (#audits, #scans, #risques, #rapports).
 *
 * <p>Quatre temps : ce qu'elle fait, pourquoi une seule saisie suffit, pour
 * qui elle est faite, et ce qui garantit la confiance.
 */

const REUSE = [
  {
    from: 'Une réponse au questionnaire',
    to: ['le score de maturité du domaine', 'la carte des risques', 'la recommandation associée'],
  },
  {
    from: 'Un constat de scan',
    to: ['le score d’exposition', 'la cotation du risque concerné', 'le rapport technique'],
  },
  {
    from: 'Une preuve déposée',
    to: ['la question qu’elle démontre', 'le contrôle du référentiel', 'le dossier d’audit externe'],
  },
]

const AUDIENCES = [
  {
    icon: Building2,
    title: 'Direction et RSSI',
    text: 'Un score d’exposition, une carte des risques et un plan d’action priorisé pour arbitrer sans lire cent pages.',
    facts: ['Tableau de bord', 'Rapport exécutif', 'Suivi dans le temps'],
  },
  {
    icon: UserCheck,
    title: 'Auditeurs et équipes sécurité',
    text: 'Une mission cadrée, un questionnaire guidé, des preuves rattachées à chaque contrôle et des scans sur périmètre déclaré.',
    facts: ['Missions par référentiel', 'Preuves par question', 'Constats par service exposé'],
  },
  {
    icon: Layers,
    title: 'Groupes et donneurs d’ordre',
    text: 'Inscrivez plusieurs sociétés dans un projet d’évaluation, remettez-leur un accès, puis comparez et classez leurs résultats.',
    facts: ['Projets multi-sociétés', 'Accès par lien', 'Classement par mérite'],
  },
]

const TRUST = [
  { icon: Lock, title: 'Données cloisonnées par organisation', text: 'Chaque société ne voit que les siennes ; l’administration de la plateforme est réservée à une organisation désignée.' },
  { icon: KeyRound, title: 'Rôles et droits par mission', text: 'Administrateur, RSSI, auditeur, lecteur : chacun accède à ce que sa mission demande, pas davantage.' },
  { icon: History, title: 'Journal de toutes les actions', text: 'Qui a répondu, déposé, scanné, invité : et quand. C’est précisément ce qu’un audit vient vérifier.' },
  { icon: ShieldCheck, title: 'Scans sur périmètre autorisé', text: 'Un scan ne part que sur une cible que vous avez déclarée et êtes autorisé à tester. Toute autre est refusée.' },
]

export function PlateformePage() {
  return (
    <>
      <PageHero
        label="Plateforme"
        title={
          <>
            Une seule plateforme, <span className="text-brand">du questionnaire au rapport</span>.
          </>
        }
        subtitle="Ce que vous déclarez, ce que vos scans constatent et ce que l’IA en déduit vivent au même endroit. Une information saisie une fois sert à l’audit, au risque, à la conformité et au rapport."
      />

      {/* Ce qu'elle fait : six capacités, chacune un écran réel de l'application. */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Ce que vous faites avec</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
              Six étapes, un seul espace.
            </h2>
            <p className="mt-4 text-text-on-light-muted">
              Chaque bloc ci-dessous est un écran de la plateforme, dans l’ordre où une mission le traverse.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => (
              <FadeIn key={c.slug} delay={(i % 3) * 0.06}>
                <article
                  id={c.slug}
                  className="flex h-full scroll-mt-24 flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10">
                      <c.icon size={20} className="text-brand" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-on-light-muted">Étape {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-text-on-light">{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-on-light-muted">{c.promise}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {c.facts.map((f) => (
                      <li key={f} className="rounded-full border border-slate-200 bg-surface-light px-2.5 py-1 text-[11px] font-medium text-text-on-light">
                        {f}
                      </li>
                    ))}
                  </ul>
                </article>
              </FadeIn>
            ))}
          </div>

          {/* Un seul appel à l'action pour la section, pas un par carte. */}
          <FadeIn className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DemoButton
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              label="Voir la plateforme en démonstration"
            />
            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-text-on-light transition-colors hover:border-slate-400"
            >
              Créer un compte et essayer
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Une saisie, plusieurs usages : l'argument central, montré plutôt qu'affirmé. */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Une saisie, plusieurs usages</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Vous n’entrez jamais deux fois la même information.
            </h2>
            <p className="mt-4 text-text-on-dark-muted">
              Les outils séparés obligent à ressaisir : le questionnaire dans un tableur, les scans dans un autre outil,
              le rapport à la main. Ici, tout ce qui entre alimente le reste.
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {REUSE.map((r, i) => (
              <FadeIn key={r.from} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-border-dark bg-surface-dark p-6">
                  <p className="text-sm font-semibold text-white">{r.from}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-text-on-dark-muted">alimente</p>
                  <ul className="mt-3 space-y-2">
                    {r.to.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-text-on-dark">
                        <ArrowRight size={14} className="mt-1 shrink-0 text-brand" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui. */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Pour qui</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
              Trois façons de s’en servir.
            </h2>
          </FadeIn>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {AUDIENCES.map((a, i) => (
              <FadeIn key={a.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                    <a.icon size={20} className="text-brand" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-text-on-light">{a.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-on-light-muted">{a.text}</p>
                  <ul className="mt-4 space-y-1.5">
                    {a.facts.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-on-light">
                        <Check size={14} className="shrink-0 text-brand" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Cadre de confiance : repris du pied de page, développé ici où il a sa place. */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Cadre de confiance</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Ce que la plateforme garantit, par construction.
            </h2>
          </FadeIn>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {TRUST.map((t, i) => (
              <FadeIn key={t.title} delay={i * 0.06}>
                <div className="flex h-full gap-4 rounded-xl border border-border-dark bg-surface-dark p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <t.icon size={18} />
                  </span>
                  <span>
                    <span className="block font-semibold text-white">{t.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-text-on-dark-muted">{t.text}</span>
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
