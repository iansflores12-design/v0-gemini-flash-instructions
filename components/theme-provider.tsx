'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { themes, getThemeById, getDefaultTheme, type Theme } from '@/lib/themes'

export type DarkMode = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
  customPrimaryColor: string | null
  setCustomPrimaryColor: (color: string | null) => void
  darkMode: DarkMode
  setDarkMode: (mode: DarkMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Convert hex to hue value for OKLCH
function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  
  let h = 0
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min)) * 60
    else if (max === g) h = (2 + (b - r) / (max - min)) * 60
    else h = (4 + (r - g) / (max - min)) * 60
    if (h < 0) h += 360
  }
  
  return h
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getDefaultTheme())
  const [customPrimaryColor, setCustomPrimaryColorState] = useState<string | null>(null)
  const [darkMode, setDarkModeState] = useState<DarkMode>('auto')
  const [mounted, setMounted] = useState(false)

  const applyDark = (mode: DarkMode) => {
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark')
    } else if (mode === 'light') {
      root.classList.remove('dark')
    } else {
      // auto: follow system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }
  }

  useEffect(() => {
    setMounted(true)
    const savedThemeId = localStorage.getItem('cleargrade-theme')
    const savedCustomColor = localStorage.getItem('cleargrade-custom-color')
    const useCustom = localStorage.getItem('cleargrade-use-custom-color')
    const savedDarkMode = (localStorage.getItem('cleargrade-dark-mode') as DarkMode) ?? 'auto'

    setDarkModeState(savedDarkMode)
    
    if (savedThemeId) {
      const savedTheme = getThemeById(savedThemeId)
      if (savedTheme) {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      }
    }
    
    if (useCustom === 'true' && savedCustomColor) {
      setCustomPrimaryColorState(savedCustomColor)
      applyCustomColor(savedCustomColor)
    }

    // Apply dark mode AFTER theme is set
    setTimeout(() => applyDark(savedDarkMode), 0)

    // Listen for system changes when auto
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      const current = (localStorage.getItem('cleargrade-dark-mode') as DarkMode) || 'auto'
      if (current === 'auto') applyDark('auto')
    }
    mq.addEventListener('change', handleSystemChange)

    return () => mq.removeEventListener('change', handleSystemChange)
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

  const applyCustomColor = (color: string) => {
    const root = document.documentElement
    const hue = hexToHue(color)
    const isDark = root.classList.contains('dark')
    
    if (isDark) {
      // Dark mode colors
      root.style.setProperty('--background', `oklch(0.15 0.02 ${hue})`)
      root.style.setProperty('--foreground', `oklch(0.95 0.005 ${hue})`)
      root.style.setProperty('--card', `oklch(0.20 0.025 ${hue})`)
      root.style.setProperty('--card-foreground', `oklch(0.95 0.005 ${hue})`)
      root.style.setProperty('--popover', `oklch(0.20 0.025 ${hue})`)
      root.style.setProperty('--popover-foreground', `oklch(0.95 0.005 ${hue})`)
      root.style.setProperty('--primary', `oklch(0.75 0.12 ${hue})`)
      root.style.setProperty('--primary-foreground', `oklch(0.20 0.06 ${hue})`)
      root.style.setProperty('--secondary', `oklch(0.28 0.04 ${hue})`)
      root.style.setProperty('--secondary-foreground', `oklch(0.90 0.02 ${hue})`)
      root.style.setProperty('--muted', `oklch(0.25 0.03 ${hue})`)
      root.style.setProperty('--muted-foreground', `oklch(0.65 0.02 ${hue})`)
      root.style.setProperty('--accent', `oklch(0.70 0.12 ${hue})`)
      root.style.setProperty('--accent-foreground', `oklch(0.15 0.04 ${hue})`)
      root.style.setProperty('--border', `oklch(0.30 0.03 ${hue})`)
      root.style.setProperty('--input', `oklch(0.28 0.03 ${hue})`)
      root.style.setProperty('--ring', `oklch(0.75 0.12 ${hue})`)
      root.style.setProperty('--surface-container', `oklch(0.22 0.025 ${hue})`)
      root.style.setProperty('--surface-container-high', `oklch(0.25 0.03 ${hue})`)
      root.style.setProperty('--on-surface-variant', `oklch(0.70 0.02 ${hue})`)
      root.style.setProperty('--outline', `oklch(0.45 0.02 ${hue})`)
      root.style.setProperty('--outline-variant', `oklch(0.35 0.025 ${hue})`)
      root.style.setProperty('--sidebar', `oklch(0.18 0.025 ${hue})`)
      root.style.setProperty('--sidebar-foreground', `oklch(0.95 0.005 ${hue})`)
      root.style.setProperty('--sidebar-primary', `oklch(0.75 0.12 ${hue})`)
      root.style.setProperty('--sidebar-primary-foreground', `oklch(0.20 0.06 ${hue})`)
      root.style.setProperty('--sidebar-accent', `oklch(0.28 0.04 ${hue})`)
      root.style.setProperty('--sidebar-accent-foreground', `oklch(0.90 0.02 ${hue})`)
      root.style.setProperty('--sidebar-border', `oklch(0.30 0.03 ${hue})`)
      root.style.setProperty('--sidebar-ring', `oklch(0.75 0.12 ${hue})`)
    } else {
      // Light mode colors
      root.style.setProperty('--background', `oklch(0.98 0.005 ${hue})`)
      root.style.setProperty('--foreground', `oklch(0.15 0.02 ${hue})`)
      root.style.setProperty('--card', `oklch(1 0 0)`)
      root.style.setProperty('--card-foreground', `oklch(0.15 0.02 ${hue})`)
      root.style.setProperty('--popover', `oklch(1 0 0)`)
      root.style.setProperty('--popover-foreground', `oklch(0.15 0.02 ${hue})`)
      root.style.setProperty('--primary', `oklch(0.45 0.18 ${hue})`)
      root.style.setProperty('--primary-foreground', `oklch(0.98 0.005 ${hue})`)
      root.style.setProperty('--secondary', `oklch(0.92 0.03 ${hue})`)
      root.style.setProperty('--secondary-foreground', `oklch(0.25 0.08 ${hue})`)
      root.style.setProperty('--muted', `oklch(0.95 0.01 ${hue})`)
      root.style.setProperty('--muted-foreground', `oklch(0.45 0.02 ${hue})`)
      root.style.setProperty('--accent', `oklch(0.90 0.04 ${hue})`)
      root.style.setProperty('--accent-foreground', `oklch(0.20 0.06 ${hue})`)
      root.style.setProperty('--border', `oklch(0.90 0.02 ${hue})`)
      root.style.setProperty('--input', `oklch(0.95 0.01 ${hue})`)
      root.style.setProperty('--ring', `oklch(0.45 0.18 ${hue})`)
      root.style.setProperty('--surface-container', `oklch(0.96 0.008 ${hue})`)
      root.style.setProperty('--surface-container-high', `oklch(0.94 0.01 ${hue})`)
      root.style.setProperty('--on-surface-variant', `oklch(0.45 0.02 ${hue})`)
      root.style.setProperty('--outline', `oklch(0.78 0.015 ${hue})`)
      root.style.setProperty('--outline-variant', `oklch(0.88 0.01 ${hue})`)
      root.style.setProperty('--sidebar', `oklch(0.98 0.005 ${hue})`)
      root.style.setProperty('--sidebar-foreground', `oklch(0.15 0.02 ${hue})`)
      root.style.setProperty('--sidebar-primary', `oklch(0.45 0.18 ${hue})`)
      root.style.setProperty('--sidebar-primary-foreground', `oklch(0.98 0.005 ${hue})`)
      root.style.setProperty('--sidebar-accent', `oklch(0.92 0.03 ${hue})`)
      root.style.setProperty('--sidebar-accent-foreground', `oklch(0.25 0.08 ${hue})`)
      root.style.setProperty('--sidebar-border', `oklch(0.90 0.02 ${hue})`)
      root.style.setProperty('--sidebar-ring', `oklch(0.45 0.18 ${hue})`)
    }
  }

  const setTheme = (themeId: string) => {
    const newTheme = getThemeById(themeId)
    if (newTheme) {
      setThemeState(newTheme)
      applyTheme(newTheme)
      localStorage.setItem('cleargrade-theme', themeId)
      
      // Re-apply custom color if enabled
      const useCustom = localStorage.getItem('cleargrade-use-custom-color')
      const savedCustomColor = localStorage.getItem('cleargrade-custom-color')
      if (useCustom === 'true' && savedCustomColor) {
        applyCustomColor(savedCustomColor)
      }
    }
  }

  const setCustomPrimaryColor = (color: string | null) => {
    setCustomPrimaryColorState(color)
    if (color) {
      applyCustomColor(color)
    } else {
      applyTheme(theme)
    }
  }

  const setDarkMode = (mode: DarkMode) => {
    setDarkModeState(mode)
    applyDark(mode)
    localStorage.setItem('cleargrade-dark-mode', mode)
    
    // Re-apply custom color if enabled (so it adapts to light/dark)
    const useCustom = localStorage.getItem('cleargrade-use-custom-color')
    const savedCustomColor = localStorage.getItem('cleargrade-custom-color')
    if (useCustom === 'true' && savedCustomColor) {
      setTimeout(() => applyCustomColor(savedCustomColor), 0)
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, customPrimaryColor, setCustomPrimaryColor, darkMode, setDarkMode }}>
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
