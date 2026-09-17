import { Link } from 'react-router-dom'
import {
  ArrowRight, Landmark, Crosshair, Users, Network, ShieldCheck, BarChart3,
  Building2, Cpu, Server, UserCheck, Sparkles, Gauge,
} from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'

/**
 * Page Méthodologie : la méthode sur laquelle se fonde la solution.
 *
 * <p>Elle suit le raisonnement du cabinet, tel qu'il le présente à ses
 * clients : pourquoi mesurer avant de protéger, les trois regards d'un audit,
 * les référentiels qui l'encadrent, les huit étapes d'une mission, et ce que
 * la plateforme change à chacune — sans rien retirer à l'exigence.
 *
 * <p>Le score est expliqué en clair : un client qui reçoit un chiffre doit
 * pouvoir dire d'où il vient.
 */

const AUDIT_TYPES = [
  {
    icon: Network,
    title: 'Audit de configuration et d’architecture',
    text: 'L’agencement du réseau et les réglages des équipements de sécurité — pare-feu, VPN, segmentation — confrontés aux bonnes pratiques.',
    to: '/solutions#infrastructures',
  },
  {
    icon: Crosshair,
    title: 'Test d’intrusion',
    text: 'Une attaque simulée, sur un périmètre que vous avez déclaré et autorisé, pour mesurer la résistance réelle et l’exploitabilité des failles.',
    to: '/solutions#intrusion-externe',
  },
  {
    icon: Users,
    title: 'Audit organisationnel',
    text: 'Les processus internes, la gouvernance et le niveau de sensibilisation des équipes : hameçonnage, mots de passe, gestion des accès.',
    to: '/solutions#audit-organisationnel',
  },
]

const FRAMEWORKS = [
  ['ISO 27001', 'Gouvernance de la sécurité'],
  ['NIST CSF', 'Cadre de gestion des risques'],
  ['RGPD', 'Protection des données'],
  ['NIS2', 'Résilience et incidents'],
  ['DORA', 'Résilience du secteur financier'],
  ['OWASP', 'Sécurité applicative'],
  ['PTES', 'Méthode de test d’intrusion'],
  ['MITRE ATT&CK', 'Tactiques d’attaque'],
  ['ANSSI', 'Hygiène informatique'],
  ['PCI DSS', 'Données de paiement'],
]

const STEPS = [
  { n: 1, title: 'Cadrage et objectifs', classic: 'Réunions, courriels, périmètre sur papier.', cyberas: 'Mission cadrée en quelques clics : périmètre déclaré, référentiel choisi, équipe invitée.' },
  { n: 2, title: 'Collecte et inventaire', classic: 'Entretiens et tableurs.', cyberas: 'Questionnaire guidé de 118 questions, preuves déposées question par question.' },
  { n: 3, title: 'Analyse des vulnérabilités', classic: 'Scans isolés, non reliés au reste.', cyberas: 'Scans sur périmètre autorisé, constats reliés aux risques et aux contrôles.' },
  { n: 4, title: 'Évaluation organisationnelle', classic: 'Appréciation de l’auditeur.', cyberas: 'Maturité mesurée sur cinq niveaux, domaine par domaine.' },
  { n: 5, title: 'Tests d’intrusion ciblés', classic: 'Prestation à part, rapport séparé.', cyberas: 'Résultats versés dans la même mission, corrélés aux réponses.' },
  { n: 6, title: 'Analyse de conformité', classic: 'Relecture manuelle par référentiel.', cyberas: 'Une réponse alimente tous les référentiels à la fois.' },
  { n: 7, title: 'Rapport et plan d’action', classic: 'Rédaction de plusieurs jours.', cyberas: 'Rapport préparé par l’IA en moins de trente minutes, validé par l’auditeur.' },
  { n: 8, title: 'Suivi continu', classic: 'Rien jusqu’au prochain audit.', cyberas: 'Score suivi dans le temps, remédiation tracée, alertes.' },
]

const DIMENSIONS = [
  { icon: Building2, label: 'Gouvernance' },
  { icon: Landmark, label: 'Conformité' },
  { icon: Cpu, label: 'Technique' },
  { icon: Server, label: 'Physique' },
  { icon: UserCheck, label: 'Humain' },
]

export function MethodologiePage() {
  return (
    <>
      <PageHero
        label="Méthodologie"
        title={
          <>
            D’où vient le risque, comment l’auditer, <span className="text-brand">comment y répondre</span>.
          </>
        }
        subtitle="Avant de se protéger, il faut savoir précisément où l’on en est. La méthode de SMARTEX Expertises donne une mesure, pas une impression — et CYBERAS Intelligence l’applique à chaque mission."
      />

      {/* Pourquoi mesurer d'abord. */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionLabel>Le principe</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
              L’audit est la première étape, pas la dernière.
            </h2>
            <p className="mt-5 text-text-on-light-muted">
              Attendre un incident pour agir coûte toujours plus cher qu’anticiper. L’audit régulier transforme la
              sécurité en processus continu : un bilan clair des forces et des faiblesses, un plan d’action priorisé
              plutôt qu’une liste brute, et des investissements orientés là où ils comptent.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Une photographie fidèle du niveau de sécurité réel',
                'Des priorités défendables devant la direction',
                'Une démarche proactive, répétée, mesurée dans le temps',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-text-on-light">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" /> {t}
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Trois regards, une couverture complète</p>
              <ul className="mt-4 space-y-4">
                {AUDIT_TYPES.map((a) => (
                  <li key={a.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10">
                      <a.icon size={16} className="text-brand" />
                    </span>
                    <span>
                      <span className="block font-semibold text-text-on-light">{a.title}</span>
                      <span className="mt-0.5 block text-sm text-text-on-light-muted">{a.text}</span>
                      <Link to={a.to} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                        Voir la prestation <ArrowRight size={12} />
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Référentiels. */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Cadres de référence</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Des référentiels reconnus, pas une méthode maison.
            </h2>
            <p className="mt-4 text-text-on-dark-muted">
              Chaque question du questionnaire et chaque constat de scan sont rattachés à un contrôle d’un
              référentiel international. Une même réponse sert à tous ceux qui la demandent.
            </p>
          </FadeIn>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FRAMEWORKS.map(([name, role]) => (
              <li key={name} className="rounded-lg border border-border-dark bg-surface-dark p-4">
                <span className="block font-bold text-white">{name}</span>
                <span className="mt-0.5 block text-xs text-text-on-dark-muted">{role}</span>
              </li>
            ))}
          </ul>
          <FadeIn className="mt-8 text-center">
            <Link to="/referentiels" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
              Le détail des référentiels couverts <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Les huit étapes, et ce que la plateforme y change. */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Les huit étapes d’un audit</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
              La même exigence, de dix à quinze jours ramenés à trois à cinq.
            </h2>
            <p className="mt-4 text-text-on-light-muted">
              Aucune étape n’est sautée. Ce qui change, c’est que la collecte, la corrélation et la rédaction ne se
              font plus à la main.
            </p>
          </FadeIn>
          <div className="mt-12 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-surface-light text-left text-[11px] uppercase tracking-wider text-text-on-light-muted">
                <tr>
                  <th className="px-4 py-3">Étape</th>
                  <th className="px-4 py-3">Méthode traditionnelle</th>
                  <th className="px-4 py-3">Avec CYBERAS Intelligence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {STEPS.map((s) => (
                  <tr key={s.n} className="align-top">
                    <td className="px-4 py-3">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{s.n}</span>
                      <span className="font-semibold text-text-on-light">{s.title}</span>
                    </td>
                    <td className="px-4 py-3 text-text-on-light-muted">{s.classic}</td>
                    <td className="px-4 py-3 text-text-on-light">{s.cyberas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['≈ 66 %', 'de temps d’audit en moins'],
              ['> 95 %', 'de temps de rédaction en moins'],
              ['100 %', 'des constats tracés et corrélés'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                <span className="block text-2xl font-extrabold text-brand">{v}</span>
                <span className="text-sm text-text-on-light-muted">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinq dimensions + score. */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionLabel>Cinq dimensions</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Une seule mission, tout le périmètre.
            </h2>
            <p className="mt-4 text-text-on-dark-muted">
              L’audit traditionnel juxtapose des prestations séparées ; la plateforme les unifie et les corrèle.
              Une faiblesse humaine et une faiblesse technique qui se renforcent sont vues ensemble.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {DIMENSIONS.map((d) => (
                <li key={d.label} className="inline-flex items-center gap-2 rounded-full border border-border-dark bg-surface-dark px-3.5 py-1.5 text-sm text-white">
                  <d.icon size={14} className="text-brand" /> {d.label}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2 text-sm text-text-on-dark-muted">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-brand" />
              L’IA intervient à chaque étape — collecte, corrélation, classification, score, conformité, rédaction —
              et chaque suggestion cite sa source. Rien n’est appliqué sans validation humaine.{' '}
              <Link to="/agents-ia" className="font-semibold text-brand hover:underline">Les agents IA</Link>
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-border-dark bg-surface-dark p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
                <Gauge size={14} /> D’où vient le score
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-white">Maturité déclarée — 0 à 4</dt>
                  <dd className="mt-0.5 text-text-on-dark-muted">Moyenne pondérée des réponses au questionnaire, par domaine puis globale. Inexistant, initial, reproductible, défini, maîtrisé.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Exposition constatée — 0 à 100</dt>
                  <dd className="mt-0.5 text-text-on-dark-muted">Cotation MEHARI des constats de scan : gravité, exploitabilité, impact métier selon votre secteur. Plus c’est haut, plus c’est exposé.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Mérite — sur 100</dt>
                  <dd className="mt-0.5 text-text-on-dark-muted">Pour comparer plusieurs sociétés : 70 % de maturité déclarée, 30 % de sécurité constatée quand un scan a abouti. Sans réponse, pas de classement.</dd>
                </div>
              </dl>
              <p className="mt-5 flex items-center gap-2 text-xs text-text-on-dark-muted">
                <BarChart3 size={14} /> Chaque chiffre est accompagné de son raisonnement dans le rapport.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
