import { getSubjects, getTasks } from '@/lib/actions'
import { BookOpen } from 'lucide-react'
import { AddSubjectButton } from '@/components/add-subject-button'
import { SubjectCard } from '@/components/subject-card'

export default async function SubjectsPage() {
  const [subjects, tasks] = await Promise.all([
    getSubjects(),
    getTasks()
  ])

  const getTaskCount = (subjectId: string) => {
    return tasks.filter(t => t.subject_id === subjectId && !t.is_done).length
  }

  return (
    <main className="min-h-screen">
      <header className="px-4 pt-6 pb-4 bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-chart-3" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Materias</h1>
            <p className="text-sm text-muted-foreground">
              {subjects.length} {subjects.length === 1 ? 'materia registrada' : 'materias registradas'}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-4 pb-6">
        <AddSubjectButton />

        {subjects.length > 0 ? (
          <div className="grid gap-3">
            {subjects.map((subject) => (
              <SubjectCard 
                key={subject.id}
                subject={subject}
                taskCount={getTaskCount(subject.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-secondary mx-auto mb-3 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Aun no tienes materias</p>
            <p className="text-sm text-muted-foreground mt-1">
              Agrega tu primera materia para organizar tus tareas
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
