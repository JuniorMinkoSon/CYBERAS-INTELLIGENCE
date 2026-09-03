import { Link } from 'react-router-dom'
import {
  ClipboardCheck, Server, Code2, Bell, Compass, Crosshair,
  Cloud, BarChart3, Globe, Radar, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FadeIn, SectionLabel } from './Shared'

/**
 * Prestations d'audit, une section par entrée du menu principal.
 *
 * Chaque bloc porte l'ancre exacte vers laquelle pointe le méga-menu : sans
 * elles, tous les liens /solutions#... atterrissaient en haut de page sans rien
 * cibler. L'identifiant fait donc partie du contrat de navigation, pas de la
 * mise en forme.
 *
 * Le contenu décrit ce que la mission produit réellement — livrables et
 * référentiels mobilisés — plutôt que des promesses générales.
 */

interface Prestation {
  /** Doit correspondre au fragment utilisé dans megaMenu.ts. */
  anchor: string
  icon: LucideIcon
  title: string
  summary: string
  /** Ce que la mission examine concrètement. */
  scope: string[]
  /** Ce que le client reçoit à l'issue. */
  deliverables: string[]
  referentials: string
}

const prestations: Prestation[] = [
  {
    anchor: 'audit-organisationnel',
    icon: ClipboardCheck,
    title: 'Audit organisationnel',
    summary:
      "Évaluation des politiques, des processus et de la gouvernance. C'est la part de la sécurité qu'aucun scan ne peut mesurer.",
    scope: ['Politiques et procédures', 'Rôles et responsabilités', 'Gestion des accès', 'Continuité d’activité'],
    deliverables: ['Score de maturité par domaine', 'Écarts aux contrôles applicables', 'Plan de remédiation priorisé'],
    referentials: 'ISO 27001, ISO 27002, NIST CSF',
  },
  {
    anchor: 'evaluation-si',
    icon: BarChart3,
    title: 'Évaluation globale du SI',
    summary:
      'Vision complète de la posture : technique et organisationnelle, interne et externe, réunies dans un score unique et explicable.',
    scope: ['Inventaire des actifs', 'Exposition externe', 'Configurations', 'Maturité organisationnelle'],
    deliverables: ['Score Cyberas global', 'Cartographie des risques', 'Priorités d’action'],
    referentials: 'ISO 27001, NIST CSF, CIS Controls',
  },
  {
    anchor: 'infrastructures',
    icon: Server,
    title: 'Sécurité des infrastructures',
    summary:
      'Analyse des serveurs, du réseau et des configurations, confrontée aux configurations de référence.',
    scope: ['Durcissement système', 'Segmentation réseau', 'Services exposés', 'Correctifs et versions'],
    deliverables: ['Écarts aux CIS Benchmarks', 'Vulnérabilités identifiées avec CVE et CVSS', 'Actions de durcissement'],
    referentials: 'CIS Benchmarks, NIST SP 800-53',
  },
  {
    anchor: 'applications',
    icon: Code2,
    title: 'Sécurité des applications',
    summary:
      'Examen des applications web et de leurs interfaces, selon des critères de vérification mesurables.',
    scope: ['Authentification et sessions', 'Contrôle d’accès', 'Validation des entrées', 'Exposition des API'],
    deliverables: ['Constats classés par gravité', 'Preuves techniques', 'Correctifs recommandés'],
    referentials: 'OWASP Top 10, OWASP ASVS',
  },
  {
    anchor: 'intrusion-externe',
    icon: Globe,
    title: 'Test d’intrusion externe',
    summary:
      "Évaluation de ce qu'un attaquant peut atteindre depuis Internet, dans un périmètre autorisé et tracé.",
    scope: ['Surface exposée', 'Services accessibles', 'Vulnérabilités exploitables', 'Chemins d’accès'],
    deliverables: ['Scénarios d’attaque documentés', 'Preuves d’exploitation', 'Mesures correctives'],
    referentials: 'PTES, NIST SP 800-115, MITRE ATT&CK',
  },
  {
    anchor: 'intrusion-interne',
    icon: Radar,
    title: 'Test d’intrusion interne',
    summary:
      "Évaluation de la progression possible depuis l'intérieur du réseau, une fois le premier accès obtenu.",
    scope: ['Latéralisation', 'Élévation de privilèges', 'Accès aux données sensibles', 'Cloisonnement'],
    deliverables: ['Chemins de compromission', 'Actifs atteignables', 'Recommandations de cloisonnement'],
    referentials: 'PTES, MITRE ATT&CK',
  },
  {
    anchor: 'securite-cloud',
    icon: Cloud,
    title: 'Sécurité cloud',
    summary:
      'Revue des configurations, des identités et des ressources cloud, où la responsabilité est partagée avec le fournisseur.',
    scope: ['Identités et permissions', 'Stockages exposés', 'Journalisation', 'Conteneurs et orchestration'],
    deliverables: ['Écarts de configuration', 'Permissions excessives', 'Plan de correction'],
    referentials: 'CSA CCM, ISO 27017, CIS Benchmarks',
  },
  {
    anchor: 'risques',
    icon: Crosshair,
    title: 'Gestion des risques',
    summary:
      'Analyse structurée par scénario : actif concerné, événement redouté, vraisemblance, impact et risque résiduel.',
    scope: ['Identification des scénarios', 'Vraisemblance et impact', 'Mesures existantes', 'Risque résiduel'],
    deliverables: ['Registre des risques', 'Matrice impact / probabilité', 'Décisions de traitement'],
    referentials: 'ISO 27005, MEHARI',
  },
  {
    anchor: 'incidents',
    icon: Bell,
    title: 'Réponse aux incidents',
    summary:
      "Évaluation de la capacité à détecter, qualifier et traiter un incident, puis à en tirer un retour d'expérience.",
    scope: ['Détection et signalement', 'Procédures de traitement', 'Communication de crise', 'Retour d’expérience'],
    deliverables: ['Maturité de la réponse', 'Écarts procéduraux', 'Plan d’amélioration'],
    referentials: 'ISO 27035, NIST SP 800-61',
  },
  {
    anchor: 'conseil',
    icon: Compass,
    title: 'Conseil et stratégie',
    summary:
      'Définition d’une trajectoire de sécurité tenant compte du niveau de départ, des contraintes et du budget.',
    scope: ['Ambition et cible', 'Trajectoire par étapes', 'Priorisation budgétaire', 'Indicateurs de suivi'],
    deliverables: ['Feuille de route', 'Trajectoire de maturité', 'Indicateurs de pilotage'],
    referentials: 'ISO 27001, NIST CSF, COBIT',
  },
]

export function PrestationsSections() {
  return (
    <section className="bg-surface-light px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <SectionLabel>Nos prestations</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
            Ce que couvre une mission CYBERAS
          </h2>
          <p className="mt-4 max-w-2xl text-text-on-light-muted">
            Chaque prestation produit des constats rattachés à une preuve et à un contrôle de référentiel.
            Aucun résultat n'est avancé sans sa source.
          </p>
        </FadeIn>

        <div className="mt-12 space-y-5">
          {prestations.map((p, i) => (
            <FadeIn key={p.anchor} delay={Math.min(i, 4) * 0.05}>
              {/* scroll-mt compense la barre de navigation fixe : sans marge, la
                  section arriverait sous le bandeau. */}
              <article
                id={p.anchor}
                className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-brand/40 hover:shadow-md sm:p-8"
              >
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="lg:w-1/3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                      <p.icon size={22} className="text-brand" />
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-text-on-light">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-on-light-muted">{p.summary}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand">
                      {p.referentials}
                    </p>
                  </div>

                  <div className="grid flex-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-on-light">
                        Périmètre examiné
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {p.scope.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-text-on-light-muted">
                            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-brand" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-on-light">
                        Livrables
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {p.deliverables.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-text-on-light-muted">
                            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-brand" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5">
                  <Link
                    to="/demo"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                  >
                    Demander une démonstration <ArrowRight size={15} />
                  </Link>
                  <Link
                    to="/referentiels"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-on-light-muted hover:text-brand"
                  >
                    Voir les référentiels mobilisés
                  </Link>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
