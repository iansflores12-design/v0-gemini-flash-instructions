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
      console.error("Error al leer contenido del PDF:", err)
      return NextResponse.json({ error: 'No se pudo leer el PDF' }, { status: 500 })
    }

    if (!textContent || textContent.trim().length < 5) {
      return NextResponse.json({ error: 'El PDF parece estar vacío' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    const today = new Date().toISOString().split('T')[0]

    // Definición clara del prompt para el usuario
    const userPrompt = `Analiza esta agenda y extrae las tareas en JSON.
Contenido del documento: ${textContent.slice(0, 6000)}
Referencia de fecha hoy: ${today}`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente que extrae información de agendas escolares. 
            Responde ÚNICAMENTE con un JSON válido con este formato exacto:
            {
              "tasks": [
                {
                  "title": "Nombre de la tarea",
                  "subject": "Materia o null",
                  "due_date": "YYYY-MM-DD",
                  "materials": [{ "name": "material", "quantity": "cantidad o null" }]
                }
              ]
            }
            Reglas: Extrae todas las tareas, usa la fecha actual ${today} como referencia, y no incluyas explicaciones.`
          },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error("Error de Groq:", errorText)
      return NextResponse.json({ error: 'Error en la comunicación con la IA' }, { status: 502 })
    }

    const groqData = await groqResponse.json()
    const content = groqData.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'La IA no devolvió contenido' }, { status: 500 })
    }

    return NextResponse.json(JSON.parse(content))

  } catch (error) {
    console.error('Error general en el servidor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}