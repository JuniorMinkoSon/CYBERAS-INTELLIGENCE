import { Link } from 'react-router-dom'
import { Check, X, ShieldCheck } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'
import { plans } from '../../data/content'

export function TarifsPage() {
  return (
    <>
      <PageHero
        label="Offres & Tarifs"
        title={
          <>
            Un plan pour chaque niveau de <span className="text-brand">maturité cyber</span>
          </>
        }
        subtitle="Deux formules, sans surcoût par module. TVA en sus."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Deux formules seulement : la période est portée par l'offre
              elle-même, un sélecteur mensuel/annuel ferait double emploi. */}
          <div className="mx-auto mt-2 grid max-w-4xl gap-6 md:grid-cols-2">
            {plans.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col rounded-xl border bg-white p-7 shadow-md ${
                    p.recommended ? 'border-brand ring-1 ring-brand' : 'border-slate-200'
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                      ⭐ Recommandé
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-text-on-light">{p.name}</h2>
                  <p className="mt-1 text-sm text-text-on-light-muted">{p.description}</p>
                  <p className="mt-5">
                    <span className="text-3xl font-extrabold text-text-on-light">{p.price}</span>{' '}
                    <span className="text-sm text-text-on-light-muted">{p.period}</span>
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      to={`/inscription?plan=${p.name}`}
                      className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                      {'Commencer →'}
                    </Link>
                    <Link
                      to="/inscription"
                      className="rounded-md border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-text-on-light transition-colors hover:border-slate-400"
                    >
                      Essayer gratuitement
                    </Link>
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
      {/*
        Passage à l'acte.
        Le visiteur qui compare des tarifs veut essayer, pas reprendre rendez-vous.
        Cette bande le mène directement à l'espace de travail — scan, audit,
        questionnaire — plutôt qu'à un formulaire de plus.
      */}
      <section className="bg-bg-dark px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Essayer maintenant</SectionLabel>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Lancer un test d&apos;intrusion
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-text-on-dark-muted sm:text-base">
            Déclarez votre périmètre, lancez un scan et répondez au questionnaire
            de maturité. CYBERAS produit le score de risque, les recommandations
            et le rapport — sans intervention commerciale préalable.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/app/scans"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <ShieldCheck size={18} />
              Faire un test d&apos;intrusion
            </Link>
            <Link
              to="/app/questionnaire"
              className="inline-flex items-center gap-2 rounded-md border border-border-dark px-6 py-3 text-sm font-semibold text-text-on-dark transition-colors hover:border-brand hover:text-white"
            >
              Évaluer ma maturité
            </Link>
          </div>

          <p className="mt-5 text-xs text-text-on-dark-muted">
            Un scan n&apos;est lancé que sur un périmètre que vous avez déclaré et
            que vous êtes autorisé à tester. Toute autre cible est refusée.
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
