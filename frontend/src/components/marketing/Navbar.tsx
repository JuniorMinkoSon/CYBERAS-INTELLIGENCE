import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { NAV_LINKS, NAV_CTA } from './siteNav'
import { SiteLogo } from './SiteLogo'
import type { NavLinkItem } from './siteNav'
import { REVEAL_EASE } from './SiteKit'

/**
 * Barre de navigation du site vitrine.
 *
 * <p>Blanche, fixe, 72 px. Quatre entrées, un bouton. Au chargement, rien ne
 * s'anime : une barre qui se met en place fait attendre l'accès au site pour
 * une raison purement décorative.
 *
 * <p>Au défilement, elle gagne une bordure et une ombre à peine perceptibles.
 * C'est le seul signal nécessaire pour dire qu'elle flotte au-dessus du
 * contenu ; la faire changer de taille ou de couleur déplacerait le regard à
 * chaque molette.
 *
 * <p>Les panneaux s'ouvrent au survol et au clic. Le survol seul exclut qui
 * navigue au clavier ou au doigt ; le clic seul impose un geste de plus à la
 * souris. Leur apparition emprunte la courbe du reste du site, en plus court :
 * un menu doit répondre, pas se déployer.
 */

/**
 * Panneau de navigation.
 *
 * <p>Une liste de liens, rien d'autre. La version précédente portait une icône
 * et une description par entrée, sur deux colonnes : cela faisait un second
 * niveau de navigation posé sur le premier, et un panneau qui occupait la
 * moitié de l'écran pour annoncer quatre sections. Un menu de logiciel
 * professionnel se parcourt en une seconde ; il ne se lit pas.
 *
 * <p>L'apparition est volontairement courte et minuscule : 4 px de
 * déplacement, 180 ms. Assez pour que l'ouverture se voie, trop peu pour
 * qu'on l'attende.
 */
function Panel({ item, onNavigate }: { item: NavLinkItem; onNavigate: () => void }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: REVEAL_EASE }}
      className="absolute left-0 top-full z-50 w-64 pt-2"
    >
      <div className="rounded-lg border border-[color:var(--s-border)] bg-white py-1.5 shadow-[0_4px_16px_rgba(15,23,42,0.08)]">
        {item.children?.map((child) => (
          <Link
            key={child.to}
            to={child.to}
            onClick={onNavigate}
            className="block px-4 py-2 text-sm text-[color:var(--s-text)] transition-colors hover:bg-[color:var(--s-bg-alt)] hover:text-[color:var(--s-primary)]"
          >
            {child.label}
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openPanel, setOpenPanel] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navRef = useRef<HTMLElement | null>(null)

  const close = () => {
    setMobileOpen(false)
    setOpenPanel(null)
  }

  useEffect(() => {
    setOpenPanel(null)
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  // Le seuil est bas : la bordure doit apparaître dès que du contenu passe
  // dessous, pas après un écran de défilement.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!openPanel) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPanel(null)
    }
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenPanel(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [openPanel])

  // Le menu mobile peut dépasser la hauteur d'écran : on empêche le corps de
  // défiler derrière lui, sans quoi l'utilisateur croit fermer le menu alors
  // qu'il fait glisser la page.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `s-nav-link whitespace-nowrap rounded-lg px-2 py-2 text-[0.8125rem] font-medium transition-colors xl:px-2.5 xl:text-[0.875rem] ${
      isActive
        ? 's-nav-link-active text-[color:var(--s-primary)]'
        : 'text-[color:var(--s-text)] hover:text-[color:var(--s-primary)]'
    }`

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-[border-color,box-shadow] ${
        scrolled
          ? 'border-b border-[color:var(--s-border)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
          : 'border-b border-transparent'
      }`}
      style={{ transitionDuration: 'var(--s-ui-ms)', transitionTimingFunction: 'var(--s-ease)' }}
    >
      <div className="s-wrap s-wrap-nav flex h-[72px] items-center gap-4">
        <Link to="/" aria-label="Accueil CYBERAS Intelligence" className="shrink-0" onClick={close}>
          <SiteLogo />
        </Link>

        <nav
          ref={navRef}
          className="hidden flex-1 items-center justify-center gap-0 lg:flex xl:gap-0.5"
          aria-label="Navigation principale"
          onMouseLeave={() => setOpenPanel(null)}
        >
          {NAV_LINKS.map((l) =>
            l.children ? (
              <div key={l.to} className="relative" onMouseEnter={() => setOpenPanel(l.label)}>
                <button
                  type="button"
                  onClick={() => setOpenPanel((cur) => (cur === l.label ? null : l.label))}
                  aria-expanded={openPanel === l.label}
                  aria-haspopup="true"
                  className={`s-nav-link flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-[0.8125rem] font-medium transition-colors xl:px-2.5 xl:text-[0.875rem] ${
                    location.pathname === l.to
                      ? 's-nav-link-active text-[color:var(--s-primary)]'
                      : 'text-[color:var(--s-text)] hover:text-[color:var(--s-primary)]'
                  }`}
                >
                  {l.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openPanel === l.label ? 'rotate-180' : ''}`}
                  />
                </button>

                {openPanel === l.label && <Panel item={l} onNavigate={close} />}
              </div>
            ) : (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkCls} onClick={close}>
                {l.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-2.5 lg:flex">
          <Link to="/login" className="s-btn s-btn-secondary s-btn-nav">
            Se connecter
          </Link>
          <Link to={NAV_CTA.to} className="s-btn s-btn-primary s-btn-nav">
            {NAV_CTA.label}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <Link
            to="/inscription"
            onClick={close}
            className="s-btn s-btn-primary s-btn-nav !min-h-[38px] !px-4 text-sm"
          >
            S'inscrire
          </Link>
          <button
            type="button"
            className="p-2 text-[color:var(--s-text-strong)]"
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
          className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-[color:var(--s-border)] bg-white px-4 pb-8 pt-4 lg:hidden"
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
                    `block rounded-lg px-3 py-3 text-base font-semibold transition-colors ${
                      isActive
                        ? 'bg-[color:var(--s-primary-soft)] text-[color:var(--s-primary)]'
                        : 'text-[color:var(--s-text-strong)]'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
                {l.children && (
                  <ul className="mb-2 ml-3 border-l border-[color:var(--s-border)] pl-3">
                    {l.children.map((c) => (
                      <li key={c.to}>
                        <Link
                          to={c.to}
                          onClick={close}
                          className="block rounded-lg px-3 py-2.5 text-[0.9375rem] text-[color:var(--s-text-muted)] transition-colors hover:text-[color:var(--s-primary)]"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 border-t border-[color:var(--s-border)] pt-6">
            <Link to={NAV_CTA.to} onClick={close} className="s-btn s-btn-primary w-full">
              {NAV_CTA.label}
            </Link>
            <Link to="/login" onClick={close} className="s-btn s-btn-secondary w-full">
              Se connecter
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
