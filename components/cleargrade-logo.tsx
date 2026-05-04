import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ClearGradeLogo({ className, size = 'md' }: LogoProps) {
  // Dimensiones del contenedor circular exterior
  const containerSizes = {
    sm: "p-2",
    md: "p-4",
    lg: "p-6"
  }

  // Dimensiones del SVG interno
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  }

  return (
    <div className={cn("flex justify-center mb-6 animate-scale-in", className)}>
      {/* Contenedor circular con fondo suave del color del tema */}
      <div className={cn("rounded-full bg-primary/10", containerSizes[size])}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("text-primary", iconSizes[size])}
        >
          {/* Círculo sólido interno que usa el color principal del tema */}
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            className="fill-primary" 
          />
          
          {/* El Checkmark que cambia según el contraste del tema */}
          <path
            d="M32 52L44 64L68 36"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-foreground dark:text-background"
          />
        </svg>
      </div>
    </div>
  )
}