'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListTodo, User, MessageCircle, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'Tareas' },
  { href: '/dashboard/subjects', icon: BookOpen, label: 'Materias' },
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/dashboard/profile', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe pt-2 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md rounded-[1.75rem] border border-border/70 bg-card/90 px-1 py-1.5 shadow-lg shadow-black/10 backdrop-blur-xl dark:border-border/50 dark:bg-card/85 dark:shadow-black/40">
        <div className="flex items-center justify-around">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || 
              (href !== '/dashboard' && pathname.startsWith(href))
            
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-w-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition-all duration-200',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200',
                  isActive && 'bg-primary/12 ring-1 ring-primary/20'
                )}>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  'text-[11px] leading-tight',
                  isActive && 'font-semibold'
                )}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
