import {
  Crosshair, Server, ClipboardCheck, Globe, Cloud, ShieldCheck, Radar,
  Bell, GraduationCap, Compass, BarChart3, Headphones, Landmark, Code2,
  FileText, BookOpen, Newspaper, CalendarDays, Building2, Users, Briefcase,
  Banknote, HeartPulse, Flag, Cpu, Target, Trophy,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Structure du menu principal.
 *
 * Séparée du composant : la navigation est une décision de contenu, elle change
 * plus souvent que le rendu et doit pouvoir être relue sans lire du JSX.
 *
 * Les colonnes suivent le déroulé d'une mission — évaluer, protéger, accompagner —
 * plutôt qu'un découpage par technologie, qui ne parlerait qu'aux techniciens.
 */

export interface MenuEntry {
  label: string
  description: string
  to: string
  icon: LucideIcon
  accent: string
}

export interface MenuColumn {
  heading: string
  accent: string
  entries: MenuEntry[]
}

export interface MenuSection {
  label: string
  to: string
  columns?: MenuColumn[]
  /** Encart de tête, à gauche du panneau. */
  feature?: {
    eyebrow: string
    title: string
    description: string
    ctaLabel: string
    to: string
  }
}

export const megaMenu: MenuSection[] = [
  {
    label: 'Solutions',
    to: '/solutions',
    feature: {
      eyebrow: 'Nos solutions',
      title: 'Une approche globale de la cybersécurité',
      description:
        "Des prestations complètes et adaptées à vos enjeux, pour protéger vos actifs et renforcer votre résilience.",
      ctaLabel: 'Découvrir notre approche',
      to: '/solutions',
    },
    columns: [
      {
        heading: 'Évaluer',
        accent: '#DC2626',
        entries: [
          {
            label: "Test d'intrusion",
            description: "Simulations d'attaques ciblées pour identifier vos failles.",
            to: '/solutions#intrusion-interne',
            icon: Crosshair,
            accent: '#DC2626',
          },
          {
            label: 'Évaluation de la sécurité SI',
            description: "Analyse complète de votre système d'information.",
            to: '/solutions#evaluation-si',
            icon: Server,
            accent: '#DC2626',
          },
          {
            label: 'Audit organisationnel',
            description: 'Évaluation des politiques, processus et conformité.',
            to: '/solutions#audit-organisationnel',
            icon: ClipboardCheck,
            accent: '#DC2626',
          },
          {
            label: 'Conformité & réglementation',
            description: 'Accompagnement ISO 27001, RGPD, PCI DSS.',
            to: '/referentiels',
            icon: Landmark,
            accent: '#DC2626',
          },
        ],
      },
      {
        heading: 'Protéger',
        accent: '#3B82F6',
        entries: [
          {
            label: 'Sécurité des infrastructures',
            description: 'Durcissement et sécurisation de vos infrastructures.',
            to: '/solutions#infrastructures',
            icon: Server,
            accent: '#3B82F6',
          },
          {
            label: 'Sécurité des applications',
            description: 'Analyse et sécurisation de vos applications.',
            to: '/solutions#applications',
            icon: Code2,
            accent: '#3B82F6',
          },
          {
            label: 'Réponse aux incidents',
            description: 'Gestion et réponse rapide aux incidents.',
            to: '/solutions#incidents',
            icon: Bell,
            accent: '#3B82F6',
          },
          {
            label: 'Sensibilisation & formation',
            description: 'Formations et sensibilisation à la cybersécurité.',
            to: '/formation',
            icon: GraduationCap,
            accent: '#3B82F6',
          },
        ],
      },
      {
        heading: 'Accompagner',
        accent: '#10B981',
        entries: [
          {
            label: 'Gouvernance de la sécurité',
            description: "Mise en place d'une gouvernance efficace et durable.",
            to: '/solutions#gouvernance',
            icon: ShieldCheck,
            accent: '#10B981',
          },
          {
            label: 'Conseil & stratégie',
            description: 'Définition de votre stratégie de cybersécurité.',
            to: '/solutions#conseil',
            icon: Compass,
            accent: '#10B981',
          },
          {
            label: 'Gestion des risques',
            description: 'Identification et gestion des risques cyber.',
            to: '/solutions#risques',
            icon: BarChart3,
            accent: '#10B981',
          },
          {
            label: 'Support & maintenance',
            description: 'Support technique et maintenance continue.',
            to: '/contact',
            icon: Headphones,
            accent: '#10B981',
          },
        ],
      },
    ],
  },
  {
    label: 'Services',
    to: '/#services',
    columns: [
      {
        heading: 'Tests techniques',
        accent: '#DC2626',
        entries: [
          {
            label: "Test d'intrusion interne",
            description: 'Depuis votre réseau interne.',
            to: '/solutions#intrusion-interne',
            icon: Crosshair,
            accent: '#DC2626',
          },
          {
            label: "Test d'intrusion externe",
            description: 'Depuis Internet, sans accès préalable.',
            to: '/solutions#intrusion-externe',
            icon: Globe,
            accent: '#F59E0B',
          },
          {
            label: 'Sécurité cloud',
            description: 'Configurations, identités, conteneurs.',
            to: '/solutions#securite-cloud',
            icon: Cloud,
            accent: '#8B5CF6',
          },
        ],
      },
      {
        heading: 'Évaluation & conformité',
        accent: '#3B82F6',
        entries: [
          {
            label: 'Évaluation globale SI',
            description: 'Interne et externe, vision complète.',
            to: '/solutions#evaluation-si',
            icon: Server,
            accent: '#3B82F6',
          },
          {
            label: 'Audit organisationnel',
            description: 'Politiques, processus, conformité.',
            to: '/solutions#audit-organisationnel',
            icon: ClipboardCheck,
            accent: '#10B981',
          },
          {
            label: 'Surveillance continue',
            description: 'Suivi de votre posture dans le temps.',
            to: '/plateforme',
            icon: Radar,
            accent: '#3B82F6',
          },
        ],
      },
    ],
  },
  {
    label: 'Ressources',
    to: '/ressources',
    columns: [
      {
        heading: 'Se former',
        accent: '#DC2626',
        entries: [
          {
            label: 'Guides',
            description: 'Documentation et bonnes pratiques.',
            to: '/ressources#guides',
            icon: BookOpen,
            accent: '#DC2626',
          },
          {
            label: 'Articles',
            description: 'Analyses et actualités cyber.',
            to: '/ressources#articles',
            icon: Newspaper,
            accent: '#DC2626',
          },
          {
            label: 'Formations',
            description: 'Sensibilisation et montée en compétences.',
            to: '/formation',
            icon: GraduationCap,
            accent: '#DC2626',
          },
        ],
      },
      {
        heading: 'Références',
        accent: '#3B82F6',
        entries: [
          {
            label: 'Référentiels',
            description: 'ISO, NIST, PCI DSS, CIS, OWASP.',
            to: '/referentiels',
            icon: FileText,
            accent: '#3B82F6',
          },
          {
            label: 'Études de cas',
            description: 'Missions menées et résultats obtenus.',
            to: '/cas-clients',
            icon: Briefcase,
            accent: '#3B82F6',
          },
          {
            label: 'Événements',
            description: 'Rencontres et webinaires.',
            to: '/ressources#evenements',
            icon: CalendarDays,
            accent: '#3B82F6',
          },
        ],
      },
      {
        heading: 'Secteurs',
        accent: '#DC2626',
        entries: [
          {
            label: 'Finance',
            description: 'PCI DSS, protection des données, détection de fraude.',
            to: '/solutions',
            icon: Banknote,
            accent: '#DC2626',
          },
          {
            label: 'Santé',
            description: 'Données patients, disponibilité des systèmes critiques.',
            to: '/solutions',
            icon: HeartPulse,
            accent: '#DC2626',
          },
          {
            label: 'Secteur public',
            description: 'Conformité réglementaire et traçabilité des accès.',
            to: '/solutions',
            icon: Flag,
            accent: '#DC2626',
          },
          {
            label: 'Technologie',
            description: 'Sécurité applicative et montée en charge maîtrisée.',
            to: '/solutions',
            icon: Cpu,
            accent: '#DC2626',
          },
        ],
      },
    ],
  },
  {
    label: 'Entreprise',
    to: '/a-propos',
    columns: [
      {
        heading: 'Cyberas',
        accent: '#DC2626',
        entries: [
          {
            label: 'À propos',
            description: 'Notre mission et notre approche.',
            to: '/a-propos',
            icon: Building2,
            accent: '#DC2626',
          },
          {
            label: 'Nos offres',
            description: 'Formules et tarification.',
            to: '/tarifs',
            icon: BarChart3,
            accent: '#DC2626',
          },
          {
            label: 'Nous contacter',
            description: 'Parlons de vos besoins.',
            to: '/contact',
            icon: Users,
            accent: '#DC2626',
          },
        ],
      },
      {
        heading: 'Monter en compétences',
        accent: '#DC2626',
        entries: [
          {
            label: 'Formation',
            description: 'Cinq parcours, de la sensibilisation au technique avancé.',
            to: '/formation',
            icon: GraduationCap,
            accent: '#DC2626',
          },
          {
            label: 'CTF Challenge',
            description: 'Défis pratiques : Linux, crypto, forensic, OSINT.',
            to: '/ctf',
            icon: Trophy,
            accent: '#DC2626',
          },
          {
            label: 'Études de cas',
            description: 'Missions menées et résultats obtenus.',
            to: '/cas-clients',
            icon: Target,
            accent: '#DC2626',
          },
        ],
      },
    ],
  },
]
