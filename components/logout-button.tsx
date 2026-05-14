'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="outline"
      className="w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar sesion
        </>
      )}
    </Button>
  )
}
