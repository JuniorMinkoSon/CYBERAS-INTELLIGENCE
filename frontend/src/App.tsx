import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MarketingLayout } from './layouts/MarketingLayout'
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
      </Routes>
    </BrowserRouter>
  )
}
