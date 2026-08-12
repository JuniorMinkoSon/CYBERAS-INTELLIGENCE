import { Target, Users, Building2, Lightbulb, Globe, Shield } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'

const values = [
  {
    icon: Target,
    title: 'Notre mission',
    description:
      "Démocratiser l'accès à la cybersécurité de pointe pour les organisations africaines grâce à l'intelligence artificielle.",
  },
  {
    icon: Users,
    title: "L'équipe",
    description:
      "Auditeurs certifiés, ingénieurs sécurité et experts IA engagés pour la souveraineté numérique du continent.",
  },
  {
    icon: Building2,
    title: 'Partenaires',
    description:
      "Collaborations avec régulateurs, intégrateurs et acteurs majeurs du numérique en Côte d'Ivoire et sous-région.",
  },
]

const pillars = [
  {
    icon: Lightbulb,
    title: 'Innovation Africaine',
    desc: 'Solutions technologiques pensées pour les réalités, contraintes et opportunités du continent.',
  },
  {
    icon: Globe,
    title: 'Portée Internationale',
    desc: 'Expertise conforme aux standards mondiaux (ISO 27001, NIST, PCI-DSS, RGPD) avec une perspective africaine.',
  },
  {
    icon: Shield,
    title: 'Cybersécurité de Classe Mondiale',
    desc: 'Hébergement en Afrique, conformité internationale, protection maximale des données.',
  },
]

export function AProposPage() {
  return (
    <>
      <PageHero
        label="À propos"
        title={
          <>
            La cybersécurité intelligente,{' '}
            <span className="text-brand">Made in Africa</span>
          </>
        }
        subtitle="SMARTEX Expertises développe CYBERAS Intelligence : une solution d'audit et de pentest assistés par l'IA, conçue en Afrique pour répondre aux besoins des organisations africaines."
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

      {/* Made in Africa Section */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <SectionLabel>Made in Africa</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Une expertise africaine pour les défis africains
            </h2>
            <div className="mt-8 space-y-5 text-text-on-dark-muted">
              <p>
                SMARTEX Expertises croit en l'<strong className="text-white">innovation africaine</strong>. Nos solutions de cybersécurité et d'audit ne sont pas des outils génériques adaptés a posteriori pour le continent. Elles sont <strong className="text-white">conçues dès l'origine</strong> pour les contextes, régulations et enjeux spécifiques des organisations africaines.
              </p>
              <p>
                L'<strong className="text-white">intelligence artificielle</strong> que nous développons apprend des menaces et vulnérabilités régionales, des standards de conformité locaux (ANSSI, WAEMU), et des ressources limitées des IT teams africaines. Nos audits et pentests IA réduisent les coûts et les délais sans sacrifier la qualité.
              </p>
              <p>
                En hébergeant CYBERAS Intelligence en <strong className="text-white">Afrique</strong>, nous assurons la conformité aux lois de protection des données, la souveraineté numérique et la résilience opérationnelle. Vos données restent sur le continent.
              </p>
              <p>
                SMARTEX Expertises n'exporte pas des solutions occidentales rebranding. Nous créons de <strong className="text-white">la technologie africaine à portée internationale</strong>, conforme à ISO 27001, NIST, PCI-DSS et RGPD, mais pensée en Afrique.
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
