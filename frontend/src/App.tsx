import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuditProvider } from './contexts/AuditContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { OrganizationProvider } from './contexts/OrganizationContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MarketingLayout } from './layouts/MarketingLayout'
import { AppLayout } from './layouts/AppLayout'
import { LandingPage } from './pages/marketing/LandingPage'
import { PlateformePage } from './pages/marketing/PlateformePage'
import { SolutionsPage } from './pages/marketing/SolutionsPage'
import { AgentsIaPage as AgentsIaMarketingPage } from './pages/marketing/AgentsIaPage'
import { RessourcesPage } from './pages/marketing/RessourcesPage'
import { AProposPage } from './pages/marketing/AProposPage'
import { TarifsPage } from './pages/marketing/TarifsPage'
import { ContactPage } from './pages/marketing/ContactPage'
import { DemoPage } from './pages/marketing/DemoPage'
import { CaseStudiesPage } from './pages/marketing/CaseStudiesPage'
import { OrganizationSignupPage } from './pages/auth/OrganizationSignupPage'
import { LoginPage } from './pages/auth/LoginPage'
import { PlaceholderPage } from './pages/app/PlaceholderPage'
import { DashboardUnified } from './pages/app/DashboardUnified'
import { AuditTrailPage } from './pages/app/AuditTrailPage'
import { AuditsPage } from './pages/app/AuditsPage'
import { AssetsPage } from './pages/app/AssetsPage'
import { FindingsPage } from './pages/app/FindingsPage'
import { RiskMapPage } from './pages/app/RiskMapPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrganizationProvider>
          <AuditProvider>
            <NotificationProvider>
              <BrowserRouter>
          <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plateforme" element={<PlateformePage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/agents-ia" element={<AgentsIaMarketingPage />} />
          <Route path="/ressources" element={<RessourcesPage />} />
          <Route path="/a-propos" element={<AProposPage />} />
          <Route path="/tarifs" element={<TarifsPage />} />
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
          <Route path="questionnaire" element={<PlaceholderPage title="Questionnaire" dark />} />
          <Route path="evidence" element={<PlaceholderPage title="Evidence" dark />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="scans" element={<PlaceholderPage title="Scans" dark />} />
          <Route path="findings" element={<FindingsPage />} />
          <Route path="risk-map" element={<RiskMapPage />} />
          <Route path="recommendations" element={<PlaceholderPage title="Recommendations" dark />} />
          <Route path="reports" element={<PlaceholderPage title="Reports" dark />} />
          <Route path="audit-trail" element={<AuditTrailPage />} />
          <Route path="organization" element={<PlaceholderPage title="Organization" dark />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" dark />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AuditProvider>
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
