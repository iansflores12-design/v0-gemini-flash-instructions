'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { themes, getThemeById, getDefaultTheme, type Theme } from '@/lib/themes'

interface ThemeContextType {
  theme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
  customPrimaryColor: string | null
  setCustomPrimaryColor: (color: string | null) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Convert hex to OKLCH (simplified conversion)
function hexToOklch(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  // Simple luminance calculation
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  
  // Simplified chroma and hue
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const c = (max - min) * 0.15
  
  let h = 0
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min)) * 60
    else if (max === g) h = (2 + (b - r) / (max - min)) * 60
    else h = (4 + (r - g) / (max - min)) * 60
    if (h < 0) h += 360
  }
  
  return `oklch(${(0.3 + l * 0.3).toFixed(2)} ${c.toFixed(2)} ${h.toFixed(0)})`
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getDefaultTheme())
  const [customPrimaryColor, setCustomPrimaryColorState] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedThemeId = localStorage.getItem('cleargrade-theme')
    const savedCustomColor = localStorage.getItem('cleargrade-custom-color')
    const useCustom = localStorage.getItem('cleargrade-use-custom-color')
    
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
    const oklchColor = hexToOklch(color)
    root.style.setProperty('--primary', oklchColor)
    // Also set a lighter version for hover states
    const lighterOklch = oklchColor.replace(/oklch\(([\d.]+)/, (_, l) => `oklch(${(parseFloat(l) + 0.1).toFixed(2)}`)
    root.style.setProperty('--ring', oklchColor)
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
      // Re-apply current theme to reset colors
      applyTheme(theme)
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, customPrimaryColor, setCustomPrimaryColor }}>
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
