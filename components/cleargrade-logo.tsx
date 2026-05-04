export function ClearGradeLogo({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl',
  className?: string 
}) {
  const dimensions = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-32 h-32",
    xl: "w-48 h-48"
  }

  return (
    <div className={cn("relative flex items-center justify-center", dimensions[size], className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* El círculo de fondo que usa el color principal del tema */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          className="fill-primary" 
        />
        
        {/* El checkmark que cambia según el contraste (foreground de la app o fondo) */}
        <path
          d="M30 50L45 65L72 38"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground dark:text-background"
        />
      </svg>
    </div>
  )
}