'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { Settings } from 'lucide-react'

interface DashboardHeaderProps {
  userName: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState('')
  
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Buenos dias')
    else if (hour < 18) setGreeting('Buenas tardes')
    else setGreeting('Buenas noches')
  }, [])

  const firstName = userName.split(' ')[0]
  const initial = firstName[0]?.toUpperCase() ?? 'U'

  return (
    <header className="bg-background px-4 pb-4 pt-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">{firstName}</h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Link
            href="/dashboard/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground ring-1 ring-border/50 transition-colors hover:bg-muted hover:text-foreground"
            title="Ajustes"
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
