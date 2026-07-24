'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, BookOpen, Youtube, Brain, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, Subject } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

interface StudyTip {
  tip: string
}

interface YouTubeSearch {
  query: string
}

interface TaskReview {
  taskId: string
  taskName: string
  subjectName: string
  subjectColor: string
  tips: StudyTip[]
  youtubeSearches: YouTubeSearch[]
}

interface StudyReviewSectionProps {
  tasks: Task[]
  subjects: Subject[]
}

export function StudyReviewSection({ tasks, subjects }: StudyReviewSectionProps) {
  const { language, t } = useLanguage()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  // Generate review content for each task
  const reviewTasks: TaskReview[] = useMemo(() => {
    return tasks
      .filter(task => !task.is_done)
      .slice(0, 10)
      .map(task => {
        const subject = subjects.find(s => s.id === task.subject_id)
        
        // Generate study tips based on task type
        const tips: StudyTip[] = [
          {
            tip: language === 'en' 
              ? 'Break down the topic into smaller subtopics and create mind maps to visualize connections'
              : language === 'pt'
              ? 'Divida o tópico em subtópicos menores e crie mapas mentais para visualizar conexões'
              : 'Divide el tema en subtemas más pequeños y crea mapas mentales para visualizar conexiones'
          },
          {
            tip: language === 'en'
              ? 'Practice active recall by testing yourself with flashcards or practice problems'
              : language === 'pt'
              ? 'Pratique recordação ativa testando-se com cartões de memória ou problemas práticos'
              : 'Practica recuperación activa poniéndote a prueba con tarjetas o problemas de práctica'
          },
          {
            tip: language === 'en'
              ? 'Teach the concept to someone else or explain it out loud to reinforce understanding'
              : language === 'pt'
              ? 'Ensine o conceito a outra pessoa ou explique em voz alta para reforçar a compreensão'
              : 'Enseña el concepto a otra persona o explícalo en voz alta para reforzar la comprensión'
          }
        ]

        // Generate YouTube search queries based on subject and task
        const youtubeSearches: YouTubeSearch[] = [
          {
            query: `${subject?.name || 'Study'} ${task.title} summary tutorial`
          },
          {
            query: `How to ${task.title?.toLowerCase()} ${subject?.name || 'subject'} explained`
          },
          {
            query: `${subject?.name || 'Subject'} ${task.title} practice problems solutions`
          }
        ]

        return {
          taskId: task.id,
          taskName: task.title,
          subjectName: subject?.name || 'Unknown',
          subjectColor: subject?.color_code || '#6750A4',
          tips,
          youtubeSearches
        }
      })
  }, [tasks, subjects, language])

  if (reviewTasks.length === 0) {
    return (
      <section className="rounded-2xl bg-secondary/30 border border-secondary/50 p-6 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Upload schedules to get personalized study recommendations'
            : language === 'pt'
            ? 'Envie cronogramas para obter recomendações de estudo personalizadas'
            : 'Sube agendas para obtener recomendaciones de estudio personalizadas'}
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      {reviewTasks.map(review => (
        <div
          key={review.taskId}
          className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
        >
          {/* Header - Always visible */}
          <button
            onClick={() => setExpandedTaskId(expandedTaskId === review.taskId ? null : review.taskId)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: review.subjectColor }}
              />
              <div className="text-left min-w-0">
                <h3 className="font-semibold text-foreground truncate">{review.taskName}</h3>
                <p className="text-xs text-muted-foreground">{review.subjectName}</p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform',
                expandedTaskId === review.taskId && 'rotate-180'
              )}
            />
          </button>

          {/* Content - Expandable */}
          {expandedTaskId === review.taskId && (
            <div className="border-t border-border px-4 py-4 space-y-4 bg-secondary/5">
              {/* Study Tips */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm text-foreground">
                    {language === 'en'
                      ? 'Study Tips'
                      : language === 'pt'
                      ? 'Dicas de Estudo'
                      : 'Consejos de Estudio'}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {review.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-primary font-semibold flex-shrink-0">{idx + 1}.</span>
                      <span className="text-muted-foreground">{tip.tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* YouTube Recommendations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <h4 className="font-semibold text-sm text-foreground">
                    {language === 'en'
                      ? 'Video Recommendations'
                      : language === 'pt'
                      ? 'Recomendações de Vídeo'
                      : 'Recomendaciones de Video'}
                  </h4>
                </div>
                <div className="space-y-2">
                  {review.youtubeSearches.map((search, idx) => {
                    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(search.query)}`
                    return (
                      <a
                        key={idx}
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <span className="text-primary font-semibold flex-shrink-0 mt-0.5">{idx + 1}.</span>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 break-words">
                          {search.query}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
