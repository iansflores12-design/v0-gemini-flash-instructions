'use client'

import { useState, useEffect } from 'react'
import { User, BookOpen, Palette, Check, ChevronDown, ChevronRight, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { themes, getThemeById, getDefaultTheme, type Theme } from '@/lib/themes'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showThemes, setShowThemes] = useState(false)
  const [customColor, setCustomColor] = useState('#6750A4')
  const [useCustomColor, setUseCustomColor] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<Theme>(getDefaultTheme())
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      
      // Load theme from localStorage
      const savedThemeId = localStorage.getItem('cleargrade-theme')
      if (savedThemeId) {
        const savedTheme = getThemeById(savedThemeId)
        if (savedTheme) setCurrentTheme(savedTheme)
      }
      
      // Load custom color from localStorage
      const savedCustomColor = localStorage.getItem('cleargrade-custom-color')
      const savedUseCustom = localStorage.getItem('cleargrade-use-custom-color')
      if (savedCustomColor) setCustomColor(savedCustomColor)
      if (savedUseCustom === 'true') setUseCustomColor(true)
      
      setLoading(false)
    }
    fetchData()
  }, [])

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    const cssLines = theme.css.split('\n').filter(line => line.trim().startsWith('--'))
    cssLines.forEach(line => {
      const [prop, value] = line.split(':').map(s => s.trim().replace(';', ''))
      if (prop && value) {
        root.style.setProperty(prop, value)
      }
    })
    root.setAttribute('data-theme', theme.id)
  }

  const setTheme = (themeId: string) => {
    const newTheme = getThemeById(themeId)
    if (newTheme) {
      setCurrentTheme(newTheme)
      applyTheme(newTheme)
      localStorage.setItem('cleargrade-theme', themeId)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    localStorage.setItem('cleargrade-custom-color', color)
    localStorage.setItem('cleargrade-use-custom-color', 'true')
    setUseCustomColor(true)
    applyCustomColor(color)
  }

  const hexToHue = (hex: string): number => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    
    let h = 0
    if (max !== min) {
      if (max === r) h = ((g - b) / (max - min)) * 60
      else if (max === g) h = (2 + (b - r) / (max - min)) * 60
      else h = (4 + (r - g) / (max - min)) * 60
      if (h < 0) h += 360
    }
    return h
  }

  const applyCustomColor = (color: string) => {
    const root = document.documentElement
    const hue = hexToHue(color)
    
    // Generate full color palette based on custom hue (Material 3 Monet style)
    root.style.setProperty('--background', `oklch(0.98 0.005 ${hue})`)
    root.style.setProperty('--foreground', `oklch(0.15 0.02 ${hue})`)
    root.style.setProperty('--card', `oklch(1 0 0)`)
    root.style.setProperty('--card-foreground', `oklch(0.15 0.02 ${hue})`)
    root.style.setProperty('--popover', `oklch(1 0 0)`)
    root.style.setProperty('--popover-foreground', `oklch(0.15 0.02 ${hue})`)
    root.style.setProperty('--primary', `oklch(0.45 0.18 ${hue})`)
    root.style.setProperty('--primary-foreground', `oklch(0.98 0.005 ${hue})`)
    root.style.setProperty('--secondary', `oklch(0.92 0.03 ${hue})`)
    root.style.setProperty('--secondary-foreground', `oklch(0.25 0.08 ${hue})`)
    root.style.setProperty('--muted', `oklch(0.95 0.01 ${hue})`)
    root.style.setProperty('--muted-foreground', `oklch(0.45 0.02 ${hue})`)
    root.style.setProperty('--accent', `oklch(0.90 0.04 ${hue})`)
    root.style.setProperty('--accent-foreground', `oklch(0.20 0.06 ${hue})`)
    root.style.setProperty('--border', `oklch(0.90 0.02 ${hue})`)
    root.style.setProperty('--input', `oklch(0.95 0.01 ${hue})`)
    root.style.setProperty('--ring', `oklch(0.45 0.18 ${hue})`)
    root.style.setProperty('--surface-container', `oklch(0.96 0.008 ${hue})`)
    root.style.setProperty('--surface-container-high', `oklch(0.94 0.01 ${hue})`)
    root.style.setProperty('--on-surface-variant', `oklch(0.45 0.02 ${hue})`)
    root.style.setProperty('--outline', `oklch(0.78 0.015 ${hue})`)
    root.style.setProperty('--outline-variant', `oklch(0.88 0.01 ${hue})`)
    root.style.setProperty('--sidebar', `oklch(0.98 0.005 ${hue})`)
    root.style.setProperty('--sidebar-foreground', `oklch(0.15 0.02 ${hue})`)
    root.style.setProperty('--sidebar-primary', `oklch(0.45 0.18 ${hue})`)
    root.style.setProperty('--sidebar-primary-foreground', `oklch(0.98 0.005 ${hue})`)
    root.style.setProperty('--sidebar-accent', `oklch(0.92 0.03 ${hue})`)
    root.style.setProperty('--sidebar-accent-foreground', `oklch(0.25 0.08 ${hue})`)
    root.style.setProperty('--sidebar-border', `oklch(0.90 0.02 ${hue})`)
    root.style.setProperty('--sidebar-ring', `oklch(0.45 0.18 ${hue})`)
  }

  const toggleUseCustomColor = () => {
    const newValue = !useCustomColor
    setUseCustomColor(newValue)
    localStorage.setItem('cleargrade-use-custom-color', String(newValue))
    if (newValue) {
      applyCustomColor(customColor)
    } else {
      applyTheme(currentTheme)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const fullName = user?.user_metadata?.full_name || profile?.full_name || 'Usuario'
  const email = user?.email || ''
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="min-h-screen pb-24">
      <header className="px-4 pt-6 pb-4 bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
            <p className="text-sm text-muted-foreground">Tu cuenta y ajustes</p>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-card border border-border text-center">
          <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">
              {initials}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
          <p className="text-muted-foreground mt-1">{email}</p>
        </div>

        {/* Theme Section */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <button
            onClick={() => setShowThemes(!showThemes)}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Tema</p>
                <p className="text-sm text-muted-foreground">{currentTheme.name}</p>
              </div>
            </div>
            {showThemes ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showThemes && (
            <div className="p-4 pt-0 space-y-4">
              {/* Custom Color Toggle */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground text-sm">Color personalizado</p>
                    <p className="text-xs text-muted-foreground">
                      Si tu telefono no tiene Monet, usa tu propio color
                    </p>
                  </div>
                  <button
                    onClick={toggleUseCustomColor}
                    className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${
                      useCustomColor ? 'bg-primary justify-end' : 'bg-border justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                {useCustomColor && (
                  <div className="flex items-center gap-3 mt-3">
                    <label className="relative w-14 h-12 rounded-xl overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-colors">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => handleCustomColorChange(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ backgroundColor: customColor }}
                      />
                    </label>
                    <div 
                      className="flex-1 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
                      style={{ backgroundColor: customColor }}
                    >
                      {customColor.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                      currentTheme.id === t.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: t.preview.primary }}
                      />
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: t.preview.secondary }}
                      />
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: t.preview.accent }}
                      />
                    </div>
                    <p className="font-medium text-foreground text-xs">{t.name}</p>
                    {currentTheme.id === t.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">ClearGrade</p>
              <p className="text-sm text-muted-foreground">Version 1.0</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesion
        </button>
      </div>
    </main>
  )
}
