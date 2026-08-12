import { useState, type FormEvent } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { PageHero, FadeIn } from '../../components/marketing/Shared'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  const [requestType, setRequestType] = useState('devis')

  return (
    <>
      <PageHero
        label="Contact"
        title={
          <>
            Contactez <span className="text-brand">SMARTEX Expertises</span>
          </>
        }
        subtitle="Demandez un devis, un audit, un pentest ou des informations sur nos solutions. Notre équipe répond sous 24h."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <FadeIn>
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <h3 className="text-lg font-bold text-text-on-light mb-4">SMARTEX Expertises</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 flex-shrink-0">
                      <Mail size={20} className="text-brand" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-text-on-light">Email</span>
                      <span className="block text-sm text-text-on-light-muted">contact@smartex-expertises.com</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 flex-shrink-0">
                      <Phone size={20} className="text-brand" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-text-on-light">Bureau</span>
                      <span className="block text-sm text-text-on-light-muted">+225 0788950362</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 flex-shrink-0">
                      <MapPin size={20} className="text-brand" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-text-on-light">Région</span>
                      <span className="block text-sm text-text-on-light-muted">Afrique de l'Ouest</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <h3 className="font-bold text-text-on-light mb-4">Types de demandes</h3>
                <div className="space-y-2">
                  {[
                    { id: 'devis', label: 'Demander un devis', icon: '💰' },
                    { id: 'audit', label: 'Demander un audit', icon: '🔍' },
                    { id: 'pentest', label: 'Demander un pentest', icon: '⚔️' },
                    { id: 'info', label: 'Informations', icon: 'ℹ️' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setRequestType(type.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                        requestType === type.id
                          ? 'bg-brand/10 border border-brand text-brand'
                          : 'border border-slate-200 text-text-on-light hover:border-brand/50'
                      }`}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            {sent ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-xs">
                <p className="text-lg font-semibold text-text-on-light">
                  Merci ! Votre message a bien été envoyé. Nous revenons vers vous très vite.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-4 p-3 rounded-lg bg-brand/5 border border-brand/20">
                  <p className="text-sm font-medium text-text-on-light">
                    Type de demande: <span className="text-brand font-bold">
                      {requestType === 'devis' && 'Devis'}
                      {requestType === 'audit' && 'Audit'}
                      {requestType === 'pentest' && 'Pentest'}
                      {requestType === 'info' && 'Informations'}
                    </span>
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-text-on-light">
                    Nom complet
                    <input
                      required
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                      placeholder="Ex. Armand T."
                    />
                  </label>
                  <label className="text-sm font-medium text-text-on-light">
                    Email professionnel
                    <input
                      required
                      type="email"
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                      placeholder="vous@entreprise.com"
                    />
                  </label>
                </div>
                <label className="mt-4 block text-sm font-medium text-text-on-light">
                  Entreprise / Organisation
                  <input
                    required
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                    placeholder="Nom de votre organisation"
                  />
                </label>
                <label className="mt-4 block text-sm font-medium text-text-on-light">
                  Message / Détails
                  <textarea
                    required
                    rows={5}
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                    placeholder={requestType === 'devis' ? 'Décrivez votre besoin et l\'envergure du projet...' : 'Décrivez votre demande en détail...'}
                  />
                </label>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Soumettre la demande →
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>
    </>
  )
}
