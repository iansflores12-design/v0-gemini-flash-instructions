import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

const HF_TOKEN = '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'

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
      // Extract text from DOCX using mammoth
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      extractedText = result.value
    } else {
      // For PDF, we'll use Hugging Face's document-question-answering
      // First convert to base64
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      
      // Use a text extraction approach with HF
      const extractResponse = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/layoutlmv3-base',
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: base64,
            parameters: { return_full_text: true }
          }),
        }
      )
      
      if (extractResponse.ok) {
        const extractResult = await extractResponse.json()
        extractedText = typeof extractResult === 'string' ? extractResult : JSON.stringify(extractResult)
      }
    }

    // Now use a text generation model to parse the agenda
    const prompt = `Analiza el siguiente texto de una agenda escolar y extrae las tareas en formato JSON.
    
Texto de la agenda:
${extractedText || 'No se pudo extraer texto del documento'}

Responde SOLO con un JSON valido con esta estructura exacta:
{
  "tasks": [
    {
      "title": "Nombre de la tarea",
      "subject": "Nombre de la materia",
      "subject_color": "#HEX color sugerido para la materia",
      "due_date": "YYYY-MM-DD",
      "description": "Descripcion de la tarea",
      "value": "Valor o porcentaje si se menciona",
      "materials": [
        { "name": "Material 1", "quantity": "cantidad" }
      ]
    }
  ]
}

Asigna un color unico a cada materia (usa colores vibrantes como #6750A4, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #98D8C8).
Si no hay informacion clara, devuelve un array vacio.`

    const parseResponse = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
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
            temperature: 0.3
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
    
    // Extract JSON from the response
    let responseText = ''
    if (Array.isArray(parseResult) && parseResult[0]?.generated_text) {
      responseText = parseResult[0].generated_text
    } else if (typeof parseResult === 'string') {
      responseText = parseResult
    } else {
      responseText = JSON.stringify(parseResult)
    }

    // Try to extract JSON from the response
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
