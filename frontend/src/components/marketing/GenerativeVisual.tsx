/**
 * Visuels génératifs pour les blocs sectoriels et éditoriaux.
 *
 * Aucune image n'est chargée : chaque visuel est un SVG construit à partir d'une
 * graine, ce qui évite des fichiers à héberger et garantit que la palette reste
 * celle de la marque. Un rendu donné est stable — la même graine produit
 * toujours le même dessin, sinon la page changerait d'aspect à chaque montage.
 *
 * Les motifs restent abstraits : ils suggèrent réseau, flux et structure sans
 * illustrer littéralement un secteur, ce qui vieillirait mal.
 */

type Variant = 'network' | 'grid' | 'pulse' | 'layers'

interface Props {
  /** Détermine le dessin. Une même graine donne toujours le même rendu. */
  seed: string
  variant?: Variant
  className?: string
}

/**
 * Générateur pseudo-aléatoire déterministe.
 *
 * Math.random() donnerait un dessin différent à chaque rendu ; on dérive donc
 * les positions d'un hachage de la graine.
 */
function makeRandom(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 10000) / 10000
  }
}

export function GenerativeVisual({ seed, variant = 'network', className = '' }: Props) {
  const rand = makeRandom(seed)
  const gradientId = `grad-${seed.replace(/[^a-z0-9]/gi, '')}`
  const glowId = `glow-${seed.replace(/[^a-z0-9]/gi, '')}`

  const nodes = Array.from({ length: 14 }, () => ({
    x: 10 + rand() * 280,
    y: 10 + rand() * 140,
    r: 1.2 + rand() * 2.6,
  }))

  return (
    <svg
      viewBox="0 0 300 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#DC2626" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={glowId} cx="50%" cy="45%">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="300" height="160" fill="#080808" />
      <rect width="300" height="160" fill={`url(#${gradientId})`} />
      <ellipse cx="150" cy="72" rx="130" ry="70" fill={`url(#${glowId})`} />

      {variant === 'network' && (
        <>
          {/* Liens d'abord : les nœuds doivent se dessiner par-dessus. */}
          {nodes.map((a, i) =>
            nodes.slice(i + 1).map((b, j) => {
              const dist = Math.hypot(b.x - a.x, b.y - a.y)
              if (dist > 70) return null
              return (
                <line
                  key={`${i}-${j}`}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="#DC2626"
                  strokeWidth="0.4"
                  strokeOpacity={0.32 * (1 - dist / 70)}
                />
              )
            })
          )}
          {nodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="#DC2626" fillOpacity="0.65" />
          ))}
        </>
      )}

      {variant === 'grid' && (
        <>
          {Array.from({ length: 13 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * 25} y1="0" x2={i * 25} y2="160"
              stroke="#DC2626" strokeWidth="0.3" strokeOpacity="0.16"
            />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0" y1={i * 26} x2="300" y2={i * 26}
              stroke="#DC2626" strokeWidth="0.3" strokeOpacity="0.16"
            />
          ))}
          {/* Quelques croisements activés, pour rompre la régularité. */}
          {nodes.slice(0, 6).map((n, i) => (
            <rect
              key={i}
              x={Math.round(n.x / 25) * 25 - 2}
              y={Math.round(n.y / 26) * 26 - 2}
              width="4" height="4"
              fill="#DC2626" fillOpacity="0.7"
            />
          ))}
        </>
      )}

      {variant === 'pulse' && (
        <>
          {[26, 46, 66, 86].map((r, i) => (
            <circle
              key={r}
              cx="150" cy="80" r={r}
              fill="none"
              stroke="#DC2626"
              strokeWidth="0.6"
              strokeOpacity={0.34 - i * 0.07}
            />
          ))}
          <circle cx="150" cy="80" r="4" fill="#DC2626" fillOpacity="0.85" />
          {nodes.slice(0, 5).map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r="1.6" fill="#DC2626" fillOpacity="0.5" />
          ))}
        </>
      )}

      {variant === 'layers' && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M0 ${60 + i * 22} Q 75 ${44 + i * 22 + rand() * 12} 150 ${60 + i * 22} T 300 ${60 + i * 22}`}
              fill="none"
              stroke="#DC2626"
              strokeWidth="0.7"
              strokeOpacity={0.34 - i * 0.06}
            />
          ))}
          {nodes.slice(0, 7).map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r="1.4" fill="#DC2626" fillOpacity="0.55" />
          ))}
        </>
      )}
    </svg>
  )
}
