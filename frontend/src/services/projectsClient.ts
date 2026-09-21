import { apiClient } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Projets d'évaluation : administration de la plateforme.
 *
 * Plusieurs sociétés inscrites dans un même projet, chacune dans son propre
 * espace, comparées et classées par mérite une fois questionnaires et scans
 * terminés. Le serveur refuse ces appels à tout compte qui n'administre pas
 * la plateforme.
 *
 * Le code d'un lien d'accès n'est renvoyé qu'à sa création : l'interface doit
 * le présenter à ce moment-là, il n'est plus récupérable ensuite (seul un
 * nouveau lien peut être émis, qui révoque l'ancien).
 */

export type ProjectStatus = 'OPEN' | 'CLOSED'

export interface ProjectSummary {
  id: UUID
  name: string
  description: string | null
  status: ProjectStatus
  deadline: string | null
  participants: number
  joined: number
  answering: number
  createdAt: string
  closedAt: string | null
}

export interface ParticipantRow {
  id: UUID
  organizationId: UUID
  organizationName: string
  sector: string | null
  sectorLabel: string
  contactName: string | null
  contactEmail: string | null
  auditId: UUID | null
  /** PENDING, USED, EXPIRED, REVOKED ; null si aucun lien n'a été émis. */
  invitationStatus: 'PENDING' | 'USED' | 'EXPIRED' | 'REVOKED' | null
  invitationExpiresAt: string | null
  joined: boolean
  members: number
  applicableQuestions: number
  answeredQuestions: number
  /** Pourcentage 0-100. */
  completionRate: number
  lastAnswerAt: string | null
  /** Maturité déclarée 0-4 ; null sans réponse. */
  maturityScore: number | null
  /** Exposition constatée 0-100 ; null sans évaluation. */
  riskScore: number | null
  riskLevel: string | null
  assessedAt: string | null
  scansTotal: number
  scansCompleted: number
  criticalFindings: number
  highFindings: number
  /** Mérite sur 100 ; null sans réponse. */
  meritScore: number | null
  /** 1 = meilleure société ; null si non classée. */
  rank: number | null
}

export interface ProjectDetail {
  id: UUID
  name: string
  description: string | null
  status: ProjectStatus
  deadline: string | null
  createdAt: string
  closedAt: string | null
  participants: ParticipantRow[]
}

export interface AddedParticipant {
  participant: ParticipantRow
  /** Code complet du lien. Visible une seule fois. */
  invitationCode: string
  /** Chemin à coller après le domaine de la plateforme. */
  invitationPath: string
  organizationCreated: boolean
}

export interface AnswerRow {
  code: string
  domain: string
  text: string
  weight: number
  maturityLevel: number | null
  comment: string | null
  answeredAt: string | null
  answeredBy: string | null
}

export interface ParticipantAnswers {
  participant: ParticipantRow
  answers: AnswerRow[]
}

export const projectsClient = {
  list: async (): Promise<ProjectSummary[]> => apiClient.get('/admin/projects'),

  create: async (request: { name: string; description?: string; deadline?: string }): Promise<ProjectSummary> =>
    apiClient.post('/admin/projects', request),

  detail: async (id: UUID): Promise<ProjectDetail> => apiClient.get(`/admin/projects/${id}`),

  evaluate: async (id: UUID): Promise<ProjectDetail> => apiClient.post(`/admin/projects/${id}/evaluate`),

  close: async (id: UUID): Promise<ProjectSummary> => apiClient.post(`/admin/projects/${id}/close`),

  reopen: async (id: UUID): Promise<ProjectSummary> => apiClient.post(`/admin/projects/${id}/reopen`),

  remove: async (id: UUID): Promise<void> => {
    await apiClient.delete(`/admin/projects/${id}`)
  },

  addParticipant: async (
    id: UUID,
    request: { organizationName: string; sector?: string; contactName?: string; contactEmail?: string },
  ): Promise<AddedParticipant> => apiClient.post(`/admin/projects/${id}/participants`, request),

  renewInvitation: async (id: UUID, participantId: UUID): Promise<AddedParticipant> =>
    apiClient.post(`/admin/projects/${id}/participants/${participantId}/invitation`),

  removeParticipant: async (id: UUID, participantId: UUID): Promise<void> => {
    await apiClient.delete(`/admin/projects/${id}/participants/${participantId}`)
  },

  answers: async (id: UUID, participantId: UUID): Promise<ParticipantAnswers> =>
    apiClient.get(`/admin/projects/${id}/participants/${participantId}/answers`),
}
