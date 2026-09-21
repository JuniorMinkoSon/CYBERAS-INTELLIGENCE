import { apiClient } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Référentiels et score de conformité par référentiel.
 *
 * Le score est calculé par le serveur et jamais recalculé ici : c'est lui qui
 * sera opposé au client dans un rapport, et deux calculs concurrents
 * finiraient par diverger.
 */

export interface Framework {
  id: UUID
  code: string
  name: string
  description?: string
  provider?: string
  referenceUrl?: string
  active: boolean
}

export type ControlStatus =
  | 'COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'NOT_ASSESSED'
  | 'NOT_APPLICABLE'

export interface ControlAssessment {
  code: string
  title: string
  category: string
  weight: number
  status: ControlStatus
  /** Moyenne pondérée 0 à 4, absente si le contrôle n'a pas été évalué. */
  declaredLevel: number | null
  questionCodes: string[]
  answeredQuestions: number
  mappedQuestions: number
  hasReviewRequiredMapping: boolean
}

export interface FrameworkScore {
  frameworkCode: string
  frameworkName: string
  version: string
  /**
   * 0 à 100, **null** quand aucun contrôle n'a pu être évalué : et non zéro,
   * qui signifierait « non conforme ».
   */
  score: number | null
  /** Part des contrôles évalués, 0 à 1. Indissociable du score. */
  coverage: number
  totalControls: number
  assessedControls: number
  compliant: number
  partiallyCompliant: number
  nonCompliant: number
  notAssessed: number
  notApplicable: number
  controlsWithReviewRequiredMapping: number
  /** Contrôles qu'aucune question ne couvre : non évaluables par le questionnaire seul. */
  unmappedControls: number
  engineVersion: string
  rationale: string
  controls: ControlAssessment[]
}

export const frameworkClient = {
  list: async (): Promise<Framework[]> => apiClient.get('/frameworks'),

  /**
   * Score d'un référentiel pour un audit.
   *
   * `includeControls` rapatrie les 93 évaluations : utile pour une vue
   * détaillée, inutilement lourd pour un bandeau de synthèse.
   */
  score: async (
    auditId: UUID,
    frameworkCode: string,
    includeControls = false
  ): Promise<FrameworkScore> =>
    apiClient.get(
      `/audits/${auditId}/frameworks/${frameworkCode}/score`,
      includeControls ? { includeControls: 'true' } : undefined
    ),
}
