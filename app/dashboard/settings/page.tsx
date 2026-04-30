'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { themes } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import { Check, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { theme, setTheme, darkMode, setDarkMode } = useTheme()
  const [customColor, setCustomColor] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('cleargrade-custom-color')
    if (saved) setCustomColor(saved)
  }, [])

  const handleColorChange = (color: string) => {
    setCustomColor(color)
    localStorage.setItem('cleargrade-custom-color', color)
    localStorage.setItem('cleargrade-use-custom-color', 'true')
    
    // Reload para aplicar el color
    setTimeout(() => window.location.reload(), 200)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ajustes</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia de ClearGrade</p>
        </div>

        {/* Dark Mode */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Modo Oscuro</h2>
            <p className="text-sm text-muted-foreground mb-4">Elige cómo deseas que se vea la interfaz</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'auto', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setDarkMode(mode)
                  localStorage.setItem('cleargrade-dark-mode', mode)
                }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  darkMode === mode
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  {darkMode === mode && <Check className="w-4 h-4" />}
                  <span className="capitalize font-medium">{
                    mode === 'light' ? 'Claro' :
                    mode === 'dark' ? 'Oscuro' :
                    'Auto'
                  }</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Themes */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Tema</h2>
            <p className="text-sm text-muted-foreground mb-4">Selecciona tu tema favorito</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id)
                  localStorage.removeItem('cleargrade-use-custom-color')
                }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  theme.id === t.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                  {theme.id === t.id && <Check className="w-4 h-4 mt-0.5" />}
                </div>
                <div className="flex gap-2">
                  {Object.values(t.preview).slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Custom Color */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Color Personalizado</h2>
            <p className="text-sm text-muted-foreground mb-4">Elige un color para toda la app</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={customColor || '#6750A4'}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-20 h-20 rounded-lg cursor-pointer border-2 border-border"
            />
            <div className="space-y-2">
              <Button
                onClick={() => handleColorChange(customColor || '#6750A4')}
                className="gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Aplicar Color
              </Button>
              <p className="text-xs text-muted-foreground">
                El color se aplicará a toda la interfaz
              </p>
            </div>
          </div>
        </section>

        {/* Presets */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Colores Rápidos</h2>
            <p className="text-sm text-muted-foreground mb-4">Colores populares para empezar</p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {[
              '#6750A4', // Purple
              '#1687F0', // Blue
              '#14A562', // Green (better for iPhone)
              '#F57C00', // Orange
              '#C2185B', // Pink
              '#6A1B9A', // Deep Purple
              '#0097A7', // Cyan
              '#D32F2F', // Red
              '#689F38', // Light Green
              '#005A9C', // Dark Blue
              '#FF6F00', // Deep Orange
              '#7B1FA2', // Dark Purple
            ].map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-full aspect-square rounded-lg border-2 border-border hover:border-primary transition-all"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
