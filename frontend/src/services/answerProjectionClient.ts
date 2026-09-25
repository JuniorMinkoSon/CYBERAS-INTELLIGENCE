import { apiClient } from './apiClient'

/**
 * Une famille de domaines, telle que la projection la tient.
 *
 * `maturiteMoyenne` vaut `null` tant que rien n'a été répondu dans la famille.
 * L'écran doit afficher « non évaluée » plutôt qu'un zéro : un audit à peine
 * commencé n'est pas une organisation en échec, et les confondre donnerait à
 * une direction une lecture fausse de sa propre situation.
 */
export interface AnswerProjectionEntry {
  id: string
  auditId: string | null
  domainFamily: string
  answeredCount: number
  /** Questions déclarées sans objet. Comptées à part, jamais dans la moyenne. */
  notApplicableCount: number
  /** Réponses sous le seuil de faiblesse : celles qui appellent une action. */
  gapCount: number
  maturiteMoyenne: number | null
  updatedAt: string
}

/**
 * Projection des réponses, alimentée par Kafka.
 *
 * <p>Distincte de `questionnaireClient`, qui lit les réponses une à une et
 * recompose la synthèse d'un audit à chaque appel. Celle-ci rend l'état
 * courant déjà agrégé par famille : c'est ce qu'il faut pour un tableau de
 * bord, qui agrège plusieurs audits et ne peut pas relire toutes les réponses
 * de chacun à chaque affichage.
 */
export const answerProjectionClient = {
  forAudit(auditId: string): Promise<AnswerProjectionEntry[]> {
    return apiClient.get(`/answer-projection/audits/${auditId}`)
  },

  forOrganization(): Promise<AnswerProjectionEntry[]> {
    return apiClient.get('/answer-projection')
  },
}

/** Libellés des familles, dans l'ordre où la restitution les présente. */
export const LIBELLES_FAMILLE: Record<string, string> = {
  TECHNIQUE: 'Technique',
  ORGANISATIONNEL: 'Organisationnel',
  CONFORMITE: 'Conformité',
  HUMAIN: 'Humain',
  NON_CLASSE: 'Non classé',
  INDETERMINEE: 'Indéterminée',
}

/**
 * Regroupe les lignes de plusieurs audits en une vue d'organisation.
 *
 * <p>La projection porte une ligne par audit et par famille : c'est la maille
 * qui permet de reconstruire, et celle dont un audit ouvert a besoin. Une
 * direction, elle, regarde son organisation entière. Les compteurs
 * s'additionnent, et la moyenne se recalcule sur les totaux plutôt que sur les
 * moyennes — faire la moyenne de moyennes donnerait le même poids à un audit
 * de dix réponses qu'à un audit de cent.
 */
export function agregerParFamille(entries: AnswerProjectionEntry[]) {
  const parFamille = new Map<
    string,
    { famille: string; repondues: number; sansObjet: number; ecarts: number; sommeMaturite: number }
  >()

  for (const e of entries) {
    const acc = parFamille.get(e.domainFamily) ?? {
      famille: e.domainFamily,
      repondues: 0,
      sansObjet: 0,
      ecarts: 0,
      sommeMaturite: 0,
    }
    acc.repondues += e.answeredCount
    acc.sansObjet += e.notApplicableCount
    acc.ecarts += e.gapCount
    acc.sommeMaturite += (e.maturiteMoyenne ?? 0) * e.answeredCount
    parFamille.set(e.domainFamily, acc)
  }

  return [...parFamille.values()]
    .map((a) => ({
      ...a,
      maturiteMoyenne: a.repondues > 0 ? a.sommeMaturite / a.repondues : null,
    }))
    .sort((a, b) => b.ecarts - a.ecarts)
}
