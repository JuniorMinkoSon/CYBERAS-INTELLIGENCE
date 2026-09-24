import {
  Home,
  Box,
  LayoutGrid,
  Building2,
  Tag,
  BookOpen,
  Layers,
  ClipboardCheck,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  ListChecks,
  FileText,
  LineChart,
  Users,
  FolderOpen,
  Library,
  HelpCircle,
  GraduationCap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Structure du menu principal.
 *
 * Sept entrées et un bouton, dans l'ordre de la maquette : Accueil, La
 * solution, Fonctionnalités, Solutions par secteur, Suivi, Offres, Ressources.
 * « Formation » reste dans le panneau Ressources.
 *
 * Quatre panneaux : « Offres », « Suivi » et « Solutions par secteur »
 * tiennent chacune en une page et n'ont rien à déplier. Un panneau à une
 * entrée ne sert qu'à faire attendre.
 *
 * Les sous-entrées pointent sur des sections de la page qu'elles annoncent,
 * jamais sur des pages séparées. Le panneau prolonge la navigation, il ne
 * constitue pas une seconde barre.
 *
 * Chaque entrée porte son icône. Elle ne sert qu'au menu déroulant mobile, où
 * sept libellés empilés se lisent comme un paragraphe : l'icône donne le point
 * d'entrée que l'alignement du texte ne donne pas. La barre de bureau les
 * ignore, sept pictogrammes sur une ligne y feraient du bruit.
 *
 * Séparée du composant : la navigation est une décision de contenu, elle
 * change plus souvent que le rendu et doit pouvoir être relue sans lire du JSX.
 */
export interface NavChild {
  label: string
  to: string
  icon: LucideIcon
}

export interface NavLinkItem {
  label: string
  to: string
  icon: LucideIcon
  /** Correspondance exacte pour l'état actif (l'accueil sinon reste actif partout). */
  end?: boolean
  children?: NavChild[]
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Accueil', to: '/', icon: Home, end: true },
  {
    label: 'La solution',
    to: '/solution',
    icon: Box,
    children: [
      { label: 'Le socle unifié', to: '/solution#socle', icon: Layers },
      { label: 'Évaluation & analyse', to: '/solution#evaluation', icon: ClipboardCheck },
      { label: 'Risques & remédiation', to: '/solution#remediation', icon: ShieldCheck },
      { label: 'Les résultats', to: '/solution#resultats', icon: BarChart3 },
    ],
  },
  {
    label: 'Fonctionnalités',
    to: '/fonctionnalites',
    icon: LayoutGrid,
    children: [
      { label: 'Audits & campagnes', to: '/fonctionnalites#audits', icon: ClipboardList },
      { label: 'Contrôles & questionnaires', to: '/fonctionnalites#controles', icon: ListChecks },
      { label: 'Preuves & conformité', to: '/fonctionnalites#preuves', icon: FileText },
      { label: 'Tableaux de bord', to: '/fonctionnalites#tableaux-de-bord', icon: LineChart },
      { label: 'Collaboration & suivi', to: '/fonctionnalites#collaboration', icon: Users },
    ],
  },
  { label: 'Solutions par secteur', to: '/solutions', icon: Building2 },
  { label: 'Suivi', to: '/suivi', icon: Users },
  { label: 'Offres', to: '/offres', icon: Tag },
  {
    label: 'Ressources',
    to: '/ressources',
    icon: BookOpen,
    children: [
      { label: 'Articles', to: '/ressources#articles', icon: FileText },
      { label: 'Guides & bonnes pratiques', to: '/ressources#guides', icon: BookOpen },
      { label: 'Documentation', to: '/ressources#documentation', icon: FolderOpen },
      { label: 'Référentiels & concepts', to: '/ressources#referentiels', icon: Library },
      { label: 'FAQ', to: '/ressources#faq', icon: HelpCircle },
      { label: 'Formation', to: '/formation', icon: GraduationCap },
    ],
  },
]

/** Le seul bouton de la barre. En ajouter un second les affaiblirait tous les deux. */
export const NAV_CTA = { label: 'Lancer une évaluation', to: '/evaluation' }
