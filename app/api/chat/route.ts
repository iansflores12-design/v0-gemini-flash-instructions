import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminConfig } from '@/lib/admin-config'
import { SUBSCRIPTION_LIMITS } from '@/lib/types'

// Global Gemini API Key - Updated
const GEMINI_API_KEY = 'AIzaSyAoiN0VsY3AjLhyZZg08Y9Dnp7052h8TIY'

async function callGeminiAPI(prompt: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    // Probar primero con gemini-1.5-flash (más nuevo)
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
            topP: 0.9,
          }
        }),
        signal: controller.signal
      }
    )

    // Si falla con 404, intentar con gemini-pro
    if (response.status === 404) {
      console.log('Modelo gemini-1.5-flash no disponible, usando gemini-pro')
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
              topP: 0.9,
            }
          }),
          signal: controller.signal
        }
      )
    }

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      
      if (response.status === 403 || response.status === 401) {
        throw new Error('API_KEY_INVALIDA')
      } else if (response.status === 429) {
        throw new Error('LIMITE_EXCEDIDO')
      } else if (response.status === 404) {
        throw new Error('MODELO_NO_ENCONTRADO')
      } else {
        throw new Error(`API_ERROR_${response.status}`)
      }
    }

    const data = await response.json()
    
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!reply || reply.trim() === '') {
      console.error('Respuesta vacía de Gemini:', data)
      throw new Error('RESPUESTA_VACIA')
    }

    return reply.trim()
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT')
    }
    
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, userId } = await req.json()

    // Validaciones básicas
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        error: 'Mensaje inválido',
        reply: 'Por favor, escribe un mensaje válido.'
      }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ 
        error: 'Usuario no identificado',
        reply: 'Error de autenticación. Por favor, recarga la página.'
      }, { status: 401 })
    }

    // Get admin config for feature toggles only (not API key)
    const config = await getAdminConfig()

    // Check chat limits if enabled
    if (config?.chatLimitsEnabled) {
      const supabase = await createClient()
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      }

      const plan = profile?.subscription_plan || 'free'
      const limits = SUBSCRIPTION_LIMITS[plan]
      
      // Check daily chat requests
      const { data: usage } = await supabase
        .from('user_usage')
        .select('chatRequestsUsedToday, lastChatReset')
        .eq('userId', userId)
        .single()

      const today = new Date().toDateString()
      const isNewDay = !usage?.lastChatReset || new Date(usage.lastChatReset).toDateString() !== today
      const chatUsed = isNewDay ? 0 : (usage?.chatRequestsUsedToday || 0)

      if (chatUsed >= limits.chatRequestsPerDay) {
        return NextResponse.json({
          error: 'Limite alcanzado',
          reply: `✨ Has alcanzado tu límite de ${limits.chatRequestsPerDay} mensajes por día.\n\n🚀 Actualiza a Pro o Ultra para más mensajes.`,
          limitExceeded: true
        }, { status: 200 })
      }

      // Update usage
      await supabase
        .from('user_usage')
        .upsert({
          userId,
          chatRequestsUsedToday: isNewDay ? 1 : chatUsed + 1,
          lastChatReset: new Date().toISOString()
        })
    }

    // Construir historial de conversación
    const conversationHistory = history && Array.isArray(history) 
      ? history.map((msg: { role: string; content: string }) =>
          `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
        ).join('\n')
      : ''

    const prompt = `Eres ClearGrade AI, un asistente de estudio amigable para estudiantes hispanohablantes. Ayudas con tareas, organización y dudas académicas. Responde en español de forma clara y concisa.

Historial de conversación:
${conversationHistory || '(No hay historial previo)'}

Usuario: ${message}

Responde como Asistente:`

    // Llamar a Gemini con manejo de errores
    let reply: string
    
    try {
      reply = await callGeminiAPI(prompt)
      console.log('Gemini response successful, length:', reply.length)
    } catch (apiError: any) {
      console.error('Gemini API error:', apiError)
      
      // Manejar diferentes tipos de errores
      if (apiError.message === 'API_KEY_INVALIDA') {
        reply = '⚠️ Error de configuración del asistente. Por favor, contacta al administrador.'
      } else if (apiError.message === 'LIMITE_EXCEDIDO') {
        reply = '📊 El servicio de IA está saturado. Por favor, intenta de nuevo en unos minutos.'
      } else if (apiError.message === 'TIMEOUT') {
        reply = '⏱️ El servicio de IA tardó demasiado en responder. Por favor, intenta de nuevo.'
      } else if (apiError.message === 'RESPUESTA_VACIA') {
        reply = '🤔 El asistente no pudo generar una respuesta. Por favor, reformula tu pregunta.'
      } else if (apiError.message === 'MODELO_NO_ENCONTRADO') {
        reply = '🔧 El servicio de IA está actualizándose. Por favor, intenta de nuevo en unos minutos.'
      } else {
        reply = '💬 Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo en unos momentos.'
      }
      
      return NextResponse.json({ 
        reply, 
        success: true,
        error: apiError.message 
      })
    }

    // Verificar que la respuesta no esté vacía
    if (!reply || reply.trim() === '') {
      reply = '💬 No pude generar una respuesta en este momento. ¿Podrías reformular tu pregunta?'
    }

    return NextResponse.json({ 
      reply, 
      success: true 
    })

  } catch (error: any) {
    console.error('[Chat API] Error fatal:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno',
      reply: '🔌 Lo siento, hubo un problema de conexión. Por favor, intenta de nuevo en unos segundos.'
    }, { status: 500 })
  }
}