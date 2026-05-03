'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Check, Palette, Lock, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { theme, setTheme, darkMode, setDarkMode, themes, customPrimaryColor, setCustomPrimaryColor } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'security'>('appearance')
  const [customColor, setCustomColor] = useState('')
  const [pendingChanges, setPendingChanges] = useState(false)

  // Check if custom colors are available (only for Material theme)
  const isMaterialTheme = theme.id === 'm3e'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('cleargrade-custom-color')
    if (saved) setCustomColor(saved)
  }, [])

  if (!mounted) return null

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId)
    setPendingChanges(false)
  }

  const handleDarkModeChange = (mode: 'light' | 'dark' | 'auto') => {
    setDarkMode(mode)
  }

  const handleColorChange = (color: string) => {
    setCustomColor(color)
    setPendingChanges(true)
  }

  const applyChanges = () => {
    // Custom colors only work for Material 3 Expressive
    if (!isMaterialTheme) {
      setPendingChanges(false)
      return
    }
    localStorage.setItem('cleargrade-custom-color', customColor || '#00D418')
    localStorage.setItem('cleargrade-use-custom-color', 'true')
    setCustomPrimaryColor(customColor || '#00D418')
    setPendingChanges(false)
  }

  return (
    <main className="min-h-screen bg-background">
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
            {/* Dark Mode Toggle */}
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
                          {mode === 'light' && 'Claro'}
                          {mode === 'dark' && 'Oscuro'}
                          {mode === 'auto' && 'Automático'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {mode === 'light' && 'Siempre modo claro'}
                          {mode === 'dark' && 'Siempre modo oscuro'}
                          {mode === 'auto' && 'Según la preferencia del sistema'}
                        </p>
                      </div>
                      {darkMode === mode && <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Themes */}
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Tema</h2>
                <p className="text-sm text-muted-foreground mb-4">Selecciona tu tema favorito (los colores se adaptan al modo claro/oscuro)</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    type="button"
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left hover:border-primary/50',
                      theme.id === t.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
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
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Custom Color - Only for Material 3 Expressive */}
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  Color Personalizado
                  {!isMaterialTheme && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-normal">
                      Solo Material
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {isMaterialTheme 
                    ? 'Elige un color para toda la app (estilo Monet/Android 12+)'
                    : 'Los colores personalizados solo están disponibles en el tema Material 3 Expressive'
                  }
                </p>
              </div>
              <div className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center gap-6",
                !isMaterialTheme && "opacity-50 pointer-events-none"
              )}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-border">
                  <input
                    type="color"
                    value={customColor || '#00D418'}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full h-full cursor-pointer"
                    disabled={!isMaterialTheme}
                  />
                </div>
                <div className="space-y-3 flex-1">
                  <Button
                    onClick={applyChanges}
                    disabled={!pendingChanges || !isMaterialTheme}
                    className="gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Aplicar Color
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {isMaterialTheme 
                      ? 'El color se aplicará a toda la interfaz'
                      : 'Cambia al tema Material para usar colores custom'
                    }
                  </p>
                </div>
              </div>

              {/* Quick Color Presets */}
              {isMaterialTheme && (
                <div className="space-y-3 mt-6 pt-6 border-t border-border">
                  <p className="text-sm font-medium text-foreground">Colores Rápidos</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {[
                      '#00D418', '#FF6B6B', '#4ECDC4', '#45B7D1',
                      '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE',
                      '#85C1E2', '#F8B88B', '#A8E6CF', '#FFD3B6'
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setCustomColor(color)
                          setCustomPrimaryColor(color)
                          setPendingChanges(false)
                        }}
                        type="button"
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all flex-shrink-0',
                          customColor === color ? 'border-primary scale-110' : 'border-border hover:border-primary'
                        )}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Seguridad</h2>
                <p className="text-sm text-muted-foreground mb-4">Gestiona tu seguridad y privacidad</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-secondary/30">
                <p className="text-muted-foreground">Las opciones de seguridad aparecerán pronto</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
