import { Bot, Cog } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'
import { agents } from '../../data/content'

/**
 * Ce qui assiste l'auditeur, nommé pour ce que c'est.
 *
 * <p>La page annonçait « trois agents IA ». Deux le sont — le lecteur de
 * preuves appelle un modèle de vision et de langage, l'analyste de risque
 * s'appuie sur le service ML. Le troisième n'appelle aucun modèle :
 * RecommendationService dérive le plan d'action de règles écrites.
 *
 * <p>L'étiquette suit donc le champ {@code nature} de chaque entrée plutôt
 * qu'un titre global. Et la mention du bas ne pouvait pas rester telle quelle :
 * « chaque suggestion d'un agent IA cite sa source » décrivait une garantie de
 * traçabilité en la rattachant à l'IA, alors que c'est le moteur déterministe
 * qui l'offre le plus solidement — il produit deux fois le même plan sur les
 * mêmes constats, ce qu'un modèle génératif ne garantit pas.
 */
export function AgentsIaPage() {
  return (
    <>
      <PageHero
        label="Assistance à l'audit"
        title={
          <>
            Trois assistants, trois moments de <span className="text-brand">l'audit</span>
          </>
        }
        subtitle="Lire les preuves déposées, coter les risques, formuler les actions. Deux s'appuient sur un modèle, le troisième sur des règles écrites. Chacun propose, l'auditeur décide."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a, i) => {
            const modele = a.nature === 'MODELE'
            return (
              <FadeIn key={a.title} delay={(i % 3) * 0.06}>
                <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                      {modele ? (
                        <Bot size={22} className="text-brand" />
                      ) : (
                        <Cog size={22} className="text-brand" />
                      )}
                    </span>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[0.6875rem] font-semibold text-text-on-light-muted">
                      {modele ? 'Modèle' : 'Règles déterministes'}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-text-on-light">{a.title}</h2>
                  <p className="mt-2 text-sm text-text-on-light-muted">{a.description}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
        <FadeIn className="mx-auto mt-12 max-w-3xl">
          <p className="rounded-lg border border-slate-200 bg-surface-light p-5 text-center text-sm text-text-on-light-muted">
            Aucune suggestion n'est appliquée sans validation explicite d'un auditeur, et chacune cite ce sur quoi
            elle se fonde : la pièce lue, le constat relevé ou le contrôle en défaut. Si un modèle est indisponible,
            l'audit se poursuit — le score et le plan d'action restent produits par le socle déterministe.
          </p>
        </FadeIn>
      </section>
      <CtaBanner />
    </>
  )
}
