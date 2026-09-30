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
  /** Famille de rattachement, pour regrouper les recommandations. */
  family: string
  familyLabel: string
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

/**
 * Une entrée du catalogue des référentiels, sur deux axes distincts.
 *
 * <p>Ne pas confondre {@link available} et {@link scorable} : le premier dit
 * ce que la formule souscrite autorise, le second ce que la base contient.
 * Un client de la formule annuelle peut avoir droit à un référentiel dont les
 * contrôles ne sont pas encore en base — il est alors `available` mais pas
 * `scorable`, et aucun score ne peut être produit.
 *
 * <p>La distinction n'existait pas : seul `available` était renvoyé, si bien
 * qu'un référentiel autorisé mais vide se présentait comme disponible et ne
 * rendait rien, sans qu'aucun écran n'explique pourquoi.
 */
export interface FrameworkOption {
  code: string
  name: string
  publisher: string
  version: string
  url: string
  /** Couvert par la formule souscrite. Un référentiel non couvert reste listé. */
  available: boolean
  lockedReason: string | null
  /** La base porte assez de contrôles rattachés pour produire un score. */
  scorable: boolean
  /** Contrôles enregistrés pour la version en vigueur. */
  controlCount: number
  /**
   * Ceux qu'au moins une question atteint réellement.
   *
   * <p>C'est ce compte qui décrit la couverture, pas {@link controlCount} :
   * ISO 27001 porte 93 contrôles dont 43 seulement sont rattachés, les autres
   * ressortant « non évalué ». Afficher 93 laisserait croire à une évaluation
   * complète.
   */
  mappedControlCount: number
  /** Pourquoi aucun score n'est possible, quand {@link scorable} est faux. */
  dataReason: string | null
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
