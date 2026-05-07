import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })
    
    const prompt = `Analiza el siguiente texto de una agenda escolar o lista de tareas y extrae la información estructurada.

TEXTO A ANALIZAR:
"""
${text}
"""

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks) con este formato exacto:
{
  "tasks": [
    {
      "title": "Nombre de la tarea",
      "subject": "Nombre de la materia si se menciona o null",
      "due_date": "YYYY-MM-DD (usa la fecha actual ${new Date().toISOString().split('T')[0]} como referencia para interpretar fechas relativas como 'mañana', 'lunes', etc.)",
      "description": "Descripción detallada de la tarea si existe o null",
      "value": "Valor o puntuación de la tarea (ej: '10%', '20 puntos', '5') o null si no se especifica",
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
- La descripción debe incluir detalles, instrucciones y criterios de la tarea
- El value es importante para calificaciones: busca porcentajes, puntos, puntajes, puntuaciones, peso, etc.
- Responde SOLO con el JSON, sin explicaciones adicionales`

    const result = await model.generateContent(prompt)
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
    console.error('Error parsing agenda:', error)
    return NextResponse.json(
      { error: 'Failed to parse agenda text' },
      { status: 500 }
    )
  }
}
