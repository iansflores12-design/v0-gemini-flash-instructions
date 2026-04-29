'use client'

import { useState, useEffect } from 'react'
import { Lock, Settings, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ActivatePage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  
  const [config, setConfig] = useState({
    subscriptionsEnabled: false,
    adsEnabled: false,
    chatLimitsEnabled: false,
    agendaLimitsEnabled: false,
    geminiApiKey: ''
  })
  
  const [saving, setSaving] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Simple hardcoded auth - in production use proper auth
    if (username === 'rootmanager' && password === 'rootmanager') {
      setIsAuthenticated(true)
      loadConfig()
    } else {
      setError('Credenciales incorrectas')
    }
  }

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/config')
      const data = await res.json()
      if (data.config) {
        setConfig(data.config)
      }
    } catch (err) {
      console.error('[v0] Error loading config:', err)
    }
  }

  const handleToggle = (key: keyof typeof config) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (res.ok) {
        alert('Configuración guardada')
      } else {
        alert('Error al guardar')
      }
    } catch (err) {
      console.error('[v0] Error saving config:', err)
      alert('Error')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border p-8">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2 text-center">ClearGrade Admin</h1>
            <p className="text-sm text-muted-foreground mb-6 text-center">Panel de control de administrador</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground"
                  placeholder="rootmanager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                Iniciar sesión
              </Button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl bg-card border border-border p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
          </div>

          <div className="space-y-6">
            {/* Subscriptions */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Suscripciones</h3>
                  <p className="text-sm text-muted-foreground">Activa/desactiva el sistema de suscripciones</p>
                </div>
                <button
                  onClick={() => handleToggle('subscriptionsEnabled')}
                  className={`w-12 h-7 rounded-full flex items-center transition-all ${
                    config.subscriptionsEnabled ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                    config.subscriptionsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Ads */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Anuncios</h3>
                  <p className="text-sm text-muted-foreground">Muestra anuncios a usuarios free</p>
                </div>
                <button
                  onClick={() => handleToggle('adsEnabled')}
                  className={`w-12 h-7 rounded-full flex items-center transition-all ${
                    config.adsEnabled ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                    config.adsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Chat Limits */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Límites de Chat</h3>
                  <p className="text-sm text-muted-foreground">Aplica límites de requests por suscripción</p>
                </div>
                <button
                  onClick={() => handleToggle('chatLimitsEnabled')}
                  className={`w-12 h-7 rounded-full flex items-center transition-all ${
                    config.chatLimitsEnabled ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                    config.chatLimitsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Agenda Limits */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Límites de Agendas</h3>
                  <p className="text-sm text-muted-foreground">Aplica límites de agendas por mes</p>
                </div>
                <button
                  onClick={() => handleToggle('agendaLimitsEnabled')}
                  className={`w-12 h-7 rounded-full flex items-center transition-all ${
                    config.agendaLimitsEnabled ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                    config.agendaLimitsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Gemini API Key */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <label className="block text-sm font-medium text-foreground mb-2">API Key Gemini</label>
              <input
                type="password"
                value={config.geminiApiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground text-sm"
                placeholder="AIzaSy..."
              />
              <p className="text-xs text-muted-foreground mt-2">Tu API key de Google Gemini</p>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-accent/10 border border-accent">
              <h4 className="font-medium text-foreground mb-3">Configuración Actual</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {config.subscriptionsEnabled ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                  <span>Suscripciones: {config.subscriptionsEnabled ? 'Activas' : 'Inactivas'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {config.adsEnabled ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                  <span>Anuncios: {config.adsEnabled ? 'Activos' : 'Inactivos'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {config.chatLimitsEnabled ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                  <span>Límites Chat: {config.chatLimitsEnabled ? 'Activos' : 'Inactivos'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {config.agendaLimitsEnabled ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                  <span>Límites Agendas: {config.agendaLimitsEnabled ? 'Activos' : 'Inactivos'}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
