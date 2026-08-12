import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Circle, ArrowRight, AlertCircle, Clock, Zap, FileText, TrendingUp } from 'lucide-react'
import { ProgressBar } from '../../../components/app/Shared'
import { missions, wizardSteps } from '../../../data/mock'

export function MissionCommandCenter() {
  const { id } = useParams()
  const mission = missions.find((m) => m.id === Number(id)) ?? missions[0]

  const questionnairePending = 4
  const documentsPending = 2
  const criticalVulns = 3

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted mb-2">Centre de Pilotage</p>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-white mb-2">{mission.name}</h1>
            <p className="text-lg text-text-on-dark-muted">{mission.organization}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-brand">{mission.progress}%</p>
            <p className="text-xs text-text-on-dark-muted mt-1">Complété</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-border-dark overflow-hidden">
          <div className="h-full bg-brand transition-all" style={{ width: `${mission.progress}%` }} />
        </div>
      </div>

      {/* KPIs — Actions Requises */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to={`/app/auditeur/missions/${mission.id}/questionnaire`}
          className="rounded-lg border-2 border-red-500/30 bg-red-500/10 p-5 hover:border-red-500/60 transition group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-red-300 uppercase tracking-wide">Questions sans réponse</p>
              <p className="text-4xl font-extrabold text-red-400 mt-2">{questionnairePending}</p>
              <p className="text-xs text-red-200 mt-2">Complétez le questionnaire ISO 27001</p>
            </div>
            <AlertCircle className="text-red-400 group-hover:translate-x-1 transition" size={24} />
          </div>
        </Link>

        <Link
          to={`/app/auditeur/missions/${mission.id}/collecte`}
          className="rounded-lg border-2 border-yellow-500/30 bg-yellow-500/10 p-5 hover:border-yellow-500/60 transition group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-yellow-300 uppercase tracking-wide">Documents à vérifier</p>
              <p className="text-4xl font-extrabold text-yellow-400 mt-2">{documentsPending}</p>
              <p className="text-xs text-yellow-200 mt-2">Validez les fichiers Nmap/Nessus</p>
            </div>
            <FileText className="text-yellow-400 group-hover:translate-x-1 transition" size={24} />
          </div>
        </Link>

        <Link
          to={`/app/auditeur/missions/${mission.id}/analyse`}
          className="rounded-lg border-2 border-red-500/30 bg-red-500/10 p-5 hover:border-red-500/60 transition group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-red-300 uppercase tracking-wide">Vulnérabilités critiques</p>
              <p className="text-4xl font-extrabold text-red-400 mt-2">{criticalVulns}</p>
              <p className="text-xs text-red-200 mt-2">Nécessitent une action immédiate</p>
            </div>
            <Zap className="text-red-400 group-hover:translate-x-1 transition" size={24} />
          </div>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Timeline of Steps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h2 className="text-lg font-bold text-white mb-1">Les 7 étapes de la mission</h2>
            <p className="text-sm text-text-on-dark-muted mb-6">Progression et statut</p>

            <div className="space-y-3">
              {wizardSteps.map((step, idx) => {
                const stepNumber = idx + 1
                const isCompleted = stepNumber < mission.currentStep
                const isCurrent = stepNumber === mission.currentStep
                const isPending = stepNumber > mission.currentStep

                return (
                  <Link
                    key={step.slug}
                    to={`/app/auditeur/missions/${mission.id}/${step.slug}`}
                    className={`rounded-lg border-2 p-4 transition ${
                      isCurrent
                        ? 'border-brand bg-brand/10'
                        : isCompleted
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-border-dark hover:border-brand/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm flex-shrink-0 ${
                            isCompleted
                              ? 'bg-green-600 text-white'
                              : isCurrent
                              ? 'bg-brand text-white'
                              : 'bg-border-dark text-text-on-dark-muted'
                          }`}
                        >
                          {isCompleted ? '✓' : stepNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white">{step.label}</p>
                          <p className="text-xs text-text-on-dark-muted mt-1">{step.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {isCompleted && (
                          <span className="px-3 py-1 rounded-full bg-green-600/20 text-green-300 text-xs font-bold">Complété</span>
                        )}
                        {isCurrent && (
                          <span className="px-3 py-1 rounded-full bg-brand/20 text-brand text-xs font-bold">En cours</span>
                        )}
                        {isPending && (
                          <span className="px-3 py-1 rounded-full bg-border-dark text-text-on-dark-muted text-xs font-bold">À faire</span>
                        )}
                        {!isCompleted && <ArrowRight size={16} className="text-text-on-dark-muted" />}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Prochaine Action Détaillée */}
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h2 className="text-lg font-bold text-white mb-1">Prochaine action</h2>
            <p className="text-sm text-text-on-dark-muted mb-4">Recommandation prioritaire</p>

            <div className="rounded-lg bg-bg-dark/50 border border-brand/30 p-4 mb-4 space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="text-brand mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-bold text-white">Compléter le questionnaire ISO 27001</p>
                  <p className="text-sm text-text-on-dark-muted mt-1">
                    4 questions restantes dans la catégorie "Politiques de sécurité" (A.5.1 à A.5.4)
                  </p>
                  <p className="text-xs text-brand mt-2 font-bold">Temps estimé: 15 minutes</p>
                </div>
              </div>
            </div>

            <Link
              to={`/app/auditeur/missions/${mission.id}/${wizardSteps[mission.currentStep - 1].slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand text-white font-bold hover:bg-brand-dark transition"
            >
              Aller à l'étape suivante <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right: Mission Info & Stats */}
        <div className="space-y-4">
          {/* Mission Details */}
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Détails de la mission</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-on-dark-muted text-xs font-bold">TYPE</p>
                <p className="text-white font-bold mt-1">{mission.type}</p>
              </div>
              <div>
                <p className="text-text-on-dark-muted text-xs font-bold">STATUT</p>
                <p className="text-white font-bold mt-1">{mission.status}</p>
              </div>
              <div>
                <p className="text-text-on-dark-muted text-xs font-bold">DEADLINE</p>
                <p className="text-white font-bold mt-1">{mission.deadline}</p>
              </div>
              <div>
                <p className="text-text-on-dark-muted text-xs font-bold">PÉRIMÈTRE</p>
                <p className="text-white font-bold mt-1">{mission.perimeter}</p>
              </div>
            </div>
          </div>

          {/* Étapes Completion Status */}
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Statut des étapes</h3>

            <div className="space-y-2">
              {wizardSteps.map((step, idx) => {
                const stepNumber = idx + 1
                const isCompleted = stepNumber < mission.currentStep
                const isCurrent = stepNumber === mission.currentStep

                return (
                  <div key={step.slug} className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0 text-xs font-bold text-white bg-border-dark">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : isCurrent ? (
                        <Circle size={16} className="text-brand" />
                      ) : (
                        <Circle size={16} className="text-text-on-dark-muted" />
                      )}
                    </div>
                    <span className={`text-xs ${
                      isCompleted ? 'text-green-400' : isCurrent ? 'text-brand font-bold' : 'text-text-on-dark-muted'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-lg border-2 border-brand/30 bg-surface-dark/50 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Aperçu</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-on-dark-muted text-xs mb-1">Questionnaire ISO 27001</p>
                <div className="flex items-center gap-2">
                  <ProgressBar value={75} />
                  <span className="text-xs font-bold text-brand">75%</span>
                </div>
              </div>
              <div>
                <p className="text-text-on-dark-muted text-xs mb-1">Collecte de données</p>
                <div className="flex items-center gap-2">
                  <ProgressBar value={60} />
                  <span className="text-xs font-bold text-brand">60%</span>
                </div>
              </div>
              <div>
                <p className="text-text-on-dark-muted text-xs mb-1">Analyse résultats</p>
                <div className="flex items-center gap-2">
                  <ProgressBar value={30} />
                  <span className="text-xs font-bold text-brand">30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Additional Context */}
      {mission.progress === 100 && (
        <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-6 flex items-center gap-4">
          <CheckCircle2 size={32} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-300 text-lg">Mission complétée !</p>
            <p className="text-sm text-green-200 mt-1">
              Toutes les étapes ont été accomplies. Vous pouvez maintenant valider les résultats et générer le rapport final.
            </p>
          </div>
          <button className="ml-auto px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition flex-shrink-0">
            Valider et clôturer
          </button>
        </div>
      )}
    </div>
  )
}
