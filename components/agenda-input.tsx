'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Loader2, Check, X, FileUp, FileText, ChevronRight, Layers, Eye, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTaskWithMaterials } from '@/lib/actions'
import { getFileBatchLimits, getUserPlan } from '@/lib/limits'
import { LimitReachedModal } from '@/components/limit-reached-modal'
import type { Subject, ParsedAgendaItem } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

interface AgendaInputProps {
  subjects: Subject[]
}

interface QueuedFile {
  file: File
  status: 'pending' | 'processing' | 'done' | 'error'
  tasks?: ParsedAgendaItem[]
  error?: string
  previewUrl?: string
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
  const { t } = useLanguage()
  
  // Batch limits and user plan
  const [batchLimits, setBatchLimits] = useState({ filesPerBatch: 3, delayBetweenBatches: 2000, maxFileSize: 10485760 })
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'ultra'>('free')
  const [limitModal, setLimitModal] = useState<{ isOpen: boolean; type: 'files' | 'chat' | 'fileSize'; recommended: 'pro' | 'ultra' }>({
    isOpen: false,
    type: 'files',
    recommended: 'pro'
  })
  
  // Queue of files to process
  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Current file being reviewed
  const [parsedTasks, setParsedTasks] = useState<ParsedAgendaItem[]>([])
  
  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Request notification permission on mount (for mobile)
  useEffect(() => {
    if (isMobile()) {
      requestNotificationPermission()
    }
    
    // Load user's batch limits
    const loadLimits = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const plan = await getUserPlan(user.id)
          setCurrentPlan(plan)
          const limits = await getFileBatchLimits(user.id)
          setBatchLimits(limits)
        }
      } catch (err) {
        console.error('[v0] Error loading batch limits:', err)
      }
    }
    
    loadLimits()
  }, [])

  // Create preview URLs for files
  useEffect(() => {
    fileQueue.forEach((qf, idx) => {
      if (!qf.previewUrl && qf.file.type === 'application/pdf') {
        const url = URL.createObjectURL(qf.file)
        setFileQueue(prev => prev.map((f, i) => 
          i === idx ? { ...f, previewUrl: url } : f
        ))
      }
    })
    
    // Cleanup URLs on unmount
    return () => {
      fileQueue.forEach(qf => {
        if (qf.previewUrl) URL.revokeObjectURL(qf.previewUrl)
      })
    }
  }, [fileQueue.length])

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
          // Handle institution requirement error specially
          if (errData.requiresInstitution) {
            setError(t('requiereInstitucion'))
            setFileQueue(prev => prev.map((f, i) => 
              i === pendingIndex ? { ...f, status: 'error' as const, errorMessage: errData.error } : f
            ))
            setIsProcessingQueue(false)
            return
          }
          throw new Error(errData.error || t('errorProcesar'))
        }
        
        const data = await response.json()
        
        setFileQueue(prev => prev.map((f, i) => 
          i === pendingIndex ? { 
            ...f, 
            status: 'done' as const, 
            tasks: data.tasks || []
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
      
      // Add delay before processing next file (batch delay)
      if (batchLimits.delayBetweenBatches > 0) {
        await new Promise(resolve => setTimeout(resolve, batchLimits.delayBetweenBatches))
      }
    }
    
    processNext()
  }, [isProcessingQueue, fileQueue, batchLimits.delayBetweenBatches, t])

  // Load current file's tasks when index changes
  useEffect(() => {
    const current = fileQueue[currentIndex]
    if (current?.status === 'done' && current.tasks) {
      setParsedTasks(current.tasks)
    } else {
      setParsedTasks([])
    }
    setEditingTaskIndex(null)
  }, [currentIndex, fileQueue])

  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const validFiles: QueuedFile[] = []
    let skippedFiles = 0
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = file.name.toLowerCase()
      const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf'
      const isDOCX = fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      
      // Check file size limit
      if (file.size > batchLimits.maxFileSize) {
        skippedFiles++
        continue
      }
      
      if (isPDF || isDOCX) {
        validFiles.push({ file, status: 'pending' })
      }
    }
    
    if (validFiles.length === 0) {
      if (skippedFiles > 0) {
        setError(`Archivos muy grandes. Máximo: ${Math.round(batchLimits.maxFileSize / 1024 / 1024)}MB`)
      } else {
        setError('Solo se permiten archivos PDF o DOCX')
      }
      return
    }
    
    // Check if we're adding more files than the batch limit allows
    const pendingCount = fileQueue.filter(f => f.status === 'pending').length
    if (pendingCount + validFiles.length > batchLimits.filesPerBatch) {
      // Show limit modal
      if (currentPlan === 'free') {
        setLimitModal({
          isOpen: true,
          type: 'files',
          recommended: 'pro'
        })
      }
      const allowedMore = batchLimits.filesPerBatch - pendingCount
      setError(`Máximo ${batchLimits.filesPerBatch} archivos por lote. Ya tienes ${pendingCount}. Puedes agregar ${Math.max(0, allowedMore)} más.`)
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
    // Check if any task is missing subject
    const missingSubject = parsedTasks.findIndex(t => !t.subject)
    if (missingSubject !== -1) {
      setEditingTaskIndex(missingSubject)
      setError('Completa la materia de todas las tareas antes de guardar')
      return
    }
    
    setSaving(true)
    setError(null)
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
    if (editingTaskIndex === index) setEditingTaskIndex(null)
  }

  const updateTask = (index: number, updates: Partial<ParsedAgendaItem>) => {
    setParsedTasks(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t))
  }

  const clearAll = () => {
    // Cleanup URLs
    fileQueue.forEach(qf => {
      if (qf.previewUrl) URL.revokeObjectURL(qf.previewUrl)
    })
    setFileQueue([])
    setCurrentIndex(0)
    setParsedTasks([])
    setError(null)
    setIsProcessingQueue(false)
    setShowPreview(false)
    setEditingTaskIndex(null)
  }

  const removeFromQueue = (index: number) => {
    const qf = fileQueue[index]
    if (qf.previewUrl) URL.revokeObjectURL(qf.previewUrl)
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
  const hasMissingInfo = parsedTasks.some(t => !t.subject)

  return (
    <section className="space-y-4">
      {/* Limit Reached Modal */}
      <LimitReachedModal
        isOpen={limitModal.isOpen}
        onClose={() => setLimitModal({ ...limitModal, isOpen: false })}
        limitType={limitModal.type}
        currentPlan={currentPlan}
        recommended={limitModal.recommended}
      />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/12 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{t('subeAgendas')}</h2>
          <p className="text-sm text-muted-foreground">{t('multiplesArchivos')}</p>
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
                {fileQueue.length > 0 ? t('agregarMasArchivos') : t('arrastraArchivos')}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {t('oToca')}
              </p>
              <div className="mt-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {t('pdfODocx')}
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
          {/* Current file header with preview button */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{currentFile.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentIndex + 1} de {fileQueue.length} archivos
                </p>
              </div>
              {currentFile.previewUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="rounded-xl"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showPreview ? 'Ocultar' : 'Ver PDF'}
                </Button>
              )}
            </div>
          </div>

          {/* PDF Preview */}
          {showPreview && currentFile.previewUrl && (
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <iframe
                src={currentFile.previewUrl}
                className="w-full h-[400px]"
                title="Vista previa del documento"
              />
            </div>
          )}

          {/* Missing info warning */}
          {hasMissingInfo && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3">
              <Edit3 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Informacion incompleta</p>
                <p className="text-amber-600 dark:text-amber-500">Algunas tareas no tienen materia asignada. Toca en ellas para completar.</p>
              </div>
            </div>
          )}

          {/* Tasks found */}
          <div className="p-5 rounded-3xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
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
                  className={`p-4 rounded-2xl bg-card shadow-sm border-l-4 transition-all ${
                    !task.subject ? 'border-amber-500 ring-2 ring-amber-500/20' : ''
                  } ${editingTaskIndex === index ? 'ring-2 ring-primary/30' : ''}`}
                  style={{ borderLeftColor: task.subject ? (task.subject_color || '#6750A4') : undefined }}
                  onClick={() => setEditingTaskIndex(editingTaskIndex === index ? null : index)}
                >
                  {editingTaskIndex === index ? (
                    // Edit mode
                    <div className="space-y-3" onClick={e => e.stopPropagation()}>
                      <Input
                        value={task.title}
                        onChange={e => updateTask(index, { title: e.target.value })}
                        placeholder="Titulo de la tarea"
                        className="rounded-xl"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Materia *</label>
                          <select
                            value={task.subject || ''}
                            onChange={e => {
                              const subject = subjects.find(s => s.name === e.target.value)
                              updateTask(index, { 
                                subject: e.target.value,
                                subject_color: subject?.color_code
                              })
                            }}
                            className="w-full h-10 rounded-xl bg-secondary/50 border border-input px-3 text-sm"
                          >
                            <option value="">Seleccionar...</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
                          <Input
                            type="date"
                            value={task.due_date}
                            onChange={e => updateTask(index, { due_date: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Descripcion</label>
                        <textarea
                          value={task.description || ''}
                          onChange={e => updateTask(index, { description: e.target.value })}
                          rows={2}
                          className="w-full rounded-xl bg-secondary/50 border border-input px-3 py-2 text-sm resize-none"
                          placeholder="Descripcion opcional..."
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTaskIndex(null)}
                          className="rounded-xl"
                        >
                          Listo
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(index)}
                          className="rounded-xl text-destructive hover:text-destructive"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {task.subject ? (
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${task.subject_color || '#6750A4'}20`,
                                color: task.subject_color || '#6750A4'
                              }}
                            >
                              {task.subject}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1">
                              <Edit3 className="w-3 h-3" />
                              Sin materia
                            </span>
                          )}
                          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                            {task.due_date}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeTask(index) }}
                        className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
