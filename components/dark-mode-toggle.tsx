'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, SunMoon } from 'lucide-react'
import { cn } from '@/lib/utils'

type DarkMode = 'light' | 'dark' | 'auto'

const KEY = 'cleargrade-dark-mode'

function applyDark(mode: DarkMode) {
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
  } else if (mode === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

const options: { mode: DarkMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'light', icon: <Sun className="w-4 h-4" />, label: 'Claro' },
  { mode: 'auto',  icon: <SunMoon className="w-4 h-4" />, label: 'Auto' },
  { mode: 'dark',  icon: <Moon className="w-4 h-4" />, label: 'Oscuro' },
]

export function DarkModeToggle() {
  const [mode, setMode] = useState<DarkMode>('auto')

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as DarkMode) || 'auto'
    setMode(saved)
    applyDark(saved)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const current = (localStorage.getItem(KEY) as DarkMode) || 'auto'
      if (current === 'auto') applyDark('auto')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const handleSelect = (m: DarkMode) => {
    setMode(m)
    localStorage.setItem(KEY, m)
    applyDark(m)
  }

  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-2xl bg-secondary border border-border">
      {options.map(({ mode: m, icon, label }) => (
        <button
          key={m}
          onClick={() => handleSelect(m)}
          aria-label={label}
          title={label}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
            mode === m
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
