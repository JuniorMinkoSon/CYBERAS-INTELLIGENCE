import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronDown, Moon, Sun, ArrowRight, Languages } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Logo } from './Logo'
import { megaMenu } from './megaMenu'

// Mêmes entrées que la barre d'ordinateur : un menu mobile qui propose
// d'autres pages que le menu principal laisse croire qu'il en manque d'un
// côté ou de l'autre.
const links = [
  { to: '/solutions', label: 'Solutions' },
  { to: '/ressources', label: 'Services' },
  { to: '/plateforme', label: 'Plateforme' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  /** Section dont le panneau est ouvert ; null quand aucun ne l'est. */
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  /**
   * Fermeture différée du panneau déroulant.
   *
   * Le panneau est rendu en pleine largeur sous l'en-tête, donc en dehors de la
   * boîte du <nav> qui porte les boutons. Descendre du bouton vers le panneau
   * fait sortir le pointeur du <nav> : la fermeture immédiate escamotait le
   * menu avant qu'on ne l'atteigne, et le survol d'une zone sans lien à
   * l'intérieur du panneau produisait le même effet.
   *
   * Un délai court laisse le pointeur traverser ces vides. Il est annulé dès
   * qu'on entre dans le panneau ou sur un autre bouton, si bien qu'un
   * déplacement continu ne referme jamais rien.
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
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 220)
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
  const activeSection = megaMenu.find((m) => m.label === openMenu)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <header
      /* La barre reste visible en permanence. `sticky` suffisait tant que la
         page défilait ; sur la couverture verrouillée, le document ne défile
         pas et l'en-tête n'a plus de référence — `fixed` le maintient en place
         dans les deux cas. Le décalage du contenu est porté par le <main>. */
      className="fixed inset-x-0 top-0 z-50 border-b border-border-dark bg-bg-dark/90 backdrop-blur"
      /* La fermeture est portée ici, et non sur le <nav> : le panneau déroulant
         est rendu sous l'en-tête, hors de la boîte du <nav>. */
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" aria-label="Accueil CYBERAS Intelligence" className="shrink-0">
          <Logo />
        </Link>

        {/* Navigation centrée, avec panneaux déroulants au survol. */}
        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="Navigation principale"
        >
          {/* Pas d'entrée « Accueil » : le logo y mène déjà, et une entrée qui
              double le logo occupe une place sans rien ajouter. */}

          {megaMenu.map((section) => (
            <div
              key={section.label}
              className="relative"
              onMouseEnter={() => openSection(section.label)}
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

          {/* Liens simples, sans panneau. Deux menus déroulants suffisent :
              « Services » doublait « Solutions » item pour item, et
              « Entreprise » rangeait Tarifs et Contact derrière un clic de plus
              alors que ce sont les deux liens qu'un visiteur cherche. */}
          {[
            { to: '/plateforme', label: 'Plateforme' },
            { to: '/tarifs', label: 'Tarifs' },
            { to: '/contact', label: t('nav.contact') },
          ].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                  isActive ? 'text-white' : 'text-text-on-dark-muted'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {/* Panneau déroulant. Placé hors des boutons et en pleine largeur :
              un panneau ancré sur son bouton serait tronqué par les bords. */}
          {activeSection?.columns && (
            <div
              className="absolute inset-x-0 top-16 z-40 border-b border-border-dark bg-bg-dark/98 backdrop-blur-md shadow-2xl"
              onMouseEnter={() => openSection(activeSection.label)}
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
            to="/inscription"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
          >
            Créer un compte →
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
              Demander une démo →
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
