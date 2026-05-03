'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Download, Loader2, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Subscriber {
  id: string
  email: string
  full_name: string
  created_at: string
  subscribed: boolean
}

export default function MarketingPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('marketing_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading subscribers:', error)
    } else {
      setSubscribers(data || [])
    }
    setLoading(false)
  }

  const exportCSV = () => {
    const csv = [
      ['Nombre', 'Email', 'Fecha de Registro', 'Suscrito'],
      ...subscribers.map((s) => [
        s.full_name,
        s.email,
        new Date(s.created_at).toLocaleDateString('es-ES'),
        s.subscribed ? 'Sí' : 'No',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const copyToClipboard = (email: string, id: string) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              Campañas de Marketing
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los suscriptores para tus campañas publicitarias
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl">
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Suscriptores</p>
            <p className="text-3xl font-bold text-foreground">{subscribers.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Activos</p>
            <p className="text-3xl font-bold text-primary">
              {subscribers.filter((s) => s.subscribed).length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Desactivados</p>
            <p className="text-3xl font-bold text-destructive">
              {subscribers.filter((s) => !s.subscribed).length}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-6">
          <Button onClick={exportCSV} className="gap-2 rounded-xl" disabled={subscribers.length === 0}>
            <Download className="w-4 h-4" />
            Exportar a CSV
          </Button>
        </div>

        {/* Subscribers Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Mail className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-foreground font-medium">Sin suscriptores aún</p>
              <p className="text-muted-foreground text-sm mt-1">
                Los usuarios que se registren con opt-in aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {subscriber.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(subscriber.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {subscriber.subscribed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary font-medium text-xs">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium text-xs">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => copyToClipboard(subscriber.email, subscriber.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          title="Copiar email"
                        >
                          {copiedId === subscriber.id ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
