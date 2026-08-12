import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'

const solutions = [
  {
    name: 'AUDIT IA',
    icon: '🔍',
    description: 'Audits de sécurité assistés par l\'intelligence artificielle',
    features: ['Évaluation automatisée', 'Questionnaires personnalisés', 'Rapports détaillés', 'Recommandations IA'],
  },
  {
    name: 'PENTEST IA',
    icon: '⚔️',
    description: 'Tests de pénétration automatisés par intelligence artificielle',
    features: ['Scans réseau avancés', 'Détection de vulnérabilités', 'Exploitation assistée', 'Rapports techniques'],
  },
  {
    name: 'AUDIT + PENTEST',
    icon: '🛡️',
    description: 'Package complet pour une couverture maximale',
    features: ['Audit de conformité', 'Pentest complet', 'Plan de remédiation', 'Suivi SLA'],
  },
  {
    name: 'SOLUTION CUSTOM',
    icon: '⚙️',
    description: 'Solutions sur-mesure adaptées à votre organisation',
    features: ['Audit personnalisé', 'Infrastructure spécifique', 'Support dédié', 'Intégrations sur-mesure'],
  },
]

export function TarifsPage() {
  return (
    <>
      <PageHero
        label="Offres & Tarifs"
        title={
          <>
            Des solutions adaptées à votre <span className="text-brand">niveau de maturité</span>
          </>
        }
        subtitle="Tarifs sur demande. Sélectionnez une solution et demandez un devis personnalisé adapté à votre contexte."
      />

      {/* Solutions Grid */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <SectionLabel>Nos solutions</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
              Sélectionnez votre solution
            </h2>
            <p className="mt-3 max-w-2xl text-text-on-light-muted">
              Chaque solution est personnalisable selon votre organisation, secteur d'activité et besoins spécifiques.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {solutions.map((s, i) => (
              <FadeIn key={s.name} delay={i * 0.1}>
                <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-md transition-transform hover:scale-[1.01]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-3xl">{s.icon}</span>
                      <h3 className="mt-3 text-lg font-bold text-text-on-light">{s.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-text-on-light-muted mb-6">{s.description}</p>

                  <div className="mb-6 space-y-2">
                    {s.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check size={16} className="text-status-compliant flex-shrink-0" />
                        <span className="text-sm text-text-on-light">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={`/contact?type=${s.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark w-full justify-center"
                  >
                    Demander un devis <ArrowRight size={16} />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <SectionLabel>Comment ça marche ?</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Votre parcours vers la cybersécurité renforcée
            </h2>
          </FadeIn>

          <div className="mt-12 space-y-6">
            {[
              { step: '1', title: 'Sélection', desc: 'Vous choisissez la solution qui correspond à vos besoins.' },
              { step: '2', title: 'Demande de devis', desc: 'Vous remplissez un formulaire avec les détails de votre organisation.' },
              { step: '3', title: 'Analyse SMARTEX', desc: 'Notre équipe analyse votre demande et prépare une offre personnalisée.' },
              { step: '4', title: 'Réception du devis', desc: 'Vous recevez un devis détaillé adapté à votre contexte.' },
              { step: '5', title: 'Validation', desc: 'Vous acceptez le devis et nous créons votre compte administrateur.' },
              { step: '6', title: 'Accès plateforme', desc: 'Vous accédez à CYBERAS Intelligence et lancez vos audits/pentests.' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.05}>
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/20 border border-brand/40">
                    <span className="font-bold text-brand">{item.step}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-text-on-dark-muted">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / CTA */}
      <section className="bg-bg-light px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <h2 className="text-2xl font-bold text-text-on-light">
              Des questions sur nos tarifs ?
            </h2>
            <p className="mt-3 text-text-on-light-muted">
              Notre équipe est disponible pour discuter de votre budget, de vos besoins spécifiques et trouver la solution qui vous convient.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                to="/contact"
                className="rounded-md bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Demander un devis
              </Link>
              <a
                href="mailto:contact@smartex-expertises.com"
                className="rounded-md border border-slate-200 px-6 py-3 font-semibold text-text-on-light transition-colors hover:border-brand hover:text-brand"
              >
                Nous écrire
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
