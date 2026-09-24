import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from './SiteKit'
import { DemoButton } from './DemoButton'

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--s-primary)]">{children}</p>
  )
}

/**
 * Apparition des pages héritées.
 *
 * <p>Délègue au langage d'animation du site plutôt que de garder ses propres
 * valeurs : les pages encore bâties sur ce module : méthodologie, contact,
 * démonstration : s'animaient sur 500 ms avec la courbe par défaut, quand le
 * reste du site est passé à 600 ms et à la courbe commune. L'écart ne se
 * nomme pas, mais il se voit dès qu'on passe d'une page à l'autre.
 */
export function FadeIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return <Reveal delay={delay} className={className}>{children}</Reveal>
}

export function CtaBanner() {
  return (
    <section className="s-surface-alt px-4 py-20 sm:px-6">
      <FadeIn>
        <div className="mx-auto max-w-5xl rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] px-6 py-14 text-center shadow-xl">
          <h2 className="text-3xl font-extrabold text-[color:var(--s-text-strong)] sm:text-4xl">
            Prêt à transformer votre cybersécurité ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[color:var(--s-text-muted)]">
            Rejoignez les organisations qui font confiance à CYBERAS Intelligence pour protéger ce qui compte vraiment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {/* La vidéo par-dessus la page, et non la prise de rendez-vous :
                celui qui demande une démonstration veut qu'on lui montre, pas
                qu'on le rappelle dans trois jours. */}
            <DemoButton className="s-btn s-btn-primary" label="Voir la démo" />
            <Link
              to="/contact"
              className="s-btn s-btn-secondary"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

export function PageHero({ label, title, subtitle }: { label: string; title: ReactNode; subtitle: string }) {
  return (
    <section className="s-surface-alt px-4 pb-16 pt-20 text-center sm:px-6">
      <FadeIn>
        <SectionLabel>{label}</SectionLabel>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold text-[color:var(--s-text-strong)] sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[color:var(--s-text-muted)]">{subtitle}</p>
      </FadeIn>
    </section>
  )
}
