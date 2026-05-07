import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Configuración de Modelos para Masificación (Cascada)
// El primero es el preferido, el segundo es el respaldo estable
const PRIMARY_MODEL = 'gemini-1.5-flash' 
const FALLBACK_MODEL = 'gemini-2.0-flash-001'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// Cliente Supabase para Cache (Crucial para no gastar tokens en archivos repetidos)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

let pdf: any
try {
  pdf = require('pdf-parse/lib/pdf-parse')
} catch {
  pdf = null
}

function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

async function checkCache(fileHash: string) {
  try {
    const { data, error } = await supabase
      .from('cached_agendas')
      .select('*')
      .eq('file_hash', fileHash)
      .single()
    
    if (data && !error) {
      await supabase
        .from('cached_agendas')
        .update({ 
          used_count: (data.used_count || 0) + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', data.id)
      return data.tasks_json
    }
  } catch (e) {
    console.error('[v0] Cache error:', e)
  }
  return null
}

async function saveToCache(
  fileHash: string, 
  fileName: string,
  tasks: any[], 
  metadata: any
) {
  try {
    await supabase
      .from('cached_agendas')
      .upsert({
        file_hash: fileHash,
        file_name: fileName,
        tasks_json: { tasks, metadata }, // Guardamos metadata también
        school_name: metadata.school || 'No detectado',
        grade: metadata.grade || null,
        section: metadata.section || null,
        year: metadata.year || 2026,
        partial: metadata.partial || null,
        week_number: metadata.week || null,
        subject: metadata.subject || null,
      }, { onConflict: 'file_hash' })
  } catch (e) {
    console.error('[v0] Cache save error:', e)
  }
}

// Función principal de procesamiento con reintento y fallback de modelos
async function processDocumentWithGemini(
  content: { inlineData?: { mimeType: string; data: string }; text?: string },
  isPDF: boolean
) {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL]
  let lastError = null

  // Prompt agresivo para asegurar Metadata e Institución
  const prompt = `Eres un experto en extracción de datos escolares. Tu prioridad absoluta es identificar la INSTITUCIÓN (Colegio/Escuela).
  
  INSTRUCCIONES CRÍTICAS:
  1. Identifica el nombre de la ESCUELA/COLEGIO. Busca en logos, encabezados, pies de página o correos electrónicos. Si no hay nombre explícito, deduce uno o usa "Institución Educativa". JAMÁS lo dejes vacío.
  2. Extrae TODAS las tareas, exámenes y proyectos.
  3. Formato de fecha: YYYY-MM-DD. Año default: 2026.
  4. Metadata obligatoria: school, grade, section, year, partial, week, subject.

  RESPONDE ÚNICAMENTE CON JSON (sin markdown, sin texto):
  {
    "metadata": {
      "school": "Nombre del Colegio Encontrado",
      "grade": "ej. 7mo",
      "section": "ej. A",
      "year": 2026,
      "partial": 1,
      "week": 1,
      "subject": "Materia principal"
    },
    "tasks": [
      {
        "title": "Nombre tarea",
        "subject": "Materia",
        "due_date": "YYYY-MM-DD",
        "description": "Instrucciones",
        "value": "10%",
        "materials": [{"name": "Material", "quantity": "1"}]
      }
    ]
  }`

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const parts: any[] = [ { text: prompt } ]
      
      if (isPDF && content.inlineData) {
        parts.push({ inlineData: content.inlineData })
      } else if (content.text) {
        parts.push({ text: `TEXTO EXTRAÍDO:\n${content.text}` })
      }

      const result = await model.generateContent(parts)
      const responseText = result.response.text()
      
      // Limpieza robusta de JSON
      let cleaned = responseText.trim()
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (err: any) {
      lastError = err
      console.warn(`[v0] Modelo ${modelName} falló o está saturado. Reintentando con siguiente...`)
      // Si es error 503 o 429, continuamos al siguiente modelo
      if (err.status === 503 || err.status === 429) continue
      break 
    }
  }
  throw lastError || new Error("No se pudo procesar con ningún modelo disponible")
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: 'Archivo y userId son requeridos' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileHash = generateFileHash(buffer)

    // 1. Ver Cache (Ahorro de dinero y tiempo)
    const cached = await checkCache(fileHash)
    if (cached) return NextResponse.json({ ...cached, fromCache: true })

    const fileName = file.name.toLowerCase()
    const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf'
    
    let resultJSON: any

    if (isPDF) {
      // 2. Proceso Nativo PDF (Gemini 1.5 Flash es excelente en esto)
      resultJSON = await processDocumentWithGemini(
        { inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } },
        true
      )
    } else if (fileName.endsWith('.docx')) {
      // 3. Proceso DOCX
      const docxText = (await mammoth.extractRawText({ buffer })).value
      resultJSON = await processDocumentWithGemini({ text: docxText }, false)
    } else {
      return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 })
    }

    // Validación post-procesamiento para asegurar metadata
    if (resultJSON) {
      if (!resultJSON.metadata) resultJSON.metadata = {}
      if (!resultJSON.metadata.school || resultJSON.metadata.school.trim() === "") {
        resultJSON.metadata.school = "Institución por identificar"
      }

      await saveToCache(fileHash, file.name, resultJSON.tasks, resultJSON.metadata)
      return NextResponse.json({ tasks: resultJSON.tasks, metadata: resultJSON.metadata })
    }

    return NextResponse.json({ error: 'No se pudo estructurar la agenda' }, { status: 500 })

  } catch (error: any) {
    console.error('[v0] Error Crítico:', error)
    // Manejo de errores amigable para el usuario
    const status = error.status === 503 ? 503 : 500
    const message = status === 503 ? 'Servidores de IA saturados, reintenta en 5 segundos' : 'Error al procesar documento'
    return NextResponse.json({ error: message }, { status })
  }
}