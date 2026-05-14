'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Copy, Send, X } from 'lucide-react'
import { errorLogger, type ErrorLog } from '@/lib/error-logger'
import { reportError } from '@/lib/error-report-action'
import { useState } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: ErrorLog | null
  showReportForm: boolean
  reportLoading: boolean
  reportEmail: string
  reportDescription: string
  reportSent: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      showReportForm: false,
      reportLoading: false,
      reportEmail: '',
      reportDescription: '',
      reportSent: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorLog = errorLogger.captureError(error, {
      componentStack: errorInfo.componentStack,
      type: 'boundary',
    })

    this.setState({
      error: errorLog,
    })
  }

  handleReportError = async () => {
    const { reportEmail, reportDescription, error } = this.state

    if (!reportEmail || !reportDescription) {
      alert('Por favor completa todos los campos')
      return
    }

    this.setState({ reportLoading: true })

    try {
      const result = await reportError({
        errorMessage: error?.message || 'Error desconocido',
        errorStack: error?.stack,
        userEmail: reportEmail,
        description: reportDescription,
        url: error?.url || window.location.href,
        logs: errorLogger.getLogsAsText(),
      })

      if (result.success) {
        this.setState({
          reportSent: true,
          reportEmail: '',
          reportDescription: '',
        })

        setTimeout(() => {
          this.setState({
            showReportForm: false,
            reportSent: false,
          })
        }, 3000)
      } else {
        alert(result.error || 'Error al enviar el reporte')
      }
    } catch (err) {
      console.error('Error reporting error:', err)
      alert('Error al enviar el reporte')
    } finally {
      this.setState({ reportLoading: false })
    }
  }

  copyErrorCode = () => {
    const errorCode = this.state.error?.id || 'UNKNOWN'
    navigator.clipboard.writeText(errorCode)
    alert('Código de error copiado: ' + errorCode)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      showReportForm: false,
      reportEmail: '',
      reportDescription: '',
      reportSent: false,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">Oops, algo salió mal</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nos ayudaría mucho si reportas este error
                  </p>
                </div>
              </div>

              {/* Error Code */}
              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <p className="text-xs text-muted-foreground font-medium">CÓDIGO DE ERROR</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm font-bold text-foreground">
                    {this.state.error.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.copyErrorCode}
                    className="h-7 w-7 p-0"
                    title="Copiar código"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground font-medium mb-2">MENSAJE</p>
                <p className="text-sm text-foreground font-medium break-words">
                  {this.state.error.message}
                </p>
              </div>

              {/* Report Form */}
              {!this.state.showReportForm ? (
                <div className="space-y-3">
                  <Button
                    onClick={() => this.setState({ showReportForm: true })}
                    className="w-full gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Reportar Error
                  </Button>
                  <Button
                    onClick={this.resetError}
                    variant="outline"
                    className="w-full"
                  >
                    Intentar de Nuevo
                  </Button>
                </div>
              ) : this.state.reportSent ? (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center space-y-2">
                  <p className="text-sm font-medium text-green-600">✓ Error reportado exitosamente</p>
                  <p className="text-xs text-muted-foreground">
                    Gracias por tu ayuda. Investigaremos este problema.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Tu email (para contactarte si necesitamos detalles)
                    </label>
                    <input
                      type="email"
                      value={this.state.reportEmail}
                      onChange={(e) =>
                        this.setState({ reportEmail: e.target.value })
                      }
                      placeholder="tu@email.com"
                      className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      ¿Qué estabas haciendo? (opcional)
                    </label>
                    <textarea
                      value={this.state.reportDescription}
                      onChange={(e) =>
                        this.setState({ reportDescription: e.target.value })
                      }
                      placeholder="Describe qué sucedió cuando ocurrió el error..."
                      maxLength={500}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {this.state.reportDescription.length}/500
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={this.handleReportError}
                      disabled={this.state.reportLoading || !this.state.reportEmail}
                      className="flex-1 gap-2"
                    >
                      {this.state.reportLoading ? (
                        <>
                          <span className="animate-spin">⚙️</span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar Reporte
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => this.setState({ showReportForm: false })}
                      variant="outline"
                      size="icon"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Footer Help */}
              <p className="text-xs text-muted-foreground text-center">
                Los logs se incluyen automáticamente. Comparte el código de error si contactas a soporte.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
