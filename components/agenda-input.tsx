'use client'

import { useState, useRef } from 'react'
import { Sparkles, Loader2, Check, X, FileUp, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createTaskWithMaterials } from '@/lib/actions'
import type { Subject, ParsedAgendaItem } from '@/lib/types'

interface AgendaInputProps {
  subjects: Subject[]
}

export function AgendaInput({ subjects }: AgendaInputProps) {
  const [loading, setLoading] = useState(false)
  const [parsedTasks, setParsedTasks] = useState<ParsedAgendaItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF')
      return
    }
    setSelectedFile(file)
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleParsePDF = async () => {
    if (!selectedFile) return
    
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('pdf', selectedFile)
      
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Error al procesar el PDF')
      }
      
      const data = await response.json()
      setParsedTasks(data.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      for (const task of parsedTasks) {
        await createTaskWithMaterials(
          task.title,
          task.due_date,
          task.subject || undefined,
          task.materials || []
        )
      }
      setSelectedFile(null)
      setParsedTasks([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const removeTask = (index: number) => {
    setParsedTasks(prev => prev.filter((_, i) => i !== index))
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/12 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Procesar agenda</h2>
          <p className="text-sm text-muted-foreground">Sube tu agenda en PDF</p>
        </div>
      </div>

      {parsedTasks.length === 0 ? (
        <div className="space-y-4">
          {/* Hidden file input - PDF only */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Drop zone / Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative cursor-pointer rounded-3xl border-2 border-dashed 
              transition-all duration-300 ease-out
              ${isDragging 
                ? 'border-primary bg-primary/8 scale-[1.02]' 
                : selectedFile 
                  ? 'border-primary/40 bg-primary/5' 
                  : 'border-outline-variant bg-surface-container hover:border-primary/40 hover:bg-primary/5'
              }
            `}
          >
            <div className="flex flex-col items-center justify-center py-10 px-6">
              {selectedFile ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-primary/12 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-center mb-1">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFile()
                    }}
                    className="mt-3 px-4 py-2 rounded-full text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    Cambiar archivo
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <FileUp className="w-8 h-8 text-on-surface-variant" />
                  </div>
                  <p className="font-medium text-foreground text-center mb-1">
                    Arrastra tu PDF aqui
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    o toca para seleccionar
                  </p>
                  <div className="mt-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    Solo archivos PDF
                  </div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm flex items-center gap-3">
              <X className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleParsePDF}
            disabled={loading || !selectedFile}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base shadow-md hover:shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Procesando PDF...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                Procesar con IA
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {parsedTasks.length} {parsedTasks.length === 1 ? 'tarea encontrada' : 'tareas encontradas'}
                </p>
                <p className="text-sm text-muted-foreground">Revisa antes de guardar</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {parsedTasks.map((task, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-card shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {task.subject && (
                        <span className="px-3 py-1 rounded-full bg-primary/12 text-primary text-xs font-medium">
                          {task.subject}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                        {task.due_date}
                      </span>
                    </div>
                    {task.materials && task.materials.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {task.materials.map((m, i) => (
                          <span 
                            key={i}
                            className="text-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant"
                          >
                            {m.quantity ? `${m.quantity} ` : ''}{m.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeTask(index)}
                    className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setParsedTasks([])
                setSelectedFile(null)
                setError(null)
              }}
              className="flex-1 h-14 rounded-2xl border-2 font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Guardar todo
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
