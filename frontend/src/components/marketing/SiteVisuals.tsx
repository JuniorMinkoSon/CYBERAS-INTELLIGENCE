/**
 * Visuels abstraits du site vitrine.
 *
 * <p>La charte interdit l'imagerie cliché de la cybersécurité : capuches,
 * cadenas, néon. Ce qui la remplace : des schémas qui montrent le mécanisme.
 * Un visuel qui explique vaut mieux qu'un visuel qui décore, et il vieillit
 * mieux qu'une photo d'agence.
 *
 * <p>Tout est en balises ou en SVG : rien à télécharger, rien
 * qui pixellise, et les couleurs suivent les jetons de la charte.
 */

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
     encore. La montrer « non évaluée » vaut mieux que l'omettre : une maquette
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

/* -------------------------------------------------------------------------- */
/* Aperçus des livrables                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Cadre commun des aperçus.
 *
 * <p>Chaque livrable montre à quoi il ressemble, pas une photo d'ambiance.
 * Une cartographie des risques est une grille de chaleur : une photo de bureau
 * posée au-dessus du mot « cartographie » n'apprend rien et ment sur ce qu'on
 * recevra. Dessinés en balises, ces aperçus restent nets à toute densité,
 * suivent les jetons de la charte et n'engagent aucun droit d'image.
 *
 * <p>`role="img"` avec son libellé : pour qui n'affiche pas les images ou
 * navigue à la voix, l'empilement de div n'a aucun sens, et la description
 * vaut mieux que le silence. Le contenu interne est donc masqué.
 */
function Apercu({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-28 flex-col justify-center overflow-hidden rounded-lg border border-[color:var(--s-border)] bg-[color:var(--s-raised)] p-3"
    >
      <div aria-hidden="true" className="w-full">
        {children}
      </div>
    </div>
  )
}

/** Une page de rapport : bandeau de titre, score, lignes de texte. */
export function ApercuRapport() {
  return (
    <Apercu label="Aperçu d’un rapport d’évaluation : en-tête, score global et corps de texte">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-10 rounded-full bg-[color:var(--s-primary)]" />
        <span className="ml-auto text-sm font-bold text-[color:var(--s-text-strong)]">72</span>
        <span className="text-[0.625rem] text-[color:var(--s-text-muted)]">/100</span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        {[100, 88, 94, 70, 82].map((w, i) => (
          <span
            key={i}
            className="block h-1 rounded-full bg-[color:var(--s-border)]"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </Apercu>
  )
}

/**
 * La matrice probabilité / impact, cinq par cinq.
 *
 * La teinte suit le produit des deux axes, comme dans le produit : vert en bas
 * à gauche, rouge en haut à droite. C'est le seul aperçu qui se calcule plutôt
 * que de se poser à la main, et c'est aussi celui qu'on reconnaît de loin.
 */
export function ApercuCartographie() {
  const ton = (n: number) =>
    n <= 3
      ? 'var(--s-success)'
      : n <= 7
        ? 'var(--s-warning)'
        : n <= 14
          ? 'var(--s-high)'
          : 'var(--s-critical)'

  return (
    <Apercu label="Aperçu d’une cartographie des risques : matrice probabilité sur impact, du vert au rouge">
      <div className="mx-auto grid w-fit grid-cols-5 gap-[3px]">
        {Array.from({ length: 5 }).flatMap((_, ligne) =>
          Array.from({ length: 5 }).map((__, col) => {
            const gravite = (5 - ligne) * (col + 1)
            return (
              <span
                key={`${ligne}-${col}`}
                className="size-[14px] rounded-[3px]"
                style={{ backgroundColor: ton(gravite), opacity: 0.88 }}
              />
            )
          }),
        )}
      </div>
    </Apercu>
  )
}

/** Un plan d'action : priorité, avancement, responsable. */
export function ApercuRemediation() {
  const lignes = [
    { ton: 'var(--s-critical)', pct: 80 },
    { ton: 'var(--s-high)', pct: 55 },
    { ton: 'var(--s-warning)', pct: 30 },
  ]
  return (
    <Apercu label="Aperçu d’un plan de remédiation : actions classées par priorité, avec leur avancement">
      <div className="space-y-2">
        {lignes.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: l.ton }} />
            <span className="h-1 flex-1 rounded-full bg-[color:var(--s-bg-alt)]">
              <span
                className="block h-full rounded-full"
                style={{ width: `${l.pct}%`, backgroundColor: l.ton }}
              />
            </span>
            <span className="w-6 shrink-0 text-right text-[0.5625rem] font-semibold text-[color:var(--s-text-muted)]">
              {l.pct}%
            </span>
          </div>
        ))}
      </div>
    </Apercu>
  )
}

/**
 * La matrice de conformité, référentiel par référentiel.
 *
 * Elle porte les logos plutôt que les sigles : c'est la règle tenue partout
 * ailleurs sur le site, et elle vaut aussi à cette taille — un logo se
 * reconnaît là où « CIS v8 » se déchiffre.
 */
export function ApercuMatrice() {
  const lignes = [
    { logo: '/images/logos/iso.svg', etats: ['ok', 'ok', 'partiel', 'ok'] },
    { logo: '/images/logos/nist.svg', etats: ['ok', 'partiel', 'ok', 'ecart'] },
    { logo: '/images/logos/cis.svg', etats: ['partiel', 'ok', 'ok', 'ok'] },
  ]
  const ton: Record<string, string> = {
    ok: 'var(--s-success)',
    partiel: 'var(--s-warning)',
    ecart: 'var(--s-critical)',
  }
  return (
    <Apercu label="Aperçu d’une matrice de conformité : par référentiel, les contrôles conformes, partiels ou en écart">
      <div className="space-y-2">
        {lignes.map((l) => (
          <div key={l.logo} className="flex items-center gap-2">
            <img src={l.logo} alt="" loading="lazy" className="h-4 w-9 shrink-0 object-contain" />
            <span className="flex flex-1 gap-1">
              {l.etats.map((e, i) => (
                <span
                  key={i}
                  className="h-2.5 flex-1 rounded-[2px]"
                  style={{ backgroundColor: ton[e], opacity: 0.85 }}
                />
              ))}
            </span>
          </div>
        ))}
      </div>
    </Apercu>
  )
}

/** Le tableau de bord : score, barres par domaine, courbe de progression. */
export function ApercuTableauBord() {
  return (
    <Apercu label="Aperçu d’un tableau de bord de posture : score global, niveaux par domaine et évolution">
      <div className="flex items-end gap-3">
        <div>
          <span className="block text-xl font-bold leading-none text-[color:var(--s-text-strong)]">
            78
          </span>
          <span className="text-[0.5625rem] text-[color:var(--s-text-muted)]">/100</span>
        </div>
        <div className="flex-1 space-y-1.5">
          {[78, 64, 71].map((w, i) => (
            <span key={i} className="block h-1 rounded-full bg-[color:var(--s-bg-alt)]">
              <span
                className="block h-full rounded-full bg-[color:var(--s-primary)]"
                style={{ width: `${w}%` }}
              />
            </span>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 100 18" className="mt-2.5 h-5 w-full" aria-hidden="true">
        <polyline
          points="0,16 20,13 40,14 60,8 80,6 100,2"
          fill="none"
          stroke="var(--s-success)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Apercu>
  )
}

