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
    themes, 
    setTheme, 
    setDarkMode, 
    darkMode, 
    customColor: activeCustomColor, 
    setCustomColor: applyCustomColor 
  } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [pickerColor, setPickerColor] = useState('#516435')

  const isMaterialTheme = theme.id === 'm3e'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('cleargrade-custom-color')
    if (saved) setPickerColor(saved)
  }, [])

  if (!mounted) return null

  // ESTA ES LA CLAVE: Aplicar el color en cuanto se mueve el selector
  const handleColorChange = (color: string) => {
    setPickerColor(color)
    if (isMaterialTheme) {
      applyCustomColor(color) // Esto envía el color al ThemeProvider al instante
    }
  }

  return (
    <main className="min-h-screen bg-background relative">
      {/* Botón X para cerrar */}
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
          <p className="text-muted-foreground">Personaliza el estilo visual de ClearGrade</p>
        </div>

        {/* Sección de Color Personalizado */}
        <section className={cn(
          "space-y-6 p-6 rounded-3xl border-2 border-border transition-all",
          !isMaterialTheme && "opacity-40 pointer-events-none"
        )}>
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Color Personalizado
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isMaterialTheme 
                ? "Elige un color y observa cómo cambia toda la interfaz." 
                : "Cambia al tema 'Material 3' para personalizar colores."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* El Círculo Selector */}
            <div className="relative group">
              <div 
                className="w-28 h-28 rounded-full border-4 border-border shadow-xl overflow-hidden transition-transform group-hover:scale-105"
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
            <div className="flex-1 space-y-4">
              <p className="text-sm font-medium">Presets de Tree OS</p>
              <div className="flex flex-wrap gap-3">
                {[
                  '#516435', '#99be64', '#7C4DFF', '#FF5252', 
                  '#00E676', '#40C4FF', '#FFD740', '#E040FB'
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(c)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-90",
                      pickerColor === c ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}