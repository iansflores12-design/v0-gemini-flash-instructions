import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminConfig } from '@/lib/admin-config'
import { SUBSCRIPTION_LIMITS } from '@/lib/types'

const GEMINI_API_KEY = 'AIzaSyAoiN0VsY3AjLhyZZg08Y9Dnp7052h8TIY'

async function callGeminiAPI(prompt: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7, topP: 0.9 }
        }),
        signal: controller.signal
      }
    )

    if (response.status === 404) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.7, topP: 0.9 }
          }),
          signal: controller.signal
        }
      )
    }

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API_ERROR_${response.status}`)
    }

    const data = await response.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!reply || reply.trim() === '') {
      throw new Error('RESPUESTA_VACIA')
    }

    return reply.trim()
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, userId: bodyUserId } = await req.json()
    
    // CORRECCIÓN: Obtener userId de múltiples fuentes
    let userId = bodyUserId
    
    // Si no viene en el body, intentar obtener de la sesión de Supabase
    if (!userId) {
      const supabase = await createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error getting user from session:', userError)
        return NextResponse.json({ 
          error: 'No autorizado',
          reply: 'Por favor, inicia sesión nuevamente para continuar.'
        }, { status: 401 })
      }
      
      userId = user.id
      console.log('UserId obtenido de sesión:', userId)
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        error: 'Mensaje inválido',
        reply: 'Por favor, escribe un mensaje válido.'
      }, { status: 400 })
    }

    // Resto del código igual...
    const config = await getAdminConfig()

    if (config?.chatLimitsEnabled) {
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', userId)
        .single()

      const plan = profile?.subscription_plan || 'free'
      const limits = SUBSCRIPTION_LIMITS[plan]
      
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
          reply: `✨ Has alcanzado tu límite de ${limits.chatRequestsPerDay} mensajes por día.`,
          limitExceeded: true
        }, { status: 200 })
      }

      await supabase
        .from('user_usage')
        .upsert({
          userId,
          chatRequestsUsedToday: isNewDay ? 1 : chatUsed + 1,
          lastChatReset: new Date().toISOString()
        })
    }

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

    let reply: string
    
    try {
      reply = await callGeminiAPI(prompt)
    } catch (apiError: any) {
      console.error('Gemini API error:', apiError)
      reply = '💬 Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.'
    }

    if (!reply || reply.trim() === '') {
      reply = '💬 No pude generar una respuesta en este momento. ¿Podrías reformular tu pregunta?'
    }

    return NextResponse.json({ reply, success: true })

  } catch (error: any) {
    console.error('[Chat API] Error fatal:', error)
    
    return NextResponse.json({
      success: false,
      reply: '🔌 Lo siento, hubo un problema. Por favor, intenta de nuevo.'
    }, { status: 500 })
  }
}