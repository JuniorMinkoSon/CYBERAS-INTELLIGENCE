import { useEffect, useRef } from 'react'

/**
 * Réseau cyber animé du hero.
 *
 * Rendu en Canvas plutôt qu'en DOM : une cinquantaine de nœuds et leurs
 * connexions produiraient autant d'éléments à recalculer à chaque frame, alors
 * qu'un seul canvas ne coûte qu'un repaint.
 *
 * L'animation doit rester en arrière-plan du message, jamais le concurrencer.
 * Les opacités sont donc volontairement basses et les vitesses lentes.
 */

interface Props {
  /** Densité du réseau. Réduite automatiquement sur petits écrans. */
  nodeCount?: number
  className?: string
}

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  /** Décalage de phase pour que les nœuds ne pulsent pas à l'unisson. */
  phase: number
  radius: number
}

interface Signal {
  /** Indices des nœuds reliés par le segment parcouru. */
  from: number
  to: number
  /** Progression sur le segment, 0 à 1. */
  progress: number
  speed: number
}

const RED = '220, 38, 38'

/** Au-delà de cette distance, deux nœuds ne sont plus reliés. */
const LINK_DISTANCE = 150

export function CyberNetworkCanvas({ nodeCount = 44, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Une animation continue n'a pas sa place quand l'utilisateur demande à
    // réduire le mouvement : on rend une image fixe et on s'arrête là.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let signals: Signal[] = []
    let running = true

    /** Densité proportionnelle à la surface : un mobile n'a pas besoin d'autant de nœuds. */
    const effectiveNodeCount = () => {
      const area = width * height
      const scaled = Math.round((area / 900_000) * nodeCount)
      return Math.max(12, Math.min(nodeCount, scaled))
    }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return

      // Le canvas est dessiné à la résolution physique puis remis à l'échelle en
      // CSS, sinon le rendu est flou sur écran à forte densité.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent.clientWidth
      height = parent.clientHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      seed()
    }

    const seed = () => {
      const count = effectiveNodeCount()
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // Vitesses très faibles : le mouvement doit être perçu comme une dérive,
        // pas comme un déplacement.
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        phase: Math.random() * Math.PI * 2,
        radius: 1 + Math.random() * 1.4,
      }))
      signals = []
    }

    /** Fait circuler un signal entre deux nœuds proches, à intervalle irrégulier. */
    const maybeEmitSignal = () => {
      // Peu de signaux simultanés : au-delà, l'effet devient décoratif et bruyant.
      if (signals.length >= 3 || Math.random() > 0.012) return

      const from = Math.floor(Math.random() * nodes.length)
      const candidates: number[] = []

      for (let i = 0; i < nodes.length; i++) {
        if (i === from) continue
        const dx = nodes[i].x - nodes[from].x
        const dy = nodes[i].y - nodes[from].y
        if (dx * dx + dy * dy < LINK_DISTANCE * LINK_DISTANCE) candidates.push(i)
      }
      if (candidates.length === 0) return

      signals.push({
        from,
        to: candidates[Math.floor(Math.random() * candidates.length)],
        progress: 0,
        speed: 0.004 + Math.random() * 0.006,
      })
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)

      // Connexions d'abord, pour que les nœuds se dessinent par-dessus.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const distSq = dx * dx + dy * dy
          if (distSq > LINK_DISTANCE * LINK_DISTANCE) continue

          // L'opacité décroît avec la distance : les liens apparaissent et
          // s'effacent d'eux-mêmes au gré de la dérive des nœuds.
          const proximity = 1 - Math.sqrt(distSq) / LINK_DISTANCE
          ctx.strokeStyle = `rgba(${RED}, ${proximity * 0.16})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(nodes[j].x, nodes[j].y)
          ctx.stroke()
        }
      }

      for (const node of nodes) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.0011 + node.phase)

        ctx.fillStyle = `rgba(${RED}, ${0.25 + pulse * 0.4})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fill()

        // Halo discret sur les nœuds au sommet de leur pulsation.
        if (pulse > 0.75) {
          ctx.fillStyle = `rgba(${RED}, ${(pulse - 0.75) * 0.28})`
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      for (const signal of signals) {
        const a = nodes[signal.from]
        const b = nodes[signal.to]
        if (!a || !b) continue

        const x = a.x + (b.x - a.x) * signal.progress
        const y = a.y + (b.y - a.y) * signal.progress
        // Le signal s'éteint en fin de course plutôt que de disparaître d'un coup.
        const fade = Math.sin(signal.progress * Math.PI)

        ctx.fillStyle = `rgba(255, 90, 90, ${fade * 0.85})`
        ctx.beginPath()
        ctx.arc(x, y, 1.8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(${RED}, ${fade * 0.2})`
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = (time: number) => {
      if (!running) return

      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy

        // Rebond sur les bords : garde la densité stable sans réinitialiser
        // les positions, ce qui produirait des sauts visibles.
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1
        node.x = Math.max(0, Math.min(width, node.x))
        node.y = Math.max(0, Math.min(height, node.y))
      }

      maybeEmitSignal()
      signals = signals.filter((s) => {
        s.progress += s.speed
        return s.progress < 1
      })

      draw(time)
      frameRef.current = requestAnimationFrame(step)
    }

    resize()

    if (reduceMotion) {
      draw(0)
    } else {
      frameRef.current = requestAnimationFrame(step)
    }

    // ResizeObserver plutôt que l'événement resize : le conteneur peut changer
    // de taille sans que la fenêtre bouge.
    const observer = new ResizeObserver(resize)
    if (canvas.parentElement) observer.observe(canvas.parentElement)

    // Un onglet en arrière-plan n'a aucune raison de continuer à calculer.
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frameRef.current)
      } else if (!reduceMotion) {
        running = true
        frameRef.current = requestAnimationFrame(step)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [nodeCount])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  )
}
