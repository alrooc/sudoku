import type { ReactNode } from 'react'
import type { Stats } from '../lib/storage'
import {
  DIFFICULTY_LABELS,
  formatTime,
  type Difficulty,
} from '../lib/types'
import { APP_VERSION } from '../lib/version'

const DIFFICULTIES: Difficulty[] = ['facil', 'medio', 'dificil', 'experto']

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const MISTAKE_LIMITS = [
  { value: 0, label: 'Sin límite' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
]

export function Modals({
  dialog,
  stats,
  maxMistakes,
  onChangeMaxMistakes,
  onPickDifficulty,
  onClose,
}: {
  dialog: 'none' | 'new' | 'stats' | 'info'
  stats: Stats
  maxMistakes: number
  onChangeMaxMistakes: (n: number) => void
  onPickDifficulty: (d: Difficulty) => void
  onClose: () => void
}) {
  if (dialog === 'new') {
    return (
      <NewGameModal
        maxMistakes={maxMistakes}
        onChangeMaxMistakes={onChangeMaxMistakes}
        onPick={onPickDifficulty}
        onClose={onClose}
      />
    )
  }
  if (dialog === 'stats') {
    return <StatsModal stats={stats} onClose={onClose} />
  }
  if (dialog === 'info') {
    return <InfoModal onClose={onClose} />
  }
  return null
}

function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Acerca de Sudoku" onClose={onClose}>
      <p className="about-version">Versión {APP_VERSION}</p>
      <p className="about-copy">
        © 2026 Alberto Rojas (Alrooc) · Todos los derechos reservados
      </p>
      <p className="about-terms">
        Juego de uso libre para fines personales y recreativos. Prohibida la
        reproducción, distribución o uso comercial del código o del diseño sin
        autorización del autor.
      </p>
    </Modal>
  )
}

function NewGameModal({
  maxMistakes,
  onChangeMaxMistakes,
  onPick,
  onClose,
}: {
  maxMistakes: number
  onChangeMaxMistakes: (n: number) => void
  onPick: (d: Difficulty) => void
  onClose: () => void
}) {
  return (
    <Modal title="Nueva partida" onClose={onClose}>
      <p className="modal-hint">La partida actual se descartará.</p>
      <div className="difficulty-list">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            className="difficulty-btn"
            onClick={() => onPick(d)}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>
      <p className="modal-label" id="mistake-limit-label">
        Límite de errores
      </p>
      <div
        className="segmented"
        role="group"
        aria-labelledby="mistake-limit-label"
      >
        {MISTAKE_LIMITS.map((limit) => (
          <button
            key={limit.value}
            type="button"
            className={limit.value === maxMistakes ? 'seg--on' : ''}
            aria-pressed={limit.value === maxMistakes}
            onClick={() => onChangeMaxMistakes(limit.value)}
          >
            {limit.label}
          </button>
        ))}
      </div>
    </Modal>
  )
}

function StatsModal({
  stats,
  onClose,
}: {
  stats: Stats
  onClose: () => void
}) {
  return (
    <Modal title="Estadísticas" onClose={onClose}>
      <table className="stats-table">
        <thead>
          <tr>
            <th scope="col">Dificultad</th>
            <th scope="col">Victorias</th>
            <th scope="col">Mejor tiempo</th>
          </tr>
        </thead>
        <tbody>
          {DIFFICULTIES.map((d) => (
            <tr key={d}>
              <td>{DIFFICULTY_LABELS[d]}</td>
              <td>{stats[d].wins}</td>
              <td>{stats[d].best === null ? '—' : formatTime(stats[d].best)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}
