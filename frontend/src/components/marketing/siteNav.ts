/**
 * Structure du menu principal.
 *
 * Cinq entrées à plat, dans l'ordre d'un argumentaire : présentation,
 * méthode, mise en œuvre, action, ressources. Pas de menu déroulant — chaque
 * entrée est une page, et chaque page renvoie vers le détail qui la concerne
 * (prestations, référentiels, agents IA, plateforme). Le visiteur n'a jamais
 * à deviner sous quel menu se cache une page.
 *
 * Séparée du composant : la navigation est une décision de contenu, elle
 * change plus souvent que le rendu et doit pouvoir être relue sans lire du
 * JSX. Le pied de page lit la même liste.
 */
export interface NavLinkItem {
  label: string
  to: string
  /** Correspondance exacte pour l'état actif (l'accueil sinon reste actif partout). */
  end?: boolean
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Accueil', to: '/', end: true },
  { label: 'Méthodologie', to: '/methodologie' },
  { label: 'Déploiement', to: '/deploiement' },
  { label: 'Lancer une évaluation', to: '/evaluation' },
  { label: 'Ressources', to: '/ressources' },
]
