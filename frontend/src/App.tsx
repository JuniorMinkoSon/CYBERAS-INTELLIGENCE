import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuditProvider } from './contexts/AuditContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { OrganizationProvider } from './contexts/OrganizationContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MarketingLayout } from './layouts/MarketingLayout'
import { AppLayout } from './layouts/AppLayout'
import { HashScroll } from './components/marketing/HashScroll'
import { ChunkErrorBoundary } from './components/app/ChunkErrorBoundary'
import { PageLoader } from './components/PageLoader'
import { LandingPage } from './pages/marketing/LandingPage'

/**
 * Découpage du paquet.
 *
 * <p>Toutes les pages étaient importées d'emblée : un visiteur venu lire la
 * page d'accueil téléchargeait l'application d'audit complète : questionnaire,
 * scans, rapports, administration : soit un mégaoctet de JavaScript dont il
 * n'exécutait presque rien. Vite le signalait à chaque construction.
 *
 * <p>Seule la page d'accueil reste chargée d'emblée : c'est la première vue, et
 * la différer ferait apparaître un écran d'attente là où il faut du contenu.
 * Tout le reste est chargé à la demande, au premier accès à la route.
 */
const PlateformePage = lazy(() => import('./pages/marketing/PlateformePage').then(m => ({ default: m.PlateformePage })))
const SolutionsPage = lazy(() => import('./pages/marketing/SolutionsPage').then(m => ({ default: m.SolutionsPage })))
const SolutionPage = lazy(() => import('./pages/marketing/SolutionPage').then(m => ({ default: m.SolutionPage })))
const FonctionnalitesPage = lazy(() => import('./pages/marketing/FonctionnalitesPage').then(m => ({ default: m.FonctionnalitesPage })))
const OffresPage = lazy(() => import('./pages/marketing/OffresPage').then(m => ({ default: m.OffresPage })))
const AgentsIaMarketingPage = lazy(() => import('./pages/marketing/AgentsIaPage').then(m => ({ default: m.AgentsIaPage })))
const RessourcesPage = lazy(() => import('./pages/marketing/RessourcesPage').then(m => ({ default: m.RessourcesPage })))
const ReferentielsPage = lazy(() => import('./pages/marketing/ReferentielsPage').then(m => ({ default: m.ReferentielsPage })))
const FormationPage = lazy(() => import('./pages/marketing/FormationPage').then(m => ({ default: m.FormationPage })))
const CtfPage = lazy(() => import('./pages/marketing/CtfPage').then(m => ({ default: m.CtfPage })))
const AProposPage = lazy(() => import('./pages/marketing/AProposPage').then(m => ({ default: m.AProposPage })))
const EvaluationPage = lazy(() => import('./pages/marketing/EvaluationPage').then(m => ({ default: m.EvaluationPage })))
const MethodologiePage = lazy(() => import('./pages/marketing/MethodologiePage').then(m => ({ default: m.MethodologiePage })))
const SuiviPage = lazy(() => import('./pages/marketing/SuiviPage').then(m => ({ default: m.SuiviPage })))
const ContactPage = lazy(() => import('./pages/marketing/ContactPage').then(m => ({ default: m.ContactPage })))
const DemoPage = lazy(() => import('./pages/marketing/DemoPage').then(m => ({ default: m.DemoPage })))
const CaseStudiesPage = lazy(() => import('./pages/marketing/CaseStudiesPage').then(m => ({ default: m.CaseStudiesPage })))

const OrganizationSignupPage = lazy(() => import('./pages/auth/OrganizationSignupPage').then(m => ({ default: m.OrganizationSignupPage })))
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const AdminProjectsPage = lazy(() => import('./pages/app/AdminProjectsPage').then(m => ({ default: m.AdminProjectsPage })))
const AdminProjectDetailPage = lazy(() => import('./pages/app/AdminProjectDetailPage').then(m => ({ default: m.AdminProjectDetailPage })))

const RecommendationsPage = lazy(() => import('./pages/app/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })))
const AdminPage = lazy(() => import('./pages/app/AdminPage').then(m => ({ default: m.AdminPage })))
const EvidencePage = lazy(() => import('./pages/app/EvidencePage').then(m => ({ default: m.EvidencePage })))
const ReportsPage = lazy(() => import('./pages/app/ReportsPage').then(m => ({ default: m.ReportsPage })))
const ScansPage = lazy(() => import('./pages/app/ScansPage').then(m => ({ default: m.ScansPage })))
const OrganizationPage = lazy(() => import('./pages/app/OrganizationPage').then(m => ({ default: m.OrganizationPage })))
const QuestionnairePage = lazy(() => import('./pages/app/QuestionnairePage').then(m => ({ default: m.QuestionnairePage })))
const QuestionnaireAuditPicker = lazy(() => import('./pages/app/QuestionnaireAuditPicker').then(m => ({ default: m.QuestionnaireAuditPicker })))
const ParcoursMission = lazy(() => import('./pages/app/ParcoursMission').then(m => ({ default: m.ParcoursMission })))
const DashboardUnified = lazy(() => import('./pages/app/DashboardUnified').then(m => ({ default: m.DashboardUnified })))
const AuditTrailPage = lazy(() => import('./pages/app/AuditTrailPage').then(m => ({ default: m.AuditTrailPage })))
const AuditsPage = lazy(() => import('./pages/app/AuditsPage').then(m => ({ default: m.AuditsPage })))
const AssetsPage = lazy(() => import('./pages/app/AssetsPage').then(m => ({ default: m.AssetsPage })))
const RiskMapPage = lazy(() => import('./pages/app/RiskMapPage').then(m => ({ default: m.RiskMapPage })))


export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <AuthProvider>
        <OrganizationProvider>
          <AuditProvider>
            <NotificationProvider>
              <BrowserRouter>
          <HashScroll />
          <ChunkErrorBoundary>
          <Suspense fallback={<PageLoader />}>
          <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          {/* Les sept entrées du menu, dans l'ordre de la barre. */}
          <Route path="/solution" element={<SolutionPage />} />
          <Route path="/fonctionnalites" element={<FonctionnalitesPage />} />
          <Route path="/offres" element={<OffresPage />} />
          <Route path="/ressources" element={<RessourcesPage />} />
          <Route path="/suivi" element={<SuiviPage />} />
          <Route path="/formation" element={<FormationPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />

          {/* Pages hors menu, toujours adressables : elles sont référencées
              depuis les nouvelles pages et depuis le pied de page. */}
          <Route path="/plateforme" element={<PlateformePage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/agents-ia" element={<AgentsIaMarketingPage />} />
          <Route path="/referentiels" element={<ReferentielsPage />} />
          <Route path="/ctf" element={<CtfPage />} />
          <Route path="/a-propos" element={<AProposPage />} />
          <Route path="/methodologie" element={<MethodologiePage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Adresses retirées de la refonte. Elles redirigent plutôt que de
              disparaître : des liens sont déjà partagés, et un lien mort se
              lit comme un service arrêté. Le déploiement est absorbé par
              « Lancer une évaluation », les tarifs par « Offres ». */}
          <Route path="/deploiement" element={<Navigate to="/evaluation" replace />} />
          <Route path="/tarifs" element={<Navigate to="/offres" replace />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/cas-clients" element={<CaseStudiesPage />} />
        </Route>

        <Route path="/inscription" element={<OrganizationSignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardUnified />} />
          <Route path="audits" element={<AuditsPage />} />
          <Route path="questionnaire" element={<QuestionnaireAuditPicker />} />
          <Route path="audits/:auditId/parcours" element={<ParcoursMission />} />
          <Route path="audits/:auditId/questionnaire" element={<QuestionnairePage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="scans" element={<ScansPage />} />
          <Route path="risk-map" element={<RiskMapPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit-trail" element={<AuditTrailPage />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/projets" element={<AdminProjectsPage />} />
          <Route path="admin/projets/:projectId" element={<AdminProjectDetailPage />} />
          {/* « Écarts » et « Réglages » sont retirés : la première doublait les
              recommandations sans rien ajouter, la seconde n'était qu'un
              gabarit vide. Les routes tombent sur la redirection ci-dessous. */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
          </Suspense>
          </ChunkErrorBoundary>
              </BrowserRouter>
            </NotificationProvider>
          </AuditProvider>
        </OrganizationProvider>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
