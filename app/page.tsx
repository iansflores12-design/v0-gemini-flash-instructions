
import Link from 'next/link'
import { BookOpen, Sparkles, CheckCircle2, Calendar, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 pt-12 pb-16">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary mb-6 animate-scale-in">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3 text-balance animate-slide-up">
            Organiza tu vida escolar con IA
          </h1>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-slide-up">
            Escribe o fotografía tu agenda y StudyFlow organizará automáticamente tus tareas y materiales.
          </p>

          <div className="flex flex-col gap-3 animate-slide-up">
            <Link href="/auth/sign-up">
              <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg">
                Comenzar gratis
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full h-14 rounded-2xl text-primary font-medium text-base">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 bg-secondary/30">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-foreground text-center mb-8">
            Como funciona
          </h2>

          <div className="space-y-4">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="IA que entiende tu agenda"
              description="Escribe como quieras. La IA extrae tareas, fechas y materiales automaticamente."
              color="bg-primary/10 text-primary"
            />

            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Fechas siempre claras"
              description="Visualiza tus entregas por dia, semana o mes. Nunca olvides una fecha importante."
              color="bg-accent/10 text-accent"
            />

            <FeatureCard
              icon={<Package className="w-6 h-6" />}
              title="Materiales organizados"
              description="Sabe exactamente que llevar cada dia. Todo en un solo lugar."
              color="bg-chart-3/20 text-chart-3"
            />

            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Progreso visible"
              description="Marca tareas completadas y celebra tu avance. Mantente motivado."
              color="bg-chart-2/20 text-chart-2"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3 text-balance">
            Empieza a organizar tu semana
          </h2>
          <p className="text-muted-foreground mb-6">
            Gratis. Sin tarjeta. Sin complicaciones.
          </p>
          <Link href="/auth/sign-up">
            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg">
              Crear mi cuenta
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
