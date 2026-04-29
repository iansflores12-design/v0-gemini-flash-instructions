import { createClient } from '@/lib/supabase/server'
import { User, BookOpen, Settings, Key } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'
import { ApiKeyManager } from '@/components/api-key-manager'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get profile with API key
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const fullName = user?.user_metadata?.full_name || profile?.full_name || 'Usuario'
  const email = user?.email || ''
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const hasApiKey = !!profile?.gemini_api_key

  return (
    <main className="min-h-screen pb-24">
      <header className="px-4 pt-6 pb-4 bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
            <p className="text-sm text-muted-foreground">Tu cuenta</p>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-6">
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

        {/* API Key Section */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Gemini API Key</p>
              <p className="text-sm text-muted-foreground">
                {hasApiKey ? 'Configurada' : 'No configurada'}
              </p>
            </div>
          </div>
          <ApiKeyManager currentHasKey={hasApiKey} />
        </div>

        {/* Settings Link */}
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Ajustes</p>
            <p className="text-sm text-muted-foreground">Temas y personalizacion</p>
          </div>
        </Link>

        {/* App Info */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">ClearGrade</p>
              <p className="text-sm text-muted-foreground">Version 1.0</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tu asistente de estudio inteligente. Organiza tus tareas y materiales con ayuda de IA.
          </p>
        </div>

        {/* Logout */}
        <LogoutButton />
      </div>
    </main>
  )
}
