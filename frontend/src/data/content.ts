import {
  ClipboardList, ListChecks, FolderOpen, Radar, BarChart3, FileText,
  type LucideIcon,
} from 'lucide-react'
import type { Agent } from '../types'

/**
 * Textes du site vitrine.
 *
 * Une seule voix, celle de l'accueil : on dit ce que la personne obtient, en
 * français, sans jargon anglais ni promesse chiffrée qu'on ne peut tenir. Les
 * données ne décrivent que ce que la plateforme fait réellement — chaque
 * capacité ci-dessous correspond à un écran de l'application.
 */

// ---------------------------------------------------------------------------
// Agents IA
// ---------------------------------------------------------------------------

export const agents: (Agent & { title: string })[] = [
  {
    id: 1,
    name: 'Lecteur de preuves',
    title: 'Lecteur de preuves',
    description:
      'Lit les pièces déposées (politiques, procédures, captures) et signale si elles répondent vraiment à la question posée.',
    capabilities: ['Analyse documentaire', 'Écart déclaré / démontré'],
  },
  {
    id: 2,
    name: 'Analyste de risque',
    title: 'Analyste de risque',
    description:
      'Croise vos réponses, votre secteur et les constats des scans pour coter chaque risque selon la méthode MEHARI.',
    capabilities: ['Cotation MEHARI', 'Priorisation'],
  },
  {
    id: 3,
    name: 'Rédacteur de recommandations',
    title: 'Rédacteur de recommandations',
    description:
      'Transforme chaque écart en action concrète, rattachée au contrôle du référentiel et ordonnée par effet attendu.',
    capabilities: ['Plan d’action', 'Référentiels'],
  },
]

// ---------------------------------------------------------------------------
// Plateforme : ce qu'elle fait, écran par écran
// ---------------------------------------------------------------------------

export interface Capability {
  slug: string
  icon: LucideIcon
  title: string
  /** Ce que la personne obtient, en une phrase. */
  promise: string
  /** Trois repères concrets, lisibles d'un coup d'œil. */
  facts: string[]
}

export const capabilities: Capability[] = [
  {
    slug: 'audits',
    icon: ClipboardList,
    title: 'Missions d’audit',
    promise: 'Cadrez une mission — périmètre, référentiel, équipe — et suivez-la jusqu’au rapport.',
    facts: ['ISO 27001, NIST, PCI DSS', 'Versions et historique', 'Rôles par mission'],
  },
  {
    slug: 'questionnaire',
    icon: ListChecks,
    title: 'Questionnaire de maturité',
    promise: 'Répondez domaine par domaine, à votre rythme ; chaque réponse est enregistrée au fil de l’eau.',
    facts: ['118 questions', '5 niveaux de maturité', 'Reprise à tout moment'],
  },
  {
    slug: 'preuves',
    icon: FolderOpen,
    title: 'Preuves',
    promise: 'Déposez une pièce par question ; l’IA vérifie qu’elle démontre ce que vous déclarez.',
    facts: ['Pièces rattachées aux contrôles', 'Analyse assistée', 'Écart déclaré / démontré'],
  },
  {
    slug: 'scans',
    icon: Radar,
    title: 'Scans techniques',
    promise: 'Scannez le périmètre que vous avez déclaré et obtenez des constats classés par gravité.',
    facts: ['Périmètre autorisé seulement', 'CVE et CVSS', 'Constats reliés aux risques'],
  },
  {
    slug: 'risques',
    icon: BarChart3,
    title: 'Risques et exposition',
    promise: 'Une carte des risques et un score d’exposition qui tiennent compte de votre secteur.',
    facts: ['Méthode MEHARI', 'Score 0-100', 'Suivi de remédiation'],
  },
  {
    slug: 'rapports',
    icon: FileText,
    title: 'Recommandations et rapports',
    promise: 'Un plan d’action priorisé et un rapport prêt à partager avec la direction ou un auditeur externe.',
    facts: ['Actions ordonnées par effet', 'Rapport exécutif et détaillé', 'Export'],
  },
]

// ---------------------------------------------------------------------------
// Offres
// ---------------------------------------------------------------------------

export const plans = [
  {
    id: 1,
    name: 'Semestriel',
    price: '6 000',
    period: '€ / 6 mois',
    description: 'Pour une première évaluation complète',
    recommended: false,
    features: [
      { label: 'Audits illimités sur la période', included: true },
      { label: "Jusqu'à 5 utilisateurs", included: true },
      { label: 'Questionnaires et référentiels', included: true },
      { label: 'Scans techniques autorisés', included: true },
      { label: 'Score Cyberas et recommandations', included: true },
      { label: 'Support par courriel', included: true },
      { label: 'Intégrations et interface de programmation (API)', included: false },
      { label: 'Accompagnement dédié', included: false },
    ],
  },
  {
    id: 2,
    name: 'Annuel',
    price: '10 000',
    period: '€ / an',
    description: 'Suivi continu sur douze mois — deux semestriels reviendraient à 12 000 €',
    recommended: true,
    features: [
      { label: 'Tout le semestriel, sur douze mois', included: true },
      { label: 'Utilisateurs illimités', included: true },
      { label: 'Questionnaires et référentiels', included: true },
      { label: 'Scans techniques autorisés', included: true },
      { label: 'Score Cyberas et recommandations', included: true },
      { label: 'Suivi de remédiation et historique', included: true },
      { label: 'Intégrations et interface de programmation (API)', included: true },
      { label: 'Accompagnement dédié', included: true },
    ],
  },
  {
    id: 3,
    name: 'Entreprise',
    price: 'Sur devis',
    period: 'offre entreprise',
    description:
      'Pour les groupes, administrations et organisations à plusieurs entités : périmètre, volume et accompagnement définis ensemble',
    recommended: false,
    // Pas d'inscription en ligne : le tarif se construit avec le client. Le
    // bouton mène au formulaire de contact, pas à l'inscription.
    onQuote: true,
    features: [
      { label: 'Tout l’annuel, sans limite de périmètre', included: true },
      { label: 'Plusieurs organisations et filiales', included: true },
      { label: 'Référentiels et questionnaires sur mesure', included: true },
      { label: 'Scans techniques planifiés', included: true },
      { label: 'Tableau de bord de groupe et rapports consolidés', included: true },
      { label: 'Hébergement dédié ou sur site', included: true },
      { label: 'Intégrations et interface de programmation (API)', included: true },
      { label: 'Responsable de compte et formation des équipes', included: true },
    ],
  },
]

// ---------------------------------------------------------------------------
// Accueil : pourquoi auditer régulièrement
// ---------------------------------------------------------------------------

export const whyAuditBenefits = [
  {
    title: 'Trouver les failles avant qu’elles ne servent',
    description: 'Des scans réguliers sur votre périmètre et des constats classés par gravité, reliés à vos risques.',
  },
  {
    title: 'Tenir la conformité dans la durée',
    description: 'ISO 27001, NIST, PCI DSS, RGPD, ANSSI : les mêmes réponses et les mêmes preuves servent à tous les référentiels.',
  },
  {
    title: 'Décider avec un score, pas une impression',
    description: 'Maturité déclarée, exposition constatée, secteur d’activité : un score d’exposition lisible par la direction.',
  },
  {
    title: 'Faire gagner du temps à l’équipe',
    description: 'Une information saisie une fois est réutilisée partout ; l’IA prépare l’analyse, votre équipe valide.',
  },
]
