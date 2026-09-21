import { Landmark, Scale, Server, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionLabel } from './Shared'

/**
 * Ce que l'audit couvre : quatre domaines, et les contrôles derrière chacun.
 *
 * <h2>Une grille, pas un carrousel</h2>
 *
 * <p>La section défilait horizontalement : deux cartes visibles, deux cachées,
 * et un geste à faire pour les voir. À quatre domaines, cacher la moitié du
 * contenu derrière un défilement n'apporte rien : la grille les montre d'un
 * coup, et passe à deux colonnes puis une à mesure que l'écran se resserre,
 * sans que la lisibilité d'une carte n'en dépende.
 *
 * <h2>La barre de répartition</h2>
 *
 * <p>Chaque carte montre la part que ses questions représentent dans le
 * questionnaire. Ce n'est pas un ornement : elle rend visible un déséquilibre
 * réel : près de 40 % des questions portent sur l'organisationnel, que
 * quatre chiffres alignés laisseraient passer.
 *
 * <h2>Ce qui n'y est pas</h2>
 *
 * <p>La sécurité physique. Aucune question ne la couvre encore, et une carte
 * annonçant zéro sur une page d'accueil ressemble à une promesse non tenue. La
 * section décrit ce qui existe ; la famille rejoindra la liste le jour où ses
 * questions seront écrites.
 */

interface Domaine {
  nom: string
  icon: LucideIcon
  couvre: string
  questions: number
  /** Contrôles de l'Annexe A ISO/IEC 27001:2022 rattachés à ce domaine. */
  theme: string
  controles: number
  referentiels: string[]
  tint: string
}

/** Bibliothèque V18 : 118 questions actives. Les comptes sont ceux de la base. */
const TOTAL_QUESTIONS = 118

const DOMAINES: Domaine[] = [
  {
    nom: 'Organisationnel',
    icon: Landmark,
    couvre: 'Stratégie, gouvernance, pilotage, incidents, amélioration continue, actifs, fournisseurs.',
    questions: 46,
    theme: 'A.5',
    controles: 37,
    referentiels: ['ISO/IEC 27001', 'NIST CSF · GV', 'CIS 17'],
    tint: '#DC2626',
  },
  {
    nom: 'Conformité',
    icon: Scale,
    couvre: 'Politiques approuvées et appliquées, données personnelles, conformité technique.',
    questions: 17,
    theme: 'A.5.19 – 5.36',
    controles: 18,
    referentiels: ['ISO/IEC 27001', 'RGPD', 'ISO/IEC 27701'],
    tint: '#E85D2A',
  },
  {
    nom: 'Technique',
    icon: Server,
    couvre: 'Infrastructure, réseau, identités et accès, sécurité applicative, sauvegarde et continuité.',
    questions: 37,
    theme: 'A.8',
    controles: 34,
    referentiels: ['ISO/IEC 27002', 'NIST CSF · PR/DE', 'CIS Controls', 'OWASP'],
    tint: '#B91C1C',
  },
  {
    nom: 'Humain',
    icon: Users,
    couvre: 'Sensibilisation, comportements au quotidien, campagnes de test.',
    questions: 18,
    theme: 'A.6',
    controles: 8,
    referentiels: ['ISO/IEC 27002', 'NIST CSF · PR.AT', 'CIS 14'],
    tint: '#EA580C',
  },
]

export function CouvertureSection() {
  return (
    // Fond plus sombre que la section précédente, comme celui des services :
    // trois sections au même noir se liraient comme un seul bloc, et le palier
    // suffit à séparer sans introduire une bande claire qui casserait la page.
    <section className="bg-[#050505] px-4 py-20 sm:px-6" id="couverture">
      <div className="mx-auto max-w-7xl">
        <div>
          <SectionLabel>Ce que l'audit couvre</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            Quatre domaines, 118 questions, et les contrôles derrière chacune
          </h2>
          <p className="mt-4 max-w-2xl text-text-on-dark-muted">
            Chaque domaine est une session du questionnaire, rattachée aux contrôles
            du référentiel retenu. Le score se calcule par référentiel, jamais
            d'un domaine à l'autre.
          </p>
        </div>

        {/* Quatre cartes, toutes visibles. Le défilement en cachait deux et
            demandait un geste pour les voir : à quatre, une grille les montre
            d'un coup, et chaque carte garde la largeur qui la rend lisible. */}
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {DOMAINES.map((d) => {
            const part = Math.round((d.questions / TOTAL_QUESTIONS) * 100)

            return (
              <li
                key={d.nom}
                className="flex flex-col rounded-xl border p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
                style={{
                  // Même traitement que le carrousel des référentiels : la
                  // teinte du domaine irrigue la carte au lieu de se réduire à
                  // un filet de couleur.
                  background: `linear-gradient(160deg, ${d.tint}1F 0%, #0B0F14 55%)`,
                  borderColor: `${d.tint}59`,
                  boxShadow: `0 28px 66px -34px ${d.tint}99`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${d.tint}26` }}
                  >
                    <d.icon size={22} style={{ color: d.tint }} />
                  </span>

                  {/* Le thème ISO en tête : c'est l'ancrage normatif du domaine,
                      il se lit avant le détail. */}
                  <span
                    className="rounded border px-2.5 py-1 font-mono text-[11px] font-semibold"
                    style={{
                      borderColor: `${d.tint}4D`,
                      backgroundColor: `${d.tint}14`,
                      color: d.tint,
                    }}
                  >
                    {d.theme}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold leading-tight text-white">{d.nom}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text-on-dark-muted">
                  {d.couvre}
                </p>

                <div className="mt-6 flex items-end gap-6">
                  <div>
                    <span className="block text-3xl font-extrabold leading-none text-white">
                      {d.questions}
                    </span>
                    <span className="mt-1.5 block text-[11px] uppercase tracking-wider text-text-on-dark-muted">
                      questions
                    </span>
                  </div>
                  <div>
                    <span className="block text-3xl font-extrabold leading-none text-white">
                      {d.controles}
                    </span>
                    <span className="mt-1.5 block text-[11px] uppercase tracking-wider text-text-on-dark-muted">
                      contrôles ISO
                    </span>
                  </div>
                </div>

                {/* Part du questionnaire. Le déséquilibre entre domaines est une
                    information, pas un défaut à masquer. */}
                <div className="mt-5">
                  <div className="h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${part}%`, backgroundColor: d.tint }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-text-on-dark-muted">
                    {part} % du questionnaire
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-5">
                  {d.referentiels.map((r) => (
                    <span
                      key={r}
                      className="rounded border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-text-on-dark-muted"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
