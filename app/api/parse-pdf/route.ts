import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// CONFIGURACIÓN DE ESTABILIDAD
// Usamos modelos de producción para evitar errores 404/503 de versiones "preview" o "lite"
const MODEL_PRIORITY = [
  'gemini-1.5-flash-002', // El más rápido y estable actualmente
  'gemini-1.5-flash',     // Alias general
  'gemini-2.0-flash-001'  // Backup de nueva generación
]

const GEMINI_API_KEY = "AIzaSyAoiN0VsY3AjLhyZZg08Y9Dnp7052h8TIY"
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Genera un hash único para el archivo para evitar procesar lo mismo dos veces
 */
function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/**
 * Busca en la base de datos si ya procesamos este archivo antes
 */
async function checkCache(fileHash: string) {
  try {
    const { data, error } = await supabase
      .from('cached_agendas')
      .select('*')
      .eq('file_hash', fileHash)
      .single()
    
    if (data && !error) {
      await supabase.from('cached_agendas').update({ 
        used_count: (data.used_count || 0) + 1,
        last_used_at: new Date().toISOString()
      }).eq('id', data.id)
      return data.tasks_json
    }
  } catch (e) {
    console.error('[v0] Error en caché:', e)
  }
  return null
}

/**
 * Guarda el resultado exitoso en caché
 */
async function saveToCache(fileHash: string, fileName: string, tasks: any[], metadata: any) {
  try {
    await supabase.from('cached_agendas').upsert({
      file_hash: fileHash,
      file_name: fileName,
      tasks_json: { tasks, metadata },
      school_name: metadata.school || 'No detectado',
      grade: metadata.grade || null,
      section: metadata.section || null,
      year: metadata.year || 2026,
      subject: metadata.subject || null,
    }, { onConflict: 'file_hash' })
  } catch (e) {
    console.error('[v0] Error guardando en caché:', e)
  }
}

/**
 * Lógica principal de procesamiento con reintentos y limpieza de JSON
 */
async function processWithGemini(
  content: { inlineData?: { mimeType: string; data: string }; text?: string },
  isPDF: boolean
) {
  const prompt = `Analiza este documento de agenda escolar y extrae TODAS las tareas, exámenes y proyectos.
  Es OBLIGATORIO identificar el nombre del Colegio/Escuela en logos o encabezados.

  Responde ÚNICAMENTE con un JSON válido con este formato:
  {
    "metadata": {
      "school": "Nombre del Colegio",
      "grade": "Grado",
      "section": "Sección",
      "year": 2026,
      "partial": null,
      "week": null,
      "subject": "Materia principal"
    },
    "tasks": [
      {
        "title": "Nombre de la tarea",
        "subject": "Materia",
        "due_date": "YYYY-MM-DD",
        "description": "Instrucciones detalladas",
        "value": "Puntos o %",
        "materials": [{ "name": "Material", "quantity": "1" }]
      }
    ]
  }`

  let lastError = null

  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const parts: any[] = [{ text: prompt }]
      
      if (isPDF && content.inlineData) {
        parts.push({ inlineData: content.inlineData })
      } else if (content.text) {
        parts.push({ text: `CONTENIDO DEL DOCUMENTO:\n${content.text}` })
      }

      const result = await model.generateContent(parts)
      const responseText = result.response.text()
      
      // Limpieza agresiva de la respuesta para obtener solo el JSON
      let cleaned = responseText.trim()
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        // Validar que tenga la estructura mínima que espera tu sitio
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          return parsed
        }
      }
    } catch (err: any) {
      console.warn(`[v0] Falló modelo ${modelName}:`, err.message)
      lastError = err
      // Si es error de cuota o saturación, intentamos el siguiente modelo
      if (err.status === 429 || err.status === 503 || err.status === 504 || err.status === 404) continue
      break 
    }
  }
  throw lastError || new Error("La IA no pudo generar una respuesta válida")
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: 'Archivo y userId son obligatorios' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileHash = generateFileHash(buffer)

    // 1. Intentar obtener de caché (Respuesta instantánea)
    const cached = await checkCache(fileHash)
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true })
    }

    const fileName = file.name.toLowerCase()
    const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf'
    
    let resultJSON: any

    if (isPDF) {
      // Uso de soporte nativo de PDF (Gemini Multimodal) - Mucho más inteligente
      resultJSON = await processWithGemini(
        { inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } },
        true
      )
    } else if (fileName.endsWith('.docx')) {
      const docxText = (await mammoth.extractRawText({ buffer })).value
      resultJSON = await processWithGemini({ text: docxText }, false)
    } else {
      return NextResponse.json({ error: 'Solo PDF o DOCX' }, { status: 400 })
    }

    if (resultJSON) {
      // Asegurar que metadata no sea nula para evitar errores en el frontend
      resultJSON.metadata = resultJSON.metadata || {}
      if (!resultJSON.metadata.school) resultJSON.metadata.school = "Institución no detectada"

      // Guardar en caché para la próxima vez
      await saveToCache(fileHash, file.name, resultJSON.tasks, resultJSON.metadata)
      
      // Retornar el formato exacto que tu sitio ya entiende
      return NextResponse.json({ 
        tasks: resultJSON.tasks, 
        metadata: resultJSON.metadata 
      })
    }

    return NextResponse.json({ error: 'No se pudo extraer la información' }, { status: 500 })

  } catch (error: any) {
    console.error('[v0] Error Crítico en API:', error)
    return NextResponse.json(
      { error: 'Servidores de IA ocupados. Intenta de nuevo en 5 segundos.' }, 
      { status: 503 }
    )
  }
}