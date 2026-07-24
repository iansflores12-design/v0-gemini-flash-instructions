'use client'

import { useState, useEffect } from 'react'
import { getTasks, getSubjects } from '@/lib/actions'
import { BookOpen, Lightbulb, Video, CheckCircle2, Loader2 } from 'lucide-react'
import { pickLocalized } from '@/lib/localized'
import { useLanguage } from '@/components/language-provider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TaskWithTips {
  id: string
  title: string
  description?: string
  subject_id?: string
  tips: string[]
  videos: Array<{ title: string; url: string; channel: string }>
  loading: boolean
}

export default function StudyReviewPage() {
  const { language } = useLanguage()
  const [tasks, setTasks] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [tasksWithTips, setTasksWithTips] = useState<TaskWithTips[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, subjectsData] = await Promise.all([
          getTasks(),
          getSubjects()
        ])
        
        setTasks(tasksData)
        setSubjects(subjectsData)
        
        // Initialize tasks with tips loading
        const pending = tasksData.filter((t: any) => !t.is_done)
        setTasksWithTips(pending.map((task: any) => ({
          ...task,
          tips: [],
          videos: [],
          loading: true
        })))

        // Fetch tips for each task
        for (const task of pending) {
          const subject = subjectsData.find((s: any) => s.id === task.subject_id)
          const response = await fetch('/api/study/tips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subjectName: subject?.name || 'General',
              taskTitle: task.title,
              language: language === 'pt' ? 'pt' : language === 'en' ? 'en' : 'es',
              gradeLevel: 8
            })
          })

          if (response.ok) {
            const data = await response.json()
            setTasksWithTips((prev) =>
              prev.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      tips: data.tips || [],
                      videos: data.videos || [],
                      loading: false
                    }
                  : t
              )
            )
          } else {
            setTasksWithTips((prev) =>
              prev.map((t) =>
                t.id === task.id ? { ...t, loading: false } : t
              )
            )
          }
        }
      } catch (err) {
        console.error('[v0] Error loading study data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [language])

  const pendingTasks = tasks.filter(t => !t.is_done)

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
              {language === 'en' ? 'Study Review' : language === 'pt' ? 'Revisão de Estudo' : 'Repaso'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pendingTasks.length} {language === 'en' ? 'tasks to review' : language === 'pt' ? 'tarefas para revisar' : 'tareas para repasar'}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 space-y-6 pb-6">
        {/* Tasks to Review with AI Tips */}
        {tasksWithTips.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {language === 'en' ? 'Study Materials' : language === 'pt' ? 'Materiais de Estudo' : 'Materiales de Estudio'}
            </h2>
            <div className="space-y-4">
              {tasksWithTips.map((task) => {
                const subject = subjects.find(s => s.id === task.subject_id)

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all overflow-hidden"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject?.color_code || '#6750A4' }}
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            {subject?.name || language === 'en' ? 'No subject' : language === 'pt' ? 'Sem matéria' : 'Sin materia'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                        )}
                      </div>
                    </div>

                    {/* AI-Generated Tips */}
                    {task.loading ? (
                      <div className="py-6 flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">{language === 'en' ? 'Generating tips...' : language === 'pt' ? 'Gerando dicas...' : 'Generando consejos...'}</span>
                      </div>
                    ) : task.tips.length > 0 ? (
                      <>
                        {/* Study Tips */}
                        <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            {language === 'en' ? 'Study Tips for this topic' : language === 'pt' ? 'Dicas de estudo para este tópico' : 'Consejos de estudio para este tema'}
                          </p>
                          <ul className="text-sm text-foreground space-y-1">
                            {task.tips.map((tip, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-primary font-medium">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* YouTube Videos */}
                        {task.videos.length > 0 && (
                          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-500" />
                              {language === 'en' ? 'Recommended Videos' : language === 'pt' ? 'Vídeos Recomendados' : 'Vídeos Recomendados'}
                            </p>
                            <div className="space-y-2">
                              {task.videos.map((video, idx) => (
                                <Link
                                  key={idx}
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-2 rounded-lg bg-background border border-border hover:border-blue-500 transition-colors group"
                                >
                                  <p className="text-xs font-medium text-foreground group-hover:text-blue-500 transition-colors">{video.title}</p>
                                  <p className="text-xs text-muted-foreground">{video.channel}</p>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-4 text-center text-muted-foreground text-sm">
                        {language === 'en' ? 'Unable to generate tips' : language === 'pt' ? 'Impossível gerar dicas' : 'No se pudieron generar consejos'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ) : (
          /* No Tasks Message */
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-foreground font-semibold mb-2">
              {language === 'en' ? 'No pending tasks!' : language === 'pt' ? 'Sem tarefas pendentes!' : '¡Sin tareas pendientes!'}
            </p>
            <p className="text-muted-foreground text-sm">
              {language === 'en' ? 'Add tasks to start reviewing' : language === 'pt' ? 'Adicione tarefas para começar a revisar' : 'Agrega tareas para empezar a repasar'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
