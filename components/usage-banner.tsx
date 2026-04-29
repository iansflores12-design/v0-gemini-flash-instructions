'use client'

import { AlertCircle, Zap, Upgrade } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UsageBannerProps {
  used: number
  limit: number
  plan: 'free' | 'pro' | 'premium'
  label: string
}

export function UsageBanner({ used, limit, plan, label }: UsageBannerProps) {
  const percentage = (used / limit) * 100
  const isWarning = percentage > 75
  const isLimited = percentage >= 100

  if (plan !== 'free') return null // Only show for free users

  return (
    <div className={`p-4 rounded-2xl border ${
      isLimited ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900' :
      isWarning ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900' :
      'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          isLimited ? 'bg-red-100 dark:bg-red-900' :
          isWarning ? 'bg-yellow-100 dark:bg-yellow-900' :
          'bg-blue-100 dark:bg-blue-900'
        }`}>
          {isLimited ? (
            <AlertCircle className={`w-5 h-5 ${
              isLimited ? 'text-red-600' :
              isWarning ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
          ) : (
            <Zap className={`w-5 h-5 ${
              isWarning ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
          )}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${
            isLimited ? 'text-red-900 dark:text-red-100' :
            isWarning ? 'text-yellow-900 dark:text-yellow-100' :
            'text-blue-900 dark:text-blue-100'
          }`}>
            {label}: {used}/{limit}
          </p>
          <p className={`text-sm mt-1 ${
            isLimited ? 'text-red-800 dark:text-red-200' :
            isWarning ? 'text-yellow-800 dark:text-yellow-200' :
            'text-blue-800 dark:text-blue-200'
          }`}>
            {isLimited 
              ? 'Has alcanzado tu limite. Actualiza a Pro para seguir usando.'
              : `Estas usando el ${Math.round(percentage)}% de tu limite diario.`
            }
          </p>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isLimited ? 'bg-red-500' :
                isWarning ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
        <Link href="/dashboard/upgrade">
          <Button size="sm" variant="outline" className="gap-2 whitespace-nowrap">
            <Upgrade className="w-4 h-4" />
            Upgrade
          </Button>
        </Link>
      </div>
    </div>
  )
}
