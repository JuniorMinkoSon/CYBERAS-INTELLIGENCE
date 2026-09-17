import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { Logo } from './Logo'
import { NAV_LINKS } from './siteNav'

/**
 * Barre de navigation du site.
 *
 * <p>La marque à gauche, cinq liens au centre, les actions à droite. Pas de
 * menu déroulant : cinq pages suffisent à tout dire, et une entrée qu'on voit
 * entière se comprend plus vite qu'un panneau à ouvrir.
 *
 * <p>Le menu mobile reprend exactement les mêmes entrées et les mêmes
 * boutons : un menu mobile qui propose autre chose laisse croire qu'il manque
 * quelque chose d'un côté ou de l'autre.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const close = () => setMobileOpen(false)

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
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Pas d'entrée « Accueil » en double : le logo y mène déjà, et le
            lien Accueil du menu dit la même chose en toutes lettres. */}
        <Link to="/" aria-label="Accueil CYBERAS Intelligence" className="shrink-0" onClick={close}>
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls} onClick={close}>
              {l.label}
            </NavLink>
          ))}
        </nav>

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
            className="rounded-md border border-border-dark px-3.5 py-2 text-sm font-semibold text-text-on-dark transition-colors hover:border-border-dark-hover hover:text-white"
          >
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className="rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
          >
            Créer un compte
          </Link>
        </div>

        <div className="ml-auto flex items-center lg:hidden">
          <button
            type="button"
            className="text-white"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border-dark bg-bg-dark/95 px-4 pb-6 pt-3 lg:hidden"
          aria-label="Navigation mobile"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={close}
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
              onClick={close}
              className="block rounded-md border border-border-dark px-4 py-2.5 text-center text-sm font-semibold text-text-on-dark hover:text-white"
            >
              Se connecter
            </Link>
            <Link
              to="/inscription"
              onClick={close}
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
