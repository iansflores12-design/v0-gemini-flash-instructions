'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PaywallProps {
  onClose: () => void
  plan: 'free' | 'pro' | 'ultra'
  limitType: 'chat' | 'agenda'
  currentUsage: number
  limit: number
}

const PLANS = {
  free: { name: 'Free', price: '0', color: '#94a3b8' },
  pro: { name: 'Pro', price: '4.99', color: '#a78bfa' },
  ultra: { name: 'Ultra', price: '9.99', color: '#fbbf24' }
}

export function PaywallModal({ onClose, plan, limitType, currentUsage, limit }: PaywallProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (targetPlan: 'pro' | 'ultra') => {
    setLoading(true)
    try {
      // Redirect to Stripe checkout (you'll need to implement this)
      window.location.href = `/api/checkout?plan=${targetPlan}`
    } catch (error) {
      console.error('[v0] Checkout error:', error)
      setLoading(false)
    }
  }

  const limitLabel = limitType === 'chat' ? 'mensajes de chat' : 'agendas'
  const upgradePlan = plan === 'free' ? 'pro' : 'ultra'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Límite alcanzado</h2>
          <p className="text-muted-foreground">
            Has usado <span className="font-semibold text-foreground">{currentUsage}/{limit}</span> {limitLabel} este mes
          </p>
        </div>

        {/* Upgrade options */}
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-xl bg-secondary border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Actualiza a Pro</span>
              <span className="text-sm text-primary font-semibold">$4.99/mes</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">50 agendas/mes • 100 chats/día • Sin anuncios</p>
            <Button
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Cargando...' : 'Actualizar a Pro'}
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-foreground">Actualiza a Ultra</span>
              </div>
              <span className="text-sm text-yellow-600 font-semibold">$9.99/mes</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Agendas ilimitadas • 500 chats/día • Sin anuncios</p>
            <Button
              onClick={() => handleUpgrade('ultra')}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-semibold"
            >
              {loading ? 'Cargando...' : 'Actualizar a Ultra'}
            </Button>
          </div>
        </div>

        {/* Continue as free */}
        <button
          onClick={onClose}
          className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Continuar sin actualizar
        </button>

        {/* Footer info */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Cancela cuando quieras. Sin contrato de larga duración.
        </p>
      </div>
    </div>
  )
}
