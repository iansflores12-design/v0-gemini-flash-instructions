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

// Transform written grades to numbers (decimo -> 10, octavo -> 8, etc.)
function normalizeGrade(grade: string | null | undefined): string {
  if (!grade) return ''
  
  const gradeMap: Record<string, string> = {
    'primero': '1', 'primer': '1', '1ro': '1', '1er': '1',
    'segundo': '2', '2do': '2',
    'tercero': '3', 'tercer': '3', '3ro': '3', '3er': '3',
    'cuarto': '4', '4to': '4',
    'quinto': '5', '5to': '5',
    'sexto': '6', '6to': '6',
    'septimo': '7', 'séptimo': '7', '7mo': '7',
    'octavo': '8', '8vo': '8',
    'noveno': '9', '9no': '9',
    'decimo': '10', 'décimo': '10', '10mo': '10',
    'undecimo': '11', 'undécimo': '11', 'onceavo': '11', '11vo': '11',
    'duodecimo': '12', 'duodécimo': '12', 'doceavo': '12', '12vo': '12',
  }
  
  const normalized = grade.toLowerCase().trim()
  
  // Check if it's already a number
  if (/^\d+$/.test(normalized)) return normalized
  
  // Check for exact match first
  if (gradeMap[normalized]) return gradeMap[normalized]
  
  // Check if the grade contains a written number
  for (const [written, num] of Object.entries(gradeMap)) {
    if (normalized.includes(written)) {
      // Replace the written part with number, keep the rest (like "grado", "año", etc.)
      return normalized.replace(written, num).replace(/\s+/g, ' ').trim()
    }
  }
  
  return grade
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

    // Get user's institution - NOW REQUIRED
    const institutionId = await getUserInstitution(userId)
    
    if (!institutionId) {
      return NextResponse.json({ 
        error: 'Debes seleccionar una institución en Configuración antes de subir agendas',
        requiresInstitution: true 
      }, { status: 400 })
    }

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
    
    - **PARCIAL ES OBLIGATORIO**: Las agendas escolares SIEMPRE están organizadas por parciales.
      * Busca: "Parcial 1, 2, 3...", "1er, 2do, 3er parcial", "Primer parcial", "P1, P2, P3", etc.
      * Si NO encuentras el parcial explícito, INFIERE basándote en las fechas:
        - Parcial 1: Enero - Abril
        - Parcial 2: Mayo - Agosto  
        - Parcial 3: Septiembre - Diciembre
      * El campo "partial" NUNCA puede ser null - siempre debe ser 1, 2 o 3
    
    Responde con este JSON:
    {
      "is_agenda": true,
      "metadata": { "school": "", "grade": "", "section": "", "year": 2026, "subject": "", "partial": 1 },
      "tasks": [
        { "title": "", "subject": "", "due_date": "YYYY-MM-DD", "description": "", "value": "", "materials": [] }
      ]
    }
    
    REGLAS IMPORTANTES:
    - "partial" es OBLIGATORIO (1, 2 o 3) - NUNCA null
    - "section" es vacio "" si aplica a multiples secciones, o el nombre de sección si es única
    - Si no puedes detectar otros campos, dejalo como null o ""
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
      
      // Ensure partial is always set (default to inferring from current date)
      if (!parsedData.metadata.partial) {
        const month = new Date().getMonth() + 1
        if (month >= 1 && month <= 4) parsedData.metadata.partial = 1
        else if (month >= 5 && month <= 8) parsedData.metadata.partial = 2
        else parsedData.metadata.partial = 3
      }
      
      // Normalize grade (decimo -> 10, octavo -> 8, etc.)
      if (parsedData.metadata.grade) {
        parsedData.metadata.grade = normalizeGrade(parsedData.metadata.grade)
      }

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
