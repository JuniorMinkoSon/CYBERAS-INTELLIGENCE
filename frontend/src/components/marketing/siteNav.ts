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
  // Les formules vivent dans la page « Lancer une évaluation » (ancre
  // #formules) depuis la fusion de l'ancienne page Tarifs : un visiteur qui
  // cherche un prix dans la barre de navigation ne doit pas avoir à deviner
  // que « Lancer une évaluation » les contient. L'entrée pointe directement
  // sur l'ancre plutôt que sur /tarifs pour éviter une redirection à vide.
  { label: 'Tarifs', to: '/evaluation#formules' },
  { label: 'Ressources', to: '/ressources' },
]
