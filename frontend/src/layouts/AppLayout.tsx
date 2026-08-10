import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  Bug,
  Settings,
  Users,
  Building2,
  CreditCard,
  ScrollText,
  Activity,
  ShieldCheck,
  LogOut,
  Server,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '../components/marketing/Logo'

export type Role = 'auditeur' | 'admin' | 'rssi'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navs: Record<Role, NavItem[]> = {
  auditeur: [
    { to: '/app/auditeur', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/app/auditeur/missions', label: "Missions d'audit", icon: ClipboardList },
    { to: '/app/auditeur/vulnerabilites', label: 'Vulnérabilités', icon: Bug },
    { to: '/app/auditeur/parametres', label: 'Paramètres', icon: Settings },
  ],
  admin: [
    { to: '/app/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/app/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/app/admin/organisations', label: 'Organisations', icon: Building2 },
    { to: '/app/admin/abonnements', label: 'Abonnements & Tarifs', icon: CreditCard },
    { to: '/app/admin/logs', label: 'Journaux d’activité', icon: ScrollText },
    { to: '/app/admin/parametres', label: 'Paramètres', icon: Settings },
  ],
  rssi: [
    { to: '/app/rssi', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/app/rssi/risques', label: 'Risques', icon: AlertTriangle },
    { to: '/app/rssi/vulnerabilites', label: 'Vulnérabilités', icon: Bug },
    { to: '/app/rssi/missions', label: 'Audits & Missions', icon: ClipboardList },
    { to: '/app/rssi/assets', label: 'Assets', icon: Server },
    { to: '/app/rssi/rapports', label: 'Rapports', icon: FileText },
    { to: '/app/rssi/parametres', label: 'Paramètres', icon: Settings },
  ],
}

const spaceLabels: Record<Role, string> = {
  auditeur: 'ESPACE AUDITEUR',
  admin: 'ESPACE ADMIN',
  rssi: 'ESPACE RSSI',
}

export function AppLayout({ role }: { role: Role }) {
  const dark = role === 'rssi'

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-bg-dark text-text-on-dark' : 'bg-surface-light text-text-on-light'}`}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r md:flex ${
          dark ? 'border-border-dark bg-surface-dark' : 'border-slate-200 bg-white'
        }`}
      >
        <div className={`border-b px-4 py-4 ${dark ? 'border-border-dark' : 'border-slate-200'}`}>
          <Link to="/">
            <Logo light={!dark} />
          </Link>
        </div>
        <p className={`px-4 pb-1 pt-4 text-[10px] font-bold tracking-widest ${dark ? 'text-text-on-dark-muted' : 'text-slate-400'}`}>
          {spaceLabels[role]}
        </p>
        <nav className="flex-1 space-y-0.5 px-2" aria-label="Navigation de l'espace">
          {navs[role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white'
                    : dark
                      ? 'text-text-on-dark-muted hover:bg-bg-dark hover:text-white'
                      : 'text-slate-600 hover:bg-surface-light hover:text-text-on-light'
                }`
              }
            >
              <item.icon size={17} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={`border-t p-4 ${dark ? 'border-border-dark' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {role === 'admin' ? 'AP' : 'AT'}
            </span>
            <span className="flex-1">
              <span className={`block text-sm font-semibold ${dark ? 'text-white' : 'text-text-on-light'}`}>
                {role === 'admin' ? 'Admin Principal' : 'Armand T.'}
              </span>
              <span className={`block text-xs ${dark ? 'text-text-on-dark-muted' : 'text-slate-500'}`}>
                {role === 'admin' ? 'Super Administrateur' : role === 'rssi' ? 'RSSI' : 'Auditeur Senior'}
              </span>
            </span>
            <Link to="/app" aria-label="Se déconnecter" className={dark ? 'text-text-on-dark-muted hover:text-white' : 'text-slate-400 hover:text-slate-700'}>
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 md:ml-60">
        <header
          className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur sm:px-6 ${
            dark ? 'border-border-dark bg-bg-dark/90' : 'border-slate-200 bg-white/90'
          }`}
        >
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/">
              <ShieldCheck size={22} className="text-brand" />
            </Link>
            <span className="text-sm font-bold">{spaceLabels[role]}</span>
          </div>
          <div className="hidden text-sm md:block">
            <span className={dark ? 'text-text-on-dark-muted' : 'text-slate-500'}>CYBERAS Intelligence · v2.4.0</span>
          </div>
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-brand" />
            <span className={`text-xs ${dark ? 'text-text-on-dark-muted' : 'text-slate-500'}`}>21 mai 2026</span>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
