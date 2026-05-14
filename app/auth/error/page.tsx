import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm text-center animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Error de autenticacion</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Hubo un problema al verificar tu cuenta. Por favor intenta de nuevo.
          </p>
        </div>

        <Link href="/auth/login">
          <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </main>
  )
}
