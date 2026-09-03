import { Link } from 'react-router-dom'
import {
  Crosshair, Server, ClipboardCheck, Globe, Cloud,
  Code2, Network, Wifi, Building2, Settings, Database, ShieldCheck, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Catalogue de prestations.
 *
 * Cinq cartes, chacune portant sa couleur d'accent : les prestations se
 * distinguent au premier coup d'œil sans avoir à lire les titres. Le rouge
 * Cyberas reste réservé à la première, qui est l'offre d'entrée.
 *
 * Aucune image : des visuels génériques de « hacker à capuche » affaibliraient
 * le propos. La hiérarchie repose sur la typographie et la couleur.
 */

interface Service {
  slug: string
  title: string
  /** Segment mis en couleur dans le titre. */
  highlight: string
  description: string
  icon: LucideIcon
  accent: string
  coverage: { label: string; icon: LucideIcon }[]
  modes: string[]
}

const services: Service[] = [
  {
    slug: 'intrusion-interne',
    title: "Test d'intrusion",
    highlight: 'interne',
    description:
      "Simulation d'attaques depuis votre réseau interne pour mesurer ce qu'un accès déjà obtenu permettrait d'atteindre.",
    icon: Crosshair,
    accent: '#DC2626',
    coverage: [
      { label: 'Applications', icon: Code2 },
      { label: 'Réseaux', icon: Network },
    ],
    modes: ['Black box', 'Grey box', 'White box'],
  },
  {
    slug: 'intrusion-externe',
    title: "Test d'intrusion",
    highlight: 'externe',
    description:
      "Évaluation de votre surface exposée sur Internet, du point de vue d'un attaquant sans accès préalable.",
    icon: Globe,
    accent: '#F59E0B',
    coverage: [
      { label: 'Périmètre exposé', icon: Wifi },
      { label: 'Applications web', icon: Code2 },
    ],
    modes: ['Black box', 'Grey box'],
  },
  {
    slug: 'evaluation-si',
    title: 'Évaluation globale de la',
    highlight: 'Sécurité SI',
    description:
      "Examen complet de votre système d'information, couvrant les aspects internes et externes.",
    icon: Server,
    accent: '#3B82F6',
    coverage: [
      { label: 'Applications', icon: Code2 },
      { label: 'Systèmes', icon: Database },
      { label: 'Réseaux', icon: Network },
    ],
    modes: ['Black box', 'Grey box', 'White box'],
  },
  {
    slug: 'audit-organisationnel',
    title: 'Audit organisationnel &',
    highlight: 'conformité',
    description:
      'Évaluation des politiques, processus et de la conformité aux normes et réglementations en vigueur.',
    icon: ClipboardCheck,
    accent: '#10B981',
    coverage: [
      { label: 'Organisation', icon: Building2 },
      { label: 'Processus', icon: Settings },
      { label: 'Conformité', icon: ShieldCheck },
    ],
    modes: ['ISO 27001', 'RGPD', 'PCI DSS', 'Autres'],
  },
  {
    slug: 'securite-cloud',
    title: 'Sécurité',
    highlight: 'Cloud',
    description:
      'Revue des configurations, des identités et des expositions de vos environnements cloud et conteneurisés.',
    icon: Cloud,
    accent: '#8B5CF6',
    coverage: [
      { label: 'Configurations', icon: Settings },
      { label: 'Identités', icon: ShieldCheck },
      { label: 'Conteneurs', icon: Database },
    ],
    modes: ['CIS Benchmarks', 'CSA CCM', 'ISO 27017'],
  },
]

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#141414] bg-[#0A0A0A] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1"
      style={{ borderColor: undefined }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${service.accent}55` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '' }}
    >
      {/* Liseré supérieur : porte la couleur de la prestation sans colorer tout le bloc. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${service.accent}, transparent)` }}
      />

      {/* Halo révélé au survol seulement, pour que la grille reste calme au repos. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: service.accent }}
      />

      <div className="relative">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${service.accent}1A`, color: service.accent }}
        >
          <Icon size={21} />
        </span>

        <h3 className="mt-5 text-lg font-bold leading-snug text-white">
          {service.title}{' '}
          <span style={{ color: service.accent }}>{service.highlight}</span>
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-[#8B98A5]">
          {service.description}
        </p>

        <dl className="mt-5 space-y-3 border-t border-[#141414] pt-4">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6675]">
              Domaine de couverture
            </dt>
            <dd className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {service.coverage.map((c) => (
                <span key={c.label} className="inline-flex items-center gap-1.5 text-xs text-[#C3CCD6]">
                  <c.icon size={13} style={{ color: service.accent }} />
                  {c.label}
                </span>
              ))}
            </dd>
          </div>

          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6675]">
              Types de tests
            </dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {service.modes.map((m) => (
                <span
                  key={m}
                  className="rounded border border-[#1E293B] px-2 py-0.5 text-[11px] text-[#C3CCD6]"
                >
                  {m}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <Link
        to={`/solutions#${service.slug}`}
        className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-transform duration-200 group-hover:translate-x-0.5"
        style={{ color: service.accent }}
      >
        En savoir plus
        <ArrowRight size={15} />
      </Link>
    </article>
  )
}

export function ServicesSection() {
  return (
    <section id="services" className="bg-[#050505] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#DC2626]">
            Nos prestations
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Cinq façons d'évaluer votre sécurité
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#8B98A5]">
            Du test technique à l'audit de conformité, chaque prestation alimente le
            même moteur d'analyse et le même score.
          </p>
        </div>

        {/* Trois colonnes : les deux dernières cartes occupent la seconde rangée,
            centrée, plutôt que de laisser un vide à droite. */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {services.map((s, i) => (
            <div
              key={s.slug}
              className={
                i < 3
                  ? 'lg:col-span-2'
                  : 'lg:col-span-3'
              }
            >
              <ServiceCard service={s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
