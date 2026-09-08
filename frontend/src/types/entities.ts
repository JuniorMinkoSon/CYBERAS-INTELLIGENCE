export type UUID = string

export interface Organization {
  id: UUID
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: UUID
  email: string
  username?: string
  firstName: string
  lastName: string
  active: boolean
  emailVerified: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface Audit {
  id: UUID
  auditCode: string
  title: string
  description?: string
  status: string
  version: number
  currentVersionId?: UUID
  currentVersionNumber?: number
  scheduledStartDate?: string
  scheduledEndDate?: string
  frameworks?: string[]
  createdAt: string
  updatedAt: string
  createdByEmail: string
}

export interface AuditVersion {
  id: UUID
  auditId: UUID
  versionNumber: number
  title: string
  description?: string
  status: string
  hash?: string
  changeSummary?: string
  publishedAt?: string
  createdAt: string
  createdByEmail: string
}

export interface Scope {
  id: UUID
  auditId: UUID
  assetId?: UUID
  resourceType: string
  resourceValue: string
  status: string
  createdAt: string
}

export interface Asset {
  id: UUID
  auditId: UUID
  hostname?: string
  ipAddress?: string
  assetType: string
  operatingSystem?: string
  environment: string
  criticality: string
  internetExposed?: boolean
  owner?: string
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * Scan technique.
 *
 * Les champs suivent le contrat réellement exposé par `/scans`. La version
 * précédente déclarait un `name` que le serveur n'envoie pas et ignorait
 * `target`, `scanProfile` et `errorMessage` — c'est-à-dire ce qui a été scanné,
 * comment, et pourquoi ça a échoué. Un écran construit sur ce type ne pouvait
 * rien afficher d'utile.
 */
export interface Scan {
  id: UUID
  auditId?: UUID
  /** Cible réellement soumise au scanner. */
  target: string
  scannerType: string
  /** BASIC, STANDARD ou FULL. */
  scanProfile?: string
  /** QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED. */
  status: string
  progress?: number
  durationSeconds?: number
  /** Motif d'échec renvoyé par le serveur. Sans lui, un échec est indiagnostiquable. */
  errorMessage?: string
  startedAt?: string
  finishedAt?: string
  createdAt?: string
  findings?: number
}

export interface Finding {
  id: UUID
  scanId: UUID
  auditId: UUID
  title: string
  description?: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  status: string
  source: string
  assetId?: UUID
  createdAt: string
}

export interface Risk {
  id: UUID
  auditId: UUID
  title: string
  description?: string
  probability: 'LOW' | 'MEDIUM' | 'HIGH'
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
  score: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  responsible?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

/**
 * Recommandation produite à partir d'un constat évalué.
 *
 * Les champs suivent le contrat réellement exposé par `/recommendations` :
 * la version précédente déclarait `riskId` et `progress`, que le serveur
 * n'envoie pas, et ignorait `problem`, `risk` et `frameworkRefs`, qui portent
 * l'essentiel de la valeur — le constat, sa conséquence, et le référentiel
 * auquel il se rattache.
 */
export interface Recommendation {
  id: UUID
  auditId: UUID
  /** Constat dont découle la recommandation. */
  findingId?: UUID
  title: string
  /** Ce qui a été constaté. */
  problem?: string
  /** Ce que ce constat fait courir comme risque. */
  risk?: string
  /** L'action recommandée. */
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  /** OPEN, IN_PROGRESS, DONE */
  status: string
  /** Références de référentiel (MEHARI, ISO 27001…), forme libre côté serveur. */
  frameworkRefs?: unknown
  responsible?: string
  dueDate?: string
  createdAt: string
  updatedAt?: string
}

export interface AuditEvent {
  id: UUID
  organizationId: UUID
  auditId?: UUID
  actorId?: UUID
  eventType: string
  resourceType: string
  resourceId: UUID
  action: string
  status: string
  details?: Record<string, any>
  source: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  actorEmail?: string
}

export interface Report {
  id: UUID
  auditId: UUID
  type: string
  status: string
  generatedAt?: string
  createdAt: string
  url?: string
}
