import { samePeerGroup, type GameState } from '../lib/types'
import { Cell } from './Cell'

interface BoardProps {
  state: GameState
  onSelect: (index: number) => void
  onRightClick: (index: number, x: number, y: number) => void
}

export function Board({ state, onSelect, onRightClick }: BoardProps) {
  const { cells, selected, solution, flashCells, flashId } = state
  const selectedValue = selected !== null ? cells[selected].value : 0
  const flashSet = new Set(flashCells)

  return (
    <div
      className="board"
      role="grid"
      aria-label="Tablero de sudoku"
      aria-hidden={state.paused}
    >
      {cells.map((cell, i) => (
        <Cell
          key={i}
          index={i}
          cell={cell}
          selected={selected === i}
          peer={selected !== null && selected !== i && samePeerGroup(i, selected)}
          sameValue={
            selectedValue !== 0 && selected !== i && cell.value === selectedValue
          }
          error={!cell.given && cell.value !== 0 && cell.value !== solution[i]}
          flashing={flashSet.has(i)}
          flashId={flashId}
          onSelect={onSelect}
          onRightClick={onRightClick}
        />
      ))}
    </div>
  )
}
