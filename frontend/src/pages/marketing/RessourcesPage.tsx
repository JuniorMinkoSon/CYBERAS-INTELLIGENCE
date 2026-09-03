import { BookOpen, Newspaper, FileText, GraduationCap, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'

/**
 * Chaque ressource porte l'ancre visée par le méga-menu. Sans ces identifiants,
 * les liens /ressources#guides et suivants ouvraient la page en haut sans rien
 * cibler : l'ancre fait partie du contrat de navigation.
 */
const resources = [
  {
    anchor: 'guides',
    icon: BookOpen,
    title: 'Documentation',
    description: "Guides d'utilisation de la plateforme, des espaces Auditeur/Admin/RSSI et du wizard de mission.",
  },
  {
    anchor: 'articles',
    icon: Newspaper,
    title: 'Articles et analyses',
    description: 'Analyses de menaces, retours de terrain et actualités de la cybersécurité.',
  },
  {
    anchor: 'livres-blancs',
    icon: FileText,
    title: 'Guides & livres blancs',
    description: 'Méthodologie MEHARI, préparation ISO 27001, conformité RGPD, NIS2, DORA et ANSSI.',
  },
  {
    anchor: 'formation',
    icon: GraduationCap,
    title: 'Formation',
    description:
      "Sensibilisation des équipes et montée en compétences sur les référentiels, l'analyse de risque et la conduite d'audit.",
  },
  {
    anchor: 'evenements',
    icon: CalendarDays,
    title: 'Événements',
    description:
      'Webinaires et rencontres autour de la conduite d’audit, de la gestion des risques et des évolutions réglementaires.',
  },
]

export function RessourcesPage() {
  return (
    <>
      <PageHero
        label="Ressources"
        title={
          <>
            Tout pour maîtriser votre <span className="text-brand">posture de sécurité</span>
          </>
        }
        subtitle="Documentation, articles et guides pratiques rédigés par nos experts en audit et conformité."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {resources.map((r, i) => (
            <FadeIn key={r.title} delay={i * 0.08}>
              <div
                id={r.anchor}
                className="flex h-full scroll-mt-24 flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-brand/40 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <r.icon size={22} className="text-brand" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-text-on-light">{r.title}</h2>
                <p className="mt-2 flex-1 text-sm text-text-on-light-muted">{r.description}</p>
                <Link to="/contact" className="mt-5 text-sm font-semibold text-brand hover:underline">
                  Bientôt disponible — être notifié →
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  )
}
