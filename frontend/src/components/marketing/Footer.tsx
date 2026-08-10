import { Link } from 'react-router-dom'
import { Globe, MessageCircle, PlayCircle, Code } from 'lucide-react'
import { Logo } from './Logo'

const columns = [
  {
    title: 'Plateforme',
    links: [
      { label: 'Fonctionnalités', to: '/plateforme' },
      { label: 'Agents IA', to: '/agents-ia' },
      { label: 'Architecture', to: '/plateforme' },
      { label: 'Tarifs', to: '/tarifs' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Audit & Conformité', to: '/solutions' },
      { label: 'Pentest', to: '/solutions' },
      { label: 'Gestion des risques', to: '/solutions' },
      { label: 'SOC & Threat Intel', to: '/solutions' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', to: '/ressources' },
      { label: 'Blog', to: '/ressources' },
      { label: 'Guides', to: '/ressources' },
      { label: 'Démo interactive', to: '/demo' },
    ],
  },
  {
    title: 'À propos',
    links: [
      { label: 'Qui sommes-nous', to: '/a-propos' },
      { label: 'Carrières', to: '/a-propos' },
      { label: 'Partenaires', to: '/a-propos' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border-dark bg-bg-dark">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-text-on-dark-muted">
              La plateforme intelligente unifiée qui révolutionne la cybersécurité des organisations pour protéger ce qui compte vraiment.
            </p>
            <div className="mt-5 flex gap-3">
              {[Globe, MessageCircle, PlayCircle, Code].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="rounded-md border border-border-dark p-2 text-text-on-dark-muted transition-colors hover:border-border-dark-hover hover:text-white"
                  aria-label="Réseau social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-text-on-dark-muted transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border-dark pt-6 sm:flex-row">
          <p className="text-xs text-text-on-dark-muted">
            © 2026 CYBERAS Intelligence. Tous droits réservés.
          </p>
          <p className="text-xs text-text-on-dark-muted">
            Hébergé en Afrique · Conforme aux standards internationaux · Sécurisé par design
          </p>
        </div>
      </div>
    </footer>
  )
}
