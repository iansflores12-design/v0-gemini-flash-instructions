/**
 * Returns the server-level Gemini API key (master key) from env vars.
 * Users do NOT provide their own key — a single shared key is used.
 */
export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || null
}
