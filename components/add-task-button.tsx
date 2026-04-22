'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTask } from '@/lib/actions'
import type { Subject } from '@/lib/types'

interface AddTaskButtonProps {
  subjects: Subject[]
}

export function AddTaskButton({ subjects }: AddTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) return

    setLoading(true)
    try {
      await createTask(title, dueDate, subjectId || undefined)
      setTitle('')
      setDueDate('')
      setSubjectId('')
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
        Agregar tarea
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-card border border-border space-y-4 animate-scale-in">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Nueva tarea</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Nombre de la tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 rounded-xl bg-background"
          required
        />

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-12 rounded-xl bg-background pl-10"
            required
          />
        </div>

        {subjects.length > 0 && (
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full h-12 rounded-xl bg-background border border-input px-3 text-foreground"
          >
            <option value="">Sin materia</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(false)}
          className="flex-1 h-11 rounded-xl"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !title.trim() || !dueDate}
          className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
