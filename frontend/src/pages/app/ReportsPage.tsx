import { useEffect, useMemo, useState } from 'react'
import { Loader, FileDown, Lock, FileText } from 'lucide-react'
import {
  postureClient,
  type PostureReport, type OrganizationalRecommendation, type FrameworkCatalogResponse,
} from '../../services/postureClient'
import { riskClient } from '../../services/riskClient'
import { evidenceClient, type EvidenceItem } from '../../services/evidenceClient'
import { auditsClient } from '../../services/auditsClient'
import type { Audit, Risk, UUID } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'
import './ReportDocument.css'

/**
 * Rapport d'audit.
 *
 * <p>Un document, pas un tableau de bord. Il suit les conventions du rapport
 * d'audit — feuille de tête citable, sections numérotées, échelle répétée — de
 * sorte que le PDF sorte du <strong>même balisage</strong> que l'écran. La
 * bascule vers le noir sur blanc est faite par les jetons de couleur, dans
 * {@code ReportDocument.css} ; il n'existe pas de seconde mise en page à tenir
 * à jour en parallèle.
 *
 * <p>Tout ce qui est affiché vient du serveur. Aucune valeur n'est écrite en
 * dur : un rapport dont un chiffre serait figé dans le code cesserait d'être
 * opposable dès la première évolution du moteur.
 *
 * <p>Il se construit <strong>sans scan technique</strong> : le questionnaire
 * suffit à produire une posture, des axes d'amélioration et un score de
 * conformité. Les constats de scan, quand ils existent, s'y ajoutent.
 */

/** Libellés français des domaines. Le serveur renvoie des codes techniques. */
const DOMAIN_LABEL: Record<string, string> = {
  GOVERNANCE: 'Gouvernance', RISK: 'Analyse de risque', ASSETS: 'Inventaire',
  ACCESS: 'Gestion des accès', NETWORK: 'Réseau', APPLICATIONS: 'Applications',
  VULNERABILITIES: 'Vulnérabilités', DATA: 'Données', DETECTION: 'Détection',
  INCIDENTS: 'Incidents', CONTINUITY: 'Continuité', SUPPLIERS: 'Fournisseurs',
  COMPLIANCE: 'Conformité', HUMAN: 'Facteur humain',
}

const LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const
type Level = (typeof LEVELS)[number]
const LEVEL_LABEL: Record<string, string> = { HIGH: 'Élevé', MEDIUM: 'Moyen', LOW: 'Faible' }

const SEVERITY_LABEL: Record<string, string> = {
  CRITICAL: 'CRITIQUE', HIGH: 'ÉLEVÉ', MEDIUM: 'MOYEN', LOW: 'FAIBLE', INFORMATION: 'INFO',
}

/** Teinte d'une maturité sur l'échelle 0–4. Même seuils partout dans le document. */
function tone(v: number | null | undefined): string {
  if (v == null) return 'med'
  if (v < 1.5) return 'crit'
  if (v < 2) return 'high'
  if (v < 2.6) return 'med'
  return 'low'
}

function severityTone(s?: string | null): string {
  switch (s) {
    case 'CRITICAL': return 'crit'
    case 'HIGH': return 'high'
    case 'MEDIUM': return 'med'
    default: return 'low'
  }
}

/** Largeur d'une barre sur la piste 0–4, exprimée en pourcentage. */
function width(v: number | null | undefined): string {
  return `${Math.max(0, Math.min(100, ((v ?? 0) / 4) * 100))}%`
}

function fr(v: number | null | undefined, digits = 2): string {
  return v == null ? '—' : v.toFixed(digits).replace('.', ',')
}

interface AuditScore {
  score?: number
  level?: string
  findingsCount?: number
  criticalCount?: number
  highCount?: number
}

export function ReportsPage() {
  const { notify } = useNotification()
  const [audits, setAudits] = useState<Audit[]>([])
  const [auditId, setAuditId] = useState<UUID | ''>('')
  const [framework, setFramework] = useState('')

  const [report, setReport] = useState<PostureReport | null>(null)
  const [recos, setRecos] = useState<OrganizationalRecommendation[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [evidence, setEvidence] = useState<EvidenceItem[]>([])
  const [score, setScore] = useState<AuditScore | null>(null)
  const [catalog, setCatalog] = useState<FrameworkCatalogResponse | null>(null)

  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([auditsClient.list(), postureClient.frameworks().catch(() => null)])
      .then(([list, cat]) => {
        const rows = Array.isArray(list) ? list : []
        setAudits(rows)
        setCatalog(cat)
        if (rows.length > 0) setAuditId(rows[0].id)
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!auditId) return
    load(auditId as UUID, framework)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId, framework])

  const load = async (id: UUID, fw: string) => {
    setLoading(true)
    setLocked(null)
    try {
      // Chaque source est indépendante : l'absence de scan ou de pièce ne doit
      // pas empêcher le reste du rapport de s'afficher.
      const [rep, rec, rsk, evd, sc] = await Promise.all([
        postureClient.report(id),
        postureClient.recommendations(id, fw || undefined).catch((e) => {
          // 402 : référentiel hors formule. Le motif du serveur est plus utile
          // qu'une liste vide, qui se lirait comme « aucun écart ».
          setLocked(e instanceof Error ? e.message : 'Référentiel indisponible')
          return [] as OrganizationalRecommendation[]
        }),
        riskClient.listRisks(id).catch(() => [] as Risk[]),
        evidenceClient.list(id).catch(() => [] as EvidenceItem[]),
        riskClient.getAuditScore(id).catch(() => null),
      ])
      setReport(rep)
      setRecos(rec ?? [])
      setRisks(rsk ?? [])
      setEvidence(evd ?? [])
      setScore((sc as AuditScore) ?? null)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Rapport indisponible', 'error')
    } finally {
      setLoading(false)
    }
  }

  const audit = useMemo(() => audits.find((a) => a.id === auditId), [audits, auditId])

  /**
   * Conformité par référentiel.
   *
   * Un référentiel n'a pas de note propre : ce sont les domaines qui sont
   * évalués, et chacun cite les contrôles du référentiel qu'il couvre. La
   * conformité est donc la moyenne des domaines <em>renseignés</em> qui le
   * référencent — compter les domaines sans réponse ferait chuter le score au
   * lieu de le laisser incomplet.
   */
  const compliance = useMemo(() => {
    if (!report) return []
    const codes = new Set<string>()
    report.domains.forEach((d) => d.frameworkRefs.forEach((r) => codes.add(r.framework)))

    return [...codes].map((code) => {
      const related = report.domains.filter(
        (d) => d.maturityScore != null && d.frameworkRefs.some((r) => r.framework === code),
      )
      const avg = related.length
        ? related.reduce((s, d) => s + (d.maturityScore ?? 0), 0) / related.length
        : null
      const option = catalog?.frameworks.find((f) => f.code === code)
      return {
        code,
        name: option?.name ?? code,
        available: option?.available ?? true,
        domains: related.length,
        maturity: avg,
        percent: avg == null ? null : Math.round((avg / 4) * 100),
      }
    }).sort((a, b) => (b.percent ?? -1) - (a.percent ?? -1))
  }, [report, catalog])

  /** Comptage des risques par case de la matrice probabilité × impact. */
  const matrix = useMemo(() => {
    const grid: Record<string, number> = {}
    risks.forEach((r) => {
      if (LEVELS.includes(r.probability as Level) && LEVELS.includes(r.impact as Level)) {
        const key = `${r.probability}-${r.impact}`
        grid[key] = (grid[key] ?? 0) + 1
      }
    })
    return grid
  }, [risks])

  /** Risques distincts : la liste porte le constat, pas ses répétitions. */
  const distinctRisks = useMemo(() => {
    const seen = new Set<string>()
    return risks.filter((r) => {
      const key = `${r.title}|${r.probability}|${r.impact}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [risks])

  const corroborated = useMemo(
    () => evidence.filter((e) => e.corroboration != null),
    [evidence],
  )

  /**
   * Notes de méthode.
   *
   * <p>Elles disent comment les chiffres sont obtenus. C'est ce qui les rend
   * opposables : un score qu'on ne sait pas refaire ne se défend pas devant un
   * client, et une recommandation dont on ignore l'origine ne se priorise pas.
   *
   * <p>Elles sont construites à partir de l'évaluation réelle — le nombre de
   * domaines couverts, les référentiels mobilisés, les pièces pondérées — et
   * non rédigées d'avance.
   */
  const method = useMemo(() => {
    const out: { tag: string; text: React.ReactNode }[] = []
    if (!report) return out

    out.push({
      tag: 'Calcul',
      text: <>
        <strong>Déterministe et reproductible.</strong> Les mêmes réponses et les mêmes
        constats produisent exactement les mêmes chiffres. Chaque score peut être refait
        à la main à partir des pondérations publiées, et défendu devant un tiers.
      </>,
    })

    out.push({
      tag: 'Couverture',
      text: <>
        <strong>{report.domains.length} domaines évalués</strong> sur{' '}
        {report.answeredQuestions} contrôles renseignés, répartis en quatre familles —
        technique, organisationnel, humain et conformité. Le facteur humain est évalué au
        même titre que le reste : c'est par les personnes que passe la majorité des
        compromissions abouties.
      </>,
    })

    out.push({
      tag: 'Corrélation',
      text: <>
        <strong>Les domaines ne sont pas traités comme indépendants.</strong> Une moyenne
        seule laisserait de bons résultats compenser un domaine fondateur en défaut. La
        posture tient compte de l'inventaire, des accès et de la gouvernance : sans eux,
        les progrès réalisés ailleurs ne se traduisent pas en réduction du risque réel.
      </>,
    })

    if (compliance.length > 0) {
      out.push({
        tag: 'Référentiels',
        text: <>
          <strong>{compliance.length} référentiels mobilisés</strong> —{' '}
          {compliance.map((c) => c.name).join(', ')}. Chaque recommandation cite les
          contrôles correspondants, de sorte qu'un écart relevé ici se retrouve
          directement dans une démarche de certification.
        </>,
      })
    }

    if (corroborated.length > 0) {
      out.push({
        tag: 'Preuves',
        text: <>
          <strong>{corroborated.length} pièce{corroborated.length > 1 ? 's' : ''}{' '}
          pondérée{corroborated.length > 1 ? 's' : ''}.</strong> Une déclaration étayée
          pèse plus qu'une déclaration seule : le poids de chaque réponse est corrigé par
          ce que sa pièce démontre réellement. Le niveau déclaré reste affiché tel quel,
          c'est l'écart qui est signalé.
        </>,
      })
    }

    if (distinctRisks.length > 0) {
      out.push({
        tag: 'Contexte',
        text: <>
          <strong>Le risque est contextualisé.</strong> Un même constat ne pèse pas le
          même poids selon la criticité de l'actif touché, son exposition et le secteur
          d'activité de l'organisation — l'impact d'un sinistre dépend de ce que
          l'activité a de précieux, selon l'approche MEHARI.
        </>,
      })
    }

    return out
  }, [report, compliance, corroborated, distinctRisks])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin text-brand" size={48} />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-lg border border-border-dark bg-surface-dark p-10 text-center">
          <FileText className="mx-auto mb-4 text-text-on-dark-muted" size={32} />
          <h1 className="text-xl font-bold text-white">Aucun rapport disponible</h1>
          <p className="mt-3 text-sm text-text-on-dark-muted">
            Créez un audit et répondez au questionnaire de maturité : le rapport se
            construit à partir de là, sans nécessiter de scan technique.
          </p>
        </div>
      </div>
    )
  }

  const completion = Math.round(report.completionRate * 100)

  return (
    <div className="p-6">
      {/* Barre de commande : hors du document, elle n'apparaît pas à l'impression. */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
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
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="rounded border border-border-dark bg-black/30 px-3 py-2 text-sm text-text-on-dark focus:border-brand focus:outline-none"
          >
            <option value="">Tous les référentiels</option>
            {catalog?.frameworks.map((f) => (
              <option key={f.code} value={f.code} disabled={!f.available}>
                {f.name}{f.available ? '' : ' — hors formule'}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <FileDown size={16} />
          Télécharger le PDF
        </button>
      </div>

      {locked && (
        <div className="mb-6 flex gap-2 rounded border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-400 print:hidden">
          <Lock size={16} className="mt-0.5 shrink-0" />
          {locked}
        </div>
      )}

      {/* ------------------------------------------------------------------
          Le document. Ce balisage est celui qui part à l'impression.
          ------------------------------------------------------------------ */}
      <article className="report">

        <header className="r-masthead">
          <div className="r-wordmark">CYBERAS Intelligence · Rapport d&apos;audit</div>
          <h1 className="r-title">{audit?.title ?? 'Rapport d’audit'}</h1>
          <p className="r-sub">
            Audit organisationnel{distinctRisks.length > 0 && ' et technique'}. Le score et
            la posture sont calculés de façon déterministe : les mêmes réponses et les
            mêmes constats produisent les mêmes chiffres, et chaque valeur peut être
            refaite à la main. Aucun modèle génératif n&apos;intervient dans leur calcul.
          </p>

          <dl className="r-refs">
            <div className="r-ref"><dt>Référence</dt><dd>{audit?.auditCode ?? '—'}</dd></div>
            <div className="r-ref"><dt>Statut</dt><dd>{audit?.status ?? '—'}</dd></div>
            <div className="r-ref">
              <dt>Questionnaire</dt>
              <dd>{report.answeredQuestions} / {report.applicableQuestions} · {completion} %</dd>
            </div>
            <div className="r-ref">
              <dt>Constats de scan</dt><dd>{score?.findingsCount ?? distinctRisks.length}</dd>
            </div>
            <div className="r-ref">
              <dt>Pièces au dossier</dt><dd>{evidence.length}</dd>
            </div>
            {catalog && (
              <div className="r-ref"><dt>Formule</dt><dd>{catalog.planLabel}</dd></div>
            )}
          </dl>
        </header>

        {/* --- 1 --- */}
        <section className="r-section">
          <div className="r-sec-head"><span className="r-sec-num">§ 1</span><h2>Synthèse</h2></div>

          <div className="r-verdicts">
            <div className="r-verdict">
              <div className="r-verdict-label">Exposition technique</div>
              <div className="r-figure">
                {score?.score ?? '—'}<span className="r-unit"> / 100</span>
              </div>
              <p className="r-verdict-note">
                {score?.level && (
                  <span className={`r-chip ${severityTone(score.level)}`}>
                    {SEVERITY_LABEL[score.level] ?? score.level}
                  </span>
                )}
                {' '}{score?.findingsCount ?? 0} constat(s)
                {(score?.criticalCount ?? 0) === 0 && (score?.highCount ?? 0) === 0
                  ? ', aucun critique ni élevé.'
                  : `, dont ${score?.criticalCount ?? 0} critique(s) et ${score?.highCount ?? 0} élevé(s).`}
              </p>
            </div>

            <div className="r-verdict">
              <div className="r-verdict-label">Posture de sécurité</div>
              <div className="r-figure">{report.postureLabel}</div>
              <p className="r-verdict-note">
                Maturité pondérée <b>{fr(report.maturityScore)} / 4</b>.{' '}
                {report.postureDescription}
              </p>
            </div>
          </div>

          {report.downgradedByCorrelation && (
            <div className="r-downgrade">
              <p>{report.correlationExplanation}</p>
            </div>
          )}
        </section>

        {/* --- 2 --- */}
        <section className="r-section">
          <div className="r-sec-head">
            <span className="r-sec-num">§ 2</span><h2>Lecture par famille</h2>
          </div>
          <p className="r-lede">
            Les domaines du questionnaire sont regroupés en quatre familles, niveau auquel
            une direction arbitre. Chaque mesure est posée sur la même règle de 0 à 4.
          </p>

          <div className="r-scale-head">
            <span>Famille</span>
            <span className="r-ticks"><span>0</span><span>1</span><span>2</span><span>3</span></span>
            <span style={{ textAlign: 'right' }}>Écarts</span>
          </div>

          <div>
            {[...report.families]
              .sort((a, b) => (b.maturityScore ?? -1) - (a.maturityScore ?? -1))
              .map((f) => (
                <div className="r-row" key={f.family}>
                  <div className="r-row-name">{f.label}</div>
                  <div className="r-track">
                    <div className={`r-bar ${tone(f.maturityScore)}`} style={{ width: width(f.maturityScore) }} />
                  </div>
                  <div className="r-row-val"><b>{fr(f.maturityScore)}</b> · {f.weakControls}</div>
                </div>
              ))}
          </div>

          <p className="r-lede">
            Distribution des {report.answeredQuestions} réponses :{' '}
            {report.histogram.map((b, i) => (
              <span key={b.level}>
                {i > 0 && ' · '}<b>{b.count}</b> en « {b.label.toLowerCase()} »
                {' '}({Math.round(b.share * 100)} %)
              </span>
            ))}. C&apos;est ce que la moyenne cache : deux organisations de même moyenne
            peuvent avoir des profils opposés.
          </p>
        </section>

        {/* --- 3 --- */}
        <section className="r-section">
          <div className="r-sec-head">
            <span className="r-sec-num">§ 3</span><h2>Détail par domaine</h2>
          </div>
          <p className="r-lede">
            Les plus faibles d&apos;abord. Les domaines marqués <span className="r-found">F</span>{' '}
            sont fondateurs : leur faiblesse ne coûte pas seulement leurs propres points,
            elle plafonne la posture de tout le reste.
          </p>

          <div className="r-scale-head">
            <span>Domaine</span>
            <span className="r-ticks"><span>0</span><span>1</span><span>2</span><span>3</span></span>
            <span style={{ textAlign: 'right' }}>Écarts</span>
          </div>

          <div>
            {[...report.domains]
              .sort((a, b) => (a.maturityScore ?? 9) - (b.maturityScore ?? 9))
              .map((d) => (
                <div className="r-row" key={d.domain}>
                  <div className="r-row-name">
                    {DOMAIN_LABEL[d.domain] ?? d.domain}
                    {d.foundational && <span className="r-found">F</span>}
                  </div>
                  <div className="r-track">
                    <div className={`r-bar ${tone(d.maturityScore)}`} style={{ width: width(d.maturityScore) }} />
                  </div>
                  <div className="r-row-val"><b>{fr(d.maturityScore)}</b> · {d.weakControls}</div>
                </div>
              ))}
          </div>
        </section>

        {/* --- 4 --- */}
        <section className="r-section">
          <div className="r-sec-head">
            <span className="r-sec-num">§ 4</span><h2>Conformité par référentiel</h2>
          </div>
          <p className="r-lede">
            Un référentiel n&apos;a pas de note propre : ce sont les domaines qui sont
            évalués, et chacun cite les contrôles qu&apos;il couvre. La conformité est la
            moyenne des domaines renseignés qui le référencent.
          </p>

          <div className="r-scale-head">
            <span>Référentiel</span>
            <span className="r-ticks"><span>0</span><span>1</span><span>2</span><span>3</span></span>
            <span style={{ textAlign: 'right' }}>Couvert.</span>
          </div>

          <div>
            {compliance.map((c) => (
              <div className="r-row" key={c.code}>
                <div className="r-row-name">
                  {c.name}
                  {!c.available && <span className="r-found">HORS FORMULE</span>}
                </div>
                <div className="r-track">
                  <div className={`r-bar ${tone(c.maturity)}`} style={{ width: width(c.maturity) }} />
                </div>
                <div className="r-row-val"><b>{c.percent == null ? '—' : `${c.percent} %`}</b></div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 5 ---
            La section était masquée en l'absence de risque évalué. Un audit
            documentaire ne produisait donc aucune matrice, et le lecteur ne
            pouvait pas distinguer « aucun risque » de « rien n'a été mesuré ».
            Elle est désormais toujours rendue : un livrable doit dire ce qu'il
            ne couvre pas. */}
        <section className="r-section">
          <div className="r-sec-head">
            <span className="r-sec-num">§ 5</span><h2>Cartographie des risques</h2>
          </div>

          {distinctRisks.length === 0 && (
            <p className="r-empty">
              Aucun risque évalué sur cette mission. Les risques se déduisent des
              constats techniques : lancez un scan sur le périmètre déclaré pour
              alimenter cette matrice. L'absence de mesure ne vaut pas absence de
              risque.
            </p>
          )}

          {distinctRisks.length > 0 && (
          <>

            <div className="r-matrix-block">
              <div className="r-matrix">
                <div className="r-axis-y">Probabilité</div>
                {LEVELS.map((p) =>
                  [...LEVELS].reverse().map((i) => {
                    const n = matrix[`${p}-${i}`] ?? 0
                    const weight = { LOW: 0, MEDIUM: 1, HIGH: 2 }
                    const t = n === 0 ? 0 : Math.min(4, weight[p] + weight[i] + 1)
                    return <div className={`r-cell t${t}`} key={`${p}-${i}`}>{n}</div>
                  }),
                )}
                <div className="r-lab-x">
                  {[...LEVELS].reverse().map((i) => <span key={i}>{LEVEL_LABEL[i]}</span>)}
                </div>
                <div className="r-axis-x">Impact</div>
              </div>

              <div>
                <div className="r-table-wrap">
                  <table className="r-table">
                    <thead>
                      <tr>
                        <th>Constat</th><th>Probabilité</th><th>Impact</th>
                        <th className="num">Score</th><th>Gravité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distinctRisks.map((r) => (
                        <tr key={r.id}>
                          <td>{r.title}</td>
                          <td>{LEVEL_LABEL[r.probability] ?? r.probability}</td>
                          <td>{LEVEL_LABEL[r.impact] ?? r.impact}</td>
                          <td className="num">{r.score}</td>
                          <td>
                            <span className={`r-chip ${severityTone(r.severity)}`}>
                              {SEVERITY_LABEL[r.severity] ?? r.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="r-lede" style={{ marginTop: '0.9rem' }}>
                  Un port ouvert n&apos;est pas une vulnérabilité : le scanner observe des
                  services joignables, il ne conclut pas. Un score CVSS n&apos;apparaît que
                  si une vulnérabilité a été identifiée.
                </p>
              </div>
            </div>
          </>
          )}
        </section>

        {/* --- 6 --- */}
        <section className="r-section">
          <div className="r-sec-head">
            <span className="r-sec-num">§ 6</span>
            <h2>Recommandations</h2>
          </div>
          <p className="r-lede">
            Ordonnées par gain attendu — la distance au niveau tenu multipliée par le poids
            du domaine, majorée pour les domaines fondateurs. C&apos;est l&apos;ordre dans
            lequel travailler quand le budget est contraint.
          </p>

          <div className="r-recos">
            {recos.length === 0 ? (
              <p className="r-lede">Aucun écart à signaler sur ce périmètre.</p>
            ) : recos.map((r, i) => (
              <article className="r-reco" key={r.domain}>
                <div className="r-rank">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <h3>
                    {DOMAIN_LABEL[r.domain] ?? r.domain}
                    {r.foundational && <span className="r-found">FONDATEUR</span>}
                    <span className={`r-chip ${severityTone(r.priority)}`}>
                      GAIN {fr(r.expectedGain, 1)}
                    </span>
                  </h3>
                  <dl>
                    <dt>Constat</dt>
                    <dd className="ink">{r.problem}</dd>
                    <dt>Action</dt>
                    <dd>{r.action}</dd>
                    {r.weakQuestions.length > 0 && <>
                      <dt>Questions à améliorer</dt>
                      <dd>
                        <ul className="r-controls">
                          {r.weakQuestions.map((q) => (
                            <li key={q.code}>{q.code} — {q.text} ({q.level}/4)</li>
                          ))}
                        </ul>
                      </dd>
                    </>}
                    {r.frameworkRefs.length > 0 && <>
                      <dt>Référentiels</dt>
                      <dd>
                        <div className="r-refchips">
                          {r.frameworkRefs.map((f) => (
                            <span className="r-refchip" key={`${f.framework}-${f.controlId}`}>
                              {f.framework} · {f.controlId}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </>}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* --- 7 --- */}
        {evidence.length > 0 && (
          <section className="r-section">
            <div className="r-sec-head">
              <span className="r-sec-num">§ {distinctRisks.length > 0 ? 7 : 6}</span>
              <h2>Pièces justificatives</h2>
            </div>
            <p className="r-lede">
              Une réponse au questionnaire est une déclaration ; la pièce jointe est ce qui
              la démontre. Le rapport entre les deux corrige le poids de la réponse. Le
              niveau déclaré n&apos;est jamais remplacé — c&apos;est l&apos;écart qui est
              signalé.
            </p>

            {corroborated.length === 0 ? (
              <div className="r-table-wrap">
                <table className="r-table">
                  <thead>
                    <tr><th>Pièce</th><th>Question</th><th>Démontré</th><th>Analyseur</th></tr>
                  </thead>
                  <tbody>
                    {evidence.map((e) => (
                      <tr key={e.documentId}>
                        <td>{e.fileName}</td>
                        <td>{e.questionCode ?? '—'}</td>
                        <td>{e.evidencedLevel == null ? 'non exploitable' : `${e.evidencedLevel} / 4`}</td>
                        <td>{e.analyzer ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : corroborated.map((e) => (
              <div className="r-corrob" key={e.documentId}>
                <div className="r-file">{e.fileName}</div>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--r-soft)' }}>
                  Versée à l&apos;appui de <b>{e.questionCode}</b>
                  {e.questionText && <> — {e.questionText}</>}
                </p>

                <div className="r-gap-rows">
                  <div className="r-gap-row">
                    <span className="r-gap-label">Déclaré</span>
                    <div className="r-gap-track">
                      <div className="r-gap-fill declared" style={{ width: width(e.declaredLevel) }} />
                    </div>
                    <span className="r-gap-val">{e.declaredLevel} / 4</span>
                  </div>
                  <div className="r-gap-row">
                    <span className="r-gap-label">Démontré</span>
                    <div className="r-gap-track">
                      <div className="r-gap-fill evidenced" style={{ width: width(e.evidencedLevel) }} />
                    </div>
                    <span className="r-gap-val">{e.evidencedLevel} / 4</span>
                  </div>
                </div>

                <div className="r-formula">
                  ratio brut = {e.evidencedLevel} ÷ {e.declaredLevel} = <b>{fr(e.ratio)}</b><br />
                  corroboration = modulée par la confiance de l&apos;analyse
                  {' '}({fr(e.analysisConfidence)}) = <b>{fr(e.corroboration)}</b><br />
                  poids effectif = {e.questionWeight} × {fr(e.corroboration)} ={' '}
                  <b>{fr(e.effectiveWeight)}</b> au lieu de {e.questionWeight}
                </div>

                {e.weightingExplanation && (
                  <p style={{ margin: '1rem 0 0', fontSize: '0.88rem', color: 'var(--r-soft)' }}>
                    {e.weightingExplanation}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* --- 8 --- */}
        <section className="r-section">
          <div className="r-sec-head">
            <span className="r-sec-num">
              § {(distinctRisks.length > 0 ? 7 : 6) + (evidence.length > 0 ? 1 : 0)}
            </span>
            <h2>Méthodologie</h2>
          </div>
          <p className="r-lede">
            Comment ces chiffres sont obtenus. C&apos;est ce qui les rend opposables : un
            score qu&apos;on ne sait pas refaire ne se défend pas.
          </p>

          <div className="r-limits">
            {method.map((m) => (
              <div className="r-limit" key={m.tag}>
                <div className="r-limit-tag">{m.tag}</div>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="r-colophon">
          Rapport produit par CYBERAS Intelligence à partir du questionnaire de maturité
          {distinctRisks.length > 0 && ' et des constats de scan'}. Scores déterministes et
          reproductibles. Les recommandations sont dérivées des contrôles non tenus, jamais
          rédigées par un modèle génératif. Moteur de risque {' '}
          {report.posture ? 'RiskEngine 1.0.0' : ''}.
        </footer>

      </article>
    </div>
  )
}
