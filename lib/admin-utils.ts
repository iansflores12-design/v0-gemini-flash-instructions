import { createClient } from '@/lib/supabase/server'

export async function isUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    // Verificar si el usuario está en la tabla admin_users
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      console.log('[v0] User is not admin:', user.email)
      return false
    }

    return true
  } catch (error) {
    console.error('[v0] Error checking admin status:', error)
    return false
  }
}

export async function getCurrentAdminEmail(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email || null
  } catch (error) {
    console.error('[v0] Error getting admin email:', error)
    return null
  }
}
