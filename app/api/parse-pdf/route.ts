import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
    }

    // Convertimos el archivo a un Buffer para enviarlo a la API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Usamos un modelo de Document QA que acepta archivos directamente
    // 'impira/layoutlm-document-qa' es excelente para formularios y tablas
    const model = "impira/layoutlm-document-qa";

    // Como queremos extraer múltiples datos (tareas, fechas, materiales),
    // haremos una pregunta estructurada.
    const prompt = "¿Cuáles son las tareas, fechas de entrega y materiales de esta agenda? Responde solo en formato JSON con la estructura {tasks: [{title, due_date, materials}]}";

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            image: buffer.toString('base64'), // El modelo acepta base64
            question: prompt
          }
        }),
      }
    );

    const result = await response.json();

    // Lógica de limpieza: Hugging Face a veces devuelve un array o texto plano
    // Intentamos extraer el JSON de la respuesta del modelo
    if (result && result.answer) {
      try {
        // Si el modelo devuelve el JSON como string, lo parseamos
        const cleanData = JSON.parse(result.answer);
        return NextResponse.json(cleanData);
      } catch (e) {
        // Si no es un JSON válido, devolvemos la respuesta cruda para debug
        return NextResponse.json({ raw: result.answer });
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ error: "Error al procesar la agenda" }, { status: 500 });
  }
}