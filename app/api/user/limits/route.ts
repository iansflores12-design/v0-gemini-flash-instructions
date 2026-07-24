import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFileBatchLimits } from '@/lib/limits'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limits = await getFileBatchLimits(user.id)

    return NextResponse.json(limits)
  } catch (error) {
    console.error('[v0] Error fetching user limits:', error)
    return NextResponse.json(
      { error: 'Error fetching limits' },
      { status: 500 }
    )
  }
}
