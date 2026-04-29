'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface AdBannerProps {
  title: string
  description: string
  cta?: string
  ctaHref?: string
}

export function AdBanner({ title, description, cta, ctaHref }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-900">
      <div className="flex items-start gap-3 justify-between">
        <div className="flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {cta && ctaHref && (
            <a
              href={ctaHref}
              className="text-sm font-medium text-primary hover:underline mt-2 inline-block"
            >
              {cta} →
            </a>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
