import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

const HF_TOKEN = process.env.HF_TOKEN || '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'

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
    } else {
      return NextResponse.json({
        error: 'PDF processing requires OCR. Please convert to DOCX or use a different approach.',
        tasks: []
      }, { status: 400 })
    }

    const prompt = `[INST] Analiza el siguiente texto de una agenda escolar y extrae las tareas en formato JSON.
    
Texto:
${extractedText || 'No se pudo extraer texto'}

Responde SOLO con JSON valido:
{
  "tasks": [
    {
      "title": "Nombre de la tarea",
      "subject": "Materia",
      "subject_color": "#HEX",
      "due_date": "YYYY-MM-DD",
      "description": "Descripcion",
      "value": "Valor",
      "materials": [{"name": "Material", "quantity": "1"}]
    }
  ]
} [/INST]`

    const parseResponse = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 2000,
            return_full_text: false,
            temperature: 0.3,
            do_sample: true,
          }
        }),
      }
    )

    if (!parseResponse.ok) {
      const errorText = await parseResponse.text()
      console.error('HF API error:', errorText)
      return NextResponse.json({
        error: 'Error al procesar con IA',
        tasks: []
      }, { status: 500 })
    }

    const parseResult = await parseResponse.json()

    let responseText = ''
    if (Array.isArray(parseResult) && parseResult[0]?.generated_text) {
      responseText = parseResult[0].generated_text
    } else if (typeof parseResult === 'string') {
      responseText = parseResult
    }

    const jsonMatch = responseText.match(/\{[\s\S]*"tasks"[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)
      } catch {
        return NextResponse.json({ tasks: [], raw: responseText })
      }
    }

    return NextResponse.json({ tasks: [], raw: responseText })

  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json({
      error: 'Error al procesar el archivo',
      tasks: []
    }, { status: 500 })
  }
}