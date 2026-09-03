import { useEffect, useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { auditsClient, type CreateAuditRequest } from '../../services/auditsClient'
import type { Audit } from '../../types/entities'

/**
 * Création d'un audit.
 *
 * Le code d'audit est proposé automatiquement mais reste modifiable : il sert
 * de référence dans les échanges avec le client, et une organisation a souvent
 * sa propre convention de nommage.
 *
 * Les référentiels sont choisis dès la création parce qu'ils déterminent les
 * questions posées et les contrôles évalués — les retenir plus tard reviendrait
 * à changer la grille en cours d'audit.
 */

interface Props {
  open: boolean
  onClose: () => void
  /** Appelé après création réussie, avec l'audit renvoyé par le serveur. */
  onCreated: (audit: Audit) => void
}

/** Référentiels proposés à la création. Les codes sont ceux attendus côté serveur. */
const FRAMEWORKS = [
  { code: 'ISO27001', label: 'ISO/IEC 27001', hint: 'Système de management de la sécurité' },
  { code: 'NIST_CSF', label: 'NIST CSF', hint: 'Lecture par capacité' },
  { code: 'CIS', label: 'CIS Controls', hint: 'Contrôles priorisés' },
  { code: 'PCI_DSS', label: 'PCI DSS', hint: 'Données de cartes bancaires' },
  { code: 'RGPD', label: 'RGPD', hint: 'Données personnelles' },
]

/** Code lisible et unique par défaut : AUD-2026-4831. */
function suggestCode(): string {
  const year = new Date().getFullYear()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `AUD-${year}-${suffix}`
}

export function NewAuditModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [auditCode, setAuditCode] = useState(suggestCode)
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [frameworks, setFrameworks] = useState<string[]>(['ISO27001'])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Un nouveau code à chaque ouverture : rouvrir le formulaire après une
  // création ne doit pas proposer le code déjà utilisé.
  useEffect(() => {
    if (open) {
      setAuditCode(suggestCode())
      setError(null)
    }
  }, [open])

  // Échap ferme la fenêtre, sauf pendant l'envoi : interrompre une requête en
  // cours laisserait l'utilisateur sans savoir si l'audit a été créé.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, submitting, onClose])

  if (!open) return null

  const toggleFramework = (code: string) => {
    setFrameworks((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
    )
  }

  const dateRangeInvalid = Boolean(startDate && endDate && endDate < startDate)
  const canSubmit =
    title.trim().length > 2 && auditCode.trim().length > 0 && frameworks.length > 0 && !dateRangeInvalid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError(null)

    const request: CreateAuditRequest = {
      auditCode: auditCode.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledStartDate: startDate || undefined,
      scheduledEndDate: endDate || undefined,
      frameworks,
    }

    try {
      const audit = await auditsClient.create(request)
      onCreated(audit)
      // Réinitialisation après succès seulement : en cas d'échec, la saisie
      // doit rester disponible pour être corrigée.
      setTitle('')
      setDescription('')
      setStartDate('')
      setEndDate('')
      setFrameworks(['ISO27001'])
      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "La création a échoué. Vérifiez que le code d'audit n'est pas déjà utilisé."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-audit-title"
      // Le clic sur le fond ferme, mais pas pendant l'envoi.
      onClick={() => { if (!submitting) onClose() }}
    >
      <div
        className="my-auto w-full max-w-2xl rounded-xl border border-border-dark bg-surface-dark shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-border-dark px-6 py-5">
          <div>
            <h2 id="new-audit-title" className="text-lg font-bold text-white">
              Nouvel audit
            </h2>
            <p className="mt-1 text-sm text-text-on-dark-muted">
              Le référentiel choisi détermine les questions posées et les contrôles évalués.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Fermer"
            className="rounded-md p-1.5 text-text-on-dark-muted transition-colors hover:bg-bg-dark hover:text-white disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="audit-title" className="block text-sm font-semibold text-white">
                Nom de l'audit <span className="text-brand">*</span>
              </label>
              <input
                id="audit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={255}
                placeholder="Audit de sécurité — infrastructure de production"
                className="mt-2 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white placeholder:text-text-on-dark-muted/60 focus:border-brand focus:outline-none"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="audit-code" className="block text-sm font-semibold text-white">
                  Code d'audit <span className="text-brand">*</span>
                </label>
                <input
                  id="audit-code"
                  type="text"
                  value={auditCode}
                  onChange={(e) => setAuditCode(e.target.value.toUpperCase())}
                  required
                  maxLength={50}
                  className="mt-2 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 font-mono text-sm text-white focus:border-brand focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-text-on-dark-muted">
                  Référence unique dans votre organisation.
                </p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-white">Période</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="Date de début"
                    className="w-full rounded-md border border-border-dark bg-bg-dark px-2.5 py-2.5 text-sm text-white focus:border-brand focus:outline-none"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="Date de fin"
                    className="w-full rounded-md border border-border-dark bg-bg-dark px-2.5 py-2.5 text-sm text-white focus:border-brand focus:outline-none"
                  />
                </div>
                {dateRangeInvalid && (
                  <p className="mt-1.5 text-xs text-status-critical">
                    La date de fin précède la date de début.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="audit-description" className="block text-sm font-semibold text-white">
                Objectif
              </label>
              <textarea
                id="audit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ce que cet audit doit établir, et pour quel usage."
                className="mt-2 w-full resize-y rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white placeholder:text-text-on-dark-muted/60 focus:border-brand focus:outline-none"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-white">
                Référentiels <span className="text-brand">*</span>
              </legend>
              <p className="mt-1 text-xs text-text-on-dark-muted">
                Plusieurs référentiels peuvent être combinés ; les contrôles communs ne sont
                évalués qu'une fois.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {FRAMEWORKS.map((f) => {
                  const selected = frameworks.includes(f.code)
                  return (
                    <label
                      key={f.code}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                        selected
                          ? 'border-brand bg-brand/10'
                          : 'border-border-dark bg-bg-dark hover:border-border-dark-hover'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleFramework(f.code)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#DC2626]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-white">{f.label}</span>
                        <span className="block text-xs text-text-on-dark-muted">{f.hint}</span>
                      </span>
                    </label>
                  )
                })}
              </div>

              {frameworks.length === 0 && (
                <p className="mt-2 text-xs text-status-critical">
                  Sélectionnez au moins un référentiel.
                </p>
              )}
            </fieldset>
          </div>

          {/* L'erreur reste au-dessus des boutons : c'est là que le regard
              revient après un échec d'envoi. */}
          {error && (
            <div className="mt-5 flex gap-3 rounded-md border border-status-critical/40 bg-status-critical/10 p-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-status-critical" />
              <p className="text-sm text-white">{error}</p>
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border-dark pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-border-dark px-5 py-2.5 text-sm font-semibold text-text-on-dark transition-colors hover:border-border-dark-hover hover:text-white disabled:opacity-40"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Création…' : "Créer l'audit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
