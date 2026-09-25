/**
 * Marque du site vitrine.
 *
 * <p>Le premier site portait un écusson rouge frappé d'un « C ». La refonte
 * l'avait remplacé par un simple mot en bleu, plus sobre mais sans mémoire :
 * on perdait le seul signe que les clients reconnaissaient déjà.
 *
 * <p>La marque reprend donc l'écusson, avec la répartition qui gouverne tout le
 * site : le bleu porte l'identité : le contour, le nom, et le rouge historique
 * reste sur l'arc central. Une couleur dit qui l'on est, l'autre rappelle d'où
 * l'on vient, et aucune des deux ne se dispute la lecture.
 *
 * <p>Le fond de l'écusson suit la surface qui le porte : sur fond sombre,
 * l'ancien aplat presque noir ; sur fond clair, du blanc. Le contour suffit à
 * tenir la forme dans les deux cas.
 *
 * <p>L'écusson mesurait 30 px, le nom 16 px et le mot « INTELLIGENCE » 9 px.
 * À cette taille, dans une barre de 72 px de haut, le second mot se réduisait
 * à une frise grise : on voyait qu'il y avait quelque chose d'écrit sans
 * pouvoir le lire. L'ensemble a grandi, et l'écusson a gagné les détails qui
 * ne tenaient pas à 30 px : un liseré intérieur qui détache le contour du
 * fond, et un arc plus franc.
 */
export function SiteLogo({
  tone = 'light',
  taille = 38,
}: {
  tone?: 'light' | 'dark'
  /** Côté de l'écusson, en pixels. Le texte suit. */
  taille?: number
}) {
  /* `tone` décrit le FOND, pas l'encre : « light » signifie posé sur une
     surface claire. L'inverse se confond une fois sur deux à la relecture. */
  const surSombre = tone === 'dark'

  return (
    <span className="flex items-center gap-3">
      <svg
        width={taille}
        height={taille}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Le corps de l'écusson. */}
        <path
          d="M24 3L42 11v13c0 11.5-7.7 18.6-18 21C13.7 42.6 6 35.5 6 24V11L24 3z"
          fill={surSombre ? '#0B0F14' : '#FFFFFF'}
          stroke="var(--s-primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Liseré intérieur. Il ne se voit pas comme un trait mais comme une
            épaisseur : c'est lui qui donne à l'écusson l'air d'être découpé
            plutôt que dessiné, et il ne tenait pas à 30 px. */}
        <path
          d="M24 7.2L38.2 13.5V24c0 9.4-6.2 15.2-14.2 17.2C15.9 39.2 9.8 33.4 9.8 24V13.5L24 7.2z"
          stroke="var(--s-primary)"
          strokeOpacity="0.28"
          strokeWidth="1.2"
          fill="none"
          strokeLinejoin="round"
        />
        {/* L'arc rouge, la mémoire de la première marque. */}
        <path
          d="M31 17.5A9.5 9.5 0 1 0 31 30.5"
          stroke="var(--s-signature)"
          strokeWidth="4.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <span className="leading-none">
        <span
          className="block text-[1.0625rem] font-extrabold tracking-[0.16em]"
          style={{ color: surSombre ? '#FFFFFF' : 'var(--s-navy)' }}
        >
          CYBERAS
        </span>
        <span className="mt-1 block text-[0.625rem] font-bold tracking-[0.26em] text-[color:var(--s-primary)]">
          INTELLIGENCE
        </span>
      </span>
    </span>
  )
}
