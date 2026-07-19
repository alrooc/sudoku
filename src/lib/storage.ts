import type { CellState, Difficulty, GameStatus, Grid } from './types'

const GAME_KEY = 'sudoku.game.v1'
const STATS_KEY = 'sudoku.stats.v1'
const THEME_KEY = 'sudoku.theme.v1'
const SETTINGS_KEY = 'sudoku.settings.v1'

export interface SavedGame {
  id: number
  cells: CellState[]
  solution: Grid
  difficulty: Difficulty
  mistakes: number
  maxMistakes?: number
  hintsLeft: number
  seconds: number
  status: GameStatus
}

export interface Settings {
  maxMistakes: number
  sound: boolean
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>
      return { maxMistakes: parsed.maxMistakes ?? 0, sound: parsed.sound ?? true }
    }
  } catch {
    // sin acceso a storage
  }
  return { maxMistakes: 0, sound: true }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // sin acceso a storage
  }
}

export function saveGame(game: SavedGame): void {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(game))
  } catch {
    // storage lleno o bloqueado: la partida sigue en memoria
  }
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(GAME_KEY)
    if (!raw) return null
    const game = JSON.parse(raw) as SavedGame
    if (!Array.isArray(game.cells) || game.cells.length !== 81) return null
    return game
  } catch {
    return null
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(GAME_KEY)
  } catch {
    // sin acceso a storage
  }
}

export interface DifficultyStats {
  wins: number
  best: number | null
}

export type Stats = Record<Difficulty, DifficultyStats>

const EMPTY_STATS: Stats = {
  facil: { wins: 0, best: null },
  medio: { wins: 0, best: null },
  dificil: { wins: 0, best: null },
  experto: { wins: 0, best: null },
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return structuredClone(EMPTY_STATS)
    return { ...structuredClone(EMPTY_STATS), ...(JSON.parse(raw) as Stats) }
  } catch {
    return structuredClone(EMPTY_STATS)
  }
}

export function recordWin(difficulty: Difficulty, seconds: number): Stats {
  const stats = loadStats()
  const entry = stats[difficulty]
  entry.wins += 1
  entry.best = entry.best === null ? seconds : Math.min(entry.best, seconds)
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // sin acceso a storage
  }
  return stats
}

const ACCENT_KEY = 'sudoku.accent.v1'

export function loadAccent(): string {
  try {
    return localStorage.getItem(ACCENT_KEY) ?? 'dorado'
  } catch {
    return 'dorado'
  }
}

export function saveAccent(accent: string): void {
  try {
    localStorage.setItem(ACCENT_KEY, accent)
  } catch {
    // sin acceso a storage
  }
}

export type Theme = 'dark' | 'light'

export function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // sin acceso a storage
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // sin acceso a storage
  }
}
