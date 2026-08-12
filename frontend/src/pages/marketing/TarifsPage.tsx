import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'

const plans = [
  {
    name: 'Starter',
    description: 'Pour les petites organisations',
    priceUSD: 199,
    priceEUR: 179,
    period: 'par mois',
    recommended: false,
    features: [
      { label: 'Audit IA limité (1x/mois)', included: true },
      { label: 'Jusqu\'à 5 actifs', included: true },
      { label: 'Conformité ISO 27001', included: true },
      { label: 'Rapports automatisés', included: true },
      { label: 'Support email', included: true },
      { label: 'Pentest IA', included: false },
      { label: 'API access', included: false },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    name: 'Professional',
    description: 'Pour les organisations en croissance',
    priceUSD: 599,
    priceEUR: 539,
    period: 'par mois',
    recommended: true,
    features: [
      { label: 'Audits IA illimités', included: true },
      { label: 'Jusqu\'à 50 actifs', included: true },
      { label: 'Conformité ISO 27001 + NIST', included: true },
      { label: 'Rapports personnalisés', included: true },
      { label: 'Support prioritaire', included: true },
      { label: 'Pentest IA limité', included: true },
      { label: 'API access', included: true },
      { label: 'Intégrations avancées', included: false },
    ],
  },
  {
    name: 'Enterprise',
    description: 'Pour les grandes organisations',
    priceUSD: 1499,
    priceEUR: 1349,
    period: 'par mois',
    recommended: false,
    features: [
      { label: 'Audits & pentests illimités', included: true },
      { label: 'Actifs illimités', included: true },
      { label: 'Tous les référentiels', included: true },
      { label: 'Rapports avancés + IA', included: true },
      { label: 'Support 24/7 dédié', included: true },
      { label: 'Pentest IA complet', included: true },
      { label: 'API access complet', included: true },
      { label: 'Intégrations sur-mesure', included: true },
    ],
  },
]

export function TarifsPage() {
  const [currency, setCurrency] = useState('USD')

  const getPrice = (plan: typeof plans[0]) => {
    return currency === 'USD' ? plan.priceUSD : plan.priceEUR
  }

  const getCurrencySymbol = () => currency === 'USD' ? '$' : '€'

  return (
    <>
      <PageHero
        label="Offres & Tarifs"
        title={
          <>
            Plans de cybersécurité adaptés à votre <span className="text-brand">maturité</span>
          </>
        }
        subtitle="Tarifs transparents en USD et EUR. Choisissez le plan qui correspond à vos besoins. Tous les plans incluent la plateforme CYBERAS Intelligence."
      />

      {/* Currency Selector */}
      <section className="bg-bg-light px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl flex justify-center">
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 shadow-xs">
            <button
              onClick={() => setCurrency('USD')}
              className={`rounded px-4 py-2 text-sm font-semibold transition ${
                currency === 'USD'
                  ? 'bg-brand text-white'
                  : 'text-text-on-light-muted hover:text-text-on-light'
              }`}
            >
              USD $
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`rounded px-4 py-2 text-sm font-semibold transition ${
                currency === 'EUR'
                  ? 'bg-brand text-white'
                  : 'text-text-on-light-muted hover:text-text-on-light'
              }`}
            >
              EUR €
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-bg-light px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col rounded-xl border bg-white p-7 shadow-md transition-all ${
                    p.recommended ? 'border-brand ring-2 ring-brand' : 'border-slate-200'
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                      ⭐ Recommandé
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-text-on-light">{p.name}</h2>
                  <p className="mt-1 text-sm text-text-on-light-muted">{p.description}</p>

                  {/* Price */}
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-extrabold text-text-on-light">
                      {getCurrencySymbol()}{getPrice(p).toLocaleString()}
                    </span>
                    <span className="text-sm text-text-on-light-muted ml-2">{p.period}</span>
                  </div>

                  {/* CTA */}
                  <Link
                    to="/contact"
                    className="mb-6 rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Démarrer →
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {p.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-2.5 text-sm">
                        {f.included ? (
                          <Check size={16} className="mt-0.5 shrink-0 text-status-compliant" />
                        ) : (
                          <X size={16} className="mt-0.5 shrink-0 text-slate-300" />
                        )}
                        <span
                          className={
                            f.included ? 'text-text-on-light' : 'text-text-on-light-muted line-through'
                          }
                        >
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

      {/* FAQ */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <SectionLabel>Questions fréquentes</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl mb-10">
              À propos de nos tarifs
            </h2>
          </FadeIn>

          <div className="space-y-6">
            {[
              {
                q: 'Puis-je annuler à tout moment ?',
                a: 'Oui, aucun engagement long terme. Vous pouvez annuler votre abonnement à tout moment.',
              },
              {
                q: 'Les tarifs incluent-ils le support ?',
                a: 'Oui, tous les plans incluent le support par email. Professional et Enterprise incluent le support prioritaire.',
              },
              {
                q: 'Y a-t-il une période d\'essai gratuit ?',
                a: 'Oui, 14 jours gratuits pour tester CYBERAS Intelligence. Aucune carte de crédit requise.',
              },
              {
                q: 'Proposez-vous des remises annuelles ?',
                a: 'Oui, 15% de réduction sur l\'engagement annuel pour tous les plans.',
              },
            ].map((item, i) => (
              <FadeIn key={item.q} delay={i * 0.08}>
                <div className="rounded-lg border border-border-dark/30 bg-surface-dark/50 p-6">
                  <h3 className="font-bold text-white">{item.q}</h3>
                  <p className="mt-2 text-text-on-dark-muted">{item.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-10 text-center">
            <p className="text-text-on-dark-muted mb-4">
              Des questions sur le tarif ou besoin d'une offre personnalisée ?
            </p>
            <Link
              to="/contact"
              className="inline-block rounded-md bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Nous contacter
            </Link>
          </FadeIn>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
