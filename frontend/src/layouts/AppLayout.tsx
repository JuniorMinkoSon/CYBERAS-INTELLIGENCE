import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../contexts/OrganizationContext'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ClipboardList,
  ListChecks,
  FolderOpen,
  Server,
  Radar,
  Bug,
  Map,
  Lightbulb,
  FileText,
  History,
  Building2,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react'
import { Logo } from '../components/marketing/Logo'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/audits', label: 'Audits', icon: ClipboardList },
  { to: '/app/questionnaire', label: 'Questionnaire', icon: ListChecks },
  { to: '/app/evidence', label: 'Evidence', icon: FolderOpen },
  { to: '/app/assets', label: 'Assets', icon: Server },
  { to: '/app/scans', label: 'Scans', icon: Radar },
  { to: '/app/findings', label: 'Findings', icon: Bug },
  { to: '/app/risk-map', label: 'Risk Map', icon: Map },
  { to: '/app/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/app/reports', label: 'Reports', icon: FileText },
  { to: '/app/audit-trail', label: 'Audit Trail', icon: History },
  { to: '/app/organization', label: 'Organization', icon: Building2 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { organization, currentUser } = useOrganization()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-bg-dark text-text-on-dark">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border-dark bg-surface-dark transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="border-b border-border-dark px-4 py-4">
          <Link to="/">
            <Logo light={false} />
          </Link>
        </div>
        {organization && (
          <p className="truncate px-4 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-text-on-dark-muted">
            {organization.name}
          </p>
        )}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2" aria-label="Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand text-white' : 'text-text-on-dark-muted hover:bg-bg-dark hover:text-white'
                }`
              }
            >
              <item.icon size={17} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border-dark p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{user?.name || 'Utilisateur'}</span>
              <span className="block truncate text-xs text-text-on-dark-muted">
                {currentUser?.isOwner ? 'Propriétaire' : 'Membre'} · {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              aria-label="Se déconnecter"
              className="text-text-on-dark-muted transition hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 md:ml-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border-dark bg-bg-dark/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white transition hover:text-brand md:hidden"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <ShieldCheck size={22} className="text-brand" />
              <span className="truncate text-sm font-bold">{organization?.name ?? 'CYBERAS'}</span>
            </div>
          </div>
          <span className="hidden text-xs text-text-on-dark-muted md:block">CYBERAS Intelligence</span>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
