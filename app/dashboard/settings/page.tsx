'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Check, Palette, Lock, RotateCw, X } from 'lucide-react' // Añadido X
import { cn } from '@/lib/utils'
import Link from 'next/link' // Importado para el botón de cierre

export default function SettingsPage() {
  const { theme, setTheme, darkMode, setDarkMode, themes, customColor: activeCustomColor, setCustomColor: applyCustomColor } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'security'>('appearance')
  const [pickerColor, setPickerColor] = useState('#516435')
  const [pendingChanges, setPendingChanges] = useState(false) // Nuevo estado para feedback

  const isMaterialTheme = theme.id === 'm3e'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('cleargrade-custom-color')
    if (saved) setPickerColor(saved)
  }, [])

  if (!mounted) return null

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId)
  }

  const handleDarkModeChange = (mode: 'light' | 'dark' | 'auto') => {
    setDarkMode(mode)
  }

  const handleColorChange = (color: string) => {
    setPickerColor(color)
    setPendingChanges(true) // Habilita feedback visual
  }

  const applyChanges = () => {
    if (!isMaterialTheme) return
    applyCustomColor(pickerColor)
    setPendingChanges(false)
  }

  return (
    <main className="min-h-screen bg-background relative">
      {/* Botón de Cierre (X) */}
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

        {/* Content */}
        {activeTab === 'appearance' && (
          <div className="space-y-8">
            {/* Modo de Color */}
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Modo de Color</h2>
                <p className="text-sm text-muted-foreground mb-6">Elige cómo prefieres ver la app</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['light', 'dark', 'auto'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleDarkModeChange(mode)}
                    type="button"
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left',
                      darkMode === mode
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground capitalize">
                          {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Oscuro' : 'Automático'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {mode === 'light' && 'Siempre modo claro'}
                          {mode === 'dark' && 'Siempre modo oscuro'}
                          {mode === 'auto' && 'Según el sistema'}
                        </p>
                      </div>
                      {darkMode === mode && <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Temas */}
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Tema</h2>
                <p className="text-sm text-muted-foreground mb-4">Selecciona tu estilo visual preferido</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    type="button"
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left hover:border-primary/50',
                      theme.id === t.id ? 'border-primary bg-primary/10' : 'border-border'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{t.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                      </div>
                      {theme.id === t.id && <Check className="w-4 h-4 mt-0.5 flex-shrink-0 ml-2" />}
                    </div>
                    <div className="flex gap-2">
                      {Object.values(t.preview).slice(0, 3).map((color, i) => (
                        <div key={i} className="w-8 h-8 rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Color Personalizado - Solo para Material 3 */}
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  Color Personalizado
                  {!isMaterialTheme && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                      Solo Material
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {isMaterialTheme 
                    ? 'Define el color de acento para toda la app (estilo Material You)'
                    : 'Activa el tema "Material 3 Expressive" para usar esta función'
                  }
                </p>
              </div>
              <div className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center gap-6",
                !isMaterialTheme && "opacity-40 pointer-events-none"
              )}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-border shadow-inner">
                  <input
                    type="color"
                    value={pickerColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full h-full cursor-pointer scale-125"
                    disabled={!isMaterialTheme}
                  />
                </div>
                <div className="space-y-3 flex-1 w-full">
                  <Button
                    onClick={applyChanges}
                    disabled={!isMaterialTheme || !pendingChanges}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <RotateCw className={cn("w-4 h-4", pendingChanges && "animate-spin-once")} />
                    Aplicar Color
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Este cambio afecta a botones, acentos y superficies.
                  </p>
                </div>
              </div>

              {/* Quick Color Presets */}
              {isMaterialTheme && (
                <div className="space-y-3 mt-6 pt-6 border-t border-border">
                  <p className="text-sm font-medium text-foreground">Ajustes rápidos</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      '#516435', '#99be64', '#00D418', '#171d10',
                      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
                      '#F7DC6F', '#BB8FCE'
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setPickerColor(color)
                          applyCustomColor(color)
                          setPendingChanges(false)
                        }}
                        type="button"
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-95',
                          activeCustomColor === color ? 'border-primary' : 'border-transparent'
                        )}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}