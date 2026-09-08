import { Navigate } from 'react-router-dom'

/**
 * L'ancienne page de démonstration est retirée du parcours.
 *
 * Elle présentait une visite guidée et un formulaire de prise de rendez-vous,
 * là où le visiteur qui clique « Démo » cherche en réalité à savoir ce que ça
 * coûte et à essayer. Le renvoi vers les tarifs supprime une étape qui
 * n'apportait rien, et c'est depuis cette page que le test d'intrusion est
 * proposé.
 *
 * La redirection remplace l'entrée dans l'historique plutôt que de s'y ajouter :
 * sans {@code replace}, le retour arrière renverrait ici, puis de nouveau vers
 * les tarifs — le visiteur ne pourrait plus revenir en arrière.
 *
 * Le composant est conservé plutôt que supprimé : l'adresse /demo circule dans
 * des liens et des campagnes, et la faire répondre 404 casserait ces liens.
 */
export function DemoPage() {
  return <Navigate to="/tarifs" replace />
}
