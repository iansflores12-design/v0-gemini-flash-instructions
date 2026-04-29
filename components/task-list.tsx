'use client'

import { useState, useMemo } from 'react'
import { format, isToday, isTomorrow, isPast, parseISO, startOfWeek, endOfWeek, isWithinInterval, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, ChevronRight, ChevronDown, Package, Trash2, Loader2, Calendar, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleTaskDone, deleteTask } from '@/lib/actions'
import type { Task } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  showViewAll?: boolean
}

interface WeekGroup {
  label: string
  startDate: Date
  endDate: Date
  tasks: Task[]
  materials: { name: string; quantity: string | null; subjectColor: string }[]
}

export function TaskList({ tasks, showViewAll }: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(['current']))

  // Group tasks by week
  const weekGroups = useMemo(() => {
    const today = new Date()
    const groups: WeekGroup[] = []
    
    // Create week buckets for the next 8 weeks
    for (let i = 0; i < 8; i++) {
      const weekStart = startOfWeek(addWeeks(today, i), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(addWeeks(today, i), { weekStartsOn: 1 })
      
      const weekTasks = tasks.filter(task => {
        const dueDate = parseISO(task.due_date)
        return isWithinInterval(dueDate, { start: weekStart, end: weekEnd })
      })

      if (weekTasks.length > 0 || i === 0) {
        // Collect materials for this week
        const materials: { name: string; quantity: string | null; subjectColor: string }[] = []
        weekTasks.forEach(task => {
          task.materials?.forEach(m => {
            materials.push({
              name: m.name,
              quantity: m.quantity,
              subjectColor: task.subject?.color_code || '#6750A4'
            })
          })
        })

        groups.push({
          label: i === 0 ? 'Esta semana' : i === 1 ? 'Proxima semana' : format(weekStart, "'Semana del' d 'de' MMMM", { locale: es }),
          startDate: weekStart,
          endDate: weekEnd,
          tasks: weekTasks,
          materials
        })
      }
    }

    // Add overdue tasks group
    const overdueTasks = tasks.filter(task => {
      const dueDate = parseISO(task.due_date)
      return isPast(dueDate) && !isToday(dueDate) && !task.is_done
    })

    if (overdueTasks.length > 0) {
      groups.unshift({
        label: 'Atrasadas',
        startDate: new Date(0),
        endDate: new Date(0),
        tasks: overdueTasks,
        materials: []
      })
    }

    return groups
  }, [tasks])

  // Separate done and pending tasks
  const { pendingTasks, doneTasks } = useMemo(() => {
    return {
      pendingTasks: tasks.filter(t => !t.is_done),
      doneTasks: tasks.filter(t => t.is_done)
    }
  }, [tasks])

  const toggleWeek = (weekLabel: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(weekLabel)) {
        next.delete(weekLabel)
      } else {
        next.add(weekLabel)
      }
      return next
    })
  }

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-card border border-border">
        <div className="w-12 h-12 rounded-xl bg-secondary mx-auto mb-3 flex items-center justify-center">
          <Check className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No hay tareas pendientes</p>
        <p className="text-sm text-muted-foreground mt-1">
          Sube tu agenda PDF/DOCX para agregar tareas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {weekGroups.map((week) => (
        <div key={week.label} className="space-y-2">
          {/* Week Header */}
          <button
            onClick={() => toggleWeek(week.label)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedWeeks.has(week.label) ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-semibold text-foreground">{week.label}</span>
              <span className="text-sm text-muted-foreground">
                ({week.tasks.filter(t => !t.is_done).length} pendientes)
              </span>
            </div>
            {week.label === 'Atrasadas' && (
              <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                Urgente
              </span>
            )}
          </button>

          {expandedWeeks.has(week.label) && (
            <div className="space-y-3 pl-2">
              {/* Materials for the week */}
              {week.materials.length > 0 && (
                <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Materiales de la semana</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {week.materials.map((m, i) => (
                      <span 
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-full border"
                        style={{ 
                          borderColor: m.subjectColor,
                          backgroundColor: `${m.subjectColor}10`
                        }}
                      >
                        {m.quantity ? `${m.quantity} ` : ''}{m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Tasks */}
              {week.tasks.filter(t => !t.is_done).map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  isExpanded={expandedTasks.has(task.id)}
                  onToggleExpand={() => toggleTask(task.id)}
                />
              ))}

              {/* Done Tasks */}
              {week.tasks.filter(t => t.is_done).length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 pl-2">Completadas</p>
                  {week.tasks.filter(t => t.is_done).map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      isExpanded={expandedTasks.has(task.id)}
                      onToggleExpand={() => toggleTask(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      
      {showViewAll && tasks.length > 0 && (
        <a 
          href="/dashboard/tasks"
          className="flex items-center justify-center gap-2 p-3 rounded-xl text-primary font-medium hover:bg-primary/5 transition-colors"
        >
          Ver todas las tareas
          <ChevronRight className="w-4 h-4" />
        </a>
      )}
    </div>
  )
}

function TaskCard({ 
  task, 
  isExpanded, 
  onToggleExpand 
}: { 
  task: Task
  isExpanded: boolean
  onToggleExpand: () => void
}) {
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

  const addToGoogleCalendar = () => {
    const title = encodeURIComponent(task.title)
    const details = encodeURIComponent(task.description || '')
    const date = task.due_date.replace(/-/g, '')
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${date}/${date}`
    window.open(url, '_blank')
  }

  const subjectColor = task.subject?.color_code || '#6750A4'

  return (
    <div 
      className={cn(
        'rounded-2xl bg-card border transition-all overflow-hidden',
        task.is_done 
          ? 'border-border opacity-60' 
          : isOverdue 
            ? 'border-destructive/30 bg-destructive/5'
            : 'border-border'
      )}
      style={{ borderLeftWidth: '4px', borderLeftColor: subjectColor }}
    >
      {/* Main row - always visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
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
                    backgroundColor: `${subjectColor}20`,
                    color: subjectColor 
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
              {task.materials && task.materials.length > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {task.materials.length}
                </span>
              )}
            </div>
          </div>

          <ChevronDown className={cn(
            'w-5 h-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border/50">
          {task.description && (
            <p className="text-sm text-muted-foreground mt-3 mb-3">
              {task.description}
            </p>
          )}

          {task.materials && task.materials.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-foreground mb-2">Materiales:</p>
              <div className="flex flex-wrap gap-2">
                {task.materials.map((m, i) => (
                  <span 
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant"
                  >
                    {m.quantity ? `${m.quantity} ` : ''}{m.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
              disabled={loading}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors',
                task.is_done 
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {task.is_done ? 'Desmarcar' : 'Marcar hecha'}
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                addToGoogleCalendar()
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={deleting}
              className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
