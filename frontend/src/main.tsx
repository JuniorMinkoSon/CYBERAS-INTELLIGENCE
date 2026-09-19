import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/animations.css'
// Charte du site vitrine. Chargée après les précédentes : elle ne s'applique
// qu'au sous-arbre `data-theme="site"` et ne peut donc pas déborder sur
// l'espace de travail, mais l'ordre garde la cascade lisible.
import './styles/site.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
