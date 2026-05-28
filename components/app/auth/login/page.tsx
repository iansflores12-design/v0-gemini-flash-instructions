'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClearGradeLogo } from '@/components/cleargrade-logo'
import { useLanguage } from '@/components/language-provider'

export default function LoginPage() {
  const { language } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <ClearGradeLogo size="md" />
          </div>
          <p className="text-muted-foreground mt-1">{language === 'en' ? 'Sign in to continue' : language === 'pt' ? 'Entre para continuar' : 'Inicia sesion para continuar'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm animate-scale-in">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {language === 'en' ? 'Email' : language === 'pt' ? 'Email' : 'Correo electronico'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={language === 'en' ? 'you@email.com' : language === 'pt' ? 'voce@email.com' : 'tu@correo.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {language === 'en' ? 'Password' : language === 'pt' ? 'Senha' : 'Contrasena'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={language === 'en' ? 'Your password' : language === 'pt' ? 'Sua senha' : 'Tu contrasena'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              language === 'en' ? 'Sign in' : language === 'pt' ? 'Entrar' : 'Iniciar sesion'
            )}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {language === 'en' ? 'Forgot your password?' : language === 'pt' ? 'Esqueceu sua senha?' : '¿Olvidaste tu contraseña?'}
          </Link>
        </div>

        <p className="text-center mt-6 text-muted-foreground">
          {language === 'en' ? "Don't have an account?" : language === 'pt' ? 'Nao tem conta?' : 'No tienes cuenta?'}{' '}
          <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
            {language === 'en' ? 'Sign up' : language === 'pt' ? 'Cadastre-se' : 'Registrate'}
          </Link>
        </p>
      </div>
    </main>
  )
}
