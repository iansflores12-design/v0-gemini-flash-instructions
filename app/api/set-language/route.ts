import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json()

    if (!['es', 'en', 'pt'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('cleargrade-language', language, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true, language })
  } catch (error) {
    console.error('[v0] Error setting language:', error)
    return NextResponse.json(
      { error: 'Failed to set language' },
      { status: 500 }
    )
  }
}
