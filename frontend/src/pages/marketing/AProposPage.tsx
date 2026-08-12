import { Target, Users, Building2, Lightbulb, Globe, Shield } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'

const values = [
  {
    icon: Target,
    title: 'Notre mission',
    description:
      "Démocratiser l'accès à la cybersécurité de pointe grâce à l'intelligence artificielle.",
  },
  {
    icon: Users,
    title: "L'équipe",
    description:
      "Experts certifiés en sécurité, ingénieurs IA et professionnels reconnés mondialement.",
  },
  {
    icon: Building2,
    title: 'Partenaires',
    description:
      "Collaborations avec les acteurs majeurs du secteur cybersécurité et conformité.",
  },
]

const pillars = [
  {
    icon: Lightbulb,
    title: 'Innovation Technologique',
    desc: 'Solutions intelligentes pour moderniser la sécurité informatique et l\'audit de conformité.',
  },
  {
    icon: Globe,
    title: 'Portée Internationale',
    desc: 'Expertise conforme aux standards mondiaux (ISO 27001, NIST, PCI-DSS, RGPD).',
  },
  {
    icon: Shield,
    title: 'Cybersécurité de Classe Mondiale',
    desc: 'Plateforme sécurisée, audit de conformité robuste, protection maximale des données.',
  },
]

export function AProposPage() {
  return (
    <>
      <PageHero
        label="À propos"
        title={
          <>
            Expert en Cybersécurité et{' '}
            <span className="text-brand">Audit par IA</span>
          </>
        }
        subtitle="SMARTEX Expertises développe CYBERAS Intelligence : une solution d'audit et de pentest assistés par l'IA pour la sécurité informatique à l'échelle mondiale."
      />

      {/* Mission & Values */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {values.map((b, i) => (
            <FadeIn key={b.title} delay={i * 0.08}>
              <div className="h-full rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <b.icon size={22} className="text-brand" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-text-on-light">{b.title}</h2>
                <p className="mt-2 text-sm text-text-on-light-muted">{b.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <SectionLabel>Qui nous sommes</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Experts en cybersécurité et audit par intelligence artificielle
            </h2>
            <div className="mt-8 space-y-5 text-text-on-dark-muted">
              <p>
                SMARTEX Expertises a développé <strong className="text-white">CYBERAS Intelligence</strong> pour faciliter la sécurité informatique, l'audit de conformité et l'évaluation des risques de sécurité des systèmes d'information.
              </p>
              <p>
                Notre mission est de <strong className="text-white">démocratiser l'accès à l'expertise en cybersécurité</strong> en utilisant l'intelligence artificielle pour assister les professionnels et automatiser les tâches complexes d'audit.
              </p>
              <p>
                Nous accompagnons les organisations dans l'<strong className="text-white">identification, l'analyse et la gestion des risques</strong>, avec des solutions conformes aux standards internationaux (ISO 27001, NIST, PCI-DSS, RGPD).
              </p>
              <p>
                Par l'automatisation des audits de conformité et l'analyse intelligente des vulnérabilités, nous permettons aux équipes de sécurité de <strong className="text-white">se concentrer sur la stratégie plutôt que la routine</strong>.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <SectionLabel>Nos piliers</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
              Trois fondements pour votre confiance
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.08}>
                <div className="h-full rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                    <p.icon size={22} className="text-brand" />
                  </span>
                  <h3 className="mt-4 font-bold text-text-on-light">{p.title}</h3>
                  <p className="mt-2 text-sm text-text-on-light-muted">{p.desc}</p>
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
