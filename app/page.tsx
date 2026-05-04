// ... (mismos imports que ya tienes)

export default async function LandingPage() {
  // ... (misma lógica de auth)

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top bar */}
      <div className="flex justify-end px-4 pt-4">
        <DarkModeToggle />
      </div>

      {/* Hero Section */}
      <section className="px-4 pt-20 pb-16">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6 animate-scale-in">
            <div className="p-4 rounded-full bg-primary/10">
              <Check className="w-16 h-16 text-primary" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 tracking-tight">ClearGrade</h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Sube tu agenda PDF/DOCX y ClearGrade organizará automáticamente tus tareas y materiales.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/sign-up">
              <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-medium text-lg">
                Comenzar gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - CAMBIO: bg-muted/50 para que en oscuro sea negro real */}
      <section className="px-4 py-12 bg-muted/30 border-y border-border/50">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-center mb-8">Cómo funciona</h2>

          <div className="space-y-4">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="IA que entiende tu agenda"
              description="Sube tu PDF o DOCX. La IA extrae tareas, fechas y materiales automáticamente."
              // Eliminamos colores fijos
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
              // FIX: Quitamos chart-3 (verde)
              color="bg-primary/10 text-primary"
            />

            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Progreso visible"
              description="Marca tareas completadas y agrégalas a Google Calendar."
              // FIX: Quitamos chart-2 (azul)[cite: 1, 2]
              color="bg-primary/10 text-primary"
            />
          </div>
        </div>
      </section>

      {/* ... (resto del CTA y Footer)[cite: 2] */}
    </main>
  )
}

// El componente FeatureCard ahora es más limpio[cite: 2]
function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
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