'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Loader2, X, Sparkles, Paperclip, FileText, ImageIcon, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChatMessage } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

interface AttachedFile {
  file: File
  preview?: string // for images
}

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]

const MAX_FILE_SIZE_MB = 10

function FileChip({ attached, onRemove }: { attached: AttachedFile; onRemove: () => void }) {
  const isImage = attached.file.type.startsWith('image/')
  return (
    <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-2.5 py-1.5 max-w-[160px]">
      {isImage && attached.preview ? (
        <img src={attached.preview} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
      ) : (
        <FileText className="w-4 h-4 text-primary shrink-0" />
      )}
      <span className="text-xs text-foreground truncate">{attached.file.name}</span>
      <button onClick={onRemove} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
        <XCircle className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function AIChat() {
  const { language } = useLanguage()
  const ui = {
    es: {
      intro: 'Hola! Soy ClearGrade AI. Tengo acceso a tus tareas y materias para ayudarte mejor. Puedes preguntarme sobre tus pendientes, subir fotos de apuntes o documentos. Como te ayudo?',
      filesLabel: 'Archivos',
      assistantFallback: 'Lo siento, no pude procesar tu mensaje.',
      genericError: 'Ocurrio un error. Intenta de nuevo.',
      openChat: 'Abrir chat',
      headerSubtitle: 'Con acceso a tus tareas',
      thinking: 'Pensando...',
      attachTitle: 'Adjuntar imagen o documento',
      inputPlaceholder: 'Pregunta algo o arrastra un archivo...',
      footerHint: 'Fotos, PDF, Word, TXT - max 10 MB - Enter para enviar',
    },
    en: {
      intro: 'Hi! I am ClearGrade AI. I can access your tasks and subjects to help you better. Ask about pending work, upload note photos, or share documents. How can I help you?',
      filesLabel: 'Files',
      assistantFallback: 'Sorry, I could not process your message.',
      genericError: 'An error occurred. Please try again.',
      openChat: 'Open chat',
      headerSubtitle: 'With access to your tasks',
      thinking: 'Thinking...',
      attachTitle: 'Attach image or document',
      inputPlaceholder: 'Ask something or drop a file...',
      footerHint: 'Photos, PDF, Word, TXT - max 10 MB - Press Enter to send',
    },
    pt: {
      intro: 'Ola! Eu sou o ClearGrade AI. Tenho acesso as suas tarefas e materias para ajudar melhor. Voce pode perguntar sobre pendencias, enviar fotos de anotacoes ou documentos. Como posso ajudar?',
      filesLabel: 'Arquivos',
      assistantFallback: 'Desculpe, nao consegui processar sua mensagem.',
      genericError: 'Ocorreu um erro. Tente novamente.',
      openChat: 'Abrir chat',
      headerSubtitle: 'Com acesso as suas tarefas',
      thinking: 'Pensando...',
      attachTitle: 'Anexar imagem ou documento',
      inputPlaceholder: 'Pergunte algo ou arraste um arquivo...',
      footerHint: 'Fotos, PDF, Word, TXT - max 10 MB - Enter para enviar',
    },
  }[language]

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: ui.intro,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].id !== '1' || prev[0].role !== 'assistant') return prev
      return [{ ...prev[0], content: ui.intro }]
    })
  }, [ui.intro])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'
  }, [input])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addFiles(files)
    e.target.value = ''
  }

  const addFiles = (files: File[]) => {
    const valid = files.filter(f => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) return false
      return true
    })

    const newAttached: AttachedFile[] = valid.map(file => {
      const attached: AttachedFile = { file }
      if (file.type.startsWith('image/')) {
        attached.preview = URL.createObjectURL(file)
      }
      return attached
    })

    setAttachedFiles(prev => [...prev, ...newAttached].slice(0, 5)) // max 5 files
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => {
      const copy = [...prev]
      if (copy[index].preview) URL.revokeObjectURL(copy[index].preview!)
      copy.splice(index, 1)
      return copy
    })
  }

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || loading) return

    const userContent = input.trim()
    const hasFiles = attachedFiles.length > 0

    // Build display content
    let displayContent = userContent
    if (hasFiles) {
      const names = attachedFiles.map(a => a.file.name).join(', ')
      displayContent = userContent ? `${userContent}\n[${ui.filesLabel}: ${names}]` : `[${ui.filesLabel}: ${names}]`
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    const filesToSend = [...attachedFiles]
    setAttachedFiles([])
    setLoading(true)

    try {
      let body: FormData | string
      let headers: Record<string, string> = {}

      if (hasFiles) {
        const fd = new FormData()
        fd.append('message', userContent)
        fd.append('history', JSON.stringify(messages.slice(-10)))
        for (const a of filesToSend) {
          fd.append('files', a.file, a.file.name)
        }
        body = fd
      } else {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify({ message: userContent, history: messages.slice(-10) })
      }

      const response = await fetch('/api/chat', { method: 'POST', headers, body })
      const data = await response.json()

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || ui.assistantFallback,
        timestamp: new Date()
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ui.genericError,
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
      // Cleanup object URLs
      filesToSend.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Drag-and-drop onto chat
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addFiles(Array.from(e.dataTransfer.files))
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 z-50"
        aria-label={ui.openChat}
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>
    )
  }

  return (
    <div
      className="fixed inset-x-4 bottom-24 top-auto max-h-[70vh] bg-card rounded-3xl shadow-2xl border border-border flex flex-col z-50 overflow-hidden"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">ClearGrade AI</p>
            <p className="text-xs text-muted-foreground">{ui.headerSubtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-secondary text-secondary-foreground rounded-bl-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary p-3 rounded-2xl rounded-bl-md flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{ui.thinking}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-border shrink-0">
        {/* File chips */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachedFiles.map((a, i) => (
              <FileChip key={i} attached={a} onRemove={() => removeFile(i)} />
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-secondary hover:bg-secondary/70 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
            title={ui.attachTitle}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileChange}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ui.inputPlaceholder}
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl bg-secondary/50 border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 leading-relaxed"
          />

          {/* Send */}
          <Button
            onClick={handleSend}
            disabled={loading || (!input.trim() && attachedFiles.length === 0)}
            className="shrink-0 w-10 h-10 rounded-xl p-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-1.5 px-1">
          {ui.footerHint}
        </p>
      </div>
    </div>
  )
}
