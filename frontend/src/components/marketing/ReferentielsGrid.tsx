import { Link } from 'react-router-dom'
import { Reveal } from './SiteKit'

/**
 * Grille des référentiels.
 *
 * <p>Chaque cadre est représenté par un monogramme dessiné en CSS, pas par un
 * logo : les marques ISO, NIST ou MITRE sont déposées et leur usage est
 * encadré. Le monogramme suffit à la reconnaissance et se décline sur toutes
 * les surfaces sans fichier image.
 *
 * <p>Les six premiers sont ceux dont les contrôles portent des correspondances
 * croisées dans le socle (voir ReferencesBand). Les deux derniers sont cités
 * parce que les secteurs concernés les demandent, et signalés comme tels.
 */
interface Referentiel {
  sigle: string
  nom: string
  detail: string
  usage: string
  teinte: string
  couvert: boolean
}

const REFERENTIELS: Referentiel[] = [
  { sigle: 'ISO', nom: 'ISO/IEC 27001', detail: '2022', usage: 'Système de management de la sécurité de l’information', teinte: '#2563EB', couvert: true },
  { sigle: 'NIST', nom: 'NIST CSF', detail: '2.0', usage: 'Gouverner, identifier, protéger, détecter, répondre, rétablir', teinte: '#0F766E', couvert: true },
  { sigle: 'CIS', nom: 'CIS Controls', detail: 'v8', usage: 'Dix-huit mesures techniques priorisées', teinte: '#16A34A', couvert: true },
  { sigle: 'OWASP', nom: 'OWASP Top 10', detail: '2021', usage: 'Risques majeurs des applications web', teinte: '#0EA5E9', couvert: true },
  { sigle: 'ATT&CK', nom: 'MITRE ATT&CK', detail: 'v15', usage: 'Tactiques et techniques observées chez les attaquants', teinte: '#DC2626', couvert: true },
  { sigle: 'ISO', nom: 'ISO/IEC 27002', detail: '2022', usage: 'Catalogue des mesures de sécurité', teinte: '#1D4ED8', couvert: true },
  { sigle: 'PCI', nom: 'PCI DSS', detail: 'v4.0', usage: 'Protection des données de cartes de paiement', teinte: '#7C3AED', couvert: false },
  { sigle: 'RGPD', nom: 'RGPD', detail: 'Loi 2013-450', usage: 'Protection des données à caractère personnel', teinte: '#D97706', couvert: false },
]

export function ReferentielsGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${compact ? "lg:grid-cols-4" : "lg:grid-cols-4"}`}>
      {REFERENTIELS.map((r, i) => (
        <Reveal key={r.nom} delay={i * 0.04} className="h-full">
          <div className="s-card s-card-hover s-ref flex h-full flex-col p-5">
            <div className="flex items-start gap-4">
              <span className="s-ref-mono" style={{ ['--ref' as string]: r.teinte }} aria-hidden="true">
                {r.sigle}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-[0.9375rem] font-bold leading-tight text-[color:var(--s-text-strong)]">{r.nom}</h3>
                  <span className="text-xs text-[color:var(--s-text-muted)]">{r.detail}</span>
                </div>
                <p className="mt-1 text-sm leading-snug text-[color:var(--s-text-muted)]">{r.usage}</p>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className={`s-badge ${r.couvert ? 's-badge-ok' : ''}`}>
                {r.couvert ? 'Contrôles rapprochés' : 'Exigence sectorielle'}
              </span>
              <Link to="/ressources#referentiels" className="s-link text-sm">
                Détail
              </Link>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
