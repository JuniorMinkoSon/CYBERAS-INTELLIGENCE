import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Vidéo de présentation de Cyberas Intelligence.
 *
 * <p>Hébergée sur le site vitrine en ligne plutôt qu'embarquée dans le paquet :
 * six mégaoctets dans le dépôt alourdiraient chaque livraison pour un fichier
 * que seuls les visiteurs qui cliquent « Lire la vidéo » téléchargent. Le
 * serveur autorise la lecture depuis n'importe quelle origine.
 */
export const PRESENTATION_VIDEO_URL =
  'https://cyberas-intelligence.smartex-expertises.com/videos/slide.mp4'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Lecteur en superposition.
 *
 * <p>La vidéo s'ouvre par-dessus la couverture au lieu d'envoyer vers une
 * autre page : le visiteur la regarde, la ferme, et retrouve exactement
 * l'endroit qu'il avait quitté. Trois façons de fermer : la croix, Échap, un
 * clic hors de l'image : parce qu'un lecteur qu'on ne sait pas quitter est
 * un piège, pas une invitation.
 *
 * <p>Le lecteur est celui du navigateur, avec ses commandes : il est connu de
 * tous, accessible au clavier, et se passe de bibliothèque.
 */
export function VideoModal({ open, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    // La page derrière ne doit pas défiler pendant la lecture. Si la
    // couverture a déjà posé ce verrou, on le laisse tel quel en partant.
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      root.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vidéo de présentation de Cyberas Intelligence"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-[#3A4A5E] bg-black shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la vidéo"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-[#DC2626]"
        >
          <X size={18} />
        </button>
        <video
          ref={videoRef}
          src={PRESENTATION_VIDEO_URL}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="aspect-video w-full bg-black"
        >
          Votre navigateur ne lit pas les vidéos intégrées.{' '}
          <a href={PRESENTATION_VIDEO_URL} className="underline">
            Télécharger la vidéo
          </a>
          .
        </video>
      </div>
    </div>
  )
}
