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

  updateRecommendation: async (
    recommendationId: UUID,
    request: Partial<Recommendation>
  ): Promise<Recommendation> => {
    return apiClient.put(`/recommendations/${recommendationId}`, request)
  },
}
