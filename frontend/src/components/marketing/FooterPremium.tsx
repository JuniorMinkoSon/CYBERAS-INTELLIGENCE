import { Link } from 'react-router-dom'
import { Linkedin, Github, Mail, ArrowRight } from 'lucide-react'
import { Logo } from './Logo'

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
              <Logo />

              <p className="text-sm text-text-on-dark leading-relaxed">
                La plateforme pour mesurer, comprendre et renforcer votre cybersécurité — éditée par
                SMARTEX Expertises, cabinet d’audit et de conseil.
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
                <p className="text-sm font-bold uppercase tracking-widest text-brand">Nos engagements</p>
                <div className="space-y-2 text-sm text-text-on-dark-muted">
                  <p>✓ Vos données cloisonnées par organisation</p>
                  <p>✓ Chaque action journalisée : qui, quoi, quand</p>
                  <p>✓ Des droits par rôle et par mission</p>
                  <p>✓ Des scans uniquement sur périmètre autorisé</p>
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
                <Link to="/plateforme#audits" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Missions d’audit
                </Link>
                <Link to="/plateforme#questionnaire" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Questionnaire de maturité
                </Link>
                <Link to="/plateforme#scans" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Scans techniques
                </Link>
                <Link to="/plateforme#risques" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Risques et exposition
                </Link>
                <Link to="/plateforme#rapports" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Recommandations et rapports
                </Link>
              </nav>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Solutions</h3>
              <nav className="space-y-3">
                <Link to="/solutions#audit-organisationnel" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Audit organisationnel
                </Link>
                <Link to="/solutions#intrusion-externe" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Tests d’intrusion
                </Link>
                <Link to="/solutions#risques" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Gestion des risques
                </Link>
                <Link to="/solutions#incidents" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Réponse aux incidents
                </Link>
                <Link to="/solutions#conseil" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Conseil et gouvernance
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Ressources</h3>
              <nav className="space-y-3">
                <Link to="/ressources#guides" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Guides et documentation
                </Link>
                <Link to="/ressources#articles" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Articles
                </Link>
                <Link to="/ressources#livres-blancs" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Livres blancs
                </Link>
                <Link to="/formation" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Formation
                </Link>
                <Link to="/referentiels" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Référentiels
                </Link>
              </nav>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Entreprise</h3>
              <nav className="space-y-3">
                <Link to="/a-propos" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Qui sommes-nous
                </Link>
                <Link to="/methodologie" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Méthodologie
                </Link>
                <Link to="/deploiement" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Déploiement
                </Link>
                <Link to="/contact" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Contact
                </Link>
                <Link to="/cas-clients" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Études de cas
                </Link>
                <Link to="/demo" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Demander une démonstration
                </Link>
                <Link to="/evaluation" className="block text-sm text-text-on-dark-muted hover:text-brand transition">
                  Lancer une évaluation
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
                Gestion des cookies
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
                aria-label="Courriel"
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
