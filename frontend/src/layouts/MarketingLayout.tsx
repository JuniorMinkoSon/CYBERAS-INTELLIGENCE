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
      <main className="flex-1">
        <Outlet />
      </main>
      <FooterPremium />
    </div>
  )
}
