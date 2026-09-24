import { useState } from 'react'
import { PlayCircle } from 'lucide-react'
import { VideoModal } from './VideoModal'

/**
 * Bouton « Démo ».
 *
 * <p>Il ouvre la vidéo de présentation par-dessus la page, et non la page de
 * prise de rendez-vous. Tant qu'aucune démonstration en direct n'est proposée,
 * envoyer vers un formulaire de rendez-vous après avoir promis une démo fait
 * attendre plusieurs jours ce qui tient en deux minutes.
 *
 * <p>Par-dessus la page plutôt que vers une autre adresse : le visiteur
 * regarde, ferme, et retrouve exactement l'endroit qu'il avait quitté. C'est
 * ce que fait déjà {@code VideoModal}, qui existait sans être branché nulle
 * part.
 *
 * <p>Le composant porte son propre état d'ouverture. Un seul bouton est
 * visible à la fois dans une page donnée — barre ou couverture — et remonter
 * cet état à un contexte reviendrait à câbler tout le site pour un booléen.
 */
export function DemoButton({
  className = 's-btn s-btn-secondary',
  label = 'Démo',
  icone = true,
}: {
  className?: string
  label?: string
  /** L'icône de lecture. Retirée dans la barre, où la place est comptée. */
  icone?: boolean
}) {
  const [ouvert, setOuvert] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className={className}>
        {icone && <PlayCircle size={18} aria-hidden="true" />}
        {label}
      </button>
      <VideoModal open={ouvert} onClose={() => setOuvert(false)} />
    </>
  )
}
