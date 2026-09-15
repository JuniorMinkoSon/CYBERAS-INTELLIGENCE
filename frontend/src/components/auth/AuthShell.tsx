import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Logo } from '../marketing/Logo'

export interface Reassurance {
  icon: LucideIcon
  title: string
  text: string
}

interface Props {
  /** Phrase d'accroche du panneau latéral. */
  headline: ReactNode
  /** Ce que la personne obtient — trois points, pas plus. */
  reassurances: Reassurance[]
  children: ReactNode
}

/**
 * Coque des écrans de connexion et d'inscription.
 *
 * <p>Deux colonnes sur grand écran : à gauche ce que la plateforme apporte, à
 * droite le formulaire. Les deux pages partageaient déjà le même fond, le
 * même logo et le même bouton de retour, chacune avec sa copie ; les mettre
 * ici garantit qu'une retouche se voit des deux côtés.
 *
 * <p>Le panneau latéral n'est pas décoratif : quelqu'un qui hésite devant un
 * formulaire d'inscription veut savoir ce qu'il y a derrière avant de donner
 * son adresse. Sur écran étroit, il s'efface — le formulaire d'abord.
 */
export function AuthShell({ headline, reassurances, children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col bg-bg-dark text-text-on-dark">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-brand/70 blur-3xl" />
      </div>

      <header className="relative z-10 flex h-16 items-center justify-between px-4 sm:px-8">
        <Link to="/" aria-label="Accueil CYBERAS Intelligence">
          <Logo />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-medium text-text-on-dark-muted transition hover:text-white"
        >
          <ChevronLeft size={18} />
          Retour au site
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 pb-12 pt-4 sm:px-8 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-16">
        <aside className="hidden lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            <ShieldCheck size={14} />
            Cyberas Intelligence
          </p>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-white xl:text-4xl">{headline}</h1>
          <ul className="mt-8 space-y-5">
            {reassurances.map((r) => (
              <li key={r.title} className="flex gap-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-dark bg-surface-dark text-brand">
                  <r.icon size={18} />
                </span>
                <span>
                  <span className="block font-semibold text-white">{r.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-text-on-dark-muted">{r.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="w-full">{children}</section>
      </main>
    </div>
  )
}

/** Carte du formulaire : même cadre pour les deux écrans. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-dark bg-surface-dark/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="mt-1.5 text-sm text-text-on-dark-muted">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  )
}

/** Message d'erreur du formulaire, annoncé aux lecteurs d'écran. */
export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/60 bg-red-500/10 px-3.5 py-3 text-sm leading-relaxed text-red-300"
    >
      {message}
    </div>
  )
}

export const fieldCls =
  'w-full rounded-lg border border-border-dark bg-bg-dark py-2.5 text-text-on-dark placeholder:text-text-on-dark-muted/70 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand'

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span className="text-sm font-medium text-text-on-dark">{children}</span>
      {hint && <span className="text-xs text-text-on-dark-muted">{hint}</span>}
    </span>
  )
}
