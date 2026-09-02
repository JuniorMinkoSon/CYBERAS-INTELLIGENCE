import { apiClient } from './apiClient'
import type { Finding, UUID } from '../types/entities'

export const findingsClient = {
  list: async (auditId?: UUID): Promise<Finding[]> => {
    return apiClient.get('/findings', auditId ? { auditId } : undefined)
  },

  getById: async (findingId: UUID): Promise<Finding> => {
    return apiClient.get(`/findings/${findingId}`)
  },

  listByScan: async (scanId: UUID): Promise<Finding[]> => {
    return apiClient.get(`/findings/scan/${scanId}`)
  },
}
