import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'
import { sectors } from '../../data/content'

export function SolutionsPage() {
  return (
    <>
      <PageHero
        label="Solutions"
        title={
          <>
            Une solution adaptée à <span className="text-brand">votre métier</span>
          </>
        }
        subtitle="Chaque secteur a ses menaces, ses régulations et ses priorités. CYBERAS Intelligence s'adapte à votre contexte réglementaire et opérationnel."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((s, i) => (
            <FadeIn key={s.title} delay={(i % 3) * 0.06}>
              <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-dark">
                  <s.icon size={22} className="text-brand" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-text-on-light">{s.title}</h2>
                <p className="mt-2 text-sm text-text-on-light-muted">{s.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  )
}
