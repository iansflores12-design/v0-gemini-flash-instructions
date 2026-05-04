function applyTokens(theme: Theme, isDark: boolean, customColor: string | null) {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  const tokens = isDark ? theme.dark : theme.light

  // 1. Limpiar rastro de temas anteriores
  ALL_VARS.forEach(v => root.style.removeProperty(v))

  // 2. Aplicar tokens base del tema
  Object.entries(tokens).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
  })

  // 3. Lógica Material 3 Expressive (Look Premium)
  if (customColor && theme.id === 'm3e') {
    const primaryColor = customColor
    
    // Colores base de marca
    root.style.setProperty('--primary', primaryColor)
    root.style.setProperty('--ring', primaryColor)
    root.style.setProperty('--primary-foreground', isDark ? '#ffffff' : '#ffffff')

    if (isDark) {
      // MODO OSCURO "MATERIAL NEUTRO" (Sin el tono verde/sucio)
      // Usamos un gris neutro muy oscuro como base para el color-mix
      const neutralDark = 'rgb(10, 10, 12)' 
      
      root.style.setProperty('--background', `color-mix(in srgb, ${primaryColor} 5%, ${neutralDark})`)
      root.style.setProperty('--foreground', 'oklch(0.95 0.01 135)') // Texto casi blanco
      
      // Tarjetas (un poco más claras para dar profundidad)
      root.style.setProperty('--card', `color-mix(in srgb, ${primaryColor} 8%, rgb(24, 24, 27))`)
      root.style.setProperty('--card-foreground', 'oklch(0.90 0.01 135)')
      
      // Muted y Secondary (Chips y Hovers) - Menos saturación para que no brille feo
      root.style.setProperty('--muted', `color-mix(in srgb, ${primaryColor} 12%, transparent)`)
      root.style.setProperty('--muted-foreground', 'oklch(0.70 0.01 135)')
      root.style.setProperty('--secondary', `color-mix(in srgb, ${primaryColor} 15%, transparent)`)
      root.style.setProperty('--accent', `color-mix(in srgb, ${primaryColor} 25%, transparent)`)
      
      // Bordes sutiles
      root.style.setProperty('--border', `color-mix(in srgb, ${primaryColor} 20%, rgb(39, 39, 42))`)
      root.style.setProperty('--input', `color-mix(in srgb, ${primaryColor} 10%, rgb(39, 39, 42))`)

    } else {
      // MODO CLARO "CLEAN"
      root.style.setProperty('--background', `color-mix(in srgb, ${primaryColor} 2%, #fdfdfd)`)
      root.style.setProperty('--card', '#ffffff')
      root.style.setProperty('--foreground', 'oklch(0.20 0.01 135)') // Texto gris muy oscuro
      
      root.style.setProperty('--muted', `color-mix(in srgb, ${primaryColor} 8%, #f1f5f9)`)
      root.style.setProperty('--secondary', `color-mix(in srgb, ${primaryColor} 12%, #f1f5f9)`)
      root.style.setProperty('--border', `color-mix(in srgb, ${primaryColor} 15%, #e2e8f0)`)
    }
  }

  root.classList.toggle('dark', isDark)
}