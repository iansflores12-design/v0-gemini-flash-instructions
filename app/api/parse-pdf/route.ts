import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 })
    }

    // 1. Preparamos el FormData para n8n
    const n8nData = new FormData()
    // 'data' es el nombre que el nodo "Extract from File" espera recibir
    n8nData.append('data', file)

    // 2. Tu URL de ngrok actualizada
    const N8N_WEBHOOK_URL = 'https://dimness-traps-retired.ngrok-free.dev/webhook-test/extract-tasks'

    console.log('Enviando archivo a n8n...');

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: n8nData,
      // IMPORTANTE: Dejar que el navegador maneje los headers automáticamente
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error desde n8n:', errorText)
      return NextResponse.json({ error: 'Error en el procesamiento de n8n' }, { status: response.status })
    }

    const data = await response.json()

    // Devolvemos el JSON estructurado (tasks, materials, etc.) al frontend
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en el servidor Next.js:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}