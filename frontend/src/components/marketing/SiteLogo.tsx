/**
 * Marque du site vitrine.
 *
 * <p>Le premier site portait un écusson rouge frappé d'un « C ». La refonte
 * l'avait remplacé par un simple mot en bleu, plus sobre mais sans mémoire :
 * on perdait le seul signe que les clients reconnaissaient déjà.
 *
 * <p>La marque reprend donc l'écusson, avec la répartition qui gouverne tout le
 * site : le bleu porte l'identité — le contour, le nom — et le rouge historique
 * reste sur l'arc central. Une couleur dit qui l'on est, l'autre rappelle d'où
 * l'on vient, et aucune des deux ne se dispute la lecture.
 *
 * <p>Le fond de l'écusson suit la surface qui le porte : sur fond sombre,
 * l'ancien aplat presque noir ; sur fond clair, du blanc. Le contour suffit à
 * tenir la forme dans les deux cas.
 */
export function SiteLogo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  /* `tone` décrit le FOND, pas l'encre : « light » signifie posé sur une
     surface claire. L'inverse se confond une fois sur deux à la relecture. */
  const surSombre = tone === 'dark'

  return (
    <span className="flex items-center gap-2.5">
      <svg width={30} height={30} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M24 3L42 11v13c0 11.5-7.7 18.6-18 21C13.7 42.6 6 35.5 6 24V11L24 3z"
          fill={surSombre ? '#0B0F14' : '#FFFFFF'}
          stroke="var(--s-primary)"
          strokeWidth="2.5"
        />
        <path
          d="M31 17.5A9.5 9.5 0 1 0 31 30.5"
          stroke="var(--s-signature)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="leading-none">
        <span
          className="block text-base font-bold tracking-[0.18em]"
          style={{ color: surSombre ? '#FFFFFF' : 'var(--s-navy)' }}
        >
          CYBERAS
        </span>
        <span className="mt-0.5 block text-[9px] font-semibold tracking-[0.3em] text-[color:var(--s-primary)]">
          INTELLIGENCE
        </span>
      </span>
    </span>
  )
}
