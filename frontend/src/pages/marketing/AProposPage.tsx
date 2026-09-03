import { Target, Users, Building2 } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'

const blocks = [
  {
    icon: Target,
    title: 'Notre mission',
    description:
      "Rendre l'audit et la conformité cybersécurité mesurables, rapides et défendables. Un niveau de sécurité doit se démontrer par des preuves, pas se déclarer.",
  },
  {
    icon: Users,
    title: 'Le cabinet',
    description:
      "SMARTEX EXPERTISES réunit auditeurs certifiés, ingénieurs sécurité et spécialistes de l'analyse de données. CYBERAS Intelligence est la plateforme issue de cette pratique de terrain.",
  },
  {
    icon: Building2,
    title: 'Notre approche',
    description:
      "Chaque score est reproductible et rattaché à sa source : scan, preuve documentaire ou réponse au questionnaire. Aucune recommandation n'est émise sans référentiel à l'appui.",
  },
]

export function AProposPage() {
  return (
    <>
      <PageHero
        label="À propos"
        title={
          <>
            La cybersécurité, <span className="text-brand">mesurée et démontrée</span>
          </>
        }
        subtitle="CYBERAS Intelligence est développée par SMARTEX EXPERTISES, cabinet d'audit et de conseil en cybersécurité. La plateforme industrialise une méthode d'audit éprouvée : collecter des preuves réelles, les confronter aux référentiels, et en tirer des priorités défendables."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {blocks.map((b, i) => (
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
      <CtaBanner />
    </>
  )
}
