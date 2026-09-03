import { Link } from 'react-router-dom'
import { ShieldCheck, Landmark, CreditCard, Server, Globe, Crosshair, AlertCircle } from 'lucide-react'
import { PageHero, FadeIn, SectionLabel, CtaBanner } from '../../components/marketing/Shared'

/**
 * Référentiels sur lesquels CYBERAS évalue une organisation.
 *
 * Le choix du référentiel n'est pas cosmétique : il détermine les questions
 * posées, les contrôles évalués, le calcul des écarts et la structure du
 * rapport. La page l'explique plutôt que d'aligner des logos.
 *
 * Distinction tenue partout : CYBERAS évalue et prépare, il ne certifie pas.
 */

interface Referentiel {
  code: string
  name: string
  purpose: string
  /** Ce que le référentiel change concrètement dans l'audit. */
  coverage: string[]
  audience: string
}

const families: { heading: string; icon: typeof ShieldCheck; accent: string; items: Referentiel[] }[] = [
  {
    heading: 'Gouvernance et management',
    icon: Landmark,
    accent: 'text-brand',
    items: [
      {
        code: 'ISO/IEC 27001',
        name: 'Système de management de la sécurité',
        purpose:
          "Cadre de référence pour organiser la sécurité de l'information : périmètre, risques, mesures, amélioration continue.",
        coverage: ['Politiques et gouvernance', 'Gestion des risques', 'Contrôles de l’Annexe A', 'Amélioration continue'],
        audience: 'Organisations visant une démarche structurée ou une certification',
      },
      {
        code: 'ISO/IEC 27002',
        name: 'Mesures de sécurité',
        purpose:
          "Recueil de mesures détaillées venant préciser la mise en œuvre des contrôles de l'ISO 27001.",
        coverage: ['Contrôles organisationnels', 'Contrôles humains', 'Contrôles physiques', 'Contrôles technologiques'],
        audience: 'Équipes qui mettent en œuvre les contrôles au quotidien',
      },
      {
        code: 'ISO/IEC 27005',
        name: 'Gestion des risques',
        purpose:
          "Méthode d'appréciation et de traitement du risque : identification, analyse, évaluation, traitement.",
        coverage: ['Identification des risques', 'Vraisemblance et impact', 'Traitement', 'Risque résiduel'],
        audience: 'Organisations qui formalisent leur analyse de risque',
      },
    ],
  },
  {
    heading: 'Cadres de cybersécurité',
    icon: ShieldCheck,
    accent: 'text-brand',
    items: [
      {
        code: 'NIST CSF',
        name: 'Cybersecurity Framework',
        purpose:
          "Lecture de la posture selon cinq fonctions : identifier, protéger, détecter, répondre, rétablir.",
        coverage: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
        audience: 'Organisations cherchant une vision par capacité plutôt que par contrôle',
      },
      {
        code: 'NIST SP 800-53',
        name: 'Contrôles de sécurité',
        purpose:
          'Catalogue étendu de contrôles techniques et organisationnels, par familles.',
        coverage: ['Contrôle d’accès', 'Journalisation', 'Réponse aux incidents', 'Intégrité système'],
        audience: 'Environnements exigeant un niveau de détail élevé',
      },
      {
        code: 'CIS Controls',
        name: 'Contrôles priorisés',
        purpose:
          "Mesures classées par ordre d'efficacité, utiles pour savoir par où commencer.",
        coverage: ['Inventaire des actifs', 'Configurations sécurisées', 'Gestion des vulnérabilités', 'Journalisation'],
        audience: 'Organisations qui démarrent et cherchent un ordre de priorité',
      },
    ],
  },
  {
    heading: 'Réglementaire et sectoriel',
    icon: CreditCard,
    accent: 'text-brand',
    items: [
      {
        code: 'PCI DSS',
        name: 'Données de cartes bancaires',
        purpose:
          'Exigences applicables dès lors que des données de porteurs de cartes sont traitées, stockées ou transmises.',
        coverage: ['Sécurité réseau', 'Chiffrement', 'Contrôle d’accès', 'Surveillance et tests'],
        audience: 'Commerce, paiement, prestataires techniques',
      },
      {
        code: 'RGPD',
        name: 'Protection des données personnelles',
        purpose:
          'Obligations relatives au traitement des données personnelles et à la sécurité qui les entoure.',
        coverage: ['Base légale', 'Minimisation', 'Sécurité du traitement', 'Notification de violation'],
        audience: 'Toute organisation traitant des données personnelles',
      },
      {
        code: 'NIS 2',
        name: 'Entités essentielles et importantes',
        purpose:
          'Exigences de gestion du risque cyber et de notification pour les secteurs désignés.',
        coverage: ['Gouvernance', 'Gestion des incidents', 'Continuité', 'Chaîne d’approvisionnement'],
        audience: 'Secteurs désignés par la directive',
      },
    ],
  },
  {
    heading: 'Technique et applicatif',
    icon: Globe,
    accent: 'text-brand',
    items: [
      {
        code: 'OWASP Top 10',
        name: 'Risques applicatifs web',
        purpose:
          'Les catégories de failles applicatives les plus répandues, utilisées pour cadrer les tests web.',
        coverage: ['Contrôle d’accès défaillant', 'Injection', 'Défauts cryptographiques', 'Mauvaise configuration'],
        audience: 'Équipes de développement et audits applicatifs',
      },
      {
        code: 'OWASP ASVS',
        name: 'Standard de vérification applicative',
        purpose:
          'Exigences de vérification par niveau, pour donner un critère de réussite mesurable à un test applicatif.',
        coverage: ['Authentification', 'Gestion de session', 'Validation des entrées', 'Journalisation'],
        audience: 'Audits applicatifs approfondis',
      },
      {
        code: 'MITRE ATT&CK',
        name: 'Tactiques et techniques adverses',
        purpose:
          "Description des modes opératoires réellement observés, utile pour relier un constat à un scénario d'attaque.",
        coverage: ['Accès initial', 'Persistance', 'Élévation de privilèges', 'Exfiltration'],
        audience: 'Détection, réponse à incident, tests offensifs',
      },
    ],
  },
  {
    heading: 'Vulnérabilités et notation',
    icon: Crosshair,
    accent: 'text-brand',
    items: [
      {
        code: 'CVE / CVSS / CWE',
        name: 'Identification et notation des vulnérabilités',
        purpose:
          "Identifiant public d'une vulnérabilité, note de gravité normalisée, et catégorie de faiblesse associée.",
        coverage: ['Identification CVE', 'Score CVSS', 'Catégorie CWE', 'Correspondance produit CPE'],
        audience: 'Analyse technique des constats de scan',
      },
      {
        code: 'MEHARI',
        name: 'Méthode d’analyse de risque',
        purpose:
          "Approche par scénarios de risque, reliant actif, événement redouté, impact et mesures en place.",
        coverage: ['Scénarios de risque', 'Actifs concernés', 'Mesures existantes', 'Risque résiduel'],
        audience: 'Analyses de risque structurées par scénario',
      },
      {
        code: 'ISO/IEC 27035',
        name: 'Gestion des incidents',
        purpose:
          'Organisation de la détection, du traitement et du retour d’expérience sur incident.',
        coverage: ['Préparation', 'Détection et signalement', 'Traitement', 'Retour d’expérience'],
        audience: 'Organisations structurant leur réponse à incident',
      },
    ],
  },
  {
    heading: 'Infrastructure et cloud',
    icon: Server,
    accent: 'text-brand',
    items: [
      {
        code: 'CIS Benchmarks',
        name: 'Configurations de référence',
        purpose:
          'Paramétrages recommandés par système, servant de base à l’audit de configuration.',
        coverage: ['Systèmes d’exploitation', 'Bases de données', 'Conteneurs', 'Équipements réseau'],
        audience: 'Durcissement d’infrastructure',
      },
      {
        code: 'ISO/IEC 27017 · 27018',
        name: 'Sécurité et données personnelles dans le cloud',
        purpose:
          'Mesures propres aux services cloud et au traitement des données personnelles qui y sont hébergées.',
        coverage: ['Partage des responsabilités', 'Isolation', 'Journalisation', 'Données personnelles'],
        audience: 'Organisations dont le SI repose sur le cloud',
      },
      {
        code: 'CSA CCM',
        name: 'Cloud Controls Matrix',
        purpose:
          'Matrice de contrôles cloud, avec correspondances vers les principaux référentiels.',
        coverage: ['Gouvernance cloud', 'Chiffrement', 'Identités', 'Portabilité'],
        audience: 'Évaluation de fournisseurs cloud',
      },
    ],
  },
]

export function ReferentielsPage() {
  return (
    <>
      <PageHero
        label="Référentiels"
        title={
          <>
            Évaluez votre sécurité selon le <span className="text-brand">cadre adapté à votre activité</span>
          </>
        }
        subtitle="Le référentiel retenu détermine les questions posées, les contrôles évalués, le calcul des écarts et la structure du rapport. CYBERAS adapte l'ensemble de l'audit au cadre que vous choisissez."
      />

      {/* Ce que le choix du référentiel change réellement dans la conduite d'un audit. */}
      <section className="bg-bg-dark px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <SectionLabel>Ce que change le référentiel</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Un cadre, pas une étiquette
            </h2>
          </FadeIn>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Questionnaire', text: 'Les questions posées et leur pondération découlent des contrôles du référentiel.' },
              { title: 'Contrôles évalués', text: 'Seuls les contrôles applicables à votre périmètre entrent dans le calcul.' },
              { title: 'Analyse des écarts', text: 'Chaque écart est rattaché au contrôle qu’il met en défaut.' },
              { title: 'Rapport', text: 'La structure du rapport suit le découpage du référentiel choisi.' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.06}>
                <div className="h-full rounded-lg border border-border-dark bg-surface-dark p-5">
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-on-dark-muted">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Familles de référentiels. Chaque bloc porte une ancre pour être
          adressable depuis le menu et depuis un rapport. */}
      {families.map((family, index) => {
        const anchor = family.heading
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        return (
          <section
            key={family.heading}
            id={anchor}
            className={`scroll-mt-24 px-4 py-16 sm:px-6 ${index % 2 === 0 ? 'bg-bg-light' : 'bg-surface-light'}`}
          >
            <div className="mx-auto max-w-6xl">
              <FadeIn>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                    <family.icon size={20} className={family.accent} />
                  </span>
                  <h2 className="text-2xl font-extrabold text-text-on-light sm:text-3xl">
                    {family.heading}
                  </h2>
                </div>
              </FadeIn>

              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {family.items.map((ref, i) => (
                  <FadeIn key={ref.code} delay={i * 0.06}>
                    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand">{ref.code}</p>
                      <h3 className="mt-2 font-bold text-text-on-light">{ref.name}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-text-on-light-muted">{ref.purpose}</p>

                      <ul className="mt-4 space-y-1.5">
                        {ref.coverage.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-xs text-text-on-light-muted">
                            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-brand" />
                            {c}
                          </li>
                        ))}
                      </ul>

                      <p className="mt-auto pt-4 text-xs italic text-text-on-light-muted">{ref.audience}</p>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* Distinction que la page doit tenir explicitement : évaluer n'est pas certifier. */}
      <section className="bg-bg-light px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-4 rounded-lg border border-amber-200 bg-amber-50 p-6">
            <AlertCircle size={22} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-bold text-amber-900">Évaluation et préparation, non certification</h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-900">
                CYBERAS mesure votre conformité aux exigences de ces référentiels, identifie les écarts et
                vous prépare à un audit de certification. La certification elle-même relève exclusivement
                des organismes accrédités.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
              >
                Discuter de votre démarche de certification →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
