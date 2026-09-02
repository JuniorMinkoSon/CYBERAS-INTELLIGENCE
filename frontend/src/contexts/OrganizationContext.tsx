import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface OrganizationData {
  id: string
  name: string
  email?: string
  createdAt?: string
}

export interface UserInOrg {
  id: string
  email: string
  name: string
  role: 'owner' | 'member'
  permissions: {
    canViewAudits: boolean
    canCreateAudits: boolean
    canModifyQuestionnaire: boolean
    canUploadEvidence: boolean
    canManageAssets: boolean
    canLaunchScans: boolean
    canViewFindings: boolean
    canViewRisks: boolean
    canViewRecommendations: boolean
    canDownloadReports: boolean
    canManageUsers: boolean
    canDeleteAudits: boolean
    canViewAuditTrail: boolean
  }
}

export interface OrganizationContextType {
  organization: OrganizationData | null
  currentUser: UserInOrg | null
  members: UserInOrg[]
  setOrganization: (org: OrganizationData) => void
  setCurrentUser: (user: UserInOrg) => void
  setMembers: (members: UserInOrg[]) => void
  hasPermission: (action: keyof UserInOrg['permissions']) => boolean
  isOwner: () => boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<OrganizationData | null>(null)
  const [currentUser, setCurrentUser] = useState<UserInOrg | null>(null)
  const [members, setMembers] = useState<UserInOrg[]>([])

  const hasPermission = (action: keyof UserInOrg['permissions']): boolean => {
    if (!currentUser) return false
    if (currentUser.role === 'owner') return true
    return currentUser.permissions[action] || false
  }

  const isOwner = (): boolean => {
    return currentUser?.role === 'owner'
  }

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        currentUser,
        members,
        setOrganization,
        setCurrentUser,
        setMembers,
        hasPermission,
        isOwner,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}
