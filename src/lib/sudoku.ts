import { boxOf, colOf, rowOf, type Difficulty, type Grid } from './types'

const FULL = 0x1ff

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function popcount(x: number): number {
  let n = 0
  while (x) {
    x &= x - 1
    n++
  }
  return n
}

function fillGrid(grid: Grid, index: number): boolean {
  if (index === 81) return true
  if (grid[index] !== 0) return fillGrid(grid, index + 1)
  const r = rowOf(index)
  const c = colOf(index)
  const b = boxOf(index)
  for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    let ok = true
    for (let i = 0; i < 81 && ok; i++) {
      if (grid[i] === d && (rowOf(i) === r || colOf(i) === c || boxOf(i) === b)) {
        ok = false
      }
    }
    if (!ok) continue
    grid[index] = d
    if (fillGrid(grid, index + 1)) return true
    grid[index] = 0
  }
  return false
}

export function generateSolved(): Grid {
  const grid = new Array<number>(81).fill(0)
  fillGrid(grid, 0)
  return grid
}

export function countSolutions(grid: Grid, limit = 2): number {
  const rows = new Array<number>(9).fill(0)
  const cols = new Array<number>(9).fill(0)
  const boxes = new Array<number>(9).fill(0)
  const work = [...grid]
  for (let i = 0; i < 81; i++) {
    const v = work[i]
    if (v === 0) continue
    const bit = 1 << (v - 1)
    const r = rowOf(i)
    const c = colOf(i)
    const b = boxOf(i)
    if (rows[r] & bit || cols[c] & bit || boxes[b] & bit) return 0
    rows[r] |= bit
    cols[c] |= bit
    boxes[b] |= bit
  }
  let count = 0
  const dfs = () => {
    if (count >= limit) return
    let best = -1
    let bestMask = 0
    let bestN = 10
    for (let i = 0; i < 81; i++) {
      if (work[i] !== 0) continue
      const mask = FULL & ~(rows[rowOf(i)] | cols[colOf(i)] | boxes[boxOf(i)])
      const n = popcount(mask)
      if (n === 0) return
      if (n < bestN) {
        bestN = n
        best = i
        bestMask = mask
        if (n === 1) break
      }
    }
    if (best === -1) {
      count++
      return
    }
    const r = rowOf(best)
    const c = colOf(best)
    const b = boxOf(best)
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << (d - 1)
      if (!(bestMask & bit)) continue
      work[best] = d
      rows[r] |= bit
      cols[c] |= bit
      boxes[b] |= bit
      dfs()
      work[best] = 0
      rows[r] &= ~bit
      cols[c] &= ~bit
      boxes[b] &= ~bit
      if (count >= limit) return
    }
  }
  dfs()
  return count
}

const TARGET_CLUES: Record<Difficulty, number> = {
  facil: 40,
  medio: 34,
  dificil: 29,
  experto: 25,
}

export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Grid
  solution: Grid
} {
  const solution = generateSolved()
  const puzzle = [...solution]
  const target = TARGET_CLUES[difficulty]
  let clues = 81
  const order = shuffle(Array.from({ length: 81 }, (_, i) => i))
  for (const i of order) {
    if (clues <= target) break
    const removed: Array<[number, number]> = []
    if (puzzle[i] !== 0) {
      removed.push([i, puzzle[i]])
      puzzle[i] = 0
    }
    const sym = 80 - i
    if (sym !== i && puzzle[sym] !== 0 && clues - removed.length - 1 >= target) {
      removed.push([sym, puzzle[sym]])
      puzzle[sym] = 0
    }
    if (removed.length === 0) continue
    if (countSolutions(puzzle, 2) === 1) {
      clues -= removed.length
    } else {
      for (const [j, v] of removed) puzzle[j] = v
    }
  }
  for (const i of order) {
    if (clues <= target) break
    if (puzzle[i] === 0) continue
    const v = puzzle[i]
    puzzle[i] = 0
    if (countSolutions(puzzle, 2) === 1) clues--
    else puzzle[i] = v
  }
  return { puzzle, solution }
}
