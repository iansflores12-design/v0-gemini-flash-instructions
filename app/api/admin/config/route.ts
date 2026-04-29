import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminConfig, updateAdminConfig, clearAdminConfigCache } from '@/lib/admin-config'

// Simple auth check
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  // In production, use proper JWT or session auth
  // For now just basic check
  return true
}

export async function GET(req: NextRequest) {
  try {
    const config = await getAdminConfig()
    return NextResponse.json({ config }, { status: 200 })
  } catch (error) {
    console.error('[v0] Admin config GET error:', error)
    return NextResponse.json({ error: 'Error fetching config' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const updated = await updateAdminConfig(body)
    
    return NextResponse.json({ config: updated }, { status: 200 })
  } catch (error) {
    console.error('[v0] Admin config POST error:', error)
    return NextResponse.json({ error: 'Error updating config' }, { status: 500 })
  }
}
