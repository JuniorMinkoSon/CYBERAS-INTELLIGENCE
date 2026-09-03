import { apiClient } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Client du questionnaire d'audit.
 *
 * Le score de maturité est calculé côté serveur et jamais recalculé ici : c'est
 * lui qui alimente le moteur de risque, et deux calculs concurrents finiraient
 * par diverger. Le front affiche ce que le backend renvoie.
 */

export interface FrameworkReference {
  framework: string
  /** Identifiant du contrôle dans le référentiel, ex. « 5.15 » pour ISO 27002. */
  controlId: string
}

export interface Question {
  id: UUID
  code: string
  domain: string
  position: number
  text: string
  guidance?: string
  weight: number
  frameworkRefs: FrameworkReference[]
}

export interface Answer {
  id: UUID
  questionCode: string
  /** Échelle 0 à 4 : absent, initial, partiel, défini, mesuré. */
  maturityLevel: number | null
  notApplicable: boolean
  comment?: string
  answeredAt: string
  answeredByEmail?: string
}

export interface DomainSummary {
  domain: string
  totalQuestions: number
  answeredQuestions: number
  /** Absent tant qu'aucune réponse n'est saisie sur le domaine. */
  maturityScore: number | null
}

export interface WeakControl {
  questionCode: string
  domain: string
  text: string
  maturityLevel: number
}

export interface QuestionnaireSummary {
  totalQuestions: number
  applicableQuestions: number
  answeredQuestions: number
  /** Part des questions applicables ayant reçu une réponse, 0 à 1. */
  completionRate: number
  maturityScore: number | null
  weakControls: number
  domains: DomainSummary[]
  weakControlDetails: WeakControl[]
}

export interface Questionnaire {
  questions: Question[]
  answers: Answer[]
  summary: QuestionnaireSummary
}

export interface AnswerRequest {
  /** Null quand la question est déclarée non applicable. */
  maturityLevel: number | null
  notApplicable: boolean
  comment?: string
}

/** Échelle de maturité, partagée par l'affichage et la saisie. */
export const MATURITY_LEVELS = [
  { value: 0, label: 'Absent', description: 'Aucune mesure en place' },
  { value: 1, label: 'Initial', description: 'Pratique informelle, non documentée' },
  { value: 2, label: 'Partiel', description: 'Défini mais appliqué de façon inégale' },
  { value: 3, label: 'Défini', description: 'Documenté et appliqué de manière constante' },
  { value: 4, label: 'Mesuré', description: 'Piloté par des indicateurs et amélioré' },
] as const

export const questionnaireClient = {
  /** Catalogue complet, indépendant de tout audit. */
  listQuestions: async (): Promise<Question[]> => {
    return apiClient.get('/questionnaire/questions')
  },

  /** Questions, réponses et synthèse pour un audit donné. */
  getForAudit: async (auditId: UUID): Promise<Questionnaire> => {
    return apiClient.get(`/audits/${auditId}/questionnaire`)
  },

  getSummary: async (auditId: UUID): Promise<QuestionnaireSummary> => {
    return apiClient.get(`/audits/${auditId}/questionnaire/summary`)
  },

  /**
   * Enregistre une réponse. L'appel est idempotent : réémettre la même valeur
   * ne crée pas de doublon, il met à jour la réponse existante et sa date.
   */
  answer: async (auditId: UUID, code: string, request: AnswerRequest): Promise<void> => {
    return apiClient.put(`/audits/${auditId}/questionnaire/answers/${code}`, request)
  },
}
