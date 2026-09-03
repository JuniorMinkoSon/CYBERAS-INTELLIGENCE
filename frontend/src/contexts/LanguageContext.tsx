import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  fr: {
    // Navigation
    'nav.accueil': 'Accueil',
    'nav.plateforme': 'Plateforme',
    'nav.solutions': 'Solutions',
    'nav.agents': 'Agents IA',
    'nav.ressources': 'Ressources',
    'nav.apropos': 'À propos',
    'nav.tarifs': 'Tarifs',
    'nav.contact': 'Contact',
    'nav.connexion': 'Connexion',
    'nav.nouvellemission': '+ Nouvelle mission',

    // Hero
    'hero.label': 'SMARTEX Expertises — Innovation en Cybersécurité',
    'hero.title': "L'intelligence artificielle au service de votre Cybersécurité.",
    'hero.subtitle': 'CYBERAS Intelligence unifie vos audits assistés par IA, pentests automatisés, conformité, gestion des risques et remédiation dans une plateforme pour anticiper, détecter et neutraliser les menaces.',
    'hero.cta1': 'Demander un devis →',
    'hero.cta2': 'Découvrir les solutions ▸',
    'hero.badge': '🌍 Hébergé sécurisé · ✓ Conforme aux standards · 🛡 Sécurité par design',

    // SMARTEX Innovation
    'innovation.title': 'SMARTEX — Innovation en Cybersécurité',
    'innovation.subtitle': 'SMARTEX Expertises utilise l\'intelligence artificielle et l\'automatisation pour transformer la cybersécurité, l\'audit et la conformité à l\'échelle mondiale.',
    'innovation.ai': 'Intelligence Artificielle',
    'innovation.ai_desc': 'Automatisation intelligente des audits et pentests',
    'innovation.audit': 'Audit & Conformité',
    'innovation.audit_desc': 'Solutions pour ISO 27001, NIST, PCI-DSS, RGPD',
    'innovation.expertise': 'Expertise Reconnue',
    'innovation.expertise_desc': 'Équipe d\'experts certifiés en cybersécurité',

    // Mission
    'mission.label': 'Notre Mission',
    'mission.title': 'Démocratiser la cybersécurité de pointe',
    'mission.p1': 'SMARTEX Expertises a développé CYBERAS Intelligence pour faciliter la sécurité informatique, l\'audit de conformité et l\'évaluation des risques de sécurité des systèmes d\'information.',
    'mission.p2': 'Notre mission est de démocratiser l\'accès à l\'expertise en cybersécurité en utilisant l\'intelligence artificielle pour assister les professionnels et automatiser les tâches complexes d\'audit.',
    'mission.p3': 'Nous accompagnons les organisations dans l\'identification, l\'analyse et la gestion des risques, avec des solutions conformes aux standards internationaux (ISO 27001, NIST, PCI-DSS, RGPD).',
    'mission.p4': 'Par l\'automatisation des audits de conformité et l\'analyse intelligente des vulnérabilités, nous permettons aux équipes de sécurité de se concentrer sur la stratégie plutôt que la routine.',

    // Contact
    'contact.title': 'Contactez SMARTEX Expertises',
    'contact.subtitle': 'Demandez un devis, un audit, un pentest ou des informations sur nos solutions. Notre équipe répond sous 24h.',
    'contact.email': 'Email',
    'contact.phone': 'Bureau',
    'contact.headquarters': 'Siège',
    'contact.request_type': 'Type de demande',
    'contact.quote': 'Demander un devis',
    'contact.audit': 'Demander un audit',
    'contact.pentest': 'Demander un pentest',
    'contact.info': 'Informations',
    'contact.submit': 'Soumettre la demande →',

    // Tarifs
    'tarifs.title': 'Plans de cybersécurité adaptés à votre maturité',
    'tarifs.subtitle': 'Tarifs transparents en USD et EUR. Choisissez le plan qui correspond à vos besoins. Tous les plans incluent la plateforme CYBERAS Intelligence.',
    'tarifs.starter': 'Starter',
    'tarifs.starter_desc': 'Pour les petites organisations',
    'tarifs.professional': 'Professional',
    'tarifs.professional_desc': 'Pour les organisations en croissance',
    'tarifs.enterprise': 'Enterprise',
    'tarifs.enterprise_desc': 'Pour les grandes organisations',
    'tarifs.recommended': '⭐ Recommandé',
    'tarifs.month': 'par mois',
    'tarifs.start': 'Démarrer →',
    'tarifs.faq': 'Questions fréquentes',
    'tarifs.faq_title': 'À propos de nos tarifs',
    'tarifs.contact': 'Nous contacter',

    // À propos
    'apropos.title': 'Expert en Cybersécurité et Audit par IA',
    'apropos.subtitle': 'SMARTEX Expertises développe CYBERAS Intelligence : une solution d\'audit et de pentest assistés par l\'IA pour la sécurité informatique à l\'échelle mondiale.',
    'apropos.mission': 'Notre mission',
    'apropos.mission_desc': 'Démocratiser l\'accès à la cybersécurité de pointe grâce à l\'intelligence artificielle.',
    'apropos.team': 'L\'équipe',
    'apropos.team_desc': 'Experts certifiés en sécurité, ingénieurs IA et professionnels reconnus mondialement.',
    'apropos.partners': 'Partenaires',
    'apropos.partners_desc': 'Collaborations avec les acteurs majeurs du secteur cybersécurité et conformité.',
    'apropos.who': 'Qui nous sommes',
    'apropos.who_title': 'Experts en cybersécurité et audit par intelligence artificielle',
    'apropos.pillars': 'Nos piliers',
    'apropos.pillars_title': 'Trois fondements pour votre confiance',
  },

  en: {
    // Navigation
    'nav.accueil': 'Home',
    'nav.plateforme': 'Platform',
    'nav.solutions': 'Solutions',
    'nav.agents': 'AI Agents',
    'nav.ressources': 'Resources',
    'nav.apropos': 'About',
    'nav.tarifs': 'Pricing',
    'nav.contact': 'Contact',
    'nav.connexion': 'Sign In',
    'nav.nouvellemission': '+ New Mission',

    // Hero
    'hero.label': 'SMARTEX Expertises — Cybersecurity Innovation',
    'hero.title': 'Artificial intelligence serving your Cybersecurity.',
    'hero.subtitle': 'CYBERAS Intelligence unifies your AI-assisted audits, automated pentests, compliance, risk management and remediation in one platform to anticipate, detect and neutralize threats.',
    'hero.cta1': 'Request a Quote →',
    'hero.cta2': 'Discover Solutions ▸',
    'hero.badge': '🌍 Secure Hosting · ✓ Standards Compliant · 🛡 Security by Design',

    // SMARTEX Innovation
    'innovation.title': 'SMARTEX — Cybersecurity Innovation',
    'innovation.subtitle': 'SMARTEX Expertises uses artificial intelligence and automation to transform cybersecurity, audit and compliance globally.',
    'innovation.ai': 'Artificial Intelligence',
    'innovation.ai_desc': 'Intelligent automation of audits and penetration tests',
    'innovation.audit': 'Audit & Compliance',
    'innovation.audit_desc': 'Solutions for ISO 27001, NIST, PCI-DSS, GDPR',
    'innovation.expertise': 'Recognized Expertise',
    'innovation.expertise_desc': 'Team of certified cybersecurity experts',

    // Mission
    'mission.label': 'Our Mission',
    'mission.title': 'Democratizing Enterprise Cybersecurity',
    'mission.p1': 'SMARTEX Expertises developed CYBERAS Intelligence to facilitate information security, compliance audits and security risk assessment for information systems.',
    'mission.p2': 'Our mission is to democratize access to top-tier cybersecurity expertise by using artificial intelligence to assist professionals and automate complex audit tasks.',
    'mission.p3': 'We support organizations in identifying, analyzing and managing risks, with solutions compliant with international standards (ISO 27001, NIST, PCI-DSS, GDPR).',
    'mission.p4': 'Through automation of compliance audits and intelligent vulnerability analysis, we enable security teams to focus on strategy rather than routine tasks.',

    // Contact
    'contact.title': 'Contact SMARTEX Expertises',
    'contact.subtitle': 'Request a quote, audit, pentest or information about our solutions. Our team responds within 24 hours.',
    'contact.email': 'Email',
    'contact.phone': 'Office',
    'contact.headquarters': 'Headquarters',
    'contact.request_type': 'Request Type',
    'contact.quote': 'Request a Quote',
    'contact.audit': 'Request an Audit',
    'contact.pentest': 'Request a Pentest',
    'contact.info': 'Information',
    'contact.submit': 'Submit Request →',

    // Tarifs
    'tarifs.title': 'Cybersecurity Plans Tailored to Your Maturity',
    'tarifs.subtitle': 'Transparent pricing in USD and EUR. Choose the plan that matches your needs. All plans include the CYBERAS Intelligence platform.',
    'tarifs.starter': 'Starter',
    'tarifs.starter_desc': 'For small organizations',
    'tarifs.professional': 'Professional',
    'tarifs.professional_desc': 'For growing organizations',
    'tarifs.enterprise': 'Enterprise',
    'tarifs.enterprise_desc': 'For large organizations',
    'tarifs.recommended': '⭐ Recommended',
    'tarifs.month': 'per month',
    'tarifs.start': 'Get Started →',
    'tarifs.faq': 'Frequently Asked Questions',
    'tarifs.faq_title': 'About Our Pricing',
    'tarifs.contact': 'Contact Us',

    // À propos
    'apropos.title': 'Cybersecurity & AI Audit Expert',
    'apropos.subtitle': 'SMARTEX Expertises develops CYBERAS Intelligence: an AI-assisted audit and penetration testing solution for information security worldwide.',
    'apropos.mission': 'Our Mission',
    'apropos.mission_desc': 'Democratize access to enterprise-grade cybersecurity through artificial intelligence.',
    'apropos.team': 'Our Team',
    'apropos.team_desc': 'Certified security experts, AI engineers and globally recognized professionals.',
    'apropos.partners': 'Partners',
    'apropos.partners_desc': 'Collaborations with major players in cybersecurity and compliance sectors.',
    'apropos.who': 'Who We Are',
    'apropos.who_title': 'Cybersecurity and AI audit experts',
    'apropos.pillars': 'Our Pillars',
    'apropos.pillars_title': 'Three foundations for your trust',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved as Language) || 'fr'
  })

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
