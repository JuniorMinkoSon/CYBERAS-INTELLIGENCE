export interface AuditEvent {
  id: string
  organizationId: string
  auditId?: string
  actorId?: string
  eventType: string
  resourceType?: string
  resourceId?: string
  action?: string
  status: string
  details?: Record<string, any>
  source: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  actorEmail?: string
}

export interface AuditEventFilters {
  eventType?: string
  resourceType?: string
  actorId?: string
  startDate?: string
  endDate?: string
  ipAddress?: string
}
