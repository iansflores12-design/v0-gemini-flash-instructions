import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = 'AIzaSyBthuQfIIQ2SQJtar_uslJiGoWqAr7UeCw'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// Dynamically import pdf-parse
let pdf: any
try {
  pdf = require('pdf-parse/lib/pdf-parse')
} catch {
  pdf = null
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

    // For PDFs, use Gemini's native PDF support
    if (isPDF) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const base64PDF = Buffer.from(arrayBuffer).toString('base64')

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

        const prompt = `Eres un asistente que extrae tareas de agendas escolares. Analiza este PDF y extrae TODAS las tareas mencionadas.

INSTRUCCIONES:
- Extrae cada tarea del documento
- Fecha en formato YYYY-MM-DD
- Asigna colores a materias (#FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #FF8C94)
- Los materiales son opcionales

RESPONDE SOLO CON JSON VALIDO (sin markdown):
{"tasks":[{"title":"Tarea","subject":"Materia","subject_color":"#HEX","due_date":"YYYY-MM-DD","description":"Desc","value":"Puntos","materials":[{"name":"Mat","quantity":"Qty"}]}]}`

        const result = await model.generateContent([
          prompt,
          { inlineData: { mimeType: 'application/pdf', data: base64PDF } }
        ])

        const responseText = result.response.text()
        console.log('[v0] Gemini PDF response:', responseText.substring(0, 500))

        let cleanedText = responseText.trim()
        cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

        const jsonMatch = cleanedText.match(/\{[\s\S]*"tasks"[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed.tasks && Array.isArray(parsed.tasks)) {
              return NextResponse.json(parsed)
            }
          } catch (e) {
            console.error('[v0] JSON parse error:', e)
          }
        }

        // If Gemini didn't return valid JSON, try fallback
        if (pdf) {
          const data = await pdf(Buffer.from(arrayBuffer))
          return await processTextWithGemini(data.text)
        }

        return NextResponse.json({ tasks: [], raw: responseText })
      } catch (error) {
        console.error('[v0] Gemini PDF error:', error)
        // Fall through to pdf-parse if available
      }
    }

    // For DOCX files
    if (isDOCX) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const result = await mammoth.extractRawText({ buffer })
      return await processTextWithGemini(result.value)
    }

    return NextResponse.json({ tasks: [] })

  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json({ error: 'Error al procesar el archivo', tasks: [] }, { status: 500 })
  }
}

async function processTextWithGemini(extractedText: string) {
  const truncatedText = extractedText.substring(0, 8000) || 'No se pudo extraer texto'
  console.log('[v0] Text length:', truncatedText.length)

  const prompt = `Analiza este texto de agenda escolar y extrae TODAS las tareas.

TEXTO:
${truncatedText}

RESPONDE SOLO CON JSON VALIDO:
{"tasks":[{"title":"Tarea","subject":"Materia","subject_color":"#HEX","due_date":"YYYY-MM-DD","description":"Desc","value":"Puntos","materials":[{"name":"Mat","quantity":"Qty"}]}]}`

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.3 }
      })
    })

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let cleanedText = responseText.trim()
    cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

    const jsonMatch = cleanedText.match(/\{[\s\S]*"tasks"[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return NextResponse.json(parsed)
      }
    }

    return NextResponse.json({ tasks: [], raw: responseText })
  } catch (error) {
    console.error('[v0] Gemini API error:', error)
    return NextResponse.json({ tasks: [] })
  }
}
