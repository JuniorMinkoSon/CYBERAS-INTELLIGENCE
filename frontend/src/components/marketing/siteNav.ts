import {
  Home,
  Box,
  LayoutGrid,
  Tag,
  BookOpen,
  FileText,
  Library,
  BarChart3,
  Database,
  LineChart,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Structure du menu principal.
 *
 * <p>Cinq entrées : Accueil, Solution, Fonctionnalités, Offres, Ressources.
 * Trois se déplient, deux tiennent en une page. Un panneau à une entrée ne
 * sert qu'à faire attendre.
 *
 * <p>« Solutions par secteur », « Suivi » et « Formation » quittent la barre.
 * Elles portaient le premier niveau à sept entrées, et sur une barre à sept
 * entrées on ne lit plus, on cherche. Leurs pages restent adressables et
 * référencées depuis le corps du site et le pied de page : une adresse
 * partagée ne doit pas mourir parce qu'un menu a changé.
 *
 * <p>Les sous-entrées pointent sur des sections de la page qu'elles annoncent,
 * jamais sur des pages séparées. Le panneau prolonge la navigation, il ne
 * constitue pas une seconde barre. Chaque ancre doit exister dans la page
 * visée : un panneau qui pointe dans le vide ne se signale à personne, ni à la
 * compilation ni au visiteur, qui croit simplement que la page a mal défilé.
 *
 * <p>Chaque entrée porte son icône. Elle ne sert qu'au tiroir mobile, où les
 * libellés empilés se lisent comme un paragraphe : l'icône donne le point
 * d'entrée que l'alignement du texte ne donne pas. La barre de bureau les
 * ignore, des pictogrammes sur une ligne y feraient du bruit.
 *
 * <p>Séparée du composant : la navigation est une décision de contenu, elle
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
    label: 'Solution',
    to: '/solution',
    icon: Box,
    /* « Méthodologie » a quitté ce panneau avec la section qu'elle annonçait.
       Les cinq étapes redisaient les quatre fonctions de l'onglet
       Fonctionnalités, à un niveau de détail près, et l'on lisait deux fois la
       même démarche. La page /methodologie reste atteignable par le pied de
       page, où elle figure déjà. */
    children: [
      { label: 'Présentation', to: '/solution#presentation', icon: FileText },
      { label: 'Référentiels', to: '/solution#referentiels', icon: Library },
      { label: 'Livrables', to: '/solution#livrables', icon: BarChart3 },
    ],
  },
  {
    label: 'Fonctionnalités',
    to: '/fonctionnalites',
    icon: LayoutGrid,
    children: [
      { label: 'Collecter les données', to: '/fonctionnalites#collecter', icon: Database },
      { label: 'Documenter', to: '/fonctionnalites#documenter', icon: FileText },
      { label: 'Analyse & Résultats', to: '/fonctionnalites#analyser', icon: LineChart },
      { label: 'Remédier & Piloter', to: '/fonctionnalites#remedier', icon: ShieldCheck },
    ],
  },
  { label: 'Offres', to: '/offres', icon: Tag },
  {
    label: 'Ressources',
    to: '/ressources',
    icon: BookOpen,
    children: [
      { label: 'Articles', to: '/ressources#articles', icon: FileText },
      { label: 'Référentiels & concepts', to: '/ressources#referentiels', icon: Library },
      { label: 'Guides & bonnes pratiques', to: '/ressources#guides', icon: BookOpen },
      { label: 'Documentation', to: '/ressources#documentation', icon: Database },
      { label: 'FAQ', to: '/ressources#faq', icon: HelpCircle },
    ],
  },
]

/**
 * L'action de la barre.
 *
 * « Démo », l'autre bouton, ouvre la vidéo par-dessus la page plutôt que de
 * mener à une adresse : il vit dans DemoButton, pas dans cette liste.
 */
export const NAV_CTA_COMPTE = { label: 'Créer un compte', to: '/inscription' }
