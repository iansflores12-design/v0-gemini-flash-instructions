import { getTasks, getSubjects } from '@/lib/actions'
import { BookOpen, Lightbulb, Video, CheckCircle2 } from 'lucide-react'
import { getServerLanguage, pickLocalized } from '@/lib/localized'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function StudyReviewPage() {
  const language = await getServerLanguage()
  const [tasks, subjects] = await Promise.all([
    getTasks(),
    getSubjects()
  ])

  const pendingTasks = tasks.filter(t => !t.is_done)

  // Study tips by language
  const studyTips = {
    es: [
      'Técnica Pomodoro: Estudia 25 minutos, descansa 5 minutos',
      'Resumen activo: Escribe con tus propias palabras lo aprendido',
      'Enseña a otros: Explica el tema como si enseñaras a alguien'
    ],
    en: [
      'Pomodoro Technique: Study for 25 minutes, rest for 5 minutes',
      'Active Summary: Write what you learned in your own words',
      'Teach Others: Explain the topic as if you were teaching someone'
    ],
    pt: [
      'Técnica Pomodoro: Estude 25 minutos, descanse 5 minutos',
      'Resumo Ativo: Escreva o que aprendeu com suas próprias palavras',
      'Ensine Outros: Explique o tópico como se estivesse ensinando'
    ]
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {pickLocalized(language, { es: 'Repaso', en: 'Study Review', pt: 'Revisão de Estudo' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pendingTasks.length} {pickLocalized(language, { es: 'tareas para repasar', en: 'tasks to review', pt: 'tarefas para revisar' })}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-6 pb-6">
        {/* Study Tips Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            {pickLocalized(language, { es: 'Consejos de Estudio', en: 'Study Tips', pt: 'Dicas de Estudo' })}
          </h2>
          <div className="grid gap-3">
            {studyTips[language === 'pt' ? 'pt' : language === 'en' ? 'en' : 'es'].map((tip, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tasks to Review */}
        {pendingTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {pickLocalized(language, { es: 'Tareas para Repasar', en: 'Tasks to Review', pt: 'Tarefas para Revisar' })}
            </h2>
            <div className="space-y-3">
              {pendingTasks.slice(0, 10).map((task) => {
                const subject = subjects.find(s => s.id === task.subject_id)
                const searchQuery = encodeURIComponent(`${task.title} ${subject?.name || ''}`)
                const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject?.color_code || '#6750A4' }}
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            {subject?.name || 'Sin materia'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <Link href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {language === 'en' ? 'Search Videos' : language === 'pt' ? 'Buscar Vídeos' : 'Buscar Vídeos'}
                        </Button>
                      </Link>
                    </div>

                    {/* Quick Study Tips for this task */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {pickLocalized(language, { es: 'Consejos para este tema:', en: 'Tips for this topic:', pt: 'Dicas para este tópico:' })}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• {pickLocalized(language, { es: 'Haz preguntas sobre cada punto principal', en: 'Ask questions about each main point', pt: 'Faça perguntas sobre cada ponto principal' })}</li>
                        <li>• {pickLocalized(language, { es: 'Crea ejemplos prácticos del tema', en: 'Create practical examples of the topic', pt: 'Crie exemplos práticos do tópico' })}</li>
                        <li>• {pickLocalized(language, { es: 'Repasa regularmente después del estudio', en: 'Review regularly after studying', pt: 'Revise regularmente após estudar' })}</li>
                      </ul>
                    </div>
                  </div>
                )
              })}
              {pendingTasks.length > 10 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {pendingTasks.length - 10} {pickLocalized(language, { es: 'tareas más', en: 'more tasks', pt: 'mais tarefas' })}
                </p>
              )}
            </div>
          </section>
        )}

        {/* No Tasks Message */}
        {pendingTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-foreground font-semibold mb-2">
              {pickLocalized(language, { es: '¡Sin tareas pendientes!', en: 'No pending tasks!', pt: 'Sem tarefas pendentes!' })}
            </p>
            <p className="text-muted-foreground text-sm">
              {pickLocalized(language, { es: 'Agrega tareas para empezar a repasar', en: 'Add tasks to start reviewing', pt: 'Adicione tarefas para começar a revisar' })}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
