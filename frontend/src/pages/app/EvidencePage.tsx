import { useEffect, useMemo, useState } from 'react'
import { Loader, FolderOpen, Sparkles, AlertTriangle, FileText, Scale, Upload } from 'lucide-react'
import { evidenceClient, type EvidenceItem } from '../../services/evidenceClient'
import { auditsClient } from '../../services/auditsClient'
import type { Audit, UUID } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'

/**
 * Dossier de preuves.
 *
 * Rassemble toutes les pièces versées pendant l'audit. Elles étaient déposées
 * puis invisibles : plus rien ne les montrait une fois l'attachement fait.
 *
 * Chaque pièce affiche le niveau **déclaré** et le niveau **démontré** côte à
 * côte. Le premier n'est jamais remplacé par le second — c'est l'écart qui
 * informe, et le masquer reviendrait à substituer un jugement automatique à une
 * déclaration humaine sans le dire.
 */

function formatSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
  return `${Math.round(bytes / 1024)} Ko`
}

function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Couleur d'un niveau de maturité sur l'échelle 0-4. */
function levelTone(level?: number) {
  if (level == null) return 'text-text-on-dark-muted'
  if (level >= 3) return 'text-emerald-400'
  if (level === 2) return 'text-yellow-400'
  return 'text-orange-400'
}

export function EvidencePage() {
  const { notify } = useNotification()
  const [audits, setAudits] = useState<Audit[]>([])
  const [auditId, setAuditId] = useState<UUID | ''>('')
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    auditsClient.list()
      .then((d) => {
        const list = Array.isArray(d) ? d : []
        setAudits(list)
        // Un seul audit : le choix n'a pas à être demandé.
        if (list.length > 0) setAuditId(list[0].id)
        else setLoading(false)
      })
      .catch(() => { setAudits([]); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!auditId) return
    load(auditId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId])

  const load = async (id: UUID) => {
    setLoading(true)
    setError(null)
    try {
      const data = await evidenceClient.list(id)
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chargement impossible'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const analyze = async (force: boolean) => {
    if (!auditId) return
    setAnalyzing(true)
    try {
      const s = await evidenceClient.analyze(auditId, force)
      notify(
        `${s.analyzed} pièce(s) analysée(s)` +
        (s.unusable > 0 ? `, ${s.unusable} inexploitable(s)` : '') +
        ` — ${s.analyzer}`,
        'success',
      )
      await load(auditId)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Analyse impossible', 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  /**
   * Verse une piece au dossier.
   *
   * L'analyse suit immediatement le depot : une piece deposee puis laissee sans
   * note reste sans effet sur la ponderation, et l'utilisateur n'a aucune
   * raison de deviner qu'un second geste est necessaire.
   */
  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !auditId) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await evidenceClient.upload(auditId as UUID, file)
      }
      await evidenceClient.analyze(auditId as UUID, false)
      notify(
        files.length === 1
          ? 'Piece versee et analysee'
          : `${files.length} pieces versees et analysees`,
        'success',
      )
      await load(auditId as UUID)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Televersement impossible', 'error')
    } finally {
      setUploading(false)
    }
  }

  const stats = useMemo(() => ({
    total: items.length,
    analyzed: items.filter((i) => i.evidencedLevel != null).length,
    pending: items.filter((i) => i.evidencedLevel == null).length,
    gaps: items.filter((i) => i.underEvidenced).length,
  }), [items])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin text-brand" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dossier de preuves</h1>
          <p className="mt-1 text-sm text-text-on-dark-muted">
            Pièces versées pendant l&apos;audit, et écart entre ce qui est déclaré
            et ce que chaque pièce démontre.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={auditId}
            onChange={(e) => setAuditId(e.target.value as UUID)}
            className="rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
          >
            {audits.map((a) => (
              <option key={a.id} value={a.id}>{a.auditCode} — {a.title}</option>
            ))}
          </select>
          {/* Le champ natif est masque derriere un libelle : un <input file>
              brut ne se met pas au format du reste de la barre d'actions. */}
          <label className={`flex cursor-pointer items-center gap-2 rounded border border-border-dark px-4 py-2 text-sm font-medium transition ${
            uploading ? 'opacity-50' : 'text-text-on-dark hover:border-brand hover:text-white'
          }`}>
            <Upload size={16} />
            {uploading ? 'Televersement...' : 'Verser une piece'}
            <input
              type="file"
              multiple
              className="hidden"
              disabled={uploading || !auditId}
              onChange={(e) => { upload(e.target.files); e.target.value = '' }}
            />
          </label>
          <button
            onClick={() => analyze(false)}
            disabled={analyzing || !auditId}
            className="flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            <Sparkles size={16} className={analyzing ? 'animate-pulse' : ''} />
            Analyser les pièces
          </button>
          {stats.analyzed > 0 && (
            <button
              onClick={() => analyze(true)}
              disabled={analyzing}
              title="Réanalyser aussi les pièces déjà notées"
              className="rounded border border-border-dark px-4 py-2 text-sm font-medium text-text-on-dark-muted transition hover:text-white disabled:opacity-50"
            >
              Tout réanalyser
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Pièces au dossier" value={stats.total} tone="text-white" />
        <Stat label="Analysées" value={stats.analyzed} tone="text-emerald-400" />
        <Stat label="En attente d'analyse" value={stats.pending} tone="text-text-on-dark-muted" />
        <Stat label="Écarts signalés" value={stats.gaps} tone="text-orange-400" />
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <FolderOpen className="mx-auto mb-3 text-text-on-dark-muted" size={32} />
          <p className="text-text-on-dark-muted">Aucune pièce versée à cet audit.</p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-text-on-dark-muted">
            Les pièces se joignent depuis le questionnaire, en regard de la
            question qu&apos;elles étayent.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.documentId}
              className={`rounded-lg border bg-surface-dark p-5 ${
                item.underEvidenced ? 'border-orange-500/40' : 'border-border-dark'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <FileText size={18} className="mt-0.5 shrink-0 text-text-on-dark-muted" />
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-white">{item.fileName}</h2>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-on-dark-muted">
                      <span>{formatSize(item.sizeBytes)}</span>
                      <span>{formatDate(item.uploadedAt)}</span>
                      {item.familyLabel && <span>{item.familyLabel}</span>}
                      {item.questionCode && <span>{item.questionCode}</span>}
                    </div>
                  </div>
                </div>

                {item.underEvidenced && (
                  <span className="inline-flex items-center gap-1.5 rounded border border-orange-500/40 bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-400">
                    <AlertTriangle size={13} /> Écart déclaré / démontré
                  </span>
                )}
              </div>

              {item.questionText && (
                <p className="mt-3 border-l-2 border-border-dark pl-3 text-sm text-text-on-dark-muted">
                  {item.questionText}
                </p>
              )}

              {/* Déclaré et démontré côte à côte : c'est l'écart qui informe. */}
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Cell label="Niveau déclaré"
                      value={item.declaredLevel == null ? '—' : `${item.declaredLevel}/4`}
                      tone={levelTone(item.declaredLevel)} />
                <Cell label="Démontré par la pièce"
                      value={item.evidencedLevel == null ? 'non analysée' : `${item.evidencedLevel}/4`}
                      tone={levelTone(item.evidencedLevel)} />
                <Cell label="Corroboration"
                      value={item.corroboration == null ? '—' : `${Math.round(item.corroboration * 100)} %`}
                      tone={
                        item.corroboration == null ? 'text-text-on-dark-muted'
                        : item.corroboration >= 0.9 ? 'text-emerald-400'
                        : item.corroboration >= 0.6 ? 'text-yellow-400' : 'text-orange-400'
                      } />
                <Cell label="Poids effectif"
                      value={
                        item.effectiveWeight == null
                          ? '—'
                          : `${item.effectiveWeight} / ${item.questionWeight ?? '?'}`
                      }
                      tone="text-brand" />
              </div>

              {item.weightingExplanation && (
                <p className="mt-3 flex gap-2 rounded border border-border-dark bg-black/20 p-3 text-sm text-text-on-dark">
                  <Scale size={15} className="mt-0.5 shrink-0 text-text-on-dark-muted" />
                  {item.weightingExplanation}
                </p>
              )}

              {item.analysisRationale && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-text-on-dark-muted hover:text-white">
                    Motif de l&apos;analyse
                    {item.analysisConfidence != null &&
                      ` · confiance ${Math.round(item.analysisConfidence * 100)} %`}
                    {item.analyzer && ` · ${item.analyzer}`}
                  </summary>
                  <p className="mt-2 text-sm text-text-on-dark-muted">{item.analysisRationale}</p>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
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

function Cell({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded border border-border-dark bg-black/20 p-3">
      <p className="text-xs text-text-on-dark-muted">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${tone}`}>{value}</p>
    </div>
  )
}
