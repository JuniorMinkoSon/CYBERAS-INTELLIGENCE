import { useEffect, useMemo, useState } from 'react'
import {
  Loader, UserPlus, Link2, Copy, Check, Ban, History, Users, ShieldCheck,
} from 'lucide-react'
import {
  invitationsClient,
  type InvitationRecord, type CreatedInvitation,
} from '../../services/invitationsClient'
import { auditTrailClient } from '../../services/auditTrailClient'
import type { AuditEvent } from '../../types/auditTrail'
import { useNotification } from '../../contexts/NotificationContext'

/**
 * Mon organisation : équipe et traçabilité.
 *
 * <p>Cette page appartient au client, pas à la plateforme. Elle rassemble ce
 * qu'une entreprise auditée a besoin de piloter chez elle : qui a accès, par
 * quel lien, et ce qui a été fait.
 *
 * <p>Elle est distincte de l'administration, qui regarde <em>toutes</em> les
 * organisations. Les deux vues étaient confondues sous la même entrée de menu,
 * ce qui présentait à chaque client une page réservée à l'exploitant.
 */

const ROLES = [
  { value: 'RSSI', label: 'RSSI', hint: 'Pilote la sécurité, gère l’équipe et les audits' },
  { value: 'AUDITOR', label: 'Auditeur', hint: 'Mène les audits, saisit les constats' },
  { value: 'VIEWER', label: 'Lecture seule', hint: 'Consulte sans rien modifier' },
  { value: 'ADMIN', label: 'Administrateur', hint: 'Tous les droits, y compris les accès' },
]

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  USED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  EXPIRED: 'border-border-dark text-text-on-dark-muted',
  REVOKED: 'border-red-500/40 bg-red-500/10 text-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente', USED: 'Acceptée', EXPIRED: 'Expirée', REVOKED: 'Révoquée',
}

function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function OrganizationPage() {
  const { notify } = useNotification()
  const [invitations, setInvitations] = useState<InvitationRecord[]>([])
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const [form, setForm] = useState({ role: 'AUDITOR', email: '', validityDays: 7 })
  // Le lien complet n'existe qu'ici : le serveur ne le renverra plus jamais.
  const [fresh, setFresh] = useState<CreatedInvitation | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [inv, evt] = await Promise.all([
        invitationsClient.list(),
        // La traçabilité est secondaire ici : son indisponibilité ne doit pas
        // empêcher la gestion des accès.
        auditTrailClient.listForOrganization(25).catch((): AuditEvent[] => []),
      ])
      setInvitations(inv ?? [])
      setEvents((evt ?? []).slice(0, 25))
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (/403|interdit|seuls les rôles|forbidden/i.test(message)) setDenied(true)
      else notify(message || 'Chargement impossible', 'error')
    } finally {
      setLoading(false)
    }
  }

  const create = async () => {
    setBusy('create')
    try {
      const created = await invitationsClient.create({
        role: form.role,
        email: form.email.trim() || undefined,
        validityDays: form.validityDays,
      })
      setFresh(created)
      setCopied(false)
      setForm((f) => ({ ...f, email: '' }))
      await load()
      notify('Lien créé. Copiez-le maintenant : il ne sera plus affiché.', 'success')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Création impossible', 'error')
    } finally {
      setBusy(null)
    }
  }

  const revoke = async (invitation: InvitationRecord) => {
    if (!window.confirm('Révoquer ce lien ? Il deviendra inutilisable.')) return
    setBusy(invitation.id)
    try {
      await invitationsClient.revoke(invitation.id)
      notify('Lien révoqué', 'success')
      await load()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Révocation impossible', 'error')
    } finally {
      setBusy(null)
    }
  }

  const fullLink = useMemo(
    () => (fresh ? `${window.location.origin}${fresh.path}` : ''),
    [fresh],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullLink)
      setCopied(true)
    } catch {
      // Le presse-papiers est refusé hors contexte sécurisé : le lien reste
      // sélectionnable à la main, ce n'est pas un échec bloquant.
      notify('Copie refusée par le navigateur. Sélectionnez le lien à la main.', 'error')
    }
  }

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
          <ShieldCheck className="mx-auto mb-4 text-orange-400" size={36} />
          <h1 className="text-xl font-bold text-white">Gestion réservée</h1>
          <p className="mt-3 text-sm text-text-on-dark-muted">
            Seuls les rôles Administrateur et RSSI peuvent ouvrir des accès à
            l&apos;équipe : inviter quelqu&apos;un, c&apos;est lui ouvrir les
            données de l&apos;entreprise.
          </p>
        </div>
      </div>
    )
  }

  const pending = invitations.filter((i) => i.status === 'PENDING').length
  const active = invitations.filter((i) => i.status === 'USED').length

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mon organisation</h1>
        <p className="mt-1 text-sm text-text-on-dark-muted">
          Accès de l&apos;équipe et traçabilité des actions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Membres arrivés par invitation" value={active} tone="text-emerald-400" />
        <Stat label="Liens en attente" value={pending} tone="text-blue-400" />
        <Stat label="Événements tracés" value={events.length} tone="text-white" />
      </div>

      {/* ---- Créer un lien ---- */}
      <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <UserPlus size={18} /> Inviter un membre
        </h2>
        <p className="mt-1 text-sm text-text-on-dark-muted">
          La personne invitée choisit elle-même son mot de passe. Rien n&apos;a
          besoin de transiter en clair, et le lien devient inutilisable dès
          qu&apos;il a servi.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
          >
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Destinataire attendu (facultatif)"
            className="flex-1 rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
          />
          <select
            value={form.validityDays}
            onChange={(e) => setForm((f) => ({ ...f, validityDays: Number(e.target.value) }))}
            className="rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
          >
            {[1, 7, 30, 90].map((d) => (
              <option key={d} value={d}>{d} jour{d > 1 ? 's' : ''}</option>
            ))}
          </select>
          <button
            onClick={create}
            disabled={busy === 'create'}
            className="flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            <Link2 size={16} /> Générer le lien
          </button>
        </div>

        <p className="mt-2 text-xs text-text-on-dark-muted">
          {ROLES.find((r) => r.value === form.role)?.hint}
        </p>

        {fresh && (
          <div className="mt-4 rounded border border-brand/40 bg-brand/5 p-4">
            <p className="text-sm font-semibold text-white">
              Lien créé : copiez-le maintenant
            </p>
            <p className="mt-1 text-xs text-text-on-dark-muted">
              Le serveur ne le renverra plus : les relectures n&apos;affichent
              qu&apos;une empreinte, pour qu&apos;une fuite de la liste ne donne
              accès à rien.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto rounded bg-black/40 px-3 py-2 text-xs text-text-on-dark">
                {fullLink}
              </code>
              <button
                onClick={copy}
                className="flex items-center gap-1.5 rounded border border-border-dark px-3 py-2 text-xs font-medium text-text-on-dark-muted transition hover:border-brand hover:text-white"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ---- Liens émis ---- */}
      <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Users size={18} /> Accès ouverts
        </h2>

        {invitations.length === 0 ? (
          <p className="mt-3 text-sm text-text-on-dark-muted">Aucun lien émis.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-border-dark text-left">
                  <th className="py-2 font-semibold text-text-on-dark">Lien</th>
                  <th className="py-2 font-semibold text-text-on-dark">Rôle</th>
                  <th className="py-2 font-semibold text-text-on-dark">Destinataire</th>
                  <th className="py-2 font-semibold text-text-on-dark">État</th>
                  <th className="py-2 font-semibold text-text-on-dark">Émis par</th>
                  <th className="py-2 font-semibold text-text-on-dark">Échéance</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {invitations.map((i) => (
                  <tr key={i.id} className="border-b border-border-dark last:border-0">
                    <td className="py-3 font-mono text-xs text-text-on-dark-muted">{i.codeHint}</td>
                    <td className="py-3 text-white">
                      {ROLES.find((r) => r.value === i.role)?.label ?? i.role}
                    </td>
                    <td className="py-3 text-text-on-dark-muted">
                      {i.usedByEmail ?? i.email ?? '—'}
                    </td>
                    <td className="py-3">
                      <span className={`rounded border px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLE[i.status] ?? 'border-border-dark text-text-on-dark-muted'
                      }`}>
                        {STATUS_LABEL[i.status] ?? i.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-text-on-dark-muted">
                      {i.createdByEmail ?? '—'}
                      <span className="mt-0.5 block">{formatDate(i.createdAt)}</span>
                    </td>
                    <td className="py-3 text-xs text-text-on-dark-muted">
                      {formatDate(i.expiresAt)}
                    </td>
                    <td className="py-3 text-right">
                      {i.status === 'PENDING' && (
                        <button
                          onClick={() => revoke(i)}
                          disabled={busy === i.id}
                          className="inline-flex items-center gap-1.5 rounded border border-border-dark px-2.5 py-1 text-xs font-medium text-text-on-dark-muted transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                        >
                          <Ban size={13} /> Révoquer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-text-on-dark-muted">
          Un lien accepté ou révoqué reste dans cette liste : la traçabilité des
          accès est précisément ce qu&apos;un audit vient vérifier.
        </p>
      </section>

      {/* ---- Traçabilité ---- */}
      <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <History size={18} /> Dernières actions
        </h2>

        {events.length === 0 ? (
          <p className="mt-3 text-sm text-text-on-dark-muted">Aucun événement tracé.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-dark pb-2 text-sm last:border-0"
              >
                <span className="font-mono text-xs text-brand">{e.eventType}</span>
                <span className="text-text-on-dark">{e.resourceType}</span>
                <span className="text-xs text-text-on-dark-muted">{e.action}</span>
                {e.actorEmail && (
                  <span className="text-xs text-text-on-dark-muted">{e.actorEmail}</span>
                )}
                {/* Un événement en échec doit se distinguer d'un succès :
                    c'est souvent lui qui intéresse l'auditeur. */}
                {e.status && e.status !== 'SUCCESS' && (
                  <span className="text-xs font-medium text-orange-400">{e.status}</span>
                )}
                <span className="ml-auto text-xs text-text-on-dark-muted">
                  {formatDate(e.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
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
