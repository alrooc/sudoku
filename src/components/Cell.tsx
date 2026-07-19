import { memo } from 'react'
import type { CellState } from '../lib/types'

interface CellProps {
  index: number
  cell: CellState
  selected: boolean
  peer: boolean
  sameValue: boolean
  error: boolean
  flashing: boolean
  flashId: number
  onSelect: (index: number) => void
  onRightClick: (index: number, x: number, y: number) => void
}

export const Cell = memo(function Cell({
  index,
  cell,
  selected,
  peer,
  sameValue,
  error,
  flashing,
  flashId,
  onSelect,
  onRightClick,
}: CellProps) {
  const col = index % 9
  const row = Math.floor(index / 9)
  const classes = ['cell']
  if (cell.given) classes.push('cell--given')
  if (selected) classes.push('cell--selected')
  else if (sameValue) classes.push('cell--same')
  else if (peer) classes.push('cell--peer')
  if (error) classes.push('cell--error')
  if (col === 2 || col === 5) classes.push('cell--wall-right')
  if (row === 2 || row === 5) classes.push('cell--wall-bottom')

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={() => onSelect(index)}
      onContextMenu={(e) => {
        e.preventDefault()
        onRightClick(index, e.clientX, e.clientY)
      }}
      aria-label={`Celda fila ${row + 1}, columna ${col + 1}${
        cell.value ? `, valor ${cell.value}` : ', vacía'
      }`}
    >
      {error && (
        <span className="cell-error-mark" aria-hidden="true">
          ✕
        </span>
      )}
      {cell.value !== 0 ? (
        <span
          key={`${cell.value}-${flashing ? flashId : 0}`}
          className={`cell-value${flashing ? ' cell-value--flash' : ''}`}
        >
          {cell.value}
        </span>
      ) : cell.notes.length > 0 ? (
        <span className="cell-notes">
          {Array.from({ length: 9 }, (_, n) => (
            <span key={n + 1} className="cell-note">
              {cell.notes.includes(n + 1) ? n + 1 : ''}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  )
})
