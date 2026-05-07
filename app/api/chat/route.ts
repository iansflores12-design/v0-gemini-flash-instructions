import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminConfig } from '@/lib/admin-config'
import { SUBSCRIPTION_LIMITS } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const GEMINI_API_KEY = 'AIzaSyAoiN0VsY3AjLhyZZg08Y9Dnp7052h8TIY'

// Convert file buffer to base64 for Gemini
function bufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64')
}

// Fetch user context from Supabase
async function getUserContext(userId: string): Promise<string> {
  const supabase = await createClient()

  const [tasksResult, subjectsResult, profileResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, due_date, is_done, description, subject:subjects(name, color_code), materials(name, quantity)')
      .eq('user_id', userId)
      .eq('is_done', false)
      .order('due_date', { ascending: true })
      .limit(30),
    supabase
      .from('subjects')
      .select('id, name, color_code')
      .eq('user_id', userId)
      .order('name'),
    supabase
      .from('profiles')
      .select('full_name, username, subscription_plan')
      .eq('id', userId)
      .single(),
  ])

  const tasks = tasksResult.data || []
  const subjects = subjectsResult.data || []
  const profile = profileResult.data

  const today = new Date()
  const todayStr = format(today, "EEEE d 'de' MMMM yyyy", { locale: es })

  let context = `=== CONTEXTO DEL ESTUDIANTE ===
Fecha actual: ${todayStr}
Nombre: ${profile?.full_name || profile?.username || 'Estudiante'}
Plan: ${profile?.subscription_plan || 'free'}

=== MATERIAS ACTUALES (${subjects.length}) ===
${subjects.length > 0
  ? subjects.map(s => `- ${s.name}`).join('\n')
  : '(Sin materias registradas)'}

=== TAREAS PENDIENTES (${tasks.length}) ===`

  if (tasks.length === 0) {
    context += '\n(Sin tareas pendientes)'
  } else {
    for (const task of tasks) {
      const dueDate = format(new Date(task.due_date + 'T00:00:00'), "d MMM", { locale: es })
      const diffDays = Math.ceil((new Date(task.due_date + 'T00:00:00').getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
      const urgency = diffDays < 0 ? ' [VENCIDA]' : diffDays === 0 ? ' [HOY]' : diffDays === 1 ? ' [MAÑANA]' : diffDays <= 3 ? ` [en ${diffDays} dias]` : ` [${dueDate}]`
      const subject = task.subject as any
      const materia = subject?.name ? ` (${subject.name})` : ''
      context += `\n- ${task.title}${materia}${urgency}`
      if (task.materials && (task.materials as any[]).length > 0) {
        const mats = (task.materials as any[]).map((m: any) => m.quantity ? `${m.quantity} ${m.name}` : m.name).join(', ')
        context += ` | Materiales: ${mats}`
      }
    }
  }

  return context
}

async function callGeminiWithFiles(
  prompt: string,
  userContext: string,
  history: { role: string; content: string }[],
  files: { data: string; mimeType: string; name: string }[]
): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000)

  // Build conversation parts for Gemini
  const contents: any[] = []

  // System context as first user message
  contents.push({
    role: 'user',
    parts: [{ text: `${userContext}\n\nEres ClearGrade AI, asistente de estudio personalizado. Tienes acceso al contexto del estudiante de arriba. Úsalo para dar respuestas contextualizadas, mencionando tareas específicas o materias cuando sea relevante. Responde siempre en español de forma amigable y concisa NO USES * POR NADA DEL MUNDO.` }]
  })
  contents.push({ role: 'model', parts: [{ text: 'Entendido. Tengo acceso a tu información académica y estoy listo para ayudarte.' }] })

  // Add conversation history (last 8 messages)
  const recentHistory = history.slice(-8)
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })
  }

  // Current user message with optional files
  const userParts: any[] = []

  // Add files first (images, PDFs, docs)
  for (const file of files) {
    if (file.mimeType.startsWith('image/')) {
      userParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } })
    } else {
      // For documents, include as inline data if supported, otherwise note it
      userParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } })
    }
  }

  userParts.push({ text: prompt })
  contents.push({ role: 'user', parts: userParts })

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
            topP: 0.9
          }
        }),
        signal: controller.signal
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API_ERROR_${response.status}: ${err}`)
    }

    const data = await response.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!reply?.trim()) throw new Error('EMPTY_RESPONSE')
    return reply.trim()

  } catch (error: any) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse multipart/form-data OR JSON
    const contentType = req.headers.get('content-type') || ''
    let message = ''
    let history: { role: string; content: string }[] = []
    let files: { data: string; mimeType: string; name: string }[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      message = (formData.get('message') as string) || ''
      const historyRaw = formData.get('history') as string
      history = historyRaw ? JSON.parse(historyRaw) : []

      // Process attached files
      const fileEntries = formData.getAll('files') as File[]
      for (const file of fileEntries) {
        const buffer = await file.arrayBuffer()
        const base64 = bufferToBase64(buffer)
        files.push({ data: base64, mimeType: file.type, name: file.name })
      }
    } else {
      const body = await req.json()
      message = body.message || ''
      history = body.history || []
    }

    if (!message?.trim() && files.length === 0) {
      return NextResponse.json({ error: 'Mensaje o archivo requerido' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({
        error: 'No autorizado',
        reply: 'Por favor, inicia sesion nuevamente.'
      }, { status: 401 })
    }

    // Check limits
    const config = await getAdminConfig()
    if (config?.chatLimitsEnabled) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single()

      const plan = profile?.subscription_plan || 'free'
      const limits = SUBSCRIPTION_LIMITS[plan]

      const { data: usage } = await supabase
        .from('user_usage')
        .select('chatRequestsUsedToday, lastChatReset')
        .eq('userId', user.id)
        .single()

      const today = new Date().toDateString()
      const isNewDay = !usage?.lastChatReset || new Date(usage.lastChatReset).toDateString() !== today
      const chatUsed = isNewDay ? 0 : (usage?.chatRequestsUsedToday || 0)

      if (chatUsed >= limits.chatRequestsPerDay) {
        return NextResponse.json({
          reply: `Has alcanzado tu limite de ${limits.chatRequestsPerDay} mensajes por dia.`,
          limitExceeded: true
        })
      }

      await supabase.from('user_usage').upsert({
        userId: user.id,
        chatRequestsUsedToday: isNewDay ? 1 : chatUsed + 1,
        lastChatReset: new Date().toISOString()
      })
    }

    // Fetch user context
    const userContext = await getUserContext(user.id)

    // Call Gemini
    const reply = await callGeminiWithFiles(
      message || (files.length > 0 ? 'Analiza este archivo.' : ''),
      userContext,
      history,
      files
    )

    return NextResponse.json({ reply, success: true })

  } catch (error: any) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json({
      success: false,
      reply: 'Lo siento, hubo un problema. Por favor, intenta de nuevo.'
    }, { status: 500 })
  }
}
