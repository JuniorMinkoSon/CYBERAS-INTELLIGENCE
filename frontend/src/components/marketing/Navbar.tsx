import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Logo } from './Logo'

const links = [
  { to: '/plateforme', label: 'Plateforme' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/agents-ia', label: 'Agents IA' },
  { to: '/ressources', label: 'Ressources' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/tarifs', label: 'Tarifs' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-bg-dark/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="Accueil CYBERAS Intelligence">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-white ${
                  isActive ? 'text-white' : 'text-text-on-dark-muted'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-text-on-dark-muted hover:text-white"
          >
            🇫🇷 FR <ChevronDown size={14} />
          </button>
          <Link
            to="/app"
            className="rounded-md border border-border-dark px-4 py-2 text-sm font-semibold text-text-on-dark transition-colors hover:border-border-dark-hover hover:text-white"
          >
            Se connecter
          </Link>
          <Link
            to="/demo"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
          >
            Demander une démo →
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border-dark bg-bg-dark px-4 pb-6 pt-2 lg:hidden" aria-label="Navigation mobile">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-text-on-dark-muted hover:text-white"
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/demo"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Demander une démo →
          </Link>
        </nav>
      )}
    </header>
  )
}
