import type { GameState } from '../lib/types'

interface NumberPadProps {
  state: GameState
  onInput: (digit: number) => void
}

export function NumberPad({ state, onInput }: NumberPadProps) {
  const counts = new Array<number>(10).fill(0)
  state.cells.forEach((cell, i) => {
    if (cell.value !== 0 && cell.value === state.solution[i]) {
      counts[cell.value]++
    }
  })

  return (
    <div className="numpad" role="group" aria-label="Números">
      {Array.from({ length: 9 }, (_, n) => {
        const digit = n + 1
        const done = counts[digit] === 9
        const celebrate = state.lastEvent?.completedDigit === digit
        return (
          <button
            key={digit}
            type="button"
            className={`numpad-key${done ? ' numpad-key--done' : ''}${
              celebrate ? ' numpad-key--celebrate' : ''
            }`}
            onClick={() => onInput(digit)}
            disabled={done}
          >
            <span className="numpad-digit">{digit}</span>
            <span className="numpad-count">{done ? '✓' : 9 - counts[digit]}</span>
          </button>
        )
      })}
    </div>
  )
}
