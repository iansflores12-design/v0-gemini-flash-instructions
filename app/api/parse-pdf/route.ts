import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const GEMINI_API_KEY = 'AIzaSyBthuQfIIQ2SQJtar_uslJiGoWqAr7UeCw'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const MODEL_NAME = 'gemini-2.5-flash'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function cleanAndParseJSON(text: string) {
  try {
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error("No se encontro estructura JSON");
    cleaned = cleaned.substring(start, end + 1);
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

// Get user's institution_id from profile
async function getUserInstitution(userId: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('id', userId)
      .single()
    return data?.institution_id || null
  } catch {
    return null
  }
}

// Check cache - now filtered by institution
async function checkCache(fileHash: string, institutionId: string | null) {
  try {
    let query = supabase
      .from('cached_agendas')
      .select('*')
      .eq('file_hash', fileHash)
    
    // Only match agendas from same institution if user has one
    if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }
    
    const { data, error } = await query.single()
    
    if (data && !error) {
      await supabase.from('cached_agendas').update({ 
        used_count: (data.used_count || 0) + 1,
        last_used_at: new Date().toISOString()
      }).eq('id', data.id)
      return data.tasks_json
    }
  } catch {}
  return null
}

// Save to cache - now includes institution_id
async function saveToCache(
  fileHash: string, 
  fileName: string, 
  tasks: any[], 
  metadata: any,
  institutionId: string | null
) {
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
      institution_id: institutionId,
    }, { onConflict: 'file_hash' })
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    // Get user's institution
    const institutionId = await getUserInstitution(userId)

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileHash = generateFileHash(buffer)

    // 1. Cache HIT - filtered by institution
    const cached = await checkCache(fileHash, institutionId)
    if (cached) return NextResponse.json({ ...cached })

    const isPDF = file.name.toLowerCase().endsWith('.pdf')
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const prompt = `Analiza este documento y determina si es una AGENDA ESCOLAR.

    PASO 1: VALIDACION
    - Una agenda escolar contiene: tareas, asignaciones, fechas de entrega, materias, actividades escolares
    - Si el documento NO ES una agenda escolar (ej: factura, carta, articulo, imagen aleatoria), responde:
      { "is_agenda": false, "error": "Este documento no parece ser una agenda escolar" }
    
    PASO 2: SI ES AGENDA, extrae la informacion:
    - Identifica Colegio/Escuela, grado, seccion si aparece
    - IMPORTANTE sobre SECTION:
      * Si la agenda es UNICA para una sección específica (ej: "Sección A", "Sección 1", "A"), llena "section"
      * Si la agenda aplica a MULTIPLES secciones (ej: "ABCD", "EFG", "Todas las secciones"), DEJA "section" VACIO ("")
    - DETECTA SI ES POR PARCIAL O POR SEMANA (son excluyentes):
      * Si dice "Parcial 1, 2, 3..." o "1er, 2do, 3er parcial": usa solo "partial"
      * Si dice "Semana 1, 2, 3..." o "Week 1, 2, 3...": usa solo "week_number"
      * UNO O EL OTRO, NUNCA AMBOS
    
    Responde con este JSON:
    {
      "is_agenda": true,
      "metadata": { "school": "", "grade": "", "section": "", "year": 2026, "subject": "", "partial": null, "week_number": null },
      "tasks": [
        { "title": "", "subject": "", "due_date": "YYYY-MM-DD", "description": "", "value": "", "materials": [] }
      ]
    }
    
    - "partial" y "week_number" son numeros o null (nunca ambos a la vez)
    - "section" es vacio "" si aplica a multiples secciones, o el nombre de sección si es única
    - Si no puedes detectar, dejalo como null o ""
    - La materia (subject) es importante - intenta detectarla del contexto.`

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

    if (!parsedData) {
      throw new Error("No se pudo estructurar el contenido como JSON")
    }

    // Check if it's a valid agenda
    if (parsedData.is_agenda === false) {
      return NextResponse.json({ 
        error: parsedData.error || 'Este documento no parece ser una agenda escolar',
        isNotAgenda: true 
      }, { status: 400 })
    }

    if (parsedData.tasks && parsedData.tasks.length > 0) {
      if (!parsedData.metadata) parsedData.metadata = {}

      // Save to cache with institution
      await saveToCache(fileHash, file.name, parsedData.tasks, parsedData.metadata, institutionId)
      
      return NextResponse.json({ 
        tasks: parsedData.tasks, 
        metadata: parsedData.metadata 
      })
    }

    return NextResponse.json({ 
      error: 'No se encontraron tareas en este documento',
      tasks: [],
      metadata: parsedData.metadata || {}
    })

  } catch (error: any) {
    console.error('[v0] Error:', error)
    return NextResponse.json({ error: 'Error procesando agenda', details: error.message }, { status: 500 })
  }
}
