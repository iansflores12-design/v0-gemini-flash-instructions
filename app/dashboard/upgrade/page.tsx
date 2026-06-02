'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/language-provider'
import { UpgradeSection } from '@/components/upgrade-section'
import { Loader2, Check, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function UpgradePage() {
  const { language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') as 'pro' | 'ultra' | null
  
  const [loading, setLoading] = useState(false)
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'ultra'>('free')
  const [stripeUrl, setStripeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadUserPlan = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserPlan(profile.subscription_plan || 'free')
        }
      } catch (err) {
        console.error('[v0] Error loading user plan:', err)
      }
    }

    loadUserPlan()
  }, [router])

  const handleUpgrade = async (plan: 'pro' | 'ultra') => {
    if (userPlan !== 'free') return
    
    setLoading(true)
    setError(null)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.email
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al crear sesión de pago')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar pago')
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm(language === 'en' 
      ? 'Are you sure you want to cancel your subscription?' 
      : language === 'pt' 
      ? 'Tem certeza de que deseja cancelar sua inscrição?' 
      : '¿Estás seguro de que deseas cancelar tu suscripción?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al cancelar suscripción')
      }

      setSuccess(language === 'en' 
        ? 'Subscription canceled successfully' 
        : language === 'pt' 
        ? 'Inscrição cancelada com sucesso' 
        : 'Suscripción cancelada exitosamente')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-primary hover:underline text-sm font-medium">
            ← {language === 'en' ? 'Back to Dashboard' : language === 'pt' ? 'Voltar ao Painel' : 'Volver al Dashboard'}
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{language === 'en' ? 'Error' : language === 'pt' ? 'Erro' : 'Error'}</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 flex items-start gap-3">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{language === 'en' ? 'Success' : language === 'pt' ? 'Sucesso' : 'Éxito'}</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Current Plan Info */}
        {userPlan !== 'free' && (
          <div className="mb-12 p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-bold mb-4">
              {language === 'en' ? 'Current Plan' : language === 'pt' ? 'Plano Atual' : 'Plan Actual'}
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'You are currently on' : language === 'pt' ? 'Você está atualmente em' : 'Actualmente estás en'}
                </p>
                <p className="text-2xl font-bold text-primary capitalize">{userPlan}</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {language === 'en' ? 'Cancel Subscription' : language === 'pt' ? 'Cancelar Inscrição' : 'Cancelar Suscripción'}
              </Button>
            </div>
          </div>
        )}

        {/* Upgrade Section - Only show to free users */}
        {userPlan === 'free' && (
          <UpgradeSection 
            currentPlan={userPlan}
            onUpgradeClick={handleUpgrade}
          />
        )}

        {/* Already Pro/Ultra Message */}
        {userPlan !== 'free' && (
          <div className="text-center py-12">
            <Check className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {language === 'en' ? 'You are already premium!' : language === 'pt' ? 'Você já é premium!' : '¡Ya eres premium!'}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {language === 'en' 
                ? 'Enjoy unlimited access to all features. Thank you for supporting ClearGrade!' 
                : language === 'pt' 
                ? 'Aproveite o acesso ilimitado a todos os recursos. Obrigado por apoiar o ClearGrade!' 
                : '¡Disfruta de acceso ilimitado a todas las características. ¡Gracias por apoyar a ClearGrade!'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
