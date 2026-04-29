import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminConfig } from '@/lib/admin-config'
import { SUBSCRIPTION_LIMITS } from '@/lib/types'

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
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
    throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Empty response from Gemini API')
  }

  return data.candidates[0].content.parts[0].text
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, userId } = await req.json()

    if (!message || !userId) {
      return NextResponse.json({ error: 'Mensaje y userId requeridos' }, { status: 400 })
    }

    // Get admin config
    const config = await getAdminConfig()
    if (!config?.geminiApiKey) {
      return NextResponse.json({ error: 'API no configurada' }, { status: 500 })
    }

    // Check chat limits if enabled
    if (config.chatLimitsEnabled) {
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

    const reply = await callGeminiAPI(prompt, config.geminiApiKey)

    return NextResponse.json({ reply, success: true })

  } catch (error) {
    console.error('[v0] Chat error:', error)
    return NextResponse.json({
      error: 'Error interno',
      reply: 'Ocurrio un error al conectar con la IA. Por favor intenta de nuevo.'
    }, { status: 500 })
  }
}
