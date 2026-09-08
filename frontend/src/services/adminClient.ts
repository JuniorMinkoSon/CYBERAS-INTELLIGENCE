import { apiClient } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Vue transverse de la plateforme, réservée au rôle ADMIN.
 *
 * Toutes les autres ressources sont cloisonnées par organisation ; celle-ci
 * regarde l'ensemble des clients. Le serveur refuse l'appel à tout autre rôle —
 * le client ne fait que présenter ce qu'on lui accorde.
 */

export interface OrganizationOverview {
  id: UUID
  name: string
  sector?: string
  sectorLabel?: string
  active: boolean
  auditCount: number
  userCount: number
  /** Score le plus élevé parmi les audits courants ; null si jamais évaluée. */
  riskScore: number | null
  riskLevel: string | null
  /** Rang d'exposition : 1 = organisation la plus exposée. Null si jamais évaluée. */
  exposureRank: number | null
  /** Même rang, restreint aux organisations du même secteur. */
  sectorRank: number | null
  sectorPeers: number | null
  assessedAudits: number
  findingsCount: number
  criticalCount: number
  highCount: number
  lastAssessedAt?: string
  createdAt: string
}

export interface PlatformSummary {
  organizations: number
  audits: number
  users: number
  assessedAudits: number
}

export const adminClient = {
  organizations: async (): Promise<OrganizationOverview[]> => {
    return apiClient.get('/admin/organizations')
  },

  summary: async (): Promise<PlatformSummary> => {
    return apiClient.get('/admin/summary')
  },
}

// ---------------------------------------------------------------------------
// Classements
// ---------------------------------------------------------------------------

export interface SectorRanking {
  sector: string
  sectorLabel: string
  organizations: number
  assessedOrganizations: number
  /** Moyenne des scores d'exposition ; null si aucune organisation évaluée. */
  averageScore: number | null
  bestScore: number | null
  worstScore: number | null
  /** Impact métier retenu par défaut pour ce secteur (approche MEHARI). */
  defaultImpact: string
  defaultDataSensitivity: string
  rank: number | null
}

export interface DomainRanking {
  domain: string
  averageMaturity: number
  postureLabel: string
  assessedAudits: number
  weakControls: number
  foundational: boolean
  frameworkRefs: { framework: string; controlId: string }[]
  rank: number | null
}

export const rankingsClient = {
  sectors: async (): Promise<SectorRanking[]> => apiClient.get('/admin/rankings/sectors'),
  domains: async (): Promise<DomainRanking[]> => apiClient.get('/admin/rankings/domains'),
}
