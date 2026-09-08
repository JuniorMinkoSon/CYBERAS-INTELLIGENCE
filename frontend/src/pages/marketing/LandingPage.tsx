import { Check } from 'lucide-react'
import { SectionLabel, FadeIn, CtaBanner } from '../../components/marketing/Shared'
import { CyberHero } from '../../components/marketing/CyberHero'
import { MethodologyTimeline } from '../../components/marketing/MethodologyTimeline'
import { ServicesSection } from '../../components/marketing/ServicesSection'
import { SolutionsCarousel } from '../../components/marketing/SolutionsCarousel'
import { ReferentielsCarousel } from '../../components/marketing/ReferentielsCarousel'
import { whyAuditBenefits } from '../../data/content'

function WhyAudit() {
  return (
    <section className="bg-bg-light px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <FadeIn>
          <SectionLabel>Pourquoi l'audit est essentiel ?</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
            Anticipez les menaces.
            <br />
            Protégez ce qui compte.
          </h2>
          <p className="mt-5 max-w-xl text-text-on-light-muted">
            Les cyberattaques deviennent plus fréquentes, plus rapides et plus coûteuses. Un audit régulier permet
            d'identifier les failles avant qu'elles ne soient exploitées et d'assurer la conformité avec les
            régulations en vigueur.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {whyAuditBenefits.map((b) => (
              <div key={b.title} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <Check size={16} className="text-brand" />
                </span>
                <span>
                  <span className="block font-semibold text-text-on-light">{b.title}</span>
                  <span className="block text-sm text-text-on-light-muted">{b.description}</span>
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="rounded-xl border border-slate-200 bg-surface-dark p-4 shadow-xl">
            <div className="grid grid-cols-4 gap-3">
              {[
                { v: '82%', l: 'Score global', c: 'text-status-compliant' },
                { v: '87', l: 'Vulnérabilités', c: 'text-status-high' },
                { v: '91%', l: 'Conformité ISO 27001', c: 'text-status-compliant' },
                { v: '04', l: 'Audits en cours', c: 'text-white' },
              ].map((k) => (
                <div key={k.l} className="rounded-lg border border-border-dark bg-bg-dark p-3 text-center">
                  <span className={`block text-2xl font-extrabold ${k.c}`}>{k.v}</span>
                  <span className="mt-1 block text-[10px] text-text-on-dark-muted">{k.l}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex h-40 items-end gap-1.5 rounded-lg border border-border-dark bg-bg-dark p-4">
              {[35, 55, 40, 70, 62, 80, 58, 88, 74, 92, 85, 96].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-brand/70" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/**
 * Page d'accueil.
 *
 * <p>Elle enchaînait neuf sections après la couverture. Un visiteur ne les lit
 * pas : il fait défiler jusqu'à trouver ce qu'il cherche, et une page longue
 * retarde ce moment au lieu de le préparer. Six suffisent à dire ce qu'est le
 * produit, comment il travaille et ce qu'il couvre.
 *
 * <p>Les deux carrousels sont conservés : ils présentent beaucoup de contenu
 * dans peu de hauteur, ce qui est exactement ce qu'on cherche sur une page
 * qu'on veut courte. Ils se placent après la méthodologie — le visiteur sait
 * alors comment on travaille avant de voir sur quoi.
 *
 * <p>Trois sections ont en revanche été retirées : bénéfices chiffrés,
 * secteurs et témoignages. Elles allongeaient la page sans rien dire que les
 * pages dédiées ne disent mieux. <strong>Leurs données restent dans le
 * catalogue</strong> ({@code data/content}).
 */
export function LandingPage() {
  return (
    <>
      <CyberHero />
      <ServicesSection />
      <WhyAudit />
      <MethodologyTimeline />
      <SolutionsCarousel />
      <ReferentielsCarousel />
      <CtaBanner />
    </>
  )
}
