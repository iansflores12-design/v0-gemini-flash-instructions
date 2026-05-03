'use client'

import { useState } from 'react'
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Task } from '@/lib/types'
import { TaskList } from './task-list'

interface UpcomingTasksProps {
  tasks: Task[]
  subjects?: any[]
}

export function UpcomingTasks({ tasks, subjects = [] }: UpcomingTasksProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Get current week (Monday to Sunday)
  const today = new Date()
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 })
  
  // Helper to check if date is in a specific week
  const isInWeek = (dateStr: string, weekStart: Date, weekEnd: Date) => {
    const date = parseISO(dateStr)
    return isWithinInterval(date, { start: weekStart, end: weekEnd })
  }
  
  // Group tasks by week
  const tasksByWeek = {
    thisWeek: tasks.filter(t => isInWeek(t.due_date, currentWeekStart, currentWeekEnd)),
    week1: tasks.filter(t => {
      const week1Start = addWeeks(currentWeekStart, 1)
      const week1End = endOfWeek(week1Start, { weekStartsOn: 1 })
      return isInWeek(t.due_date, week1Start, week1End)
    }),
    week2: tasks.filter(t => {
      const week2Start = addWeeks(currentWeekStart, 2)
      const week2End = endOfWeek(week2Start, { weekStartsOn: 1 })
      return isInWeek(t.due_date, week2Start, week2End)
    }),
    week3: tasks.filter(t => {
      const week3Start = addWeeks(currentWeekStart, 3)
      const week3End = endOfWeek(week3Start, { weekStartsOn: 1 })
      return isInWeek(t.due_date, week3Start, week3End)
    }),
  }
  
  // Calculate week numbers
  const getWeekLabel = (weekOffset: number) => {
    if (weekOffset === 0) return 'Esta semana'
    const weekDate = addWeeks(currentWeekStart, weekOffset)
    const weekNum = Math.ceil((parseInt(format(weekDate, 'd')) + (parseISO(format(weekDate, 'yyyy-01-01')).getDay() || 7) - 1) / 7)
    return `Semana ${weekNum}`
  }
  
  const weeks = [
    { key: 'thisWeek', label: 'Esta semana', offset: 0 },
    { key: 'week1', label: 'Semana 1', offset: 1 },
    { key: 'week2', label: 'Semana 2', offset: 2 },
    { key: 'week3', label: 'Semana 3', offset: 3 },
  ] as const
  
  const displayedWeeks = showAll ? weeks : weeks.slice(0, 2)
  
  return (
    <div className="space-y-4">
      {displayedWeeks.map((week) => {
        const weekTasks = tasksByWeek[week.key]
        if (weekTasks.length === 0) return null
        
        return (
          <section key={week.key}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              {week.label} • {weekTasks.length} tarea{weekTasks.length !== 1 ? 's' : ''}
            </h3>
            <TaskList tasks={weekTasks.slice(0, 3)} subjects={subjects} />
            {weekTasks.length > 3 && (
              <Link
                href="/dashboard/tasks"
                className="text-xs text-primary font-medium mt-2 flex items-center gap-1 hover:gap-2 transition-all"
              >
                Ver todas ({weekTasks.length}) <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </section>
        )
      })}
      
      {!showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver más semanas
        </button>
      )}
    </div>
  )
}
