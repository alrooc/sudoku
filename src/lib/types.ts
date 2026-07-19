export type Difficulty = 'facil' | 'medio' | 'dificil' | 'experto'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facil: 'Fácil',
  medio: 'Medio',
  dificil: 'Difícil',
  experto: 'Experto',
}

export type Grid = number[]

export interface CellState {
  value: number
  given: boolean
  notes: number[]
}

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  id: number
  cells: CellState[]
  solution: Grid
  difficulty: Difficulty
  selected: number | null
  notesMode: boolean
  mistakes: number
  maxMistakes: number
  hintsLeft: number
  seconds: number
  paused: boolean
  status: GameStatus
  undoStack: CellState[][]
  redoStack: CellState[][]
  flashCells: number[]
  flashId: number
  lastEvent: {
    kind: 'correct' | 'wrong'
    id: number
    completedDigit?: number
  } | null
}

export const rowOf = (i: number): number => Math.floor(i / 9)
export const colOf = (i: number): number => i % 9
export const boxOf = (i: number): number =>
  Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3)

export const samePeerGroup = (a: number, b: number): boolean =>
  rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b)

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
