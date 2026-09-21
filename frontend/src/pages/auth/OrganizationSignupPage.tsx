import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Mail, Building2, ArrowRight, ArrowLeft, User, Check, Loader2,
  Timer, ShieldCheck, Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import { AuthShell, AuthCard, FormError, FieldLabel, fieldCls, type Reassurance } from '../../components/auth/AuthShell'
import { PasswordField } from '../../components/auth/PasswordField'
import { friendlyAuthError } from '../../components/auth/authErrors'
import { invitationsClient } from '../../services/invitationsClient'

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
 * place sous lui : un bandeau unique en haut du formulaire obligeait à
 * chercher quel champ était en cause.
 */
export function OrganizationSignupPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { signup, acceptInvitation } = useAuth()
  const { notify } = useNotification()

  /**
   * Entrée par lien d'invitation.
   *
   * <p>Le lien porte l'organisation : la personne ne la crée pas, elle la
   * rejoint. La première étape disparaît et l'écran nomme la société qu'elle
   * s'apprête à rejoindre : une société inscrite dans un projet d'évaluation
   * doit voir que c'est bien la sienne avant de donner son adresse.
   */
  // Lu une seule fois puis retiré de la barre d'adresse : un code qui y
  // reste finit dans l'historique du navigateur, dans les journaux d'un
  // mandataire et dans le presse-papiers de qui copie le lien. Il vit en
  // mémoire le temps de l'activation.
  const [invitationCode] = useState(() => params.get('invitation'))
  useEffect(() => {
    if (invitationCode) window.history.replaceState({}, '', '/inscription')
  }, [invitationCode])
  const [invitation, setInvitation] = useState<
    | { state: 'checking' }
    | { state: 'valid'; organizationName: string; role: string; accountEmail: string | null }
    | { state: 'invalid'; reason: string }
    | null
  >(invitationCode ? { state: 'checking' } : null)

  useEffect(() => {
    if (!invitationCode) return
    invitationsClient
      .check(invitationCode)
      .then((r) => {
        if (!r.valid) {
          setInvitation({ state: 'invalid', reason: r.reason ?? 'Lien invalide.' })
          return
        }
        setInvitation({
          state: 'valid',
          organizationName: r.organizationName ?? 'votre organisation',
          role: r.role ?? 'VIEWER',
          accountEmail: r.accountEmail ?? null,
        })
        // Compte déjà créé par l'administration : l'adresse est celle du
        // compte, le nom est pré-rempli : il ne reste qu'à choisir un mot
        // de passe.
        if (r.accountEmail) {
          setForm((f) => ({
            ...f,
            email: r.accountEmail ?? '',
            firstName: r.firstName ?? '',
            lastName: r.lastName ?? '',
          }))
        }
      })
      .catch(() => setInvitation({ state: 'invalid', reason: 'Impossible de vérifier ce lien pour le moment.' }))
  }, [invitationCode])

  const byInvitation = invitation?.state === 'valid'
  /** Le lien active un compte existant plutôt que d'en créer un. */
  const activation = byInvitation && invitation.accountEmail !== null
  const [step, setStep] = useState(invitationCode ? 1 : 0)
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
    if (s === 0 && !byInvitation) {
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
      if (byInvitation && invitationCode) {
        await acceptInvitation(
          invitationCode, form.email.trim(), form.password, form.firstName.trim(), form.lastName.trim(),
        )
        notify(
          activation
            ? `Bienvenue, ${form.firstName.trim()} ! Votre accès est activé.`
            : `Bienvenue, ${form.firstName.trim()} ! Vous avez rejoint ${invitation.organizationName}.`,
          'success',
        )
      } else {
        await signup(
          form.organizationName.trim(),
          form.email.trim(),
          form.password,
          form.firstName.trim(),
          form.lastName.trim(),
          form.sector || undefined,
        )
        notify(`Bienvenue, ${form.firstName.trim()} ! Votre espace est prêt.`, 'success')
      }
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

  if (invitation?.state === 'checking') {
    return (
      <AuthShell headline={<>Un instant, nous vérifions votre lien d’accès.</>} reassurances={REASSURANCES}>
        <AuthCard title="Vérification du lien" subtitle="Quelques secondes tout au plus.">
          <div className="flex items-center gap-3 text-sm text-text-on-dark-muted">
            <Loader2 size={18} className="animate-spin text-brand" /> Lecture de l’invitation…
          </div>
        </AuthCard>
      </AuthShell>
    )
  }

  if (invitation?.state === 'invalid') {
    return (
      <AuthShell headline={<>Ce lien d’accès ne peut pas être utilisé.</>} reassurances={REASSURANCES}>
        <AuthCard title="Lien inutilisable" subtitle={invitation.reason}>
          <p className="text-sm leading-relaxed text-text-on-dark-muted">
            Demandez un nouveau lien à la personne qui vous a invité. Si vous avez déjà un compte,
            connectez-vous directement.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link to="/login" className="rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">
              Se connecter
            </Link>
            <Link to="/contact" className="rounded-lg border border-border-dark px-4 py-2.5 text-center text-sm font-semibold text-text-on-dark hover:text-white">
              Contacter l’équipe
            </Link>
          </div>
        </AuthCard>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      headline={
        activation
          ? <>Votre accès chez <span className="text-brand">{invitation.organizationName}</span> est prêt. Choisissez votre mot de passe.</>
          : byInvitation
            ? <>Vous rejoignez <span className="text-brand">{invitation.organizationName}</span> sur Cyberas Intelligence.</>
            : <>Créez votre espace d’audit et lancez votre première évaluation aujourd’hui.</>
      }
      reassurances={REASSURANCES}
    >
      {byInvitation && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-200">
          <Check size={16} className="shrink-0" />
          {activation
            ? <>Compte créé pour vous par Cyberas Intelligence : vous êtes {invitation.role === 'ADMIN' ? 'administrateur' : 'membre'} de {invitation.organizationName}.</>
            : <>Lien d’accès valide : vous entrez comme {invitation.role === 'ADMIN' ? 'administrateur' : 'membre'} de {invitation.organizationName}.</>}
        </p>
      )}

      {/* Progression : deux pastilles, le nom de l'étape en clair. Inutile
          par invitation : il n'y a qu'une étape. */}
      {!byInvitation && (
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
      )}

      {step === 0 && !byInvitation && (
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
          title={activation ? 'Activez votre accès' : 'Votre compte'}
          subtitle={
            activation
              ? 'Vérifiez votre nom, choisissez un mot de passe : vous entrez directement sur votre questionnaire.'
              : byInvitation
                ? `Votre identité et votre mot de passe pour entrer chez ${invitation.organizationName}.`
                : `Vous serez l’administrateur de « ${form.organizationName.trim()} ».`
          }
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
              <FieldLabel hint={activation ? 'adresse de votre compte' : 'servira à vous connecter'}>Adresse de courriel</FieldLabel>
              <div className="relative mt-1.5">
                <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
                {/* Par activation, l'adresse est celle du compte que le lien
                    désigne : la modifier ne changerait rien côté serveur, la
                    verrouiller évite de le laisser croire. */}
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  readOnly={activation}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="vous@entreprise.ci"
                  className={`${fieldCls} pl-10 pr-4${errCls('email')}${activation ? ' cursor-not-allowed opacity-70' : ''}`}
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
                  {activation ? 'Activer mon accès' : byInvitation ? 'Rejoindre' : 'Créer mon espace'} <ArrowRight size={18} />
                </>
              )}
            </button>

            {!byInvitation && (
              <button
                type="button"
                onClick={() => { setServerError(''); setStep(0) }}
                className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-text-on-dark-muted transition hover:text-white"
              >
                <ArrowLeft size={14} /> Modifier l’organisation
              </button>
            )}

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
