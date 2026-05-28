import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ConfirmedEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
            <Check className="w-10 h-10 text-primary" strokeWidth={3} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Email Confirmado</h1>
          <p className="text-muted-foreground">
            Tu email ha sido confirmado exitosamente. Ahora puedes iniciar sesión en tu cuenta.
          </p>
        </div>

        {/* Button */}
        <Link href="/auth/login" className="block">
          <Button size="lg" className="w-full">
            Ir a Iniciar Sesión
          </Button>
        </Link>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground">
          ¿Problemas? {' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Intenta nuevamente
          </Link>
        </p>
      </div>
    </main>
  )
}
