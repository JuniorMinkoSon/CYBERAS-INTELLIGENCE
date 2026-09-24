import { useEffect, useRef, useState } from 'react'
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { PRESENTATION_VIDEO_URL } from './VideoModal'

/**
 * Vidéo de présentation incrustée dans la page.
 *
 * <p>Elle démarre seule, sans le son : c'est la seule lecture automatique que
 * les navigateurs acceptent, et c'est la seule qui ne surprend personne. Le
 * son se rend d'un clic. La lecture se met en pause quand la vidéo sort de
 * l'écran et reprend quand elle y revient, pour ne pas jouer dans le vide.
 */
export function VideoInline() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => setPlaying(false))
        } else {
          v.pause()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const basculerLecture = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().catch(() => setPlaying(false))
    } else {
      v.pause()
    }
  }

  const basculerSon = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted && v.paused) v.play().catch(() => setPlaying(false))
  }

  const pleinEcran = () => {
    const v = videoRef.current
    if (!v) return
    if (v.requestFullscreen) {
      v.requestFullscreen().catch(() => undefined)
    }
  }

  return (
    <figure className="s-video">
      <video
        ref={videoRef}
        src={PRESENTATION_VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={basculerLecture}
        aria-label="Vidéo de présentation de CYBERAS Intelligence"
      />
      <div className="s-video-bar">
        <button
          type="button"
          onClick={basculerLecture}
          aria-label={playing ? 'Mettre en pause' : 'Lire'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          type="button"
          onClick={basculerSon}
          aria-pressed={!muted}
          aria-label={muted ? 'Activer le son' : 'Couper le son'}
          className={muted ? 's-video-son' : ''}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span>{muted ? 'Activer le son' : 'Son activé'}</span>
        </button>
        <button type="button" onClick={pleinEcran} aria-label="Plein écran" className="ml-auto">
          <Maximize2 size={18} />
        </button>
      </div>
    </figure>
  )
}
