// Error logging and tracking system
// Captura errores del cliente con contexto y permite reportar a soporte

export interface ErrorLog {
  id: string
  timestamp: string
  message: string
  stack?: string
  url: string
  userAgent: string
  context?: Record<string, any>
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private readonly MAX_LOGS = 50

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers()
    }
  }

  private setupGlobalErrorHandlers() {
    // Capturar errores no manejados
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'uncaughtError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    // Capturar promise rejections no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandledRejection',
      })
    })
  }

  captureError(error: any, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      context: {
        ...context,
        localStorage: this.getSafeLocalStorage(),
      },
    }

    this.logs.push(errorLog)

    // Mantener máximo de logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS)
    }

    console.error('[ErrorLogger]', errorLog)

    return errorLog
  }

  private getSafeLocalStorage() {
    try {
      return {
        theme: localStorage.getItem('cleargrade-theme'),
        darkMode: localStorage.getItem('cleargrade-dark-mode'),
      }
    } catch {
      return {}
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  getLogsAsText(): string {
    return this.logs
      .map((log) => {
        return `[${log.timestamp}] ${log.message}\n${log.stack || ''}\nContext: ${JSON.stringify(log.context)}`
      })
      .join('\n\n---\n\n')
  }

  clearLogs() {
    this.logs = []
  }

  getLastError(): ErrorLog | null {
    return this.logs[this.logs.length - 1] || null
  }
}

export const errorLogger = new ErrorLogger()
