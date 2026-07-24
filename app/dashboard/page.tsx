import { createClient } from '@/lib/supabase/server'
import { getTasks, getSubjects } from '@/lib/actions'
import { DashboardHeader } from '@/components/dashboard-header'
import { AgendaInput } from '@/components/agenda-input'
import { UpcomingTasks } from '@/components/upcoming-tasks'
import { StudyReviewSection } from '@/components/study-review-section'
import { QuickStats } from '@/components/quick-stats'
import { getServerLanguage, pickLocalized } from '@/lib/localized'

export default async function DashboardPage() {
  const language = await getServerLanguage()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [tasks, subjects] = await Promise.all([
    getTasks(),
    getSubjects()
  ])

  const pendingTasks = tasks.filter(t => !t.is_done)
  const todayTasks = pendingTasks.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    return t.due_date === today
  })

  return (
    <main className="min-h-screen">
      <DashboardHeader 
        userName={user?.user_metadata?.full_name || pickLocalized(language, { es: 'Estudiante', en: 'Student', pt: 'Estudante' })} 
      />
      
      <div className="px-4 space-y-6 pb-6">
        <QuickStats 
          totalPending={pendingTasks.length}
          todayCount={todayTasks.length}
          subjectsCount={subjects.length}
        />
        
        <AgendaInput subjects={subjects} />
        
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {pickLocalized(language, { es: 'Proximas tareas', en: 'Upcoming tasks', pt: 'Proximas tarefas' })}
          </h2>
          <UpcomingTasks tasks={pendingTasks} subjects={subjects} />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {pickLocalized(language, { es: 'Repaso', en: 'Study Review', pt: 'Revisão de Estudo' })}
          </h2>
          <StudyReviewSection tasks={pendingTasks} subjects={subjects} />
        </section>
      </div>
    </main>
  )
}
