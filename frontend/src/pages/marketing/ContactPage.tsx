import { useState, type FormEvent } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { PageHero, FadeIn } from '../../components/marketing/Shared'
import { contactClient } from '../../services/contactClient'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ fullName: '', email: '', company: '', message: '' })

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  /**
   * Le formulaire affichait « message envoyé » sans rien envoyer : la demande
   * n'existait nulle part et personne ne pouvait y répondre. L'accusé n'est
   * désormais montré que si le serveur a bien enregistré la demande.
   */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await contactClient.submit({
        kind: 'CONTACT',
        fullName: form.fullName,
        email: form.email,
        company: form.company,
        message: form.message,
      })
      setSent(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "L'envoi a échoué. Réessayez ou écrivez à contact@cyberas.ci.",
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <PageHero
        label="Contact"
        title={
          <>
            Parlons de votre <span className="text-brand">sécurité</span>
          </>
        }
        subtitle="Une question sur la plateforme, les tarifs ou un besoin spécifique ? Notre équipe vous répond sous 24h ouvrées."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <FadeIn>
            <div className="space-y-6">
              {[
                { icon: MapPin, label: 'Cabinet', value: 'SMARTEX EXPERTISES' },
                { icon: Mail, label: 'Courriel', value: 'contact@cyberas.ci' },
                { icon: Phone, label: 'Téléphone', value: '+225 07 88 95 03 62' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                    <c.icon size={20} className="text-brand" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-text-on-light">{c.label}</span>
                    <span className="block text-sm text-text-on-light-muted">{c.value}</span>
                  </span>
                </div>
              ))}
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-text-on-light">
                    Nom complet
                    <input
                      required
                      name="fullName"
                      value={form.fullName}
                      onChange={set('fullName')}
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                      placeholder="Ex. Armand T."
                    />
                  </label>
                  <label className="text-sm font-medium text-text-on-light">
                    Courriel professionnel
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={set('email')}
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                      placeholder="vous@entreprise.ci"
                    />
                  </label>
                </div>
                <label className="mt-4 block text-sm font-medium text-text-on-light">
                  Entreprise
                  <input
                    name="company"
                    value={form.company}
                    onChange={set('company')}
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                    placeholder="Nom de votre organisation"
                  />
                </label>
                <label className="mt-4 block text-sm font-medium text-text-on-light">
                  Message
                  <textarea
                    required
                    rows={5}
                    name="message"
                    value={form.message}
                    onChange={set('message')}
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                    placeholder="Décrivez votre besoin..."
                  />
                </label>
                {error && (
                  <p className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-6 w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                >
                  {sending ? 'Envoi…' : 'Envoyer le message →'}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>
    </>
  )
}
