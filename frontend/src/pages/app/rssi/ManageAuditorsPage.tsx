import { useState } from 'react'
import { Plus, Mail, Trash2, Check, Clock, AlertCircle } from 'lucide-react'

interface AuditorInvite {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'rejected'
  inviteDate: string
  referentiel?: string
}

const mockInvites: AuditorInvite[] = [
  {
    id: '1',
    email: 'audit1@domain.com',
    status: 'accepted',
    inviteDate: '2026-08-05',
    referentiel: 'ISO 27001',
  },
  {
    id: '2',
    email: 'audit2@domain.com',
    status: 'pending',
    inviteDate: '2026-08-10',
    referentiel: 'NIST',
  },
]

export function ManageAuditorsPage() {
  const [invites, setInvites] = useState<AuditorInvite[]>(mockInvites)
  const [newEmail, setNewEmail] = useState('')
  const [selectedReferentiel, setSelectedReferentiel] = useState('ISO 27001')
  const [showing, setShowing] = useState(false)

  const referentiels = ['ISO 27001', 'ISO 27002', 'NIST', 'CIS Controls', 'RGPD', 'PCI-DSS', 'HIPAA', 'ANSSI']

  const handleAddAuditor = () => {
    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Email invalide')
      return
    }

    const newInvite: AuditorInvite = {
      id: Math.random().toString(36).substr(2, 9),
      email: newEmail,
      status: 'pending',
      inviteDate: new Date().toISOString().split('T')[0],
      referentiel: selectedReferentiel,
    }

    setInvites([...invites, newInvite])
    setNewEmail('')
    alert(`Invitation envoyee a ${newEmail}`)
  }

  const handleRemove = (id: string) => {
    setInvites(invites.filter((i) => i.id !== id))
  }

  const availableSlots = 2 - invites.length
  const acceptedCount = invites.filter((i) => i.status === 'accepted').length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Gestion des Auditeurs</h1>
        <p className="text-sm text-text-on-dark-muted mt-2">Invitez jusqu'a 2 auditeurs a rejoindre votre equipe</p>
      </div>

      {/* Quotas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Slots disponibles</p>
          <p className="text-2xl font-bold text-blue-400">{availableSlots}/2</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Acceptes</p>
          <p className="text-2xl font-bold text-green-400">{acceptedCount}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">En attente</p>
          <p className="text-2xl font-bold text-yellow-400">{invites.filter((i) => i.status === 'pending').length}</p>
        </div>
      </div>

      {/* Add Auditor Form */}
      {showing && (
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-6 space-y-4">
          <h2 className="font-bold text-white">Inviter un auditeur</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-text-on-dark">Email</span>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="auditeur@example.com"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none transition"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-text-on-dark">Referentiel</span>
              <select
                value={selectedReferentiel}
                onChange={(e) => setSelectedReferentiel(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition"
              >
                {referentiels.map((ref) => (
                  <option key={ref} value={ref}>
                    {ref}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddAuditor}
              disabled={availableSlots === 0}
              className="flex-1 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold transition"
            >
              Envoyer invitation
            </button>
            <button
              onClick={() => setShowing(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {!showing && (
        <button
          onClick={() => setShowing(true)}
          disabled={availableSlots === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold transition"
        >
          <Plus size={16} /> Ajouter un auditeur
        </button>
      )}

      {/* Invites List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Auditeurs invites</h3>
        {invites.length === 0 ? (
          <p className="text-sm text-text-on-dark-muted">Aucun auditeur invite pour le moment</p>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-lg border border-border-dark bg-bg-dark/50 p-4"
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                    <Mail size={18} className="text-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{invite.email}</p>
                    <p className="text-xs text-text-on-dark-muted">
                      {invite.referentiel} | Invite le {invite.inviteDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {invite.status === 'accepted' ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        <span className="text-xs font-medium text-green-400">Accepte</span>
                      </>
                    ) : invite.status === 'pending' ? (
                      <>
                        <Clock size={16} className="text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-400">En attente</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-xs font-medium text-red-400">Refuse</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(invite.id)}
                    className="text-red-400 hover:text-red-600 transition p-2"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-border-dark bg-bg-dark/50 p-4">
        <p className="text-sm text-text-on-dark-muted">
          <strong>Note:</strong> Chaque auditeur invite recevra un email pour creer son compte. Les auditeurs can alors
          realiser les missions d'audit selon le referentiel selectionne.
        </p>
      </div>
    </div>
  )
}
