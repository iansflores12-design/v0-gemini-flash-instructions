import { getTasks, getSubjects } from '@/lib/actions'
import { TaskList } from '@/components/task-list'
import { AddTaskButton } from '@/components/add-task-button'
import { ListTodo, CheckCircle2 } from 'lucide-react'
import { getServerLanguage, pickLocalized } from '@/lib/localized'

export default async function TasksPage() {
  const language = await getServerLanguage()
  const [tasks, subjects] = await Promise.all([
    getTasks(),
    getSubjects()
  ])

  const pendingTasks = tasks.filter(t => !t.is_done)
  const completedTasks = tasks.filter(t => t.is_done)

  return (
    <main className="min-h-screen">
      <header className="px-4 pt-6 pb-4 bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{pickLocalized(language, { es: 'Tareas', en: 'Tasks', pt: 'Tarefas' })}</h1>
            <p className="text-sm text-muted-foreground">
              {pendingTasks.length} {pickLocalized(language, { es: 'pendientes', en: 'pending', pt: 'pendentes' })}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-6 pb-6">
        <AddTaskButton subjects={subjects} />

        {pendingTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{pickLocalized(language, { es: 'Pendientes', en: 'Pending', pt: 'Pendentes' })}</h2>
            <TaskList tasks={pendingTasks} subjects={subjects} />
          </section>
        )}

        {completedTasks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">{pickLocalized(language, { es: 'Completadas', en: 'Completed', pt: 'Concluidas' })}</h2>
            </div>
            <TaskList tasks={completedTasks} subjects={subjects} />
          </section>
        )}

        {tasks.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-secondary mx-auto mb-3 flex items-center justify-center">
              <ListTodo className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{pickLocalized(language, { es: 'Aun no tienes tareas', en: 'You do not have tasks yet', pt: 'Voce ainda nao tem tarefas' })}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {pickLocalized(language, { es: 'Agrega tu primera tarea con el boton de arriba', en: 'Add your first task with the button above', pt: 'Adicione sua primeira tarefa com o botao acima' })}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
