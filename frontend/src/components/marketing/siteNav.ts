/**
 * Structure du menu principal.
 *
 * Quatre entrées et un bouton. « Suivi » et « Formation » en sont sortis :
 * sept entrées obligeaient à lire la barre pour la comprendre, alors qu'une
 * barre se reconnaît d'un coup d'œil. Les deux pages existent toujours et
 * restent atteignables : Formation depuis le panneau Ressources, Suivi depuis
 * Ressources et depuis les pages qui en parlent.
 *
 * Trois panneaux, pas quatre : « Offres » tient en une page et n'a rien à
 * déplier. Un panneau à une entrée ne sert qu'à faire attendre.
 *
 * Les sous-entrées pointent sur des sections de la page qu'elles annoncent,
 * jamais sur des pages séparées. Le panneau prolonge la navigation, il ne
 * constitue pas une seconde barre.
 *
 * Séparée du composant : la navigation est une décision de contenu, elle
 * change plus souvent que le rendu et doit pouvoir être relue sans lire du JSX.
 */
export interface NavChild {
  label: string
  to: string
}

export interface NavLinkItem {
  label: string
  to: string
  /** Correspondance exacte pour l'état actif (l'accueil sinon reste actif partout). */
  end?: boolean
  children?: NavChild[]
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Accueil', to: '/', end: true },
  {
    label: 'La solution',
    to: '/solution',
    children: [
      { label: 'Le socle unifié', to: '/solution#socle' },
      { label: 'Évaluation & analyse', to: '/solution#evaluation' },
      { label: 'Risques & remédiation', to: '/solution#remediation' },
      { label: 'Les résultats', to: '/solution#resultats' },
    ],
  },
  {
    label: 'Fonctionnalités',
    to: '/fonctionnalites',
    children: [
      { label: 'Audits & campagnes', to: '/fonctionnalites#audits' },
      { label: 'Contrôles & questionnaires', to: '/fonctionnalites#controles' },
      { label: 'Preuves & conformité', to: '/fonctionnalites#preuves' },
      { label: 'Tableaux de bord', to: '/fonctionnalites#tableaux-de-bord' },
      { label: 'Collaboration & suivi', to: '/fonctionnalites#collaboration' },
    ],
  },
  { label: 'Offres', to: '/offres' },
  {
    label: 'Ressources',
    to: '/ressources',
    children: [
      { label: 'Articles', to: '/ressources#articles' },
      { label: 'Guides & bonnes pratiques', to: '/ressources#guides' },
      { label: 'Documentation', to: '/ressources#documentation' },
      { label: 'Référentiels & concepts', to: '/ressources#referentiels' },
      { label: 'FAQ', to: '/ressources#faq' },
      { label: 'Formation', to: '/formation' },
      { label: 'Suivi', to: '/suivi' },
    ],
  },
]

/** Le seul bouton de la barre. En ajouter un second les affaiblirait tous les deux. */
export const NAV_CTA = { label: 'Lancer une évaluation', to: '/evaluation' }
