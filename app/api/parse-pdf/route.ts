import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const GEMINI_API_KEY = 'AIzaSyBthuQfIIQ2SQJtar_uslJiGoWqAr7UeCw'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// Supabase client for cache
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Dynamically import pdf-parse
let pdf: any
try {
  pdf = require('pdf-parse/lib/pdf-parse')
} catch {
  pdf = null
}

// Generate hash of file content
function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

// Check cache for existing processed agenda
async function checkCache(fileHash: string) {
  try {
    const { data, error } = await supabase
      .from('cached_agendas')
      .select('*')
      .eq('file_hash', fileHash)
      .single()
    
    if (data && !error) {
      // Update usage stats
      await supabase
        .from('cached_agendas')
        .update({ 
          used_count: (data.used_count || 0) + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', data.id)
      
      console.log('[v0] Cache HIT - returning cached agenda')
      return data.tasks_json
    }
  } catch (e) {
    console.log('[v0] Cache check error:', e)
  }
  return null
}

// Save to cache with metadata extracted by AI
async function saveToCache(
  fileHash: string, 
  fileName: string,
  tasks: any[], 
  metadata: { school?: string; grade?: string; section?: string; year?: number; partial?: number; week?: number; subject?: string }
) {
  try {
    await supabase
      .from('cached_agendas')
      .upsert({
        file_hash: fileHash,
        file_name: fileName,
        tasks_json: { tasks },
        school_name: metadata.school || null,
        grade: metadata.grade || null,
        section: metadata.section || null,
        year: metadata.year || null,
        partial: metadata.partial || null,
        week_number: metadata.week || null,
        subject: metadata.subject || null,
      }, { onConflict: 'file_hash' })
    
    console.log('[v0] Agenda cached successfully')
  } catch (e) {
    console.log('[v0] Cache save error:', e)
  }
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

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileHash = generateFileHash(buffer)

    // Check cache first
    const cachedResult = await checkCache(fileHash)
    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, fromCache: true })
    }

    // For PDFs, use Gemini's native PDF support
    if (isPDF) {
      try {
        const base64PDF = buffer.toString('base64')
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

ADEMAS, extrae la siguiente METADATA del documento (busca en encabezados, titulos, etc.):
- school: Nombre del colegio/escuela
- grade: Grado (ej: "7mo", "8vo", "9no", "10mo")
- section: Seccion (ej: "A", "B", "C")
- year: Año escolar (ej: 2026)
- partial: Numero de parcial (1, 2, 3, 4)
- week: Numero de semana si aplica (ej: 1, 2, 3)
- subject: Materia principal del documento

RESPONDE SOLO CON JSON VALIDO (sin explicaciones, sin markdown):
{"metadata":{"school":"","grade":"","section":"","year":2026,"partial":null,"week":null,"subject":""},"tasks":[{"title":"Nombre exacto de la actividad","subject":"Nombre de la materia","due_date":"YYYY-MM-DD","description":"Instrucciones completas","value":"Porcentaje o puntos totales","materials":[{"name":"Material","quantity":"1"}]}]}`

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
              // Save to cache with metadata
              const meta = parsed.metadata || {}
              await saveToCache(fileHash, file.name, parsed.tasks, {
                school: meta.school,
                grade: meta.grade,
                section: meta.section,
                year: meta.year,
                partial: meta.partial,
                week: meta.week,
                subject: meta.subject
              })
              
              return NextResponse.json({ tasks: parsed.tasks })
            }
          } catch (e) {
            console.error('[v0] JSON parse error:', e)
          }
        }

        // If Gemini didn't return valid JSON, try fallback
        if (pdf) {
          const data = await pdf(buffer)
          return await processTextWithGemini(data.text, fileHash, file.name)
        }

        return NextResponse.json({ tasks: [], raw: responseText })
      } catch (error) {
        console.error('[v0] Gemini PDF error:', error)
        // Fall through to pdf-parse if available
      }
    }

    // For DOCX files
    if (isDOCX) {
      const result = await mammoth.extractRawText({ buffer })
      return await processTextWithGemini(result.value, fileHash, file.name)
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

async function processTextWithGemini(extractedText: string, fileHash: string, fileName: string) {
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

ADEMAS, extrae la siguiente METADATA del documento:
- school: Nombre del colegio/escuela
- grade: Grado (ej: "7mo", "8vo", "9no")
- section: Seccion (ej: "A", "B", "C")
- year: Año escolar (2026)
- partial: Numero de parcial (1, 2, 3, 4)
- week: Numero de semana si aplica
- subject: Materia principal

RESPONDE SOLO CON JSON VALIDO (sin markdown, sin backticks):
{"metadata":{"school":"","grade":"","section":"","year":2026,"partial":null,"week":null,"subject":""},"tasks":[{"title":"Nombre exacto","subject":"Materia","due_date":"YYYY-MM-DD","description":"Instrucciones completas","value":"Porcentaje total","materials":[{"name":"Material"}]}]}`

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
    
    // Strategy 1: Extract JSON object with tasks
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
    
    // Strategy 2: Extract JSON array
    if (!parsed) {
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
      
      // Save to cache with metadata
      const meta = parsed.metadata || {}
      await saveToCache(fileHash, fileName, validTasks, {
        school: meta.school,
        grade: meta.grade,
        section: meta.section,
        year: meta.year,
        partial: meta.partial,
        week: meta.week,
        subject: meta.subject
      })
      
      console.log('[v0] Successfully parsed and cached tasks:', validTasks.length)
      return NextResponse.json({ tasks: validTasks })
    }

    console.log('[v0] No valid JSON found in response')
    return NextResponse.json({ tasks: [] })
  } catch (error) {
    console.error('[v0] Gemini API error:', error)
    return NextResponse.json({ tasks: [] })
  }
}
