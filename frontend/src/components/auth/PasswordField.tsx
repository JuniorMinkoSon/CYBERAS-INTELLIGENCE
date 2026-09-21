import { useState, type ReactNode } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { fieldCls, FieldLabel } from './AuthShell'

interface Props {
  label: ReactNode
  name: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  placeholder?: string
  hint?: string
  /** Affiche la jauge de robustesse : pour la création, pas la connexion. */
  strength?: boolean
  autoFocus?: boolean
}

/**
 * Robustesse d'un mot de passe, en quatre paliers.
 *
 * <p>Le serveur n'impose que la longueur (8 à 256). La jauge n'ajoute aucune
 * règle : elle renseigne. Une personne qui tape « motdepasse » voit « faible »
 * et peut décider d'en changer avant d'être bloquée plus tard.
 */
export function passwordStrength(pw: string): { level: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { level: 0, label: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['Trop court', 'Faible', 'Correct', 'Bon', 'Excellent'] as const
  return { level: score as 0 | 1 | 2 | 3 | 4, label: labels[score] }
}

const STRENGTH_COLORS = ['bg-border-dark', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400']

export function PasswordField({
  label, name, value, onChange, autoComplete, placeholder, hint, strength, autoFocus,
}: Props) {
  const [visible, setVisible] = useState(false)
  const s = strength ? passwordStrength(value) : null

  return (
    <label className="block">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="relative mt-1.5">
        <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder ?? '••••••••'}
          autoFocus={autoFocus}
          className={`${fieldCls} pl-10 pr-11`}
        />
        {/* Voir ce qu'on tape évite la faute de frappe invisible : la première
            cause d'un « mot de passe incorrect » à la connexion. */}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-on-dark-muted transition hover:text-white"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {s && (
        <div className="mt-2" aria-live="polite">
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-colors ${i <= s.level ? STRENGTH_COLORS[s.level] : 'bg-border-dark'}`}
              />
            ))}
          </div>
          {s.label && (
            <span className="mt-1 block text-xs text-text-on-dark-muted">
              Robustesse : <span className="font-medium text-text-on-dark">{s.label}</span>
              {s.level <= 1 && ' : 12 caractères, majuscules, chiffres et symboles la renforcent.'}
            </span>
          )}
        </div>
      )}
    </label>
  )
}
