import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowLeft, FileText, User, MapPin, Calendar } from 'lucide-react'

export function AdminValidateOfferPage() {
  const { offerId } = useParams()
  const navigate = useNavigate()
  const [stage, setStage] = useState<'review' | 'decision' | 'confirmed'>('review')
  const [selectedTier, setSelectedTier] = useState<'gold' | 'silver' | 'basic' | null>(null)

  const mockOffer = {
    id: offerId || 'dv-001',
    provider: 'SecureGuard Solutions',
    contact: 'Jean Dupont',
    email: 'contact@secureguard.fr',
    service: 'Inspection Sécurité Complète',
    price: 2500,
    currency: 'EUR',
    location: 'Paris, France',
    experience: '12 ans',
    certification: 'ISO 27001, CISM Certified',
    previousClients: 45,
    averageScore: 4.8,
    proposal: `Audit complet des systèmes de sécurité informatique incluant:
- Analyse complète de l'infrastructure
- Tests de pénétration
- Audit de conformité
- Rapport détaillé avec recommandations
- Support post-audit 3 mois`,
    attachments: ['proposal.pdf', 'certifications.pdf', 'references.pdf'],
  }

  const tiers = [
    {
      name: 'Gold',
      icon: '🏆',
      description: 'Premium - Top tier providers',
      requirements: 'Score ≥ 4.7 | Expérience ≥ 10 ans | Certifications multiples',
      color: 'from-yellow-600 to-yellow-400',
      borderColor: 'border-yellow-500',
    },
    {
      name: 'Silver',
      icon: '🥈',
      description: 'Qualified providers',
      requirements: 'Score ≥ 4.0 | Expérience ≥ 5 ans | Au moins 1 certification',
      color: 'from-gray-600 to-gray-400',
      borderColor: 'border-gray-400',
    },
    {
      name: 'Basic',
      icon: '📊',
      description: 'Standard providers',
      requirements: 'Score ≥ 3.5 | Vérification de base',
      color: 'from-blue-600 to-blue-400',
      borderColor: 'border-blue-400',
    },
  ]

  const handleAccept = () => {
    if (!selectedTier) return
    setStage('confirmed')
    setTimeout(() => {
      navigate(`/app/admin/quotes`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark">
      {/* Header */}
      <div className="bg-surface-dark/50 border-b border-border-dark sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/app/admin/quotes')}
            className="p-2 hover:bg-brand/10 rounded-lg transition text-brand"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Validation d'Offre</h1>
            <p className="text-text-on-dark-muted text-sm">ID: {mockOffer.id}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Offer Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Provider Card */}
            <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">👤 Fournisseur</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-text-on-dark-muted text-sm">Nom</p>
                  <p className="text-xl font-bold text-white">{mockOffer.provider}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Contact</p>
                    <p className="text-white font-semibold">{mockOffer.contact}</p>
                  </div>
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Email</p>
                    <p className="text-white font-semibold">{mockOffer.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-dark">
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Expérience</p>
                    <p className="text-brand font-bold">{mockOffer.experience}</p>
                  </div>
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Clients</p>
                    <p className="text-brand font-bold">{mockOffer.previousClients}+</p>
                  </div>
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Score</p>
                    <p className="text-brand font-bold">⭐ {mockOffer.averageScore}/5</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">📋 Offre de Service</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-text-on-dark-muted text-sm">Service</p>
                  <p className="text-lg font-bold text-white">{mockOffer.service}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Prix</p>
                    <p className="text-2xl font-bold text-brand">{mockOffer.price}€</p>
                  </div>
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Localisation</p>
                    <p className="text-white font-semibold">{mockOffer.location}</p>
                  </div>
                  <div>
                    <p className="text-text-on-dark-muted text-sm">Certification</p>
                    <p className="text-white font-semibold text-sm">{mockOffer.certification}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border-dark">
                  <p className="text-text-on-dark-muted text-sm mb-2">Description</p>
                  <p className="text-text-on-dark whitespace-pre-line">{mockOffer.proposal}</p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">📎 Documents</h3>
              <div className="space-y-2">
                {mockOffer.attachments.map((file) => (
                  <div key={file} className="flex items-center gap-3 p-3 bg-bg-dark/50 rounded-lg hover:bg-brand/10 transition cursor-pointer">
                    <FileText size={20} className="text-brand" />
                    <span className="text-white font-semibold">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Decision Panel */}
          <div className="space-y-6">
            {stage === 'review' && (
              <>
                {/* Status Card */}
                <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-6 text-center">
                  <div className="text-5xl mb-3">📋</div>
                  <h3 className="text-xl font-bold text-white mb-2">En Attente de Validation</h3>
                  <p className="text-text-on-dark-muted text-sm">Choisissez un tier pour référencer au catalogue ou rejetez l'offre</p>
                </div>

                {/* Tier Selection */}
                <div className="space-y-3">
                  <h3 className="font-bold text-white">Choisir un Tier:</h3>
                  {tiers.map((tier) => (
                    <button
                      key={tier.name}
                      onClick={() => setSelectedTier(tier.name.toLowerCase() as any)}
                      className={`w-full p-4 rounded-xl border-2 transition text-left ${
                        selectedTier === tier.name.toLowerCase()
                          ? `border-brand bg-brand/10`
                          : `border-border-dark hover:border-brand/50 bg-surface-dark/50`
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-lg font-bold text-white flex items-center gap-2">
                            <span>{tier.icon}</span>
                            {tier.name}
                          </p>
                          <p className="text-sm text-text-on-dark-muted mt-1">{tier.description}</p>
                          <p className="text-xs text-text-on-dark-muted mt-2">{tier.requirements}</p>
                        </div>
                        {selectedTier === tier.name.toLowerCase() && (
                          <CheckCircle2 size={24} className="text-brand flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-border-dark">
                  <button
                    onClick={handleAccept}
                    disabled={!selectedTier}
                    className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                      selectedTier
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 size={20} />
                    Accepter & Référencer
                  </button>
                  <button
                    onClick={() => setStage('confirmed')}
                    className="w-full py-3 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} />
                    Rejeter l'Offre
                  </button>
                </div>
              </>
            )}

            {stage === 'confirmed' && (
              <div className="bg-surface-dark/50 border-2 border-green-500 rounded-xl p-6 text-center space-y-4 animate-pulse">
                <div className="text-6xl">✓</div>
                <h3 className="text-2xl font-bold text-green-400">Offre Validée!</h3>
                <p className="text-text-on-dark-muted">
                  {selectedTier ? `Référencée en ${selectedTier.toUpperCase()}` : 'Rejetée'}
                </p>
                <p className="text-sm text-text-on-dark-muted">Redirection en cours...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
