'use client'

import { Globe } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const languages = [
    { code: 'es' as const, name: 'Español' },
    { code: 'en' as const, name: 'English' },
    { code: 'pt' as const, name: 'Português' },
  ]

  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-muted/80 border border-border/60 shadow-sm">
      <Globe className="w-4 h-4 text-muted-foreground ml-2" />
      <div className="flex gap-0.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
              language === lang.code
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={lang.name}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
