import { Link } from 'react-router-dom'
import {
  Terminal, KeyRound, Image, Fingerprint, Globe, UserPlus,
  Flag, TrendingUp, Users, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHero, FadeIn, SectionLabel, CtaBanner } from '../../components/marketing/Shared'
import { GenerativeVisual } from '../../components/marketing/GenerativeVisual'

/**
 * SMARTEX CTF Challenge.
 *
 * La page explique d'abord ce qu'est un CTF — beaucoup de visiteurs l'ignorent —
 * avant de détailler les catégories. Chaque catégorie décrit ce qu'on y apprend
 * réellement, pas seulement son intitulé : c'est ce qui distingue un parcours
 * d'entraînement d'une liste de mots-clés techniques.
 */

interface Category {
  icon: LucideIcon
  title: string
  intro: string
  skills: { label: string; detail: string }[]
  seed: string
  variant: 'network' | 'grid' | 'pulse' | 'layers'
}

const categories: Category[] = [
  {
    icon: Terminal,
    title: 'Linux',
    intro: "Maîtriser le système en résolvant des défis pratiques.",
    skills: [
      {
        label: 'Exploration du système',
        detail: 'Navigation dans le système de fichiers, gestion des permissions, commandes ls, grep, find, chmod.',
      },
      {
        label: 'Scripts et automatisation',
        detail: 'Écriture et exécution de scripts bash pour automatiser des tâches répétitives.',
      },
      {
        label: 'Sécurité et exploitation',
        detail: 'Vulnérabilités courantes : failles de permission, erreurs de configuration, et leur exploitation.',
      },
    ],
    seed: 'ctf-linux',
    variant: 'grid',
  },
  {
    icon: KeyRound,
    title: 'Cryptographie',
    intro: 'Casser des codes et comprendre les bases du chiffrement.',
    skills: [
      {
        label: 'Chiffrement symétrique et asymétrique',
        detail: 'Déchiffrement de messages : chiffrement de César, XOR, clés publiques et privées.',
      },
      {
        label: 'Analyse de fréquence',
        detail: 'Méthodes d’analyse pour casser des codes reposant sur la fréquence des lettres.',
      },
      {
        label: 'Fonctions de hachage',
        detail: 'Compréhension du hachage, cassage de hashs simples, exploration des collisions.',
      },
    ],
    seed: 'ctf-crypto',
    variant: 'pulse',
  },
  {
    icon: Image,
    title: 'Stéganographie',
    intro: "L'art de dissimuler des informations dans des images, des sons ou des vidéos.",
    skills: [
      {
        label: 'Cacher et dénicher des données',
        detail: 'Insertion de messages dans des images (encodage LSB), des fichiers audio ou vidéo, puis leur récupération.',
      },
      {
        label: 'Manipulation d’images',
        detail: 'Modification de métadonnées et découverte de messages par analyse des pixels.',
      },
      {
        label: 'Récupération de données cachées',
        detail: 'Extraction d’informations dissimulées à l’aide de Stegsolve, Steghide et d’éditeurs hexadécimaux.',
      },
    ],
    seed: 'ctf-stegano',
    variant: 'layers',
  },
  {
    icon: Fingerprint,
    title: 'Forensic',
    intro: 'Récupérer et analyser des données pour reconstituer ce qui s’est passé.',
    skills: [
      {
        label: 'Analyse de disque',
        detail: 'Exploration d’images disque, récupération de fichiers supprimés, lecture des journaux d’événements.',
      },
      {
        label: 'Analyse de mémoire',
        detail: 'Étude de dumps mémoire pour identifier des artefacts et détecter des processus malveillants.',
      },
      {
        label: 'Investigation réseau',
        detail: 'Analyse de captures PCAP pour reconstituer des communications et repérer des activités suspectes.',
      },
    ],
    seed: 'ctf-forensic',
    variant: 'network',
  },
  {
    icon: Globe,
    title: 'OSINT',
    intro: 'Exploiter les informations publiquement disponibles.',
    skills: [
      {
        label: 'Recherche sur les réseaux sociaux',
        detail: 'Collecte d’informations, suivi d’activités en ligne, mise au jour de liens entre individus.',
      },
      {
        label: 'Recherche de données publiques',
        detail: 'Exploitation de bases publiques, de registres de domaines et d’archives.',
      },
      {
        label: 'Profiling et reconstitution',
        detail: 'Regroupement de fragments dispersés pour reconstituer un profil ou un enchaînement d’événements.',
      },
    ],
    seed: 'ctf-osint',
    variant: 'network',
  },
]

const howItWorks: { icon: LucideIcon; step: string; title: string; description: string }[] = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Inscrivez-vous',
    description: 'Créez votre compte participant et accédez à la plateforme de défis.',
  },
  {
    icon: Flag,
    step: '02',
    title: 'Choisissez un défi',
    description: 'Commencez par la catégorie et le niveau qui correspondent à votre expérience.',
  },
  {
    icon: Terminal,
    step: '03',
    title: 'Résolvez et soumettez',
    description: 'Trouvez le drapeau — un code secret — et soumettez-le pour marquer des points.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Suivez votre progression',
    description: 'Consultez votre score, votre classement et les compétences travaillées.',
  },
]

export function CtfPage() {
  return (
    <>
      <PageHero
        label="SMARTEX CTF Challenge"
        title={
          <>
            Apprenez la cybersécurité en <span className="text-brand">résolvant des défis</span>
          </>
        }
        subtitle="Un Capture The Flag est une compétition où l'on résout des problèmes techniques réels. Chaque défi résolu rapproche du drapeau — un code secret à soumettre pour marquer des points."
      />

      {/* Définition. Beaucoup de visiteurs découvrent le format ici. */}
      <section id="a-propos" className="scroll-mt-24 bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionLabel>Qu’est-ce qu’un CTF ?</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              Une compétition où l'on apprend en faisant
            </h2>
            <div className="mt-6 space-y-4 text-text-on-dark-muted">
              <p>
                Un Capture The Flag met les participants face à des problèmes techniques
                concrets : cryptographie, investigation numérique, exploitation de systèmes,
                recherche en sources ouvertes.
              </p>
              <p>
                Chaque défi résolu révèle un drapeau — un code secret — que l'on soumet pour
                marquer des points. La progression est mesurable et les compétences acquises
                se transposent directement en situation professionnelle.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="overflow-hidden rounded-xl border border-border-dark">
              <div className="h-64">
                <GenerativeVisual seed="ctf-hero" variant="network" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Catégories. Le détail des compétences distingue un parcours
          d'entraînement d'une simple liste d'intitulés. */}
      <section id="categories" className="scroll-mt-24 bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Catégories de défis</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-text-on-light sm:text-4xl">
            Cinq domaines, du système à l'investigation
          </h2>

          <div className="mt-12 space-y-5">
            {categories.map((c, i) => (
              <FadeIn key={c.title} delay={Math.min(i, 3) * 0.06}>
                <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs transition-all hover:border-brand/40 hover:shadow-md">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-56 lg:shrink-0">
                      <div className="h-32 lg:h-full">
                        <GenerativeVisual seed={c.seed} variant={c.variant} />
                      </div>
                    </div>

                    <div className="flex-1 p-6 sm:p-8">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10">
                          <c.icon size={20} className="text-brand" />
                        </span>
                        <h3 className="text-xl font-bold text-text-on-light">{c.title}</h3>
                      </div>

                      <p className="mt-3 text-sm text-text-on-light-muted">{c.intro}</p>

                      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                        {c.skills.map((s) => (
                          <div key={s.label}>
                            <dt className="text-xs font-bold uppercase tracking-wider text-brand">
                              {s.label}
                            </dt>
                            <dd className="mt-1.5 text-xs leading-relaxed text-text-on-light-muted">
                              {s.detail}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Déroulé, avec le même trait de progression que la méthodologie. */}
      <section className="bg-bg-dark px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Comment ça marche</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Quatre étapes pour commencer
          </h2>

          <div className="relative mt-14">
            {/* Trait reliant les étapes : horizontal sur grand écran, vertical
                en dessous, comme sur la méthodologie. */}
            <div aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px bg-[#1E293B] lg:block" />
            <div aria-hidden="true" className="absolute bottom-0 left-7 top-0 w-px bg-[#1E293B] lg:hidden" />

            <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-6">
              {howItWorks.map((s, i) => (
                <FadeIn key={s.step} delay={i * 0.07}>
                  <li className="flex gap-5 lg:block">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-[#0B0F14] text-sm font-extrabold text-brand">
                      {s.step}
                    </div>
                    <div className="lg:mt-6">
                      <div className="flex items-center gap-2">
                        <s.icon size={16} className="text-brand" />
                        <h3 className="font-bold text-white">{s.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-text-on-dark-muted">
                        {s.description}
                      </p>
                    </div>
                  </li>
                </FadeIn>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Argument de participation. */}
      <section className="bg-surface-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
              <Users size={24} className="text-brand" />
            </span>
            <h2 className="mt-6 text-3xl font-extrabold text-text-on-light sm:text-4xl">
              Pourquoi participer ?
            </h2>
            <p className="mt-5 text-text-on-light-muted">
              Débutant ou expert, un CTF développe des compétences qui se transposent
              directement en situation réelle. C'est aussi l'occasion de rejoindre une
              communauté de praticiens et d'apprendre de nouvelles techniques.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Participer au challenge <ArrowRight size={16} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
