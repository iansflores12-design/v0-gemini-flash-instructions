// ClearGrade Theme System - Light themes only, dark mode via toggle
export interface Theme {
  id: string
  name: string
  description: string
  preview: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  light: string // Light mode CSS
  dark: string  // Dark mode CSS
}

export const themes: Theme[] = [
  {
    id: 'm3e',
    name: 'Material 3 Expressive',
    description: 'Soporte Monet, colores dinamicos Android 12+',
    preview: { primary: '#6750A4', secondary: '#E8DEF8', accent: '#4FC3F7', background: '#FFFBFE' },
    light: `
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
    `,
    dark: `
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
    light: `
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
    `,
    dark: `
      --background: oklch(0.08 0.01 240);
      --foreground: oklch(0.95 0.01 240);
      --card: oklch(0.14 0.01 240 / 0.8);
      --card-foreground: oklch(0.95 0.01 240);
      --primary: oklch(0.65 0.20 250);
      --primary-foreground: oklch(0.08 0.01 240);
      --secondary: oklch(0.20 0.01 240 / 0.8);
      --secondary-foreground: oklch(0.90 0.02 240);
      --muted: oklch(0.18 0.01 240 / 0.6);
      --muted-foreground: oklch(0.70 0.02 240);
      --accent: oklch(0.70 0.15 200);
      --accent-foreground: oklch(0.15 0.05 200);
      --destructive: oklch(0.72 0.22 25);
      --border: oklch(0.20 0.01 240 / 0.5);
      --input: oklch(0.12 0.01 240 / 0.8);
      --ring: oklch(0.65 0.20 250);
      --radius: 1.75rem;
    `
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Sin divisiones, máximo espacio en blanco',
    preview: { primary: '#2D3E2D', secondary: '#F5F5F0', accent: '#A8A89A', background: '#FEFEFE' },
    light: `
      --background: oklch(0.99 0 0);
      --foreground: oklch(0.20 0.01 0);
      --card: oklch(0.98 0 0);
      --card-foreground: oklch(0.20 0.01 0);
      --primary: oklch(0.35 0.05 140);
      --primary-foreground: oklch(0.98 0 0);
      --secondary: oklch(0.95 0.01 0);
      --secondary-foreground: oklch(0.35 0.05 140);
      --muted: oklch(0.90 0.005 0);
      --muted-foreground: oklch(0.55 0.02 0);
      --accent: oklch(0.65 0.05 70);
      --accent-foreground: oklch(0.20 0.01 0);
      --destructive: oklch(0.60 0.20 25);
      --border: oklch(0.95 0.005 0);
      --input: oklch(0.96 0.005 0);
      --ring: oklch(0.35 0.05 140);
      --radius: 0.5rem;
    `,
    dark: `
      --background: oklch(0.10 0.01 0);
      --foreground: oklch(0.92 0.005 0);
      --card: oklch(0.15 0.01 0);
      --card-foreground: oklch(0.92 0.005 0);
      --primary: oklch(0.65 0.05 140);
      --primary-foreground: oklch(0.10 0.01 0);
      --secondary: oklch(0.25 0.01 0);
      --secondary-foreground: oklch(0.90 0.005 0);
      --muted: oklch(0.20 0.005 0);
      --muted-foreground: oklch(0.70 0.02 0);
      --accent: oklch(0.75 0.05 70);
      --accent-foreground: oklch(0.10 0.01 0);
      --destructive: oklch(0.70 0.20 25);
      --border: oklch(0.22 0.005 0);
      --input: oklch(0.12 0.005 0);
      --ring: oklch(0.65 0.05 140);
      --radius: 0.5rem;
    `
  },
  {
    id: 'miami',
    name: 'Miami',
    description: 'Gradientes vibrantes de rosa a azul cielo',
    preview: { primary: '#FF1493', secondary: '#87CEEB', accent: '#FFD700', background: '#FFF8FA' },
    light: `
      --background: oklch(0.98 0.01 330);
      --foreground: oklch(0.15 0.02 330);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.15 0.02 330);
      --primary: oklch(0.60 0.25 330);
      --primary-foreground: oklch(0.98 0 0);
      --secondary: oklch(0.80 0.15 200);
      --secondary-foreground: oklch(0.25 0.05 200);
      --muted: oklch(0.94 0.01 330);
      --muted-foreground: oklch(0.50 0.02 330);
      --accent: oklch(0.75 0.20 60);
      --accent-foreground: oklch(0.15 0.05 60);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.90 0.02 330);
      --input: oklch(0.96 0.01 330);
      --ring: oklch(0.60 0.25 330);
      --radius: 1rem;
    `,
    dark: `
      --background: oklch(0.12 0.01 330);
      --foreground: oklch(0.92 0.02 330);
      --card: oklch(0.18 0.01 330);
      --card-foreground: oklch(0.92 0.02 330);
      --primary: oklch(0.70 0.25 330);
      --primary-foreground: oklch(0.12 0.01 330);
      --secondary: oklch(0.50 0.15 200);
      --secondary-foreground: oklch(0.90 0.02 200);
      --muted: oklch(0.25 0.01 330);
      --muted-foreground: oklch(0.70 0.02 330);
      --accent: oklch(0.80 0.20 60);
      --accent-foreground: oklch(0.12 0.01 60);
      --destructive: oklch(0.72 0.22 25);
      --border: oklch(0.25 0.02 330);
      --input: oklch(0.20 0.01 330);
      --ring: oklch(0.70 0.25 330);
      --radius: 1rem;
    `
  },
  {
    id: 'steel',
    name: 'Steel',
    description: 'Look industrial, bordes marcados, fuentes mono',
    preview: { primary: '#34495E', secondary: '#ECF0F1', accent: '#E74C3C', background: '#FAFAFA' },
    light: `
      --background: oklch(0.98 0.005 0);
      --foreground: oklch(0.20 0.01 210);
      --card: oklch(0.96 0.005 0);
      --card-foreground: oklch(0.20 0.01 210);
      --primary: oklch(0.40 0.12 210);
      --primary-foreground: oklch(0.98 0 0);
      --secondary: oklch(0.92 0.005 0);
      --secondary-foreground: oklch(0.35 0.10 210);
      --muted: oklch(0.88 0.005 0);
      --muted-foreground: oklch(0.50 0.02 210);
      --accent: oklch(0.55 0.20 25);
      --accent-foreground: oklch(0.98 0 0);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.85 0.01 210);
      --input: oklch(0.94 0.005 0);
      --ring: oklch(0.40 0.12 210);
      --radius: 0.375rem;
    `,
    dark: `
      --background: oklch(0.15 0.01 210);
      --foreground: oklch(0.90 0.01 0);
      --card: oklch(0.22 0.01 210);
      --card-foreground: oklch(0.90 0.01 0);
      --primary: oklch(0.65 0.12 210);
      --primary-foreground: oklch(0.15 0.01 210);
      --secondary: oklch(0.32 0.01 0);
      --secondary-foreground: oklch(0.88 0.01 0);
      --muted: oklch(0.28 0.01 210);
      --muted-foreground: oklch(0.70 0.02 210);
      --accent: oklch(0.70 0.20 25);
      --accent-foreground: oklch(0.15 0.01 210);
      --destructive: oklch(0.72 0.22 25);
      --border: oklch(0.28 0.01 210);
      --input: oklch(0.20 0.01 210);
      --ring: oklch(0.65 0.12 210);
      --radius: 0.375rem;
    `
  },
  {
    id: 'bauhaus',
    name: 'Bauhaus',
    description: 'Formas geometricas y colores primarios saturados',
    preview: { primary: '#E63946', secondary: '#FFB703', accent: '#1D3557', background: '#F8F9FA' },
    light: `
      --background: oklch(0.97 0.005 0);
      --foreground: oklch(0.15 0.02 230);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.15 0.02 230);
      --primary: oklch(0.60 0.22 25);
      --primary-foreground: oklch(0.98 0 0);
      --secondary: oklch(0.75 0.20 60);
      --secondary-foreground: oklch(0.20 0.05 60);
      --muted: oklch(0.92 0.01 230);
      --muted-foreground: oklch(0.45 0.02 230);
      --accent: oklch(0.35 0.15 230);
      --accent-foreground: oklch(0.98 0 0);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.88 0.02 230);
      --input: oklch(0.95 0.01 230);
      --ring: oklch(0.60 0.22 25);
      --radius: 0rem;
    `,
    dark: `
      --background: oklch(0.12 0.01 230);
      --foreground: oklch(0.92 0.02 230);
      --card: oklch(0.20 0.01 230);
      --card-foreground: oklch(0.92 0.02 230);
      --primary: oklch(0.70 0.22 25);
      --primary-foreground: oklch(0.12 0.01 230);
      --secondary: oklch(0.65 0.20 60);
      --secondary-foreground: oklch(0.15 0.05 60);
      --muted: oklch(0.25 0.01 230);
      --muted-foreground: oklch(0.70 0.02 230);
      --accent: oklch(0.65 0.15 230);
      --accent-foreground: oklch(0.12 0.01 230);
      --destructive: oklch(0.72 0.22 25);
      --border: oklch(0.25 0.02 230);
      --input: oklch(0.18 0.01 230);
      --ring: oklch(0.70 0.22 25);
      --radius: 0rem;
    `
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Tarjetas flotantes con sombra suave',
    preview: { primary: '#5E5CE6', secondary: '#C7C7CC', accent: '#9055FF', background: '#F5F5F7' },
    light: `
      --background: oklch(0.97 0.005 0);
      --foreground: oklch(0.20 0.01 260);
      --card: oklch(0.98 0.002 260 / 0.75);
      --card-foreground: oklch(0.20 0.01 260);
      --primary: oklch(0.50 0.20 260);
      --primary-foreground: oklch(0.98 0 0);
      --secondary: oklch(0.88 0.01 0);
      --secondary-foreground: oklch(0.30 0.02 260);
      --muted: oklch(0.92 0.005 260);
      --muted-foreground: oklch(0.50 0.02 260);
      --accent: oklch(0.62 0.18 270);
      --accent-foreground: oklch(0.98 0 0);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.90 0.01 260 / 0.5);
      --input: oklch(0.96 0.005 260);
      --ring: oklch(0.50 0.20 260);
      --radius: 1.5rem;
    `,
    dark: `
      --background: oklch(0.12 0.01 260);
      --foreground: oklch(0.92 0.02 260);
      --card: oklch(0.18 0.01 260 / 0.8);
      --card-foreground: oklch(0.92 0.02 260);
      --primary: oklch(0.70 0.20 260);
      --primary-foreground: oklch(0.12 0.01 260);
      --secondary: oklch(0.28 0.01 0);
      --secondary-foreground: oklch(0.90 0.02 260);
      --muted: oklch(0.25 0.01 260);
      --muted-foreground: oklch(0.70 0.02 260);
      --accent: oklch(0.75 0.18 270);
      --accent-foreground: oklch(0.12 0.01 270);
      --destructive: oklch(0.72 0.22 25);
      --border: oklch(0.25 0.01 260 / 0.5);
      --input: oklch(0.20 0.01 260);
      --ring: oklch(0.70 0.20 260);
      --radius: 1.5rem;
    `
  }
]

export function getThemeById(id: string) {
  return themes.find((t) => t.id === id)
}

export function getDefaultTheme() {
  return themes[0] // Returns Material 3 Expressive as default
}
