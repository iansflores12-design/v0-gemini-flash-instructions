'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/components/theme-provider'
import { themes } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import { Check, RotateCw, X, Palette, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SettingsPanel } from '@/components/settings-panel'

export default function SettingsPage() {
  const { theme, setTheme, darkMode, setDarkMode, setCustomPrimaryColor } = useTheme()
  const [customColor, setCustomColor] = useState('')
  const [pendingChanges, setPendingChanges] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'security'>('appearance')
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Check if custom colors are available (only for Material theme)
  const isMaterialTheme = theme.id === 'm3e'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('cleargrade-custom-color')
    if (saved) setCustomColor(saved)
  }, [])

  const handleClose = () => {
    router.back()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
    setCurrentY(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't track if we're interacting with interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button, input, [role="button"]')) {
      setCurrentY(0)
      return
    }
    const diff = e.touches[0].clientY - startY
    if (diff > 0) {
      setCurrentY(diff)
    }
  }

  const handleTouchEnd = () => {
    if (currentY > 100) {
      handleClose()
    }
    setCurrentY(0)
  }

  const handleDarkModeChange = (mode: 'light' | 'dark' | 'auto') => {
    setDarkMode(mode)
    localStorage.setItem('cleargrade-dark-mode', mode)
  }

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId)
    localStorage.removeItem('cleargrade-use-custom-color')
    setPendingChanges(true)
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
    // Apply without reload - use the context directly
    setCustomPrimaryColor(customColor || '#00D418')
    setPendingChanges(false)
  }

  if (!mounted) return null

  return (
    <div 
      className="min-h-screen bg-background md:fixed md:inset-0 md:bg-black/50 md:z-50 md:flex md:items-end"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        ref={contentRef}
        className="w-full md:w-96 md:rounded-t-3xl md:shadow-xl bg-background"
        style={{
          transform: `translateY(${currentY}px)`,
          transition: currentY === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {/* Mobile Slider Indicator */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-border" />
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">Ajustes</h1>
              <p className="text-muted-foreground">Personaliza tu experiencia</p>
            </div>
            {/* Close Button - Only on Desktop */}
            <button
              onClick={handleClose}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors"
              title="Cerrar ajustes"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-outline">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`pb-3 px-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'appearance'
                  ? 'text-primary border-b-2 border-primary -mb-0.5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Palette className="w-4 h-4" />
              Apariencia
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 px-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'text-primary border-b-2 border-primary -mb-0.5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Lock className="w-4 h-4" />
              Seguridad
            </button>
          </div>

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-8 pb-8 md:pb-0">
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
                      onClick={() => handleDarkModeChange(mode)}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      type="button"
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
                        {theme.id === t.id && <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      </div>
                      <div className="flex gap-2">
                        {Object.values(t.preview).slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded flex-shrink-0"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
                {pendingChanges && (
                  <Button
                    onClick={applyChanges}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <RotateCw className="w-4 h-4" />
                    Aplicar Cambios
                  </Button>
                )}
              </section>

              {/* Custom Color - Only for Material 3 Expressive */}
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
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
                      : 'Los colores personalizados solo estan disponibles en el tema Material 3 Expressive'
                    }
                  </p>
                </div>
                <div className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center gap-4",
                  !isMaterialTheme && "opacity-50 pointer-events-none"
                )}>
                  <input
                    type="color"
                    value={customColor || '#00D418'}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg cursor-pointer border-2 border-border"
                    disabled={!isMaterialTheme}
                  />
                  <div className="space-y-2 flex-1">
                    <Button
                      onClick={applyChanges}
                      disabled={!pendingChanges || !isMaterialTheme}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <RotateCw className="w-4 h-4" />
                      Aplicar Color
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {isMaterialTheme 
                        ? 'El color se aplicara a toda la interfaz'
                        : 'Cambia al tema Material para usar colores custom'
                      }
                    </p>
                  </div>
                </div>
              </section>

              {/* Presets - Only for Material 3 Expressive */}
              {isMaterialTheme && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Colores Rapidos</h2>
                  <p className="text-sm text-muted-foreground mb-4">Colores populares para empezar</p>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {[
                    '#00D418', // Green (Default Monet)
                    '#1687F0', // Blue
                    '#14A562', // Green
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
                      onClick={() => {
                        setCustomColor(color)
                        setPendingChanges(true)
                      }}
                      className={cn(
                        'w-full aspect-square rounded-lg border-2 transition-all',
                        customColor === color ? 'border-foreground border-4' : 'border-border hover:border-primary'
                      )}
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
              </section>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="pb-8 md:pb-0">
              <SettingsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

