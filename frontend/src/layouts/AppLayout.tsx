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
  ChevronDown,
} from 'lucide-react'
import { Logo } from '../components/marketing/Logo'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

/**
 * Navigation en deux temps.
 *
 * Les treize entrées d'origine mettaient sur le même plan ce qu'un client fait
 * lui-même et ce qui relève du métier d'auditeur — « Evidence », « Findings »,
 * « Audit Trail ». Résultat : il fallait comprendre le vocabulaire d'audit avant
 * d'obtenir un score.
 *
 * Le premier groupe suit le parcours réel d'une mission, dans l'ordre où on le
 * traverse. Le second reste accessible, replié, pour qui sait ce qu'il cherche.
 */
const navEssentiel: NavItem[] = [
  { to: '/app', label: 'Accueil', icon: LayoutDashboard, end: true },
  { to: '/app/audits', label: 'Mes missions', icon: ClipboardList },
  { to: '/app/questionnaire', label: 'Questionnaire', icon: ListChecks },
  { to: '/app/scans', label: 'Scans', icon: Radar },
  { to: '/app/recommendations', label: 'Recommandations', icon: Lightbulb },
  { to: '/app/reports', label: 'Rapports', icon: FileText },
]

const navAvance: NavItem[] = [
  { to: '/app/evidence', label: 'Pièces jointes', icon: FolderOpen },
  { to: '/app/assets', label: 'Actifs', icon: Server },
  { to: '/app/findings', label: 'Écarts', icon: Bug },
  { to: '/app/risk-map', label: 'Carte des risques', icon: Map },
  { to: '/app/audit-trail', label: 'Journal', icon: History },
  { to: '/app/organization', label: 'Organisation', icon: Building2 },
  { to: '/app/settings', label: 'Réglages', icon: Settings },
]

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Replié par défaut : c'est tout l'intérêt du regroupement.
  const [advancedOpen, setAdvancedOpen] = useState(false)
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
          {navEssentiel.map((item) => (
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

          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-on-dark-muted transition-colors hover:text-white"
          >
            <ChevronDown
              size={13}
              className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
            />
            Avancé
          </button>

          {advancedOpen &&
            navAvance.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
