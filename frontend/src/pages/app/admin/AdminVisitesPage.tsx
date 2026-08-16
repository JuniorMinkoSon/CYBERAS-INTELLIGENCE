import { useState } from 'react'
import { MapPin, User, Calendar, Clock, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react'

export function AdminVisitesPage() {
  const [visites, setVisites] = useState([
    {
      id: 1,
      serviceType: 'Inspection Sécurité',
      provider: {
        name: 'SecureGuard Solutions',
        contact: 'Jean Dupont',
        phone: '+33 6 12 34 56 78',
        email: 'contact@secureguard.fr',
        rating: 4.8,
      },
      location: 'Acme Corp, 123 Rue de Paris, 75001 Paris',
      scheduledDate: '2026-08-18',
      scheduledTime: '10:00',
      status: 'scheduled',
      estimatedDuration: '2h30',
      notes: 'Audit complet des systèmes de sécurité',
    },
    {
      id: 2,
      serviceType: 'Maintenance Technique',
      provider: {
        name: 'TechPro Maintenance',
        contact: 'Marie Martin',
        phone: '+33 6 98 76 54 32',
        email: 'support@techpro.fr',
        rating: 4.5,
      },
      location: 'TechStart Inc, 456 Avenue Tech, 92400 Courbevoie',
      scheduledDate: '2026-08-17',
      scheduledTime: '14:00',
      status: 'in-progress',
      estimatedDuration: '3h',
      notes: 'Remplacement serveurs et mise à jour système',
    },
    {
      id: 3,
      serviceType: 'Audit Conformité',
      provider: {
        name: 'Compliance Experts',
        contact: 'Paul Bernard',
        phone: '+33 6 55 44 33 22',
        email: 'audit@compliance-experts.com',
        rating: 4.9,
      },
      location: 'FinanceFlow Ltd, 789 Boulevard Finance, 75009 Paris',
      scheduledDate: '2026-08-16',
      scheduledTime: '09:00',
      status: 'completed',
      estimatedDuration: '4h',
      notes: 'Vérification conformité RGPD et sécurité données',
    },
    {
      id: 4,
      serviceType: 'Formation Sécurité',
      provider: {
        name: 'Academy Learning',
        contact: 'Sophie Chen',
        phone: '+33 6 77 88 99 00',
        email: 'training@academy-learning.fr',
        rating: 4.6,
      },
      location: 'SecureBank Co, 321 Rue Financière, 75008 Paris',
      scheduledDate: '2026-08-20',
      scheduledTime: '11:00',
      status: 'pending',
      estimatedDuration: '6h',
      notes: 'Formation équipe IT aux meilleures pratiques de sécurité',
    },
  ])

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: '📅 Prévu' },
      'in-progress': { bg: 'bg-orange-100', text: 'text-orange-800', label: '⏳ En cours' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Complété' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏸️ En attente' },
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">📍 Gestion des Visites</h1>
        <p className="text-text-on-dark-muted">Planification et suivi des interventions - Fournisseurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: visites.length, color: 'from-blue-600 to-blue-400' },
          { label: 'Prévues', value: visites.filter(v => v.status === 'scheduled').length, color: 'from-cyan-600 to-cyan-400' },
          { label: 'En cours', value: visites.filter(v => v.status === 'in-progress').length, color: 'from-orange-600 to-orange-400' },
          { label: 'Complétées', value: visites.filter(v => v.status === 'completed').length, color: 'from-green-600 to-green-400' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-lg p-4 text-white`}>
            <p className="text-sm opacity-90">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Visites Grid */}
      <div className="grid gap-6">
        {visites.map((visite) => {
          const badge = getStatusBadge(visite.status)
          return (
            <div key={visite.id} className="bg-surface-dark/50 border border-border-dark rounded-xl p-6 hover:border-brand/50 transition">
              {/* Header Row */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{visite.serviceType}</h3>
                  <p className="text-text-on-dark-muted text-sm mt-1">Visite #{visite.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>

              {/* Content Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Provider Info */}
                <div className="border-l-2 border-brand pl-4">
                  <h4 className="text-brand font-bold text-sm uppercase tracking-wider mb-3">👤 Fournisseur</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-white font-bold text-lg">{visite.provider.name}</p>
                      <p className="text-text-on-dark-muted text-sm">Contact: {visite.provider.contact}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-on-dark">
                      <Phone size={16} className="text-brand" />
                      <span>{visite.provider.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-on-dark">
                      <Mail size={16} className="text-brand" />
                      <span>{visite.provider.email}</span>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-yellow-400">{'⭐'.repeat(Math.floor(visite.provider.rating))}</span>
                      <span className="text-sm text-text-on-dark-muted">{visite.provider.rating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Location & Date */}
                <div className="border-l-2 border-emerald-500 pl-4">
                  <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-3">📍 Détails</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold text-sm">{visite.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-400" />
                      <span className="text-white">{formatDate(visite.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-emerald-400" />
                      <span className="text-white">{visite.scheduledTime} - Durée: {visite.estimatedDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="border-l-2 border-purple-500 pl-4">
                  <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3">📝 Notes</h4>
                  <p className="text-text-on-dark text-sm leading-relaxed">{visite.notes}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
                      Voir détails
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition">
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
