import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MarketingLayout } from './layouts/MarketingLayout'
import { AppLayout } from './layouts/AppLayout'
import { LandingPage } from './pages/marketing/LandingPage'
import { PlateformePage } from './pages/marketing/PlateformePage'
import { SolutionsPage } from './pages/marketing/SolutionsPage'
import { AgentsIaPage } from './pages/marketing/AgentsIaPage'
import { RessourcesPage } from './pages/marketing/RessourcesPage'
import { AProposPage } from './pages/marketing/AProposPage'
import { TarifsPage } from './pages/marketing/TarifsPage'
import { ContactPage } from './pages/marketing/ContactPage'
import { DemoPage } from './pages/marketing/DemoPage'
import { LoginPage } from './pages/app/LoginPage'
import { PlaceholderPage } from './pages/app/PlaceholderPage'
import { AuditeurDashboard } from './pages/app/auditeur/AuditeurDashboard'
import { MissionsListPage } from './pages/app/auditeur/MissionsListPage'
import { MissionCommandCenter } from './pages/app/auditeur/MissionCommandCenter'
import { WizardStepPage } from './pages/app/auditeur/WizardStepPage'
import { VulnerabilitesPage } from './pages/app/auditeur/VulnerabilitesPage'
import { AdminDashboard } from './pages/app/admin/AdminDashboard'
import { UtilisateursPage, OrganisationsPage } from './pages/app/admin/AdminTablesPages'
import { RssiDashboard } from './pages/app/rssi/RssiDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plateforme" element={<PlateformePage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/agents-ia" element={<AgentsIaPage />} />
          <Route path="/ressources" element={<RessourcesPage />} />
          <Route path="/a-propos" element={<AProposPage />} />
          <Route path="/tarifs" element={<TarifsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>

        <Route path="/app" element={<LoginPage />} />

        <Route path="/app/auditeur" element={<AppLayout role="auditeur" />}>
          <Route index element={<AuditeurDashboard />} />
          <Route path="missions" element={<MissionsListPage />} />
          <Route path="missions/:id" element={<MissionCommandCenter />} />
          <Route path="missions/:id/:step" element={<WizardStepPage />} />
          <Route path="vulnerabilites" element={<VulnerabilitesPage />} />
          <Route path="parametres" element={<PlaceholderPage title="Paramètres" />} />
        </Route>

        <Route path="/app/admin" element={<AppLayout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="utilisateurs" element={<UtilisateursPage />} />
          <Route path="organisations" element={<OrganisationsPage />} />
          <Route path="abonnements" element={<PlaceholderPage title="Abonnements & Tarifs" />} />
          <Route path="logs" element={<PlaceholderPage title="Journaux d'activité" />} />
          <Route path="parametres" element={<PlaceholderPage title="Paramètres" />} />
        </Route>

        <Route path="/app/rssi" element={<AppLayout role="rssi" />}>
          <Route index element={<RssiDashboard />} />
          <Route path="risques" element={<PlaceholderPage title="Risques" dark />} />
          <Route path="vulnerabilites" element={<VulnerabilitesPage dark />} />
          <Route path="missions" element={<PlaceholderPage title="Audits & Missions" dark />} />
          <Route path="assets" element={<PlaceholderPage title="Assets" dark />} />
          <Route path="rapports" element={<PlaceholderPage title="Rapports" dark />} />
          <Route path="parametres" element={<PlaceholderPage title="Paramètres" dark />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
