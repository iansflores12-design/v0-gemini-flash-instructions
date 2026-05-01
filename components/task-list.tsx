'use client'

import { useState, useMemo } from 'react'
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addWeeks, differenceInDays, isPast, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, ChevronRight, Package, Trash2, Loader2, Calendar, ExternalLink, Clock, Star, X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleTaskDone, deleteTask } from '@/lib/actions'
import type { Task } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  showViewAll?: boolean
}

interface WeekData {
  weekNumber: number
  label: string
  shortLabel: string
  startDate: Date
  endDate: Date
  tasks: Task[]
}

export function TaskList({ tasks, showViewAll }: TaskListProps) {
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  // Generate weeks data based on actual task dates
  const weeks = useMemo(() => {
    if (tasks.length === 0) return []
    
    // Find date range from tasks
    const taskDates = tasks.map(t => parseISO(t.due_date))
    const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())))
    
    // Start from the earliest task's Monday
    const firstWeekStart = startOfWeek(minDate, { weekStartsOn: 1 }) // Monday
    const lastWeekEnd = endOfWeek(maxDate, { weekStartsOn: 1 }) // Sunday
    
    // Calculate number of weeks needed
    const totalWeeks = Math.ceil((lastWeekEnd.getTime() - firstWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
    
    const weeksList: WeekData[] = []
    
    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = startOfWeek(addWeeks(firstWeekStart, i), { weekStartsOn: 1 }) // Monday
      // Get Friday of the same week (4 days after Monday)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 4) // Friday
      
      const weekTasks = tasks.filter(task => {
        const dueDate = parseISO(task.due_date)
        return isWithinInterval(dueDate, { start: weekStart, end: weekEnd })
      })

      const startDay = format(weekStart, 'd', { locale: es })
      const endDay = format(weekEnd, 'd', { locale: es })
      const month = format(weekStart, 'MMM', { locale: es })

      weeksList.push({
        weekNumber: i + 1,
        label: i === 0 ? 'Semana 1' : `Semana ${i + 1}`,
        shortLabel: `S${i + 1}: ${startDay}-${endDay} ${month}`,
        startDate: weekStart,
        endDate: weekEnd,
        tasks: weekTasks
      })
    }
    
    // Only show weeks that have tasks
    return weeksList.filter(w => w.tasks.length > 0)
  }, [tasks])

  const currentWeek = weeks[selectedWeek] || weeks[0]
  const pendingTasks = currentWeek?.tasks.filter(t => !t.is_done) || []
  const completedTasks = currentWeek?.tasks.filter(t => t.is_done) || []

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
      {/* Week Tabs - Horizontal scroll */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex gap-2 min-w-max">
          {weeks.map((week, idx) => {
            const hasTasks = week.tasks.filter(t => !t.is_done).length > 0
            return (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(idx)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  selectedWeek === idx
                    ? 'bg-primary text-primary-foreground'
                    : hasTasks
                      ? 'bg-secondary text-foreground hover:bg-secondary/80'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                )}
              >
                {week.shortLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-secondary/30">
            <p className="text-muted-foreground">No hay tareas para {currentWeek?.label.toLowerCase()}</p>
          </div>
        ) : (
          <>
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                weekNumber={currentWeek?.weekNumber || 1}
                isExpanded={expandedTaskId === task.id}
                onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              />
            ))}

            {/* Completed Tasks Toggle */}
            {completedTasks.length > 0 && (
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/30 text-muted-foreground hover:bg-secondary/50 transition-colors"
              >
                <span className="text-sm">
                  {completedTasks.length} tarea{completedTasks.length > 1 ? 's' : ''} completada{completedTasks.length > 1 ? 's' : ''}
                </span>
                <ChevronRight className={cn('w-4 h-4 transition-transform', showCompleted && 'rotate-90')} />
              </button>
            )}

            {showCompleted && completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                weekNumber={currentWeek?.weekNumber || 1}
                isExpanded={expandedTaskId === task.id}
                onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              />
            ))}
          </>
        )}
      </div>
      
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
  weekNumber,
  isExpanded, 
  onToggleExpand 
}: { 
  task: Task
  weekNumber: number
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const dueDate = parseISO(task.due_date)
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && !task.is_done
  const daysUntilDue = differenceInDays(dueDate, new Date())
  const subjectColor = task.subject?.color_code || '#6750A4'

  const getDateLabel = () => {
    if (isToday(dueDate)) return 'Hoy'
    if (isTomorrow(dueDate)) return 'Manana'
    return format(dueDate, "EEE d MMM", { locale: es })
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    try {
      await toggleTaskDone(task.id, !task.is_done)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true)
    try {
      await deleteTask(task.id)
    } finally {
      setDeleting(false)
    }
  }

  const addToGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation()
    const title = encodeURIComponent(task.title)
    const details = encodeURIComponent(task.description || '')
    const date = task.due_date.replace(/-/g, '')
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${date}/${date}`
    window.open(url, '_blank')
  }

  // Task type badge (simplified detection)
  const taskType = task.title.toLowerCase().includes('examen') || task.title.toLowerCase().includes('parcial') 
    ? 'Examen' 
    : task.title.toLowerCase().includes('proyecto')
      ? 'Proyecto'
      : 'Tarea'

  return (
    <div 
      className={cn(
        'rounded-2xl bg-card border-l-4 overflow-hidden transition-all',
        task.is_done ? 'opacity-60 border-border' : isOverdue ? 'border-destructive' : 'border-transparent'
      )}
      style={{ borderLeftColor: task.is_done ? undefined : subjectColor }}
    >
      {/* Collapsed View - Card */}
      <div 
        className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-medium border"
                style={{ 
                  color: subjectColor,
                  borderColor: subjectColor,
                  backgroundColor: `${subjectColor}15`
                }}
              >
                {task.subject?.name || 'Sin materia'}
              </span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                taskType === 'Examen' ? 'bg-amber-500/20 text-amber-600' :
                taskType === 'Proyecto' ? 'bg-blue-500/20 text-blue-600' :
                'bg-secondary text-muted-foreground'
              )}>
                {taskType}
              </span>
            </div>

            {/* Title */}
            <p className={cn(
              'font-semibold text-foreground',
              task.is_done && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </p>
            
            {/* Meta info */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                S{weekNumber}: {getDateLabel()}
              </span>
              {task.value && (
                <span className="flex items-center gap-1 text-primary font-medium">
                  {task.value}
                </span>
              )}
            </div>
          </div>

          {/* Checkbox */}
          <button
            onClick={handleToggle}
            disabled={loading}
            className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
              task.is_done
                ? 'bg-primary border-primary'
                : 'border-border hover:border-primary'
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : task.is_done ? (
              <Check className="w-4 h-4 text-primary-foreground" />
            ) : null}
          </button>
        </div>
      </div>

      {/* Expanded View - Full Detail Sheet */}
      {isExpanded && (
        <div className="border-t border-border bg-background">
          {/* Header with subject */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${subjectColor}20` }}
            >
              <span style={{ color: subjectColor }} className="font-bold text-sm">
                {task.subject?.name?.charAt(0) || 'T'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: subjectColor }}>
                {task.subject?.name || 'Sin materia'}
              </p>
              <p className="text-xs text-muted-foreground">{taskType}</p>
            </div>
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Title */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-foreground">{task.title}</h3>
          </div>

          {/* Date & Value */}
          <div className="px-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha limite</p>
                <p className={cn(
                  'font-semibold',
                  isOverdue ? 'text-destructive' : 'text-foreground'
                )}>
                  {format(dueDate, "EEEE d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>

            {task.value && (
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-semibold text-primary">{task.value}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="px-4 pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Descripcion</p>
              <div className="p-3 rounded-xl bg-secondary/50">
                <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}

          {/* Materials */}
          {task.materials && task.materials.length > 0 && (
            <div className="px-4 pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Materiales necesarios</p>
              <div className="space-y-2">
                {task.materials.map((m, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor }} />
                    <span className="text-sm text-foreground">
                      {m.quantity ? `${m.quantity} - ` : ''}{m.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={addToGoogleCalendar}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Google Calendar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Copy to clipboard functionality
                  const text = `${task.title}\nFecha: ${format(dueDate, "d MMM yyyy")}\n${task.description || ''}`
                  navigator.clipboard.writeText(text)
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 text-green-600 font-medium hover:bg-green-500/20 transition-colors"
              >
                <Check className="w-4 h-4" />
                Copiar p/ Tasks
              </button>
            </div>

            <button
              onClick={handleToggle}
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors',
                task.is_done 
                  ? 'bg-secondary text-foreground hover:bg-secondary/80'
                  : 'bg-card border border-border text-foreground hover:bg-secondary'
              )}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {task.is_done ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-current" />
                  )}
                  {task.is_done ? 'Desmarcar como hecha' : 'Marcar como hecha'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
