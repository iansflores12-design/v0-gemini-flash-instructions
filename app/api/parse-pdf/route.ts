import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

// Dynamically import pdf-parse to avoid test file issues
let pdf: any
try {
  pdf = require('pdf-parse/lib/pdf-parse')
} catch {
  pdf = null
}

const HF_TOKEN = process.env.HF_TOKEN || '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'
const HF_API_URL = 'https://api-inference.huggingface.co/models/HuggingFaceTB/SmolLM2-1.7B-Instruct'

async function callHFAPI(prompt: string, maxTokens: number, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(HF_API_URL, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: 0.3,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    })

    if (response.status === 503) {
      const errorData = await response.json().catch(() => ({}))
      const estimatedTime = errorData.estimated_time || 20
      console.log(`Model loading, waiting ${estimatedTime}s (attempt ${attempt}/${retries})...`)
      await new Promise(resolve => setTimeout(resolve, Math.min(estimatedTime * 1000, 30000)))
      continue
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HF API error ${response.status}: ${errorText}`)
    }

    const rawResponse = await response.text()
    let result: any
    try {
      result = JSON.parse(rawResponse)
    } catch {
      throw new Error(`HF API returned non-JSON: ${rawResponse.substring(0, 200)}`)
    }

    let reply = ''
    if (Array.isArray(result) && result[0]?.generated_text) {
      reply = result[0].generated_text
    } else if (result.generated_text) {
      reply = result.generated_text
    } else if (Array.isArray(result) && result[0]?.[0]?.generated_text) {
      reply = result[0][0].generated_text
    }

    if (!reply) {
      throw new Error(`Empty response from HF API: ${rawResponse.substring(0, 200)}`)
    }

    return reply
  }
  throw new Error('Model failed to load after retries')
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No se subio ningun archivo' }, { status: 400 })
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
      const result = await mammoth.extractRawText({ arrayBuffer })
      extractedText = result.value
    } else if (pdf) {
      const arrayBuffer = await file.arrayBuffer()
      const data = await pdf(Buffer.from(arrayBuffer))
      extractedText = data.text
    } else {
      return NextResponse.json({ 
        error: 'PDF processing not available',
        tasks: [] 
      }, { status: 500 })
    }

    // Truncate text to avoid exceeding model context window (~3000 chars for safety)
    const truncatedText = extractedText.substring(0, 2500) || 'No se pudo extraer texto'

    const prompt = `<|system|>\nAnaliza el siguiente texto de una agenda escolar y extrae las tareas en formato JSON valido. Responde SOLO con el JSON, sin explicaciones.<|end|>\n<|user|>\nTexto: ${truncatedText}\n\nResponde SOLO con JSON valido:\n{"tasks":[{"title":"Nombre de la tarea","subject":"Materia","subject_color":"#HEX","due_date":"YYYY-MM-DD","description":"Descripcion","value":"Valor","materials":[{"name":"Material","quantity":"1"}]}]}<|end|>\n<|assistant|>\n`

    const rawParseResult = await callHFAPI(prompt, 2000)
    
    let responseText = rawParseResult
      .replace(/<\|(user|assistant|system|end|stop)\|>/g, '')
      .replace(/<\/s>/g, '')
      .trim()

    const jsonMatch = responseText.match(/\{[\s\S]*"tasks"[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)
      } catch {
        // If JSON parsing fails, return empty tasks
      }
    }

    return NextResponse.json({ 
      tasks: [],
      raw: responseText 
    })

  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json({ 
      error: 'Error al procesar el archivo',
      tasks: [] 
    }, { status: 500 })
  }
}
