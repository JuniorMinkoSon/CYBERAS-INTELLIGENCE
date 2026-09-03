import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronDown, Moon, Sun, ArrowRight, Languages } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Logo } from './Logo'
import { megaMenu } from './megaMenu'

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
  /** Section dont le panneau est ouvert ; null quand aucun ne l'est. */
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const activeSection = megaMenu.find((m) => m.label === openMenu)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-bg-dark/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" aria-label="Accueil CYBERAS Intelligence" className="shrink-0">
          <Logo />
        </Link>

        {/* Navigation centrée, avec panneaux déroulants au survol. */}
        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="Navigation principale"
          onMouseLeave={() => setOpenMenu(null)}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                isActive ? 'text-white' : 'text-text-on-dark-muted'
              }`
            }
          >
            {t('nav.accueil')}
          </NavLink>

          {megaMenu.map((section) => (
            <div
              key={section.label}
              className="relative"
              onMouseEnter={() => setOpenMenu(section.label)}
            >
              <button
                type="button"
                aria-expanded={openMenu === section.label}
                aria-haspopup="true"
                onClick={() =>
                  setOpenMenu(openMenu === section.label ? null : section.label)
                }
                className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  openMenu === section.label
                    ? 'text-white'
                    : 'text-text-on-dark-muted hover:text-white'
                }`}
              >
                {section.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openMenu === section.label ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          ))}

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                isActive ? 'text-white' : 'text-text-on-dark-muted'
              }`
            }
          >
            {t('nav.contact')}
          </NavLink>

          {/* Panneau déroulant. Placé hors des boutons et en pleine largeur :
              un panneau ancré sur son bouton serait tronqué par les bords. */}
          {activeSection?.columns && (
            <div
              className="absolute inset-x-0 top-16 z-40 border-b border-border-dark bg-bg-dark/98 backdrop-blur-md shadow-2xl"
              onMouseEnter={() => setOpenMenu(activeSection.label)}
            >
              <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_2.4fr]">
                {activeSection.feature ? (
                  <div className="rounded-xl border border-border-dark bg-surface-dark p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                      {activeSection.feature.eyebrow}
                    </p>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-white">
                      {activeSection.feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-on-dark-muted">
                      {activeSection.feature.description}
                    </p>
                    <Link
                      to={activeSection.feature.to}
                      onClick={() => setOpenMenu(null)}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-brand"
                    >
                      {activeSection.feature.ctaLabel}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <div />
                )}

                <div
                  className="grid gap-x-8 gap-y-6"
                  style={{
                    gridTemplateColumns: `repeat(${activeSection.columns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {activeSection.columns.map((column) => (
                    <div key={column.heading}>
                      <p
                        className="border-b pb-2 text-xs font-bold uppercase tracking-wider"
                        style={{ color: column.accent, borderColor: `${column.accent}44` }}
                      >
                        {column.heading}
                      </p>
                      <ul className="mt-3 space-y-1">
                        {column.entries.map((entry) => (
                          <li key={entry.label}>
                            <Link
                              to={entry.to}
                              onClick={() => setOpenMenu(null)}
                              className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-surface-dark"
                            >
                              <span
                                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                                style={{
                                  backgroundColor: `${entry.accent}1A`,
                                  color: entry.accent,
                                }}
                              >
                                <entry.icon size={16} />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-white">
                                  {entry.label}
                                </span>
                                <span className="mt-0.5 block text-xs leading-snug text-text-on-dark-muted">
                                  {entry.description}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
          {/* Bascule directe entre les deux langues : avec seulement deux choix,
              un menu déroulant demanderait deux gestes là où un seul suffit. */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            aria-label={
              language === 'fr' ? 'Switch to English' : 'Passer en français'
            }
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-text-on-dark-muted transition-colors hover:bg-surface-dark hover:text-white"
          >
            <Languages size={16} />
            {language === 'fr' ? 'FR' : 'EN'}
          </button>
          <Link
            to="/app"
            className="rounded-md border border-border-dark px-4 py-2 text-sm font-semibold text-text-on-dark transition-colors hover:border-border-dark-hover hover:text-white"
          >
            {t('nav.connexion')}
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
