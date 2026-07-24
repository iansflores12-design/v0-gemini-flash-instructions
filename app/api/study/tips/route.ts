import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'

interface YoutubeVideo {
  title: string
  url: string
  channel: string
}

// Generate YouTube video search links
function generateYoutubeVideos(query: string): YoutubeVideo[] {
  const baseUrl = 'https://www.youtube.com/results'
  const searchParams = new URLSearchParams({
    search_query: `${query} 8vo grado educativo`
  })
  
  const videos: YoutubeVideo[] = [
    {
      title: `${query} - Tutorial completo`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Content'
    },
    {
      title: `${query} - Clase magistral`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Content'
    },
    {
      title: `${query} - Explicado paso a paso`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Content'
    }
  ]
  
  return videos
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

    // Check if API key is configured
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error('[v0] Missing GOOGLE_GENERATIVE_AI_API_KEY')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Generate study tips using Gemini AI
    const languageMap = {
      es: 'Spanish',
      en: 'English',
      pt: 'Portuguese'
    }
    
    const langName = languageMap[language as keyof typeof languageMap] || 'Spanish'

    const prompt = `Generate 3 specific and practical study tips for a ${gradeLevel}th grade student studying "${taskTitle}" in ${subjectName}.

Requirements:
- Each tip should be actionable and focused on this specific topic
- Tips should be 1-2 sentences each
- Language: ${langName}
- Focus on techniques suitable for ${gradeLevel}-${gradeLevel + 2} grade level
- Include specific strategies like practice problems, mnemonics, visual aids, real-world examples, diagrams, etc.
- Return ONLY a JSON array of 3 strings, nothing else

Example format:
["Tip 1 here", "Tip 2 here", "Tip 3 here"]`

    const { text: tipsText } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt,
      temperature: 0.7,
      maxTokens: 300
    })

    // Parse AI response
    let tips: string[] = []
    try {
      const parsed = JSON.parse(tipsText.trim())
      tips = Array.isArray(parsed) ? parsed : [tipsText]
    } catch {
      // If parsing fails, split by newlines or use as is
      tips = tipsText.split('\n').filter(t => t.trim()).slice(0, 3)
    }

    // Ensure we have exactly 3 tips
    if (tips.length < 3) {
      tips.push(`Dedica tiempo regular a estudiar "${taskTitle}"`)
      tips.push(`Busca ejemplos reales de ${subjectName}`)
      tips.push(`Practica ejercicios similares con variaciones`)
    }
    tips = tips.slice(0, 3)

    // Generate YouTube video search links
    const searchQuery = `${subjectName} ${taskTitle}`
    const videos = generateYoutubeVideos(searchQuery)

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
