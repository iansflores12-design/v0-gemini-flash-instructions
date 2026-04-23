'use client'

import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'

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

  return (
    <header className="px-4 pt-6 pb-4 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-bold text-foreground">{firstName}</h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
    </header>
  )
}