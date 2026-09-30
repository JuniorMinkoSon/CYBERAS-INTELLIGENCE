import { useState } from 'react'
import { Loader2, ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react'
import { questionnaireClient, type ConfidenceVerdict } from '../../services/questionnaireClient'
import type { UUID } from '../../types/entities'

/**
 * Vérification de cohérence d'une réponse, à la demande.
 *
 * <p>Le service ML compare ce que l'audité déclare à ce que ses pièces
 * démontrent, et signale les réponses qui méritent un second regard : un
 * niveau élevé sans aucune pièce, une pièce qui étaye moins que ce qui est
 * affirmé. Le backend exposait déjà cette vérification ; aucun écran ne la
 * demandait, et elle n'a donc jamais servi.
 *
 * <h3>Consultative, jamais requalifiante</h3>
 *
 * <p>Le verdict n'entre dans aucun score et ne remplace jamais le niveau
 * déclaré. C'est une invitation à regarder, pas une correction automatique :
 * requalifier une réponse sur la foi d'un modèle ferait entrer une supposition
 * dans une chaîne de preuve, ce que l'audit ne tolère pas.
 *
 * <h3>Trois états, pas deux</h3>
 *
 * <p>Le serveur répond toujours 200, même quand le service ML est éteint — il
 * renvoie alors {@code model: "indisponible"}. Confondre ce cas avec un verdict
 * favorable dirait « cohérent » sur une réponse que personne n'a examinée.
 * L'absence de vérification s'affiche donc comme telle.
 */
export function VerificationReponse({
  answerId,
  className = '',
}: {
  answerId: UUID
  className?: string
}) {
  const [verdict, setVerdict] = useState<ConfidenceVerdict | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const verifier = async () => {
    setEnCours(true)
    setErreur(null)
    try {
      setVerdict(await questionnaireClient.checkConfidence(answerId))
    } catch {
      // Le réseau peut échouer là où le serveur aurait répondu « indisponible ».
      // Les deux se disent de la même façon à l'écran : rien n'a été vérifié.
      setErreur("La vérification n'a pas pu être demandée.")
    } finally {
      setEnCours(false)
    }
  }

  if (erreur) {
    return (
      <p className={`inline-flex items-center gap-1.5 text-xs text-text-on-dark-muted ${className}`}>
        <ShieldOff size={13} />
        {erreur}{' '}
        <button type="button" onClick={() => void verifier()} className="underline hover:text-white">
          Réessayer
        </button>
      </p>
    )
  }

  if (!verdict) {
    return (
      <button
        type="button"
        onClick={() => void verifier()}
        disabled={enCours}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-text-on-dark-muted transition-colors hover:text-white disabled:opacity-60 ${className}`}
      >
        {enCours ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
        {enCours ? 'Vérification…' : 'Vérifier la cohérence'}
      </button>
    )
  }

  const indisponible = verdict.model === 'indisponible'
  const pourcent = Math.round(verdict.confidenceIndex * 100)

  return (
    <div
      className={`rounded-md border p-3 text-xs ${
        indisponible
          ? 'border-border-dark bg-bg-dark text-text-on-dark-muted'
          : verdict.flagged
            ? 'border-status-warning/40 bg-status-warning/10 text-status-warning'
            : 'border-status-success/40 bg-status-success/10 text-status-success'
      } ${className}`}
    >
      <div className="flex items-start gap-2">
        {indisponible ? (
          <ShieldOff size={14} className="mt-0.5 shrink-0" />
        ) : verdict.flagged ? (
          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
        ) : (
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-semibold">
            {indisponible
              ? 'Non vérifiée'
              : verdict.flagged
                ? `À regarder — cohérence ${pourcent} %`
                : `Cohérente — ${pourcent} %`}
          </p>
          <p className="mt-1 leading-relaxed opacity-90">{verdict.reason}</p>
          {!indisponible && (
            <p className="mt-1.5 opacity-70">
              Avis consultatif du modèle {verdict.model}. Votre niveau déclaré n&apos;est pas modifié
              et n&apos;entre dans aucun score autrement que tel que vous l&apos;avez saisi.
            </p>
          )}
          <button
            type="button"
            onClick={() => void verifier()}
            disabled={enCours}
            className="mt-2 inline-flex items-center gap-1.5 font-semibold underline underline-offset-2 disabled:opacity-60"
          >
            {enCours && <Loader2 size={12} className="animate-spin" />}
            {enCours ? 'Vérification…' : 'Vérifier à nouveau'}
          </button>
        </div>
      </div>
    </div>
  )
}
