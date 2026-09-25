import { apiClient } from './apiClient'

/**
 * Une case de la cartographie MEHARI, telle que la projection la tient.
 *
 * Une entrée par catégorie et par protocole : c'est la maille à laquelle le
 * flux d'événements de scan alimente la vue.
 */
export interface RiskCartographyEntry {
  id: string
  auditId: string | null
  /** DISPONIBILITE, INTEGRITE, CONFIDENTIALITE ou TRACABILITE. */
  category: string
  protocol: string | null
  /** LOW, MEDIUM, HIGH ou CRITICAL : le pire niveau observé sur la case. */
  riskLevel: string
  occurrences: number
  lastSummary: string | null
  updatedAt: string
}

/**
 * Cartographie des risques dérivée des scans.
 *
 * <p>Pendant de `answerProjectionClient` pour l'autre moitié de l'évaluation :
 * celui-ci restitue ce que les machines ont exposé, l'autre ce que
 * l'organisation a déclaré. Les deux lisent une vue alimentée par Kafka.
 *
 * <p>Ce n'est jamais le score opposable d'un audit — cela reste le travail de
 * `/risks`, qui calcule sur les constats et les réponses eux-mêmes. C'est une
 * lecture du bruit accumulé au fil des scans.
 */
export const riskCartographyClient = {
  forAudit(auditId: string): Promise<RiskCartographyEntry[]> {
    return apiClient.get(`/risk-cartography/audits/${auditId}`)
  },

  forOrganization(): Promise<RiskCartographyEntry[]> {
    return apiClient.get('/risk-cartography')
  },
}

/**
 * Libellés des catégories MEHARI, dans l'ordre où la restitution les présente.
 *
 * <p>L'ordre suit le triptyque classique disponibilité / intégrité /
 * confidentialité, la traçabilité en dernier : c'est celui dans lequel un
 * lecteur formé à la méthode les attend.
 */
export const CATEGORIES_MEHARI = [
  'DISPONIBILITE',
  'INTEGRITE',
  'CONFIDENTIALITE',
  'TRACABILITE',
] as const

export const LIBELLES_MEHARI: Record<string, string> = {
  DISPONIBILITE: 'Disponibilité',
  INTEGRITE: 'Intégrité',
  CONFIDENTIALITE: 'Confidentialité',
  TRACABILITE: 'Traçabilité',
}

/** Ce que chaque catégorie recouvre, pour qui ne pratique pas la méthode. */
export const PORTEES_MEHARI: Record<string, string> = {
  DISPONIBILITE: 'Le service visé peut cesser de répondre',
  INTEGRITE: 'Les données ou la configuration peuvent être altérées',
  CONFIDENTIALITE: 'Les données peuvent être exposées',
  TRACABILITE: 'L’incident ne pourrait pas être reconstitué',
}

const RANG_NIVEAU: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }

/**
 * Regroupe les entrées par catégorie, tous protocoles confondus.
 *
 * <p>La projection porte une ligne par catégorie et par protocole : c'est la
 * maille qui permet de reconstruire. Un écran, lui, présente d'abord les
 * quatre catégories. Les occurrences s'additionnent, et le niveau retenu est
 * le pire observé — jamais une moyenne : une case critique noyée dans dix
 * cases faibles resterait critique, et l'arrondir la ferait disparaître.
 */
export function agregerParCategorie(entries: RiskCartographyEntry[]) {
  const parCategorie = new Map<
    string,
    { categorie: string; occurrences: number; niveau: string; protocoles: Set<string> }
  >()

  for (const e of entries) {
    const acc = parCategorie.get(e.category) ?? {
      categorie: e.category,
      occurrences: 0,
      niveau: 'LOW',
      protocoles: new Set<string>(),
    }
    acc.occurrences += e.occurrences
    if ((RANG_NIVEAU[e.riskLevel] ?? 0) > (RANG_NIVEAU[acc.niveau] ?? 0)) {
      acc.niveau = e.riskLevel
    }
    if (e.protocol) acc.protocoles.add(e.protocol)
    parCategorie.set(e.category, acc)
  }

  return CATEGORIES_MEHARI.filter((c) => parCategorie.has(c)).map((c) => {
    const a = parCategorie.get(c)!
    return {
      categorie: a.categorie,
      occurrences: a.occurrences,
      niveau: a.niveau,
      protocoles: [...a.protocoles].sort(),
    }
  })
}
