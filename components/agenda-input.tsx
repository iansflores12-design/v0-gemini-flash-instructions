'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Plus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createTaskWithMaterials } from '@/lib/actions'
import type { Subject, ParsedAgendaItem } from '@/lib/types'

interface AgendaInputProps {
  subjects: Subject[]
}

export function AgendaInput({ subjects }: AgendaInputProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsedTasks, setParsedTasks] = useState<ParsedAgendaItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParse = async () => {
    if (!text.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/parse-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      if (!response.ok) {
        throw new Error('Error al procesar el texto')
      }
      
      const data = await response.json()
      setParsedTasks(data.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      for (const task of parsedTasks) {
        await createTaskWithMaterials(
          task.title,
          task.due_date,
          task.subject || undefined,
          task.materials || []
        )
      }
      setText('')
      setParsedTasks([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const removeTask = (index: number) => {
    setParsedTasks(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Procesar agenda</h2>
      </div>

      {parsedTasks.length === 0 ? (
        <div className="space-y-3">
          <Textarea
            placeholder="Escribe o pega tu agenda aqui...

Ejemplo:
Lunes - Matematicas: Ejercicios pagina 45, llevar cuaderno cuadriculado
Martes - Historia: Investigacion sobre la Revolucion, 2 hojas blancas"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32 rounded-2xl bg-card border-border resize-none text-base"
          />
          
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          
          <Button
            onClick={handleParse}
            disabled={loading || !text.trim()}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Procesar con IA
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
            <p className="text-sm font-medium text-accent mb-3">
              Se encontraron {parsedTasks.length} tareas
            </p>
            
            <div className="space-y-2">
              {parsedTasks.map((task, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {task.subject && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {task.subject}
                        </span>
                      )}
                      <span>{task.due_date}</span>
                    </div>
                    {task.materials && task.materials.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.materials.map((m, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                          >
                            {m.quantity ? `${m.quantity} ` : ''}{m.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeTask(index)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setParsedTasks([])
                setError(null)
              }}
              className="flex-1 h-12 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Guardar todo
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
