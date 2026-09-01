import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface AuditContextType {
  currentAuditId: string | null
  currentVersionId: string | null
  currentScopeId: string | null
  currentAudit: any | null
  currentVersion: any | null

  setCurrentAudit: (auditId: string, audit: any) => void
  setCurrentVersion: (versionId: string, version: any) => void
  setCurrentScope: (scopeId: string) => void
  clearCurrent: () => void
}

const AuditContext = createContext<AuditContextType | undefined>(undefined)

export function AuditProvider({ children }: { children: ReactNode }) {
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null)
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)
  const [currentScopeId, setCurrentScopeId] = useState<string | null>(null)
  const [currentAudit, setCurrentAuditData] = useState<any | null>(null)
  const [currentVersion, setCurrentVersionData] = useState<any | null>(null)

  const setCurrentAudit = (auditId: string, audit: any) => {
    setCurrentAuditId(auditId)
    setCurrentAuditData(audit)
  }

  const setCurrentVersion = (versionId: string, version: any) => {
    setCurrentVersionId(versionId)
    setCurrentVersionData(version)
  }

  const setCurrentScope = (scopeId: string) => {
    setCurrentScopeId(scopeId)
  }

  const clearCurrent = () => {
    setCurrentAuditId(null)
    setCurrentVersionId(null)
    setCurrentScopeId(null)
    setCurrentAuditData(null)
    setCurrentVersionData(null)
  }

  return (
    <AuditContext.Provider
      value={{
        currentAuditId,
        currentVersionId,
        currentScopeId,
        currentAudit,
        currentVersion,
        setCurrentAudit,
        setCurrentVersion,
        setCurrentScope,
        clearCurrent,
      }}
    >
      {children}
    </AuditContext.Provider>
  )
}

export function useCurrentAudit() {
  const context = useContext(AuditContext)
  if (!context) {
    throw new Error('useCurrentAudit must be used within AuditProvider')
  }
  return context
}
