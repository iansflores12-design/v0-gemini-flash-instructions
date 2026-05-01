'use client'

import { useState } from 'react'
import { Lock, Mail, AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { changePassword, changeEmail, deleteAccount } from '@/lib/auth-actions'
import { useRouter } from 'next/navigation'

export function SettingsPanel() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'password' | 'email' | 'account'>('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    const result = await changePassword(currentPassword, newPassword)

    if ('error' in result) {
      setError(result.error)
    } else {
      setSuccess('Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!newEmail.includes('@')) {
      setError('Email inválido')
      return
    }

    setLoading(true)
    const result = await changeEmail(newEmail, emailPassword)

    if ('error' in result) {
      setError(result.error)
    } else {
      setSuccess(result.message || 'Email en proceso de cambio')
      setNewEmail('')
      setEmailPassword('')
    }
    setLoading(false)
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (deleteConfirm !== 'BORRAR') {
      setError('Debes escribir "BORRAR" para confirmar')
      return
    }

    setLoading(true)
    const result = await deleteAccount(deletePassword)

    if ('error' in result) {
      setError(result.error)
    } else {
      setSuccess('Cuenta eliminada. Redirigiendo...')
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline">
        <button
          onClick={() => { setActiveTab('password'); setError(null); setSuccess(null) }}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'password'
              ? 'text-primary border-b-2 border-primary -mb-0.5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Contraseña
        </button>
        <button
          onClick={() => { setActiveTab('email'); setError(null); setSuccess(null) }}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'email'
              ? 'text-primary border-b-2 border-primary -mb-0.5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Email
        </button>
        <button
          onClick={() => { setActiveTab('account'); setError(null); setSuccess(null) }}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'account'
              ? 'text-primary border-b-2 border-primary -mb-0.5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Peligro
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive flex gap-2 animate-scale-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 text-green-600 flex gap-2 animate-scale-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Content */}
      <div>
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="current-pw" className="text-sm font-medium text-foreground block mb-2">
                Contraseña actual
              </label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10 h-10 rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new-pw" className="text-sm font-medium text-foreground block mb-2">
                Nueva contraseña
              </label>
              <Input
                id="new-pw"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-lg"
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-pw" className="text-sm font-medium text-foreground block mb-2">
                Confirmar nueva contraseña
              </label>
              <Input
                id="confirm-pw"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar contraseña'}
            </Button>
          </form>
        )}

        {activeTab === 'email' && (
          <form onSubmit={handleChangeEmail} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="new-email" className="text-sm font-medium text-foreground block mb-2">
                Nuevo correo
              </label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-10 rounded-lg"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se enviará un correo de confirmación a ambas direcciones
              </p>
            </div>

            <div>
              <label htmlFor="email-pw" className="text-sm font-medium text-foreground block mb-2">
                Tu contraseña
              </label>
              <Input
                id="email-pw"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="h-10 rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cambiar correo'}
            </Button>
          </form>
        )}

        {activeTab === 'account' && (
          <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Zona de peligro</p>
                <p className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-delete" className="text-sm font-medium text-foreground block mb-2">
                Escribe <span className="font-mono font-bold text-destructive">BORRAR</span> para confirmar
              </label>
              <Input
                id="confirm-delete"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="BORRAR"
                className="h-10 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="delete-pw" className="text-sm font-medium text-foreground block mb-2">
                Tu contraseña
              </label>
              <Input
                id="delete-pw"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || deleteConfirm !== 'BORRAR'}
              className="w-full h-10 rounded-lg bg-destructive hover:bg-destructive/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar cuenta permanentemente'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
