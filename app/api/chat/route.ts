import { NextRequest, NextResponse } from 'next/server'

const HF_TOKEN = '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'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    // Build conversation context
    const conversationHistory = history?.map((msg: { role: string; content: string }) => 
      `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
    ).join('\n') || ''

    const prompt = `Eres ClearGrade AI, un asistente de estudio amigable y util. Ayudas a estudiantes con sus tareas, organizacion y dudas academicas.

${conversationHistory ? `Conversacion previa:\n${conversationHistory}\n\n` : ''}Usuario: ${message}

Asistente:`

    const response = await fetch(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      {
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
            top_p: 0.9
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HF API error:', errorText)
      return NextResponse.json({ 
        error: 'Error al conectar con la IA',
        reply: 'Lo siento, no pude procesar tu mensaje. Intenta de nuevo.' 
      }, { status: 500 })
    }

    const result = await response.json()
    
    let reply = ''
    if (Array.isArray(result) && result[0]?.generated_text) {
      reply = result[0].generated_text.trim()
    } else if (typeof result === 'string') {
      reply = result.trim()
    } else {
      reply = 'No pude generar una respuesta.'
    }

    // Clean up the response
    reply = reply.replace(/^Asistente:\s*/i, '').trim()

    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ 
      error: 'Error interno',
      reply: 'Ocurrio un error. Por favor intenta de nuevo.' 
    }, { status: 500 })
  }
}
