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

/** Famille de domaines : une session du questionnaire. */
export interface QuestionFamily {
  family: string
  label: string
  description: string
  position: number
  domains: string[]
}

export interface Question {
  id: UUID
  code: string
  domain: string
  /** Libellé du thème, rendu par le serveur — le code ne s'affiche jamais brut. */
  domainLabel: string
  /** La réponse se démontre par un document. Indication de saisie, pas un critère de score. */
  evidenceRequired: boolean
  /** Famille de rattachement du domaine, décidée par le serveur. */
  family: string
  familyLabel: string
  /** Rang de la famille dans l'ordre des sessions, décidé par le serveur. */
  familyPosition: number
  position: number
  text: string
  guidance?: string
  weight: number
  frameworkRefs: FrameworkReference[]
}

export interface Answer {
  id: UUID
  questionCode: string
  /**
   * Degré de Likert, 0 à 4 : pas du tout, juste un peu, en partie, en grande
   * partie, totalement. Le champ garde son nom serveur — le renommer imposerait
   * une migration de schéma et une rupture d'API pour un gain de vocabulaire.
   */
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

/**
 * Échelle de réponse, partagée par l'affichage et la saisie.
 *
 * Échelle de Likert à cinq degrés, et non l'échelle de maturité CMMI qui
 * figurait ici. « Absent / Initial / Partiel / Défini / Mesuré » demande à
 * l'audité de situer sa propre organisation sur un modèle de maturité qu'il ne
 * connaît pas — d'où des réponses qui mesurent surtout la familiarité avec le
 * vocabulaire d'audit. « Pas du tout / … / Totalement » se répond sans
 * formation préalable, ce qui est la condition d'une auto-évaluation sincère.
 *
 * Les valeurs restent 0 à 4 : le serveur valide déjà cet intervalle, les 159
 * réponses enregistrées gardent leur sens, et aucun score calculé n'est
 * invalidé. Seuls les libellés changent.
 */
export const LIKERT_LEVELS = [
  { value: 0, label: 'Pas du tout', description: 'Rien n\'est en place sur ce point' },
  { value: 1, label: 'Juste un peu', description: 'Quelques pratiques informelles, sans continuité' },
  { value: 2, label: 'En partie', description: 'En place, mais appliqué de façon inégale' },
  { value: 3, label: 'En grande partie', description: 'Appliqué partout, de manière constante' },
  { value: 4, label: 'Totalement', description: 'Appliqué, mesuré et amélioré en continu' },
] as const

export const questionnaireClient = {
  /** Catalogue complet, indépendant de tout audit. */
  listQuestions: async (): Promise<Question[]> => {
    return apiClient.get('/questionnaire/questions')
  },

  /**
   * Familles de domaines, dans l'ordre des sessions.
   *
   * Rendues même vides : c'est ce qui permet d'afficher une session sans
   * question plutôt que de l'omettre.
   */
  listFamilies: async (): Promise<QuestionFamily[]> => {
    return apiClient.get('/questionnaire/families')
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
