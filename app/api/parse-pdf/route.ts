import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// CONFIGURACIÓN DE MODELOS
const PRIMARY_MODEL = 'gemini-1.5-flash' 
const FALLBACK_MODEL = 'gemini-2.0-flash-001'

// USANDO LA API KEY PROPORCIONADA
const GEMINI_API_KEY = "AIzaSyAoiN0VsY3AjLhyZZg08Y9Dnp7052h8TIY"
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

async function saveToCache(fileHash: string, fileName: string, tasks: any[], metadata: any) {
  try {
    await supabase
      .from('cached_agendas')
      .upsert({
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
    console.error('[v0] Cache save error:', e)
  }
}

async function processDocumentWithGemini(
  content: { inlineData?: { mimeType: string; data: string }; text?: string },
  isPDF: boolean
) {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL]
  let lastError = null

  const prompt = `Analiza el documento y extrae la información. Es CRÍTICO identificar la INSTITUCIÓN (Colegio/Escuela) en encabezados o logos.
  
  Responde ÚNICAMENTE con un JSON válido con este formato exacto:
  {
    "metadata": {
      "school": "Nombre del Colegio (BÚSCALO BIEN)",
      "grade": "grado",
      "section": "sección",
      "year": 2026,
      "partial": null,
      "week": null,
      "subject": "materia"
    },
    "tasks": [
      {
        "title": "Nombre tarea",
        "subject": "Materia",
        "due_date": "YYYY-MM-DD",
        "description": "Instrucciones",
        "value": "valor",
        "materials": [{ "name": "material", "quantity": "1" }]
      }
    ]
  }`

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const parts: any[] = [{ text: prompt }]
      
      if (isPDF && content.inlineData) {
        parts.push({ inlineData: content.inlineData })
      } else if (content.text) {
        parts.push({ text: `TEXTO EXTRAÍDO:\n${content.text}` })
      }

      const result = await model.generateContent(parts)
      const responseText = result.response.text()
      
      let cleaned = responseText.trim()
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (err: any) {
      lastError = err
      console.warn(`[v0] El modelo ${modelName} falló:`, err.message)
      // Si es error de permisos (403), saturación (503) o cuota (429), probamos el siguiente
      if (err.status === 403 || err.status === 503 || err.status === 429) continue
      break 
    }
  }
  throw lastError || new Error("Fallo general en la API de Google")
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

    const cached = await checkCache(fileHash)
    if (cached) return NextResponse.json({ ...cached, fromCache: true })

    const fileName = file.name.toLowerCase()
    const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf'
    
    let resultJSON: any

    if (isPDF) {
      resultJSON = await processDocumentWithGemini(
        { inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } },
        true
      )
    } else if (fileName.endsWith('.docx')) {
      const docxText = (await mammoth.extractRawText({ buffer })).value
      resultJSON = await processDocumentWithGemini({ text: docxText }, false)
    } else {
      return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 })
    }

    if (resultJSON) {
      if (!resultJSON.metadata) resultJSON.metadata = {}
      if (!resultJSON.metadata.school || resultJSON.metadata.school === "") {
        resultJSON.metadata.school = "Institución no detectada";
      }

      await saveToCache(fileHash, file.name, resultJSON.tasks, resultJSON.metadata)
      
      return NextResponse.json({ 
        tasks: resultJSON.tasks, 
        metadata: resultJSON.metadata 
      })
    }

    return NextResponse.json({ error: 'Error al estructurar la agenda' }, { status: 500 })

  } catch (error: any) {
    console.error('[v0] Error Crítico:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' }, 
      { status: error.status || 500 }
    )
  }
}