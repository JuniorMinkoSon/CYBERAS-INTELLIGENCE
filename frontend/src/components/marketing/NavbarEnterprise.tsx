/**
 * NavbarEnterprise.tsx
 *
 * Navbar professionnel avec menus déroulants pour client entreprise
 *
 * Structure:
 * - Logo + Brand
 * - Menu principal avec dropdowns:
 *   • Solution (Pourquoi / Évaluation / Intelligence)
 *   • Référentiels (ISO / NIST / PCI DSS / Autres)
 *   • Méthodes (Évaluation / Tests / Analyse / Restitution)
 *   • Déploiement (Configuration / Tests / Données / Sécurité)
 *   • Formules (Essential / Professional / Enterprise)
 *   • Se former (Academy / Guides / Articles)
 * - Actions droite (Thème / Langue / Connexion / Démo)
 */

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  Zap,
  Shield,
  BookOpen,
  BarChart3,
  Cpu,
  GraduationCap,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Logo } from './Logo'

/**
 * Structure des menus déroulants
 * Chaque section principal avec sous-items
 */
const navMenu = [
  {
    label: 'Solution',
    icon: Shield,
    items: [
      { label: 'Pourquoi Cyberas', sub: 'Les avantages et unique selling points' },
      { label: 'Audit Intelligent', sub: 'Évaluation continue et assistée par IA' },
      { label: 'Analyse des Risques', sub: 'Scoring et priorisation automatique' },
      { label: 'Recommandations', sub: 'Plans d\'action générés par l\'IA' },
    ],
  },
  {
    label: 'Référentiels',
    icon: BookOpen,
    items: [
      { label: 'ISO 27001', sub: 'Gestion de la sécurité de l\'information' },
      { label: 'NIST', sub: 'Framework américain de cybersécurité' },
      { label: 'PCI DSS', sub: 'Pour données de cartes bancaires' },
      { label: 'Autres', sub: 'CIS, ISO 27005, SOC 2...' },
    ],
  },
  {
    label: 'Méthodes',
    icon: Zap,
    items: [
      { label: 'Audit Technique', sub: 'Scan réseau et vulnérabilités' },
      { label: 'Questionnaires', sub: 'Évaluation de conformité' },
      { label: 'Analyse CVE/CVSS', sub: 'Scoring des vulnérabilités' },
      { label: 'Restitution', sub: 'Rapports et recommandations' },
    ],
  },
  {
    label: 'Déploiement',
    icon: Cpu,
    items: [
      { label: 'Configuration', sub: 'Organisation, utilisateurs, rôles' },
      { label: 'Cibles Autorisées', sub: 'Gestion du périmètre de scan' },
      { label: 'Import de Données', sub: 'Preuves, documents, résultats' },
      { label: 'Sécurité', sub: 'Accès, journalisation, audit trail' },
    ],
  },
  {
    label: 'Formules',
    icon: BarChart3,
    items: [
      { label: 'Essential', sub: 'Évaluation initiale pour débuter' },
      { label: 'Professional', sub: 'Audits réguliers avec IA' },
      { label: 'Enterprise', sub: 'Déploiement complet multi-site' },
    ],
  },
  {
    label: 'Se former',
    icon: GraduationCap,
    items: [
      { label: 'Cyberas Academy', sub: 'Formations en cybersécurité' },
      { label: 'Guides', sub: 'Documentation et best practices' },
      { label: 'Articles', sub: 'Blog et resources' },
    ],
  },
]

/**
 * Dropdown Menu Component
 * Affichage des sous-items avec hover effect
 */
function DropdownMenu({
  isOpen,
  items,
  label,
}: {
  isOpen: boolean
  items: Array<{ label: string; sub: string }>
  label: string
}) {
  if (!isOpen) return null

  return (
    <div className="absolute left-0 top-full mt-0 w-64 rounded-lg border border-border-dark bg-surface-dark shadow-xl p-2 z-50">
      {items.map((item) => (
        <Link
          key={item.label}
          to={`/${label.toLowerCase().replace(' ', '-')}/${item.label.toLowerCase().replace(' ', '-')}`}
          className="block rounded-md p-3 hover:bg-bg-dark transition-colors group"
        >
          <p className="font-semibold text-white text-sm group-hover:text-brand">{item.label}</p>
          <p className="text-xs text-text-on-dark-muted mt-0.5">{item.sub}</p>
        </Link>
      ))}
    </div>
  )
}

/**
 * Main Navbar Component
 */
export function NavbarEnterprise() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()

  return (
    <header className="sticky top-0 z-40 border-b border-border-dark bg-bg-dark/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex-shrink-0">
          <Logo />
        </Link>

        {/* Navigation Bureau */}
        <nav className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:gap-1 mx-8" aria-label="Navigation principale">
          {navMenu.map((menu) => {
            const Icon = menu.icon
            return (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(menu.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {/* Menu Item Button */}
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-on-dark-muted hover:text-white hover:bg-surface-dark transition-all group">
                  <Icon size={16} />
                  {menu.label}
                  <ChevronDown
                    size={14}
                    className="transition-transform group-hover:rotate-180"
                  />
                </button>

                {/* Dropdown */}
                <DropdownMenu
                  isOpen={openDropdown === menu.label}
                  items={menu.items}
                  label={menu.label}
                />
              </div>
            )
          })}
        </nav>

        {/* Actions Droite */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-text-on-dark-muted hover:bg-surface-dark hover:text-white transition-all"
            aria-label="Changer le thème"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-text-on-dark-muted hover:bg-surface-dark hover:text-white transition-all">
              {language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
              <ChevronDown size={14} />
            </button>

            {/* Language Dropdown */}
            <div className="absolute right-0 top-full hidden mt-0 w-40 rounded-lg border border-border-dark bg-surface-dark shadow-lg group-hover:block z-50">
              <button
                onClick={() => setLanguage('fr')}
                className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
                  language === 'fr'
                    ? 'text-white bg-brand/20'
                    : 'text-text-on-dark-muted hover:text-white hover:bg-bg-dark'
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors rounded-b-lg ${
                  language === 'en'
                    ? 'text-white bg-brand/20'
                    : 'text-text-on-dark-muted hover:text-white hover:bg-bg-dark'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <Link
            to="/app"
            className="rounded-lg border border-border-dark px-4 py-2 text-sm font-semibold text-text-on-dark hover:border-border-dark-hover hover:text-white transition-all"
          >
            Se connecter
          </Link>
          <Link
            to="/audit-organiser"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-dark transition-all hover:scale-105"
          >
            Organiser un audit →
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav
          className="border-t border-border-dark bg-surface-dark/95 px-4 pb-6 pt-3 lg:hidden space-y-1"
          aria-label="Navigation mobile"
        >
          {navMenu.map((menu) => (
            <details key={menu.label} className="group">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 font-medium text-text-on-dark-muted hover:text-white hover:bg-bg-dark transition-all">
                {menu.label}
                <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
              </summary>

              {/* Mobile Dropdown */}
              <div className="space-y-1 bg-bg-dark rounded-lg mt-1 p-2">
                {menu.items.map((item) => (
                  <Link
                    key={item.label}
                    to={`/${menu.label.toLowerCase().replace(' ', '-')}/${item.label.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-text-on-dark-muted hover:text-white hover:bg-surface-dark transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          ))}

          {/* Mobile CTA */}
          <div className="border-t border-border-dark my-3 pt-3 space-y-2">
            <Link
              to="/app"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-text-on-dark-muted hover:text-white hover:bg-bg-dark transition-all"
            >
              Se connecter
            </Link>
            <Link
              to="/audit-organiser"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark transition-all"
            >
              Organiser un audit →
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
