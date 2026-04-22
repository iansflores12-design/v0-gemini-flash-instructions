'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Mail, Lock, User, Eye, EyeOff, Loader2, Key, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          gemini_api_key: geminiApiKey,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Store API key in profiles table after successful signup
    if (data.user && geminiApiKey) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gemini_api_key: geminiApiKey })
        .eq('id', data.user.id)

      if (updateError) {
        console.log('Error saving API key to profile:', updateError.message)
      }
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Crear cuenta</h1>
          <p className="text-muted-foreground mt-1">Unete a StudyFlow</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm animate-scale-in">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electronico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Contrasena
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Gemini API Key Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="geminiApiKey" className="text-sm font-medium text-foreground">
                Clave API de Gemini
              </label>
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Como obtenerla
                {showInstructions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Instructions Panel */}
            {showInstructions && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 animate-scale-in">
                <p className="text-sm text-foreground font-medium">Pasos para obtener tu clave API:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Ve a <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Inicia sesion con tu cuenta de Google</li>
                  <li>Haz clic en <span className="font-medium text-foreground">{'"Crear clave de API"'}</span></li>
                  <li>Copia la clave generada y pegala aqui</li>
                </ol>
                <p className="text-xs text-muted-foreground bg-surface-container-highest p-2 rounded-lg">
                  La clave es gratuita y te permite procesar tus agendas con IA. Tu clave se guarda de forma segura y solo tu puedes usarla.
                </p>
              </div>
            )}

            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="geminiApiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary font-mono text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Necesaria para el procesamiento de agendas con IA
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Crear cuenta'
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>
    </main>
  )
}
