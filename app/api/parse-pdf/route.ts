import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
    
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
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    )
  }
}
