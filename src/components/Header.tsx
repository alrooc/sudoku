import { useState } from 'react'
import { ACCENTS, swatchColor } from '../lib/accents'
import {
  DIFFICULTY_LABELS,
  formatTime,
  type GameState,
} from '../lib/types'
import type { Theme } from '../lib/storage'

interface HeaderProps {
  state: GameState
  theme: Theme
  soundOn: boolean
  accent: string
  onTogglePause: () => void
  onToggleSound: () => void
  onToggleTheme: () => void
  onChangeAccent: (id: string) => void
  onOpenStats: () => void
}

export function Header({
  state,
  theme,
  soundOn,
  accent,
  onTogglePause,
  onToggleSound,
  onToggleTheme,
  onChangeAccent,
  onOpenStats,
}: HeaderProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  return (
    <header className="header">
      <h1 className="wordmark">
        Sudoku<span className="wordmark-dot">.</span>
      </h1>
      <div className="header-status">
        <span className="status-item">{DIFFICULTY_LABELS[state.difficulty]}</span>
        <span className="status-sep" aria-hidden="true">
          ·
        </span>
        <span className="status-item">
          Errores{' '}
          <strong
            key={state.mistakes}
            className={`mistakes${
              state.maxMistakes > 0 &&
              state.mistakes >= state.maxMistakes - 1 &&
              state.mistakes > 0
                ? ' mistakes--danger'
                : ''
            }`}
          >
            {state.mistakes}
            {state.maxMistakes > 0 ? `/${state.maxMistakes}` : ''}
          </strong>
        </span>
        <span className="status-sep" aria-hidden="true">
          ·
        </span>
        <button
          type="button"
          className="timer"
          onClick={onTogglePause}
          disabled={state.status !== 'playing'}
          aria-label={state.paused ? 'Reanudar partida' : 'Pausar partida'}
        >
          <span aria-hidden="true">{state.paused ? '▶' : '⏸'}</span>
          <span className="timer-value">{formatTime(state.seconds)}</span>
        </button>
      </div>
      <div className="header-actions">
        <div className="theme-wrap">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPaletteOpen((open) => !open)}
            aria-label="Color del tema"
            aria-expanded={paletteOpen}
          >
            🎨
          </button>
          {paletteOpen && (
            <>
              <div
                className="pop-backdrop"
                onClick={() => setPaletteOpen(false)}
              />
              <div className="theme-pop" role="group" aria-label="Color del tema">
                <p className="theme-pop-title">Color del tema</p>
                <div className="swatches">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`swatch${a.id === accent ? ' swatch--on' : ''}`}
                      style={{ background: swatchColor(a.id, theme) }}
                      aria-label={a.label}
                      aria-pressed={a.id === accent}
                      onClick={() => onChangeAccent(a.id)}
                    >
                      {a.id === accent ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          className={`icon-btn${soundOn ? '' : ' icon-btn--muted'}`}
          onClick={onToggleSound}
          aria-label={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
          aria-pressed={soundOn}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenStats}
          aria-label="Ver estadísticas"
        >
          ▤
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={
            theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
          }
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  )
}
