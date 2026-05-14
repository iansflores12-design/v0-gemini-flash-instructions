import { ListTodo, CalendarDays, BookOpen } from 'lucide-react'

interface QuickStatsProps {
  totalPending: number
  todayCount: number
  subjectsCount: number
}

export function QuickStats({ totalPending, todayCount, subjectsCount }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        icon={<CalendarDays className="w-5 h-5" />}
        value={todayCount}
        label="Hoy"
        // Usamos primary para el color principal
        color="bg-primary/10 text-primary"
      />
      <StatCard
        icon={<ListTodo className="w-5 h-5" />}
        value={totalPending}
        label="Pendientes"
        // Usamos accent que ya configuramos en el provider para que sea tu color custom
        color="bg-accent/20 text-primary" 
      />
      <StatCard
        icon={<BookOpen className="w-5 h-5" />}
        value={subjectsCount}
        label="Materias"
        // CAMBIO CLAVE: Quitamos 'chart-3' (el verde) y usamos variables del sistema
        color="bg-primary/10 text-primary"
      />
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  color
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/70 bg-card p-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-border/50 dark:shadow-black/20 sm:p-4">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
