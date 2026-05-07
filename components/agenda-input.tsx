'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Loader2, Check, X, FileUp, FileText, ChevronRight, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createTaskWithMaterials } from '@/lib/actions'
import type { Subject, ParsedAgendaItem } from '@/lib/types'

interface AgendaInputProps {
  subjects: Subject[]
}

interface QueuedFile {
  file: File
  status: 'pending' | 'processing' | 'done' | 'error'
  tasks?: ParsedAgendaItem[]
  error?: string
  fromCache?: boolean
}

// Check if running on mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Play success sound (web only)
const playSuccessSound = () => {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio('/sounds/success.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch {}
}

// Request notification permission
const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Show notification (mobile)
const showNotification = (title: string, body: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  
  try {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'agenda-processed',
    })
  } catch {}
}

export function AgendaInput({ subjects }: AgendaInputProps) {
  // Queue of files to process
  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Current file being reviewed
  const [parsedTasks, setParsedTasks] = useState<ParsedAgendaItem[]>([])
  const [fromCache, setFromCache] = useState(false)
  
  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Request notification permission on mount (for mobile)
  useEffect(() => {
    if (isMobile()) {
      requestNotificationPermission()
    }
  }, [])

  // Process the queue automatically
  useEffect(() => {
    const processNext = async () => {
      if (!isProcessingQueue) return
      
      const pendingIndex = fileQueue.findIndex(f => f.status === 'pending')
      if (pendingIndex === -1) {
        setIsProcessingQueue(false)
        return
      }
      
      // Update status to processing
      setFileQueue(prev => prev.map((f, i) => 
        i === pendingIndex ? { ...f, status: 'processing' as const } : f
      ))
      
      try {
        const file = fileQueue[pendingIndex].file
        const { data: { user } } = await (await import('@/lib/supabase/client')).createClient().auth.getUser()
        if (!user) throw new Error('No autenticado')
        
        const formData = new FormData()
        formData.append('pdf', file)
        formData.append('userId', user.id)
        
        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || 'Error al procesar')
        }
        
        const data = await response.json()
        
        setFileQueue(prev => prev.map((f, i) => 
          i === pendingIndex ? { 
            ...f, 
            status: 'done' as const, 
            tasks: data.tasks || [],
            fromCache: !!data.fromCache
          } : f
        ))
        
        // Success feedback
        if (isMobile()) {
          showNotification('Agenda procesada', `${file.name}: ${data.tasks?.length || 0} tareas`)
        } else {
          playSuccessSound()
        }
        
      } catch (err) {
        setFileQueue(prev => prev.map((f, i) => 
          i === pendingIndex ? { 
            ...f, 
            status: 'error' as const, 
            error: err instanceof Error ? err.message : 'Error desconocido'
          } : f
        ))
      }
    }
    
    processNext()
  }, [isProcessingQueue, fileQueue])

  // Load current file's tasks when index changes
  useEffect(() => {
    const current = fileQueue[currentIndex]
    if (current?.status === 'done' && current.tasks) {
      setParsedTasks(current.tasks)
      setFromCache(!!current.fromCache)
    } else {
      setParsedTasks([])
      setFromCache(false)
    }
  }, [currentIndex, fileQueue])

  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const validFiles: QueuedFile[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = file.name.toLowerCase()
      const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf'
      const isDOCX = fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      
      if (isPDF || isDOCX) {
        validFiles.push({ file, status: 'pending' })
      }
    }
    
    if (validFiles.length === 0) {
      setError('Solo se permiten archivos PDF o DOCX')
      return
    }
    
    setFileQueue(prev => [...prev, ...validFiles])
    setError(null)
    
    // Start processing if not already
    if (!isProcessingQueue) {
      setIsProcessingQueue(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelect(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFilesSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleSaveAndNext = async () => {
    setSaving(true)
    try {
      for (const task of parsedTasks) {
        const result = await createTaskWithMaterials(
          task.title,
          task.due_date,
          task.subject || undefined,
          task.materials || [],
          task.description || undefined,
          task.value || undefined
        )
        
        if ('error' in result) {
          setError(result.error)
          setSaving(false)
          return
        }
      }
      
      // Move to next or clear
      if (currentIndex < fileQueue.length - 1) {
        // Find next done file
        let nextIndex = currentIndex + 1
        while (nextIndex < fileQueue.length && fileQueue[nextIndex].status !== 'done') {
          nextIndex++
        }
        
        if (nextIndex < fileQueue.length) {
          setCurrentIndex(nextIndex)
        } else {
          // No more done files, wait for processing or clear
          const stillProcessing = fileQueue.some(f => f.status === 'pending' || f.status === 'processing')
          if (!stillProcessing) {
            clearAll()
          } else {
            // Move index forward, will auto-load when ready
            setCurrentIndex(currentIndex + 1)
          }
        }
      } else {
        clearAll()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    if (currentIndex < fileQueue.length - 1) {
      let nextIndex = currentIndex + 1
      while (nextIndex < fileQueue.length && fileQueue[nextIndex].status !== 'done') {
        nextIndex++
      }
      if (nextIndex < fileQueue.length) {
        setCurrentIndex(nextIndex)
      }
    } else {
      clearAll()
    }
  }

  const removeTask = (index: number) => {
    setParsedTasks(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setFileQueue([])
    setCurrentIndex(0)
    setParsedTasks([])
    setFromCache(false)
    setError(null)
    setIsProcessingQueue(false)
  }

  const removeFromQueue = (index: number) => {
    setFileQueue(prev => prev.filter((_, i) => i !== index))
    if (index <= currentIndex && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Count files by status
  const pendingCount = fileQueue.filter(f => f.status === 'pending').length
  const processingCount = fileQueue.filter(f => f.status === 'processing').length
  const doneCount = fileQueue.filter(f => f.status === 'done').length
  const currentFile = fileQueue[currentIndex]
  const hasReadyFiles = doneCount > 0

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/12 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Sube tus agendas</h2>
          <p className="text-sm text-muted-foreground">Multiples PDFs o DOCXs</p>
        </div>
        {fileQueue.length > 0 && (
          <button onClick={clearAll} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Queue Status Bar */}
      {fileQueue.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-secondary/50">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1">
            {processingCount > 0 && `Procesando ${processingCount}... `}
            {pendingCount > 0 && `${pendingCount} en cola `}
            {doneCount > 0 && `${doneCount} listos`}
          </span>
          {(processingCount > 0 || pendingCount > 0) && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
        </div>
      )}

      {/* File Upload Area - Always visible to add more */}
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          multiple
          className="hidden"
        />

        {parsedTasks.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative cursor-pointer rounded-3xl border-2 border-dashed 
              transition-all duration-300 ease-out
              ${isDragging 
                ? 'border-primary bg-primary/12 scale-[1.01]' 
                : 'border-outline-variant bg-surface-container hover:border-primary/40 hover:bg-primary/5'
              }
            `}
          >
            <div className="flex flex-col items-center justify-center py-10 px-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <FileUp className="w-8 h-8 text-on-surface-variant" />
              </div>
              <p className="font-medium text-foreground text-center mb-1">
                {fileQueue.length > 0 ? 'Agregar mas archivos' : 'Arrastra tus archivos aqui'}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                o toca para seleccionar varios
              </p>
              <div className="mt-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                PDF o DOCX
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm flex items-center gap-3">
            <X className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Queue List - When files are processing but none ready */}
      {fileQueue.length > 0 && !hasReadyFiles && parsedTasks.length === 0 && (
        <div className="space-y-2">
          {fileQueue.map((qf, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
            >
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground truncate">{qf.file.name}</span>
              {qf.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              {qf.status === 'pending' && <span className="text-xs text-muted-foreground">En cola</span>}
              {qf.status === 'done' && <Check className="w-4 h-4 text-accent" />}
              {qf.status === 'error' && <X className="w-4 h-4 text-destructive" />}
              <button 
                onClick={() => removeFromQueue(idx)}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Current File Review */}
      {parsedTasks.length > 0 && currentFile && (
        <div className="space-y-4">
          {/* Current file header */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{currentFile.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentIndex + 1} de {fileQueue.length} archivos
                </p>
              </div>
              {fromCache && (
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  Cache
                </span>
              )}
            </div>
          </div>

          {/* Tasks found */}
          <div className="p-5 rounded-3xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {parsedTasks.length} {parsedTasks.length === 1 ? 'tarea' : 'tareas'}
                </p>
                <p className="text-sm text-muted-foreground">Revisa antes de guardar</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {parsedTasks.map((task, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-card shadow-sm border-l-4"
                  style={{ borderLeftColor: task.subject_color || '#6750A4' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {task.subject && (
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${task.subject_color || '#6750A4'}20`,
                            color: task.subject_color || '#6750A4'
                          }}
                        >
                          {task.subject}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                        {task.due_date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTask(index)}
                    className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="h-14 rounded-2xl border-2 font-medium px-6"
            >
              Saltar
            </Button>
            <Button
              onClick={handleSaveAndNext}
              disabled={saving || parsedTasks.length === 0}
              className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Guardar {currentIndex < fileQueue.length - 1 ? 'y siguiente' : ''}
                  {currentIndex < fileQueue.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                </>
              )}
            </Button>
          </div>

          {/* Add more files button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm font-medium"
          >
            + Agregar mas archivos
          </button>
        </div>
      )}
    </section>
  )
}
