'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Check, Palette, Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function SettingsPage() {
  const { 
    theme, 
    setTheme, 
    darkMode, 
    setDarkMode, 
    themes = [], 
    customColor: activeCustomColor, 
    setCustomColor: applyCustomColor 
  } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'security'>('appearance')
  const [pickerColor, setPickerColor] = useState('#516435')

  const isMaterialTheme = theme?.id === 'm3e'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('cleargrade-custom-color')
    if (saved) setPickerColor(saved)
  }, [])

  if (!mounted) return null

  const handleThemeChange = (themeId: string) => {
    if (setTheme) setTheme(themeId)
  }

  const handleDarkModeChange = (mode: 'light' | 'dark' | 'auto') => {
    if (setDarkMode) setDarkMode(mode)
  }

  const handleColorChange = (color: string) => {
    setPickerColor(color)
    if (isMaterialTheme && applyCustomColor) {
      applyCustomColor(color)
    }
  }

  return (
    <main className="min-h-screen bg-background relative transition-colors duration-300">
      <div className="absolute top-4 right-4 z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
            <X className="w-6 h-6 text-muted-foreground" />
          </Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Personaliza el estilo de ClearGrade</p>
        </div>

        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('appearance')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'appearance' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            )}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Apariencia
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'security' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            )}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Seguridad
          </button>
        </div>

        {activeTab === 'appearance' && (
          <div className="space-y-10">
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
                    <div className="flex items-start justify-between text-foreground capitalize">
                      {mode}
                      {darkMode === mode && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Temas Predefinidos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-left',
                      theme?.id === t.id ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{t.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                      </div>
                      {theme?.id === t.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex gap-2">
                      {Object.values(t.preview || {}).slice(0, 3).map((color, i) => (
                        <div key={i} className="w-6 h-6 rounded-full shadow-sm" style={{ background: color as string }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className={cn("space-y-6 pt-6 border-t border-border", !isMaterialTheme && "opacity-40 grayscale pointer-events-none")}>
              <h2 className="text-xl font-semibold text-foreground">Personalización Material</h2>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative w-24 h-24 rounded-3xl border-4 border-border shadow-xl overflow-hidden" style={{ backgroundColor: pickerColor }}>
                  <input
                    type="color"
                    value={pickerColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Presets Rápidos</p>
                  <div className="flex flex-wrap gap-2">
                    {['#516435', '#7C4DFF', '#FF5252', '#40C4FF', '#FFD740'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorChange(c)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
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
      </div>
    </main>
  )
}