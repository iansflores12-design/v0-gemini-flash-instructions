import { createClient } from '@/lib/supabase/server'
import { AdminConfig } from '@/lib/types'

// Cache for admin config (5 minute TTL)
let configCache: { data: AdminConfig | null; timestamp: number } = { data: null, timestamp: 0 }

export async function getAdminConfig(): Promise<AdminConfig | null> {
  const now = Date.now()
  
  // Return cached config if still valid
  if (configCache.data && now - configCache.timestamp < 5 * 60 * 1000) {
    return configCache.data
  }

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('admin_config')
      .select('*')
      .single()

    if (data) {
      configCache = { data, timestamp: now }
    }
    return data || null
  } catch (error) {
    console.error('[v0] Error fetching admin config:', error)
    return null
  }
}

export async function updateAdminConfig(updates: Partial<AdminConfig>): Promise<AdminConfig | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('admin_config')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'default')
      .select()
      .single()

    // Clear cache
    configCache = { data: null, timestamp: 0 }
    
    return data || null
  } catch (error) {
    console.error('[v0] Error updating admin config:', error)
    return null
  }
}

export function clearAdminConfigCache() {
  configCache = { data: null, timestamp: 0 }
}
