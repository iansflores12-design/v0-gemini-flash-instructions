'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { themes, getThemeById, type Theme } from '@/lib/themes'

export type DarkMode = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
  darkMode: DarkMode
  setDarkMode: (mode: DarkMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes[0])
  const [darkMode, setDarkModeState] = useState<DarkMode>('auto')
  const [mounted, setMounted] = useState(false)

  // Apply theme CSS based on dark mode
  const applyTheme = (selectedTheme: Theme, mode: DarkMode) => {
    const root = document.documentElement
    const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    // Apply CSS variables
    const css = isDark ? selectedTheme.dark : selectedTheme.light
    root.style.cssText = css.split(';').filter(s => s.trim()).join(';') + ';'
    
    // Add/remove dark class
    root.classList.toggle('dark', isDark)
  }

  useEffect(() => {
    setMounted(true)
    const savedThemeId = localStorage.getItem('cleargrade-theme') || 'm3e'
    const savedDarkMode = (localStorage.getItem('cleargrade-dark-mode') as DarkMode) || 'auto'
    
    const savedTheme = getThemeById(savedThemeId) || themes[0]
    setThemeState(savedTheme)
    setDarkModeState(savedDarkMode)
    
    applyTheme(savedTheme, savedDarkMode)

    // Listen for system changes when auto
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      const current = (localStorage.getItem('cleargrade-dark-mode') as DarkMode) || 'auto'
      if (current === 'auto') {
        applyTheme(savedTheme, 'auto')
      }
    }
    mq.addEventListener('change', handleSystemChange)
    return () => mq.removeEventListener('change', handleSystemChange)
  }, [])

  const setTheme = (themeId: string) => {
    const newTheme = getThemeById(themeId)
    if (newTheme) {
      setThemeState(newTheme)
      localStorage.setItem('cleargrade-theme', themeId)
      applyTheme(newTheme, darkMode)
    }
  }

  const setDarkMode = (mode: DarkMode) => {
    setDarkModeState(mode)
    localStorage.setItem('cleargrade-dark-mode', mode)
    applyTheme(theme, mode)
  }

  if (!mounted) return children

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
