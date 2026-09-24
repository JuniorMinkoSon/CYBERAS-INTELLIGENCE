import { Link } from 'react-router-dom'
import {
  ArrowRight, Landmark, Crosshair, Users, Network, ShieldCheck, BarChart3,
  Building2, Cpu, Server, UserCheck, Sparkles, Gauge,
} from 'lucide-react'
import { FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'
import { PageCover } from '../../components/marketing/SiteKit'
import { DemoButton } from '../../components/marketing/DemoButton'

/**
 * Page Méthodologie : la méthode sur laquelle se fonde la solution.
 *
 * <p>Elle suit le raisonnement du cabinet, tel qu'il le présente à ses
 * clients : pourquoi mesurer avant de protéger, les trois regards d'un audit,
 * les référentiels qui l'encadrent, les huit étapes d'une mission, et ce que
 * la plateforme change à chacune : sans rien retirer à l'exigence.
 *
 * <p>Le score est expliqué en clair : un client qui reçoit un chiffre doit
 * pouvoir dire d'où il vient.
 */

const AUDIT_TYPES = [
  {
    icon: Network,
    title: 'Audit de configuration et d’architecture',
    text: 'L’agencement du réseau et les réglages des équipements de sécurité : pare-feu, VPN, segmentation, confrontés aux bonnes pratiques.',
  },
  {
    icon: Crosshair,
    title: 'Test d’intrusion',
    text: 'Une attaque simulée, sur un périmètre que vous avez déclaré et autorisé, pour mesurer la résistance réelle et l’exploitabilité des failles.',
  },
  {
    icon: Users,
    title: 'Audit organisationnel',
    text: 'Les processus internes, la gouvernance et le niveau de sensibilisation des équipes : hameçonnage, mots de passe, gestion des accès.',
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
  { n: 7, title: 'Rapport et plan d’action', classic: 'Rédaction de plusieurs jours.', cyberas: 'Rapport préparé par l’IA, validé par l’auditeur.' },
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
      {/* Le titre précédent posait trois questions d'affilée avant d'avoir rien
          dit ; celui-ci porte la promesse de la méthode.

          La couverture est celle du reste du site, et non plus le bloc de
          texte gris de l'ancienne version : la page est redevenue une
          destination du menu, et l'on passait d'une couverture photographique
          à une page administrative selon l'entrée choisie. */}
      <PageCover
        eyebrow="Méthodologie"
        title={
          <>
            Une mesure, <span className="text-[color:var(--s-primary)]">pas une impression</span>
          </>
        }
        lead="Avant de se protéger, il faut savoir précisément où l’on en est. La méthode de SMARTEX Expertises donne une mesure, pas une impression, et CYBERAS Intelligence l’applique à chaque mission."
        actions={
          <>
            <Link to="/evaluation" className="s-btn s-btn-primary">
              Lancer une évaluation <ArrowRight size={18} />
            </Link>
            <DemoButton />
          </>
        }
        image="/images/reunion.jpg"
        imageAlt="Réunion de cadrage autour d’un tableau, équipe en train de poser une démarche d’audit"
        reperes={['Huit étapes', 'Cinq dimensions', 'Score explicable']}
      />

      {/* Pourquoi mesurer d'abord. */}
      <section className="s-surface-alt px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionLabel>Le principe</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-[color:var(--s-text-strong)] sm:text-4xl">
              L’audit est la première étape, pas la dernière.
            </h2>
            <p className="mt-5 text-[color:var(--s-text-muted)]">
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
                <li key={t} className="flex items-start gap-2.5 text-sm text-[color:var(--s-text-strong)]">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[color:var(--s-primary)]" /> {t}
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] p-6 shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--s-primary)]">Trois regards, une couverture complète</p>
              <ul className="mt-4 space-y-4">
                {AUDIT_TYPES.map((a) => (
                  <li key={a.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--s-primary-soft)]">
                      <a.icon size={16} className="text-[color:var(--s-primary)]" />
                    </span>
                    <span>
                      <span className="block font-semibold text-[color:var(--s-text-strong)]">{a.title}</span>
                      <span className="mt-0.5 block text-sm text-[color:var(--s-text-muted)]">{a.text}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* Un seul renvoi au lieu de trois. Chaque regard portait le
                  sien, vers une ancre de la page Solutions par secteur que
                  cette page n'a plus depuis sa refonte : trois liens, trois
                  fois dans le vide, et le visiteur croyait simplement que la
                  page avait mal défilé. */}
              <Link to="/solutions" className="s-link mt-5 text-sm">
                Les prestations, secteur par secteur <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Référentiels. */}
      <section className="s-surface-navy px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Cadres de référence</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-[color:var(--s-text-strong)] sm:text-4xl">
              Des référentiels reconnus, pas une méthode maison.
            </h2>
            <p className="mt-4 text-[color:var(--s-text-muted)]">
              Chaque question du questionnaire et chaque constat de scan sont rattachés à un contrôle d’un
              référentiel international. Une même réponse sert à tous ceux qui la demandent.
            </p>
          </FadeIn>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FRAMEWORKS.map(([name, role]) => (
              <li key={name} className="rounded-lg border border-[color:var(--s-border)] s-surface-navy p-4">
                <span className="block font-bold text-[color:var(--s-text-strong)]">{name}</span>
                <span className="mt-0.5 block text-xs text-[color:var(--s-text-muted)]">{role}</span>
              </li>
            ))}
          </ul>
          <FadeIn className="mt-8 text-center">
            <Link to="/referentiels" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--s-primary)] hover:underline">
              Le détail des référentiels couverts <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Les huit étapes, et ce que la plateforme y change. */}
      <section className="s-surface-alt px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Les huit étapes d’un audit</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-[color:var(--s-text-strong)] sm:text-4xl">
              La même exigence, de dix à quinze jours ramenés à trois à cinq.
            </h2>
            <p className="mt-4 text-[color:var(--s-text-muted)]">
              Aucune étape n’est sautée. Ce qui change, c’est que la collecte, la corrélation et la rédaction ne se
              font plus à la main.
            </p>
          </FadeIn>
          <div className="mt-12 overflow-x-auto rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] shadow-xs">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="s-surface-white text-left text-[11px] uppercase tracking-wider text-[color:var(--s-text-muted)]">
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
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--s-primary)] text-xs font-bold text-[color:var(--s-text-strong)]">{s.n}</span>
                      <span className="font-semibold text-[color:var(--s-text-strong)]">{s.title}</span>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--s-text-muted)]">{s.classic}</td>
                    <td className="px-4 py-3 text-[color:var(--s-text-strong)]">{s.cyberas}</td>
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
              <div key={l} className="rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-raised)] p-4 text-center">
                <span className="block text-2xl font-extrabold text-[color:var(--s-primary)]">{v}</span>
                <span className="text-sm text-[color:var(--s-text-muted)]">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinq dimensions + score. */}
      <section className="s-surface-navy px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionLabel>Cinq dimensions</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-[color:var(--s-text-strong)] sm:text-4xl">
              Une seule mission, tout le périmètre.
            </h2>
            <p className="mt-4 text-[color:var(--s-text-muted)]">
              L’audit traditionnel juxtapose des prestations séparées ; la plateforme les unifie et les corrèle.
              Une faiblesse humaine et une faiblesse technique qui se renforcent sont vues ensemble.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {DIMENSIONS.map((d) => (
                <li key={d.label} className="inline-flex items-center gap-2 rounded-full border border-[color:var(--s-border)] s-surface-navy px-3.5 py-1.5 text-sm text-[color:var(--s-text-strong)]">
                  <d.icon size={14} className="text-[color:var(--s-primary)]" /> {d.label}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2 text-sm text-[color:var(--s-text-muted)]">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-[color:var(--s-primary)]" />
              L’IA intervient à chaque étape : collecte, corrélation, classification, score, conformité, rédaction,
              et chaque suggestion cite sa source. Rien n’est appliqué sans validation humaine.{' '}
              <Link to="/agents-ia" className="font-semibold text-[color:var(--s-primary)] hover:underline">Les agents IA</Link>
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-[color:var(--s-border)] s-surface-navy p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--s-primary)]">
                <Gauge size={14} /> D’où vient le score
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-[color:var(--s-text-strong)]">Maturité déclarée : 0 à 4</dt>
                  <dd className="mt-0.5 text-[color:var(--s-text-muted)]">Moyenne pondérée des réponses au questionnaire, par domaine puis globale. Inexistant, initial, reproductible, défini, maîtrisé.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--s-text-strong)]">Exposition constatée : 0 à 100</dt>
                  <dd className="mt-0.5 text-[color:var(--s-text-muted)]">Cotation MEHARI des constats de scan : gravité, exploitabilité, impact métier selon votre secteur. Plus c’est haut, plus c’est exposé.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--s-text-strong)]">Mérite : sur 100</dt>
                  <dd className="mt-0.5 text-[color:var(--s-text-muted)]">Pour comparer plusieurs sociétés : 70 % de maturité déclarée, 30 % de sécurité constatée quand un scan a abouti. Sans réponse, pas de classement.</dd>
                </div>
              </dl>
              <p className="mt-5 flex items-center gap-2 text-xs text-[color:var(--s-text-muted)]">
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
