import { NextResponse } from 'next/server'
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
      const pdfDoc = await pdf(pdfBuffer)
      textContent = pdfDoc.text
    } catch (err) {
      console.error("Error al leer el PDF:", err)
      return NextResponse.json({ error: 'No se pudo leer el contenido del PDF' }, { status: 500 })
    }

    const apiKey = process.env.GROQ_API_KEY
    const today = new Date().toISOString().split('T')[0]

    const prompt = `Analiza este documento de una agenda escolar o lista de tareas y extrae la información estructurada.

Contenido del documento:
${textContent.slice(0, 7000)}

Responde ÚNICAMENTE con un JSON válido con este formato exacto:
{
  "tasks": [
    {
      "title": "Nombre de la tarea",
      "subject": "Nombre de la materia si se menciona o null",
      "due_date": "YYYY-MM-DD (usa la fecha actual ${today} como referencia para fechas relativas)",
      "materials": [
        { "name": "nombre del material", "quantity": "cantidad si se especifica o null" }
      ]
    }
  ]
}

Reglas:
- Extrae TODAS las tareas mencionadas.
- Los materiales incluyen libros, cuadernos, hojas, colores, cartulinas, etc.
- Si no hay materiales mencionados, deja el array vacío [].
- Responde SOLO con el JSON puro.`

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
      return NextResponse.json({ error: 'Error de autenticación con la IA' }, { status: 401 })
    }

    const groqData = await groqResponse.json()
    const content = groqData.choices[0]?.message?.content

    return NextResponse.json(JSON.parse(content))

  } catch (error) {
    console.error('Error general:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}