import { Link } from 'react-router-dom'
import { Linkedin, Mail, ExternalLink } from 'lucide-react'
import { DemoButton } from './DemoButton'
import { SiteLogo } from './SiteLogo'

/**
 * Pied de page du site vitrine.
 *
 * <p>Quatre colonnes de liens, une ligne légale, rien d'autre. L'ancienne
 * version portait deux halos flous en fond et une bande d'engagements ; la
 * charte demande peu d'effets, et un pied de page se consulte, il ne se
 * contemple pas.
 *
 * <p>L'engagement « des droits par rôle et par mission » a été retiré. L'audit
 * du produit a montré que les rôles ne sont pas appliqués côté serveur :
 * l'afficher serait promettre une garantie de sécurité qui n'existe pas. Il
 * pourra revenir le jour où le contrôle sera effectif.
 *
 * <p>Les colonnes reprennent les entrées du menu plutôt que d'inventer une
 * seconde arborescence : un pied de page qui classe autrement oblige à
 * réapprendre le site en bas de page.
 */

interface Colonne {
  titre: string
  liens: { label: string; to: string }[]
}

const COLONNES: Colonne[] = [
  {
    titre: 'Produit',
    liens: [
      { label: 'La solution', to: '/solution' },
      { label: 'Fonctionnalités', to: '/fonctionnalites' },
      { label: 'Solutions par secteur', to: '/solutions' },
      { label: 'Suivi', to: '/suivi' },
      { label: 'Offres', to: '/offres' },
    ],
  },
  {
    titre: 'Ressources',
    liens: [
      { label: 'Articles', to: '/ressources#articles' },
      { label: 'Guides & bonnes pratiques', to: '/ressources#guides' },
      { label: 'Référentiels', to: '/ressources#referentiels' },
      { label: 'Documentation', to: '/ressources#documentation' },
      { label: 'FAQ', to: '/ressources#faq' },
    ],
  },
  {
    titre: 'Commencer',
    liens: [
      { label: 'Lancer une évaluation', to: '/evaluation' },
      { label: 'Créer un compte', to: '/inscription' },
      { label: 'Se connecter', to: '/login' },
    ],
  },
  {
    titre: 'Société',
    liens: [
      { label: 'À propos', to: '/a-propos' },
      { label: 'Formation', to: '/formation' },
      { label: 'Méthodologie', to: '/methodologie' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

export function FooterPremium() {
  const annee = new Date().getFullYear()

  return (
    /* Surface la plus sombre du site. Le pied de page ferme le document : posé
       sur le gris des sections, il se lisait comme une section de plus, et la
       page semblait s'arrêter faute de contenu. La classe `s-surface-deep`
       réinverse les jetons de texte, les liens n'ont donc rien à savoir du
       fond qui les porte. */
    <footer className="s-surface-deep">
      <div className="s-wrap py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2.5fr]">
          {/* Marque et rappel de l'action principale. */}
          <div>
            <SiteLogo tone="dark" />
            <p className="s-small s-measure mt-4">
              La plateforme pour mesurer, comprendre et renforcer votre cybersécurité, éditée par
              SMARTEX Expertises, cabinet d’audit et de conseil.
            </p>

            {/* La marque de l'éditeur, et non seulement son nom. Le pied de
                page la citait en toutes lettres sans jamais y mener : qui
                voulait savoir qui édite CYBERAS devait chercher ailleurs. */}
            <a
              href="https://www.smartex-expertises.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100"
            >
              <img
                src="/images/logos/smartex.png"
                alt="SMARTEX Expertises"
                width={300}
                height={51}
                className="h-6 w-auto"
              />
              <ExternalLink size={13} className="shrink-0" aria-hidden="true" />
            </a>

            <DemoButton className="s-btn s-btn-primary mt-6" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLONNES.map((colonne) => (
              <nav key={colonne.titre} aria-label={colonne.titre}>
                <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">
                  {colonne.titre}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {colonne.liens.map((lien) => (
                    <li key={lien.to + lien.label}>
                      <Link
                        to={lien.to}
                        className="text-sm text-[color:var(--s-text-muted)] transition-colors hover:text-[color:var(--s-primary)]"
                      >
                        {lien.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-[color:var(--s-border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="s-small">
            © {annee} CYBERAS Intelligence : SMARTEX Expertises. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-[color:var(--s-text-muted)] transition-colors hover:text-[color:var(--s-primary)]"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="mailto:contact@smartex-expertises.com"
              aria-label="Nous écrire"
              className="text-[color:var(--s-text-muted)] transition-colors hover:text-[color:var(--s-primary)]"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
