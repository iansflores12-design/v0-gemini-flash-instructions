'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createSubject } from '@/lib/actions'
import { useLanguage } from '@/components/language-provider'

const COLORS = [
  '#6750A4', // Purple
  '#006874', // Teal
  '#006D3B', // Green
  '#924C25', // Orange
  '#7D5260', // Pink
  '#625B71', // Gray
]

export function AddSubjectButton() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await createSubject(name, color)
      setName('')
      setColor(COLORS[0])
      setIsOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Plus className="w-5 h-5 mr-2" />
        {t('agregarMateria')}
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-card border border-border space-y-4 animate-scale-in">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">{t('nuevaMateria')}</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Input
        placeholder={t('nombreMateria')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12 rounded-xl bg-background"
        required
      />

      <div>
        <p className="text-sm text-muted-foreground mb-2">{t('color')}</p>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-10 h-10 rounded-xl transition-all"
              style={{ 
                backgroundColor: c,
                outline: color === c ? '2px solid var(--ring)' : 'none',
                outlineOffset: '2px'
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(false)}
          className="flex-1 h-11 rounded-xl"
        >
          {t('cancelar')}
        </Button>
        <Button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('guardar')}
        </Button>
      </div>
    </form>
  )
}
