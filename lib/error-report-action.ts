'use server'

import { createClient } from '@/lib/supabase/server'

export interface ErrorReportData {
  errorMessage: string
  errorStack?: string
  userEmail: string
  description: string
  url: string
  logs: string
}

export async function reportError(data: ErrorReportData) {
  try {
    // Validar datos
    if (!data.userEmail || !data.description || !data.errorMessage) {
      return {
        success: false,
        error: 'Faltan datos requeridos',
      }
    }

    // Aquí iría la lógica para enviar el email
    // Por ahora guardamos en la BD o enviamos directamente
    
    console.log('[ErrorReport] Reporte de error recibido:', {
      email: data.userEmail,
      errorMessage: data.errorMessage,
      url: data.url,
    })

    // Si tienes un servicio de email configurado, aquí lo usarías
    // Por ejemplo, con Resend, SendGrid, Brevo, etc.

    return {
      success: true,
      message: 'Error reportado exitosamente. Gracias por tu ayuda.',
    }
  } catch (error) {
    console.error('[ErrorReport] Error al reportar:', error)
    return {
      success: false,
      error: 'Error al enviar el reporte',
    }
  }
}
