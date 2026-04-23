import { NextResponse } from 'next/server'
// Usar una versión que no dependa de archivos del sistema para evitar errores en Vercel
import pdf from 'pdf-parse/lib/pdf-parse.js'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File | null

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Proporciona un archivo PDF válido' }, { status: 400 })
    }

    const pdfData = await file.arrayBuffer()
    const pdfBuffer = Buffer.from(pdfData)

    // Extracción de texto más estable
    let textContent = ""
    try {
      const pdfDoc = await pdf(pdfBuffer)
      textContent = pdfDoc.text
    } catch (err) {
      console.error("Error al leer contenido del PDF:", err)
      return NextResponse.json({ error: 'No se pudo leer el PDF' }, { status: 500 })
    }

    if (!textContent || textContent.trim().length < 5) {
      return NextResponse.json({ error: 'El PDF parece estar vacío o protegido' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Configuración de IA faltante' }, { status: 500 })
    }

    // Fecha actual para el prompt
    const today = new Date().toISOString().split('T')[0]

    const prompt = `Analiza esta agenda escolar y extrae las tareas.
Contenido: ${textContent.slice(0, 6000)}

Genera un JSON con este formato:
{
  "tasks": [
    {
      "title": "string",
      "subject": "string o null",
      "due_date": "YYYY-MM-DD (Referencia hoy: ${today})",
      "materials": [{ "name": "string", "quantity": "string o null" }]
    }
  ]
}`

    const groqResponse = await fetch('[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Eres un extractor de datos escolares que solo responde en JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        // Esto garantiza que la respuesta sea un objeto JSON directo
        response_format: { type: 'json_object' }
      })
    })

    const groqData = await groqResponse.json()
    const content = groqData.choices[0]?.message?.content

    if (!content) {
      throw new Error("Respuesta vacía de Groq")
    }

    // No necesitas limpiar backticks si usas json_object mode, solo parsear
    const parsed = JSON.parse(content)
    return NextResponse.json(parsed)

  } catch (error) {
    console.error('Error general en el servidor:', error)
    return NextResponse.json(
      { error: 'Error interno al procesar la agenda.' },
      { status: 500 }
    )
  }
}