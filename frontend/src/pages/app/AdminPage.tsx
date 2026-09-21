import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader, Inbox, Building2, Mail, Phone, ShieldAlert, ExternalLink, Layers, Network, FolderKanban,
} from 'lucide-react'
import {
  adminClient, rankingsClient,
  type OrganizationOverview, type PlatformSummary,
  type SectorRanking, type DomainRanking,
} from '../../services/adminClient'
import { contactClient, type ContactRequestRecord, type ContactSummary } from '../../services/contactClient'
import { useNotification } from '../../contexts/NotificationContext'

/**
 * Administration de la plateforme.
 *
 * Deux vues que seul un compte ADMIN voit :
 *  - la boîte de réception des demandes déposées depuis le site public ;
 *  - les entreprises auditées et leur score de sécurité.
 *
 * Le serveur refuse ces deux lectures à tout autre rôle. L'interface ne fait
 * que présenter ce qu'on lui accorde : elle n'essaie pas de deviner le rôle
 * pour masquer un menu, elle affiche le refus quand il vient.
 */

type Tab = 'requests' | 'organizations' | 'sectors' | 'domains'

const LEVEL_STYLE: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  INFORMATION: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
}

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Nouvelle', IN_PROGRESS: 'En cours', CLOSED: 'Traitée',
}

function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AdminPage() {
  const { notify } = useNotification()
  const [tab, setTab] = useState<Tab>('requests')

  const [requests, setRequests] = useState<ContactRequestRecord[]>([])
  const [inbox, setInbox] = useState<ContactSummary | null>(null)
  const [orgs, setOrgs] = useState<OrganizationOverview[]>([])
  const [sectors, setSectors] = useState<SectorRanking[]>([])
  const [domains, setDomains] = useState<DomainRanking[]>([])
  const [platform, setPlatform] = useState<PlatformSummary | null>(null)

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      // Les quatre lectures partent ensemble : elles sont indépendantes.
      const [r, s, o, p, sec, dom] = await Promise.all([
        contactClient.list(),
        contactClient.summary(),
        adminClient.organizations(),
        adminClient.summary(),
        // Les classements sont secondaires : leur indisponibilité ne doit pas
        // vider la boîte de réception, qui est la vue principale de la page.
        rankingsClient.sectors().catch(() => [] as SectorRanking[]),
        rankingsClient.domains().catch(() => [] as DomainRanking[]),
      ])
      setRequests(r ?? [])
      setInbox(s)
      setOrgs(o ?? [])
      setPlatform(p)
      setSectors(sec ?? [])
      setDomains(dom ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chargement impossible'
      // Un refus d'accès n'est pas une panne : il a sa propre présentation,
      // sinon un RSSI qui atteint l'URL croit à un incident technique.
      if (/403|interdit|réservé|forbidden/i.test(message)) {
        setDenied(true)
      } else {
        setError(message)
        notify(message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const setStatus = async (record: ContactRequestRecord, status: string) => {
    setSavingId(record.id)
    try {
      await contactClient.update(record.id, { status })
      setRequests((list) =>
        list.map((r) => (r.id === record.id ? { ...r, status: status as ContactRequestRecord['status'] } : r)),
      )
      setInbox(await contactClient.summary())
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Mise à jour impossible', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const visibleRequests = useMemo(
    () => (statusFilter ? requests.filter((r) => r.status === statusFilter) : requests),
    [requests, statusFilter],
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin text-brand" size={48} />
      </div>
    )
  }

  if (denied) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-lg border border-border-dark bg-surface-dark p-10 text-center">
          <ShieldAlert className="mx-auto mb-4 text-orange-400" size={36} />
          <h1 className="text-xl font-bold text-white">Espace réservé</h1>
          <p className="mt-3 text-sm text-text-on-dark-muted">
            Cette page rassemble les demandes entrantes et les scores de toutes
            les organisations. Elle est réservée à l&apos;administration de la
            plateforme.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Administration</h1>
        <p className="mt-1 text-sm text-text-on-dark-muted">
          Demandes entrantes et exposition des organisations auditées.
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Demandes en attente" value={inbox?.pending ?? 0} tone="text-orange-400" />
        <Stat label="Demandes de démo" value={inbox?.demos ?? 0} tone="text-brand" />
        <Stat label="Organisations" value={platform?.organizations ?? 0} tone="text-white" />
        <Stat label="Audits évalués" value={platform?.assessedAudits ?? 0} tone="text-emerald-400" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border-dark">
        <Link
          to="/app/admin/projets"
          className="-mb-px inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-brand transition hover:text-white"
        >
          <FolderKanban size={15} /> Projets d’évaluation
        </Link>
        {([
          ['requests', 'Demandes entrantes'],
          ['organizations', 'Entreprises auditées'],
          ['sectors', 'Classement par secteur'],
          ['domains', 'Classement par domaine'],
        ] as [Tab, string][])
          .map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === key
                  ? 'border-brand text-white'
                  : 'border-transparent text-text-on-dark-muted hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
      </div>

      {tab === 'requests' ? (
        <>
          <div className="flex flex-wrap gap-2">
            {[['', 'Toutes'], ['NEW', 'Nouvelles'], ['IN_PROGRESS', 'En cours'], ['CLOSED', 'Traitées']]
              .map(([value, label]) => (
                <button
                  key={value || 'all'}
                  onClick={() => setStatusFilter(value)}
                  aria-pressed={statusFilter === value}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    statusFilter === value
                      ? 'border-brand bg-brand/15 text-white'
                      : 'border-border-dark text-text-on-dark-muted hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
          </div>

          {visibleRequests.length === 0 ? (
            <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
              <Inbox className="mx-auto mb-3 text-text-on-dark-muted" size={32} />
              <p className="text-text-on-dark-muted">Aucune demande dans cette vue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleRequests.map((r) => (
                <article key={r.id} className="rounded-lg border border-border-dark bg-surface-dark p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${
                          r.kind === 'DEMO'
                            ? 'border-brand/40 bg-brand/10 text-brand'
                            : 'border-border-dark text-text-on-dark-muted'
                        }`}>
                          {r.kind === 'DEMO' ? 'Démo' : 'Contact'}
                        </span>
                        <h2 className="text-base font-semibold text-white">{r.fullName}</h2>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-on-dark-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={13} />
                          <a href={`mailto:${r.email}`} className="hover:text-brand">{r.email}</a>
                        </span>
                        {r.phone && (
                          <span className="inline-flex items-center gap-1.5"><Phone size={13} />{r.phone}</span>
                        )}
                        {r.company && (
                          <span className="inline-flex items-center gap-1.5"><Building2 size={13} />{r.company}</span>
                        )}
                        {r.sectorLabel && <span>{r.sectorLabel}</span>}
                        <span>{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {['NEW', 'IN_PROGRESS', 'CLOSED'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(r, s)}
                          disabled={savingId === r.id || r.status === s}
                          className={`rounded border px-2.5 py-1 text-xs font-medium transition disabled:cursor-default ${
                            r.status === s
                              ? 'border-brand bg-brand/15 text-white'
                              : 'border-border-dark text-text-on-dark-muted hover:text-white'
                          }`}
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {r.message && (
                    <p className="mt-3 whitespace-pre-line rounded border border-border-dark bg-black/20 p-3 text-sm text-text-on-dark">
                      {r.message}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      ) : tab === 'sectors' ? (
        <SectorRankingView rows={sectors} />
      ) : tab === 'domains' ? (
        <DomainRankingView rows={domains} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-dark bg-surface-dark">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-border-dark">
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Rang</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Organisation</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Secteur</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Score</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Niveau</th>
                <th className="px-6 py-3 text-right font-semibold text-text-on-dark">Audits</th>
                <th className="px-6 py-3 text-right font-semibold text-text-on-dark">Constats</th>
                <th className="px-6 py-3 text-right font-semibold text-text-on-dark">Crit. / Élevés</th>
                <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Dernière éval.</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-b border-border-dark hover:bg-surface-dark/50">
                  <td className="px-6 py-4">
                    {/* Rang d'exposition : une place haute est une mauvaise
                        nouvelle, pas un palmarès. Le rang sectoriel est le seul
                        vraiment comparable : un hôpital et une association n'ont
                        ni les mêmes obligations ni les mêmes moyens. */}
                    {o.exposureRank == null ? (
                      <span className="text-xs text-text-on-dark-muted">—</span>
                    ) : (
                      <>
                        <span className="font-mono text-base font-bold text-white">
                          #{o.exposureRank}
                        </span>
                        {o.sectorRank != null && (
                          <span className="mt-0.5 block text-xs text-text-on-dark-muted">
                            {o.sectorRank}/{o.sectorPeers} du secteur
                          </span>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-white">{o.name}</span>
                    <span className="mt-0.5 block text-xs text-text-on-dark-muted">
                      {o.userCount} utilisateur(s)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-on-dark-muted">{o.sectorLabel ?? '—'}</td>
                  <td className="px-6 py-4">
                    {/* Jamais évaluée ≠ score nul : afficher 0 la ferait passer
                        pour la mieux notée du tableau. */}
                    {o.riskScore == null ? (
                      <span className="text-xs text-text-on-dark-muted">jamais évaluée</span>
                    ) : (
                      <span className="font-mono text-base font-bold text-brand">{o.riskScore}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {o.riskLevel ? (
                      <span className={`rounded border px-2 py-1 text-xs font-medium ${
                        LEVEL_STYLE[o.riskLevel] ?? 'border-border-dark text-text-on-dark-muted'
                      }`}>
                        {o.riskLevel}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-mono">{o.auditCount}</td>
                  <td className="px-6 py-4 text-right font-mono">{o.findingsCount}</td>
                  <td className="px-6 py-4 text-right font-mono">
                    <span className="text-red-400">{o.criticalCount}</span>
                    <span className="text-text-on-dark-muted"> / </span>
                    <span className="text-orange-400">{o.highCount}</span>
                  </td>
                  <td className="px-6 py-4 text-text-on-dark-muted">{formatDate(o.lastAssessedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {orgs.length === 0 && (
            <div className="p-12 text-center">
              <ExternalLink className="mx-auto mb-3 text-text-on-dark-muted" size={28} />
              <p className="text-text-on-dark-muted">Aucune organisation enregistrée.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Classement sectoriel.
 *
 * La barre représente l'exposition moyenne du secteur : plus elle est longue,
 * plus le secteur est exposé. Un secteur sans organisation évaluée n'a pas de
 * barre : l'afficher à zéro le ferait passer pour le mieux protégé.
 */
function SectorRankingView({ rows }: { rows: SectorRanking[] }) {
  const max = Math.max(1, ...rows.map((r) => r.averageScore ?? 0))

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
        <Layers className="mx-auto mb-3 text-text-on-dark-muted" size={32} />
        <p className="text-text-on-dark-muted">Aucun secteur à classer pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.sector} className="rounded-lg border border-border-dark bg-surface-dark p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-text-on-dark-muted">
                {r.rank == null ? '—' : `#${r.rank}`}
              </span>
              <span className="font-semibold text-white">{r.sectorLabel}</span>
            </div>
            <div className="text-xs text-text-on-dark-muted">
              {r.assessedOrganizations}/{r.organizations} évaluée(s)
              {r.averageScore != null && (
                <span className="ml-3 font-mono text-sm font-bold text-brand">
                  {r.averageScore}
                </span>
              )}
            </div>
          </div>

          {r.averageScore == null ? (
            <p className="mt-2 text-xs text-text-on-dark-muted">
              Aucune organisation évaluée dans ce secteur.
            </p>
          ) : (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                  style={{ width: `${Math.round((r.averageScore / max) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-text-on-dark-muted">
                <span>Meilleure : {r.bestScore}</span>
                <span>Pire : {r.worstScore}</span>
                <span>Impact MEHARI par défaut : {r.defaultImpact}</span>
                <span>Données : {r.defaultDataSensitivity}</span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Classement par domaine, toutes organisations confondues.
 *
 * Les domaines les plus faibles viennent en tête : c'est là qu'il faut agir.
 * Les domaines fondateurs sont signalés : leur faiblesse ne coûte pas seulement
 * leurs propres points, elle plafonne la posture de tout le reste.
 */
function DomainRankingView({ rows }: { rows: DomainRanking[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
        <Network className="mx-auto mb-3 text-text-on-dark-muted" size={32} />
        <p className="text-text-on-dark-muted">Aucun questionnaire exploitable pour le moment.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-on-dark-muted">
          Ce classement se construit à partir des réponses de maturité, sans
          nécessiter le moindre scan technique.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        // 0 à 4 : la largeur exprime la maturité atteinte, pas un pourcentage
        // de progression vers un objectif arbitraire.
        const pct = Math.round((r.averageMaturity / 4) * 100)
        return (
          <div key={r.domain} className="rounded-lg border border-border-dark bg-surface-dark p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-text-on-dark-muted">
                  {r.rank == null ? '—' : `#${r.rank}`}
                </span>
                <span className="font-semibold text-white">{r.domain}</span>
                {r.foundational && (
                  <span className="rounded border border-brand/40 bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                    fondateur
                  </span>
                )}
              </div>
              <div className="text-xs text-text-on-dark-muted">
                {r.postureLabel}
                <span className="ml-3 font-mono text-sm font-bold text-brand">
                  {r.averageMaturity}/4
                </span>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
              <div
                className={`h-full rounded-full ${
                  pct < 40 ? 'bg-red-500' : pct < 65 ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-on-dark-muted">
              <span>{r.assessedAudits} audit(s)</span>
              <span>{r.weakControls} contrôle(s) non tenu(s)</span>
              {r.frameworkRefs.slice(0, 4).map((ref) => (
                <span
                  key={`${ref.framework}-${ref.controlId}`}
                  className="rounded border border-border-dark px-1.5 py-0.5"
                >
                  {ref.framework} {ref.controlId}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
      <p className="text-sm text-text-on-dark-muted">{label}</p>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}
