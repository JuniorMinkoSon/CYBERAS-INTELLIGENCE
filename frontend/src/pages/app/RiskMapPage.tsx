import { useEffect, useMemo, useState } from 'react'
import { Loader } from 'lucide-react'
import { riskClient } from '../../services/riskClient'
import type { Risk } from '../../types/entities'
import { useNotification } from '../../contexts/NotificationContext'
import { RiskMatrix } from './RiskMatrix'
import {
  answerProjectionClient,
  agregerParFamille,
  LIBELLES_FAMILLE,
} from '../../services/answerProjectionClient'
import {
  riskCartographyClient,
  agregerParCategorie,
  LIBELLES_MEHARI,
  PORTEES_MEHARI,
} from '../../services/riskCartographyClient'

const SEVERITY_COLORS = {
  LOW: 'bg-blue-500/10 text-blue-400',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400',
  HIGH: 'bg-orange-500/10 text-orange-400',
  CRITICAL: 'bg-red-500/10 text-red-400',
}

export function RiskMapPage() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Case retenue dans la matrice : filtre la liste sans recharger le serveur.
  const [cell, setCell] = useState<{ probability: 'LOW'|'MEDIUM'|'HIGH'; impact: 'LOW'|'MEDIUM'|'HIGH' } | null>(null)
  // Ecarts declares, par famille : l'autre origine des risques. La matrice
  // ci-dessous restitue les risques evalues ; cette bande dit d'ou ils
  // viennent du cote des reponses, et ce qui reste a evaluer.
  const [ecarts, setEcarts] = useState<ReturnType<typeof agregerParFamille>>([])
  // Cartographie MEHARI, alimentee par le flux d'evenements de scan : l'autre
  // moitie de la lecture. Les ecarts ci-dessus sont ce que l'organisation
  // declare, celle-ci est ce que ses machines exposent.
  const [mehari, setMehari] = useState<ReturnType<typeof agregerParCategorie>>([])
  const { notify } = useNotification()

  useEffect(() => {
    loadRisks()
  }, [])

  const loadRisks = async () => {
    setLoading(true)
    try {
      const [data, projection, telemetrie] = await Promise.all([
        riskClient.listRisks(),
        // Les deux projections sont des complements : leur absence ne doit pas
        // empecher la cartographie de s'afficher.
        answerProjectionClient.forOrganization().catch(() => []),
        riskCartographyClient.forOrganization().catch(() => []),
      ])
      setRisks(Array.isArray(data) ? data : [])
      setEcarts(agregerParFamille(Array.isArray(projection) ? projection : []))
      setMehari(agregerParCategorie(Array.isArray(telemetrie) ? telemetrie : []))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const visible = useMemo(() => {
    if (!cell) return risks
    return risks.filter((r) => r.probability === cell.probability && r.impact === cell.impact)
  }, [risks, cell])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-brand" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Cartographie des Risques</h1>

      {error && (
        <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {/* Les deux origines, cote a cote : ce que les scans ont observe, ce que
          l'organisation a declare. Les lire separement evite de confondre une
          faiblesse constatee sur une machine avec une faiblesse admise dans un
          questionnaire — elles n'appellent pas la meme action. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CartographieMehari categories={mehari} />
        <EcartsDeclares familles={ecarts} />
      </div>

      {risks.length === 0 ? (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-12 text-center">
          <p className="text-text-on-dark-muted">Aucun risque</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
              <p className="text-text-on-dark-muted text-sm">Risques critiques</p>
              <p className="text-2xl font-bold text-red-400">
                {risks.filter(r => r.severity === 'CRITICAL').length}
              </p>
            </div>
            <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
              <p className="text-text-on-dark-muted text-sm">Risques élevés</p>
              <p className="text-2xl font-bold text-orange-400">
                {risks.filter(r => r.severity === 'HIGH').length}
              </p>
            </div>
            <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
              <p className="text-text-on-dark-muted text-sm">Risques moyens</p>
              <p className="text-2xl font-bold text-yellow-400">
                {risks.filter(r => r.severity === 'MEDIUM').length}
              </p>
            </div>
            <div className="rounded-lg border border-border-dark bg-surface-dark p-4">
              <p className="text-text-on-dark-muted text-sm">Score moyen</p>
              <p className="text-2xl font-bold text-brand">
                {risks.length > 0 ? (risks.reduce((sum, r) => sum + r.score, 0) / risks.length).toFixed(1) : '0'}
              </p>
            </div>
          </div>

          <RiskMatrix risks={risks} selected={cell} onSelect={setCell} />

          <div className="overflow-x-auto rounded-lg border border-border-dark bg-surface-dark">
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Titre</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Probabilité</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Impact</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Score</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Sévérité</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Responsable</th>
                  <th className="px-6 py-3 text-left font-semibold text-text-on-dark">Statut</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((risk) => (
                  <tr key={risk.id} className="border-b border-border-dark hover:bg-surface-dark/50">
                    <td className="px-6 py-4">{risk.title}</td>
                    <td className="px-6 py-4">{risk.probability}</td>
                    <td className="px-6 py-4">{risk.impact}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-brand">{risk.score}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        SEVERITY_COLORS[risk.severity as keyof typeof SEVERITY_COLORS]
                      }`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">{risk.responsible || '-'}</td>
                    <td className="px-6 py-4">{risk.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Ecarts declares, par famille de domaines.
 *
 * <p>La matrice qui suit porte les risques evalues : ce que l'analyse a
 * retenu. Cette bande porte ce que l'organisation a declare elle-meme dans ses
 * questionnaires, la ou sa reponse est restee sous le seuil de faiblesse.
 * Deux lectures d'une meme realite, et l'ecart entre elles se voit.
 *
 * <p>Absente tant qu'aucune reponse n'existe : une rangee de zeros laisserait
 * croire a une organisation sans faiblesse alors qu'elle n'a rien renseigne.
 */
function EcartsDeclares({ familles }: { familles: ReturnType<typeof agregerParFamille> }) {
  const avecEcarts = familles.filter((f) => f.ecarts > 0)
  if (familles.length === 0) return null

  return (
    <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-white">Écarts déclarés par famille</h2>
        <p className="text-xs text-text-on-dark-muted mt-1">
          Réponses aux questionnaires situées sous le seuil de maturité attendu. Ce sont les
          points d'où partent les recommandations.
        </p>
      </div>

      {avecEcarts.length === 0 ? (
        <p className="text-sm text-text-on-dark-muted">
          Aucun écart sous le seuil sur les {familles.reduce((n, f) => n + f.repondues, 0)} réponses
          enregistrées.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {avecEcarts.map((f) => (
            <div key={f.famille} className="rounded-lg border border-border-dark bg-black/20 p-4">
              <p className="text-sm font-medium text-text-on-dark">
                {LIBELLES_FAMILLE[f.famille] ?? f.famille}
              </p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{f.ecarts}</p>
              <p className="text-xs text-text-on-dark-muted mt-1">
                sur {f.repondues} réponse{f.repondues > 1 ? 's' : ''}
                {f.maturiteMoyenne !== null && ` · maturité ${f.maturiteMoyenne.toFixed(1)}/4`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TEINTE_NIVEAU: Record<string, { texte: string; fond: string }> = {
  CRITICAL: { texte: 'text-red-400', fond: 'bg-red-500/10' },
  HIGH: { texte: 'text-orange-400', fond: 'bg-orange-500/10' },
  MEDIUM: { texte: 'text-yellow-400', fond: 'bg-yellow-500/10' },
  LOW: { texte: 'text-blue-400', fond: 'bg-blue-500/10' },
}

/**
 * Cartographie MEHARI, derivee des scans.
 *
 * <p>MEHARI type le risque par service de securite menace plutot que par
 * vulnerabilite brute : ce n'est pas la meme lecture que la matrice
 * probabilite/impact plus bas, et les deux se completent. La matrice dit
 * quels risques ont ete retenus ; ceci dit ce que les scans ont effectivement
 * vu, et sur quel pilier.
 *
 * <p>Le niveau affiche est le pire observe dans la categorie, jamais une
 * moyenne : une case critique noyee dans dix cases faibles reste critique.
 */
function CartographieMehari({ categories }: { categories: ReturnType<typeof agregerParCategorie> }) {
  if (categories.length === 0) return null

  return (
    <div className="rounded-lg border border-border-dark bg-surface-dark p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-white">Observé par les scans</h2>
        <p className="text-xs text-text-on-dark-muted mt-1">
          Constats classés par service de sécurité menacé (MEHARI). Le niveau retenu est le plus
          élevé observé dans la catégorie.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((c) => {
          const t = TEINTE_NIVEAU[c.niveau] ?? TEINTE_NIVEAU.LOW
          return (
            <div key={c.categorie} className="rounded-lg border border-border-dark bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-on-dark">
                    {LIBELLES_MEHARI[c.categorie] ?? c.categorie}
                  </p>
                  <p className="text-xs text-text-on-dark-muted mt-0.5">
                    {PORTEES_MEHARI[c.categorie] ?? ''}
                  </p>
                </div>
                <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${t.fond} ${t.texte}`}>
                  {c.niveau}
                </span>
              </div>
              <p className="text-xs text-text-on-dark-muted mt-2">
                {c.occurrences} constat{c.occurrences > 1 ? 's' : ''}
                {c.protocoles.length > 0 && ` · ${c.protocoles.join(', ')}`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
