'use client'

import { useState } from 'react'
import { AlertCircle, X, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/language-provider'
import Link from 'next/link'

interface LimitReachedModalProps {
  isOpen: boolean
  onClose: () => void
  limitType: 'files' | 'chat' | 'fileSize'
  currentPlan: 'free' | 'pro'
  recommended: 'pro' | 'ultra'
}

export function LimitReachedModal({ 
  isOpen, 
  onClose, 
  limitType, 
  currentPlan,
  recommended 
}: LimitReachedModalProps) {
  const { language } = useLanguage()

  if (!isOpen) return null

  const getContent = () => {
    const baseText = {
      en: {
        files: {
          title: 'Upload Limit Reached',
          message: 'You can only upload 3 schedules at a time on the Free plan.',
          recommendation: 'Upgrade to Pro to upload unlimited schedules'
        },
        chat: {
          title: 'Daily Chat Limit Reached',
          message: 'You have used all 10 daily AI chat messages.',
          recommendation: 'Upgrade to get more messages'
        },
        fileSize: {
          title: 'File Too Large',
          message: 'Maximum file size for Free plan is 10MB.',
          recommendation: 'Upgrade to Pro (50MB) or Ultra (100MB)'
        }
      },
      es: {
        files: {
          title: 'Límite de Carga Alcanzado',
          message: 'Solo puedes subir 3 agendas a la vez en el plan Gratuito.',
          recommendation: 'Mejora a Pro para subir agendas ilimitadas'
        },
        chat: {
          title: 'Límite de Chat Diario Alcanzado',
          message: 'Has usado todos tus 10 mensajes de chat IA diarios.',
          recommendation: 'Mejora para obtener más mensajes'
        },
        fileSize: {
          title: 'Archivo Demasiado Grande',
          message: 'El tamaño máximo de archivo para el plan Gratuito es 10MB.',
          recommendation: 'Mejora a Pro (50MB) o Ultra (100MB)'
        }
      },
      pt: {
        files: {
          title: 'Limite de Envio Atingido',
          message: 'Você só pode enviar 3 agendas por vez no plano Gratuito.',
          recommendation: 'Atualize para Pro para enviar agendas ilimitadas'
        },
        chat: {
          title: 'Limite Diário de Chat Atingido',
          message: 'Você usou todas as 10 mensagens de chat IA diárias.',
          recommendation: 'Atualize para obter mais mensagens'
        },
        fileSize: {
          title: 'Arquivo Muito Grande',
          message: 'O tamanho máximo de arquivo para o plano Gratuito é 10MB.',
          recommendation: 'Atualize para Pro (50MB) ou Ultra (100MB)'
        }
      }
    }

    const lang = language === 'en' ? 'en' : language === 'pt' ? 'pt' : 'es'
    return baseText[lang][limitType]
  }

  const content = getContent()
  const lang = language === 'en' ? 'en' : language === 'pt' ? 'pt' : 'es'

  const upgradeTexts = {
    en: {
      pro: 'Upgrade to Pro',
      ultra: 'Upgrade to Ultra',
      benefits: 'Get Pro benefits'
    },
    es: {
      pro: 'Mejorar a Pro',
      ultra: 'Mejorar a Ultra',
      benefits: 'Obtén beneficios de Pro'
    },
    pt: {
      pro: 'Atualizar para Pro',
      ultra: 'Atualizar para Ultra',
      benefits: 'Obtenha benefícios de Pro'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl shadow-2xl max-w-sm w-full border border-border p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-secondary/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-3">
          {content.title}
        </h2>

        {/* Message */}
        <p className="text-muted-foreground text-center mb-6">
          {content.message}
        </p>

        {/* Recommendation */}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-8">
          <p className="text-sm text-center">
            <span className="font-semibold text-primary">
              {content.recommendation}
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* Pro button */}
          {(recommended === 'pro' || currentPlan === 'free') && (
            <Link href="/dashboard/upgrade?plan=pro" className="w-full">
              <Button className="w-full h-11 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                {upgradeTexts[lang].pro}
              </Button>
            </Link>
          )}

          {/* Ultra button */}
          {recommended === 'ultra' && (
            <Link href="/dashboard/upgrade?plan=ultra" className="w-full">
              <Button className="w-full h-11 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold">
                <Crown className="w-4 h-4 mr-2" />
                {upgradeTexts[lang].ultra}
              </Button>
            </Link>
          )}

          {/* Cancel button */}
          <Button 
            variant="ghost" 
            className="w-full h-11 rounded-xl"
            onClick={onClose}
          >
            {language === 'en' ? 'Maybe later' : language === 'pt' ? 'Talvez depois' : 'Tal vez más tarde'}
          </Button>
        </div>
      </div>
    </div>
  )
}
