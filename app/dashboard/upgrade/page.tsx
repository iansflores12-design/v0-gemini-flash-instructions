import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, Check } from 'lucide-react'

export default function UpgradePage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfecto para empezar',
      features: [
        '5 mensajes de chat por día',
        'Hasta 50 tareas',
        'Hasta 10 materias',
        'Con anuncios'
      ],
      current: true
    },
    {
      name: 'Pro',
      price: '$4.99',
      period: '/mes',
      description: 'Para estudiantes dedicados',
      features: [
        '50 mensajes de chat por día',
        'Hasta 500 tareas',
        'Hasta 100 materias',
        'Sin anuncios',
        'Soporte prioritario'
      ],
      highlighted: true
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/mes',
      description: 'Para máximo rendimiento',
      features: [
        '500 mensajes de chat por día',
        'Tareas ilimitadas',
        'Materias ilimitadas',
        'Sin anuncios',
        'Soporte VIP',
        'Analytics avanzados'
      ]
    }
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Planes disponibles</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">Elige tu plan</h1>
            <p className="text-lg text-muted-foreground">
              Actualiza a Pro para desbloquear todas las funciones
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all ${
                  plan.highlighted
                    ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                    : 'border-border bg-card'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      RECOMENDADO
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </div>

                <Link href={plan.current ? '#' : `/api/stripe/checkout?plan=${plan.name.toLowerCase()}`}>
                  <Button
                    className="w-full mb-6"
                    variant={plan.current ? 'outline' : 'default'}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Plan actual' : 'Contratar'}
                  </Button>
                </Link>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Preguntas frecuentes</h2>
            {[
              {
                q: '¿Puedo cambiar de plan en cualquier momento?',
                a: 'Sí, puedes cambiar o cancelar tu suscripción en cualquier momento desde tu perfil.'
              },
              {
                q: '¿Necesito una tarjeta de crédito para la versión gratis?',
                a: 'No, la versión gratis es completamente accesible sin necesidad de tarjeta de crédito.'
              },
              {
                q: '¿Qué sucede cuando alcanza el limite de mensajes?',
                a: 'En la versión gratis, tendrás que esperar hasta el próximo día. En Pro/Premium, los limites son mucho mayores.'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-card border border-border">
                <p className="font-medium text-foreground mb-2">{item.q}</p>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link href="/dashboard">
              <Button variant="outline">Volver al dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
