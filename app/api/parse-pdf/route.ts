import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { getAdminConfig } from '@/lib/admin-config'

// Global Gemini API Key - used for all users
const GEMINI_API_KEY = 'AIzaSyBthuQfIIQ2SQJtar_uslJiGoWqAr7UeCw'

// Dynamically import pdf-parse to avoid test file issues
let pdf: any
try {
  pdf = require('pdf-parse/lib/pdf-parse')
} catch {
  pdf = null
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
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
        maxOutputTokens: 2000,
        temperature: 0.3,
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
    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    const userId = formData.get('userId') as string | null
    
    if (!file) {
      return NextResponse.json({ error: 'No se subio ningun archivo' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf'
    const isDOCX = fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    if (!isPDF && !isDOCX) {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF o DOCX' }, { status: 400 })
    }

    let extractedText = ''

  if (isDOCX) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const result = await mammoth.extractRawText({ buffer })
  extractedText = result.value
    } else if (pdf) {
      const arrayBuffer = await file.arrayBuffer()
      const data = await pdf(Buffer.from(arrayBuffer))
      extractedText = data.text
    } else {
      return NextResponse.json({ 
        error: 'PDF processing not available',
        tasks: [] 
      }, { status: 500 })
    }

    // Truncate text to avoid exceeding model context
    const truncatedText = extractedText.substring(0, 3000) || 'No se pudo extraer texto'

    const prompt = `Analiza el siguiente texto de una agenda escolar y extrae las tareas en formato JSON valido. Responde SOLO con el JSON, sin explicaciones.

Texto: ${truncatedText}

Responde SOLO con JSON valido en este formato:
{"tasks":[{"title":"Nombre de la tarea","subject":"Materia","subject_color":"#HEX","due_date":"YYYY-MM-DD","description":"Descripcion","value":"Valor o puntos","materials":[{"name":"Material","quantity":"Cantidad"}]}]}

Asegúrate de que el JSON sea valido.`

    const rawParseResult = await callGeminiAPI(prompt)
    
    let responseText = rawParseResult.trim()

    const jsonMatch = responseText.match(/\{[\s\S]*"tasks"[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)
      } catch {
        console.error('[v0] JSON parse error')
      }
    }

    return NextResponse.json({ 
      tasks: [],
      raw: responseText 
    })

  } catch (error) {
    console.error('[v0] Error processing file:', error)
    return NextResponse.json({ 
      error: 'Error al procesar el archivo',
      tasks: [] 
    }, { status: 500 })
  }
}
