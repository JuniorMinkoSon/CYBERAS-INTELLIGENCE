import { Link } from 'react-router-dom'
import {
  Award, Users, Target, Layers, ShieldCheck, Network, AppWindow,
  KeyRound, Lock, Cloud, Laptop, Siren, Database, Building, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHero, FadeIn, SectionLabel, CtaBanner } from '../../components/marketing/Shared'
import { GenerativeVisual } from '../../components/marketing/GenerativeVisual'

/**
 * Formation en cybersécurité — SMARTEX EXPERTISES.
 *
 * La page distingue deux choses que les catalogues confondent souvent : ce qui
 * fonde la qualité d'une formation (les formateurs, l'adaptation au contexte)
 * et ce qu'elle couvre (les modules). L'ordre suit celui d'une décision d'achat :
 * à qui ai-je affaire, puis qu'est-ce que j'y gagne, puis que couvre-t-on.
 */

interface Pillar {
  icon: LucideIcon
  title: string
  description: string
}

const pillars: Pillar[] = [
  {
    icon: Award,
    title: 'Des formateurs expérimentés et qualifiés',
    description:
      "Nos formateurs sont des experts certifiés, dotés d'une expérience pratique acquise sur des projets de sécurité complexes dans des secteurs variés. Leur approche allie théorie et exercices pratiques, pour une formation directement applicable à votre environnement.",
  },
  {
    icon: Users,
    title: 'Une large cible',
    description:
      "Des équipes techniques aux directions générales, chaque public dispose d'un parcours adapté à son niveau de responsabilité et à ses besoins réels.",
  },
  {
    icon: Target,
    title: 'Des opportunités concrètes à exploiter',
    description:
      "Les compétences acquises se traduisent en actions mesurables : réduction de la surface d'exposition, meilleure détection, réponse aux incidents plus rapide.",
  },
  {
    icon: Layers,
    title: 'Une approche sur mesure',
    description:
      "Le contenu est construit à partir de votre contexte : secteur, niveau de maturité, référentiels applicables et incidents déjà rencontrés.",
  },
]

interface Module {
  icon: LucideIcon
  title: string
  description: string
  topics?: string[]
  seed: string
  variant: 'network' | 'grid' | 'pulse' | 'layers'
}

const modules: Module[] = [
  {
    icon: ShieldCheck,
    title: 'Formation de sensibilisation',
    description:
      'Bonnes pratiques de sécurité pour tous les collaborateurs, quel que soit leur métier.',
    topics: ['Hameçonnage et ingénierie sociale', 'Gestion des mots de passe', 'Usage des équipements', 'Signalement d’incident'],
    seed: 'sensibilisation',
    variant: 'network',
  },
  {
    icon: Network,
    title: 'Formation technique avancée',
    description:
      'Parcours approfondi pour les équipes techniques, couvrant l’ensemble de la chaîne de sécurité.',
    topics: [
      'Sécurité des réseaux',
      'Sécurité des applications',
      'Gestion des identités et des accès',
      'Cryptographie',
      'Sécurité cloud',
      'Sécurité des terminaux',
    ],
    seed: 'technique-avancee',
    variant: 'grid',
  },
  {
    icon: Siren,
    title: 'Formation en gestion des incidents',
    description:
      'Détection, qualification, réponse et retour d’expérience sur incident de sécurité.',
    topics: ['Détection et signalement', 'Qualification et priorisation', 'Confinement et remédiation', 'Retour d’expérience'],
    seed: 'incidents',
    variant: 'pulse',
  },
  {
    icon: Database,
    title: 'Sécurité des données et confidentialité',
    description:
      'Protection et gestion des données sensibles, obligations réglementaires associées.',
    topics: ['Classification des données', 'Chiffrement', 'Durées de conservation', 'Obligations réglementaires'],
    seed: 'donnees',
    variant: 'layers',
  },
  {
    icon: Building,
    title: 'Formation en sécurité physique',
    description:
      'Protection des infrastructures physiques, des locaux et des installations techniques.',
    topics: ['Contrôle d’accès physique', 'Zones sensibles', 'Sécurité des salles techniques', 'Gestion des visiteurs'],
    seed: 'physique',
    variant: 'grid',
  },
]

/** Domaines couverts par le parcours technique, détaillés séparément. */
const technicalDomains: { icon: LucideIcon; label: string }[] = [
  { icon: Network, label: 'Sécurité des réseaux' },
  { icon: AppWindow, label: 'Sécurité des applications' },
  { icon: KeyRound, label: 'Gestion des identités et des accès' },
  { icon: Lock, label: 'Cryptographie' },
  { icon: Cloud, label: 'Sécurité cloud' },
  { icon: Laptop, label: 'Sécurité des terminaux' },
]

export function FormationPage() {
  return (
    <>
      <PageHero
        label="Formation"
        title={
          <>
            Former vos équipes à la <span className="text-brand">cybersécurité</span>
          </>
        }
        subtitle="Des parcours conçus à partir de votre contexte réel, animés par des praticiens de l'audit et de la réponse à incident."
      />

      {/* Ce qui fonde la qualité d'une formation, avant son contenu. */}
      <section id="approche" className="scroll-mt-24 bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Notre approche</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            Une formation utile se juge à ce qu'elle change ensuite
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {pillars.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.07}>
                <article className="h-full rounded-lg border border-border-dark bg-surface-dark p-6 transition-all hover:-translate-y-0.5 hover:border-brand/40">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10">
                    <p.icon size={22} className="text-brand" />
                  </span>
                  <h3 className="mt-4 font-bold text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-on-dark-muted">
                    {p.description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Modules. Chaque carte porte un visuel génératif plutôt qu'une image
          à héberger, ce qui garde la palette homogène. */}
      <section id="modules" className="scroll-mt-24 bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Modules de formation</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
            Cinq parcours, du collaborateur à l'équipe technique
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => (
              <FadeIn key={m.title} delay={(i % 3) * 0.07}>
                <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                  <div className="h-28 w-full overflow-hidden">
                    <GenerativeVisual seed={m.seed} variant={m.variant} />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10">
                      <m.icon size={20} className="text-brand" />
                    </span>
                    <h3 className="mt-4 font-bold text-text-on-light">{m.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-on-light-muted">
                      {m.description}
                    </p>

                    {m.topics && (
                      <ul className="mt-4 space-y-1.5">
                        {m.topics.map((t) => (
                          <li key={t} className="flex items-start gap-2 text-xs text-text-on-light-muted">
                            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-brand" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      to="/contact"
                      className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand hover:underline"
                    >
                      Collaborons <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Détail du parcours technique, mis en avant car c'est le plus demandé. */}
      <section className="bg-surface-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Parcours technique avancé</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
            Six domaines, une chaîne cohérente
          </h2>
          <p className="mt-4 max-w-2xl text-text-on-light-muted">
            Les domaines sont abordés dans l'ordre où ils se conditionnent : protéger un
            réseau sans maîtriser les identités qui le traversent laisse la chaîne ouverte.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {technicalDomains.map((d, i) => (
              <FadeIn key={d.label} delay={(i % 3) * 0.05}>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-brand/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                    <d.icon size={18} className="text-brand" />
                  </span>
                  <span className="text-sm font-semibold text-text-on-light">{d.label}</span>
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
