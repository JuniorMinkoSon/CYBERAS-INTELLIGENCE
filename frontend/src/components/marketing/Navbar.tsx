import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Menu, X, ChevronDown, ChevronRight, UserPlus, PlayCircle, LogIn } from 'lucide-react'
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
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navRef = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()

  const close = () => {
    setMobileOpen(false)
    setOpenPanel(null)
  }

  useEffect(() => {
    setOpenPanel(null)
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  // La rubrique de la page courante s'ouvre d'elle-même dans le tiroir. Tout
  // replié, il ne dit pas où l'on se trouve, et il faut déplier pour le
  // retrouver alors que l'information est déjà connue.
  useEffect(() => {
    if (!mobileOpen) return
    const courante = NAV_LINKS.find((l) => l.children && location.pathname.startsWith(l.to))
    setOpenSection(courante?.label ?? null)
  }, [mobileOpen, location.pathname])

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

  // Échap ferme aussi le tiroir mobile : il occupe tout l'écran, et sans cela
  // le seul moyen d'en sortir au clavier est de le parcourir jusqu'au bout.
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

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
            S&rsquo;inscrire
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

      {/* Tiroir mobile.

          Panneau posé par-dessus la page plutôt que déroulant sous la barre :
          sept rubriques et leurs sous-entrées dépassent la hauteur d'un
          téléphone, et un déroulant qui pousse le contenu fait perdre le fil de
          ce qu'on lisait. Le voile derrière ferme au toucher, comme on attend
          d'un panneau posé par-dessus.

          Chaque rubrique porte son icône et se déplie sur place. Sept libellés
          empilés nus se lisaient comme un paragraphe ; l'icône donne le point
          d'entrée, et le dépliage évite d'ouvrir une page pour découvrir
          qu'elle ne contenait pas ce qu'on cherchait. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[color:var(--s-navy)]/50"
            onClick={close}
            aria-hidden="true"
          />
          <motion.nav
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: REVEAL_EASE }}
            className="absolute inset-x-3 bottom-3 top-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.35)]"
            aria-label="Navigation mobile"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--s-border)] px-5 py-4">
              <Link to="/" aria-label="Accueil CYBERAS Intelligence" onClick={close}>
                <SiteLogo />
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer le menu"
                className="p-1 text-[color:var(--s-text-strong)]"
              >
                <X size={24} />
              </button>
            </div>

            <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
              {NAV_LINKS.map((l) => {
                const actif = l.end
                  ? location.pathname === l.to
                  : location.pathname.startsWith(l.to)
                const deplie = openSection === l.label
                const rangee = `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                  actif
                    ? 'bg-[color:var(--s-primary-soft)] text-[color:var(--s-primary)]'
                    : 'text-[color:var(--s-text-strong)]'
                }`

                return (
                  <li key={l.to}>
                    {l.children ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSection((cur) => (cur === l.label ? null : l.label))
                          }
                          aria-expanded={deplie}
                          className={rangee}
                        >
                          <l.icon size={22} className="shrink-0" aria-hidden="true" />
                          <span className="flex-1 text-left">{l.label}</span>
                          <ChevronDown
                            size={20}
                            className={`shrink-0 transition-transform ${
                              deplie ? 'rotate-180' : '-rotate-90'
                            }`}
                            aria-hidden="true"
                          />
                        </button>

                        {deplie && (
                          /* Le filet pointillé relie les sous-entrées à leur
                             rubrique. Sans lui, un décalage de marge suffit à
                             les faire passer pour des rubriques de même rang
                             dès que la liste dépasse quatre lignes. */
                          <ul className="mt-1 rounded-xl bg-[color:var(--s-bg-alt)] py-2 pr-2">
                            {l.children.map((c) => (
                              <li key={c.to} className="flex">
                                <span
                                  className="relative flex w-8 shrink-0 justify-center"
                                  aria-hidden="true"
                                >
                                  <span className="absolute inset-y-0 border-l border-dashed border-[color:var(--s-border-strong)]" />
                                  <span className="relative mt-[1.125rem] size-1.5 rounded-full bg-[color:var(--s-border-strong)]" />
                                </span>
                                <Link
                                  to={c.to}
                                  onClick={close}
                                  className="flex flex-1 items-center gap-3 rounded-lg px-2 py-2.5 text-[0.9375rem] text-[color:var(--s-text)] transition-colors hover:text-[color:var(--s-primary)]"
                                >
                                  <c.icon
                                    size={17}
                                    className="shrink-0 text-[color:var(--s-text-muted)]"
                                    aria-hidden="true"
                                  />
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <NavLink to={l.to} end={l.end} onClick={close} className={rangee}>
                        <l.icon size={22} className="shrink-0" aria-hidden="true" />
                        <span className="flex-1 text-left">{l.label}</span>
                        <ChevronRight size={20} className="shrink-0" aria-hidden="true" />
                      </NavLink>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className="shrink-0 space-y-3 border-t border-[color:var(--s-border)] px-4 py-4">
              <Link to="/inscription" onClick={close} className="s-btn s-btn-primary w-full">
                <UserPlus size={18} /> S&rsquo;inscrire
              </Link>
              <Link to="/demo" onClick={close} className="s-btn s-btn-secondary w-full">
                <PlayCircle size={18} /> Démo
              </Link>
              <Link to="/login" onClick={close} className="s-btn s-btn-secondary w-full">
                <LogIn size={18} /> Se connecter
              </Link>
            </div>
          </motion.nav>
        </div>
      )}
    </header>
  )
}
