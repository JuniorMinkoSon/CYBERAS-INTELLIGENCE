import { apiClient } from './apiClient'
import type { Risk, Recommendation, UUID } from '../types/entities'

export const riskClient = {
  listRisks: async (auditId?: UUID): Promise<Risk[]> => {
    return apiClient.get('/risks', auditId ? { auditId } : undefined)
  },

  getRiskById: async (riskId: UUID): Promise<Risk> => {
    return apiClient.get(`/risks/${riskId}`)
  },

  listRecommendations: async (auditId?: UUID): Promise<Recommendation[]> => {
    return apiClient.get('/recommendations', auditId ? { auditId } : undefined)
  },

  getRecommendationById: async (recommendationId: UUID): Promise<Recommendation> => {
    return apiClient.get(`/recommendations/${recommendationId}`)
  },

  /**
   * Le serveur n'accepte que le statut et l'échéance : le contenu d'une
   * recommandation découle du constat et ne se modifie pas depuis l'interface.
   */
  updateRecommendation: async (
    recommendationId: UUID,
    request: { status?: string; dueDate?: string | null }
  ): Promise<Recommendation> => {
    return apiClient.put(`/recommendations/${recommendationId}`, request)
  },

  /** (Re)génère les recommandations d'un audit à partir des risques évalués. */
  generateRecommendations: async (auditId: UUID): Promise<Recommendation[]> => {
    return apiClient.post(`/recommendations/audits/${auditId}/generate`, {})
  },

  /** Score de risque consolidé d'un audit. */
  getAuditScore: async (auditId: UUID): Promise<unknown> => {
    return apiClient.get(`/risks/audits/${auditId}/score`)
  },

  /** Relance l'évaluation du risque sur l'ensemble des constats d'un audit. */
  recalculate: async (auditId: UUID): Promise<unknown> => {
    return apiClient.post(`/risks/audits/${auditId}/recalculate`, {})
  },
}
