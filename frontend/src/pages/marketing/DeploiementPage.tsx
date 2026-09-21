import { Link } from 'react-router-dom'
import {
  ArrowRight, MessageSquare, FileSignature, Rocket, Cloud, Server, Layers,
  FileText, ListChecks, Trophy, History, ClipboardList, Check,
} from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'
import { PriseEnMain } from '../../components/marketing/PriseEnMain'

/**
 * Page Déploiement : comment la mise en œuvre se passe, étape par étape, et
 * ce que le client reçoit.
 *
 * <p>Trois temps : avant (comment on démarre avec le cabinet), pendant (le
 * parcours dans la plateforme, repris de l'accueil), après (les livrables).
 * Puis les modalités : hébergement, délais, ce que le client doit fournir —
 * parce que ce sont les questions qu'un acheteur pose avant de signer.
 */

const START = [
  { icon: MessageSquare, n: 1, title: 'Diagnostic initial', text: 'Un premier échange pour cerner votre périmètre, vos obligations et vos priorités. Sans engagement.', duration: '1 h' },
  { icon: FileSignature, n: 2, title: 'Proposition sur mesure', text: 'Un plan d’audit, ou une démonstration de la plateforme sur votre contexte, avec la formule adaptée.', duration: '2 à 3 jours' },
  { icon: Rocket, n: 3, title: 'Mise en œuvre', text: 'Ouverture de votre espace, cadrage de la première mission, accompagnement de vos équipes jusqu’au premier rapport.', duration: '3 à 5 jours' },
]

const DELIVERABLES = [
  { icon: FileText, title: 'Rapport exécutif', text: 'Deux pages pour la direction : score, tendances, trois priorités.' },
  { icon: ClipboardList, title: 'Rapport détaillé', text: 'Constats par domaine, preuves rattachées, correspondance avec les référentiels.' },
  { icon: ListChecks, title: 'Plan d’action priorisé', text: 'Chaque écart devient une action, ordonnée par effet attendu et effort.' },
  { icon: Trophy, title: 'Score et classement', text: 'Maturité, exposition, et : pour un projet multi-sociétés, le classement par mérite.' },
  { icon: History, title: 'Journal d’audit', text: 'Qui a répondu, déposé, scanné, et quand. Chaîné : une altération se voit.' },
]

const MODES = [
  {
    icon: Cloud,
    title: 'Hébergé par SMARTEX',
    text: 'Aucune installation. Votre espace est ouvert en quelques minutes, les mises à jour sont continues, les données cloisonnées par organisation et chiffrées au repos.',
    facts: ['Formules semestrielle et annuelle', 'Disponible immédiatement'],
  },
  {
    icon: Server,
    title: 'Dédié ou sur site',
    text: 'Pour les groupes, administrations et secteurs régulés : instance dédiée ou déploiement dans votre infrastructure, avec vos exigences de résidence des données.',
    facts: ['Offre entreprise, sur devis', 'Responsable de compte'],
  },
  {
    icon: Layers,
    title: 'Projet multi-sociétés',
    text: 'Vous évaluez plusieurs prestataires, filiales ou candidats : chacun reçoit son espace et son lien d’accès, vous comparez et classez leurs résultats.',
    facts: ['Liens d’accès individuels', 'Classement par mérite'],
  },
]

const YOU_PROVIDE = [
  'Un interlocuteur qui connaît le système d’information',
  'Le périmètre à évaluer : domaines, adresses, applications',
  'L’autorisation écrite de tester ce périmètre',
  'Les documents existants : politiques, procédures, schémas',
]

export function DeploiementPage() {
  return (
    <>
      <PageHero
        label="Déploiement"
        title={
          <>
            Du premier échange au premier rapport, <span className="text-brand">en quelques jours</span>.
          </>
        }
        subtitle="Comment la mise en œuvre se passe, ce que vous devez fournir, et ce que vous recevez à la fin. Sans installation, sans consultant à demeure."
      />

      {/* Avant : démarrer avec le cabinet. */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Démarrer</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">Trois étapes pour commencer.</h2>
          </FadeIn>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {START.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.08}>
                <li className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                      <s.icon size={20} className="text-brand" />
                    </span>
                    <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-text-on-light-muted">{s.duration}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-text-on-light">
                    <span className="text-brand">{s.n}.</span> {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-on-light-muted">{s.text}</p>
                </li>
              </FadeIn>
            ))}
          </ol>
          <FadeIn className="mt-8 text-center">
            <Link to="/demo" className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
              Demander le diagnostic initial <ArrowRight size={16} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Pendant : le parcours dans la plateforme (composant de l'accueil). */}
      <PriseEnMain />

      {/* Après : les livrables. */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Livrables</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">Ce que vous recevez.</h2>
            <p className="mt-4 text-text-on-light-muted">
              Tout est produit dans la plateforme, exportable, et reste consultable d’une mission à l’autre.
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {DELIVERABLES.map((d, i) => (
              <FadeIn key={d.title} delay={i * 0.05}>
                <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
                  <d.icon size={22} className="text-brand" />
                  <h3 className="mt-3 font-bold text-text-on-light">{d.title}</h3>
                  <p className="mt-1.5 text-sm text-text-on-light-muted">{d.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Modalités. */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <SectionLabel>Modalités</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Trois façons de déployer.</h2>
          </FadeIn>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {MODES.map((m, i) => (
              <FadeIn key={m.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-xl border border-border-dark bg-surface-dark p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <m.icon size={20} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-white">{m.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-on-dark-muted">{m.text}</p>
                  <ul className="mt-4 space-y-1.5">
                    {m.facts.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-on-dark">
                        <Check size={14} className="shrink-0 text-brand" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-12 grid gap-8 rounded-xl border border-border-dark bg-surface-dark p-6 md:grid-cols-2 md:p-8">
            <div>
              <h3 className="font-bold text-white">Ce que vous devez fournir</h3>
              <ul className="mt-3 space-y-2">
                {YOU_PROVIDE.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-text-on-dark-muted">
                    <Check size={14} className="mt-0.5 shrink-0 text-brand" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white">Délais indicatifs</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ['Ouverture de l’espace', 'le jour même'],
                  ['Questionnaire complet', '5 sessions d’une heure'],
                  ['Scans du périmètre', 'de quelques minutes à 30 min par cible'],
                  ['Premier rapport', '3 à 5 jours après le cadrage'],
                  ['Projet multi-sociétés', 'selon l’échéance que vous fixez'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border-dark pb-2">
                    <dt className="text-text-on-dark-muted">{k}</dt>
                    <dd className="text-right font-medium text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
