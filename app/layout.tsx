import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'ClearGrade - Tu asistente de estudio inteligente',
  description: 'Organiza tus tareas y materiales escolares con inteligencia artificial',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ClearGrade',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6750A4' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1B1F' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={geistMono.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'Kollektif';
            src: url('https://fonts.cdnfonts.com/s/15481/Kollektif.woff') format('woff');
            font-weight: 400;
            font-display: swap;
          }
          @font-face {
            font-family: 'Kollektif';
            src: url('https://fonts.cdnfonts.com/s/15481/Kollektif-Bold.woff') format('woff');
            font-weight: 700;
            font-display: swap;
          }
        ` }} />
      </head>
      <body className="font-sans antialiased bg-background min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
