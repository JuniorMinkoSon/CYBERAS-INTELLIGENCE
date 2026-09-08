import { apiClient } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Périmètre autorisé d'un audit.
 *
 * Un scan n'est jamais lancé sur une cible qui n'appartient pas à une entrée
 * déclarée **et** autorisée. La déclaration et l'autorisation sont deux gestes
 * distincts : déclarer dit ce qu'on veut tester, autoriser engage celui qui en
 * a le droit, en citant la pièce qui le prouve.
 */
export interface AuditScope {
  id: UUID
  scopeType: 'IP' | 'CIDR' | 'HOSTNAME' | 'DOMAIN'
  value: string
  notes?: string
  authorized?: boolean
  authorizationReference?: string
  authorizedAt?: string
  revokedAt?: string
  createdAt?: string
}

export const scopesClient = {
  list: async (auditId: UUID): Promise<AuditScope[]> =>
    apiClient.get(`/audits/${auditId}/scopes`),

  declare: async (
    auditId: UUID,
    request: { scopeType: string; value: string; notes?: string },
  ): Promise<AuditScope> => apiClient.post(`/audits/${auditId}/scopes`, request),

  /**
   * Autorise une entrée déclarée.
   *
   * La référence d'autorisation est exigée par le serveur : sans élément
   * vérifiable rattachant la décision — bon de commande, courriel, contrat —
   * rien ne distingue un périmètre consenti d'un périmètre supposé.
   */
  authorize: async (
    auditId: UUID,
    scopeId: UUID,
    authorizationReference: string,
  ): Promise<AuditScope> =>
    apiClient.post(`/audits/${auditId}/scopes/${scopeId}/authorize`, { authorizationReference }),

  revoke: async (auditId: UUID, scopeId: UUID): Promise<void> =>
    apiClient.delete(`/audits/${auditId}/scopes/${scopeId}`),
}
