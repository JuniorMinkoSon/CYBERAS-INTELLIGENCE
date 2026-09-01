import { Link } from 'react-router-dom'
import { Check, X, Quote } from 'lucide-react'
import { SectionLabel, FadeIn, CtaBanner } from '../../components/marketing/Shared'
import { CyberHero } from '../../components/marketing/CyberHero'
import {
  modules,
  sectors,
  stats,
  methodologySteps,
  testimonials,
  whyAuditBenefits,
  comparison,
} from '../../data/content'

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

function Benefits() {
  return (
    <section className="bg-bg-dark px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionLabel>Des bénéfices mesurables</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Réduisez vos coûts. Gagnez du temps.
          </h2>
          <p className="mt-4 max-w-2xl text-text-on-dark-muted">
            CYBERAS Intelligence automatise jusqu'à 80% des tâches manuelles et optimise vos ressources pour un
            meilleur ROI.
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08}>
              <div className="h-full rounded-lg border border-border-dark bg-surface-dark p-6 shadow-md transition-transform hover:scale-[1.01]">
                <span className="text-4xl font-extrabold text-white">{s.value}</span>
                <span className="mt-1 block font-semibold text-brand">{s.label}</span>
                <p className="mt-3 text-sm text-text-on-dark-muted">{s.detail}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-14">
          <div className="relative grid overflow-hidden rounded-xl border border-border-dark md:grid-cols-2">
            <div className="bg-surface-dark p-8">
              <h3 className="font-bold text-white">{comparison.traditional.label}</h3>
              <ul className="mt-5 space-y-3">
                {comparison.traditional.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-text-on-dark-muted">
                    <X size={15} className="shrink-0 text-status-critical" /> {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-3xl font-extrabold text-status-critical">{comparison.traditional.duration}</p>
              <p className="text-xs text-text-on-dark-muted">par mission d'audit</p>
            </div>
            <div className="bg-bg-dark p-8">
              <h3 className="font-bold text-white">{comparison.cyberas.label}</h3>
              <ul className="mt-5 space-y-3">
                {comparison.cyberas.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-text-on-dark-muted">
                    <Check size={15} className="shrink-0 text-status-compliant" /> {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-3xl font-extrabold text-status-compliant">{comparison.cyberas.duration}</p>
              <p className="text-xs text-text-on-dark-muted">par mission d'audit</p>
            </div>
            <div className="absolute left-1/2 top-1/2 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border-dark bg-bg-dark text-sm font-extrabold text-white md:flex">
              VS
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function Modules() {
  return (
    <section className="bg-bg-light px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionLabel>Une plateforme modulaire</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
            Tous les outils pour une cybersécurité 360°
          </h2>
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map((m, i) => (
            <FadeIn key={m.slug} delay={(i % 5) * 0.06}>
              <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                  <m.icon size={20} className="text-brand" />
                </span>
                <h3 className="mt-4 font-bold text-text-on-light">{m.title}</h3>
                <p className="mt-2 flex-1 text-sm text-text-on-light-muted">{m.description}</p>
                <Link to="/plateforme" className="mt-4 text-sm font-semibold text-brand hover:underline">
                  En savoir plus →
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Sectors() {
  return (
    <section className="bg-surface-light px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionLabel>Conçu pour tous les secteurs</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
            Une solution adaptée à votre métier
          </h2>
        </FadeIn>
        <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4">
          {sectors.map((s) => (
            <div
              key={s.title}
              className="flex min-w-[220px] snap-start flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-xs"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-dark">
                <s.icon size={20} className="text-brand" />
              </span>
              <h3 className="mt-4 font-bold text-text-on-light">{s.title}</h3>
              <p className="mt-2 text-sm text-text-on-light-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Methodology() {
  return (
    <section className="relative overflow-hidden bg-bg-dark px-4 py-20 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(220,38,38,0.12), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-7xl">
        <FadeIn>
          <SectionLabel>Une méthodologie intelligente</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Une approche structurée en 6 étapes
          </h2>
        </FadeIn>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {methodologySteps.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.08}>
              <div className="relative text-center lg:text-left">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand/60 bg-surface-dark text-lg font-extrabold text-brand lg:mx-0">
                  {i + 1}
                </span>
                {i < methodologySteps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-14 top-7 hidden w-full border-t border-dashed border-border-dark-hover lg:block"
                  />
                )}
                <h3 className="mt-4 text-sm font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-xs text-text-on-dark-muted">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="bg-bg-light px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionLabel>Ils en parlent mieux que nous</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">Nos clients témoignent</h2>
        </FadeIn>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <FadeIn key={t.author + t.company} delay={i * 0.08}>
              <figure className="h-full rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <Quote size={22} className="text-brand" />
                <blockquote className="mt-4 text-sm text-text-on-light">{t.quote}</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-bold text-text-on-light">— {t.author}</span>
                  <span className="block text-text-on-light-muted">{t.company}</span>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  return (
    <>
      <CyberHero />
      <WhyAudit />
      <Benefits />
      <Modules />
      <Sectors />
      <Methodology />
      <Testimonials />
      <CtaBanner />
    </>
  )
}
