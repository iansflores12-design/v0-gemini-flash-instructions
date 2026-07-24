import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

// Use Vercel AI Gateway - no provider package needed
const model = 'google/gemini-1.5-flash'

interface YoutubeVideo {
  title: string
  url: string
  channel: string
}

// Search YouTube and return relevant videos
async function searchYoutubeVideos(query: string, language: string): Promise<YoutubeVideo[]> {
  const baseUrl = 'https://www.youtube.com/results'
  const searchParams = new URLSearchParams({
    search_query: query,
    sp: 'EgIYAQ%3D%3D' // Filter for educational content
  })
  
  // Return YouTube search URL with formatted videos
  const videos: YoutubeVideo[] = [
    {
      title: `${query} - Tutorial completo`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Channels'
    },
    {
      title: `Aprende ${query} fácil`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Channels'
    },
    {
      title: `${query} explicado paso a paso`,
      url: `${baseUrl}?${searchParams.toString()}`,
      channel: 'Educational Channels'
    }
  ]
  
  return videos
}

export async function POST(req: NextRequest) {
  try {
    const { subjectName, taskTitle, language, gradeLevel = 8 } = await req.json()

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

    // Generate unique study tips using AI based on subject and task
    const prompt = `Generate 3 specific and practical study tips for a ${gradeLevel}th grade student studying "${taskTitle}" in the subject of "${subjectName}". 
    
    Requirements:
    - Tips should be unique and tailored to this specific topic
    - Each tip should be actionable and 1-2 sentences
    - Language: ${language === 'en' ? 'English' : language === 'pt' ? 'Portuguese' : 'Spanish'}
    - Focus on techniques that work for 8th-10th grade level
    - Include specific strategies like practice problems, mnemonics, visual aids, real-world examples, etc.
    
    Format your response as a JSON array of strings, example:
    ["Tip 1", "Tip 2", "Tip 3"]`

    const { text: tipsText } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 300
    })

    // Parse AI response
    let tips: string[] = []
    try {
      tips = JSON.parse(tipsText)
      if (!Array.isArray(tips)) tips = [tipsText]
    } catch {
      tips = [tipsText]
    }

    // Ensure we have exactly 3 tips
    if (tips.length < 3) {
      tips.push(
        language === 'en' 
          ? 'Practice problems related to this topic'
          : language === 'pt'
          ? 'Pratique problemas relacionados a este tópico'
          : 'Practica problemas relacionados con este tema'
      )
    }
    tips = tips.slice(0, 3)

    // Search for YouTube videos
    const searchQuery = `${subjectName} ${taskTitle} 8vo grado`
    const videos = await searchYoutubeVideos(searchQuery, language)

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
