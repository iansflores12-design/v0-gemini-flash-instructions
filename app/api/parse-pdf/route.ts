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

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

        const prompt = `Eres un asistente experto que extrae tareas de agendas escolares. Analiza este PDF y extrae TODAS las tareas, trabajos, examenes, proyectos y actividades mencionadas.

INSTRUCCIONES IMPORTANTES:
1. Busca en TODO el documento: tablas, listas, texto, etc.
2. Una agenda escolar tipicamente tiene: Fecha, Actividad/Tarea, Objetivo, Descripcion, Materiales, Rubrica/Valor
3. Extrae CADA actividad como una tarea separada (Homework, Classwork, Quiz, Exam, Project, etc.)
4. La fecha debe estar en formato YYYY-MM-DD. El año es 2026 si no se especifica.
5. Para rangos de fechas como "April 21st to 24th", usa la fecha final (2026-04-24)
6. La materia (subject) es el nombre de la clase mencionada en el encabezado (ej: "Computer", "Math", "Science")
7. El valor (value) es el porcentaje o puntos (ej: "5%", "10%", "Total 15%")
8. La descripcion debe incluir las instrucciones detalladas de la tarea
9. Los materiales son los items necesarios listados (Notebook, Computer, Glue, etc.)

RESPONDE SOLO CON JSON VALIDO (sin explicaciones, sin markdown):
{"tasks":[{"title":"Nombre exacto de la actividad","subject":"Nombre de la materia","due_date":"YYYY-MM-DD","description":"Instrucciones completas","value":"Porcentaje o puntos totales","materials":[{"name":"Material","quantity":"1"}]}]}`

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

function repairJSON(str: string): string {
  // Remove trailing commas before ] or }
  str = str.replace(/,(\s*[}\]])/g, '$1')
  // Fix missing commas between array elements (common Gemini issue)
  str = str.replace(/"]\s*"/g, '", "')
  str = str.replace(/}\s*"/g, '}, "')
  str = str.replace(/]\s*"/g, '], "')
  str = str.replace(/}\s*{/g, '},{')
  str = str.replace(/]\s*{/g, '],{')
  return str
}

async function processTextWithGemini(extractedText: string) {
  const truncatedText = extractedText.substring(0, 8000) || 'No se pudo extraer texto'
  console.log('[v0] Text length:', truncatedText.length)

  const prompt = `Eres un asistente experto que extrae tareas de agendas escolares. Analiza el siguiente texto y extrae TODAS las tareas, trabajos, examenes, proyectos y actividades.

TEXTO DE LA AGENDA:
${truncatedText}

INSTRUCCIONES IMPORTANTES:
1. Busca TODAS las actividades: Homework, Classwork, Quiz, Exam, Project, Research, etc.
2. Una agenda escolar tiene: Fecha, Actividad, Objetivo, Descripcion, Materiales, Valor/Rubrica
3. La fecha debe estar en formato YYYY-MM-DD. El ano es 2026 si no se especifica.
4. Para rangos de fechas como "April 21st to 24th" o "May 4th to 8th", usa la fecha final.
5. La materia (subject) es el nombre de la clase (Computer, Math, Science, etc.)
6. El valor (value) es el porcentaje o puntos totales (ej: "5%", "Total 10%", "15%")
7. La descripcion debe incluir TODAS las instrucciones de la tarea
8. Los materiales son los items necesarios (Notebook, Computer, Glue, Scissors, etc.)

RESPONDE SOLO CON JSON VALIDO (sin markdown, sin backticks):
{"tasks":[{"title":"Nombre exacto","subject":"Materia","due_date":"YYYY-MM-DD","description":"Instrucciones completas","value":"Porcentaje total","materials":[{"name":"Material"}]}]}`

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4000, temperature: 0.2 }
      })
    })

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('[v0] Raw API response:', responseText.substring(0, 300))

    // Clean up response
    let cleanedText = responseText.trim()
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()

    // Try multiple extraction strategies
    let parsed: any = null
    
    // Strategy 1: Extract JSON array
    const arrayMatch = cleanedText.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try {
        parsed = { tasks: JSON.parse(arrayMatch[0]) }
      } catch {
        try {
          parsed = { tasks: JSON.parse(repairJSON(arrayMatch[0])) }
        } catch {}
      }
    }
    
    // Strategy 2: Extract JSON object with tasks
    if (!parsed) {
      const objMatch = cleanedText.match(/\{[\s\S]*"tasks"[\s\S]*\}/)
      if (objMatch) {
        try {
          parsed = JSON.parse(objMatch[0])
        } catch {
          try {
            parsed = JSON.parse(repairJSON(objMatch[0]))
          } catch {}
        }
      }
    }
    
    // Strategy 3: Find outermost braces
    if (!parsed) {
      const jsonStart = cleanedText.indexOf('{')
      const jsonEnd = cleanedText.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = cleanedText.substring(jsonStart, jsonEnd + 1)
        try {
          parsed = JSON.parse(jsonStr)
        } catch {
          try {
            parsed = JSON.parse(repairJSON(jsonStr))
          } catch {}
        }
      }
    }

    if (parsed && parsed.tasks && Array.isArray(parsed.tasks)) {
      const validTasks = parsed.tasks.map((task: any) => ({
        title: task.title || 'Sin título',
        subject: task.subject || null,
        due_date: task.due_date || new Date().toISOString().split('T')[0],
        description: task.description || null,
        value: task.value || null,
        materials: Array.isArray(task.materials) ? task.materials.filter((m: any) => m.name && m.name.trim()) : []
      }))
      
      console.log('[v0] Successfully parsed tasks:', validTasks.length)
      return NextResponse.json({ tasks: validTasks })
    }

    console.log('[v0] No valid JSON found in response')
    return NextResponse.json({ tasks: [] })
  } catch (error) {
    console.error('[v0] Gemini API error:', error)
    return NextResponse.json({ tasks: [] })
  }
}
