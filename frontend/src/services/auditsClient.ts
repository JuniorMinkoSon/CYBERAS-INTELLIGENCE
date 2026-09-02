import { apiClient } from './apiClient'
import type { Audit, AuditVersion, UUID } from '../types/entities'

export interface CreateAuditRequest {
  auditCode: string
  title: string
  description?: string
  clientOrganizationId?: UUID
  scheduledStartDate?: string
  scheduledEndDate?: string
  frameworks?: string[]
}

export interface UpdateAuditRequest {
  title?: string
  description?: string
  status?: string
  scheduledStartDate?: string
  scheduledEndDate?: string
  frameworks?: string[]
}

export const auditsClient = {
  list: async (): Promise<Audit[]> => {
    return apiClient.get('/audits')
  },

  getById: async (auditId: UUID): Promise<Audit> => {
    return apiClient.get(`/audits/${auditId}`)
  },

  create: async (request: CreateAuditRequest): Promise<Audit> => {
    return apiClient.post('/audits', request)
  },

  update: async (auditId: UUID, request: UpdateAuditRequest): Promise<Audit> => {
    return apiClient.put(`/audits/${auditId}`, request)
  },

  listVersions: async (auditId: UUID): Promise<AuditVersion[]> => {
    return apiClient.get(`/audits/${auditId}/versions`)
  },

  createVersion: async (
    auditId: UUID,
    request: { title: string; description?: string; changeSummary?: string }
  ): Promise<AuditVersion> => {
    return apiClient.post(`/audits/${auditId}/versions`, request)
  },

  publishVersion: async (
    auditId: UUID,
    versionId: UUID,
    request: { changeSummary?: string }
  ): Promise<AuditVersion> => {
    return apiClient.post(`/audits/${auditId}/versions/${versionId}/publish`, request)
  },
}
