import type { Theme } from './storage'

export interface Accent {
  id: string
  label: string
  hue: number
}

// Sin tonos rojos/naranjas: el rojo está reservado para señalar errores
export const ACCENTS: Accent[] = [
  { id: 'dorado', label: 'Dorado', hue: 38 },
  { id: 'lima', label: 'Lima', hue: 90 },
  { id: 'verde', label: 'Verde', hue: 150 },
  { id: 'turquesa', label: 'Turquesa', hue: 185 },
  { id: 'azul', label: 'Azul', hue: 212 },
  { id: 'indigo', label: 'Índigo', hue: 245 },
  { id: 'violeta', label: 'Violeta', hue: 270 },
  { id: 'magenta', label: 'Magenta', hue: 320 },
]

export const DEFAULT_ACCENT = 'dorado'

export function accentById(id: string): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
  }
  return [f(0), f(8), f(4)]
}

function luminance(h: number, s: number, l: number): number {
  const chan = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const [r, g, b] = hslToRgb(h, s, l)
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)
}

// Texto legible sobre el color de acento: tinta oscura solo si el acento es claro
function onAccent(hue: number, s: number, l: number): string {
  return luminance(hue, s, l) > 0.36 ? '#14100a' : '#ffffff'
}

export function accentVars(id: string, theme: Theme): Record<string, string> {
  const { hue } = accentById(id)
  if (theme === 'dark') {
    return {
      '--gold': `hsl(${hue} 65% 56%)`,
      '--gold-ink': `hsl(${hue} 70% 66%)`,
      '--gold-veil-1': `hsl(${hue} 65% 56% / 0.07)`,
      '--gold-veil-2': `hsl(${hue} 65% 56% / 0.17)`,
      '--on-accent': onAccent(hue, 0.65, 0.56),
    }
  }
  return {
    '--gold': `hsl(${hue} 72% 35%)`,
    '--gold-ink': `hsl(${hue} 65% 45%)`,
    '--gold-veil-1': `hsl(${hue} 70% 40% / 0.09)`,
    '--gold-veil-2': `hsl(${hue} 70% 40% / 0.2)`,
    '--on-accent': onAccent(hue, 0.72, 0.35),
  }
}

export function swatchColor(id: string, theme: Theme): string {
  const { hue } = accentById(id)
  return theme === 'dark' ? `hsl(${hue} 65% 56%)` : `hsl(${hue} 70% 42%)`
}
