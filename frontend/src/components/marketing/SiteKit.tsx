import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

/**
 * Vocabulaire commun des pages du site vitrine.
 *
 * <p>Tout ce qui se répète d'une page à l'autre vit ici : l'en-tête de page,
 * l'en-tête de section, la bande d'appel à l'action, la composition
 * texte/visuel. Une page qui redéfinit sa propre version de l'un d'eux finit
 * par s'en écarter de trois pixels, puis de trois mots.
 *
 * <p>Les couleurs, rayons et hauteurs viennent de styles/site.css. Rien ici ne
 * fixe de valeur de charte en dur.
 */

/* =============================================================================
   Le langage d'animation du site

   Une seule apparition, partout : opacité 0 → 1 et translation de 24 px vers
   le haut, sur 600 ms, avec la même courbe. Titres, paragraphes, cartes,
   visuels et sections l'utilisent sans exception.

   Ce n'est pas une préférence de style. Des animations différentes d'une
   section à l'autre : l'une qui glisse, l'autre qui zoome, donnent une page
   qui semble assemblée de morceaux hétérogènes. Une seule règle, répétée,
   produit au contraire un rythme, et le rythme se lit comme de la finition.

   Le décalage entre éléments voisins se prend dans STAGGER plutôt qu'au
   jugé : quatre valeurs suffisent, et les écrire une fois empêche les
   0,07 s inventés au fil des pages.
   ============================================================================= */

/** Courbe et durée communes. Le pendant CSS vit dans styles/site.css. */
export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const
export const REVEAL_DURATION = 0.6

/** Décalages d'entrée, en secondes. Au-delà du quatrième, l'attente se voit. */
export const STAGGER = [0, 0.08, 0.16, 0.24] as const

/**
 * Décalage du visuel derrière son texte, dans une composition à deux colonnes.
 *
 * Le texte part en premier parce que c'est lui qui porte le sens ; le visuel
 * suit d'un souffle. Les deux partant ensemble, la colonne de droite happe le
 * regard avant que le titre soit lu.
 */
export const VISUAL_DELAY = 0.1

/** Les cinq familles de surfaces. Le nom dit le fond, pas la couleur. */
export type Surface = 'white' | 'alt' | 'soft' | 'navy' | 'deep'

const SURFACE_CLASS: Record<Surface, string> = {
  white: 's-surface-white',
  alt: 's-surface-alt',
  soft: 's-surface-soft',
  navy: 's-surface-navy',
  deep: 's-surface-deep',
}

/** Classe de fond d'une section. Le blanc reste le défaut, plus le systématique. */
export function surfaceClass(surface: Surface = 'white') {
  return SURFACE_CLASS[surface]
}

/**
 * Apparition au défilement.
 *
 * <p>Se déclenche quand la section entre dans le champ, une seule fois : un
 * élément qui rejoue son entrée à chaque passage transforme un aller-retour de
 * molette en clignotement.
 *
 * <p>`amount: 0.15` demande qu'environ 15 % du bloc soit visible. Sur un
 * visuel haut, attendre la moitié retarderait l'apparition bien après que
 * l'œil s'y est posé.
 *
 * <p>Quand le système signale une préférence pour moins de mouvement, rien ne
 * bouge et le contenu est là d'emblée. L'animation est un confort ; la lire
 * ne doit jamais en dépendre.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: '0px 0px 120px 0px' }}
      transition={{ duration: REVEAL_DURATION, delay, ease: REVEAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Surtitre de section. Le seul endroit où le site met des majuscules espacées. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="s-eyebrow">{children}</p>
}

/**
 * En-tête de page : surtitre, titre, accroche.
 *
 * L'accroche est facultative et volontairement courte : c'est la promesse,
 * pas le résumé de la page.
 */
export function PageHead({
  eyebrow,
  title,
  lead,
  actions,
  visual,
  surface = 'alt',
}: {
  eyebrow: string
  title: ReactNode
  lead?: string
  actions?: ReactNode
  /** Visuel posé à droite du texte. Sans lui, l'en-tête garde sa colonne unique. */
  visual?: ReactNode
  surface?: Surface
}) {
  const texte = (
    <Reveal className={visual ? '' : 'max-w-3xl'}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="s-h1 mt-4">{title}</h1>
      {lead && <p className="s-lead mt-6 s-measure">{lead}</p>}
      {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
    </Reveal>
  )

  return (
    /* Gris clair par défaut. L'en-tête posé sur blanc se confondait avec la
       première section, et la page commençait sans qu'on voie où. */
    <section className={`s-section ${surfaceClass(surface)}`}>
      <div className="s-wrap">
        {visual ? (
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {texte}
            <Reveal delay={VISUAL_DELAY}>{visual}</Reveal>
          </div>
        ) : (
          texte
        )}
      </div>
    </section>
  )
}

/**
 * En-tête de section, aligné à gauche par défaut, centré sur demande.
 *
 * `action` pose un renvoi à droite du titre, sur la même ligne de base : les
 * rubriques qui ont une page dédiée l'annoncent là où le regard arrive, pas en
 * bas après toute la grille. Il retombe sous le titre dès que la place manque.
 */
export function SectionHead({
  eyebrow,
  title,
  lead,
  center = false,
  action,
}: {
  eyebrow?: string
  title: ReactNode
  lead?: string
  center?: boolean
  action?: { label: string; to: string }
}) {
  const head = (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className={`s-h2 ${eyebrow ? 'mt-4' : ''}`}>{title}</h2>
      {lead && <p className={`s-lead mt-5 ${center ? '' : 's-measure'}`}>{lead}</p>}
    </Reveal>
  )

  if (!action) return head

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      {head}
      <Reveal delay={STAGGER[1]}>
        <Link to={action.to} className="s-btn s-btn-secondary">
          {action.label} <ArrowRight size={16} />
        </Link>
      </Reveal>
    </div>
  )
}

/**
 * Composition à deux colonnes : un bloc de texte, un visuel.
 *
 * `reverse` place le visuel à gauche. L'alternance ne doit pas être
 * mécanique : une page qui inverse à chaque section devient un zigzag, d'où
 * le choix laissé à l'appelant plutôt qu'un calcul sur l'indice.
 */
export function SplitSection({
  id,
  eyebrow,
  title,
  children,
  visual,
  reverse = false,
  alt = false,
  surface,
  action,
}: {
  id?: string
  eyebrow?: string
  title: ReactNode
  children: ReactNode
  visual: ReactNode
  reverse?: boolean
  /** Raccourci hérité vers la surface grise. `surface` le remplace. */
  alt?: boolean
  surface?: Surface
  action?: { label: string; to: string }
}) {
  const fond = surface ?? (alt ? 'alt' : 'white')
  return (
    <section id={id} className={`s-section ${surfaceClass(fond)}`}>
      <div className="s-wrap">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className={reverse ? 'lg:order-2' : ''}>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h2 className={`s-h2 ${eyebrow ? 'mt-4' : ''}`}>{title}</h2>
            <div className="s-body s-measure mt-6 space-y-4">{children}</div>
            {action && (
              <Link to={action.to} className="s-link mt-8">
                {action.label} <ArrowRight size={16} />
              </Link>
            )}
          </Reveal>
          <Reveal delay={VISUAL_DELAY} className={reverse ? 'lg:order-1' : ''}>
            {visual}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** Carte simple : pastille d'icône, titre, texte. */
export function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="s-card s-card-hover flex h-full flex-col">
      <span className="s-icon-tile">{icon}</span>
      <h3 className="mt-5 text-lg font-semibold text-[color:var(--s-text-strong)]">{title}</h3>
      <p className="s-small mt-2 flex-1">{children}</p>
    </div>
  )
}

/**
 * Bande d'appel à l'action de fin de page.
 *
 * Un seul bouton par défaut. La charte demande de ne pas multiplier les CTA :
 * deux boutons de même poids font hésiter, et l'hésitation ne convertit pas.
 */
export function CtaBand({
  title,
  lead,
  primary,
  secondary,
  surface = 'deep',
}: {
  title: string
  lead?: string
  primary: { label: string; to: string }
  secondary?: { label: string; to: string }
  surface?: Surface
}) {
  return (
    /* Sombre par défaut : la bande de fin ferme la page. Sur la surface grise
       qu'elle occupait, elle se lisait comme une section de plus, et la page
       paraissait s'arrêter faute de contenu plutôt qu'arriver à sa conclusion. */
    <section className={`s-section ${surfaceClass(surface)}`}>
      <div className="s-wrap">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="s-h2">{title}</h2>
          {lead && <p className="s-lead mt-5">{lead}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={primary.to} className="s-btn s-btn-primary">
              {primary.label}
            </Link>
            {secondary && (
              <Link to={secondary.to} className="s-btn s-btn-secondary">
                {secondary.label}
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/**
 * Chaîne d'étapes : horizontale sur grand écran, verticale sur mobile.
 *
 * Sert aux enchaînements du site : « Audit → Analyse → Risques… », « De
 * l'audit à l'action ». Sur téléphone, cinq libellés côte à côte tomberaient
 * à deux lettres par ligne ; la colonne est le seul rendu lisible.
 */
export function FlowChain({ steps, compact = false }: { steps: string[]; compact?: boolean }) {
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2 sm:gap-3">
          <span
            className={`flex-1 rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-raised)] text-center font-semibold text-[color:var(--s-text-strong)] sm:flex-none ${
              compact ? 'px-4 py-2.5 text-sm' : 'px-5 py-3 text-[0.9375rem]'
            }`}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <ArrowRight
              size={16}
              className="shrink-0 rotate-90 text-[color:var(--s-primary)] sm:rotate-0"
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  )
}
