'use client'

import { useState, useEffect } from 'react'
import { User, BookOpen, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/language-provider'

export default function ProfilePage() {
  const { language } = useLanguage()
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
      
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const fullName = user?.user_metadata?.full_name || profile?.full_name || (language === 'en' ? 'User' : language === 'pt' ? 'Usuario' : 'Usuario')
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
            <h1 className="text-2xl font-bold text-foreground">{language === 'en' ? 'Profile' : language === 'pt' ? 'Perfil' : 'Perfil'}</h1>
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Your account and settings' : language === 'pt' ? 'Sua conta e configuracoes' : 'Tu cuenta y ajustes'}</p>
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

        {/* App Info */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">ClearGrade</p>
              <p className="text-sm text-muted-foreground">Beta 231 8526</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {language === 'en' ? 'Log out' : language === 'pt' ? 'Sair' : 'Cerrar sesion'}
        </button>
      </div>
    </main>
  )
}
