// ClearGrade Theme System - 20 themes
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
  css: string
}

export const themes: Theme[] = [
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
    id: 'one-ui',
    name: 'Samsung One UI',
    description: 'Cabeceras grandes, optimizado para una mano',
    preview: { primary: '#1259C3', secondary: '#E3F2FD', accent: '#03DAC5', background: '#FFFFFF' },
    css: `
      --background: oklch(1 0 0);
      --foreground: oklch(0.12 0.01 240);
      --card: oklch(0.98 0.005 240);
      --card-foreground: oklch(0.12 0.01 240);
      --primary: oklch(0.45 0.20 250);
      --primary-foreground: oklch(1 0 0);
      --secondary: oklch(0.95 0.02 240);
      --secondary-foreground: oklch(0.30 0.08 240);
      --muted: oklch(0.96 0.01 240);
      --muted-foreground: oklch(0.50 0.02 240);
      --accent: oklch(0.70 0.15 175);
      --accent-foreground: oklch(0.15 0.05 175);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.92 0.01 240);
      --input: oklch(0.97 0.005 240);
      --ring: oklch(0.45 0.20 250);
      --radius: 1.5rem;
    `
  },
  {
    id: 'nothing',
    name: 'Nothing OS',
    description: 'Fuente Dot Matrix, blanco/negro/rojo',
    preview: { primary: '#D71921', secondary: '#1A1A1A', accent: '#FFFFFF', background: '#000000' },
    css: `
      --background: oklch(0.08 0 0);
      --foreground: oklch(0.98 0 0);
      --card: oklch(0.12 0 0);
      --card-foreground: oklch(0.98 0 0);
      --primary: oklch(0.55 0.25 25);
      --primary-foreground: oklch(0.98 0 0);
      --secondary: oklch(0.18 0 0);
      --secondary-foreground: oklch(0.85 0 0);
      --muted: oklch(0.20 0 0);
      --muted-foreground: oklch(0.60 0 0);
      --accent: oklch(0.98 0 0);
      --accent-foreground: oklch(0.08 0 0);
      --destructive: oklch(0.55 0.25 25);
      --border: oklch(0.25 0 0);
      --input: oklch(0.15 0 0);
      --ring: oklch(0.55 0.25 25);
      --radius: 0.25rem;
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
    id: 'nordic',
    name: 'Nordic',
    description: 'Minimalismo escandinavo, azules gelidos',
    preview: { primary: '#5E81AC', secondary: '#ECEFF4', accent: '#88C0D0', background: '#ECEFF4' },
    css: `
      --background: oklch(0.95 0.01 230);
      --foreground: oklch(0.25 0.02 230);
      --card: oklch(0.98 0.005 230);
      --card-foreground: oklch(0.25 0.02 230);
      --primary: oklch(0.55 0.10 230);
      --primary-foreground: oklch(0.98 0.005 230);
      --secondary: oklch(0.92 0.02 230);
      --secondary-foreground: oklch(0.35 0.05 230);
      --muted: oklch(0.90 0.01 230);
      --muted-foreground: oklch(0.50 0.02 230);
      --accent: oklch(0.70 0.10 200);
      --accent-foreground: oklch(0.20 0.02 200);
      --destructive: oklch(0.60 0.20 15);
      --border: oklch(0.85 0.02 230);
      --input: oklch(0.95 0.01 230);
      --ring: oklch(0.55 0.10 230);
      --radius: 0.75rem;
    `
  },
  {
    id: 'retro-mac',
    name: 'Retro Mac',
    description: 'Estetica System 7, botones con relieve',
    preview: { primary: '#000000', secondary: '#C0C0C0', accent: '#0000CC', background: '#DDDDDD' },
    css: `
      --background: oklch(0.88 0 0);
      --foreground: oklch(0.08 0 0);
      --card: oklch(0.95 0 0);
      --card-foreground: oklch(0.08 0 0);
      --primary: oklch(0.08 0 0);
      --primary-foreground: oklch(0.95 0 0);
      --secondary: oklch(0.78 0 0);
      --secondary-foreground: oklch(0.08 0 0);
      --muted: oklch(0.82 0 0);
      --muted-foreground: oklch(0.35 0 0);
      --accent: oklch(0.40 0.18 260);
      --accent-foreground: oklch(0.95 0 0);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.50 0 0);
      --input: oklch(0.95 0 0);
      --ring: oklch(0.08 0 0);
      --radius: 0.125rem;
    `
  },
  {
    id: 'solarized',
    name: 'Solarized',
    description: 'Balance perfecto, cremas y azules petroleo',
    preview: { primary: '#268BD2', secondary: '#EEE8D5', accent: '#2AA198', background: '#FDF6E3' },
    css: `
      --background: oklch(0.97 0.02 85);
      --foreground: oklch(0.35 0.05 200);
      --card: oklch(0.95 0.02 85);
      --card-foreground: oklch(0.35 0.05 200);
      --primary: oklch(0.55 0.15 230);
      --primary-foreground: oklch(0.97 0.02 85);
      --secondary: oklch(0.90 0.03 85);
      --secondary-foreground: oklch(0.40 0.05 200);
      --muted: oklch(0.92 0.02 85);
      --muted-foreground: oklch(0.50 0.04 200);
      --accent: oklch(0.60 0.12 180);
      --accent-foreground: oklch(0.97 0.02 85);
      --destructive: oklch(0.55 0.20 25);
      --border: oklch(0.85 0.03 85);
      --input: oklch(0.95 0.02 85);
      --ring: oklch(0.55 0.15 230);
      --radius: 0.5rem;
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
    id: 'paper',
    name: 'Paper',
    description: 'Fondo texturizado crema y fuentes Serif',
    preview: { primary: '#5D4037', secondary: '#EFEBE9', accent: '#795548', background: '#FBF8F3' },
    css: `
      --background: oklch(0.98 0.01 70);
      --foreground: oklch(0.25 0.05 50);
      --card: oklch(0.96 0.02 70);
      --card-foreground: oklch(0.25 0.05 50);
      --primary: oklch(0.40 0.08 50);
      --primary-foreground: oklch(0.98 0.01 70);
      --secondary: oklch(0.94 0.02 50);
      --secondary-foreground: oklch(0.35 0.05 50);
      --muted: oklch(0.92 0.02 70);
      --muted-foreground: oklch(0.50 0.03 50);
      --accent: oklch(0.50 0.08 50);
      --accent-foreground: oklch(0.98 0.01 70);
      --destructive: oklch(0.55 0.20 25);
      --border: oklch(0.88 0.03 70);
      --input: oklch(0.96 0.01 70);
      --ring: oklch(0.40 0.08 50);
      --radius: 0.25rem;
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
    id: 'steel',
    name: 'Steel',
    description: 'Look industrial, bordes marcados, fuentes mono',
    preview: { primary: '#607D8B', secondary: '#ECEFF1', accent: '#FF5722', background: '#FAFAFA' },
    css: `
      --background: oklch(0.98 0.005 220);
      --foreground: oklch(0.25 0.02 220);
      --card: oklch(0.96 0.01 220);
      --card-foreground: oklch(0.25 0.02 220);
      --primary: oklch(0.55 0.05 220);
      --primary-foreground: oklch(0.98 0.005 220);
      --secondary: oklch(0.94 0.01 220);
      --secondary-foreground: oklch(0.35 0.02 220);
      --muted: oklch(0.92 0.01 220);
      --muted-foreground: oklch(0.50 0.02 220);
      --accent: oklch(0.60 0.20 30);
      --accent-foreground: oklch(0.98 0.005 30);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.82 0.02 220);
      --input: oklch(0.96 0.01 220);
      --ring: oklch(0.55 0.05 220);
      --radius: 0.25rem;
    `
  },
  {
    id: 'bauhaus',
    name: 'Bauhaus',
    description: 'Formas geometricas y colores primarios saturados',
    preview: { primary: '#D32F2F', secondary: '#FFC107', accent: '#1976D2', background: '#FFFDE7' },
    css: `
      --background: oklch(0.98 0.02 95);
      --foreground: oklch(0.12 0 0);
      --card: oklch(0.96 0.02 95);
      --card-foreground: oklch(0.12 0 0);
      --primary: oklch(0.55 0.25 25);
      --primary-foreground: oklch(0.98 0.02 95);
      --secondary: oklch(0.85 0.18 85);
      --secondary-foreground: oklch(0.15 0 0);
      --muted: oklch(0.94 0.02 95);
      --muted-foreground: oklch(0.40 0 0);
      --accent: oklch(0.50 0.18 250);
      --accent-foreground: oklch(0.98 0.02 95);
      --destructive: oklch(0.55 0.25 25);
      --border: oklch(0.12 0 0);
      --input: oklch(0.98 0.02 95);
      --ring: oklch(0.55 0.25 25);
      --radius: 0rem;
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
    id: 'earth',
    name: 'Earth',
    description: 'Tonos tierra, terracota y beige',
    preview: { primary: '#A1887F', secondary: '#D7CCC8', accent: '#FF7043', background: '#EFEBE9' },
    css: `
      --background: oklch(0.94 0.02 50);
      --foreground: oklch(0.28 0.04 50);
      --card: oklch(0.97 0.01 50);
      --card-foreground: oklch(0.28 0.04 50);
      --primary: oklch(0.62 0.08 50);
      --primary-foreground: oklch(0.98 0.01 50);
      --secondary: oklch(0.88 0.03 50);
      --secondary-foreground: oklch(0.35 0.04 50);
      --muted: oklch(0.90 0.02 50);
      --muted-foreground: oklch(0.50 0.03 50);
      --accent: oklch(0.65 0.18 35);
      --accent-foreground: oklch(0.98 0.01 35);
      --destructive: oklch(0.55 0.22 25);
      --border: oklch(0.85 0.03 50);
      --input: oklch(0.96 0.01 50);
      --ring: oklch(0.62 0.08 50);
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
  }
]

export function getThemeById(id: string): Theme | undefined {
  return themes.find(t => t.id === id)
}

export function getDefaultTheme(): Theme {
  return themes[0] // M3E is default
}
