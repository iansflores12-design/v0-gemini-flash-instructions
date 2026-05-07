import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// API KEY FIJA Y MODELO ESTABLE
const GEMINI_API_KEY = 'AIzaSyBthuQfIIQ2SQJtar_uslJiGoWqAr7UeCw'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const MODEL_NAME = 'gemini-2.5-flash' // Cambiado a 1.5-flash por ser el más estable para JSON

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Función para limpiar el JSON de cualquier basura (Markdown, textos extra, etc.)
function cleanAndParseJSON(text: string) {
  try {
    // 1. Quitar bloques de código Markdown
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // 2. Buscar el primer '{' y el último '}' para ignorar texto exterior
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    
    if (start === -1 || end === -1) throw new Error("No se encontró estructura JSON");
    
    cleaned = cleaned.substring(start, end + 1);
    
    // 3. Reparar comas finales comunes en arrays
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[Limpieza JSON] Falló el parseo:", e);
    return null;
  }
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
      await supabase.from('cached_agendas').update({ 
        used_count: (data.used_count || 0) + 1,
        last_used_at: new Date().toISOString()
      }).eq('id', data.id)
      return data.tasks_json
    }
  } catch (e) {}
  return null
}

async function saveToCache(fileHash: string, fileName: string, tasks: any[], metadata: any) {
  try {
    await supabase.from('cached_agendas').upsert({
      file_hash: fileHash,
      file_name: fileName,
      tasks_json: { tasks, metadata },
      school_name: metadata.school || null,
      grade: metadata.grade || null,
      section: metadata.section || null,
      year: metadata.year || 2026,
      subject: metadata.subject || null,
    }, { onConflict: 'file_hash' })
  } catch (e) {}
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileHash = generateFileHash(buffer)

    // 1. Cache HIT
    const cached = await checkCache(fileHash)
    if (cached) return NextResponse.json({ ...cached, fromCache: true })

    const isPDF = file.name.toLowerCase().endsWith('.pdf')
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const prompt = `Analiza esta agenda escolar y extrae la información.
    IMPORTANTE: Identifica el Colegio/Escuela.
    
    Responde estrictamente con este JSON:
    {
      "metadata": { "school": "", "grade": "", "section": "", "year": 2026, "subject": "" },
      "tasks": [
        { "title": "", "subject": "", "due_date": "YYYY-MM-DD", "description": "", "value": "", "materials": [] }
      ]
    }`

    let result;
    if (isPDF) {
      result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } }
      ])
    } else {
      const docxText = (await mammoth.extractRawText({ buffer })).value
      result = await model.generateContent(`${prompt}\n\nTEXTO:\n${docxText}`)
    }

    const responseText = result.response.text()
    const parsedData = cleanAndParseJSON(responseText)

    if (parsedData && parsedData.tasks) {
      // Normalizar metadata
      if (!parsedData.metadata) parsedData.metadata = {}
      if (!parsedData.metadata.school) parsedData.metadata.school = "Institución no detectada"

      await saveToCache(fileHash, file.name, parsedData.tasks, parsedData.metadata)
      return NextResponse.json({ tasks: parsedData.tasks, metadata: parsedData.metadata })
    }

    throw new Error("No se pudo estructurar el contenido como JSON")

  } catch (error: any) {
    console.error('[v0] Error:', error)
    return NextResponse.json({ error: 'Error procesando agenda', details: error.message }, { status: 500 })
  }
}