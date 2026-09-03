import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Crosshair, Search, TrendingUp, ShieldCheck, PlayCircle, Monitor, Tag, ChevronDown } from 'lucide-react'
import { CyberNetworkCanvas } from './CyberNetworkCanvas'
import '../../styles/hero.css'

/**
 * Hero de la page d'accueil, tenu en couverture plein écran.
 *
 * Composition en couches, de l'arrière vers l'avant : dégradé, réseau animé,
 * bouclier, message, actions, bénéfices. Chaque couche apparaît après la
 * précédente pour que le regard aille au texte avant le décor.
 *
 * Le défilement est retenu tant que le visiteur n'a pas agi : la page se
 * comporte comme une couverture qu'on ouvre, pas comme un document qu'on
 * parcourt. Un geste délibéré — bouton, flèche, Page bas, Échap — libère la
 * page définitivement.
 *
 * Rien au-dessus de la ligne de flottaison ne parle de score, de CVE ni de
 * référentiel : la première page répond à « qu'est-ce que c'est » et « par où
 * commencer », le reste vit dans les pages produit.
 */

const benefits = [
  {
    icon: Crosshair,
    title: 'Évaluez vos risques',
    description: 'Vision complète et continue de votre posture.',
  },
  {
    icon: Search,
    title: 'Détectez les vulnérabilités',
    description: 'Scans techniques et analyse des preuves.',
  },
  {
    icon: TrendingUp,
    title: 'Priorisez vos actions',
    description: 'Recommandations claires et contextualisées.',
  },
  {
    icon: ShieldCheck,
    title: 'Restez conforme',
    description: 'Aligné avec les principaux référentiels et normes.',
  },
]

/** Flux horizontaux : positions et durées fixes, pour éviter un rendu différent à chaque montage. */
const streams = [
  { top: '22%', duration: '17s', delay: '0s', size: 2 },
  { top: '38%', duration: '23s', delay: '5s', size: 1.5 },
  { top: '61%', duration: '19s', delay: '9s', size: 2 },
  { top: '74%', duration: '27s', delay: '14s', size: 1.5 },
]

interface Props {
  onPlayVideo?: () => void
}

export function CyberHero({ onPlayVideo }: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  /** Amène le visiteur à la section qui suit la couverture. */
  const scrollToNext = () => {
    const next = sectionRef.current?.nextElementSibling
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    next?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[100svh] flex-col items-center justify-start overflow-hidden bg-[#050505] px-4 pb-16 pt-20 sm:px-6 sm:pt-24">

      {/* Couche 1 — halo de fond. Deux dégradés superposés donnent la profondeur
          sans image de fond à charger. */}
      <div
        aria-hidden="true"
        className="cy-enter-fade pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(220,38,38,0.16), transparent 68%),' +
            'radial-gradient(ellipse 120% 70% at 50% 110%, rgba(220,38,38,0.09), transparent 60%)',
        }}
      />

      {/* Couche 2 — réseau de nœuds animés, cantonné à la moitié haute pour ne
          pas passer derrière le texte. */}
      <div aria-hidden="true" className="cy-enter-fade cy-delay-1 absolute inset-x-0 top-0 h-[62%] opacity-70">
        <CyberNetworkCanvas nodeCount={44} />
      </div>

      {/* Couche 3 — flux horizontaux, très peu nombreux. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {streams.map((s, i) => (
          <span
            key={i}
            className="cy-stream absolute rounded-full bg-[#ff4d4d]"
            style={{
              top: s.top,
              left: 0,
              width: `${s.size}px`,
              height: `${s.size}px`,
              boxShadow: '0 0 6px rgba(220,38,38,0.8)',
              animationDuration: s.duration,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">

        {/* Couche 4 — bouclier et anneaux. Dimensions contenues : l'ensemble du
            hero doit tenir dans une hauteur d'écran sans déborder, sinon le
            centrage vertical n'a plus de sens et le bas est coupé. */}
        <div className="cy-enter cy-delay-2 relative mb-6 flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">

          {/* Anneaux se propageant sous le bouclier. */}
          <div aria-hidden="true" className="absolute inset-0">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="cy-ring absolute left-1/2 top-1/2 block rounded-full border border-[rgba(220,38,38,0.32)]"
                style={{ width: '100%', height: '100%' }}
              />
            ))}
          </div>

          {/* Lueur diffuse. */}
          <div
            aria-hidden="true"
            className="cy-shield-glow absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(220,38,38,0.42), transparent 62%)',
              filter: 'blur(18px)',
            }}
          />

          {/* Bouclier. Le tracé est inline pour que la lueur s'applique au dessin
              lui-même plutôt qu'à une boîte englobante. */}
          <div className="cy-shield relative">
            <svg
              width="84"
              height="99"
              viewBox="0 0 112 132"
              fill="none"
              aria-hidden="true"
              style={{ filter: 'drop-shadow(0 0 16px rgba(220,38,38,0.6))' }}
            >
              <path
                d="M56 4 L104 22 V64 C104 96 82 118 56 128 C30 118 8 96 8 64 V22 Z"
                stroke="#DC2626"
                strokeWidth="3"
                fill="rgba(220,38,38,0.05)"
              />
              <text
                x="56"
                y="82"
                textAnchor="middle"
                fill="#DC2626"
                fontSize="46"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                C
              </text>
            </svg>

            {/* Balayage vertical intermittent, masqué au tracé du bouclier. */}
            <span
              aria-hidden="true"
              className="cy-shield-scan pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(255,120,120,0.5), transparent)',
                height: '38%',
              }}
            />
          </div>
        </div>

        {/* Couche 5 — message. */}
        <p className="cy-enter cy-delay-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#DC2626]">
          Plateforme d'audit de cybersécurité intelligente
        </p>

        <h1 className="cy-enter cy-delay-3 mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Maîtrisez votre cybersécurité.
          <br />
          Agissez avec <span className="text-[#DC2626]">intelligence.</span>
        </h1>

        <p className="cy-enter cy-delay-4 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#8B98A5] sm:text-lg">
          Cyberas Intelligence unifie questionnaires, preuves, scans et intelligence
          artificielle pour évaluer, prioriser et réduire vos risques cyber.
        </p>

        {/* Couche 6 — actions. */}
        <div className="cy-enter cy-delay-4 mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/demo"
            className="cy-btn cy-btn-primary inline-flex items-center justify-center gap-2 rounded-md bg-[#DC2626] px-6 py-3.5 text-sm font-semibold text-white"
          >
            <Monitor size={17} />
            Demander une démonstration
          </Link>

          <Link
            to="/tarifs"
            className="cy-btn cy-btn-ghost inline-flex items-center justify-center gap-2 rounded-md border border-[#1E293B] px-6 py-3.5 text-sm font-semibold text-white"
          >
            <Tag size={17} />
            Voir nos offres
          </Link>

          <button
            type="button"
            onClick={() => {
              // Ouvrir la vidéo libère aussi la page : le visiteur a manifesté
              // son intention, la retenir davantage n'aurait plus de sens.
              onPlayVideo?.()
            }}
            className="cy-btn cy-btn-ghost inline-flex items-center justify-center gap-2 rounded-md border border-[#1E293B] px-6 py-3.5 text-sm font-semibold text-white"
          >
            <PlayCircle size={17} />
            Lire la vidéo
          </button>
        </div>

        {/* Couche 7 — bénéfices. Aucune animation permanente ici : seulement au survol. */}
        <ul className="cy-enter cy-delay-5 mt-9 grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg border border-[#141414] bg-[#141414] sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <li key={b.title} className="cy-benefit flex gap-3 border border-transparent bg-[#050505] p-4 text-left">
              <b.icon size={20} className="cy-benefit-icon mt-0.5 shrink-0 text-[#DC2626]" />
              <span>
                <span className="block text-sm font-semibold text-white">{b.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-[#8B98A5]">
                  {b.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Couche 8 — vagues de fond. Le motif est dupliqué horizontalement pour
          que la translation reboucle sans saut visible. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-44 overflow-hidden">
        <svg
          className="cy-wave-back absolute bottom-0 h-full"
          style={{ width: '200%' }}
          viewBox="0 0 2880 180"
          preserveAspectRatio="none"
        >
          <path
            d="M0 96 Q 180 56 360 96 T 720 96 T 1080 96 T 1440 96 T 1800 96 T 2160 96 T 2520 96 T 2880 96 V180 H0 Z"
            fill="rgba(220,38,38,0.07)"
          />
        </svg>
        <svg
          className="cy-wave absolute bottom-0 h-full"
          style={{ width: '200%' }}
          viewBox="0 0 2880 180"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120 Q 240 84 480 120 T 960 120 T 1440 120 T 1920 120 T 2400 120 T 2880 120 V180 H0 Z"
            fill="rgba(220,38,38,0.12)"
          />
        </svg>
      </div>

      {/* Sortie de couverture. Bouton et non simple indicateur : c'est le geste
          qui libère la page, il doit être atteignable au clavier. */}
      <button
        type="button"
        onClick={scrollToNext}
        aria-label="Découvrir la suite"
        className="cy-btn absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-lg px-4 py-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
      >
        <span className="block text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8B98A5]">
          Découvrir
        </span>
        <span className="cy-scroll-hint mx-auto mt-2 flex h-7 w-4 items-start justify-center rounded-full border border-[#2D3D54] pt-1.5">
          <span className="block h-1.5 w-0.5 rounded-full bg-[#8B98A5]" />
        </span>
        <ChevronDown size={14} className="cy-scroll-hint mx-auto mt-1 text-[#8B98A5]" />
      </button>
    </section>
  )
}
