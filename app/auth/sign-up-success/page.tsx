import { Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ClearGradeLogo } from '@/components/cleargrade-logo'

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm text-center animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <ClearGradeLogo size="md" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Revisa tu correo</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Te hemos enviado un enlace de confirmacion. Haz clic en el para activar tu cuenta.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/50 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>ClearGrade</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
            <Button className="w-full h-12 rounded-xl gap-2">
              <Mail className="w-4 h-4" />
              Abrir Gmail
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full h-12 rounded-xl">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
