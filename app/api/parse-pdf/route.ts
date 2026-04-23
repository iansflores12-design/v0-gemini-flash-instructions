import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporciono archivo PDF' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'El archivo debe ser un PDF' }, { status: 400 })
    }

    const pdfBuffer = Buffer.from(await file.arrayBuffer())
    
    const pdfParse = require('pdf-parse')
    const pdfData = await pdfParse(pdfBuffer)
    const textContent = pdfData.text

    if (!textContent || textContent.trim().length < 10) {
      return NextResponse.json({ error: 'No se pudo extraer texto del PDF' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY

    const prompt = `Analiza este documento de una agenda escolar o lista de tareas y extrae la información estructurada.

Contenido del documento:
${textContent.slice(0, 8000)}

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

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Eres un asistente que extrae información de agendas escolares.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.text()
      console.error('Groq API error:', error)
      return NextResponse.json({ error: 'Error al procesar con IA' }, { status: 500 })
    }

    const groqData = await groqResponse.json()
    const responseText = groqData.choices[0]?.message?.content

    if (!responseText) {
      return NextResponse.json({ error: 'No se obtuvo respuesta de la IA' }, { status: 500 })
    }

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
    return NextResponse.json(
      { error: 'Error al procesar el PDF. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}