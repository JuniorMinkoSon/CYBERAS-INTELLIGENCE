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

export interface Scan {
  id: UUID
  auditId: UUID
  name: string
  scannerType: string
  status: string
  startedAt: string
  completedAt?: string
  createdAt: string
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

export interface Recommendation {
  id: UUID
  riskId: UUID
  auditId: UUID
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  responsible?: string
  dueDate?: string
  progress?: number
  createdAt: string
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
