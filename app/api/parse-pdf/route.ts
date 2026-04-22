import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Get user's API key from their profile
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('gemini_api_key')
      .eq('id', user.id)
      .single()

    const apiKey = profile?.gemini_api_key

    if (!apiKey) {
      return NextResponse.json({
        error: 'No tienes una clave API de Gemini configurada. Ve a tu perfil para agregarla.'
      }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('pdf') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporciono archivo PDF' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'El archivo debe ser un PDF' }, { status: 400 })
    }

    // Initialize Gemini with user's API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const binary = Array.from(new Uint8Array(bytes)).map(b => String.fromCharCode(b)).join('')
    const base64 = btoa(binary)

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `Analiza este documento PDF de una agenda escolar o lista de tareas y extrae la información estructurada.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks) con este formato exacto:
{
  "tasks": [
    {
      "title": "Nombre de la tarea",
      "subject": "Nombre de la materia si se menciona o null",
      "due_date": "YYYY-MM-DD (usa la fecha actual ${new Date().toISOString().split('T')[0]} como referencia para interpretar fechas relativas como 'mañana', 'lunes', etc.)",
      "materials": [
        { "name": "nombre del material", "quantity": "cantidad si se especifica o null" }
      ]
    }
  ]
}

Reglas:
- Extrae TODAS las tareas mencionadas
- Si no hay fecha específica, usa una fecha razonable cercana
- Los materiales incluyen libros, cuadernos, hojas, colores, cartulinas, etc.
- Si no hay materiales mencionados, deja el array vacío
- Responde SOLO con el JSON, sin explicaciones adicionales`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64
        }
      }
    ])

    const response = await result.response
    const responseText = response.text()

    // Clean the response - remove markdown code blocks if present
    let cleanedText = responseText.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7)
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3)
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3)
    }
    cleanedText = cleanedText.trim()

    const parsed = JSON.parse(cleanedText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Error parsing PDF:', error)

    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'Tu clave API de Gemini no es valida. Verifica que sea correcta en tu perfil.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al procesar el PDF. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
