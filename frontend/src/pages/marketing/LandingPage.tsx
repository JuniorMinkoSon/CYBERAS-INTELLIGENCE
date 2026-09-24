import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Crosshair, BarChart3, FileText, ShieldCheck, Layers, PlayCircle } from 'lucide-react'
import { Reveal, Eyebrow, REVEAL_EASE } from '../../components/marketing/SiteKit'
import { VideoInline } from '../../components/marketing/VideoInline'
import { useCoverLock } from '../../components/marketing/useCoverLock'

/**
 * Page d'accueil.
 *
 * <p>Deux temps, et rien d'autre : la couverture, qui pose la promesse, et la
 * vidéo, qui la démontre. La couverture est la seule surface sombre : la
 * marque en grand, l'écusson et les quatre piliers, puis le bandeau des
 * standards.
 *
 * <p>Tout ce qui suivait la vidéo a été retiré : visite du produit à onglets,
 * chaîne de valeur, référentiels du socle, résultats, engagements, appel
 * final. Ces sections redisaient en texte ce que la vidéo montre en deux
 * minutes, et chacune ouvrait une page du site que le menu annonce déjà.
 * L'accueil n'a pas de pied de page pour la même raison : on ne rouvre pas
 * tout le site au moment précis où l'on vient de le refermer. C'est
 * MarketingLayout qui l'omet, sur la seule route racine.
 *
 * <p>La couverture est figée : la page ne défile pas tant qu'on n'a pas
 * demandé la suite. « Démo » lève le verrou et amène à la vidéo, qui est la
 * section suivante. Le verrou tombe de lui-même sur écran court ou étroit, et
 * quand le système demande moins de mouvement : retenir la page est un effet,
 * et un visiteur qui les a désactivés ne doit pas avoir à chercher comment en
 * sortir. Le détail des trois pièges évités vit dans useCoverLock.
 */

/* Bandeau sous le hero : les cadres et textes que les clients demandent en premier. */
const STANDARDS = [
  { nom: 'ISO 27001', logo: '/images/logos/iso.svg' },
  { nom: 'NIST CSF', logo: '/images/logos/nist.svg' },
  { nom: 'NIS2' },
  { nom: 'RGPD' },
  { nom: 'RGSSI' },
  { nom: 'OWASP', logo: '/images/logos/owasp.svg' },
  { nom: 'CIS', logo: '/images/logos/cis.svg' },
  { nom: 'COBIT' },
  { nom: 'PCI DSS', logo: '/images/logos/pci-dss.svg' },
]

const PILIERS = [
  { t: 'Contrôles', s: 'Centralisés', icon: Crosshair, pos: 's-pilier-tl' },
  { t: 'Risques', s: 'En temps réel', icon: BarChart3, pos: 's-pilier-tr' },
  { t: 'Preuves', s: 'Traçables', icon: FileText, pos: 's-pilier-bl' },
  { t: 'Remédiation', s: 'Actionnable', icon: ShieldCheck, pos: 's-pilier-br' },
]

export function LandingPage() {
  const reduced = useReducedMotion()
  const { sectionRef, reveal } = useCoverLock()
  const entree = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: i * 0.07, ease: REVEAL_EASE },
        }

  return (
    <>
      {/* Couverture : fond bleu nuit, la marque en grand, l'écusson et les quatre piliers. */}
      <section ref={sectionRef} className="s-surface-deep s-home-hero">
        <div className="s-wrap flex flex-1 flex-col justify-center pt-10 pb-8 md:pt-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
            <div>
            <motion.p {...entree(0)} className="s-home-kicker">
              Pilotage <i /> Conformité <i /> Résilience
            </motion.p>
            <motion.h1 {...entree(1)} className="s-home-title mt-6">
              CYBERAS <span>INTELLIGENCE</span>
            </motion.h1>
            <motion.div {...entree(2)} className="s-home-rule mt-5" aria-hidden="true" />
            <motion.p {...entree(2)} className="s-home-sub mt-6">
              Anticipez les risques, renforcez <span>votre cybersécurité.</span>
            </motion.p>
            <motion.p {...entree(3)} className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-[color:var(--s-text)]">
              Un socle unifié pour piloter votre cybersécurité à partir d’une vision claire de vos
              risques. CYBERAS centralise vos référentiels, vos contrôles, vos preuves et vos plans
              de remédiation afin de vous offrir une vision consolidée de votre posture et de
              faciliter la prise de décision.
            </motion.p>
            </div>

          <motion.div
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.96 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.8, delay: 0.15, ease: REVEAL_EASE },
                })}
            className="s-home-visual"
          >
            <img
              src="/images/produit/hero-shield.jpg"
              alt="Écusson CYBERAS devant un globe numérique centré sur l’Afrique"
              width={1024}
              height={1024}
            />
            {PILIERS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.t}
                  className={`s-pilier ${p.pos}`}
                  {...(reduced
                    ? {}
                    : {
                        initial: { opacity: 0, y: 10 },
                        animate: { opacity: 1, y: [0, -6, 0] },
                        transition: {
                          opacity: { duration: 0.5, delay: 0.5 + i * 0.12 },
                          y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 },
                        },
                      })}
                >
                  <Icon size={20} aria-hidden="true" />
                  <strong>{p.t}</strong>
                  <span>
                    <i aria-hidden="true" /> {p.s}
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
          </div>

          {/* Les trois actions sur une seule ligne, sous l'image et sous le
              texte. Dans la colonne de gauche, la troisième passait à la ligne
              dès que la fenêtre se resserrait, et « Démo » se retrouvait seul
              sous les deux autres. Pleine largeur, les trois tiennent. */}
          <motion.div
            {...entree(4)}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
          >
            <Link to="/solution#presentation" className="s-btn s-home-btn-main w-full sm:w-auto">
              Découvrir la solution
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/offres" className="s-btn s-btn-secondary w-full sm:w-auto">
              <Layers size={18} aria-hidden="true" />
              Formule de collaboration
            </Link>
            {/* « Démo » libère la couverture et amène à la vidéo, qui est la
                section suivante. Un lien vers /demo aurait quitté la page
                alors que la démonstration est juste dessous : on aurait fait
                charger une seconde page pour montrer ce que celle-ci a déjà. */}
            <button
              type="button"
              onClick={reveal}
              className="s-btn s-btn-secondary w-full sm:w-auto"
            >
              <PlayCircle size={18} aria-hidden="true" />
              Démo
            </button>
          </motion.div>
        </div>

        {/* Les cadres défilent en boucle plutôt que de tenir sur une ligne
            fixe. Neuf entrées passaient à la ligne dès que la fenêtre se
            resserrait, et la bande devenait un pavé de deux rangs au bas de la
            couverture. Le défilement les garde sur une ligne quelle que soit la
            largeur, et s'arrête au survol pour qui veut en lire un.

            La piste contient la liste deux fois : l'animation la translate de
            moitié, et sans le doublon la boucle laisserait un blanc à chaque
            tour. Le second exemplaire est masqué aux lecteurs d'écran, qui
            n'ont pas à entendre neuf noms deux fois. */}
        <div className="s-home-standards">
          <p className="s-eyebrow text-center">Référentiels &amp; standards</p>
          <div className="s-marquee mt-5">
            <div className="s-marquee-track">
              {[0, 1].map((copie) => (
                <ul
                  key={copie}
                  className="flex shrink-0 items-center gap-x-10 pr-10 sm:gap-x-14 sm:pr-14"
                  aria-hidden={copie === 1 ? 'true' : undefined}
                >
                  {STANDARDS.map((s) => (
                    <li key={s.nom} className="s-standard">
                      {s.logo ? (
                        <img src={s.logo} alt="" loading="lazy" />
                      ) : (
                        <span className="s-standard-mark" aria-hidden="true" />
                      )}
                      <span>{s.nom}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* La vidéo de présentation, en lecture dès l'arrivée et sans le son.

          Elle clôt la page. Tout ce qui la suivait (visite du produit, chaîne
          de valeur, référentiels, arguments, appel final) redisait en texte ce
          que la vidéo montre en deux minutes, et repoussait le pied de page si
          loin que personne n'y arrivait. */}
      <section className="s-surface-white py-14 md:py-20">
        <div className="s-wrap">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>CYBERAS en vidéo</Eyebrow>
            <h2 className="s-h2 mt-4">Deux minutes pour comprendre la plateforme</h2>
          </Reveal>
          <Reveal delay={0.1} className="mx-auto mt-10 max-w-5xl">
            <VideoInline />
          </Reveal>
        </div>
      </section>
    </>
  )
}
