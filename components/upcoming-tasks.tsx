'use client'

import { useState } from 'react'
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Task } from '@/lib/types'
import { TaskList } from './task-list'
import { useLanguage } from '@/components/language-provider'

interface UpcomingTasksProps {
  tasks: Task[]
  subjects?: any[]
}

export function UpcomingTasks({ tasks, subjects = [] }: UpcomingTasksProps) {
  const { t } = useLanguage()
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
  
  const weeks = [
    { key: 'thisWeek', labelKey: 'estaSemana' as const, offset: 0 },
    { key: 'week1', labelKey: 'semana' as const, offset: 1 },
    { key: 'week2', labelKey: 'semana' as const, offset: 2 },
    { key: 'week3', labelKey: 'semana' as const, offset: 3 },
  ] as const
  
  const displayedWeeks = showAll ? weeks : weeks.slice(0, 2)
  
  return (
    <div className="space-y-4">
      {displayedWeeks.map((week) => {
        const weekTasks = tasksByWeek[week.key]
        if (weekTasks.length === 0) return null
        
        const label = week.offset === 0 ? t('estaSemana') : `${t('semana')} ${week.offset}`
        
        return (
          <section key={week.key}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              {label} • {weekTasks.length} {weekTasks.length === 1 ? t('tarea') : t('tareaPlural')}
            </h3>
            <TaskList tasks={weekTasks.slice(0, 3)} subjects={subjects} />
            {weekTasks.length > 3 && (
              <Link
                href="/dashboard/tasks"
                className="text-xs text-primary font-medium mt-2 flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t('verTodas')} ({weekTasks.length}) <ChevronRight className="w-3 h-3" />
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
          {t('verMasSemanas')}
        </button>
      )}
    </div>
  )
}
