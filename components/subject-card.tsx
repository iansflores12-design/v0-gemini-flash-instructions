'use client'

import { useState } from 'react'
import { BookOpen, Trash2, MoreVertical, AlertTriangle, Palette } from 'lucide-react'
import { deleteSubject, updateSubjectColor } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SubjectCardProps {
  subject: {
    id: string
    name: string
    color_code: string
  }
  taskCount: number
}

const COLOR_PRESETS = [
  '#516435', '#99be64', '#090c04', '#171d10',
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
  '#1abc9c', '#3498db', '#9b59b6', '#e91e63',
  '#00bcd4', '#ff5722', '#795548', '#607d8b',
]

export function SubjectCard({ subject, taskCount }: SubjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showColorDialog, setShowColorDialog] = useState(false)
  const [selectedColor, setSelectedColor] = useState(subject.color_code)
  const [isSavingColor, setIsSavingColor] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteSubject(subject.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error deleting subject:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveColor = async () => {
    setIsSavingColor(true)
    try {
      await updateSubjectColor(subject.id, selectedColor)
      setShowColorDialog(false)
    } finally {
      setIsSavingColor(false)
    }
  }

  return (
    <>
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${subject.color_code}20` }}
        >
          <BookOpen 
            className="w-6 h-6" 
            style={{ color: subject.color_code }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{subject.name}</p>
          <p className="text-sm text-muted-foreground">
            {taskCount} {taskCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}
          </p>
        </div>
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: subject.color_code }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedColor(subject.color_code); setShowColorDialog(true) }}>
              <Palette className="h-4 w-4 mr-2" />
              Cambiar color
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar materia
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Color Picker Dialog */}
      <Dialog open={showColorDialog} onOpenChange={setShowColorDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Color de la materia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl border-2 border-border shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">{subject.name}</p>
                <p className="text-sm text-muted-foreground">{selectedColor}</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border shrink-0">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full h-full cursor-pointer"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Colores rapidos</p>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? 'var(--foreground)' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowColorDialog(false)} className="flex-1 rounded-xl">
                Cancelar
              </Button>
              <Button onClick={handleSaveColor} disabled={isSavingColor} className="flex-1 rounded-xl">
                {isSavingColor ? 'Guardando...' : 'Guardar color'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold">Eliminar materia</h2>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>
                Estas a punto de eliminar la materia <strong>{subject.name}</strong>.
              </p>
              <p className="text-destructive font-medium">
                Esto eliminara todas las tareas ({taskCount}) y materiales asociados a esta materia. Esta accion no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Si, eliminar todo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
