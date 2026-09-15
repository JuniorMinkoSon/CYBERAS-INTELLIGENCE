import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Building2, ArrowRight, ArrowLeft, User, Check, Loader2,
  Timer, ShieldCheck, Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import { AuthShell, AuthCard, FormError, FieldLabel, fieldCls, type Reassurance } from '../../components/auth/AuthShell'
import { PasswordField } from '../../components/auth/PasswordField'
import { friendlyAuthError } from '../../components/auth/authErrors'

/**
 * Secteurs d'activité, alignés sur l'énumération `BusinessSector` du serveur.
 *
 * Le secteur n'est pas une donnée administrative : il alimente l'impact métier
 * et la sensibilité des données retenus par défaut dans l'évaluation du risque,
 * selon l'approche MEHARI. Un même incident ne pèse pas pareil chez un
 * hébergeur de dossiers médicaux et chez un commerçant de proximité.
 */
const SECTORS = [
  { value: 'FINANCE', label: 'Banque, finance, assurance' },
  { value: 'SANTE', label: 'Santé et médico-social' },
  { value: 'PUBLIC_SECTOR', label: 'Secteur public et administration' },
  { value: 'ENERGIE_UTILITIES', label: 'Énergie, eau, transport' },
  { value: 'TELECOM', label: 'Télécommunications et hébergement' },
  { value: 'INDUSTRIE', label: 'Industrie et production' },
  { value: 'COMMERCE', label: 'Commerce et distribution' },
  { value: 'TECHNOLOGIE', label: 'Technologie et services numériques' },
  { value: 'EDUCATION', label: 'Enseignement et recherche' },
  { value: 'SERVICES_PRO', label: 'Services professionnels et conseil' },
  { value: 'ASSOCIATIF', label: 'Associatif et ONG' },
  { value: 'AUTRE', label: 'Autre ou non précisé' },
]

const REASSURANCES: Reassurance[] = [
  { icon: Timer, title: 'Deux minutes, aucune carte bancaire', text: 'Votre espace est utilisable immédiatement ; l’offre se choisit ensuite.' },
  { icon: ShieldCheck, title: 'Vos données restent les vôtres', text: 'Chaque organisation est cloisonnée ; vous décidez qui y accède.' },
  { icon: Users, title: 'Invitez votre équipe quand vous voulez', text: 'RSSI, auditeurs, direction : chacun son rôle et ses droits.' },
]

const STEPS = ['Votre organisation', 'Votre compte'] as const

interface FormState {
  organizationName: string
  sector: string
  // Le compte créé est celui d'une personne, pas d'une boîte aux lettres :
  // le backend exige un prénom et un nom pour l'identifier dans l'audit trail.
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

type Errors = Partial<Record<keyof FormState, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Inscription d'une organisation et de son premier administrateur.
 *
 * <p>Deux étapes courtes plutôt qu'un seul formulaire de sept champs : la
 * première ne demande que ce qui concerne l'entreprise, la seconde ce qui
 * concerne la personne. Chaque champ est vérifié à la sortie et le message se
 * place sous lui — un bandeau unique en haut du formulaire obligeait à
 * chercher quel champ était en cause.
 */
export function OrganizationSignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { notify } = useNotification()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>({
    organizationName: '', sector: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validateStep = (s: number): boolean => {
    const e: Errors = {}
    if (s === 0) {
      if (form.organizationName.trim().length < 2) e.organizationName = 'Indiquez le nom de votre organisation.'
    } else {
      if (!form.firstName.trim()) e.firstName = 'Votre prénom est nécessaire.'
      if (!form.lastName.trim()) e.lastName = 'Votre nom est nécessaire.'
      if (!EMAIL_RE.test(form.email.trim())) e.email = 'Saisissez une adresse valide, par exemple vous@entreprise.ci.'
      if (form.password.length < 8) e.password = 'Huit caractères au minimum.'
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Les deux mots de passe ne sont pas identiques.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = (e: FormEvent) => {
    e.preventDefault()
    if (validateStep(0)) setStep(1)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateStep(1)) return
    setServerError('')
    setLoading(true)
    try {
      await signup(
        form.organizationName.trim(),
        form.email.trim(),
        form.password,
        form.firstName.trim(),
        form.lastName.trim(),
        form.sector || undefined,
      )
      notify(`Bienvenue, ${form.firstName.trim()} ! Votre espace est prêt.`, 'success')
      navigate('/app')
    } catch (err) {
      setServerError(friendlyAuthError(err, 'La création a échoué. Réessayez dans un instant.'))
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (k: keyof FormState) =>
    errors[k] ? (
      <span role="alert" className="mt-1.5 block text-xs font-medium text-red-300">
        {errors[k]}
      </span>
    ) : null

  const errCls = (k: keyof FormState) => (errors[k] ? ' border-red-500/70' : '')

  const passwordsMatch = form.confirmPassword.length > 0 && form.confirmPassword === form.password

  return (
    <AuthShell
      headline={<>Créez votre espace d’audit et lancez votre première évaluation aujourd’hui.</>}
      reassurances={REASSURANCES}
    >
      {/* Progression : deux pastilles, le nom de l'étape en clair. */}
      <ol className="mb-4 flex items-center gap-2 text-xs font-semibold" aria-label="Étapes de l’inscription">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={i === step ? 'step' : undefined}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                i < step ? 'bg-emerald-500/20 text-emerald-300' : i === step ? 'bg-brand text-white' : 'bg-surface-dark text-text-on-dark-muted'
              }`}
            >
              {i < step ? <Check size={12} /> : i + 1}
            </span>
            <span className={i === step ? 'text-white' : 'text-text-on-dark-muted'}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-border-dark" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <AuthCard title="Votre organisation" subtitle="Le nom sous lequel vos audits et rapports seront émis.">
          <form onSubmit={next} className="space-y-4" noValidate>
            <label className="block">
              <FieldLabel>Nom de l’organisation</FieldLabel>
              <div className="relative mt-1.5">
                <Building2 size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                <input
                  type="text"
                  name="organization"
                  autoComplete="organization"
                  autoFocus
                  value={form.organizationName}
                  onChange={(e) => set('organizationName', e.target.value)}
                  placeholder="Ex. Clinique Saint-Jean"
                  className={`${fieldCls} pl-10 pr-4${errCls('organizationName')}`}
                />
              </div>
              {fieldError('organizationName')}
            </label>

            <label className="block">
              <FieldLabel hint="facultatif">Secteur d’activité</FieldLabel>
              <select
                name="sector"
                value={form.sector}
                onChange={(e) => set('sector', e.target.value)}
                className={`${fieldCls} mt-1.5 px-3`}
              >
                <option value="">Choisir plus tard</option>
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <span className="mt-1.5 block text-xs leading-relaxed text-text-on-dark-muted">
                Sert à régler l’évaluation du risque à votre réalité (un incident ne pèse pas pareil
                dans une clinique et dans un commerce). Modifiable ensuite.
              </span>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              Continuer <ArrowRight size={18} />
            </button>
          </form>
        </AuthCard>
      )}

      {step === 1 && (
        <AuthCard
          title="Votre compte"
          subtitle={`Vous serez l’administrateur de « ${form.organizationName.trim()} ».`}
        >
          <form onSubmit={submit} className="space-y-4" noValidate>
            <FormError message={serverError} />

            {/* Prénom et nom sur une seule ligne : deux champs courts côte à
                côte allongent moins le formulaire que deux lignes pleines. */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <FieldLabel>Prénom</FieldLabel>
                <div className="relative mt-1.5">
                  <User size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                  <input
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    autoFocus
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    placeholder="Awa"
                    className={`${fieldCls} pl-10 pr-3${errCls('firstName')}`}
                  />
                </div>
                {fieldError('firstName')}
              </label>
              <label className="block">
                <FieldLabel>Nom</FieldLabel>
                <div className="relative mt-1.5">
                  <User size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                  <input
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    placeholder="Traoré"
                    className={`${fieldCls} pl-10 pr-3${errCls('lastName')}`}
                  />
                </div>
                {fieldError('lastName')}
              </label>
            </div>

            <label className="block">
              <FieldLabel hint="servira à vous connecter">Adresse de courriel</FieldLabel>
              <div className="relative mt-1.5">
                <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="vous@entreprise.ci"
                  className={`${fieldCls} pl-10 pr-4${errCls('email')}`}
                />
              </div>
              {fieldError('email')}
            </label>

            <div>
              <PasswordField
                label="Mot de passe"
                name="password"
                autoComplete="new-password"
                hint="8 caractères minimum"
                value={form.password}
                onChange={(v) => set('password', v)}
                strength
              />
              {fieldError('password')}
            </div>

            <div>
              <PasswordField
                label={
                  <span className="inline-flex items-center gap-1.5">
                    Confirmer le mot de passe
                    {passwordsMatch && <Check size={14} className="text-emerald-400" aria-label="Identiques" />}
                  </span>
                }
                name="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(v) => set('confirmPassword', v)}
                placeholder="Retapez le mot de passe"
              />
              {fieldError('confirmPassword')}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Création de votre espace…
                </>
              ) : (
                <>
                  Créer mon espace <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setServerError(''); setStep(0) }}
              className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-text-on-dark-muted transition hover:text-white"
            >
              <ArrowLeft size={14} /> Modifier l’organisation
            </button>

            <p className="text-center text-xs leading-relaxed text-text-on-dark-muted">
              En créant votre espace, vous acceptez nos{' '}
              <Link to="/" className="underline hover:text-white">conditions d’utilisation</Link>.
            </p>
          </form>
        </AuthCard>
      )}

      <p className="mt-5 text-center text-sm text-text-on-dark-muted">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  )
}
