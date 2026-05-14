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
  '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
  // Limpieza para que no queden superficies M3 del color custom anterior
  '--surface-container', '--surface-container-high', '--surface-container-highest',
  '--outline-variant',
]

function resolveIsDark(mode: DarkMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
}

/** Acento tipo paleta tonal M3: baja el croma del picker para evitar verdes/limas chillones. */
function cssTonalPrimary(pick: string, isDark: boolean): string {
  const probe = `oklch(from ${pick} l c h)`
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('color', probe)) {
    return isDark
      ? `oklch(from ${pick} clamp(0.56, calc(l + 0.12), 0.76) clamp(0.045, calc(c * 0.44), 0.11) h)`
      : `oklch(from ${pick} clamp(0.36, calc(l * 0.9), 0.5) clamp(0.05, calc(c * 0.38), 0.1) h)`
  }
  return isDark
    ? `color-mix(in srgb, ${pick} 58%, rgb(168, 175, 168))`
    : `color-mix(in srgb, ${pick} 48%, rgb(48, 52, 48))`
}

function applyTokens(theme: Theme, isDark: boolean, customColor: string | null) {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  const tokens = isDark ? theme.dark : theme.light

  // 1. Limpiar rastro de temas anteriores
  ALL_VARS.forEach(v => root.style.removeProperty(v))

  // 2. Aplicar tokens del tema seleccionado (m3e, One UI, etc.)
  Object.entries(tokens).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
  })

  // 3. Color personalizado Material 3: primario tonal (no el hex crudo del picker)
  if (customColor && theme.id === 'm3e') {
    const tonal = cssTonalPrimary(customColor, isDark)

    root.style.setProperty('--primary', tonal)
    root.style.setProperty('--ring', tonal)

    root.style.setProperty('--primary-foreground', isDark ? '#ffffff' : '#000000')

    root.style.setProperty(
      '--muted',
      isDark
        ? `color-mix(in oklch, ${tonal} 14%, oklch(0.16 0.02 none))`
        : `color-mix(in oklch, ${tonal} 12%, oklch(0.97 0.006 none))`
    )
    root.style.setProperty(
      '--secondary',
      isDark
        ? `color-mix(in oklch, ${tonal} 11%, oklch(0.14 0.02 none))`
        : `color-mix(in oklch, ${tonal} 9%, oklch(0.94 0.01 none))`
    )
    root.style.setProperty(
      '--accent',
      isDark
        ? `color-mix(in oklch, ${tonal} 20%, oklch(0.2 0.02 none))`
        : `color-mix(in oklch, ${tonal} 16%, oklch(0.96 0.01 none))`
    )
    root.style.setProperty(
      '--border',
      isDark
        ? `color-mix(in oklch, ${tonal} 26%, oklch(0.28 0.025 none))`
        : `color-mix(in oklch, ${tonal} 20%, oklch(0.88 0.015 none))`
    )

    // Fondos opacos + superficies M3: mezcla con tonal para tintes menos saturados
    if (isDark) {
      root.style.setProperty(
        '--background',
        `color-mix(in srgb, ${tonal} 9%, rgb(5, 7, 6))`
      )
      root.style.setProperty(
        '--card',
        `color-mix(in srgb, ${tonal} 17%, rgb(26, 30, 28))`
      )
      root.style.setProperty(
        '--popover',
        `color-mix(in srgb, ${tonal} 17%, rgb(26, 30, 28))`
      )
      root.style.setProperty(
        '--surface-container',
        `color-mix(in srgb, ${tonal} 19%, rgb(32, 36, 34))`
      )
      root.style.setProperty(
        '--surface-container-high',
        `color-mix(in srgb, ${tonal} 21%, rgb(38, 42, 40))`
      )
      root.style.setProperty(
        '--surface-container-highest',
        `color-mix(in srgb, ${tonal} 25%, rgb(44, 48, 46))`
      )
      root.style.setProperty(
        '--outline-variant',
        `color-mix(in srgb, ${tonal} 38%, rgb(66, 70, 68))`
      )
      root.style.setProperty(
        '--input',
        `color-mix(in srgb, ${tonal} 13%, rgb(18, 20, 19))`
      )
      root.style.setProperty('--foreground', 'oklch(0.96 0.006 none)')
      root.style.setProperty('--muted-foreground', 'oklch(0.72 0.012 none)')
      root.style.setProperty('--card-foreground', 'oklch(0.96 0.006 none)')
      root.style.setProperty('--popover-foreground', 'oklch(0.96 0.006 none)')
      root.style.setProperty('--secondary-foreground', 'oklch(0.92 0.008 none)')
      root.style.setProperty('--accent-foreground', 'oklch(0.96 0.006 none)')
    } else {
      root.style.setProperty(
        '--background',
        `color-mix(in srgb, ${tonal} 10%, rgb(252, 253, 250))`
      )
      root.style.setProperty('--card', '#ffffff')
      root.style.setProperty('--popover', '#ffffff')
      root.style.setProperty(
        '--surface-container',
        `color-mix(in srgb, ${tonal} 7%, rgb(255, 255, 255))`
      )
      root.style.setProperty(
        '--surface-container-high',
        `color-mix(in srgb, ${tonal} 9%, rgb(255, 255, 255))`
      )
      root.style.setProperty(
        '--surface-container-highest',
        `color-mix(in srgb, ${tonal} 11%, rgb(255, 255, 255))`
      )
      root.style.setProperty(
        '--outline-variant',
        `color-mix(in srgb, ${tonal} 18%, rgb(218, 220, 216))`
      )
      root.style.setProperty('--foreground', 'oklch(0.14 0.008 none)')
      root.style.setProperty('--muted-foreground', 'oklch(0.48 0.015 none)')
      root.style.setProperty('--card-foreground', 'oklch(0.14 0.008 none)')
      root.style.setProperty('--popover-foreground', 'oklch(0.14 0.008 none)')
      root.style.setProperty('--secondary-foreground', 'oklch(0.22 0.01 none)')
      root.style.setProperty('--accent-foreground', 'oklch(0.14 0.008 none)')
    }
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