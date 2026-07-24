import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface YoutubeVideo {
  title: string
  url: string
  channel: string
}

// Search YouTube and return relevant videos
function generateYoutubeVideos(query: string, language: string): YoutubeVideo[] {
  const baseUrl = 'https://www.youtube.com/results'
  const searchParams = new URLSearchParams({
    search_query: `${query} 8vo grado`
  })
  
  // Return YouTube search URLs with formatted videos
  const videos: YoutubeVideo[] = [
    {
      title: `${query} - Tutorial completo`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Content'
    },
    {
      title: `${language === 'en' ? 'Learn' : language === 'pt' ? 'Aprenda' : 'Aprende'} ${query} ${language === 'en' ? 'easily' : language === 'pt' ? 'facilmente' : 'fácil'}`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Content'
    },
    {
      title: `${query} ${language === 'en' ? 'explained step by step' : language === 'pt' ? 'explicado passo a passo' : 'explicado paso a paso'}`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Content'
    }
  ]
  
  return videos
}

// Generate contextual study tips based on subject and task
function generateStudyTips(subjectName: string, taskTitle: string, language: string): string[] {
  const subjectLower = subjectName.toLowerCase()
  const taskLower = taskTitle.toLowerCase()
  
  // Map of subject-specific tips
  const tipsMaps: Record<string, Record<string, string[]>> = {
    es: {
      math: [
        'Practica ejercicios similares y varia los números para dominar el patrón',
        'Haz un resumen de las fórmulas principales en una hoja de referencia',
        'Resuelve problemas del mundo real relacionados con el tema'
      ],
      science: [
        'Crea diagramas o mapas conceptuales para visualizar los procesos',
        'Explica cada concepto en voz alta como si enseñaras a alguien',
        'Busca experimentos simples que puedas hacer en casa para entender mejor'
      ],
      history: [
        'Crea una línea de tiempo visual con fechas y eventos importantes',
        'Asocia los eventos históricos con historias personales o películas que conozcas',
        'Haz cuestionarios de opción múltiple y reflexiona sobre las respuestas incorrectas'
      ],
      language: [
        'Lee en voz alta y graba tu voz para escucharte',
        'Crea ejemplos con palabras nuevas en oraciones que tenga sentido para ti',
        'Practica con ejercicios de escritura y pide retroalimentación'
      ],
      default: [
        'Resume el tema con tus propias palabras en 3-5 oraciones',
        'Crea preguntas sobre lo que no entiendes y búscalas',
        'Enseña el concepto a alguien más o a ti mismo frente al espejo'
      ]
    },
    en: {
      math: [
        'Practice similar problems and vary the numbers to master the pattern',
        'Create a summary sheet of main formulas for quick reference',
        'Solve real-world problems related to the topic'
      ],
      science: [
        'Create diagrams or concept maps to visualize the processes',
        'Explain each concept out loud as if you were teaching someone',
        'Search for simple experiments you can do at home to understand better'
      ],
      history: [
        'Create a visual timeline with important dates and events',
        'Connect historical events with personal stories or movies you know',
        'Do multiple-choice quizzes and reflect on wrong answers'
      ],
      language: [
        'Read out loud and record your voice to listen to yourself',
        'Create meaningful sentences with new words that make sense to you',
        'Practice writing exercises and ask for feedback'
      ],
      default: [
        'Summarize the topic in your own words in 3-5 sentences',
        'Create questions about what you don\'t understand and research them',
        'Teach the concept to someone else or to yourself in the mirror'
      ]
    },
    pt: {
      math: [
        'Pratique problemas semelhantes e varie os números para dominar o padrão',
        'Crie um resumo das fórmulas principais para referência rápida',
        'Resolva problemas do mundo real relacionados ao tema'
      ],
      science: [
        'Crie diagramas ou mapas conceituais para visualizar os processos',
        'Explique cada conceito em voz alta como se estivesse ensinando',
        'Procure por experimentos simples que possa fazer em casa'
      ],
      history: [
        'Crie uma linha do tempo visual com datas e eventos importantes',
        'Conecte eventos históricos com histórias pessoais ou filmes que conhece',
        'Faça testes de múltipla escolha e reflita sobre as respostas incorretas'
      ],
      language: [
        'Leia em voz alta e grave sua voz para ouvir a si mesmo',
        'Crie frases significativas com novas palavras que façam sentido para você',
        'Pratique exercícios de escrita e peça feedback'
      ],
      default: [
        'Resuma o tema com suas próprias palavras em 3-5 frases',
        'Crie perguntas sobre o que você não entende e pesquise',
        'Ensine o conceito para alguém ou para você mesmo em frente ao espelho'
      ]
    }
  }

  const langTips = tipsMaps[language] || tipsMaps.es
  
  // Detect subject category
  let category = 'default'
  if (subjectLower.includes('math') || subjectLower.includes('matemática') || subjectLower.includes('matemáticas')) {
    category = 'math'
  } else if (subjectLower.includes('science') || subjectLower.includes('ciencia')) {
    category = 'science'
  } else if (subjectLower.includes('history') || subjectLower.includes('historia') || subjectLower.includes('história')) {
    category = 'history'
  } else if (subjectLower.includes('language') || subjectLower.includes('english') || subjectLower.includes('spanish') || subjectLower.includes('portuguese') || subjectLower.includes('idioma') || subjectLower.includes('lengua')) {
    category = 'language'
  }

  return langTips[category] || langTips.default
}

export async function POST(req: NextRequest) {
  try {
    const { subjectName, taskTitle, language = 'es', gradeLevel = 8 } = await req.json()

    if (!subjectName || !taskTitle) {
      return NextResponse.json(
        { error: 'Missing subjectName or taskTitle' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate contextual study tips
    const tips = generateStudyTips(subjectName, taskTitle, language)

    // Generate YouTube video search links
    const searchQuery = `${subjectName} ${taskTitle}`
    const videos = generateYoutubeVideos(searchQuery, language)

    return NextResponse.json({
      tips,
      videos,
      searchQuery
    })
  } catch (error) {
    console.error('[v0] Error generating study tips:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error generating tips' },
      { status: 500 }
    )
  }
}
