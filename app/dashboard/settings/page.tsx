'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Check, Palette, Lock, RotateCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function SettingsPage() {
  const { 
    theme, 
    setTheme, 
    darkMode, 
    setDarkMode, 
    themes, 
    customColor: activeCustomColor, 
    setCustomColor: applyCustomColor 
  } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'security'>('appearance')
  const [pickerColor, setPickerColor] = useState('#516435')

  const isMaterialTheme = theme.id === 'm3e'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('cleargrade-custom-color')
    if (saved) setPickerColor(saved)
  }, [])

  if (!mounted) return null[cite: 11]

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId)
  }

  const handleDarkModeChange = (mode: 'light' | 'dark' | 'auto') => {
    setDarkMode(mode)
  }

  // Cambio instantáneo: Aplicamos el color al motor de temas en cuanto se elige
  const handleColorChange = (color: string) => {
    setPickerColor(color)
    if (isMaterialTheme) {
      applyCustomColor(color)[cite: 11]
    }
  }

  return (
    <main className="min-h-screen bg-background relative transition-colors duration-300">
      {/* Botón de Cierre (X) - Redirige al Dashboard */}
      <div className="absolute top-4 right-4 z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
            <X className="w-6 h-6 text-muted-foreground" />
          </Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia en ClearGrade</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('appearance')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'appearance'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Apariencia
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'security'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Seguridad
          </button>
        </div>

        {/* Appearance Content */}
        {activeTab === 'appearance' && (
          <div className="space-y-10">
            
            {/* Modo de Color (Claro/Oscuro/Auto) */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Modo de Color</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['light', 'dark', 'auto'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleDarkModeChange(mode)}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left',
                      darkMode === mode ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground capitalize">
                          {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Oscuro' : 'Automático'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {mode === 'light' && 'Estilo brillante'}
                          {mode === 'dark' && 'Ahorro de batería'}
                          {mode === 'auto' && 'Según el sistema'}
                        </p>
                      </div>
                      {darkMode === mode && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Selector de Temas (Todos tus temas favoritos) */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Temas Predefinidos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left hover:border-primary/50',
                      theme.id === t.id ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{t.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{t.description}</p>
                      </div>
                      {theme.id === t.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex gap-2">
                      {Object.values(t.preview).slice(0, 3).map((color, i) => (
                        <div key={i} className="w-6 h-6 rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Color Dinámico (Solo para Material 3) */}
            <section className={cn("space-y-6 pt-6 border-t border-border", !isMaterialTheme && "opacity-40 grayscale pointer-events-none")}>
              <div>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  Personalización Material You
                  {!isMaterialTheme && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                      Inactivo
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ajusta el color de acento y mira cómo Tree OS se adapta al instante.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Input de color mejorado */}
                <div className="relative group">
                  <div 
                    className="w-24 h-24 rounded-3xl border-4 border-border shadow-2xl overflow-hidden transition-transform group-hover:scale-105 active:scale-95"
                    style={{ backgroundColor: pickerColor }}
                  >
                    <input
                      type="color"
                      value={pickerColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                {/* Ajustes Rápidos */}
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Presets Tree OS</p>
                  <div className="flex flex-wrap gap-2">
                    {['#516435', '#99be64', '#7C4DFF', '#FF5252', '#00E676', '#40C4FF', '#FFD740'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorChange(c)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-90",
                          activeCustomColor === c ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Security Tab (Placeholder) */}
        {activeTab === 'security' && (
          <div className="p-8 rounded-3xl border-2 border-dashed border-border text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium text-foreground">Seguridad y Privacidad</h2>
            <p className="text-sm text-muted-foreground">Próximamente: Autenticación de dos pasos y gestión de sesiones.</p>
          </div>
        )}
      </div>
    </main>
  )
}