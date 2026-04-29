'use client'

import { useState, useEffect } from 'react'
import { DarkModeToggle } from '@/components/dark-mode-toggle'

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
    <header className="px-4 pt-6 pb-4 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-bold text-foreground">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {initial}
          </div>
        </div>
      </div>
    </header>
  )
}
