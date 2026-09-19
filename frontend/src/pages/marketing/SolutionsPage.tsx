import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CheckCircle, AlertTriangle,
  Landmark, HeartPulse, Building2, Rocket,
} from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'
import { PrestationsSections } from '../../components/marketing/PrestationsSections'

/**
 * Secteurs couverts.
 *
 * <p>Deux jeux de données décrivaient les mêmes quatre secteurs : une grille de
 * cartes d'un côté, des blocs détaillés de l'autre. Le visiteur lisait donc
 * deux fois la même liste, et toute correction devait être faite deux fois.
 * Ils sont réunis ici.
 *
 * <p>Chaque défi est apparié à la réponse qui lui correspond. Deux listes
 * séparées — les problèmes d'un côté, les fonctionnalités de l'autre —
 * laissaient au lecteur le soin de deviner ce qui répondait à quoi, ce qui est
 * précisément le travail que la page devrait faire pour lui.
 */
const SECTEURS = [
  {
    nom: 'Finance',
    icon: Landmark,
    tint: '#DC2626',
    contexte: "Contraintes réglementaires denses et données dont la valeur est immédiate pour un attaquant.",
    paires: [
      { defi: 'Conformité PCI DSS à démontrer', reponse: 'Contrôles PCI DSS rattachés au questionnaire' },
      { defi: 'Données sensibles très exposées', reponse: 'Classification et chiffrement vérifiés par les preuves' },
      { defi: 'Traçabilité exigée par le régulateur', reponse: 'Journal d’audit horodaté et exportable' },
    ],
  },
  {
    nom: 'Santé',
    icon: HeartPulse,
    tint: '#E85D2A',
    contexte: "Données personnelles de santé et systèmes dont l'indisponibilité a des conséquences directes.",
    paires: [
      { defi: 'Protection des données de patients', reponse: 'Domaine Conformité aligné RGPD et ISO 27701' },
      { defi: 'Disponibilité critique des systèmes', reponse: 'Sauvegardes et continuité évaluées et étayées' },
      { defi: 'Accès partagés entre services', reponse: 'Revue des habilitations et authentification renforcée' },
    ],
  },
  {
    nom: 'Secteur public',
    icon: Building2,
    tint: '#B91C1C',
    contexte: "Exigences de souveraineté et redevabilité devant des autorités de contrôle.",
    paires: [
      { defi: 'Conformité réglementaire à prouver', reponse: 'Score par référentiel, avec sa couverture affichée' },
      { defi: 'Contrôles externes réguliers', reponse: 'Rapport reproductible, calcul explicable' },
      { defi: 'Hébergement et périmètre maîtrisés', reponse: 'Périmètre de scan déclaré et vérifié avant exécution' },
    ],
  },
  {
    nom: 'Tech',
    icon: Rocket,
    tint: '#EA580C',
    contexte: "Rythme de livraison élevé, équipes réduites, périmètre technique mouvant.",
    paires: [
      { defi: 'Peu de temps pour un audit long', reponse: 'Cinq sessions courtes, reprises quand vous voulez' },
      { defi: 'Surface technique qui bouge vite', reponse: 'Scans du périmètre déclaré, rejouables' },
      { defi: 'Pas de RSSI à temps plein', reponse: 'Recommandations priorisées, sans jargon d’auditeur' },
    ],
  },
]

/**
 * Sélecteur de secteur et panneau de détail.
 *
 * <p>Un seul secteur affiché à la fois, choisi par le lecteur. Empiler quatre
 * pavés obligeait à parcourir les trois qui ne le concernent pas pour trouver
 * le sien — et rallongeait la page d'autant.
 */
function SecteursSection() {
  const [actif, setActif] = useState(0)
  const secteur = SECTEURS[actif]

  return (
    <section className="s-surface-alt px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <SectionLabel>Par secteur</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-[color:var(--s-text-strong)] sm:text-4xl">
            Le référentiel ne change pas. Les priorités, si.
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--s-text-muted)]">
            Choisissez votre secteur : à chaque contrainte, ce que Cyberas vérifie
            et ce qu'il produit pour la démontrer.
          </p>
        </FadeIn>

        {/* Onglets. Le secteur choisi porte sa teinte, les autres restent
            neutres pour que le choix courant se lise d'un coup d'œil. */}
        <div role="tablist" aria-label="Secteurs" className="mt-10 flex flex-wrap gap-2">
          {SECTEURS.map((s, i) => {
            const courant = i === actif
            return (
              <button
                key={s.nom}
                role="tab"
                type="button"
                aria-selected={courant}
                onClick={() => setActif(i)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  courant
                    ? 'text-[color:var(--s-text-strong)]'
                    : 'border-[color:var(--s-border)] bg-[color:var(--s-raised)] text-[color:var(--s-text-strong)] hover:border-[color:var(--s-border-strong)]'
                }`}
                style={courant ? { backgroundColor: s.tint, borderColor: s.tint } : undefined}
              >
                <s.icon size={17} />
                {s.nom}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          className="mt-6 overflow-hidden rounded-xl border bg-[color:var(--s-raised)]"
          style={{ borderColor: `${secteur.tint}40` }}
        >
          <div
            className="flex flex-wrap items-center gap-4 px-6 py-5 sm:px-8"
            style={{ background: `linear-gradient(120deg, ${secteur.tint}14 0%, transparent 70%)` }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${secteur.tint}1F` }}
            >
              <secteur.icon size={22} style={{ color: secteur.tint }} />
            </span>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[color:var(--s-text-strong)]">{secteur.nom}</h3>
              <p className="mt-1 text-sm text-[color:var(--s-text-muted)]">{secteur.contexte}</p>
            </div>
          </div>

          {/* Chaque défi face à sa réponse, sur la même ligne : deux colonnes
              indépendantes obligeaient le lecteur à apparier lui-même. */}
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {secteur.paires.map((p) => (
              <li key={p.defi} className="grid gap-3 px-6 py-5 sm:grid-cols-2 sm:gap-8 sm:px-8">
                <div className="flex gap-3">
                  <AlertTriangle size={17} className="mt-0.5 shrink-0 text-status-high" />
                  <span className="text-sm font-medium text-[color:var(--s-text-strong)]">{p.defi}</span>
                </div>
                <div className="flex gap-3 sm:border-l sm:border-slate-100 sm:pl-8">
                  <CheckCircle size={17} className="mt-0.5 shrink-0" style={{ color: secteur.tint }} />
                  <span className="text-sm text-[color:var(--s-text-muted)]">{p.reponse}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5 sm:px-8">
            {/* Le message « votre secteur n'est pas listé » occupait une section
                entière juste avant la bannière finale, qui disait déjà la même
                chose. Il tient en une ligne, et il est mieux placé ici — au
                moment où l'on cherche son secteur sans le trouver. */}
            <p className="text-sm text-[color:var(--s-text-muted)]">
              Un premier audit se mène en une demi-journée, sans installation.
              {' '}Votre secteur n'est pas là ?{' '}
              <Link to="/contact" className="font-semibold text-[color:var(--s-primary)] hover:underline">
                Parlons-en
              </Link>
              .
            </p>
            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-[color:var(--s-text-strong)] transition-opacity hover:opacity-90"
              style={{ backgroundColor: secteur.tint }}
            >
              Commencer <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function SolutionsPage() {
  return (
    <>
      <PageHero
        label="Solutions par secteur"
        title={
          <>
            Une solution adaptée à <span className="text-[color:var(--s-primary)]">votre métier</span>
          </>
        }
        subtitle="Chaque secteur a ses menaces, ses régulations et ses priorités. CYBERAS Intelligence s'adapte à votre contexte réglementaire et opérationnel."
      />

      {/* Secteurs : un sélecteur, un panneau. La grille de cartes et les blocs
          détaillés disaient la même chose l'une après l'autre, chaque secteur
          empilant un pavé surmonté d'un rectangle dégradé contenant son seul
          nom. La page était longue et plate pour cette raison. */}
      <SecteursSection />
      <PrestationsSections />


      <CtaBanner />
    </>
  )
}
