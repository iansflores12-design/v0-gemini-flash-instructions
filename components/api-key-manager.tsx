'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Key, Eye, EyeOff, Check, Loader2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ApiKeyManagerProps {
  currentHasKey: boolean
}

export function ApiKeyManager({ currentHasKey }: ApiKeyManagerProps) {
  const hasApiKey = currentHasKey
  const [isEditing, setIsEditing] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSave = async () => {
    if (!apiKey.trim()) return
    
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('No autenticado')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ gemini_api_key: apiKey })
      .eq('id', user.id)

    if (updateError) {
      setError('Error al guardar la clave')
    } else {
      setSuccess(true)
      setIsEditing(false)
      setApiKey('')
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center">
            <Key className="w-5 h-5 text-on-tertiary-container" />
          </div>
          <div>
            <p className="font-medium text-foreground">Clave API de Gemini</p>
            <p className="text-sm text-muted-foreground">
              {hasApiKey ? 'Configurada' : 'No configurada'}
            </p>
          </div>
        </div>
        {hasApiKey && !isEditing && (
          <div className="flex items-center gap-2">
            {success && (
              <span className="text-sm text-primary flex items-center gap-1">
                <Check className="w-4 h-4" /> Guardada
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-xl"
            >
              Cambiar
            </Button>
          </div>
        )}
      </div>

      {(isEditing || !hasApiKey) && (
        <div className="space-y-3 pt-2">
          {/* Instructions Toggle */}
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-sm text-primary flex items-center gap-1 hover:underline"
          >
            Como obtener tu clave API
            {showInstructions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showInstructions && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 animate-scale-in">
              <p className="text-sm text-foreground font-medium">Pasos para obtener tu clave:</p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  Ve a{' '}
                  <a 
                    href="https://aistudio.google.com/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Inicia sesion con tu cuenta de Google</li>
                <li>Haz clic en <span className="font-medium text-foreground">{'"Crear clave de API"'}</span></li>
                <li>Copia la clave generada y pegala abajo</li>
              </ol>
              <p className="text-xs text-muted-foreground bg-surface-container-highest p-2 rounded-lg">
                La clave es gratuita. Tu clave se guarda de forma segura y solo tu puedes usarla.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showApiKey ? 'text' : 'password'}
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={loading || !apiKey.trim()}
              className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Guardar clave'
              )}
            </Button>
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setApiKey('')
                  setError(null)
                }}
                className="h-11 rounded-xl"
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
