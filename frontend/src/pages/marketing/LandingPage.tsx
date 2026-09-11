import { Check } from 'lucide-react'
import { SectionLabel, FadeIn, CtaBanner } from '../../components/marketing/Shared'
import { CyberHero } from '../../components/marketing/CyberHero'
import { PriseEnMain } from '../../components/marketing/PriseEnMain'
import { CouvertureCarousel } from '../../components/marketing/CouvertureCarousel'
import { ServicesSection } from '../../components/marketing/ServicesSection'
import { whyAuditBenefits } from '../../data/content'

function WhyAudit() {
  return (
    <section className="bg-bg-light px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <FadeIn>
          <SectionLabel>Pourquoi l'audit est essentiel ?</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
            Anticipez les menaces à travers des audits réguliers de la sécurité de votre système.
          </h2>
          <p className="mt-5 max-w-xl text-text-on-light-muted">
            Les menaces de cyberattaques deviennent de plus en plus fréquentes, rapides et très coûteuses.
            Des audits réguliers permettent d'identifier les failles avant qu'elles ne soient exploitées
            et d'assurer la conformité avec les réglementations en vigueur.
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
            {/* Deux colonnes avant `sm`, quatre ensuite. À quatre colonnes sur
                un écran étroit, « Vulnérabilités » et « Conformité ISO 27001 »
                débordaient de leur carte : un libellé plus long que sa boîte ne
                se règle pas en réduisant la police, il se règle en donnant à la
                boîte la largeur qu'il demande. */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { v: '82%', l: 'Score global', c: 'text-status-compliant' },
                { v: '87', l: 'Vulnérabilités', c: 'text-status-high' },
                { v: '91%', l: 'Conformité ISO 27001', c: 'text-status-compliant' },
                { v: '04', l: 'Audits en cours', c: 'text-white' },
              ].map((k) => (
                <div
                  key={k.l}
                  className="min-w-0 rounded-lg border border-border-dark bg-bg-dark px-2 py-3 text-center"
                >
                  <span className={`block text-2xl font-extrabold ${k.c}`}>{k.v}</span>
                  {/* La césure prend le relais quand le mot reste plus large que
                      la colonne : le document est en français, le navigateur
                      sait où couper. */}
                  <span className="mt-1 block hyphens-auto break-words text-[10px] leading-tight text-text-on-dark-muted">
                    {k.l}
                  </span>
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
 * <p>Elle disait pourquoi l'audit compte et selon quelle méthode on travaille,
 * jamais ce que le visiteur aurait à faire une fois inscrit. C'est pourtant la
 * question qui décide d'un essai : combien de temps, par où commencer, ce
 * qu'on obtient au bout. La méthodologie — planification, collecte, analyse —
 * décrivait une démarche de conseil, pas la prise en main d'un service en
 * ligne ; elle cède la place à {@link PriseEnMain}.
 *
 * <p>Les deux carrousels sont retirés d'ici. Ils sont réussis, mais chacun
 * double une page dédiée que le menu atteint déjà — Solutions et Référentiels —
 * et leur place sur l'accueil repoussait vers le bas la seule section qui
 * répond à « qu'est-ce que je fais concrètement ». Le carrousel des
 * référentiels reste sur sa page.
 *
 * <p>Cinq sections, dans l'ordre d'un argumentaire : la promesse, le problème
 * qu'elle résout, ce qu'on propose pour le résoudre, comment on s'en sert, et
 * l'invitation à commencer. Les services venaient avant la problématique —
 * on présentait la réponse avant la question.
 */
export function LandingPage() {
  return (
    <>
      <CyberHero />
      <WhyAudit />
      <ServicesSection />
      <PriseEnMain />
      <CouvertureCarousel />
      <CtaBanner />
    </>
  )
}
