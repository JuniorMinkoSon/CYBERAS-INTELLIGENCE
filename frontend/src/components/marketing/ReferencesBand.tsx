import { Link } from 'react-router-dom'

/**
 * Bandeaux défilants du site vitrine.
 *
 * <p>Deux usages, une seule mécanique. La piste est doublée puis translatée de
 * la moitié de sa largeur, ce qui referme la boucle sans saut visible ; voir
 * `.s-marquee` dans styles/site.css. Le défilement s'interrompt au survol —
 * ce qu'on veut lire ne doit pas fuir sous le curseur. Sous préférence de
 * mouvement réduit, l'animation est coupée et le contenu reste lisible, fixe.
 *
 * <p>Les deux bandeaux ne posent pas du tout le même problème. Les
 * référentiels sont des normes publiques que la plateforme couvre réellement :
 * les afficher n'engage personne, et le catalogue en fait foi. Les clients,
 * eux, ne peuvent figurer qu'avec leur accord écrit. D'où une liste remplie
 * d'un côté, vide de l'autre.
 */

/* =============================================================================
   Bandeau générique
   ============================================================================= */

interface Entree {
  /** Ce qui s'affiche. */
  nom: string
  /** Précision discrète à droite du nom : version, millésime. Facultative. */
  detail?: string
  /** Chemin d'un logo dans `public/`. Absent, le nom s'affiche en toutes lettres. */
  logo?: string
}

function Bandeau({
  titre,
  entrees,
  lien,
  /** Durée d'un tour complet. Plus la liste est longue, plus il en faut. */
  dureeMs = 46000,
  /**
   * Fond de la bande. Elle s'insère entre deux sections et doit se distinguer
   * de celle qui la précède : posée sur la même surface, elle cesse d'être une
   * bande pour devenir la fin de la section d'au-dessus.
   */
  surface = 's-surface-white',
}: {
  titre: string
  entrees: Entree[]
  lien?: { label: string; to: string }
  dureeMs?: number
  surface?: string
}) {
  if (entrees.length === 0) {
    return null
  }

  /* La piste est rendue deux fois. La seconde copie est masquée aux lecteurs
     d'écran : elle n'existe que pour que la translation ait de quoi défiler. */
  const piste = [...entrees, ...entrees]

  return (
    <section className={`${surface} border-y border-[color:var(--s-border)] py-10`}>
      <div className="s-wrap">
        {/* Surtitre bleu, comme partout ailleurs : `.s-eyebrow` porte déjà sa
            couleur, inutile d'en superposer une qui ne prendrait pas. */}
        <p className="s-eyebrow text-center">{titre}</p>
      </div>

      <div className="s-marquee mt-6" style={{ ['--s-marquee-ms' as string]: `${dureeMs}ms` }}>
        <ul className="s-marquee-track items-center gap-10 px-6 sm:gap-14">
          {piste.map((e, i) => (
            <li
              key={`${e.nom}-${i}`}
              className="shrink-0"
              aria-hidden={i >= entrees.length ? 'true' : undefined}
            >
              {e.logo ? (
                <img
                  src={e.logo}
                  alt={i >= entrees.length ? '' : e.nom}
                  /* Désaturés et atténués : un bandeau est une preuve, pas une
                     mosaïque de couleurs qui concurrencerait la page. */
                  className="h-8 w-auto opacity-60 grayscale transition-opacity hover:opacity-100"
                  loading="lazy"
                />
              ) : (
                <span className="flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-base font-semibold text-[color:var(--s-text)]">
                    {e.nom}
                  </span>
                  {e.detail && (
                    <span className="text-xs text-[color:var(--s-text-muted)]">{e.detail}</span>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {lien && (
        <div className="s-wrap mt-6 text-center">
          <Link to={lien.to} className="s-link">
            {lien.label}
          </Link>
        </div>
      )}
    </section>
  )
}

/* =============================================================================
   Référentiels couverts
   ============================================================================= */

/**
 * Les six cadres du socle.
 *
 * Recopiés de FrameworkCatalog côté serveur, versions comprises. Ce sont ceux
 * dont les contrôles portent des correspondances croisées, pas une liste de
 * normes que l'on saurait citer : annoncer un référentiel non rapproché
 * reviendrait à promettre une couverture qui n'existe pas.
 */
const REFERENTIELS: Entree[] = [
  { nom: 'ISO/IEC 27001', detail: '2022' },
  { nom: 'ISO/IEC 27002', detail: '2022' },
  { nom: 'NIST Cybersecurity Framework', detail: '2.0' },
  { nom: 'CIS Critical Security Controls', detail: 'v8' },
  { nom: 'OWASP Top 10', detail: '2021' },
  { nom: 'MITRE ATT&CK', detail: 'v15' },
]

/**
 * Bandeau des référentiels couverts.
 *
 * Il tient la place qu'occuperait ailleurs une galerie de logos clients, et
 * répond à la même question : « sur quoi vous appuyez-vous ? », avec la seule
 * preuve que nous puissions produire aujourd'hui sans demander l'accord de
 * quiconque.
 */
export function ReferentielsBand() {
  return (
    <Bandeau
      titre="Référentiels couverts"
      entrees={REFERENTIELS}
      lien={{ label: 'Le détail de chaque référentiel', to: '/ressources#referentiels' }}
      /* Grise : sur l'accueil, elle suit la bande blanche de la chaîne de
         valeur et précède le socle, revenu au blanc. */
      surface="s-surface-alt"
    />
  )
}

/* =============================================================================
   Références clients
   ============================================================================= */

/**
 * Clients autorisés à figurer.
 *
 * Vide délibérément. N'ajouter une entrée qu'avec l'accord écrit du client
 * concerné, et jamais « en attendant », même en interne : une capture prise
 * pendant une démonstration circule ensuite sans son contexte. Tant que la
 * liste est vide, le bandeau ne rend rien : pas un cadre vide, pas un libellé
 * orphelin.
 */
export const REFERENCES: Entree[] = []

export function ReferencesBand({ titre = 'Ils nous font confiance' }: { titre?: string }) {
  return <Bandeau titre={titre} entrees={REFERENCES} />
}
