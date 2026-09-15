import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronDown, Moon, Sun, ArrowRight } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { Logo } from './Logo'
import { NAV_SECTIONS, NAV_LINKS } from './siteNav'

/**
 * Barre de navigation du site.
 *
 * <p>Trois menus déroulants simples — une liste verticale sous son bouton —
 * et deux liens. Les grands panneaux à colonnes demandaient de lire trois
 * rubriques et un encart avant de trouver un lien ; une liste courte se
 * parcourt d'un coup d'œil et tient sur un écran étroit.
 *
 * <p>Le menu mobile reprend exactement les mêmes entrées, en accordéon : un
 * menu mobile qui propose d'autres pages que la barre laisse croire qu'il en
 * manque d'un côté ou de l'autre.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  /** Section dont la liste est ouverte ; null quand aucune ne l'est. */
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  /** Section dépliée dans le menu mobile. */
  const [mobileSection, setMobileSection] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  /**
   * Fermeture différée au survol.
   *
   * Quitter le bouton pour descendre dans la liste fait sortir le pointeur
   * un instant ; une fermeture immédiate escamotait la liste avant qu'on
   * l'atteigne. Le délai est annulé dès qu'on entre dans la liste ou sur un
   * autre bouton : un déplacement continu ne referme jamais rien.
   */
  const closeTimer = useRef<number | null>(null)

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 180)
  }

  const openSection = (label: string) => {
    cancelClose()
    setOpenMenu(label)
  }

  // Une minuterie qui survivrait au démontage refermerait un menu disparu.
  useEffect(() => cancelClose, [])

  // Le clavier doit pouvoir refermer ce que la souris a ouvert.
  useEffect(() => {
    if (!openMenu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openMenu])

  const closeAll = () => {
    setOpenMenu(null)
    setMobileOpen(false)
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
      isActive ? 'text-white' : 'text-text-on-dark-muted'
    }`

  return (
    <header
      /* La barre reste visible en permanence. `sticky` suffisait tant que la
         page défilait ; sur la couverture verrouillée, le document ne défile
         pas et l'en-tête n'a plus de référence — `fixed` le maintient en place
         dans les deux cas. Le décalage du contenu est porté par le <main>. */
      className="fixed inset-x-0 top-0 z-50 border-b border-border-dark bg-bg-dark/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
        {/* Pas d'entrée « Accueil » : le logo y mène déjà. */}
        <Link to="/" aria-label="Accueil CYBERAS Intelligence" className="shrink-0" onClick={closeAll}>
          <Logo />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="Navigation principale"
          onMouseLeave={scheduleClose}
        >
          {NAV_SECTIONS.map((section) => {
            const isOpen = openMenu === section.label
            return (
              <div
                key={section.label}
                className="relative"
                onMouseEnter={() => openSection(section.label)}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  onClick={() => setOpenMenu(isOpen ? null : section.label)}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isOpen ? 'text-white' : 'text-text-on-dark-muted hover:text-white'
                  }`}
                >
                  {section.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Liste ancrée sous son bouton. Une largeur fixe suffit : les
                    libellés sont courts, et une liste qui s'étale sur toute la
                    page n'est plus un menu, c'est une deuxième page. */}
                {isOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-40 mt-1 w-80 overflow-hidden rounded-xl border border-border-dark bg-bg-dark/98 p-2 shadow-2xl backdrop-blur-md"
                    onMouseEnter={cancelClose}
                  >
                    <ul className="space-y-0.5">
                      {section.entries.map((entry) => (
                        <li key={entry.to}>
                          <Link
                            to={entry.to}
                            role="menuitem"
                            onClick={closeAll}
                            className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-dark"
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                              <entry.icon size={15} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-white">{entry.label}</span>
                              {entry.description && (
                                <span className="mt-0.5 block text-xs leading-snug text-text-on-dark-muted">
                                  {entry.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={section.to}
                      role="menuitem"
                      onClick={closeAll}
                      className="mt-1 flex items-center justify-between rounded-lg border-t border-border-dark px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted transition-colors hover:text-brand"
                    >
                      Tout voir : {section.label}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}

          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkCls} onClick={closeAll}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions. Les deux mêmes qu'en mobile : « Se connecter » et « Créer
            un compte ». La demande de démo vit sur la page Contact. */}
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-text-on-dark-muted transition hover:bg-surface-dark hover:text-white"
            aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/login"
            className="rounded-md border border-border-dark px-4 py-2 text-sm font-semibold text-text-on-dark transition-colors hover:border-border-dark-hover hover:text-white"
          >
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
          >
            Créer un compte
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border-dark bg-bg-dark/95 px-4 pb-6 pt-3 lg:hidden"
          aria-label="Navigation mobile"
        >
          <ul className="space-y-1">
            {NAV_SECTIONS.map((section) => {
              const expanded = mobileSection === section.label
              return (
                <li key={section.label}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setMobileSection(expanded ? null : section.label)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2.5 text-sm font-medium text-text-on-dark-muted hover:text-white"
                  >
                    {section.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expanded && (
                    <ul className="mb-2 ml-2 space-y-0.5 border-l border-border-dark pl-2">
                      {section.entries.map((entry) => (
                        <li key={entry.to}>
                          <Link
                            to={entry.to}
                            onClick={closeAll}
                            className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-text-on-dark-muted hover:bg-surface-dark hover:text-white"
                          >
                            <entry.icon size={15} className="shrink-0 text-brand" />
                            {entry.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          to={section.to}
                          onClick={closeAll}
                          className="flex items-center gap-1.5 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-text-on-dark-muted hover:text-brand"
                        >
                          Tout voir : {section.label} <ArrowRight size={13} />
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )
            })}
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `block rounded-md px-2 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand/10 text-white' : 'text-text-on-dark-muted hover:text-white'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="my-3 space-y-2 border-t border-border-dark pt-3">
            <Link
              to="/login"
              onClick={closeAll}
              className="block rounded-md border border-border-dark px-4 py-2.5 text-center text-sm font-semibold text-text-on-dark hover:text-white"
            >
              Se connecter
            </Link>
            <Link
              to="/inscription"
              onClick={closeAll}
              className="block rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Créer un compte
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm text-text-on-dark-muted hover:text-white"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
