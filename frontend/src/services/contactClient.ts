import { apiClient } from './apiClient'
import type { UUID } from '../types/entities'

/**
 * Demandes entrantes du site public.
 *
 * Le dépôt est ouvert — celui qui remplit le formulaire n'a pas de compte —
 * tandis que la lecture de la boîte de réception exige d'être authentifié.
 * Cette asymétrie est portée par le serveur ; le client ne fait que suivre.
 */

export interface ContactSubmission {
  kind: 'DEMO' | 'CONTACT'
  fullName: string
  email: string
  company?: string
  phone?: string
  sector?: string
  companySize?: string
  message?: string
  sourcePage?: string
}

export interface ContactRequestRecord {
  id: UUID
  kind: 'DEMO' | 'CONTACT'
  fullName: string
  email: string
  company?: string
  phone?: string
  sector?: string
  /** Libellé lisible du secteur, fourni par le serveur. */
  sectorLabel?: string
  companySize?: string
  message?: string
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED'
  handledNote?: string
  sourcePage?: string
  createdAt: string
  updatedAt: string
}

export interface ContactSummary {
  total: number
  pending: number
  demos: number
  contacts: number
}

export const contactClient = {
  /** Route publique : aucun jeton requis. */
  submit: async (submission: ContactSubmission): Promise<{ received: boolean; message: string }> => {
    return apiClient.post('/contact-requests', {
      ...submission,
      // La page d'origine aide à qualifier la demande sans rien demander de plus.
      sourcePage: submission.sourcePage ?? window.location.pathname,
    })
  },

  list: async (filters?: { status?: string; kind?: string }): Promise<ContactRequestRecord[]> => {
    return apiClient.get('/contact-requests', filters)
  },

  summary: async (): Promise<ContactSummary> => {
    return apiClient.get('/contact-requests/summary')
  },

  update: async (
    id: UUID,
    request: { status?: string; handledNote?: string },
  ): Promise<ContactRequestRecord> => {
    return apiClient.put(`/contact-requests/${id}`, request)
  },
}
