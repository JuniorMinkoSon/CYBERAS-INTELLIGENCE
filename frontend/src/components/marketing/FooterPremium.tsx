import { Link } from 'react-router-dom'
import { Shield, Linkedin, Github, Mail, ArrowRight } from 'lucide-react'

export function FooterPremium() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-bg-dark border-t border-border-dark overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Top section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border-dark">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Brand & CTA */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
                  <Shield size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">CYBERAS INTELLIGENCE</span>
              </div>

              <p className="text-sm text-text-on-dark leading-relaxed">
                La plateforme intelligente pour piloter, évaluer et renforcer votre cybersécurité de bout en bout.
              </p>

              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg transition group"
              >
                Demander une démonstration
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Security operations */}
            <div className="rounded-lg border border-brand/30 bg-brand/5 p-6">
              <div className="space-y-3">
                <p className="text-sm font-bold uppercase tracking-widest text-brand">Cyber Security Operations</p>
                <div className="space-y-2 text-sm text-text-on-dark-muted">
                  <p>✓ Données isolées par organisation</p>
                  <p>✓ Traçabilité complète des actions</p>
                  <p>✓ Contrôle d'accès basé sur les rôles (RBAC)</p>
                  <p>✓ Conformité et audit trail intégrés</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border-dark">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Platform */}
            <div>
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Plateforme</h3>
              <nav className="space-y-3">
                <Link to="/plateforme" className="text-sm text-text-on-dark-muted hover:text-brand transition">
                  Fonctionnalités
                </Link>
                <Link to="/plateforme" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Audits de sécurité
                </Link>
                <Link to="/plateforme" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Scans & Findings
                </Link>
                <Link to="/plateforme" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Risk Engine
                </Link>
                <Link to="/plateforme" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Rapports
                </Link>
              </nav>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Solutions</h3>
              <nav className="space-y-3">
                <Link to="/solutions" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Audit cybersécurité
                </Link>
                <Link to="/solutions" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Tests d'intrusion
                </Link>
                <Link to="/solutions" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Gestion des risques
                </Link>
                <Link to="/solutions" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Conformité & governance
                </Link>
                <Link to="/solutions" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Protection des données
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Ressources</h3>
              <nav className="space-y-3">
                <Link to="/ressources" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Documentation
                </Link>
                <Link to="/ressources" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Référentiels
                </Link>
                <Link to="/ressources" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Blog
                </Link>
                <Link to="/ressources" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  FAQ
                </Link>
                <Link to="/ressources" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Guides
                </Link>
              </nav>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Entreprise</h3>
              <nav className="space-y-3">
                <Link to="/a-propos" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  À propos
                </Link>
                <Link to="/contact" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Contact
                </Link>
                <Link to="/" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Partenaires
                </Link>
                <Link to="/" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Carrières
                </Link>
                <Link to="/tarifs" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Tarifs
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: Copyright */}
            <div className="text-sm text-text-on-dark-muted">
              © {currentYear} Cyberas Intelligence. Tous droits réservés.
            </div>

            {/* Center: Legal */}
            <div className="flex flex-wrap gap-6 text-sm">
              <Link to="/" className="text-text-on-dark-muted hover:text-brand transition">
                Mentions légales
              </Link>
              <Link to="/" className="text-text-on-dark-muted hover:text-brand transition">
                Politique de confidentialité
              </Link>
              <Link to="/" className="text-text-on-dark-muted hover:text-brand transition">
                Conditions d'utilisation
              </Link>
              <Link to="/" className="text-text-on-dark-muted hover:text-brand transition">
                Politique cookies
              </Link>
            </div>

            {/* Right: Social */}
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-dark hover:border-brand hover:bg-brand/10 text-text-on-dark-muted hover:text-brand transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-dark hover:border-brand hover:bg-brand/10 text-text-on-dark-muted hover:text-brand transition"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="mailto:contact@cyberas.ci"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-dark hover:border-brand hover:bg-brand/10 text-text-on-dark-muted hover:text-brand transition"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
