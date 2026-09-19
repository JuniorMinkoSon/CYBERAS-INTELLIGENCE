/**
 * Visuels abstraits du site vitrine.
 *
 * <p>La charte interdit l'imagerie cliché de la cybersécurité — capuches,
 * cadenas, néon. Ce qui la remplace : des schémas qui montrent le mécanisme.
 * Un visuel qui explique vaut mieux qu'un visuel qui décore, et il vieillit
 * mieux qu'une photo d'agence.
 *
 * <p>Tout est en SVG ou en éléments de mise en page : rien à télécharger, rien
 * qui pixellise, et les couleurs suivent les jetons de la charte.
 */

/** Petit cadre commun, pour que les quatre visuels aient le même poids. */
function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure
      className="rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      aria-label={label}
    >
      {children}
    </figure>
  )
}

/**
 * Le socle : plusieurs référentiels retombent sur un contrôle commun.
 *
 * Les trois cadres nommés font partie des six que le catalogue déclare et dont
 * les contrôles portent des correspondances croisées. Le schéma n'en montre que
 * trois faute de place ; il ne nomme que des cadres réellement rapprochés.
 */
export function VisualSocle() {
  return (
    <Frame label="Plusieurs référentiels convergent vers un socle de contrôles commun">
      <div className="grid grid-cols-3 gap-2">
        {['ISO 27001', 'NIST CSF', 'CIS v8'].map((r, i) => (
          <div
            key={i}
            className="rounded-lg border border-[color:var(--s-primary)] bg-[color:var(--s-primary-soft)] px-2 py-3 text-center text-xs font-semibold text-[color:var(--s-primary)]"
          >
            {r}
          </div>
        ))}
      </div>

      <svg viewBox="0 0 300 44" className="my-1 h-11 w-full" aria-hidden="true">
        <path
          d="M50 0 V16 Q50 26 150 26 M150 0 V26 M250 0 V16 Q250 26 150 26 M150 26 V44"
          fill="none"
          stroke="var(--s-border-strong)"
          strokeWidth="1.5"
        />
      </svg>

      <div className="rounded-lg border border-[color:var(--s-primary)] bg-[color:var(--s-primary-soft)] px-4 py-4 text-center">
        <span className="block text-sm font-bold text-[color:var(--s-text-strong)]">
          Socle de contrôles unifié
        </span>
        <span className="mt-1 block text-xs text-[color:var(--s-text-muted)]">
          Une mesure évaluée une fois, exploitable dans plusieurs cadres
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {['Preuves', 'Écarts', 'Scores'].map((r) => (
          <div
            key={r}
            className="rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-raised)] px-2 py-2.5 text-center text-xs text-[color:var(--s-text-muted)]"
          >
            {r}
          </div>
        ))}
      </div>
    </Frame>
  )
}

/** L'évaluation : questionnaires et preuves alimentent l'analyse. */
export function VisualEvaluation() {
  const lignes = [
    { label: 'Contrôle évalué', valeur: 'Conforme', ton: 'var(--s-success)' },
    { label: 'Contrôle évalué', valeur: 'Partiel', ton: 'var(--s-warning)' },
    { label: 'Contrôle évalué', valeur: 'Écart', ton: 'var(--s-critical)' },
  ]
  return (
    <Frame label="Questionnaires et preuves alimentent l’analyse">
      <div className="space-y-2">
        {lignes.map((l, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-bg-alt)] px-4 py-3"
          >
            <span className="text-xs text-[color:var(--s-text-muted)]">{l.label}</span>
            <span className="text-xs font-bold" style={{ color: l.ton }}>
              {l.valeur}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-[color:var(--s-border)] px-4 py-3">
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]">
          Preuves rattachées
        </span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['Politique', 'Procédure', 'Capture', 'Export'].map((p) => (
            <span
              key={p}
              className="rounded-full border border-[color:var(--s-border)] px-2.5 py-1 text-[0.6875rem] text-[color:var(--s-text-muted)]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  )
}

/** La remédiation : un écart devient une action tenue par quelqu'un, à une date. */
export function VisualRemediation() {
  const actions = [
    { priorite: 'Critique', ton: 'var(--s-critical)' },
    { priorite: 'Élevée', ton: 'var(--s-high)' },
    { priorite: 'Moyenne', ton: 'var(--s-warning)' },
  ]
  return (
    <Frame label="Un écart devient une action suivie">
      <div className="space-y-2">
        {actions.map((a, i) => (
          <div key={i} className="rounded-lg border border-[color:var(--s-border)] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[color:var(--s-text-strong)]">
                Action de remédiation
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold uppercase"
                style={{ color: a.ton, backgroundColor: `color-mix(in srgb, ${a.ton} 10%, white)` }}
              >
                {a.priorite}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[0.6875rem] text-[color:var(--s-text-muted)]">
              <span>Responsable</span>
              <span aria-hidden="true">·</span>
              <span>Échéance</span>
              <span aria-hidden="true">·</span>
              <span>Statut</span>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

/**
 * Visuel du hero : données, contrôles, risques, analyse, résultats.
 *
 * Une maquette de tableau de bord plutôt qu'une métaphore. Le visiteur
 * reconnaît l'objet qu'il va manipuler, ce qu'aucun réseau de points lumineux
 * ne lui apprend.
 */
export function VisualPosture() {
  /* Les cinq dimensions du catalogue, pas quatre. La physique y figure sans
     score : le référentiel la déclare, mais aucun questionnaire ne la couvre
     encore. La montrer « non évaluée » vaut mieux que l'omettre — une maquette
     qui cache une dimension laisse croire qu'elle est notée quelque part. */
  const domaines: { nom: string; valeur: number | null }[] = [
    { nom: 'Organisationnel', valeur: 78 },
    { nom: 'Conformité', valeur: 64 },
    { nom: 'Technique', valeur: 71 },
    { nom: 'Humain', valeur: 52 },
    { nom: 'Physique', valeur: null },
  ]
  return (
    <figure
      className="rounded-xl border border-[color:var(--s-border)] bg-[color:var(--s-raised)] p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
      aria-label="Aperçu d’un tableau de bord de posture : score global et niveaux par domaine"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]">
            Posture consolidée
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[color:var(--s-text-strong)]">71</span>
            <span className="text-sm text-[color:var(--s-text-muted)]">/ 100</span>
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { l: 'Écarts', v: '12' },
            { l: 'Actions', v: '08' },
          ].map((k) => (
            <div
              key={k.l}
              className="rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-bg-alt)] px-3 py-2 text-center"
            >
              <span className="block text-lg font-bold text-[color:var(--s-text-strong)]">{k.v}</span>
              <span className="block text-[0.625rem] text-[color:var(--s-text-muted)]">{k.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {domaines.map((d) => (
          <div key={d.nom}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[color:var(--s-text)]">{d.nom}</span>
              {d.valeur === null ? (
                <span className="text-[0.625rem] text-[color:var(--s-text-muted)]">non évaluée</span>
              ) : (
                <span className="font-semibold text-[color:var(--s-text-strong)]">{d.valeur}</span>
              )}
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color:var(--s-bg-alt)]">
              {d.valeur !== null && (
                <div
                  className="h-full rounded-full bg-[color:var(--s-primary)]"
                  style={{ width: `${d.valeur}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[color:var(--s-border)] pt-4">
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[color:var(--s-text-muted)]">
          Risques prioritaires
        </span>
        <div className="mt-2 flex gap-1.5">
          {[
            'var(--s-critical)',
            'var(--s-high)',
            'var(--s-high)',
            'var(--s-warning)',
            'var(--s-warning)',
            'var(--s-success)',
          ].map((c, i) => (
            <span key={i} className="h-6 flex-1 rounded" style={{ backgroundColor: c, opacity: 0.85 }} />
          ))}
        </div>
      </div>
    </figure>
  )
}
