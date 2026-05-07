import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// API KEY PROPORCIONADA
const GEMINI_API_KEY = "AIzaSyAoiN0VsY3AjLhyZZg08Y9Dnp7052h8TIY"
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// Modelos estables de producción (Evita 404 y 503)
const STABLE_MODELS = [
  'gemini-1.5-flash-002', 
  'gemini-1.5-flash',
  'gemini-1.5-pro'
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Función de espera para Backoff Exponencial (Soluciona el error 429)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
      await supabase.from('cached_agendas').update({ 
        used_count: (data.used_count || 0) + 1,
        last_used_at: new Date().toISOString()
      }).eq('id', data.id)
      return data.tasks_json
    }
  } catch (e) {
    console.error('[v0] Cache fail:', e)
  }
  return null
}

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
    console.error('[v0] Cache save error:', e)
  }
}

async function processWithGemini(
  content: { inlineData?: { mimeType: string; data: string }; text?: string },
  isPDF: boolean
) {
  const prompt = `Analiza este documento y extrae la información de la agenda escolar.
  IDENTIFICA OBLIGATORIAMENTE EL NOMBRE DE LA INSTITUCIÓN/COLEGIO.

  Responde ÚNICAMENTE con este formato JSON:
  {
    "metadata": { "school": "Nombre", "grade": "grado", "section": "sección", "year": 2026, "subject": "materia" },
    "tasks": [
      { "title": "Nombre", "subject": "Materia", "due_date": "YYYY-MM-DD", "description": "instrucciones", "value": "puntos", "materials": [] }
    ]
  }`

  let lastError = null
  const retryDelays = [1000, 2000, 4000] // Reintentos en milisegundos

  for (const modelName of STABLE_MODELS) {
    for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const parts: any[] = [{ text: prompt }]
        
        if (isPDF && content.inlineData) {
          parts.push({ inlineData: content.inlineData })
        } else if (content.text) {
          parts.push({ text: `TEXTO DEL DOC:\n${content.text}` })
        }

        const result = await model.generateContent(parts)
        const responseText = result.response.text()
        
        // Extracción limpia del JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.tasks) return parsed
        }
      } catch (err: any) {
        lastError = err
        console.warn(`[v0] Intento ${attempt} con ${modelName} falló: ${err.message}`)
        
        // Si el error es 429 (Cuota), esperamos y reintentamos con el mismo modelo
        if (err.status === 429 && attempt < retryDelays.length) {
          await sleep(retryDelays[attempt])
          continue
        }
        // Si es otro tipo de error o se agotaron reintentos, pasamos al siguiente modelo de la lista
        break 
      }
    }
  }
  throw lastError || new Error("IA Exhausta")
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    const userId = formData.get('userId') as string | null

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileHash = generateFileHash(buffer)

    const cached = await checkCache(fileHash)
    if (cached) return NextResponse.json({ ...cached, fromCache: true })

    const fileName = file.name.toLowerCase()
    const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf'
    
    let resultJSON: any

    try {
      if (isPDF) {
        resultJSON = await processWithGemini(
          { inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } },
          true
        )
      } else if (fileName.endsWith('.docx')) {
        const docxText = (await mammoth.extractRawText({ buffer })).value
        resultJSON = await processWithGemini({ text: docxText }, false)
      }
    } catch (primaryError) {
      console.error('[v0] Fallo procesamiento nativo, intentando fallback de texto...')
      // Si falla el envío de archivo, intentamos extraer texto manualmente como último recurso
      let textFallback = ""
      if (isPDF) {
        try {
          const pdfParse = require('pdf-parse/lib/pdf-parse')
          const data = await pdfParse(buffer)
          textFallback = data.text
        } catch (e) { textFallback = "Error extrayendo texto" }
      }
      resultJSON = await processWithGemini({ text: textFallback }, false)
    }

    if (resultJSON) {
      resultJSON.metadata = resultJSON.metadata || {}
      if (!resultJSON.metadata.school) resultJSON.metadata.school = "Institución"
      
      await saveToCache(fileHash, file.name, resultJSON.tasks, resultJSON.metadata)
      return NextResponse.json({ tasks: resultJSON.tasks, metadata: resultJSON.metadata })
    }

    return NextResponse.json({ error: 'Parsing failed' }, { status: 500 })

  } catch (error: any) {
    console.error('[v0] Fatal:', error)
    return NextResponse.json({ error: 'Servidores saturados. Reintenta ahora.' }, { status: 503 })
  }
}