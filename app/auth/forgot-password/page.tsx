'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClearGradeLogo } from '@/components/cleargrade-logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <ClearGradeLogo size="md" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">¡Revisa tu email!</h1>
            <p className="text-muted-foreground mt-2 text-center">
              Si existe una cuenta con {email}, recibirás un correo con instrucciones para recuperar tu contraseña
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              El correo puede tardar unos minutos en llegar. No olvides revisar tu carpeta de spam.
            </p>

            <Link href="/auth/login" className="block">
              <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90">
                Volver a Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <ClearGradeLogo size="md" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Recuperar Contraseña</h1>
          <p className="text-muted-foreground mt-1">Ingresa tu email para recibir instrucciones</p>
        </div>

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm animate-scale-in flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Enviar instrucciones'
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          ¿Recordaste tu contraseña?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
