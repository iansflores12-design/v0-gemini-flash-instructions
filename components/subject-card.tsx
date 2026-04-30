'use client'

import { useState } from 'react'
import { BookOpen, Trash2, MoreVertical, AlertTriangle } from 'lucide-react'
import { deleteSubject } from '@/lib/actions'
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

interface SubjectCardProps {
  subject: {
    id: string
    name: string
    color_code: string
  }
  taskCount: number
}

export function SubjectCard({ subject, taskCount }: SubjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
