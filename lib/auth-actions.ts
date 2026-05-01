'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) throw new Error('Not authenticated')

  // First verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'Contraseña actual incorrecta' }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true }
}

export async function changeEmail(newEmail: string, password: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) throw new Error('Not authenticated')

  // Verify password first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })

  if (signInError) {
    return { error: 'Contraseña incorrecta' }
  }

  // Update email
  const { error: updateError } = await supabase.auth.updateUser({
    email: newEmail
  })

  if (updateError) {
    return { error: updateError.message }
  }

  return { 
    success: true,
    message: 'Se envió un correo de confirmación a tu nuevo email'
  }
}

export async function deleteAccount(password: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) throw new Error('Not authenticated')

  // Verify password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })

  if (signInError) {
    return { error: 'Contraseña incorrecta' }
  }

  // Delete user from auth
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  // Sign out
  await supabase.auth.signOut()
  revalidatePath('/')

  return { success: true }
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { 
    success: true,
    message: 'Si la cuenta existe, recibirás un correo con instrucciones para recuperar tu contraseña'
  }
}

export async function resetPassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getActiveSessions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get all sessions (this requires a custom function or checking auth logs)
  // For now, we'll return the current session info
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return []

  return [{
    id: session.session?.id || 'current',
    provider: 'email',
    lastSignInAt: session.user?.last_sign_in_at || new Date().toISOString(),
    isCurrent: true
  }]
}
