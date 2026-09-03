import { apiClient } from './apiClient'
import type { Scan, UUID } from '../types/entities'

export const scansClient = {
  list: async (auditId?: UUID): Promise<Scan[]> => {
    return apiClient.get('/scans', auditId ? { auditId } : undefined)
  },

  getById: async (scanId: UUID): Promise<Scan> => {
    return apiClient.get(`/scans/${scanId}`)
  },

  /**
   * Lance un scan sur la version courante de l'audit.
   *
   * La cible est obligatoire : sans elle le backend ne peut pas vérifier le
   * périmètre autorisé, et refuse la demande. Elle doit correspondre à une entrée
   * de périmètre déclarée ET autorisée, sinon la réponse est un 403 motivé.
   */
  create: async (request: {
    auditId: UUID
    target: string
    scannerType?: string
    scanProfile?: 'BASIC' | 'STANDARD' | 'FULL'
  }): Promise<Scan> => {
    return apiClient.post('/scans', request)
  },
}
