import { cookies } from 'next/headers'
import type { Language } from '@/lib/i18n'

export type LocalizedText = {
  es: string
  en: string
  pt: string
}

export function pickLocalized(language: Language, text: LocalizedText): string {
  return text[language] ?? text.es
}

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('cleargrade-language')?.value
  if (lang === 'en' || lang === 'pt' || lang === 'es') return lang
  return 'es'
}
