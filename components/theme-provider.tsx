'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { themes, getThemeById, getDefaultTheme, type Theme } from '@/lib/themes'

interface ThemeContextType {
  theme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getDefaultTheme())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedThemeId = localStorage.getItem('cleargrade-theme')
    if (savedThemeId) {
      const savedTheme = getThemeById(savedThemeId)
      if (savedTheme) {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      }
    }
  }, [])

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    const cssLines = theme.css.split('\n').filter(line => line.trim().startsWith('--'))
    cssLines.forEach(line => {
      const [prop, value] = line.split(':').map(s => s.trim().replace(';', ''))
      if (prop && value) {
        root.style.setProperty(prop, value)
      }
    })
    root.setAttribute('data-theme', theme.id)
  }

  const setTheme = (themeId: string) => {
    const newTheme = getThemeById(themeId)
    if (newTheme) {
      setThemeState(newTheme)
      applyTheme(newTheme)
      localStorage.setItem('cleargrade-theme', themeId)
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
