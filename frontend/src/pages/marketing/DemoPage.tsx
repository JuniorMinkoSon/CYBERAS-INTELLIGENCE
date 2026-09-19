import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Clock, Mail, MonitorPlay, Phone, ShieldCheck, Users } from 'lucide-react'
import { PageHero, FadeIn } from '../../components/marketing/Shared'
import { contactClient } from '../../services/contactClient'

/**
 * Prise de rendez-vous pour une présentation et une démonstration.
 *
 * <p>Cette adresse renvoyait vers les tarifs. C'était une erreur de lecture :
 * celui qui clique « Demander une démonstration » ne demande pas un prix, il
 * demande qu'on lui montre — et qu'on le rappelle. La page redevient donc ce
 * que son nom promet : un endroit où laisser ses coordonnées et un créneau.
 *
 * <p>Le ton est celui d'un accueil, pas d'un guichet. On dit d'abord ce qui va
 * se passer — combien de temps, avec qui, ce qu'on verra — puis seulement on
 * demande des coordonnées. Les champs sont réduits à ce qui sert à préparer la
 * séance ; tout le reste est facultatif.
 *
 * <p>La demande est déposée sur la même ressource que le formulaire de
 * contact, avec le type {@code DEMO} : elle apparaît dans la boîte de
 * réception de l'administration avec le créneau souhaité en tête du message.
 */

const SECTEURS = [
  ['FINANCE', 'Banque, finance, assurance'],
  ['SANTE', 'Santé et médico-social'],
  ['PUBLIC_SECTOR', 'Secteur public et administration'],
  ['ENERGIE_UTILITIES', 'Énergie, eau, transport'],
  ['TELECOM', 'Télécommunications et hébergement'],
  ['INDUSTRIE', 'Industrie et production'],
  ['COMMERCE', 'Commerce et distribution'],
  ['TECHNOLOGIE', 'Technologie et services numériques'],
  ['EDUCATION', 'Enseignement et recherche'],
  ['SERVICES_PRO', 'Services professionnels et conseil'],
  ['ASSOCIATIF', 'Associatif et ONG'],
  ['AUTRE', 'Autre'],
] as const

const TAILLES = ['1 à 10', '11 à 50', '51 à 250', '251 à 1000', 'Plus de 1000'] as const

const MOMENTS = ['Matin (9h – 12h)', 'Après-midi (14h – 17h)', 'Indifférent'] as const

const DEROULE = [
  {
    icon: Clock,
    title: 'En visioconférence',
    text: "Un lien vous est envoyé avant la séance. Rien à installer de votre côté.",
  },
  {
    icon: Users,
    title: 'Avec un consultant, pas un commercial',
    text: "La personne qui vous présente la plateforme est celle qui mène des audits avec.",
  },
  {
    icon: MonitorPlay,
    title: 'Une mission réelle, de bout en bout',
    text: "Questionnaire par domaine, dépôt des pièces, score par référentiel et rapport — sur un cas proche du vôtre.",
  },
  {
    icon: ShieldCheck,
    title: 'Vos questions, sans engagement',
    text: "Vous repartez avec une idée précise de ce que Cyberas ferait chez vous, et de ce que ça coûterait.",
  },
]

const inputClass =
  'mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'

export function DemoPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    sector: '',
    companySize: '',
    date: '',
    moment: '',
    message: '',
  })

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  // Demain au plus tôt : un créneau le jour même ne laisse pas le temps de
  // préparer la séance.
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    // Le créneau n'a pas de champ dédié côté serveur : il ouvre le message,
    // c'est la première chose que lira la personne qui rappelle.
    const creneau = [
      form.date ? `Date souhaitée : ${form.date}` : null,
      form.moment ? `Moment : ${form.moment}` : null,
    ].filter(Boolean).join(' · ')

    try {
      await contactClient.submit({
        kind: 'DEMO',
        fullName: form.fullName,
        email: form.email,
        company: form.company,
        phone: form.phone,
        sector: form.sector,
        companySize: form.companySize,
        message: [creneau, form.message].filter(Boolean).join('\n\n'),
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
        label="Présentation et démonstration"
        title={
          <>
            Voyons ensemble ce que Cyberas <span className="text-brand">ferait chez vous</span>
          </>
        }
        subtitle="Laissez-nous vos coordonnées et un créneau : nous vous rappelons pour fixer une présentation adaptée à votre organisation."
      />

      <section className="bg-bg-light px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">

          {/* Ce qui va se passer, avant de demander quoi que ce soit. */}
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Comment ça se passe
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-text-on-light sm:text-3xl">
              Une demi-heure pour voir la plateforme fonctionner
            </h2>

            <ol className="mt-8 space-y-6">
              {DEROULE.map((d) => (
                <li key={d.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
                    <d.icon size={18} className="text-brand" />
                  </span>
                  <span>
                    <span className="block font-semibold text-text-on-light">{d.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-text-on-light-muted">
                      {d.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-sm font-bold text-text-on-light">Vous préférez nous appeler ?</p>
              <div className="mt-3 space-y-2 text-sm text-text-on-light-muted">
                <a href="tel:+2250788950362" className="flex items-center gap-2.5 hover:text-brand">
                  <Phone size={15} className="text-brand" /> +225 07 88 95 03 62
                </a>
                <a href="mailto:contact@cyberas.ci" className="flex items-center gap-2.5 hover:text-brand">
                  <Mail size={15} className="text-brand" /> contact@cyberas.ci
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Le formulaire. */}
          <FadeIn delay={0.1}>
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs sm:p-10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-status-compliant/10">
                  <CalendarCheck size={26} className="text-status-compliant" />
                </span>
                <h2 className="mt-5 text-xl font-extrabold text-text-on-light">
                  Merci {form.fullName.split(' ')[0]}, c'est noté.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-text-on-light-muted">
                  Nous vous écrivons à <span className="font-semibold text-text-on-light">{form.email}</span> sous
                  24h ouvrées pour confirmer le créneau et vous envoyer le lien de la visioconférence.
                </p>
                <p className="mt-6 text-sm text-text-on-light-muted">
                  En attendant, vous pouvez{' '}
                  <Link to="/plateforme" className="font-semibold text-brand hover:underline">
                    parcourir la plateforme
                  </Link>{' '}
                  ou{' '}
                  {/* Les formules vivent désormais sur la page Offres : la page
                      Évaluation ne porte plus que le parcours. */}
                  <Link to="/offres" className="font-semibold text-brand hover:underline">
                    consulter les formules
                  </Link>.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <h2 className="text-lg font-bold text-text-on-light">Programmer ma démonstration</h2>
                <p className="mt-1 text-sm text-text-on-light-muted">
                  Trois champs suffisent. Le reste nous aide à préparer une séance qui vous ressemble.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-text-on-light">
                    Nom complet <span className="text-brand">*</span>
                    <input
                      required
                      name="fullName"
                      autoComplete="name"
                      value={form.fullName}
                      onChange={set('fullName')}
                      className={inputClass}
                      placeholder="Ex. Armand T."
                    />
                  </label>
                  <label className="text-sm font-medium text-text-on-light">
                    Courriel professionnel <span className="text-brand">*</span>
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={set('email')}
                      className={inputClass}
                      placeholder="vous@entreprise.ci"
                    />
                  </label>
                  <label className="text-sm font-medium text-text-on-light">
                    Organisation <span className="text-brand">*</span>
                    <input
                      required
                      name="company"
                      autoComplete="organization"
                      value={form.company}
                      onChange={set('company')}
                      className={inputClass}
                      placeholder="Nom de votre organisation"
                    />
                  </label>
                  <label className="text-sm font-medium text-text-on-light">
                    Téléphone
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      className={inputClass}
                      placeholder="+225 …"
                    />
                  </label>
                  <label className="text-sm font-medium text-text-on-light">
                    Secteur d'activité
                    <select name="sector" value={form.sector} onChange={set('sector')} className={inputClass}>
                      <option value="">Choisir…</option>
                      {SECTEURS.map(([code, label]) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-text-on-light">
                    Effectif
                    <select name="companySize" value={form.companySize} onChange={set('companySize')} className={inputClass}>
                      <option value="">Choisir…</option>
                      {TAILLES.map((t) => (
                        <option key={t} value={t}>{t} personnes</option>
                      ))}
                    </select>
                  </label>
                </div>

                <fieldset className="mt-6 rounded-lg border border-slate-200 bg-bg-light p-4">
                  <legend className="px-1.5 text-sm font-semibold text-text-on-light">
                    Quand êtes-vous disponible ?
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-text-on-light">
                      Date souhaitée
                      <input
                        type="date"
                        name="date"
                        min={tomorrow}
                        value={form.date}
                        onChange={set('date')}
                        className={inputClass}
                      />
                    </label>
                    <label className="text-sm font-medium text-text-on-light">
                      Moment de la journée
                      <select name="moment" value={form.moment} onChange={set('moment')} className={inputClass}>
                        <option value="">Choisir…</option>
                        {MOMENTS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-text-on-light-muted">
                    Indicatif : nous confirmons le créneau avec vous par email.
                  </p>
                </fieldset>

                <label className="mt-6 block text-sm font-medium text-text-on-light">
                  Ce que vous aimeriez voir en priorité
                  <textarea
                    rows={3}
                    name="message"
                    value={form.message}
                    onChange={set('message')}
                    className={inputClass}
                    placeholder="Ex. la conformité ISO 27001, le scan du périmètre, le rapport pour la direction…"
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
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                >
                  <CalendarCheck size={16} />
                  {sending ? 'Envoi…' : 'Programmer ma démonstration'}
                </button>
                <p className="mt-3 text-center text-xs text-text-on-light-muted">
                  Vos coordonnées ne servent qu'à organiser cette séance. Aucune inscription requise.
                </p>
              </form>
            )}
          </FadeIn>
        </div>
      </section>
    </>
  )
}
