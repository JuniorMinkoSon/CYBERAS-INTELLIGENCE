import { useEffect, useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { auditsClient, type CreateAuditRequest } from '../../services/auditsClient'
import { postureClient } from '../../services/postureClient'
import type { Audit } from '../../types/entities'

/**
 * Création d'un audit.
 *
 * Le code d'audit est proposé automatiquement mais reste modifiable : il sert
 * de référence dans les échanges avec le client, et une organisation a souvent
 * sa propre convention de nommage.
 *
 * Les référentiels sont choisis dès la création parce qu'ils déterminent la
 * lecture du rapport : le questionnaire est le même pour tous — cent dix-huit
 * questions, dix-huit domaines — et c'est le rapprochement des réponses aux
 * contrôles qui change d'un référentiel à l'autre.
 *
 * <p>Ce commentaire, et la phrase affichée à l'auditeur, disaient que le
 * référentiel « détermine les questions posées ». C'est faux : ni
 * QuestionnaireResource ni QuestionnaireService ne lisent audit.frameworks,
 * qui n'est relu nulle part côté serveur. Un auditeur qui cochait NIST CSF en
 * attendant d'autres questions voyait exactement la même grille.
 */

interface Props {
  open: boolean
  onClose: () => void
  /** Appelé après création réussie, avec l'audit renvoyé par le serveur. */
  onCreated: (audit: Audit) => void
}

/**
 * Les référentiels viennent du serveur, plus d'une liste écrite ici.
 *
 * La liste précédente était figée dans ce fichier sous un commentaire qui
 * affirmait « les codes sont ceux attendus côté serveur ». Deux de ses cinq
 * entrées — PCI_DSS et RGPD — ne figurent dans aucun catalogue : AuditService
 * lève « Référentiel inconnu » sur ces codes. Cocher l'une de ces deux cases
 * faisait donc échouer la création de la mission, sur les deux référentiels
 * que la banque et l'énergie citent en premier.
 *
 * Deux listes finissent toujours par diverger. Celle-ci est désormais servie
 * par /posture/frameworks, qui porte en plus « scorable » : un référentiel
 * sans contrôle en base reste visible mais ne peut pas être coché, avec la
 * raison affichée. Montrer ce qui existe sans laisser le choisir vaut mieux
 * que le cacher — le client voit la trajectoire du produit.
 */
interface FrameworkChoix {
  code: string
  label: string
  hint: string
  selectionnable: boolean
  raison: string | null
}

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
  const [catalogue, setCatalogue] = useState<FrameworkChoix[]>([])

  // Un nouveau code à chaque ouverture : rouvrir le formulaire après une
  // création ne doit pas proposer le code déjà utilisé.
  useEffect(() => {
    if (open) {
      setAuditCode(suggestCode())
      setError(null)
    }
  }, [open])

  // Le catalogue est rechargé à chaque ouverture : un référentiel peut être
  // instruit entre deux missions, et une liste mise en cache annoncerait alors
  // « en préparation » sur un cadre devenu disponible.
  //
  // L'échec n'est pas fatal. Sans catalogue, ISO 27001 reste proposé seul :
  // c'est le socle, il est toujours en base, et une mission peut se créer
  // dessus. Mieux vaut un choix réduit qu'un formulaire bloqué.
  useEffect(() => {
    if (!open) return
    let vivant = true
    postureClient
      .frameworks()
      .then((rep) => {
        if (!vivant) return
        setCatalogue(
          rep.frameworks.map((f) => ({
            code: f.code,
            label: f.name,
            hint: `${f.publisher} — ${f.mappedControlCount} contrôles évalués sur ${f.controlCount}`,
            selectionnable: f.available && f.scorable,
            raison: !f.available
              ? f.lockedReason
              : !f.scorable
                ? (f.dataReason ?? 'Contrôles pas encore rattachés au questionnaire.')
                : null,
          })),
        )
      })
      .catch(() => {
        if (!vivant) return
        setCatalogue([
          {
            code: 'ISO27001',
            label: 'ISO/IEC 27001',
            hint: 'Système de management de la sécurité',
            selectionnable: true,
            raison: null,
          },
        ])
      })
    return () => {
      vivant = false
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

  // Le serveur exige 5 caractères ; en accepter 3 ici laissait passer une
  // saisie que l'API rejetait ensuite. Les deux seuils doivent coïncider,
  // sinon le bouton promet un envoi qui échoue.
  const canSubmit =
    title.trim().length >= 5 && auditCode.trim().length > 0 && frameworks.length > 0 && !dateRangeInvalid

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
              Le questionnaire est le même pour tous les référentiels. Ce choix détermine les
              contrôles auxquels vos réponses seront rapprochées, et donc la lecture du rapport.
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
                placeholder="Audit de sécurité : infrastructure de production"
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
                {catalogue.map((f) => {
                  const selected = frameworks.includes(f.code)
                  return (
                    <label
                      key={f.code}
                      title={f.raison ?? undefined}
                      className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
                        !f.selectionnable
                          ? 'cursor-not-allowed border-border-dark bg-bg-dark opacity-50'
                          : selected
                            ? 'cursor-pointer border-brand bg-brand/10'
                            : 'cursor-pointer border-border-dark bg-bg-dark hover:border-border-dark-hover'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={!f.selectionnable}
                        onChange={() => toggleFramework(f.code)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-white">{f.label}</span>
                        <span className="block text-xs text-text-on-dark-muted">
                          {f.selectionnable ? f.hint : f.raison}
                        </span>
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
