'use client'

import { useEffect, useState } from 'react'

export function LogoImage() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check initial dark mode
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)

    // Listen for dark mode changes
    const observer = new MutationObserver(() => {
      const darkMode = document.documentElement.classList.contains('dark')
      setIsDark(darkMode)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  if (!mounted) {
    return (
      <img
        src="/cleargrade-icon-monet.png"
        alt="ClearGrade logo"
        className="w-20 h-20 rounded-3xl"
      />
    )
  }

  return (
    <img
      src="/cleargrade-icon-monet.png"
      alt="ClearGrade logo"
      className="w-20 h-20 rounded-3xl transition-all duration-300"
      style={{
        filter: isDark ? 'brightness(1.2) invert(0.1)' : 'brightness(1)',
      }}
    />
  )
}
