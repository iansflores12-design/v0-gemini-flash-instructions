import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminConfig } from '@/lib/admin-config'
import { SUBSCRIPTION_LIMITS } from '@/lib/types'

// Global Gemini API Key - used for all users
const GEMINI_API_KEY = 'AIzaSyBthuQfIIQ2SQJtar_uslJiGoWqAr7UeCw'

async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    // CORRECCIÓN: Usar el nombre correcto del modelo
    // "gemini-1.5-flash" es más estable que "gemini-flash-latest"
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error response:', errorData)
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure:', data)
      throw new Error('Empty response from Gemini API')
    }

    return data.candidates[0].content.parts[0].text
  } catch (fetchError) {
    // CORRECCIÓN: Manejar específicamente errores de fetch/red
    if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
      console.error('Network error calling Gemini API:', fetchError)
      throw new Error('No se pudo conectar con el servicio de IA. Verifica tu conexión a internet.')
    }
    throw fetchError
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, userId } = await req.json()

    if (!message || !userId) {
      return NextResponse.json({ error: 'Mensaje y userId requeridos' }, { status: 400 })
    }

    // Get admin config for feature toggles only (not API key)
    const config = await getAdminConfig()

    // Check chat limits if enabled
    if (config?.chatLimitsEnabled) {
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', userId)
        .single()

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
          reply: `Has alcanzado tu limite de ${limits.chatRequestsPerDay} mensajes por dia. Actualiza a Pro o Ultra para mas.`,
          limitExceeded: true
        }, { status: 429 })
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

    const conversationHistory = history?.map((msg: { role: string; content: string }) =>
      `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
    ).join('\n') || ''

    const prompt = `Eres ClearGrade AI, un asistente de estudio amigable para estudiantes hispanohablantes. Ayudas con tareas, organizacion y dudas academicas. Responde en espanol de forma clara y concisa.

Historial de conversacion:
${conversationHistory}

Usuario: ${message}

Responde como Asistente:`

    const reply = await callGeminiAPI(prompt)

    return NextResponse.json({ reply, success: true })

  } catch (error) {
    console.error('[v0] Chat error:', error)
    
    // CORRECCIÓN: Devolver mensajes de error más descriptivos
    let errorMessage = 'Ocurrió un error al conectar con la IA. Por favor intenta de nuevo.'
    
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = 'Error de conexión: No se pudo contactar al servicio de IA. Verifica tu conexión.'
      } else if (error.message.includes('API key') || error.message.includes('auth')) {
        errorMessage = 'Error de autenticación con el servicio de IA.'
      } else if (error.message.includes('model')) {
        errorMessage = 'Error con el modelo de IA. Contacta al administrador.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({
      error: 'Error interno',
      reply: errorMessage
    }, { status: 500 })
  }
}