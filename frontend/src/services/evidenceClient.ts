import { apiClient, API_BASE, TOKEN_STORAGE_KEY } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Dossier de preuves d'un audit.
 *
 * Le niveau déclaré et le niveau démontré circulent séparément et ne doivent
 * jamais être confondus dans l'affichage : c'est l'écart entre les deux qui
 * porte l'information.
 */
export interface EvidenceItem {
  documentId: UUID
  fileName: string
  contentType?: string
  sizeBytes?: number
  description?: string
  status: string
  uploadedAt: string

  /** Question étayée, si la pièce est rattachée. */
  questionCode?: string
  questionText?: string
  domain?: string
  familyLabel?: string

  /** Niveau saisi par l'audité. Jamais remplacé par l'analyse. */
  declaredLevel?: number
  /** Niveau que la pièce démontre, selon l'analyse. */
  evidencedLevel?: number
  analysisConfidence?: number
  analysisRationale?: string
  analyzer?: string
  analyzedAt?: string

  /** Rapport brut niveau démontré / niveau déclaré. */
  ratio?: number
  /** Facteur réellement appliqué au poids, modulé par la confiance. */
  corroboration?: number
  questionWeight?: number
  effectiveWeight?: number
  underEvidenced: boolean
  weightingExplanation?: string

  note?: string
}

export interface AnalysisSummary {
  documents: number
  analyzed: number
  unusable: number
  analyzer: string
}

/** Pièce versée au dossier, telle que le serveur la renvoie après téléversement. */
export interface UploadedDocument {
  id: UUID
  auditId: UUID
  fileName: string
  contentType?: string
  sizeBytes?: number
  status: string
  description?: string
  uploadedAt: string
  uploadedByEmail?: string
}

/**
 * Rattachement d'une pièce à ce qu'elle étaye.
 *
 * Distinct du document lui-même : une même pièce peut étayer plusieurs
 * questions, et la détacher d'une question ne doit pas la retirer du dossier.
 */
export interface EvidenceLink {
  id: UUID
  auditId: UUID
  documentId: UUID
  documentName: string
  questionCode?: string
  findingId?: UUID
  recommendationId?: UUID
  note?: string
  createdAt: string
}

export const evidenceClient = {
  /**
   * Verse une piece au dossier.
   *
   * Passe par `fetch` directement plutot que par le client JSON : un envoi
   * multipart ne doit pas porter d'en-tete `Content-Type` fixe a la main. Le
   * navigateur y ajoute la frontiere de separation qu'il genere lui-meme, et
   * l'ecraser rend le corps illisible cote serveur.
   */
  upload: async (auditId: UUID, file: File, description?: string): Promise<UploadedDocument> => {
    const body = new FormData()
    body.append('file', file)
    if (description) body.append('description', description)

    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    const res = await fetch(`${API_BASE}/audits/${auditId}/documents`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body,
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(detail || `Televersement refuse (${res.status})`)
    }
    return res.json().catch(() => null)
  },

  list: async (auditId: UUID): Promise<EvidenceItem[]> =>
    apiClient.get(`/evidence/audits/${auditId}`),

  /** `force` réanalyse aussi les pièces déjà notées. */
  analyze: async (auditId: UUID, force = false): Promise<AnalysisSummary> =>
    apiClient.post(`/evidence/audits/${auditId}/analyze?force=${force}`, {}),

  /** Rattachements de l'audit, toutes cibles confondues. */
  listLinks: async (auditId: UUID): Promise<EvidenceLink[]> =>
    apiClient.get(`/audits/${auditId}/documents/evidences`),

  /** Rattache une pièce déjà versée à une question. */
  link: async (
    auditId: UUID,
    documentId: UUID,
    questionCode: string,
    note?: string
  ): Promise<EvidenceLink> =>
    apiClient.post(`/audits/${auditId}/documents/evidences`, {
      documentId,
      questionCode,
      note,
    }),

  /**
   * Détache une pièce.
   *
   * Ne supprime que le lien : le document reste au dossier de l'audit, où il
   * peut étayer d'autres questions. Le retirer entièrement relève de la page
   * des preuves.
   */
  unlink: async (auditId: UUID, evidenceId: UUID): Promise<void> => {
    await apiClient.delete(`/audits/${auditId}/documents/evidences/${evidenceId}`)
  },

  /**
   * Verse une pièce et la rattache à une question, en un geste.
   *
   * Les deux appels sont séparés côté serveur ; les enchaîner ici évite qu'une
   * pièce téléversée depuis le questionnaire reste orpheline si l'utilisateur
   * quitte la page entre les deux.
   */
  attachToQuestion: async (
    auditId: UUID,
    questionCode: string,
    file: File
  ): Promise<EvidenceLink> => {
    const document = await evidenceClient.upload(auditId, file)
    return evidenceClient.link(auditId, document.id, questionCode)
  },
}
