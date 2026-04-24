import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió el archivo PDF' }, { status: 400 })
    }

    // 1. Preparamos el envío hacia n8n
    const n8nData = new FormData()
    // 'data' debe coincidir con el "Input Data Field" en tu nodo de n8n
    n8nData.append('data', file)

    // 2. Tu URL de ngrok (Asegúrate de que sea la actual)
    const N8N_WEBHOOK_URL = 'https://dimness-traps-retired.ngrok-free.dev/webhook-test/extract-tasks'

    console.log('Enviando agenda a n8n...')

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: n8nData,
      // No agregues headers manuales, deja que el navegador gestione el boundary
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `n8n error: ${errorText}` }, { status: response.status })
    }

    // 3. Recibimos el JSON estructurado de n8n
    const result = await response.json()

    // IMPORTANTE: Imprimimos en tu terminal para que veas qué llega
    console.log('Respuesta de n8n recibida correctamente')

    // Enviamos el resultado (que contiene { "tasks": [...] }) al frontend
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error en route.ts:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}