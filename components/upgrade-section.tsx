'use client'

import { useState } from 'react'
import { Check, Zap, Crown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/language-provider'
import Link from 'next/link'

interface UpgradeSectionProps {
  currentPlan: 'free' | 'pro' | 'ultra'
  onUpgradeClick?: (plan: 'pro' | 'ultra') => void
}

export function UpgradeSection({ currentPlan, onUpgradeClick }: UpgradeSectionProps) {
  const { language } = useLanguage()
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'ultra'>('pro')

  // Only show for free users
  if (currentPlan !== 'free') return null

  const plans = {
    pro: {
      name: 'ClearGrade Pro',
      price: '$4.99',
      billingCycle: language === 'en' ? '/month' : language === 'pt' ? '/mês' : '/mes',
      description: language === 'en' 
        ? 'For serious students' 
        : language === 'pt' 
        ? 'Para estudantes sérios' 
        : 'Para estudiantes serios',
      features: [
        { 
          key: 'filesPerBatch',
          text: language === 'en' ? 'Unlimited schedules per upload' : language === 'pt' ? 'Agendas ilimitadas por envio' : 'Agendas ilimitadas por envío'
        },
        { 
          key: 'delayBetweenBatches',
          text: language === 'en' ? 'Fast processing (0.5s delay)' : language === 'pt' ? 'Processamento rápido (0.5s de delay)' : 'Procesamiento rápido (0.5s de delay)'
        },
        { 
          key: 'chatMessages',
          text: language === 'en' ? '50 AI chat messages daily' : language === 'pt' ? '50 mensagens de chat IA por dia' : '50 mensajes de chat IA por día'
        },
        { 
          key: 'adsFree',
          text: language === 'en' ? 'Ad-free experience' : language === 'pt' ? 'Experiência sem anúncios' : 'Experiencia sin anuncios'
        },
        { 
          key: 'fileSize',
          text: language === 'en' ? '50MB file size limit' : language === 'pt' ? 'Limite de tamanho de arquivo de 50MB' : 'Límite de tamaño de archivo de 50MB'
        }
      ],
      cta: language === 'en' ? 'Upgrade to Pro' : language === 'pt' ? 'Atualizar para Pro' : 'Mejorar a Pro',
      color: 'from-blue-500 to-cyan-500'
    },
    ultra: {
      name: 'ClearGrade Ultra',
      price: '$9.99',
      billingCycle: language === 'en' ? '/month' : language === 'pt' ? '/mês' : '/mes',
      description: language === 'en' 
        ? 'Unlimited power' 
        : language === 'pt' 
        ? 'Poder ilimitado' 
        : 'Poder ilimitado',
      features: [
        { 
          key: 'filesPerBatch',
          text: language === 'en' ? 'Unlimited schedules per upload' : language === 'pt' ? 'Agendas ilimitadas por envio' : 'Agendas ilimitadas por envío'
        },
        { 
          key: 'delayBetweenBatches',
          text: language === 'en' ? 'Instant processing (no delay)' : language === 'pt' ? 'Processamento instantâneo (sem delay)' : 'Procesamiento instantáneo (sin delay)'
        },
        { 
          key: 'chatMessages',
          text: language === 'en' ? 'Unlimited AI chat messages' : language === 'pt' ? 'Mensagens de chat IA ilimitadas' : 'Mensajes de chat IA ilimitados'
        },
        { 
          key: 'adsFree',
          text: language === 'en' ? 'Ad-free experience' : language === 'pt' ? 'Experiência sem anúncios' : 'Experiencia sin anuncios'
        },
        { 
          key: 'fileSize',
          text: language === 'en' ? '100MB file size limit' : language === 'pt' ? 'Limite de tamanho de arquivo de 100MB' : 'Límite de tamaño de archivo de 100MB'
        },
        { 
          key: 'priority',
          text: language === 'en' ? 'Priority support' : language === 'pt' ? 'Suporte prioritário' : 'Soporte prioritario'
        }
      ],
      cta: language === 'en' ? 'Upgrade to Ultra' : language === 'pt' ? 'Atualizar para Ultra' : 'Mejorar a Ultra',
      color: 'from-purple-500 to-pink-500'
    }
  }

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            {language === 'en' ? 'Unlock Your Full Potential' : language === 'pt' ? 'Desbloqueie Seu Potencial Total' : 'Desbloquea Tu Potencial Total'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Upgrade your plan to remove limits and get the most out of ClearGrade' 
              : language === 'pt' 
              ? 'Atualize seu plano para remover limites e aproveitar ao máximo o ClearGrade' 
              : 'Mejora tu plan para eliminar límites y aprovechar al máximo ClearGrade'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {Object.entries(plans).map(([planKey, plan]) => (
            <div
              key={planKey}
              className={`relative rounded-3xl border-2 overflow-hidden transition-all ${
                selectedPlan === planKey
                  ? 'border-primary shadow-2xl scale-105'
                  : 'border-border/50 hover:border-border'
              }`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-10`} />
              
              {/* Content */}
              <div className="relative p-8">
                {/* Badge */}
                {planKey === 'ultra' && (
                  <div className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    {language === 'en' ? 'Most Popular' : language === 'pt' ? 'Mais Popular' : 'Más Popular'}
                  </div>
                )}

                {/* Plan name and description */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.billingCycle}</span>
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.key} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={`/dashboard/upgrade?plan=${planKey}`}>
                  <Button 
                    className="w-full h-12 rounded-xl text-base font-semibold"
                    variant={selectedPlan === planKey ? 'default' : 'outline'}
                    onClick={() => onUpgradeClick?.(planKey as 'pro' | 'ultra')}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                {/* Money back guarantee */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {language === 'en' 
                    ? '30-day money-back guarantee' 
                    : language === 'pt' 
                    ? 'Garantia de devolução do dinheiro em 30 dias' 
                    : 'Garantía de devolución de dinero en 30 días'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-secondary/30 rounded-2xl p-8 border border-border/50">
          <h3 className="text-xl font-bold mb-6">
            {language === 'en' ? 'Plan Comparison' : language === 'pt' ? 'Comparação de Planos' : 'Comparación de Planes'}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold">Free</th>
                  <th className="text-center py-3 px-4 font-semibold">Pro</th>
                  <th className="text-center py-3 px-4 font-semibold">Ultra</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/30">
                  <td className="py-4 px-4">Schedules per upload</td>
                  <td className="text-center py-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center py-4">3</td>
                  <td className="text-center py-4">∞</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-4 px-4">Processing speed</td>
                  <td className="text-center py-4">2s</td>
                  <td className="text-center py-4">0.5s</td>
                  <td className="text-center py-4">Instant</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-4 px-4">Chat messages/day</td>
                  <td className="text-center py-4">10</td>
                  <td className="text-center py-4">50</td>
                  <td className="text-center py-4">∞</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Max file size</td>
                  <td className="text-center py-4">10MB</td>
                  <td className="text-center py-4">50MB</td>
                  <td className="text-center py-4">100MB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
