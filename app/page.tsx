import Link from 'next/link'
import { Sparkles, CheckCircle2, Calendar, Package, FileUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { FooterEasterEgg } from '@/components/footer-easter-egg'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top bar with dark mode toggle */}
      <div className="flex justify-end px-4 pt-4">
        <DarkModeToggle />
      </div>

      {/* Hero Section */}
      <section className="px-4 pt-20 pb-16">
        <div className="max-w-md mx-auto text-center">
          {/* Check Icon */}
          <div className="flex justify-center mb-6 animate-scale-in">
            <div className="p-4 rounded-full bg-primary/10">
              <Check className="w-16 h-16 text-primary" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-3 text-balance animate-slide-up tracking-tight">
            ClearGrade
          </h1>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-slide-up">
            Sube tu agenda PDF/DOCX y ClearGrade organizará automáticamente tus tareas y materiales.
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

      {/* Upload Preview Card */}
      <section className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileUp className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Sube tu agenda</h3>
                <p className="text-sm text-muted-foreground">PDF o DOCX</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nuestra IA extrae automáticamente tareas, fechas de entrega, materiales y los organiza por materia y semana.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Corregido fondo para modo oscuro y eliminado verdes/azules */}
      <section className="px-4 py-12 bg-muted/20 border-y border-border/50">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-center mb-8">
            Como funciona
          </h2>

          <div className="space-y-4">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="IA que entiende tu agenda"
              description="Sube tu PDF o DOCX. La IA extrae tareas, fechas y materiales automáticamente."
              color="bg-primary/10 text-primary"
            />

            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Organizado por semana"
              description="Visualiza tus entregas por semana. Cada tarea muestra descripción, valor y materiales."
              color="bg-primary/10 text-primary"
            />

            <FeatureCard
              icon={<Package className="w-6 h-6" />}
              title="Materiales organizados"
              description="Ve los materiales de la semana en formato de lista. Todo en un solo lugar."
              color="bg-primary/10 text-primary"
            />

            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Progreso visible"
              description="Marca tareas completadas y agrégalas a Google Calendar."
              color="bg-primary/10 text-primary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3 text-balance">
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

      {/* Footer */}
      <footer className="px-4 py-10 border-t border-border">
        <div className="max-w-md mx-auto text-center">
          <FooterEasterEgg />
        </div>
      </footer>
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
    <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm transition-all">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}