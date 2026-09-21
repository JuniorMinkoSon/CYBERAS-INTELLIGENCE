import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

/**
 * Filet pour les morceaux de code qui n'arrivent pas.
 *
 * <h2>Le cas qu'elle couvre</h2>
 *
 * <p>Les pages sont chargées à la demande. Quand un de ces morceaux ne peut pas
 * être récupéré : réseau coupé, ou fichier disparu après un redéploiement alors
 * que le navigateur garde l'ancien index.html : l'import échoue, Suspense
 * propage l'erreur, et l'utilisateur n'obtient qu'un écran blanc. Aucune trace,
 * aucune action possible.
 *
 * <p>Le rechargement résout le second cas à tous les coups : il va rechercher
 * l'index.html courant, donc les bons morceaux. C'est pourquoi le bouton est
 * proposé en premier.
 *
 * <p>Une classe est nécessaire ici : React n'expose pas encore les frontières
 * d'erreur aux composants de fonction.
 */
interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
  message: string
}

export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      failed: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // Consigné plutôt que silencieux : sans cette trace, un échec de
    // chargement en production ne laisse rien à examiner.
    console.error('Chargement de page impossible', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) {
      return this.props.children
    }

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold text-white">Cette page n'a pas pu être chargée</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-text-on-dark-muted">
          Le plus souvent, une version plus récente du site a été publiée pendant
          votre visite. Recharger suffit à récupérer la bonne.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Recharger la page
        </button>
        <p className="mt-6 max-w-md break-words font-mono text-[11px] text-text-on-dark-muted/70">
          {this.state.message}
        </p>
      </div>
    )
  }
}
