import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGeminiApiKey } from '@/lib/gemini'

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

    // Master Gemini API key from server env
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      console.error('[v0] Missing Gemini API key')
      return NextResponse.json(
        { error: 'La clave API de Gemini no está configurada en el servidor.' },
        { status: 500 }
      )
    }

    // Generate study tips using Gemini AI via REST API
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

    // Call Gemini API with automatic retry on rate-limit (429).
    // The free tier allows only 5 req/min per model, so we retry after
    // the delay Google specifies, then fall back to canned tips if it
    // still fails.
    const model = 'gemini-2.5-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    async function callGemini(): Promise<string> {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (res.status === 429) {
        const body = await res.json().catch(() => null)
        const retryDelay = body?.error?.details?.find(
          (d: { '@type'?: string; retryDelay?: string }) =>
            d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        )?.retryDelay
        const seconds = retryDelay ? parseInt(retryDelay) || 5 : 5
        await new Promise(r => setTimeout(r, (seconds + 1) * 1000))
        const retryRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
          }),
          signal: AbortSignal.timeout(30000),
        })
        if (!retryRes.ok) {
          const errBody = await retryRes.text().catch(() => '')
          throw new Error(`Gemini API error: ${retryRes.status} ${retryRes.statusText} - ${errBody}`)
        }
        const retryData = await retryRes.json()
        return retryData.candidates?.[0]?.content?.parts?.[0]?.text || ''
      }

      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        throw new Error(`Gemini API error: ${res.status} ${res.statusText} - ${errBody}`)
      }

      const data = await res.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }

    let tipsText: string
    try {
      tipsText = await callGemini()
    } catch (err) {
      console.error('[v0] Gemini call failed, using fallback tips:', err)
      tipsText = JSON.stringify([
        `Divide "${taskTitle}" en partes pequeñas y estudia una a la vez`,
        `Crea un mapa conceptual conectando los conceptos clave de ${subjectName}`,
        `Practica explicando "${taskTitle}" en voz alta como si le enseñaras a alguien más`,
      ])
    }

    // Parse AI response
    let tips: string[] = []
    try {
      const parsed = JSON.parse(tipsText.trim())
      tips = Array.isArray(parsed) ? parsed : [tipsText]
    } catch {
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
