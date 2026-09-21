import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { X, Loader } from 'lucide-react'
import { assetsClient, type CreateAssetRequest } from '../../services/assetsClient'
import { auditsClient } from '../../services/auditsClient'
import type { Asset, Audit, UUID } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'

/**
 * Configuration d'un actif.
 *
 * Les quatre champs qui comptent pour l'évaluation du risque sont la criticité,
 * l'environnement, l'exposition Internet et le type. Ce sont eux qui font qu'une
 * même vulnérabilité ne pèse pas pareil sur un serveur de production exposé et
 * sur une machine de laboratoire isolée : c'est exactement ce que le moteur de
 * risque attend en entrée, et ce qui manquait tant que l'inventaire n'était pas
 * saisissable.
 */

const ASSET_TYPES = [
  { value: 'SERVER', label: 'Serveur' },
  { value: 'WORKSTATION', label: 'Poste de travail' },
  { value: 'NETWORK', label: 'Équipement réseau' },
  { value: 'APPLICATION', label: 'Application' },
  { value: 'DATABASE', label: 'Base de données' },
  { value: 'CLOUD', label: 'Ressource cloud' },
  { value: 'IOT', label: 'Objet connecté' },
  { value: 'OTHER', label: 'Autre' },
]

const ENVIRONMENTS = [
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'PREPRODUCTION', label: 'Préproduction' },
  { value: 'TEST', label: 'Recette' },
  { value: 'DEVELOPMENT', label: 'Développement' },
]

/** L'ordre est croissant : il porte la sémantique du sélecteur. */
const CRITICALITIES = [
  { value: 'LOW', label: 'Faible', hint: "L'indisponibilité est sans effet notable", color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { value: 'MEDIUM', label: 'Moyenne', hint: 'Gêne le service sans le bloquer', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
  { value: 'HIGH', label: 'Haute', hint: "Interrompt une activité de l'entreprise", color: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
  { value: 'CRITICAL', label: 'Critique', hint: "Arrête l'activité ou expose des données sensibles", color: 'text-red-400 border-red-500/40 bg-red-500/10' },
]

interface Props {
  /** Actif à modifier ; absent pour une création. */
  asset?: Asset | null
  /** Audit présélectionné, quand la page en cible déjà un. */
  auditId?: UUID
  onClose: () => void
  onSaved: () => void
}

export function AssetForm({ asset, auditId, onClose, onSaved }: Props) {
  const { notify } = useNotification()
  const editing = Boolean(asset)

  const [audits, setAudits] = useState<Audit[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<CreateAssetRequest>({
    auditId: asset?.auditId ?? auditId ?? ('' as UUID),
    hostname: asset?.hostname ?? '',
    ipAddress: asset?.ipAddress ?? '',
    assetType: asset?.assetType ?? 'SERVER',
    operatingSystem: asset?.operatingSystem ?? '',
    environment: asset?.environment ?? 'PRODUCTION',
    criticality: asset?.criticality ?? 'MEDIUM',
    internetExposed: asset?.internetExposed ?? false,
    owner: asset?.owner ?? '',
    description: asset?.description ?? '',
  })

  // Un actif appartient toujours à un audit : sans la liste, le formulaire ne
  // peut pas être soumis. Elle est chargée dès l'ouverture.
  useEffect(() => {
    auditsClient
      .list()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setAudits(list)
        // Un seul audit ouvert : le choix n'a pas à être demandé.
        setForm((f) => (f.auditId || list.length !== 1 ? f : { ...f, auditId: list[0].id }))
      })
      .catch(() => setAudits([]))
  }, [])

  const set = <K extends keyof CreateAssetRequest>(key: K, value: CreateAssetRequest[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.auditId) {
      setError("Sélectionnez l'audit auquel rattacher cet actif.")
      return
    }
    // Un actif sans hostname ni IP ne peut être rapproché d'aucun scan : le
    // rattachement des constats se fait sur l'un ou l'autre.
    if (!form.hostname?.trim() && !form.ipAddress?.trim()) {
      setError('Renseignez au moins un nom d’hôte ou une adresse IP.')
      return
    }

    setSaving(true)
    try {
      // Les champs laissés vides sont envoyés nuls plutôt que chaînes vides :
      // une chaîne vide traverserait les contrôles et s'afficherait comme une
      // donnée saisie.
      const payload: CreateAssetRequest = {
        ...form,
        hostname: form.hostname?.trim() || undefined,
        ipAddress: form.ipAddress?.trim() || undefined,
        operatingSystem: form.operatingSystem?.trim() || undefined,
        owner: form.owner?.trim() || undefined,
        description: form.description?.trim() || undefined,
      }

      if (editing && asset) {
        await assetsClient.update(asset.id, payload)
        notify('Actif mis à jour', 'success')
      } else {
        await assetsClient.create(payload)
        notify('Actif ajouté à l’inventaire', 'success')
      }
      onSaved()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Enregistrement impossible'
      setError(message)
      notify(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const field = 'w-full rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none'
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-text-on-dark-muted'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl rounded-lg border border-border-dark bg-surface-dark shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border-dark px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {editing ? 'Configurer l’actif' : 'Nouvel actif'}
          </h2>
          <button type="button" onClick={onClose} className="text-text-on-dark-muted hover:text-white" aria-label="Fermer">
            <X size={20} />
          </button>
        </header>

        <div className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className={label} htmlFor="asset-audit">Audit de rattachement</label>
            <select
              id="asset-audit"
              className={field}
              value={form.auditId}
              onChange={(e) => set('auditId', e.target.value as UUID)}
              disabled={editing}
            >
              <option value="">Sélectionner</option>
              {audits.map((a) => (
                <option key={a.id} value={a.id}>{a.auditCode} : {a.title}</option>
              ))}
            </select>
            {editing && (
              <p className="mt-1 text-xs text-text-on-dark-muted">
                Le rattachement ne se modifie pas : les constats déjà produits y font référence.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="asset-hostname">Nom d&apos;hôte</label>
              <input id="asset-hostname" className={field} value={form.hostname}
                onChange={(e) => set('hostname', e.target.value)} placeholder="srv-web-01.corp.local" />
            </div>
            <div>
              <label className={label} htmlFor="asset-ip">Adresse IP</label>
              <input id="asset-ip" className={`${field} font-mono`} value={form.ipAddress}
                onChange={(e) => set('ipAddress', e.target.value)} placeholder="192.168.10.20" />
            </div>
          </div>
          <p className="-mt-3 text-xs text-text-on-dark-muted">
            L&apos;un des deux au moins : c&apos;est ce qui permet de rattacher les constats d&apos;un scan à cet actif.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="asset-type">Type</label>
              <select id="asset-type" className={field} value={form.assetType}
                onChange={(e) => set('assetType', e.target.value)}>
                {ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="asset-env">Environnement</label>
              <select id="asset-env" className={field} value={form.environment}
                onChange={(e) => set('environment', e.target.value)}>
                {ENVIRONMENTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* La criticité est présentée en boutons plutôt qu'en liste : c'est le
              champ qui pèse le plus lourd dans le calcul du risque, et son sens
              se lit mal dans un menu déroulant. */}
          <fieldset>
            <legend className={label}>Criticité métier</legend>
            <div className="grid gap-2 sm:grid-cols-4">
              {CRITICALITIES.map((c) => {
                const active = form.criticality === c.value
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set('criticality', c.value)}
                    aria-pressed={active}
                    title={c.hint}
                    className={`rounded border px-3 py-2 text-sm font-semibold transition ${
                      active ? c.color : 'border-border-dark text-text-on-dark-muted hover:border-brand/60'
                    }`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-text-on-dark-muted">
              {CRITICALITIES.find((c) => c.value === form.criticality)?.hint}
            </p>
          </fieldset>

          <label className="flex items-start gap-3 rounded border border-border-dark p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-brand"
              checked={Boolean(form.internetExposed)}
              onChange={(e) => set('internetExposed', e.target.checked)}
            />
            <span className="text-sm text-text-on-dark">
              Exposé sur Internet
              <span className="mt-0.5 block text-xs text-text-on-dark-muted">
                Une même vulnérabilité est plus urgente sur une machine joignable
                depuis l&apos;extérieur : cette case pèse directement sur le score de risque.
              </span>
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="asset-os">Système d&apos;exploitation</label>
              <input id="asset-os" className={field} value={form.operatingSystem}
                onChange={(e) => set('operatingSystem', e.target.value)} placeholder="Debian 12" />
            </div>
            <div>
              <label className={label} htmlFor="asset-owner">Responsable</label>
              <input id="asset-owner" className={field} value={form.owner}
                onChange={(e) => set('owner', e.target.value)} placeholder="Équipe infrastructure" />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="asset-desc">Description</label>
            <textarea id="asset-desc" rows={2} className={field} value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Rôle de la machine, données hébergées…" />
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-border-dark px-6 py-4">
          <button type="button" onClick={onClose}
            className="rounded border border-border-dark px-4 py-2 text-sm text-text-on-dark-muted transition hover:text-white">
            Annuler
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
            {saving && <Loader size={16} className="animate-spin" />}
            {editing ? 'Enregistrer' : 'Ajouter'}
          </button>
        </footer>
      </form>
    </div>
  )
}
