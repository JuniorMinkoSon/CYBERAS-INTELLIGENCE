import { apiClient } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Invitations d'équipe.
 *
 * Le code complet n'est renvoyé qu'à la création : les relectures n'exposent
 * qu'une empreinte de quelques caractères. Une fuite de la liste ne donne donc
 * accès à rien, et l'interface doit présenter le lien au moment où il est créé
 * — il ne sera plus récupérable ensuite.
 */

export interface CreatedInvitation {
  id: UUID
  /** Code complet. Visible une seule fois. */
  code: string
  role: string
  email?: string
  expiresAt: string
  /** Chemin relatif à coller après le domaine de la plateforme. */
  path: string
}

export interface InvitationRecord {
  id: UUID
  /** Quelques caractères : reconnaître un lien sans pouvoir s'en servir. */
  codeHint: string
  role: string
  email?: string
  status: 'PENDING' | 'USED' | 'EXPIRED' | 'REVOKED'
  expiresAt?: string
  usedAt?: string
  usedByEmail?: string
  revokedAt?: string
  createdAt: string
  createdByEmail?: string
}

export const invitationsClient = {
  list: async (): Promise<InvitationRecord[]> => apiClient.get('/invitations'),

  create: async (request: {
    role: string
    email?: string
    validityDays?: number
  }): Promise<CreatedInvitation> => apiClient.post('/invitations', request),

  revoke: async (id: UUID): Promise<InvitationRecord> =>
    apiClient.delete(`/invitations/${id}`) as Promise<InvitationRecord>,

  /** Route publique : celui qui suit le lien n'a pas encore de compte. */
  check: async (code: string): Promise<{ valid: boolean; role?: string; reason?: string }> =>
    apiClient.get(`/invitations/check/${encodeURIComponent(code)}`),
}
