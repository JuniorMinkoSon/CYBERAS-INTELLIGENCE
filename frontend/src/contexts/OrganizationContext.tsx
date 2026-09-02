import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth, type SystemRole } from './AuthContext'

export interface OrganizationData {
  id: string
  name: string
}

export type Permission =
  | 'canViewAudits'
  | 'canCreateAudits'
  | 'canModifyQuestionnaire'
  | 'canUploadEvidence'
  | 'canManageAssets'
  | 'canLaunchScans'
  | 'canViewFindings'
  | 'canViewRisks'
  | 'canViewRecommendations'
  | 'canDownloadReports'
  | 'canManageUsers'
  | 'canDeleteAudits'
  | 'canViewAuditTrail'

export interface OrganizationMember {
  id: string
  email: string
  name: string
  role: SystemRole
  isOwner: boolean
  permissions: Record<Permission, boolean>
}

export interface OrganizationContextType {
  organization: OrganizationData | null
  currentUser: OrganizationMember | null
  hasPermission: (action: Permission) => boolean
  isOwner: () => boolean
}

const ALL_PERMISSIONS: Permission[] = [
  'canViewAudits',
  'canCreateAudits',
  'canModifyQuestionnaire',
  'canUploadEvidence',
  'canManageAssets',
  'canLaunchScans',
  'canViewFindings',
  'canViewRisks',
  'canViewRecommendations',
  'canDownloadReports',
  'canManageUsers',
  'canDeleteAudits',
  'canViewAuditTrail',
]

const VIEW_PERMISSIONS: Permission[] = [
  'canViewAudits',
  'canViewFindings',
  'canViewRisks',
  'canViewRecommendations',
  'canDownloadReports',
  'canViewAuditTrail',
]

const WRITER_PERMISSIONS: Permission[] = [
  ...VIEW_PERMISSIONS,
  'canCreateAudits',
  'canModifyQuestionnaire',
  'canUploadEvidence',
  'canManageAssets',
  'canLaunchScans',
]

/** Permissions dérivées du rôle système porté par le JWT (autorité : le backend). */
function permissionsForRole(role: SystemRole): Record<Permission, boolean> {
  const granted: Permission[] =
    role === 'ADMIN' ? ALL_PERMISSIONS
      : role === 'RSSI' ? [...WRITER_PERMISSIONS, 'canDeleteAudits']
        : role === 'AUDITOR' ? WRITER_PERMISSIONS
          : VIEW_PERMISSIONS
  return Object.fromEntries(ALL_PERMISSIONS.map((p) => [p, granted.includes(p)])) as Record<Permission, boolean>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const value = useMemo<OrganizationContextType>(() => {
    const organization: OrganizationData | null = user
      ? { id: user.organizationId, name: user.organization }
      : null
    const currentUser: OrganizationMember | null = user
      ? {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        isOwner: user.role === 'ADMIN',
        permissions: permissionsForRole(user.role),
      }
      : null
    return {
      organization,
      currentUser,
      hasPermission: (action) => currentUser?.permissions[action] ?? false,
      isOwner: () => currentUser?.isOwner ?? false,
    }
  }, [user])

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization doit être utilisé dans un OrganizationProvider')
  }
  return context
}
