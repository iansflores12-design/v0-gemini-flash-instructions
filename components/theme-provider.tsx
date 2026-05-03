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
  customPrimaryColor: string | null
  setCustomPrimaryColor: (color: string | null) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes[0])
  const [darkMode, setDarkModeState] = useState<DarkMode>('auto')
  const [customPrimaryColor, setCustomPrimaryColorState] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // All CSS variables used by themes
  const cssVariables = [
    '--background', '--foreground', '--card', '--card-foreground',
    '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
    '--muted', '--muted-foreground', '--accent', '--accent-foreground',
    '--destructive', '--border', '--input', '--ring', '--radius'
  ]

  // Apply theme CSS based on dark mode
  const applyTheme = (selectedTheme: Theme, mode: DarkMode, preserveCustomColor?: string | null) => {
    const root = document.documentElement
    const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    // CLEAR all CSS variables first to prevent mixing
    cssVariables.forEach(prop => root.style.removeProperty(prop))
    
    // Apply new CSS variables
    const css = isDark ? selectedTheme.dark : selectedTheme.light
    css.split(';').filter(s => s.trim()).forEach(declaration => {
      const [prop, ...rest] = declaration.split(':')
      if (prop && rest.length) {
        root.style.setProperty(prop.trim(), rest.join(':').trim())
      }
    })
    
    // Re-apply custom color if present (Material theme only)
    if (preserveCustomColor && selectedTheme.id === 'm3e') {
      root.style.setProperty('--primary', preserveCustomColor)
      root.style.setProperty('--ring', preserveCustomColor)
    }
    
    // Add/remove dark class
    root.classList.toggle('dark', isDark)
  }

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    const savedThemeId = localStorage.getItem('cleargrade-theme') || 'm3e'
    const savedDarkMode = (localStorage.getItem('cleargrade-dark-mode') as DarkMode) || 'auto'
    
    const savedTheme = getThemeById(savedThemeId) || themes[0]
    setThemeState(savedTheme)
    setDarkModeState(savedDarkMode)
    
    applyTheme(savedTheme, savedDarkMode)

    // Restore custom color for Material theme
    if (savedThemeId === 'm3e') {
      const useCustom = localStorage.getItem('cleargrade-use-custom-color')
      const savedColor = localStorage.getItem('cleargrade-custom-color')
      if (useCustom === 'true' && savedColor) {
        setCustomPrimaryColorState(savedColor)
        // Use the conversion logic to apply hue
        const hex = savedColor.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16) / 255
        const g = parseInt(hex.substring(2, 4), 16) / 255
        const b = parseInt(hex.substring(4, 6), 16) / 255
        
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const delta = max - min
        
        let hue = 0
        if (delta !== 0) {
          if (max === r) hue = ((g - b) / delta) % 6
          else if (max === g) hue = (b - r) / delta + 2
          else hue = (r - g) / delta + 4
          hue = hue * 60
          if (hue < 0) hue += 360
        }
        
        const isDark = savedDarkMode === 'dark' || (savedDarkMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        if (!isDark) {
          document.documentElement.style.setProperty('--primary', `oklch(0.45 0.18 ${hue})`)
          document.documentElement.style.setProperty('--secondary', `oklch(0.92 0.03 ${hue})`)
          document.documentElement.style.setProperty('--border', `oklch(0.90 0.02 ${hue})`)
          document.documentElement.style.setProperty('--ring', `oklch(0.45 0.18 ${hue})`)
        } else {
          document.documentElement.style.setProperty('--primary', `oklch(0.72 0.18 ${hue})`)
          document.documentElement.style.setProperty('--secondary', `oklch(0.32 0.03 ${hue})`)
          document.documentElement.style.setProperty('--border', `oklch(0.25 0.02 ${hue})`)
          document.documentElement.style.setProperty('--ring', `oklch(0.72 0.18 ${hue})`)
        }
      }
    }

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

  // Effect to re-apply theme when darkMode changes
  useEffect(() => {
    if (!mounted) return
    applyTheme(theme, darkMode, customPrimaryColor)
  }, [darkMode])

  const setTheme = (themeId: string) => {
    const newTheme = getThemeById(themeId)
    if (newTheme) {
      setThemeState(newTheme)
      localStorage.setItem('cleargrade-theme', themeId)
      // Only preserve custom color when staying on Material theme
      const preserved = themeId === 'm3e' ? customPrimaryColor : null
      if (themeId !== 'm3e') {
        setCustomPrimaryColorState(null)
        localStorage.removeItem('cleargrade-use-custom-color')
      }
      applyTheme(newTheme, darkMode, preserved)
    }
  }

  const setDarkMode = (mode: DarkMode) => {
    setDarkModeState(mode)
    localStorage.setItem('cleargrade-dark-mode', mode)
    // Use the current state to get fresh theme data
    const currentTheme = theme // Get latest theme
    applyTheme(currentTheme, mode, customPrimaryColor)
  }

  const setCustomPrimaryColor = (color: string | null) => {
    if (theme.id !== 'm3e') return
    setCustomPrimaryColorState(color)
    
    if (color) {
      // Convert hex to RGB to extract hue
      const hex = color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16) / 255
      const g = parseInt(hex.substring(2, 4), 16) / 255
      const b = parseInt(hex.substring(4, 6), 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const delta = max - min
      
      let hue = 0
      if (delta !== 0) {
        if (max === r) hue = ((g - b) / delta) % 6
        else if (max === g) hue = (b - r) / delta + 2
        else hue = (r - g) / delta + 4
        hue = hue * 60
        if (hue < 0) hue += 360
      }
      
      // Apply custom hue to Material theme colors (preserve lightness and chroma)
      const isDark = document.documentElement.classList.contains('dark')
      if (!isDark) {
        // Light mode - Material theme values with custom hue
        document.documentElement.style.setProperty('--primary', `oklch(0.45 0.18 ${hue})`)
        document.documentElement.style.setProperty('--primary-foreground', 'oklch(0.98 0.005 270)')
        document.documentElement.style.setProperty('--secondary', `oklch(0.92 0.03 ${hue})`)
        document.documentElement.style.setProperty('--border', `oklch(0.90 0.02 ${hue})`)
        document.documentElement.style.setProperty('--ring', `oklch(0.45 0.18 ${hue})`)
      } else {
        // Dark mode - Material theme dark values with custom hue
        document.documentElement.style.setProperty('--primary', `oklch(0.72 0.18 ${hue})`)
        document.documentElement.style.setProperty('--primary-foreground', 'oklch(0.12 0.01 270)')
        document.documentElement.style.setProperty('--secondary', `oklch(0.32 0.03 ${hue})`)
        document.documentElement.style.setProperty('--border', `oklch(0.25 0.02 ${hue})`)
        document.documentElement.style.setProperty('--ring', `oklch(0.72 0.18 ${hue})`)
      }
      
      localStorage.setItem('cleargrade-custom-color', color)
      localStorage.setItem('cleargrade-use-custom-color', 'true')
    } else {
      localStorage.removeItem('cleargrade-custom-color')
      localStorage.removeItem('cleargrade-use-custom-color')
      applyTheme(theme, darkMode, null)
    }
  }

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, darkMode, setDarkMode, customPrimaryColor, setCustomPrimaryColor }}>
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
