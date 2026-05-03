// ClearGrade Theme System - 40 themes (20 light + 20 dark)
export interface Theme {
  id: string
  name: string
  description: string
  isDark?: boolean
  preview: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  css: string
}

export const themes: Theme[] = [
  // LIGHT THEMES
  {
    id: 'm3e',
    name: 'Material 3 Expressive',
    description: 'Soporte Monet, colores dinamicos Android 12+',
    preview: { primary: '#6750A4', secondary: '#E8DEF8', accent: '#4FC3F7', background: '#FFFBFE' },
    css: `
      --background: oklch(0.98 0.005 270);
      --foreground: oklch(0.15 0.02 270);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.15 0.02 270);
      --primary: oklch(0.45 0.18 270);
      --primary-foreground: oklch(0.98 0.005 270);
      --secondary: oklch(0.92 0.03 270);
      --secondary-foreground: oklch(0.25 0.08 270);
      --muted: oklch(0.95 0.01 270);
      --muted-foreground: oklch(0.45 0.02 270);
      --accent: oklch(0.65 0.15 180);
      --accent-foreground: oklch(0.15 0.05 180);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.90 0.02 270);
      --input: oklch(0.95 0.01 270);
      --ring: oklch(0.45 0.18 270);
      --radius: 1rem;
    `
  },
  {
    id: 'm3e-dark',
    name: 'Material 3 Expressive (Oscuro)',
    description: 'Dark mode con colores dinamicos',
    isDark: true,
    preview: { primary: '#CFB8FF', secondary: '#4A4458', accent: '#4FC3F7', background: '#1C1B20' },
    css: `
      --background: oklch(0.12 0.01 270);
      --foreground: oklch(0.92 0.02 270);
      --card: oklch(0.18 0.01 270);
      --card-foreground: oklch(0.92 0.02 270);
      --primary: oklch(0.72 0.18 270);
      --primary-foreground: oklch(0.12 0.01 270);
      --secondary: oklch(0.32 0.03 270);
      --secondary-foreground: oklch(0.90 0.02 270);
      --muted: oklch(0.25 0.01 270);
      --muted-foreground: oklch(0.70 0.02 270);
      --accent: oklch(0.70 0.15 180);
      --accent-foreground: oklch(0.15 0.05 180);
      --destructive: oklch(0.72 0.22 25);
      --border: oklch(0.25 0.02 270);
      --input: oklch(0.20 0.01 270);
      --ring: oklch(0.72 0.18 270);
      --radius: 1rem;
    `
  },
  {
    id: 'liquid-glass',
    name: 'iOS Liquid Glass',
    description: 'Blurs profundos, botones translucidos, esquinas 28px',
    preview: { primary: '#007AFF', secondary: 'rgba(255,255,255,0.7)', accent: '#5AC8FA', background: '#F2F2F7' },
    css: `
      --background: oklch(0.96 0.005 240);
      --foreground: oklch(0.10 0.01 240);
      --card: oklch(1 0 0 / 0.72);
      --card-foreground: oklch(0.10 0.01 240);
      --primary: oklch(0.55 0.20 250);
      --primary-foreground: oklch(1 0 0);
      --secondary: oklch(0.95 0.01 240 / 0.8);
      --secondary-foreground: oklch(0.30 0.05 240);
      --muted: oklch(0.92 0.005 240 / 0.6);
      --muted-foreground: oklch(0.50 0.02 240);
      --accent: oklch(0.70 0.15 200);
      --accent-foreground: oklch(0.15 0.05 200);
      --destructive: oklch(0.60 0.25 25);
      --border: oklch(0.88 0.01 240 / 0.5);
      --input: oklch(0.96 0.005 240 / 0.8);
      --ring: oklch(0.55 0.20 250);
      --radius: 1.75rem;
    `
  },
  {
    id: 'liquid-glass-dark',
    name: 'iOS Liquid Glass (Oscuro)',
    description: 'Blurs profundos en modo oscuro, estilo iOS 17+',
    isDark: true,
    preview: { primary: '#64B5F6', secondary: 'rgba(28,28,30,0.8)', accent: '#5AC8FA', background: '#0C0C0D' },
    css: `
      --background: oklch(0.08 0.01 240);
      --foreground: oklch(0.95 0.01 240);
      --card: oklch(0.15 0.01 240 / 0.75);
      --card-foreground: oklch(0.95 0.01 240);
      --primary: oklch(0.70 0.20 250);
      --primary-foreground: oklch(0.08 0.01 240);
      --secondary: oklch(0.20 0.01 240 / 0.85);
      --secondary-foreground: oklch(0.90 0.02 240);
      --muted: oklch(0.18 0.01 240 / 0.6);
      --muted-foreground: oklch(0.70 0.02 240);
      --accent: oklch(0.75 0.15 200);
      --accent-foreground: oklch(0.08 0.01 240);
      --destructive: oklch(0.70 0.25 25);
      --border: oklch(0.20 0.01 240 / 0.5);
      --input: oklch(0.15 0.01 240 / 0.8);
      --ring: oklch(0.70 0.20 250);
      --radius: 1.75rem;
    `
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Sin divisorias, maximo espacio en blanco',
    preview: { primary: '#424242', secondary: '#FAFAFA', accent: '#9E9E9E', background: '#FFFFFF' },
    css: `
      --background: oklch(1 0 0);
      --foreground: oklch(0.30 0 0);
      --card: oklch(0.99 0 0);
      --card-foreground: oklch(0.30 0 0);
      --primary: oklch(0.35 0 0);
      --primary-foreground: oklch(0.98 0 0);
      --secondary: oklch(0.98 0 0);
      --secondary-foreground: oklch(0.35 0 0);
      --muted: oklch(0.96 0 0);
      --muted-foreground: oklch(0.55 0 0);
      --accent: oklch(0.65 0 0);
      --accent-foreground: oklch(0.98 0 0);
      --destructive: oklch(0.55 0.15 25);
      --border: oklch(0.95 0 0);
      --input: oklch(0.98 0 0);
      --ring: oklch(0.35 0 0);
      --radius: 0.5rem;
    `
  },
  {
    id: 'zen-dark',
    name: 'Zen (Oscuro)',
    description: 'Minimalismo extremo en modo oscuro',
    isDark: true,
    preview: { primary: '#E0E0E0', secondary: '#1A1A1A', accent: '#666666', background: '#000000' },
    css: `
      --background: oklch(0 0 0);
      --foreground: oklch(0.85 0 0);
      --card: oklch(0.08 0 0);
      --card-foreground: oklch(0.85 0 0);
      --primary: oklch(0.88 0 0);
      --primary-foreground: oklch(0 0 0);
      --secondary: oklch(0.12 0 0);
      --secondary-foreground: oklch(0.80 0 0);
      --muted: oklch(0.18 0 0);
      --muted-foreground: oklch(0.60 0 0);
      --accent: oklch(0.55 0 0);
      --accent-foreground: oklch(0.88 0 0);
      --destructive: oklch(0.70 0.15 25);
      --border: oklch(0.15 0 0);
      --input: oklch(0.10 0 0);
      --ring: oklch(0.88 0 0);
      --radius: 0.5rem;
    `
  },
  {
    id: 'miami',
    name: 'Miami',
    description: 'Gradientes vibrantes de rosa a azul cielo',
    preview: { primary: '#FF6B9D', secondary: '#87CEEB', accent: '#FFB347', background: '#FFF0F5' },
    css: `
      --background: oklch(0.97 0.02 350);
      --foreground: oklch(0.20 0.05 280);
      --card: oklch(0.99 0.01 350);
      --card-foreground: oklch(0.20 0.05 280);
      --primary: oklch(0.70 0.20 350);
      --primary-foreground: oklch(0.98 0.01 350);
      --secondary: oklch(0.85 0.08 220);
      --secondary-foreground: oklch(0.25 0.05 220);
      --muted: oklch(0.94 0.02 350);
      --muted-foreground: oklch(0.50 0.05 350);
      --accent: oklch(0.80 0.15 70);
      --accent-foreground: oklch(0.20 0.05 70);
      --destructive: oklch(0.60 0.25 25);
      --border: oklch(0.90 0.05 350);
      --input: oklch(0.97 0.02 350);
      --ring: oklch(0.70 0.20 350);
      --radius: 1.5rem;
    `
  },
  {
    id: 'miami-dark',
    name: 'Miami (Oscuro)',
    description: 'Vibrant dark mode con gradientes neon',
    isDark: true,
    preview: { primary: '#FF5E7E', secondary: '#2D5F7F', accent: '#FFB347', background: '#0D0B10' },
    css: `
      --background: oklch(0.10 0.05 320);
      --foreground: oklch(0.95 0.03 350);
      --card: oklch(0.16 0.06 320);
      --card-foreground: oklch(0.95 0.03 350);
      --primary: oklch(0.68 0.25 340);
      --primary-foreground: oklch(0.10 0.05 320);
      --secondary: oklch(0.30 0.08 220);
      --secondary-foreground: oklch(0.90 0.04 220);
      --muted: oklch(0.22 0.04 320);
      --muted-foreground: oklch(0.70 0.04 320);
      --accent: oklch(0.78 0.20 70);
      --accent-foreground: oklch(0.10 0.05 70);
      --destructive: oklch(0.70 0.28 25);
      --border: oklch(0.28 0.08 320);
      --input: oklch(0.15 0.04 320);
      --ring: oklch(0.68 0.25 340);
      --radius: 1.5rem;
    `
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Fondo oscuro con rosa, morado y verde neon',
    preview: { primary: '#BD93F9', secondary: '#44475A', accent: '#50FA7B', background: '#282A36' },
    css: `
      --background: oklch(0.22 0.03 270);
      --foreground: oklch(0.95 0.02 60);
      --card: oklch(0.28 0.04 270);
      --card-foreground: oklch(0.95 0.02 60);
      --primary: oklch(0.72 0.18 300);
      --primary-foreground: oklch(0.15 0.02 270);
      --secondary: oklch(0.35 0.04 270);
      --secondary-foreground: oklch(0.90 0.02 60);
      --muted: oklch(0.30 0.03 270);
      --muted-foreground: oklch(0.70 0.02 60);
      --accent: oklch(0.85 0.25 145);
      --accent-foreground: oklch(0.15 0.02 145);
      --destructive: oklch(0.65 0.25 350);
      --border: oklch(0.38 0.04 270);
      --input: oklch(0.30 0.03 270);
      --ring: oklch(0.72 0.18 300);
      --radius: 0.75rem;
    `
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    description: 'Rejillas retro y colores neon ochenteros',
    preview: { primary: '#FF00FF', secondary: '#00FFFF', accent: '#FFFF00', background: '#0D0221' },
    css: `
      --background: oklch(0.10 0.06 300);
      --foreground: oklch(0.95 0.02 320);
      --card: oklch(0.15 0.08 300);
      --card-foreground: oklch(0.95 0.02 320);
      --primary: oklch(0.70 0.35 320);
      --primary-foreground: oklch(0.10 0.06 300);
      --secondary: oklch(0.80 0.25 195);
      --secondary-foreground: oklch(0.10 0.06 300);
      --muted: oklch(0.18 0.06 300);
      --muted-foreground: oklch(0.70 0.10 320);
      --accent: oklch(0.90 0.25 95);
      --accent-foreground: oklch(0.10 0.06 300);
      --destructive: oklch(0.55 0.25 25);
      --border: oklch(0.40 0.20 320);
      --input: oklch(0.15 0.06 300);
      --ring: oklch(0.70 0.35 320);
      --radius: 0rem;
    `
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Negro base con cian y amarillo electrico',
    preview: { primary: '#00D9FF', secondary: '#FFE600', accent: '#FF0055', background: '#0A0A0F' },
    css: `
      --background: oklch(0.08 0.02 270);
      --foreground: oklch(0.95 0 0);
      --card: oklch(0.12 0.02 270);
      --card-foreground: oklch(0.95 0 0);
      --primary: oklch(0.80 0.20 195);
      --primary-foreground: oklch(0.08 0.02 270);
      --secondary: oklch(0.90 0.20 95);
      --secondary-foreground: oklch(0.08 0.02 270);
      --muted: oklch(0.20 0.02 270);
      --muted-foreground: oklch(0.65 0.02 195);
      --accent: oklch(0.65 0.28 350);
      --accent-foreground: oklch(0.98 0 0);
      --destructive: oklch(0.55 0.25 25);
      --border: oklch(0.30 0.10 195);
      --input: oklch(0.15 0.02 270);
      --ring: oklch(0.80 0.20 195);
      --radius: 0.5rem;
    `
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Verdes profundos y tipografia color hueso',
    preview: { primary: '#2D5016', secondary: '#E8F5E9', accent: '#81C784', background: '#1B3409' },
    css: `
      --background: oklch(0.20 0.08 130);
      --foreground: oklch(0.92 0.02 90);
      --card: oklch(0.25 0.08 130);
      --card-foreground: oklch(0.92 0.02 90);
      --primary: oklch(0.70 0.15 140);
      --primary-foreground: oklch(0.15 0.06 130);
      --secondary: oklch(0.30 0.07 130);
      --secondary-foreground: oklch(0.88 0.02 90);
      --muted: oklch(0.28 0.06 130);
      --muted-foreground: oklch(0.65 0.04 130);
      --accent: oklch(0.75 0.12 145);
      --accent-foreground: oklch(0.15 0.06 130);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.35 0.08 130);
      --input: oklch(0.25 0.06 130);
      --ring: oklch(0.70 0.15 140);
      --radius: 0.75rem;
    `
  },
  {
    id: 'forest-dark',
    name: 'Forest (Oscuro)',
    description: 'Verdes muy oscuros con acentos luminosos',
    isDark: true,
    preview: { primary: '#81C784', secondary: '#1B5E20', accent: '#A5D6A7', background: '#0D1F0A' },
    css: `
      --background: oklch(0.08 0.04 130);
      --foreground: oklch(0.90 0.02 90);
      --card: oklch(0.12 0.05 130);
      --card-foreground: oklch(0.90 0.02 90);
      --primary: oklch(0.65 0.15 140);
      --primary-foreground: oklch(0.08 0.04 130);
      --secondary: oklch(0.18 0.05 130);
      --secondary-foreground: oklch(0.85 0.02 90);
      --muted: oklch(0.15 0.03 130);
      --muted-foreground: oklch(0.60 0.04 130);
      --accent: oklch(0.72 0.12 145);
      --accent-foreground: oklch(0.08 0.04 130);
      --destructive: oklch(0.70 0.22 25);
      --border: oklch(0.20 0.05 130);
      --input: oklch(0.12 0.03 130);
      --ring: oklch(0.65 0.15 140);
      --radius: 0.75rem;
    `
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Azul marino profundo con acentos oro',
    preview: { primary: '#1A237E', secondary: '#E8EAF6', accent: '#FFD700', background: '#F5F5F5' },
    css: `
      --background: oklch(0.97 0.005 250);
      --foreground: oklch(0.20 0.08 260);
      --card: oklch(0.99 0.005 250);
      --card-foreground: oklch(0.20 0.08 260);
      --primary: oklch(0.30 0.15 260);
      --primary-foreground: oklch(0.97 0.005 250);
      --secondary: oklch(0.94 0.02 260);
      --secondary-foreground: oklch(0.25 0.08 260);
      --muted: oklch(0.92 0.01 260);
      --muted-foreground: oklch(0.50 0.04 260);
      --accent: oklch(0.85 0.18 85);
      --accent-foreground: oklch(0.20 0.08 85);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.88 0.02 260);
      --input: oklch(0.96 0.01 260);
      --ring: oklch(0.30 0.15 260);
      --radius: 0.5rem;
    `
  },
  {
    id: 'royal-dark',
    name: 'Royal (Oscuro)',
    description: 'Azul marino oscuro con detalles dorados',
    isDark: true,
    preview: { primary: '#90CAF9', secondary: '#1A237E', accent: '#FFD700', background: '#0D1B5E' },
    css: `
      --background: oklch(0.10 0.08 250);
      --foreground: oklch(0.92 0.05 260);
      --card: oklch(0.15 0.08 250);
      --card-foreground: oklch(0.92 0.05 260);
      --primary: oklch(0.62 0.18 250);
      --primary-foreground: oklch(0.10 0.08 250);
      --secondary: oklch(0.20 0.08 260);
      --secondary-foreground: oklch(0.88 0.04 260);
      --muted: oklch(0.22 0.06 260);
      --muted-foreground: oklch(0.68 0.04 260);
      --accent: oklch(0.82 0.18 85);
      --accent-foreground: oklch(0.10 0.08 85);
      --destructive: oklch(0.70 0.22 25);
      --border: oklch(0.25 0.08 250);
      --input: oklch(0.15 0.06 260);
      --ring: oklch(0.62 0.18 250);
      --radius: 0.5rem;
    `
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Tarjetas flotantes con sombra suave',
    preview: { primary: '#6366F1', secondary: 'rgba(255,255,255,0.25)', accent: '#A855F7', background: '#E0E7FF' },
    css: `
      --background: oklch(0.92 0.04 270);
      --foreground: oklch(0.18 0.04 270);
      --card: oklch(1 0 0 / 0.6);
      --card-foreground: oklch(0.18 0.04 270);
      --primary: oklch(0.55 0.22 270);
      --primary-foreground: oklch(0.98 0.005 270);
      --secondary: oklch(0.98 0.01 270 / 0.4);
      --secondary-foreground: oklch(0.30 0.06 270);
      --muted: oklch(0.95 0.02 270 / 0.5);
      --muted-foreground: oklch(0.45 0.04 270);
      --accent: oklch(0.62 0.24 300);
      --accent-foreground: oklch(0.98 0.005 300);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(1 0 0 / 0.2);
      --input: oklch(1 0 0 / 0.3);
      --ring: oklch(0.55 0.22 270);
      --radius: 1.25rem;
    `
  },
  {
    id: 'glassmorphism-dark',
    name: 'Glassmorphism (Oscuro)',
    description: 'Tarjetas translucidas en fondo oscuro',
    isDark: true,
    preview: { primary: '#A78BFA', secondary: 'rgba(20,20,30,0.4)', accent: '#D8B4FE', background: '#1F1F3F' },
    css: `
      --background: oklch(0.15 0.04 270);
      --foreground: oklch(0.90 0.03 270);
      --card: oklch(0.20 0.02 270 / 0.65);
      --card-foreground: oklch(0.90 0.03 270);
      --primary: oklch(0.68 0.22 270);
      --primary-foreground: oklch(0.15 0.04 270);
      --secondary: oklch(0.25 0.02 270 / 0.45);
      --secondary-foreground: oklch(0.85 0.02 270);
      --muted: oklch(0.22 0.02 270 / 0.5);
      --muted-foreground: oklch(0.65 0.03 270);
      --accent: oklch(0.75 0.24 300);
      --accent-foreground: oklch(0.15 0.04 300);
      --destructive: oklch(0.70 0.22 25);
      --border: oklch(0.30 0.03 270 / 0.3);
      --input: oklch(0.20 0.02 270 / 0.4);
      --ring: oklch(0.68 0.22 270);
      --radius: 1.25rem;
    `
  },
  {
    id: 'pure-oled',
    name: 'Pure OLED',
    description: 'Negro #000000 absoluto con bordes finos',
    preview: { primary: '#FFFFFF', secondary: '#1A1A1A', accent: '#666666', background: '#000000' },
    css: `
      --background: oklch(0 0 0);
      --foreground: oklch(0.98 0 0);
      --card: oklch(0.08 0 0);
      --card-foreground: oklch(0.98 0 0);
      --primary: oklch(0.98 0 0);
      --primary-foreground: oklch(0 0 0);
      --secondary: oklch(0.12 0 0);
      --secondary-foreground: oklch(0.85 0 0);
      --muted: oklch(0.15 0 0);
      --muted-foreground: oklch(0.55 0 0);
      --accent: oklch(0.45 0 0);
      --accent-foreground: oklch(0.98 0 0);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.20 0 0);
      --input: oklch(0.10 0 0);
      --ring: oklch(0.98 0 0);
      --radius: 0.5rem;
    `
  },
]

export function getThemeById(id: string): Theme | undefined {
  return themes.find(t => t.id === id)
}

export function getDefaultTheme(): Theme {
  return themes[0] // M3E is default
}
