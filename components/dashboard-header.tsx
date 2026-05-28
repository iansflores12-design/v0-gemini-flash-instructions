'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { Settings } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

interface DashboardHeaderProps {
  userName: string
  institution?: string
}

export function DashboardHeader({ userName, institution }: DashboardHeaderProps) {
  const { t, language } = useLanguage()
  const [greeting, setGreeting] = useState('')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    const hour = new Date().getHours()
    if (hour < 12) setGreeting(t('buenasDias'))
    else if (hour < 18) setGreeting(t('buenasTardes'))
    else setGreeting(t('buenasNoches'))
  }, [language, mounted, t])

  const firstName = userName.split(' ')[0]
  const initial = firstName[0]?.toUpperCase() ?? 'U'

  return (
    <header className="bg-background px-4 pb-4 pt-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">{firstName}</h1>
          {institution && (
            <p className="text-xs text-muted-foreground/80 mt-1">{institution}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Link
            href="/dashboard/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground ring-1 ring-border/50 transition-colors hover:bg-muted hover:text-foreground"
            title={t('configuracion')}
          >
            <Settings className="h-5 w-5" />
          </Link>
          <DarkModeToggle />
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md ring-2 ring-primary/25">
            {initial}
          </div>
        </div>
      </div>
    </header>
  )
}
