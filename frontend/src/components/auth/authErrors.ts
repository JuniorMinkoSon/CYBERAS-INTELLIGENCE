/**
 * Traduction des erreurs d'authentification renvoyées par le serveur.
 *
 * <p>Le serveur répond en anglais et en termes techniques (« Invalid
 * credentials », « Account locked »). Affichés tels quels, ces messages
 * disaient à l'utilisateur ce que la machine avait constaté, pas ce qu'il
 * pouvait faire. Chaque cas connu reçoit ici une phrase en français qui
 * nomme la cause et la suite à donner ; un message inconnu est rendu tel quel
 * plutôt que remplacé par un « erreur inconnue » qui cacherait l'information.
 */
const KNOWN: Array<[RegExp, string]> = [
  [/invalid credentials/i, 'Adresse ou mot de passe incorrect. Vérifiez la saisie et réessayez.'],
  [/account locked/i, 'Compte bloqué temporairement après plusieurs échecs. Patientez quelques minutes avant de réessayer.'],
  [/user is inactive/i, 'Ce compte est désactivé. Rapprochez-vous de l’administrateur de votre organisation.'],
  [/email already registered/i, 'Cette adresse a déjà un compte. Connectez-vous, ou utilisez une autre adresse.'],
  [/organisation porte déjà ce nom/i, 'Une organisation porte déjà ce nom. Choisissez un nom plus précis (ville, filiale…).'],
  [/plusieurs organisations pour cet email/i, 'Cette adresse est rattachée à plusieurs organisations. Contactez le support pour choisir laquelle ouvrir.'],
  [/too many requests|rate limit/i, 'Trop de tentatives en peu de temps. Patientez une minute avant de réessayer.'],
  [/failed to fetch|networkerror|injoignable/i, 'Impossible de joindre le serveur. Vérifiez votre connexion, puis réessayez.'],
  [/unauthorized/i, 'Adresse ou mot de passe incorrect. Vérifiez la saisie et réessayez.'],
]

export function friendlyAuthError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  if (!raw.trim()) return fallback
  for (const [pattern, text] of KNOWN) {
    if (pattern.test(raw)) return text
  }
  return raw
}
