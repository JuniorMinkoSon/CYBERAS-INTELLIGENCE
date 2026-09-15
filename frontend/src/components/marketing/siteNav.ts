import {
  Crosshair, Server, ClipboardCheck, Code2, Bell, BarChart3, Compass,
  LayoutDashboard, Bot, Landmark, BookOpen, Newspaper, GraduationCap,
  Briefcase, Flag, CalendarDays,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Structure du menu principal.
 *
 * Séparée du composant : la navigation est une décision de contenu, elle change
 * plus souvent que le rendu et doit pouvoir être relue sans lire du JSX.
 *
 * Trois menus déroulants simples et deux liens directs. Les panneaux à
 * colonnes qui précédaient rangeaient douze entrées derrière « Solutions »,
 * en répétaient trois derrière « Services » — qui menait en réalité aux
 * ressources — et laissaient les Agents IA et les défis CTF sans porte
 * d'entrée. Chaque page n'apparaît désormais qu'une fois, sous le menu qui
 * répond à la question du visiteur : que faites-vous, avec quoi, où m'informer.
 */

export interface NavEntry {
  label: string
  /** Une ligne, facultative : précise sans répéter le libellé. */
  description?: string
  to: string
  icon: LucideIcon
}

export interface NavSection {
  label: string
  /** Page de synthèse du menu, en pied de liste. */
  to: string
  entries: NavEntry[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Solutions',
    to: '/solutions',
    entries: [
      { label: 'Tests d’intrusion', description: 'Externe et interne, sur périmètre autorisé.', to: '/solutions#intrusion-externe', icon: Crosshair },
      { label: 'Évaluation de la sécurité du SI', description: 'Analyse complète du système d’information.', to: '/solutions#evaluation-si', icon: Server },
      { label: 'Audit organisationnel', description: 'Politiques, processus et conformité.', to: '/solutions#audit-organisationnel', icon: ClipboardCheck },
      { label: 'Sécurité des applications', description: 'Revue et sécurisation de vos applications.', to: '/solutions#applications', icon: Code2 },
      { label: 'Gestion des risques', description: 'Identification, cotation et traitement.', to: '/solutions#risques', icon: BarChart3 },
      { label: 'Réponse aux incidents', description: 'Prise en charge et remédiation rapides.', to: '/solutions#incidents', icon: Bell },
      { label: 'Conseil et gouvernance', description: 'Stratégie et pilotage de la sécurité.', to: '/solutions#conseil', icon: Compass },
    ],
  },
  {
    label: 'Plateforme',
    to: '/plateforme',
    entries: [
      { label: 'Vue d’ensemble', description: 'Questionnaires, preuves, scans et rapports.', to: '/plateforme', icon: LayoutDashboard },
      { label: 'Agents IA', description: 'Analyse, priorisation et rédaction assistées.', to: '/agents-ia', icon: Bot },
      { label: 'Référentiels couverts', description: 'ISO 27001, NIST, PCI DSS, RGPD, ANSSI.', to: '/referentiels', icon: Landmark },
    ],
  },
  {
    label: 'Ressources',
    to: '/ressources',
    entries: [
      { label: 'Guides et documentation', to: '/ressources#guides', icon: BookOpen },
      { label: 'Articles', to: '/ressources#articles', icon: Newspaper },
      { label: 'Formation et sensibilisation', to: '/formation', icon: GraduationCap },
      { label: 'Études de cas', to: '/cas-clients', icon: Briefcase },
      { label: 'Défis CTF', to: '/ctf', icon: Flag },
      { label: 'Événements', to: '/ressources#evenements', icon: CalendarDays },
    ],
  },
]

/** Liens directs, sans menu : les deux pages qu'un visiteur cherche en premier. */
export const NAV_LINKS = [
  { label: 'Tarifs', to: '/tarifs' },
  { label: 'Contact', to: '/contact' },
]
