import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
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
  const [langOpen, setLangOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-bg-dark/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" aria-label="Accueil CYBERAS Intelligence" className="shrink-0">
          <Logo />
        </Link>

        {/* Navigation Centree */}
        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex" aria-label="Navigation principale">
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

        {/* Actions Droite */}
        <div className="hidden items-center gap-3 lg:flex ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-dark text-text-on-dark-muted hover:text-white transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-sm font-medium text-text-on-dark-muted hover:text-white px-2 py-1.5 rounded-lg hover:bg-surface-dark transition"
            >
              {language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'} <ChevronDown size={14} />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 rounded-lg border border-border-dark bg-surface-dark shadow-lg z-50">
                <button
                  onClick={() => {
                    setLanguage('fr')
                    setLangOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    language === 'fr'
                      ? 'text-white bg-brand/20'
                      : 'text-text-on-dark-muted hover:text-white hover:bg-bg-dark'
                  } rounded-t-lg`}
                >
                  🇫🇷 Français
                </button>
                <button
                  onClick={() => {
                    setLanguage('en')
                    setLangOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'text-white bg-brand/20'
                      : 'text-text-on-dark-muted hover:text-white hover:bg-bg-dark'
                  } rounded-b-lg`}
                >
                  🇬🇧 English
                </button>
              </div>
            )}
          </div>
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
            Démo →
          </Link>
        </div>

        {/* Menu Mobile */}
        <button
          type="button"
          className="ml-auto lg:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {open && (
        <nav className="border-t border-border-dark bg-bg-dark/95 px-4 pb-6 pt-3 lg:hidden space-y-1" aria-label="Navigation mobile">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block py-2.5 px-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand/10 text-white'
                    : 'text-text-on-dark-muted hover:text-white hover:bg-bg-dark'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="border-t border-border-dark my-3 pt-3 space-y-2">
            <Link
              to="/app"
              onClick={() => setOpen(false)}
              className="block py-2.5 px-2 rounded-md text-sm font-medium text-text-on-dark-muted hover:text-white"
            >
              Se connecter
            </Link>
            <Link
              to="/demo"
              onClick={() => setOpen(false)}
              className="block rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark transition"
            >
              Demander démo →
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
