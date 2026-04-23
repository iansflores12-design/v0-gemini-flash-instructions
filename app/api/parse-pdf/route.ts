import { NextResponse } from 'next/server'
// @ts-ignore
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

    let textContent = ""
    try {
      // Uso de la librería de forma directa para evitar errores de módulos
      const pdfDoc = await pdf(pdfBuffer)
      textContent = pdfDoc.text
    } catch (err) {
      console.error("Error al leer el PDF:", err)
      return NextResponse.json({ error: 'No se pudo leer el contenido del PDF' }, { status: 500 })
    }

    if (!textContent || textContent.trim().length < 5) {
      return NextResponse.json({ error: 'El PDF parece estar vacío' }, { status: 400 })
    }

    const apiKey = process.env.API_KEY
    const today = new Date().toISOString().split('T')[0]

    const prompt = `Analiza este documento de una agenda escolar y extrae la información estructurada.
Contenido: ${textContent.slice(0, 7000)}

Responde ÚNICAMENTE con un JSON válido con este formato:
{
  "tasks": [
    {
      "title": "Nombre de la tarea",
      "subject": "Materia o null",
      "due_date": "YYYY-MM-DD (Referencia hoy: ${today})",
      "materials": [
        { "name": "nombre del material", "quantity": "cantidad o null" }
      ]
    }
  ]
}

Reglas:
- Extrae TODAS las tareas mencionadas.
- Los materiales incluyen libros, cuadernos, útiles, cartulinas, etc.
- Si no hay materiales, deja el array vacío [].
- Responde SOLO con el JSON puro, sin explicaciones ni bloques de código.`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Eres un asistente experto en extraer datos escolares y responder solo en JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error("Error de Groq:", errorText)
      return NextResponse.json({ error: 'Error de autenticación o cuota con la IA' }, { status: 401 })
    }

    const groqData = await groqResponse.json()
    const content = groqData.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'La IA no devolvió resultados' }, { status: 500 })
    }

    return NextResponse.json(JSON.parse(content))

  } catch (error) {
    console.error('Error general en el servidor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}