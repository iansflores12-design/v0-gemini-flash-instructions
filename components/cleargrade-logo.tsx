import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface ClearGradeLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function ClearGradeLogo({ size = 'md', showText = true }: ClearGradeLogoProps) {
  const sizes = {
    sm: { logo: 'w-8 h-8', text: 'text-lg' },
    md: { logo: 'w-10 h-10', text: 'text-xl' },
    lg: { logo: 'w-14 h-14', text: 'text-2xl' },
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size].logo} rounded-xl bg-primary flex items-center justify-center`}>
        <Check className="w-2/3 h-2/3 text-primary-foreground" strokeWidth={3} />
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-foreground`}>
          ClearGrade
        </span>
      )}
    </div>
  )
}

export type SuccessCheckSectionProps = {
  children?: ReactNode;
  iconSize?: 12 | 14 | 16 | 20;
  strokeWidth?: number;
  sectionClassName?: string;
  innerClassName?: string;
  iconRowClassName?: string;
  circleClassName?: string;
};

const sizeMap: Record<NonNullable<SuccessCheckSectionProps["iconSize"]>, string> =
  {
    12: "w-12 h-12",
    14: "w-14 h-14",
    16: "w-16 h-16",
    20: "w-20 h-20",
  };

function merge(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Sección de éxito: layout centrado + check en círculo (primary/10) + contenido opcional.
 * Requiere: `lucide-react`, Tailwind con color `primary`, clase `animate-scale-in` si la usas.
 */
export function SuccessCheckSection({
  children,
  iconSize = 16,
  strokeWidth = 2.5,
  sectionClassName,
  innerClassName,
  iconRowClassName,
  circleClassName,
}: SuccessCheckSectionProps) {
  return (
    <section className={merge("px-4 pt-20 pb-16", sectionClassName)}>
      <div className={merge("max-w-md mx-auto text-center", innerClassName)}>
        <div
          className={merge(
            "flex justify-center mb-6 animate-scale-in",
            iconRowClassName,
          )}
        >
          <div
            className={merge(
              "p-4 rounded-full bg-primary/10",
              circleClassName,
            )}
          >
            <Check
              className={merge(sizeMap[iconSize], "text-primary")}
              strokeWidth={strokeWidth}
              aria-hidden
            />
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
