import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Loader, Radar, ShieldCheck, ShieldAlert, Plus, Trash2, Play, RefreshCw,
} from 'lucide-react'
import { scansClient } from '../../services/scansClient'
import { scopesClient, type AuditScope } from '../../services/scopesClient'
import { auditsClient } from '../../services/auditsClient'
import type { Audit, Scan, UUID } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'

/**
 * Scans techniques.
 *
 * <h2>L'ordre imposé par l'écran est celui du droit</h2>
 *
 * <p>Déclarer le périmètre, l'autoriser en citant la pièce qui l'établit, puis
 * seulement lancer un scan. Ce n'est pas une contrainte d'interface : le
 * serveur refuse toute cible qui ne correspond pas à une entrée déclarée
 * <strong>et</strong> autorisée. L'écran rend cette règle visible plutôt que de
 * laisser l'utilisateur se heurter à un refus qu'il ne comprend pas.
 *
 * <p>Le champ de cible n'est donc pas libre : il propose les entrées
 * autorisées. Saisir une adresse arbitraire produirait un 403 motivé, ce qui
 * est le bon comportement mais une mauvaise expérience.
 */

const STATUS_STYLE: Record<string, string> = {
  QUEUED: 'border-border-dark text-text-on-dark-muted',
  RUNNING: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  COMPLETED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  FAILED: 'border-red-500/40 bg-red-500/10 text-red-400',
  CANCELLED: 'border-border-dark text-text-on-dark-muted',
}

const STATUS_LABEL: Record<string, string> = {
  QUEUED: 'En file', RUNNING: 'En cours', COMPLETED: 'Terminé',
  FAILED: 'Échec', CANCELLED: 'Annulé',
}

const PROFILES = [
  { value: 'BASIC', label: 'Rapide', hint: '100 ports courants' },
  { value: 'STANDARD', label: 'Standard', hint: '1000 ports + identification des services' },
  { value: 'FULL', label: 'Complet', hint: '65535 ports — plusieurs dizaines de minutes' },
]

const SCOPE_TYPES = [
  { value: 'IP', label: 'Adresse IP', placeholder: '192.0.2.10' },
  { value: 'CIDR', label: 'Plage CIDR', placeholder: '192.0.2.0/24' },
  { value: 'HOSTNAME', label: "Nom d'hôte", placeholder: 'srv-web.corp.local' },
  { value: 'DOMAIN', label: 'Domaine', placeholder: '*.corp.local' },
]

export function ScansPage() {
  const { notify } = useNotification()
  const [audits, setAudits] = useState<Audit[]>([])
  const [auditId, setAuditId] = useState<UUID | ''>('')
  const [scopes, setScopes] = useState<AuditScope[]>([])
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const [scopeForm, setScopeForm] = useState({ scopeType: 'IP', value: '', notes: '' })
  const [target, setTarget] = useState('')
  const [profile, setProfile] = useState('STANDARD')

  useEffect(() => {
    auditsClient.list()
      .then((d) => {
        const list = Array.isArray(d) ? d : []
        setAudits(list)
        if (list.length > 0) setAuditId(list[0].id)
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!auditId) return
    load(auditId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId])

  /**
   * Rafraîchissement pendant qu'un scan tourne.
   *
   * <p>Un scan dure de quelques secondes à plusieurs dizaines de minutes selon
   * le profil. Sans rafraîchissement, l'écran resterait figé sur « en file » et
   * l'utilisateur croirait à un blocage. La minuterie s'arrête dès qu'aucun
   * scan n'est actif : interroger le serveur en continu sur une page au repos
   * n'apporte rien.
   */
  const hasActive = useMemo(
    () => scans.some((s) => s.status === 'QUEUED' || s.status === 'RUNNING'),
    [scans],
  )

  useEffect(() => {
    if (!auditId || !hasActive) return
    const timer = window.setInterval(() => {
      scansClient.list(auditId as UUID).then((d) => setScans(Array.isArray(d) ? d : [])).catch(() => {})
    }, 4000)
    return () => window.clearInterval(timer)
  }, [auditId, hasActive])

  const load = async (id: UUID) => {
    setLoading(true)
    try {
      const [sc, sk] = await Promise.all([
        scopesClient.list(id).catch(() => [] as AuditScope[]),
        scansClient.list(id).catch(() => [] as Scan[]),
      ])
      setScopes(sc ?? [])
      setScans(sk ?? [])
    } finally {
      setLoading(false)
    }
  }

  const authorizedScopes = useMemo(
    () => scopes.filter((s) => s.authorized && !s.revokedAt),
    [scopes],
  )

  const declareScope = async (e: FormEvent) => {
    e.preventDefault()
    if (!auditId || !scopeForm.value.trim()) return
    setBusy('scope')
    try {
      await scopesClient.declare(auditId as UUID, {
        scopeType: scopeForm.scopeType,
        value: scopeForm.value.trim(),
        notes: scopeForm.notes.trim() || undefined,
      })
      notify('Périmètre déclaré. Il doit encore être autorisé.', 'success')
      setScopeForm({ scopeType: 'IP', value: '', notes: '' })
      await load(auditId as UUID)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Déclaration impossible', 'error')
    } finally {
      setBusy(null)
    }
  }

  const authorize = async (scope: AuditScope) => {
    const reference = window.prompt(
      `Autoriser le scan de ${scope.value} ?\n\n` +
      "Indiquez l'élément qui établit cette autorisation — bon de commande, " +
      'courriel du client, référence de contrat. Il sera conservé dans la piste ' +
      "d'audit et engage celui qui autorise.",
    )
    if (!reference || !reference.trim()) return

    setBusy(scope.id)
    try {
      await scopesClient.authorize(auditId as UUID, scope.id, reference.trim())
      notify('Périmètre autorisé', 'success')
      await load(auditId as UUID)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Autorisation impossible', 'error')
    } finally {
      setBusy(null)
    }
  }

  const revoke = async (scope: AuditScope) => {
    if (!window.confirm(`Retirer ${scope.value} du périmètre ?`)) return
    setBusy(scope.id)
    try {
      await scopesClient.revoke(auditId as UUID, scope.id)
      notify('Périmètre retiré', 'success')
      await load(auditId as UUID)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Retrait impossible', 'error')
    } finally {
      setBusy(null)
    }
  }

  const launch = async (e: FormEvent) => {
    e.preventDefault()
    if (!auditId || !target) return
    setBusy('scan')
    try {
      await scansClient.create({
        auditId: auditId as UUID,
        target,
        scanProfile: profile as 'BASIC' | 'STANDARD' | 'FULL',
      })
      notify('Scan lancé', 'success')
      await load(auditId as UUID)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Lancement impossible', 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin text-brand" size={48} />
      </div>
    )
  }

  if (audits.length === 0) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-lg border border-border-dark bg-surface-dark p-10 text-center">
          <Radar className="mx-auto mb-4 text-text-on-dark-muted" size={32} />
          <h1 className="text-xl font-bold text-white">Aucun audit</h1>
          <p className="mt-3 text-sm text-text-on-dark-muted">
            Un scan appartient toujours à un audit : c&apos;est lui qui porte le
            périmètre autorisé. Créez un audit pour commencer.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Scans techniques</h1>
          <p className="mt-1 text-sm text-text-on-dark-muted">
            Une cible n&apos;est scannée que si elle appartient à un périmètre
            déclaré et autorisé. Toute autre cible est refusée par le serveur.
          </p>
        </div>
        <select
          value={auditId}
          onChange={(e) => setAuditId(e.target.value as UUID)}
          className="rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
        >
          {audits.map((a) => (
            <option key={a.id} value={a.id}>{a.auditCode} — {a.title}</option>
          ))}
        </select>
      </div>

      {/* ---- 1. Périmètre ---- */}
      <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <h2 className="text-lg font-semibold text-white">1 · Périmètre autorisé</h2>
        <p className="mt-1 text-sm text-text-on-dark-muted">
          Déclarer dit ce qu&apos;on veut tester. Autoriser engage celui qui en a
          le droit, en citant la pièce qui l&apos;établit.
        </p>

        <form onSubmit={declareScope} className="mt-4 flex flex-wrap gap-3">
          <select
            value={scopeForm.scopeType}
            onChange={(e) => setScopeForm((f) => ({ ...f, scopeType: e.target.value }))}
            className="rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
          >
            {SCOPE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            value={scopeForm.value}
            onChange={(e) => setScopeForm((f) => ({ ...f, value: e.target.value }))}
            placeholder={SCOPE_TYPES.find((t) => t.value === scopeForm.scopeType)?.placeholder}
            className="flex-1 rounded border border-border-dark bg-black/30 px-3 py-2 font-mono text-sm text-text-on-dark focus:border-brand focus:outline-none"
          />
          <input
            value={scopeForm.notes}
            onChange={(e) => setScopeForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Note (facultatif)"
            className="flex-1 rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy === 'scope' || !scopeForm.value.trim()}
            className="flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            <Plus size={16} /> Déclarer
          </button>
        </form>

        {scopes.length === 0 ? (
          <p className="mt-4 text-sm text-text-on-dark-muted">
            Aucun périmètre déclaré. Aucun scan ne peut être lancé.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {scopes.map((s) => {
              const active = s.authorized && !s.revokedAt
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center gap-3 rounded border border-border-dark bg-black/20 p-3"
                >
                  {active ? (
                    <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                  ) : (
                    <ShieldAlert size={16} className="shrink-0 text-orange-400" />
                  )}
                  <span className="font-mono text-sm text-white">{s.value}</span>
                  <span className="text-xs text-text-on-dark-muted">{s.scopeType}</span>
                  {s.notes && <span className="text-xs text-text-on-dark-muted">{s.notes}</span>}

                  {active ? (
                    <span className="text-xs text-emerald-400">
                      autorisé{s.authorizationReference && ` · ${s.authorizationReference}`}
                    </span>
                  ) : (
                    <span className="text-xs text-orange-400">
                      {s.revokedAt ? 'révoqué' : 'en attente d’autorisation'}
                    </span>
                  )}

                  <div className="ml-auto flex gap-2">
                    {!active && !s.revokedAt && (
                      <button
                        onClick={() => authorize(s)}
                        disabled={busy === s.id}
                        className="rounded border border-border-dark px-2.5 py-1 text-xs font-medium text-text-on-dark-muted transition hover:border-brand hover:text-white disabled:opacity-50"
                      >
                        Autoriser
                      </button>
                    )}
                    <button
                      onClick={() => revoke(s)}
                      disabled={busy === s.id}
                      aria-label="Retirer du périmètre"
                      className="rounded border border-border-dark p-1.5 text-text-on-dark-muted transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ---- 2. Lancer ---- */}
      <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <h2 className="text-lg font-semibold text-white">2 · Lancer un scan</h2>

        {authorizedScopes.length === 0 ? (
          <p className="mt-3 flex gap-2 rounded border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-400">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            Aucune cible autorisée. Déclarez puis autorisez un périmètre ci-dessus.
          </p>
        ) : (
          <form onSubmit={launch} className="mt-4 flex flex-wrap gap-3">
            {/* Le champ est une liste et non une saisie libre : une cible hors
                périmètre serait refusée par le serveur, autant ne pas la
                proposer. */}
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="flex-1 rounded border border-border-dark bg-black/30 px-3 py-2 font-mono text-sm text-text-on-dark focus:border-brand focus:outline-none"
            >
              <option value="">— Cible autorisée —</option>
              {authorizedScopes.map((s) => (
                <option key={s.id} value={s.value}>{s.value} ({s.scopeType})</option>
              ))}
            </select>
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
            >
              {PROFILES.map((p) => (
                <option key={p.value} value={p.value}>{p.label} — {p.hint}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy === 'scan' || !target}
              className="flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              <Play size={16} /> Lancer
            </button>
          </form>
        )}
      </section>

      {/* ---- 3. Historique ---- */}
      <section className="rounded-lg border border-border-dark bg-surface-dark p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">3 · Scans</h2>
          <button
            onClick={() => auditId && load(auditId as UUID)}
            className="flex items-center gap-1.5 text-xs font-medium text-text-on-dark-muted transition hover:text-white"
          >
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>

        {scans.length === 0 ? (
          <p className="mt-3 text-sm text-text-on-dark-muted">Aucun scan sur cet audit.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border-dark text-left">
                  <th className="py-2 font-semibold text-text-on-dark">Cible</th>
                  <th className="py-2 font-semibold text-text-on-dark">Profil</th>
                  <th className="py-2 font-semibold text-text-on-dark">Statut</th>
                  <th className="py-2 font-semibold text-text-on-dark">Durée</th>
                  <th className="py-2 font-semibold text-text-on-dark">Motif</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr key={s.id} className="border-b border-border-dark last:border-0">
                    <td className="py-3 font-mono text-white">{s.target}</td>
                    <td className="py-3 text-text-on-dark-muted">{s.scanProfile}</td>
                    <td className="py-3">
                      <span className={`rounded border px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLE[s.status] ?? 'border-border-dark text-text-on-dark-muted'
                      }`}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-text-on-dark-muted">
                      {s.durationSeconds == null ? '—' : `${s.durationSeconds}s`}
                    </td>
                    {/* Un échec sans motif est indiagnostiquable : le message du
                        serveur est affiché tel quel. */}
                    <td className="py-3 text-xs text-red-400">{s.errorMessage ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
