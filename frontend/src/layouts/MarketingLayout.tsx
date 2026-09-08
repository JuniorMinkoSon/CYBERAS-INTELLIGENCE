import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from '../components/marketing/Navbar'
import { FooterPremium } from '../components/marketing/FooterPremium'

export function MarketingLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-bg-dark">
      <Navbar />
      {/* La barre de navigation est sortie du flux (`fixed`) pour rester
          visible même quand la couverture empêche le document de défiler.
          Le décalage est donc porté ici : sans lui, le haut de chaque page
          passerait sous la barre. La hauteur (4rem) est celle du <header>. */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <FooterPremium />
    </div>
  )
}
