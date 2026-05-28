'use client'

import { useState, useRef, useEffect } from 'react'
import { getTasks, getSubjects } from '@/lib/actions'
import { Send, MessageCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [contextLoaded, setContextLoaded] = useState(false)
  const [context, setContext] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load user data context
  useEffect(() => {
    const loadContext = async () => {
      try {
        const [tasks, subjects] = await Promise.all([
          getTasks(),
          getSubjects()
        ])

        const tasksInfo = tasks
          .filter(t => !t.is_done)
          .slice(0, 5)
          .map(t => {
            const subject = subjects.find(s => s.id === t.subject_id)
            return `- ${t.title} (${subject?.name || 'Sin materia'}) - Entrega: ${t.due_date}`
          })
          .join('\n')

        const subjectsInfo = subjects.map(s => `- ${s.name}`).join('\n')

        const contextStr = `Contexto del estudiante:
Materias: ${subjects.length > 0 ? '\n' + subjectsInfo : 'Sin materias registradas'}
Tareas pendientes: ${tasks.filter(t => !t.is_done).length > 0 ? '\n' + tasksInfo : 'Sin tareas pendientes'}
Total de tareas: ${tasks.length}`

        setContext(contextStr)
        setContextLoaded(true)
      } catch (error) {
        console.error('Error loading context:', error)
        setContextLoaded(true)
      }
    }

    loadContext()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || !contextLoaded) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: context,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'No pude procesar tu mensaje.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Lo siento, ocurrió un error. Intenta de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 px-4 py-4 bg-card border-b border-border z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ClearGrade AI</h1>
            <p className="text-xs text-muted-foreground">Asistente de estudio</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Hola! Soy ClearGrade AI</h2>
            <p className="text-muted-foreground max-w-xs">
              Puedo ayudarte con tus materias, tareas y dudas academicas. Preguntame cualquier cosa sobre tu estudio.
            </p>
            {context && (
              <p className="text-xs text-muted-foreground mt-4">
                ✓ Tengo acceso a tu informacion de clases y tareas
              </p>
            )}
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-secondary text-secondary-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 pb-20">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-2xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e as any)
              }
            }}
            placeholder="Escribe tu pregunta aqui..."
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary max-h-24"
            rows={1}
            disabled={loading || !contextLoaded}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !contextLoaded || !input.trim()}
            className="rounded-xl h-10 w-10 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </main>
  )
}
