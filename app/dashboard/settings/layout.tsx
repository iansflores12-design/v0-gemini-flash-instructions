'use client'

import { ThemeProvider } from '@/components/theme-provider'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
