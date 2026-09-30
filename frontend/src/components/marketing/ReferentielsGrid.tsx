import { Link } from 'react-router-dom'
import { Reveal } from './SiteKit'

/**
 * Grille des référentiels.
 *
 * <p>Les cadres portés par un organisme (ISO, NIST, CIS, OWASP, MITRE, PCI SSC)
 * affichent le logo de l'organisme ; les textes réglementaires sans logo (RGPD)
 * gardent un monogramme.
 *
 * <p><strong>Trois états, pas deux.</strong> La version précédente n'avait
 * qu'un booléen « couvert », et six référentiels le portaient. En base, un seul
 * possédait réellement ses contrôles : les cinq autres n'existaient que comme
 * renvois de catalogue, sans contrôle ni rattachement, donc sans score
 * possible. Un prospect lisait « contrôles rapprochés » là où la plateforme
 * n'avait rien à rapprocher.
 *
 * <p>L'état distingue donc ce qui produit un score aujourd'hui, ce qui est
 * annoncé sans l'être encore, et ce qui n'est cité que parce qu'un secteur
 * l'exige. Il suit la base : un référentiel passe à « disponible » le jour où
 * sa migration de seed est écrite, pas le jour où on l'ajoute à cette liste.
 */
type Etat = 'DISPONIBLE' | 'PREPARATION' | 'SECTORIEL'

interface Referentiel {
  sigle: string
  logo?: string
  nom: string
  detail: string
  usage: string
  teinte: string
  etat: Etat
}

const ETIQUETTES: Record<Etat, { texte: string; ok: boolean }> = {
  DISPONIBLE: { texte: 'Contrôles rapprochés', ok: true },
  PREPARATION: { texte: 'En préparation', ok: false },
  SECTORIEL: { texte: 'Exigence sectorielle', ok: false },
}

const REFERENTIELS: Referentiel[] = [
  { sigle: 'ISO', logo: '/images/logos/iso.svg', nom: 'ISO/IEC 27001', detail: '2022', usage: 'Système de management de la sécurité de l’information', teinte: '#2563EB', etat: 'DISPONIBLE' },
  { sigle: 'NIST', logo: '/images/logos/nist.svg', nom: 'NIST CSF', detail: '2.0', usage: 'Gouverner, identifier, protéger, détecter, répondre, rétablir', teinte: '#0F766E', etat: 'DISPONIBLE' },
  { sigle: 'CIS', logo: '/images/logos/cis.svg', nom: 'CIS Controls', detail: 'v8', usage: 'Dix-huit mesures techniques priorisées', teinte: '#16A34A', etat: 'PREPARATION' },
  { sigle: 'OWASP', logo: '/images/logos/owasp.svg', nom: 'OWASP Top 10', detail: '2021', usage: 'Risques majeurs des applications web', teinte: '#0EA5E9', etat: 'PREPARATION' },
  { sigle: 'ATT&CK', logo: '/images/logos/mitre-attack.png', nom: 'MITRE ATT&CK', detail: 'v15', usage: 'Tactiques et techniques observées chez les attaquants', teinte: '#DC2626', etat: 'PREPARATION' },
  { sigle: 'ISO', logo: '/images/logos/iso.svg', nom: 'ISO/IEC 27002', detail: '2022', usage: 'Catalogue des mesures de sécurité', teinte: '#1D4ED8', etat: 'PREPARATION' },
  { sigle: 'PCI', logo: '/images/logos/pci-dss.svg', nom: 'PCI DSS', detail: 'v4.0', usage: 'Protection des données de cartes de paiement', teinte: '#7C3AED', etat: 'SECTORIEL' },
  { sigle: 'RGPD', nom: 'RGPD', detail: 'Loi 2013-450', usage: 'Protection des données à caractère personnel', teinte: '#D97706', etat: 'SECTORIEL' },
  { sigle: 'RGSSI', nom: 'RGSSI', detail: 'Référentiel national', usage: 'Règles générales de sécurité des systèmes d’information', teinte: '#0F766E', etat: 'SECTORIEL' },
]

/**
 * Les référentiels réduits à leurs marques.
 *
 * <p>Pour les pages qui citent les cadres sans en être le sujet : la page
 * Solution les nomme pour dire sur quoi le socle s'appuie, mais son propos est
 * la démarche, pas le catalogue. La grille complète, avec l'objet de chaque
 * cadre et son lien de détail, n'y était qu'une seconde page de référence
 * posée au milieu d'une page de vente.
 *
 * <p>Même source que la grille : deux listes finiraient par diverger, et l'une
 * des deux annoncerait un cadre que l'autre ignore.
 */
export function ReferentielsLogos() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {REFERENTIELS.map((r) => (
        <li
          key={r.nom}
          className="flex h-20 flex-col items-center justify-center gap-2 rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] px-3 py-2 text-center"
        >
          {r.logo ? (
            <img src={r.logo} alt="" loading="lazy" className="h-7 w-auto max-w-[72px] object-contain" />
          ) : (
            <span
              className="text-sm font-extrabold"
              style={{ color: r.teinte }}
              aria-hidden="true"
            >
              {r.sigle}
            </span>
          )}
          <span className="text-[0.6875rem] font-semibold leading-tight text-[color:var(--s-text-muted)]">
            {r.nom}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function ReferentielsGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${compact ? "lg:grid-cols-4" : "lg:grid-cols-4"}`}>
      {REFERENTIELS.map((r, i) => (
        <Reveal key={r.nom} delay={i * 0.04} className="h-full">
          <div className="s-card s-card-hover s-ref flex h-full flex-col p-5">
            <div className="s-ref-logo" aria-hidden="true">
              {r.logo ? (
                <img src={r.logo} alt="" loading="lazy" />
              ) : (
                <span className="s-ref-mono" style={{ ['--ref' as string]: r.teinte }}>
                  {r.sigle}
                </span>
              )}
            </div>
            <div className="mt-4 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-[0.9375rem] font-bold leading-tight text-[color:var(--s-text-strong)]">{r.nom}</h3>
                  <span className="text-xs text-[color:var(--s-text-muted)]">{r.detail}</span>
                </div>
                <p className="mt-1 text-sm leading-snug text-[color:var(--s-text-muted)]">{r.usage}</p>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className={`s-badge ${ETIQUETTES[r.etat].ok ? 's-badge-ok' : ''}`}>
                {ETIQUETTES[r.etat].texte}
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
