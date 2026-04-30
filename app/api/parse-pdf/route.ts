import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { getAdminConfig } from '@/lib/admin-config'

// Global Gemini API Key - used for all users
const GEMINI_API_KEY = 'AIzaSyBthuQfIIQ2SQJtar_uslJiGoWqAr7UeCw'

import { GoogleGenerativeAI } from '@google/generative-ai'

// Dynamically import pdf-parse to avoid test file issues
let pdf: any
try {
  pdf = require('pdf-parse/lib/pdf-parse')
} catch {
  pdf = null
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

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
    } else if (isPDF) {
      // Use Gemini's native PDF support - it handles PDFs directly
      try {
        const arrayBuffer = await file.arrayBuffer()
        const base64PDF = Buffer.from(arrayBuffer).toString('base64')
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        
        const prompt = `Eres un asistente que extrae tareas de agendas escolares. Analiza este PDF de una agenda escolar y extrae TODAS las tareas mencionadas.

INSTRUCCIONES:
- Extrae cada tarea mencionada en el documento
- Si no hay tareas claras, devuelve un array vacio
- La fecha debe estar en formato YYYY-MM-DD (ej: 2026-05-15)
- Si no hay fecha, usa la fecha actual o proximos 7 dias
- Asigna un color a cada materia (elige colores como #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #FF8C94)
- Los materiales son opcionales

RESPONDE SOLO CON EL SIGUIENTE JSON VALIDO (sin explicaciones, sin markdown):
{"tasks":[{"title":"Nombre de la tarea","subject":"Materia","subject_color":"#HEX","due_date":"YYYY-MM-DD","description":"Descripcion","value":"Valor o puntos","materials":[{"name":"Material","quantity":"Cantidad"}]}]}`

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64PDF
            }
          }
        ])
        
        const responseText = result.response.text()
        console.log('[v0] Gemini PDF response:', responseText.substring(0, 500))
        
        // Clean and parse response
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
        
        // If we get here, try fallback to pdf-parse
        if (pdf) {
          const data = await pdf(Buffer.from(arrayBuffer))
          extractedText = data.text
        } else {
          return NextResponse.json({ tasks: [], raw: responseText })
        }
      } catch (error) {
        console.error('[v0] Gemini PDF processing failed:', error)
        // Fall through to pdf-parse below if available
        if (pdf) {
          const arrayBuffer = await file.arrayBuffer()
          const data = await pdf(Buffer.from(arrayBuffer))
          extractedText = data.text
        } else {
          throw error
        }
      }
    } else {
      return NextResponse.json({ 
        error: 'PDF processing not available',
        tasks: [] 
      }, { status: 500 })
    }
      try {
        const arrayBuffer = await file.arrayBuffer()
        const base64PDF = Buffer.from(arrayBuffer).toString('base64')
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        
        const prompt = `Eres un asistente que extrae tareas de agendas escolares. Analiza este PDF de una agenda escolar y extrae TODAS las tareas mencionadas.

INSTRUCCIONES:
- Extrae cada tarea mencionada en el documento
- Si no hay tareas claras, devuelve un array vacio
- La fecha debe estar en formato YYYY-MM-DD (ej: 2026-05-15)
- Si no hay fecha, usa la fecha actual o proximos 7 dias
- Asigna un color a cada materia (elige colores como #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #FF8C94)
- Los materiales son opcionales

RESPONDE SOLO CON EL SIGUIENTE JSON VALIDO (sin explicaciones, sin markdown):
{"tasks":[{"title":"Nombre de la tarea","subject":"Materia","subject_color":"#HEX","due_date":"YYYY-MM-DD","description":"Descripcion","value":"Valor o puntos","materials":[{"name":"Material","quantity":"Cantidad"}]}]}`

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64PDF
            }
          }
        ])
        
        const responseText = result.response.text()
        console.log('[v0] Gemini PDF response:', responseText.substring(0, 500))
        
        // Clean and parse response
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
        
        return NextResponse.json({ tasks: [], raw: responseText })
      } catch (error) {
        console.error('[v0] Gemini PDF processing failed, falling back to pdf-parse:', error)
        // Fall through to pdf-parse below
      }
    }

    // Fallback: extract text using pdf-parse for PDFs, or use DOCX text
    if (isPDF) {
      const arrayBuffer = await file.arrayBuffer()
      const data = await pdf(Buffer.from(arrayBuffer))
      extractedText = data.text
    }

    // Truncate text to avoid exceeding model context
    const truncatedText = extractedText.substring(0, 8000) || 'No se pudo extraer texto'
    console.log('[v0] Extracted text length:', truncatedText.length)
    console.log('[v0] First 500 chars:', truncatedText.substring(0, 500))

    const prompt = `Eres un asistente que extrae tareas de agendas escolares. Analiza el siguiente texto y extrae TODAS las tareas escolares mencionadas.

TEXTO DE LA AGENDA:
${truncatedText}

INSTRUCCIONES:
- Extrae cada tarea mencionada en el texto
- Si no hay tareas claras, devuelve un array vacio
- La fecha debe estar en formato YYYY-MM-DD (ej: 2026-05-15)
- Si no hay fecha, usa la fecha actual o proximos 7 dias
- Asigna un color a cada materia (elige colores como #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #FF8C94)
- Los materiales son opcionales

RESPONDE SOLO CON EL SIGUIENTE JSON VALIDO (sin explicaciones, sin markdown):
{"tasks":[{"title":"Nombre de la tarea","subject":"Materia","subject_color":"#HEX","due_date":"YYYY-MM-DD","description":"Descripcion","value":"Valor o puntos","materials":[{"name":"Material","quantity":"Cantidad"}]}]}`

    const rawParseResult = await callGeminiAPI(prompt)

    let responseText = rawParseResult.trim()
    console.log('[v0] Gemini raw response:', responseText.substring(0, 500))

    // Remove markdown code blocks if present
    responseText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

    // Try to extract JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*"tasks"[\s\S]*\}/)
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
