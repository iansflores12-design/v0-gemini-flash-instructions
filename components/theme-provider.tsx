'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { themes, getThemeById, getDefaultTheme, type Theme } from '@/lib/themes'

export type DarkMode = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  themes: Theme[]
  setTheme: (id: string) => void
  darkMode: DarkMode
  setDarkMode: (mode: DarkMode) => void
  customColor: string | null
  setCustomColor: (color: string | null) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const ALL_VARS = [
  '--background', '--foreground',
  '--card', '--card-foreground',
  '--popover', '--popover-foreground',
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--muted', '--muted-foreground',
  '--accent', '--accent-foreground',
  '--destructive', '--destructive-foreground',
  '--border', '--input', '--ring', '--radius',
]

function resolveIsDark(mode: DarkMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
}

function applyTokens(theme: Theme, isDark: boolean, customColor: string | null) {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  const tokens = isDark ? theme.dark : theme.light

  // 1. Limpiar variables con una transición suave para evitar parpadeos bruscos
  ALL_VARS.forEach(v => root.style.removeProperty(v))

  // 2. Aplicar tokens del tema seleccionado
  Object.entries(tokens).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
  })

  // 3. Priorizar color personalizado para Material 3 (m3e)
  if (customColor && theme.id === 'm3e') {
    root.style.setProperty('--primary', customColor)
    root.style.setProperty('--ring', customColor)
    // Opcional: Podrías derivar un color de fondo sutil aquí para evitar el verde
  }

  root.classList.toggle('dark', isDark)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getDefaultTheme())
  const [darkMode, setDarkModeState] = useState<DarkMode>('auto')
  const [customColor, setCustomColorState] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const themeRef = useRef(theme)
  const darkModeRef = useRef(darkMode)
  const customColorRef = useRef(customColor)

  useEffect(() => {
    const savedThemeId = localStorage.getItem('cleargrade-theme') || 'm3e'
    const savedMode    = (localStorage.getItem('cleargrade-dark-mode') as DarkMode) || 'auto'
    const savedColor   = localStorage.getItem('cleargrade-custom-color') || null
    const useCustom    = localStorage.getItem('cleargrade-use-custom-color') === 'true'

    const t = getThemeById(savedThemeId) ?? getDefaultTheme()
    const c = (useCustom && savedColor && t.id === 'm3e') ? savedColor : null

    setThemeState(t)
    setDarkModeState(savedMode)
    setCustomColorState(c)
    
    themeRef.current = t
    darkModeRef.current = savedMode
    customColorRef.current = c

    applyTokens(t, resolveIsDark(savedMode), c)
    setMounted(true)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      if (darkModeRef.current === 'auto') {
        applyTokens(themeRef.current, mq.matches, customColorRef.current)
      }
    }
    mq.addEventListener('change', onSystemChange)
    return () => mq.removeEventListener('change', onSystemChange)
  }, [])

  const setTheme = (id: string) => {
    const t = getThemeById(id) ?? getDefaultTheme()
    let c = customColorRef.current
    
    if (id !== 'm3e') {
      c = null
      setCustomColorState(null)
      customColorRef.current = null
      localStorage.removeItem('cleargrade-use-custom-color')
    }
    
    setThemeState(t)
    themeRef.current = t
    localStorage.setItem('cleargrade-theme', id)
    applyTokens(t, resolveIsDark(darkModeRef.current), c)
  }

  const setDarkMode = (mode: DarkMode) => {
    setDarkModeState(mode)
    darkModeRef.current = mode
    localStorage.setItem('cleargrade-dark-mode', mode)
    applyTokens(themeRef.current, resolveIsDark(mode), customColorRef.current)
  }

  const setCustomColor = (color: string | null) => {
    if (themeRef.current.id !== 'm3e') return
    setCustomColorState(color)
    customColorRef.current = color
    if (color) {
      localStorage.setItem('cleargrade-custom-color', color)
      localStorage.setItem('cleargrade-use-custom-color', 'true')
    } else {
      localStorage.removeItem('cleargrade-custom-color')
      localStorage.removeItem('cleargrade-use-custom-color')
    }
    applyTokens(themeRef.current, resolveIsDark(darkModeRef.current), color)
  }

  // IMPORTANTE: Evitar renderizar contenido sin variables aplicadas[cite: 1]
  return (
    <ThemeContext.Provider value={{ theme, themes, setTheme, darkMode, setDarkMode, customColor, setCustomColor }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
