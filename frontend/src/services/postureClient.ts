import { apiClient } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Posture de sécurité et rapport organisationnel.
 *
 * Ces données proviennent du questionnaire de maturité et ne dépendent d'aucun
 * scan : un audit purement organisationnel produit un résultat complet.
 */

export interface FamilyPosture {
  family: string
  label: string
  description: string
  /** Moyenne des domaines renseignés ; null si aucun. */
  maturityScore: number | null
  postureLabel: string | null
  domainsAssessed: number
  domainsTotal: number
  weakControls: number
  domains: string[]
}

export interface DomainPosture {
  domain: string
  maturityScore: number | null
  postureLabel: string | null
  answeredQuestions: number
  applicableQuestions: number
  completionRate: number
  weakControls: number
  foundational: boolean
  family: string
  familyLabel: string
  frameworkRefs: { framework: string; controlId: string }[]
}

export interface HistogramBar {
  level: number
  label: string
  count: number
  share: number
}

export interface ImprovementAxis {
  domain: string
  weakControls: number
  averageLevel: number
  expectedGain: number
  foundational: boolean
  /** Questions qui ont fait chuter le domaine, de la plus faible à la moins faible. */
  weakQuestions: { code: string; text: string; level: number }[]
  frameworkRefs: { framework: string; controlId: string }[]
}

export interface PostureReport {
  posture: string
  postureLabel: string
  postureDescription: string
  maturityScore: number | null
  completionRate: number
  answeredQuestions: number
  applicableQuestions: number
  domains: DomainPosture[]
  families: FamilyPosture[]
  histogram: HistogramBar[]
  improvementAxes: ImprovementAxis[]
  /** La corrélation entre domaines a-t-elle abaissé la posture ? */
  downgradedByCorrelation: boolean
  correlationExplanation: string
}

export interface OrganizationalRecommendation {
  domain: string
  title: string
  problem: string
  action: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  weakControls: number
  averageLevel: number
  expectedGain: number
  foundational: boolean
  /** Questions qui ont fait chuter le domaine, de la plus faible à la moins faible. */
  weakQuestions: { code: string; text: string; level: number }[]
  frameworkRefs: { framework: string; controlId: string }[]
}

export interface FrameworkOption {
  code: string
  name: string
  publisher: string
  version: string
  url: string
  /** Couvert par la formule souscrite. Un référentiel non couvert reste listé. */
  available: boolean
  lockedReason: string | null
}

export interface FrameworkCatalogResponse {
  plan: string
  planLabel: string
  frameworks: FrameworkOption[]
}

export const postureClient = {
  report: async (auditId: UUID): Promise<PostureReport> =>
    apiClient.get(`/posture/audits/${auditId}`),

  recommendations: async (
    auditId: UUID,
    framework?: string,
  ): Promise<OrganizationalRecommendation[]> =>
    apiClient.get(
      `/posture/audits/${auditId}/recommendations`,
      framework ? { framework } : undefined,
    ),

  frameworks: async (): Promise<FrameworkCatalogResponse> =>
    apiClient.get('/posture/frameworks'),
}
