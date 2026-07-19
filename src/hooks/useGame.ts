import { useCallback, useEffect, useReducer, useRef } from 'react'
import { generatePuzzle } from '../lib/sudoku'
import {
  clearGame,
  loadGame,
  loadSettings,
  recordWin,
  saveGame,
  type SavedGame,
} from '../lib/storage'
import {
  boxOf,
  colOf,
  rowOf,
  samePeerGroup,
  type CellState,
  type Difficulty,
  type GameState,
  type Grid,
} from '../lib/types'

const HINTS_PER_GAME = 3
const MAX_UNDO = 200

function cloneCells(cells: CellState[]): CellState[] {
  return cells.map((c) => ({ ...c, notes: [...c.notes] }))
}

function buildGame(
  puzzle: Grid,
  solution: Grid,
  difficulty: Difficulty,
  maxMistakes: number,
): GameState {
  return {
    id: Date.now(),
    cells: puzzle.map((value) => ({ value, given: value !== 0, notes: [] })),
    solution,
    difficulty,
    selected: null,
    notesMode: false,
    mistakes: 0,
    maxMistakes,
    hintsLeft: HINTS_PER_GAME,
    seconds: 0,
    paused: false,
    status: 'playing',
    undoStack: [],
    redoStack: [],
    flashCells: [],
    flashId: 0,
    lastEvent: null,
  }
}

function restoreGame(saved: SavedGame): GameState {
  return {
    ...buildGame(
      saved.cells.map((c) => c.value),
      saved.solution,
      saved.difficulty,
      saved.maxMistakes ?? 0,
    ),
    id: saved.id,
    cells: saved.cells,
    mistakes: saved.mistakes,
    hintsLeft: saved.hintsLeft,
    seconds: saved.seconds,
    status: saved.status,
  }
}

function isSolved(cells: CellState[], solution: Grid): boolean {
  return cells.every((c, i) => c.value === solution[i])
}

function completedUnitCells(
  cells: CellState[],
  solution: Grid,
  index: number,
): number[] {
  const flash = new Set<number>()
  const units: Array<[typeof rowOf, number]> = [
    [rowOf, rowOf(index)],
    [colOf, colOf(index)],
    [boxOf, boxOf(index)],
  ]
  for (const [unitOf, unit] of units) {
    const members: number[] = []
    for (let i = 0; i < 81; i++) {
      if (unitOf(i) === unit) members.push(i)
    }
    if (members.every((i) => cells[i].value === solution[i])) {
      for (const i of members) flash.add(i)
    }
  }
  return [...flash]
}

function applyCorrectPlacement(
  state: GameState,
  cells: CellState[],
  index: number,
  digit: number,
): Pick<GameState, 'flashCells' | 'flashId'> {
  for (let i = 0; i < 81; i++) {
    if (i !== index && samePeerGroup(i, index)) {
      cells[i] = { ...cells[i], notes: cells[i].notes.filter((n) => n !== digit) }
    }
  }
  const flashCells = completedUnitCells(cells, state.solution, index)
  return flashCells.length > 0
    ? { flashCells, flashId: state.flashId + 1 }
    : { flashCells: state.flashCells, flashId: state.flashId }
}

type Action =
  | {
      type: 'new'
      puzzle: Grid
      solution: Grid
      difficulty: Difficulty
      maxMistakes: number
    }
  | { type: 'select'; index: number }
  | { type: 'input'; digit: number }
  | { type: 'erase' }
  | { type: 'toggleNotes' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'hint'; fallbackIndex: number }
  | { type: 'tick' }
  | { type: 'setPaused'; paused: boolean }
  | { type: 'setLimit'; maxMistakes: number }
  | { type: 'continueAfterLoss' }

function canPlay(state: GameState): boolean {
  return state.status === 'playing' && !state.paused
}

function pushUndo(state: GameState): CellState[][] {
  return [...state.undoStack.slice(-MAX_UNDO + 1), cloneCells(state.cells)]
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'new':
      return buildGame(
        action.puzzle,
        action.solution,
        action.difficulty,
        action.maxMistakes,
      )

    case 'select':
      if (state.status !== 'playing') return state
      return { ...state, selected: action.index }

    case 'toggleNotes':
      if (!canPlay(state)) return state
      return { ...state, notesMode: !state.notesMode }

    case 'setPaused':
      if (state.status !== 'playing') return state
      return { ...state, paused: action.paused }

    case 'tick':
      if (!canPlay(state)) return state
      return { ...state, seconds: state.seconds + 1 }

    case 'input': {
      const index = state.selected
      if (index === null || !canPlay(state)) return state
      const cell = state.cells[index]
      if (cell.given) return state

      const cells = cloneCells(state.cells)
      const undoStack = pushUndo(state)

      if (state.notesMode && cell.value === 0) {
        const notes = cell.notes.includes(action.digit)
          ? cell.notes.filter((n) => n !== action.digit)
          : [...cell.notes, action.digit].sort()
        cells[index] = { ...cells[index], notes }
        return { ...state, cells, undoStack, redoStack: [] }
      }

      if (cell.value === action.digit) {
        cells[index] = { ...cells[index], value: 0 }
        return { ...state, cells, undoStack, redoStack: [] }
      }

      cells[index] = { ...cells[index], value: action.digit, notes: [] }
      const correct = action.digit === state.solution[index]
      const flash = correct
        ? applyCorrectPlacement(state, cells, index, action.digit)
        : { flashCells: state.flashCells, flashId: state.flashId }
      const won = correct && isSolved(cells, state.solution)
      const mistakes = correct ? state.mistakes : state.mistakes + 1
      const lost =
        !correct && state.maxMistakes > 0 && mistakes >= state.maxMistakes
      return {
        ...state,
        cells,
        undoStack,
        redoStack: [],
        mistakes,
        status: won ? 'won' : lost ? 'lost' : 'playing',
        selected: won || lost ? null : state.selected,
        lastEvent: {
          kind: correct ? 'correct' : 'wrong',
          id: (state.lastEvent?.id ?? 0) + 1,
        },
        ...flash,
      }
    }

    case 'erase': {
      const index = state.selected
      if (index === null || !canPlay(state)) return state
      const cell = state.cells[index]
      if (cell.given || (cell.value === 0 && cell.notes.length === 0)) {
        return state
      }
      const cells = cloneCells(state.cells)
      cells[index] = { ...cells[index], value: 0, notes: [] }
      return { ...state, cells, undoStack: pushUndo(state), redoStack: [] }
    }

    case 'undo': {
      if (!canPlay(state) || state.undoStack.length === 0) return state
      const undoStack = [...state.undoStack]
      const cells = undoStack.pop() as CellState[]
      return {
        ...state,
        cells,
        undoStack,
        redoStack: [...state.redoStack, cloneCells(state.cells)],
      }
    }

    case 'redo': {
      if (!canPlay(state) || state.redoStack.length === 0) return state
      const redoStack = [...state.redoStack]
      const cells = redoStack.pop() as CellState[]
      return {
        ...state,
        cells,
        redoStack,
        undoStack: [...state.undoStack, cloneCells(state.cells)],
      }
    }

    case 'setLimit':
      if (state.status !== 'playing') return state
      return { ...state, maxMistakes: action.maxMistakes }

    case 'continueAfterLoss':
      if (state.status !== 'lost') return state
      return { ...state, status: 'playing' }

    case 'hint': {
      if (!canPlay(state) || state.hintsLeft === 0) return state
      const needsHint = (i: number) =>
        !state.cells[i].given && state.cells[i].value !== state.solution[i]
      const index =
        state.selected !== null && needsHint(state.selected)
          ? state.selected
          : action.fallbackIndex
      if (!needsHint(index)) return state

      const cells = cloneCells(state.cells)
      const digit = state.solution[index]
      cells[index] = { ...cells[index], value: digit, notes: [] }
      const flash = applyCorrectPlacement(state, cells, index, digit)
      const won = isSolved(cells, state.solution)
      return {
        ...state,
        cells,
        undoStack: pushUndo(state),
        redoStack: [],
        hintsLeft: state.hintsLeft - 1,
        status: won ? 'won' : 'playing',
        selected: won ? null : index,
        lastEvent: { kind: 'correct', id: (state.lastEvent?.id ?? 0) + 1 },
        ...flash,
      }
    }
  }
}

function initGame(): GameState {
  const saved = loadGame()
  if (saved && saved.status === 'playing') return restoreGame(saved)
  const { puzzle, solution } = generatePuzzle('medio')
  return buildGame(puzzle, solution, 'medio', loadSettings().maxMistakes)
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initGame)
  const countedWinRef = useRef<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        dispatch({ type: 'setPaused', paused: true })
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [])

  useEffect(() => {
    saveGame({
      id: state.id,
      cells: state.cells,
      solution: state.solution,
      difficulty: state.difficulty,
      mistakes: state.mistakes,
      maxMistakes: state.maxMistakes,
      hintsLeft: state.hintsLeft,
      seconds: state.seconds,
      status: state.status,
    })
  }, [state])

  useEffect(() => {
    if (state.status === 'won' && countedWinRef.current !== state.id) {
      countedWinRef.current = state.id
      recordWin(state.difficulty, state.seconds)
      clearGame()
    }
  }, [state.status, state.id, state.difficulty, state.seconds])

  const newGame = useCallback((difficulty: Difficulty, maxMistakes: number) => {
    const { puzzle, solution } = generatePuzzle(difficulty)
    dispatch({ type: 'new', puzzle, solution, difficulty, maxMistakes })
  }, [])

  const select = useCallback(
    (index: number) => dispatch({ type: 'select', index }),
    [],
  )
  const input = useCallback(
    (digit: number) => dispatch({ type: 'input', digit }),
    [],
  )
  const erase = useCallback(() => dispatch({ type: 'erase' }), [])
  const toggleNotes = useCallback(() => dispatch({ type: 'toggleNotes' }), [])
  const undo = useCallback(() => dispatch({ type: 'undo' }), [])
  const redo = useCallback(() => dispatch({ type: 'redo' }), [])
  const setPaused = useCallback(
    (paused: boolean) => dispatch({ type: 'setPaused', paused }),
    [],
  )
  const continueAfterLoss = useCallback(
    () => dispatch({ type: 'continueAfterLoss' }),
    [],
  )
  const setMaxMistakes = useCallback(
    (maxMistakes: number) => dispatch({ type: 'setLimit', maxMistakes }),
    [],
  )

  const stateRef = useRef(state)
  stateRef.current = state

  const hint = useCallback(() => {
    const { cells, solution } = stateRef.current
    const candidates: number[] = []
    for (let i = 0; i < 81; i++) {
      if (!cells[i].given && cells[i].value !== solution[i]) candidates.push(i)
    }
    if (candidates.length === 0) return
    const fallbackIndex =
      candidates[Math.floor(Math.random() * candidates.length)]
    dispatch({ type: 'hint', fallbackIndex })
  }, [])

  return {
    state,
    newGame,
    select,
    input,
    erase,
    toggleNotes,
    undo,
    redo,
    hint,
    setPaused,
    continueAfterLoss,
    setMaxMistakes,
  }
}
