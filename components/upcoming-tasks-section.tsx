'use client'

import type { Task } from '@/lib/types'
import { UpcomingTasks } from './upcoming-tasks'
import { useLanguage } from '@/components/language-provider'

interface UpcomingTasksSectionProps {
  tasks: Task[]
  subjects?: any[]
}

export function UpcomingTasksSection({ tasks, subjects = [] }: UpcomingTasksSectionProps) {
  const { t } = useLanguage()
  
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">
        {t('proximasTareas')}
      </h2>
      <UpcomingTasks tasks={tasks} subjects={subjects} />
    </section>
  )
}
