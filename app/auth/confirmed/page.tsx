import Link from 'next/link'
import { CheckCircle2, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmailConfirmedPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Card */}
        <div className="bg-card rounded-3xl border border-border p-8 text-center shadow-lg">
          {/* Animated checkmark */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Correo verificado
          </h1>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Tu cuenta ha sido verificada exitosamente. Ya puedes comenzar a usar ClearGrade para organizar tus estudios.
          </p>

          <Link href="/dashboard">
            <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg group">
              Ir a ClearGrade
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Footer branding */}
        <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-medium">ClearGrade</span>
        </div>
      </div>
    </main>
  )
}
