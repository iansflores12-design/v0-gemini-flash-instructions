'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, ChevronRight, Package, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleTaskDone, deleteTask } from '@/lib/actions'
import type { Task } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  showViewAll?: boolean
}

export function TaskList({ tasks, showViewAll }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-card border border-border">
        <div className="w-12 h-12 rounded-xl bg-secondary mx-auto mb-3 flex items-center justify-center">
          <Check className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No hay tareas pendientes</p>
        <p className="text-sm text-muted-foreground mt-1">
          Usa el procesador de agenda para agregar tareas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
      
      {showViewAll && tasks.length > 0 && (
        <Link 
          href="/dashboard/tasks"
          className="flex items-center justify-center gap-2 p-3 rounded-xl text-primary font-medium hover:bg-primary/5 transition-colors"
        >
          Ver todas las tareas
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const dueDate = parseISO(task.due_date)
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && !task.is_done

  const getDateLabel = () => {
    if (isToday(dueDate)) return 'Hoy'
    if (isTomorrow(dueDate)) return 'Manana'
    return format(dueDate, 'd MMM', { locale: es })
  }

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggleTaskDone(task.id, !task.is_done)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteTask(task.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={cn(
      'p-4 rounded-2xl bg-card border transition-all',
      task.is_done 
        ? 'border-border opacity-60' 
        : isOverdue 
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-border'
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5',
            task.is_done
              ? 'bg-primary border-primary'
              : 'border-outline hover:border-primary'
          )}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          ) : task.is_done ? (
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          ) : null}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium text-foreground',
            task.is_done && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.subject && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${task.subject.color_code}20`,
                  color: task.subject.color_code 
                }}
              >
                {task.subject.name}
              </span>
            )}
            <span className={cn(
              'text-xs',
              isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
            )}>
              {getDateLabel()}
            </span>
          </div>

          {task.materials && task.materials.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span>{task.materials.length} materiales</span>
            </div>
          )}
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
