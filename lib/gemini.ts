import { createClient } from '@/lib/supabase/server'

/**
 * Resolves the Gemini API key to use for a request.
 *
 * Priority:
 *  1. The authenticated user's profile key (profiles.gemini_api_key) — the
 *     BYOK flow set up in the settings page.
 *  2. The GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY env var as a
 *     server-level fallback.
 *
 * Returns the key string, or null when neither is available.
 */
export async function getGeminiApiKey(): Promise<string | null> {
  // 1. Try the authenticated user's stored key
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gemini_api_key')
        .eq('id', user.id)
        .single()
      if (profile?.gemini_api_key) {
        return profile.gemini_api_key
      }
    }
  } catch {
    // fall through to env var
  }

  // 2. Server-level fallback
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || null
}

/**
 * Same as getGeminiApiKey but accepts an explicit userId — used by routes
 * that receive the userId via form data instead of the auth session
 * (e.g. parse-pdf).
 */
export async function getGeminiApiKeyForUser(userId: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('gemini_api_key')
      .eq('id', userId)
      .single()
    if (profile?.gemini_api_key) {
      return profile.gemini_api_key
    }
  } catch {
    // fall through to env var
  }

  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || null
}
