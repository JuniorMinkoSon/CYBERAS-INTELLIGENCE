import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from '../components/marketing/Navbar'
import { FooterPremium } from '../components/marketing/FooterPremium'

export function MarketingLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  /* L'accueil n'a pas de pied de page. Il s'arrête sur la vidéo, et c'est
     voulu : la couverture pose la promesse, la vidéo la démontre, et le
     visiteur repart par la barre de navigation ou par l'un des trois boutons
     de la couverture. Un pied de page de quatre colonnes y rouvrirait tout le
     site au moment précis où l'on vient de le refermer. Les autres pages le
     gardent : elles se lisent jusqu'au bout, et c'est là qu'on cherche les
     mentions et les renvois. */
  const avecPied = pathname !== '/'

  return (
    /* `data-theme="site"` porte la charte du site vitrine (styles/site.css).
       Elle s'arrête à ce sous-arbre : l'espace de travail garde son thème. */
    <div data-theme="site" className="flex min-h-screen flex-col">
      <Navbar />
      {/* La barre de navigation est sortie du flux (`fixed`) pour rester
          visible même quand la couverture empêche le document de défiler.
          Le décalage est donc porté ici : sans lui, le haut de chaque page
          passerait sous la barre. La hauteur (72px) est celle du <header>. */}
      <main className="flex-1 pt-[72px]">
        <Outlet />
      </main>
      {avecPied && <FooterPremium />}
    </div>
  )
}
