import { apiClient } from './apiClient'
import type { Scan, UUID } from '../types/entities'

export const scansClient = {
  list: async (auditId?: UUID): Promise<Scan[]> => {
    return apiClient.get('/scans', auditId ? { auditId } : undefined)
  },

  getById: async (scanId: UUID): Promise<Scan> => {
    return apiClient.get(`/scans/${scanId}`)
  },

  create: async (request: { auditId: UUID; name: string; scannerType: string }): Promise<Scan> => {
    return apiClient.post('/scans', request)
  },
}
