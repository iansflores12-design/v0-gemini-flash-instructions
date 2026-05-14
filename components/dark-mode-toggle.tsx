'use client'

import { Sun, Moon, SunMoon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

type DarkMode = 'light' | 'dark' | 'auto'

const options: { mode: DarkMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'light', icon: <Sun className="w-4 h-4" />, label: 'Claro' },
  { mode: 'auto',  icon: <SunMoon className="w-4 h-4" />, label: 'Auto' },
  { mode: 'dark',  icon: <Moon className="w-4 h-4" />, label: 'Oscuro' },
]

export function DarkModeToggle() {
  const { darkMode, setDarkMode } = useTheme()

  return (
    <div
      className="inline-flex items-center gap-0.5 p-1 rounded-full bg-muted/80 border border-border/60 shadow-sm backdrop-blur-sm"
      role="group"
      aria-label="Modo de color"
    >
      {options.map(({ mode: m, icon, label }) => (
        <button
          key={m}
          type="button"
          onClick={() => setDarkMode(m)}
          aria-label={label}
          title={label}
          aria-pressed={darkMode === m}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
            darkMode === m
              ? 'bg-secondary text-foreground shadow-sm ring-1 ring-border/80'
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
