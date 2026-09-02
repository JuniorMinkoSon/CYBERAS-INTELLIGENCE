import { apiClient } from './apiClient'
import type { Asset, UUID } from '../types/entities'

export interface CreateAssetRequest {
  auditId: UUID
  hostname?: string
  ipAddress?: string
  assetType: string
  operatingSystem?: string
  environment: string
  criticality: string
  internetExposed?: boolean
  owner?: string
  description?: string
}

export const assetsClient = {
  list: async (auditId?: UUID): Promise<Asset[]> => {
    return apiClient.get('/assets', auditId ? { auditId } : undefined)
  },

  getById: async (assetId: UUID): Promise<Asset> => {
    return apiClient.get(`/assets/${assetId}`)
  },

  create: async (request: CreateAssetRequest): Promise<Asset> => {
    return apiClient.post('/assets', request)
  },

  update: async (assetId: UUID, request: Partial<CreateAssetRequest>): Promise<Asset> => {
    return apiClient.put(`/assets/${assetId}`, request)
  },

  delete: async (assetId: UUID): Promise<void> => {
    return apiClient.delete(`/assets/${assetId}`)
  },
}
