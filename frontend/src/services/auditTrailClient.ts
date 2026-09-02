import { apiClient } from './apiClient'
import type { AuditEvent } from '../types/auditTrail'

export const auditTrailClient = {
  listForOrganization: async (limit: number = 100): Promise<AuditEvent[]> => {
    return apiClient.get(`/audit-trail?limit=${limit}`)
  },

  listForAudit: async (auditId: string, limit: number = 100): Promise<AuditEvent[]> => {
    return apiClient.get(`/audit-trail/audits/${auditId}?limit=${limit}`)
  },

  getEvent: async (eventId: string): Promise<AuditEvent> => {
    return apiClient.get(`/audit-trail/${eventId}`)
  },
}
