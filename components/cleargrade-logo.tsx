import Image from 'next/image'

export function ClearGradeLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 64, height: 64 },
    lg: { width: 128, height: 128 },
  }

  const dim = dimensions[size]

  return (
    <div className="relative w-fit">
      <Image
        src="/logo-cleargrade.svg"
        alt="ClearGrade Logo"
        width={dim.width}
        height={dim.height}
        priority
        className="w-full h-full"
      />
    </div>
  )
}
