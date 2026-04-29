'use client'

import { Settings, Palette, Check } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export default function SettingsPage() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <main className="min-h-screen pb-24">
      <header className="px-4 pt-6 pb-4 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ajustes</h1>
            <p className="text-sm text-muted-foreground">Personaliza ClearGrade</p>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Theme Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/12 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Tema</h2>
              <p className="text-sm text-muted-foreground">Elige tu estilo visual</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                  theme.id === t.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {/* Preview colors */}
                <div className="flex gap-1 mb-3">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: t.preview.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: t.preview.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: t.preview.accent }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border" 
                    style={{ backgroundColor: t.preview.background }}
                  />
                </div>

                <p className="font-medium text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {t.description}
                </p>

                {theme.id === t.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Info */}
        <section className="p-4 rounded-2xl bg-secondary/50">
          <p className="text-sm text-muted-foreground leading-relaxed">
            El tema M3E (Material 3 Expressive) soporta colores dinamicos Monet en Android 12+. 
            Los demas temas aplican un esquema de colores fijo en toda la aplicacion.
          </p>
        </section>
      </div>
    </main>
  )
}
