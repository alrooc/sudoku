import type { ReactNode } from 'react'
import type { GameState } from '../lib/types'

interface ToolbarProps {
  state: GameState
  onUndo: () => void
  onRedo: () => void
  onErase: () => void
  onToggleNotes: () => void
  onHint: () => void
}

interface ToolProps {
  label: string
  active?: boolean
  disabled?: boolean
  badge?: string
  onClick: () => void
  children: ReactNode
}

function Tool({ label, active, disabled, badge, onClick, children }: ToolProps) {
  return (
    <button
      type="button"
      className={`tool${active ? ' tool--active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
    >
      <span className="tool-icon" aria-hidden="true">
        {children}
        {badge !== undefined && <span className="tool-badge">{badge}</span>}
      </span>
      <span className="tool-label">{label}</span>
    </button>
  )
}

export function Toolbar({
  state,
  onUndo,
  onRedo,
  onErase,
  onToggleNotes,
  onHint,
}: ToolbarProps) {
  return (
    <div className="toolbar" role="group" aria-label="Herramientas">
      <Tool
        label="Deshacer"
        onClick={onUndo}
        disabled={state.undoStack.length === 0}
      >
        ↶
      </Tool>
      <Tool
        label="Rehacer"
        onClick={onRedo}
        disabled={state.redoStack.length === 0}
      >
        ↷
      </Tool>
      <Tool label="Borrar" onClick={onErase}>
        ⌫
      </Tool>
      <Tool
        label="Notas"
        onClick={onToggleNotes}
        active={state.notesMode}
        badge={state.notesMode ? 'sí' : 'no'}
      >
        ✎
      </Tool>
      <Tool
        label="Pista"
        onClick={onHint}
        disabled={state.hintsLeft === 0}
        badge={String(state.hintsLeft)}
      >
        ◉
      </Tool>
    </div>
  )
}
