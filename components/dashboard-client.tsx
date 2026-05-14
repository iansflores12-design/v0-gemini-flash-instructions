'use client'

import { BottomNav } from '@/components/bottom-nav'
import { AIChat } from '@/components/ai-chat'

export function DashboardClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {children}
      <AIChat />
      <BottomNav />
    </div>
  )
}
