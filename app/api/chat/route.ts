import { NextRequest, NextResponse } from 'next/server'

const HF_TOKEN = process.env.HF_TOKEN || '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'
const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct'

async function callHFAPI(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(HF_API_URL, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          return_full_text: false,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    })

    // Model is still loading, wait and retry
    if (response.status === 503) {
      const errorData = await response.json().catch(() => ({}))
      const estimatedTime = errorData.estimated_time || 20
      console.log(`Model loading, waiting ${estimatedTime}s (attempt ${attempt}/${retries})...`)
      await new Promise(resolve => setTimeout(resolve, Math.min(estimatedTime * 1000, 30000)))
      continue
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HF API error ${response.status}: ${errorText}`)
    }

    const rawResponse = await response.text()
    let result: any
    try {
      result = JSON.parse(rawResponse)
    } catch {
      throw new Error(`HF API returned non-JSON: ${rawResponse.substring(0, 200)}`)
    }

    let reply = ''
    if (Array.isArray(result) && result[0]?.generated_text) {
      reply = result[0].generated_text
    } else if (result.generated_text) {
      reply = result.generated_text
    } else if (Array.isArray(result) && result[0]?.[0]?.generated_text) {
      reply = result[0][0].generated_text
    }

    if (!reply) {
      throw new Error(`Empty response from HF API: ${rawResponse.substring(0, 200)}`)
    }

    return reply
  }

  throw new Error('Model failed to load after retries')
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    const conversationHistory = history?.map((msg: { role: string; content: string }) =>
      `<|${msg.role === 'user' ? 'user' : 'assistant'}|>\n${msg.content}`
    ).join('\n') || ''

    // Limit conversation to last 5 messages to avoid exceeding HF input limits
    let systemAndHistory = `<|system|>\nEres ClearGrade AI, un asistente de estudio amigable y util para estudiantes hispanohablantes. Ayudas con tareas, organizacion y dudas academicas. Responde siempre en espanol de forma clara y concisa.<|end|>\n`
    if (conversationHistory) {
      systemAndHistory += conversationHistory + '\n'
    }

    const userPart = `<|user|>\n${message}<|end|>\n<|assistant|>\n`

    // Ensure total prompt stays under ~2500 chars (Phi-3 free tier safety limit)
    const maxPrompt = 2500
    if (systemAndHistory.length + userPart.length + 50 > maxPrompt) {
      const allowedHistory = Math.max(0, maxPrompt - userPart.length - 200)
      systemAndHistory = `<|system|>\nEres ClearGrade AI, un asistente de estudio para estudiantes hispanohablantes. Responde siempre en espanol.<|end|>\n${conversationHistory.substring(0, allowedHistory)}`
    }

    const prompt = systemAndHistory + userPart

    const rawReply = await callHFAPI(prompt)

    // Clean up the response
    let reply = rawReply
      .replace(/^Asistente:\s*/i, '')
      .replace(/<\|(user|assistant|system|end|stop)\|>/g, '')
      .replace(/<\/s>/g, '')
      .trim()

    // Cut off at next user tag if present
    const userTagIndex = reply.indexOf('<|user|>')
    if (userTagIndex !== -1) {
      reply = reply.substring(0, userTagIndex).trim()
    }

    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({
      error: 'Error interno',
      reply: 'Ocurrio un error al conectar con la IA. Por favor intenta de nuevo en unos segundos.'
    }, { status: 500 })
  }
}
