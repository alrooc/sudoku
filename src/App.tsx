import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Board } from './components/Board'
import { Header } from './components/Header'
import { Modals } from './components/Modals'
import { NumberPad } from './components/NumberPad'
import { Toolbar } from './components/Toolbar'
import { useGame } from './hooks/useGame'
import { accentVars } from './lib/accents'
import { playCorrect, playLost, playWin, playWrong } from './lib/sounds'
import {
  loadAccent,
  loadSettings,
  loadStats,
  loadTheme,
  saveAccent,
  saveSettings,
  saveTheme,
  type Stats,
  type Theme,
} from './lib/storage'
import { formatTime, type Difficulty } from './lib/types'

type Dialog = 'none' | 'new' | 'stats'

export default function App() {
  const game = useGame()
  const { state } = game
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [dialog, setDialog] = useState<Dialog>('none')
  const [ctxMenu, setCtxMenu] = useState<{
    index: number
    x: number
    y: number
  } | null>(null)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [maxMistakes, setMaxMistakes] = useState(
    () => loadSettings().maxMistakes,
  )
  const [soundOn, setSoundOn] = useState(() => loadSettings().sound)
  const [accent, setAccent] = useState(loadAccent)

  const changeAccent = useCallback((id: string) => {
    setAccent(id)
    saveAccent(id)
  }, [])

  useEffect(() => {
    const vars = accentVars(accent, theme)
    for (const [prop, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(prop, value)
    }
  }, [accent, theme])
  const soundRef = useRef(soundOn)
  soundRef.current = soundOn

  const changeMaxMistakes = useCallback(
    (n: number) => {
      setMaxMistakes(n)
      saveSettings({ maxMistakes: n, sound: soundOn })
      game.setMaxMistakes(n)
    },
    [soundOn, game],
  )

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      saveSettings({ maxMistakes, sound: !on })
      return !on
    })
  }, [maxMistakes])

  const statusRef = useRef(state.status)
  statusRef.current = state.status

  useEffect(() => {
    if (!state.lastEvent || !soundRef.current) return
    if (statusRef.current !== 'playing') return
    if (state.lastEvent.kind === 'correct') playCorrect()
    else playWrong()
  }, [state.lastEvent])

  useEffect(() => {
    if (!soundRef.current) return
    if (state.status === 'won') playWin()
    else if (state.status === 'lost') playLost()
  }, [state.status])

  const confetti = useMemo(
    () =>
      state.status === 'won'
        ? Array.from({ length: 40 }, (_, i) => ({
            left: `${Math.random() * 100}%`,
            background: ['#d9a441', '#e0563a', '#8fa3c0', '#e9e4d8'][i % 4],
            animationDelay: `${Math.random() * 0.9}s`,
            animationDuration: `${1.7 + Math.random() * 1.4}s`,
          }))
        : [],
    [state.status],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    if (state.status === 'won') setStats(loadStats())
  }, [state.status])

  const moveSelection = useCallback(
    (dRow: number, dCol: number) => {
      const from = state.selected ?? 40
      const row = Math.min(8, Math.max(0, Math.floor(from / 9) + dRow))
      const col = Math.min(8, Math.max(0, (from % 9) + dCol))
      game.select(row * 9 + col)
    },
    [game, state.selected],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCtxMenu(null)
        return
      }
      if (dialog !== 'none') return
      if (e.metaKey || e.ctrlKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault()
          if (e.shiftKey) game.redo()
          else game.undo()
        }
        return
      }
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          moveSelection(-1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveSelection(1, 0)
          break
        case 'ArrowLeft':
          e.preventDefault()
          moveSelection(0, -1)
          break
        case 'ArrowRight':
          e.preventDefault()
          moveSelection(0, 1)
          break
        case 'Backspace':
        case 'Delete':
        case '0':
          game.erase()
          break
        case 'n':
        case 'N':
          game.toggleNotes()
          break
        case 'p':
        case 'P':
          game.setPaused(!state.paused)
          break
        default:
          if (e.key >= '1' && e.key <= '9') game.input(Number(e.key))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [game, moveSelection, state.paused, dialog])

  const openCtxMenu = useCallback(
    (index: number, x: number, y: number) => {
      if (state.status !== 'playing' || state.paused) return
      if (state.cells[index].given) return
      game.select(index)
      setCtxMenu({
        index,
        x: Math.min(x, window.innerWidth - 172),
        y: Math.min(y, window.innerHeight - 224),
      })
    },
    [game, state.status, state.paused, state.cells],
  )

  const ctxInput = useCallback(
    (digit: number) => {
      game.input(digit)
      setCtxMenu(null)
    },
    [game],
  )

  const startNewGame = useCallback(
    (difficulty: Difficulty) => {
      game.newGame(difficulty, maxMistakes)
      setDialog('none')
    },
    [game, maxMistakes],
  )

  return (
    <div className="app">
      <Header
        state={state}
        theme={theme}
        onTogglePause={() => game.setPaused(!state.paused)}
        soundOn={soundOn}
        accent={accent}
        onChangeAccent={changeAccent}
        onToggleSound={toggleSound}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenStats={() => setDialog('stats')}
      />

      <main className="layout">
        <div className="board-frame">
          <Board
            state={state}
            onSelect={game.select}
            onRightClick={openCtxMenu}
          />

          {state.paused && state.status === 'playing' && (
            <div className="board-veil">
              <p className="veil-text">En pausa</p>
              <button
                type="button"
                className="primary-btn"
                onClick={() => game.setPaused(false)}
              >
                Reanudar
              </button>
            </div>
          )}

          {state.status === 'won' && (
            <div className="board-veil board-veil--won">
              <div className="confetti" aria-hidden="true">
                {confetti.map((style, i) => (
                  <i key={i} style={style} />
                ))}
              </div>
              <div className="stamp">
                <span className="stamp-word">Resuelto</span>
                <span className="stamp-time">{formatTime(state.seconds)}</span>
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={() => setDialog('new')}
              >
                Nueva partida
              </button>
            </div>
          )}

          {state.status === 'lost' && (
            <div className="board-veil board-veil--lost">
              <div className="stamp">
                <span className="stamp-word">Fin</span>
                <span className="stamp-time">
                  {state.mistakes} errores · {formatTime(state.seconds)}
                </span>
              </div>
              <p className="veil-sub">Alcanzaste el límite de errores.</p>
              <div className="veil-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={game.continueAfterLoss}
                >
                  Seguir jugando
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setDialog('new')}
                >
                  Nueva partida
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="panel">
          <Toolbar
            state={state}
            onUndo={game.undo}
            onRedo={game.redo}
            onErase={game.erase}
            onToggleNotes={game.toggleNotes}
            onHint={game.hint}
          />
          <NumberPad state={state} onInput={game.input} />
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setDialog('new')}
          >
            Nueva partida
          </button>
        </aside>
      </main>

      <footer className="colophon">
        <p className="colophon-copy">
          © 2026 Alberto Rojas · Todos los derechos reservados
        </p>
        <p className="colophon-terms">
          Juego de uso libre para fines personales y recreativos. Prohibida la
          reproducción, distribución o uso comercial del código o del diseño
          sin autorización del autor.
        </p>
      </footer>

      {ctxMenu && (
        <>
          <div
            className="pop-backdrop"
            onClick={() => setCtxMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault()
              setCtxMenu(null)
            }}
          />
          <div
            className="ctx-menu"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
            role="menu"
            aria-label="Ingresar número"
          >
            <div className="ctx-grid">
              {Array.from({ length: 9 }, (_, n) => (
                <button
                  key={n + 1}
                  type="button"
                  className="ctx-digit"
                  onClick={() => ctxInput(n + 1)}
                >
                  {n + 1}
                </button>
              ))}
              <button
                type="button"
                className="ctx-erase"
                onClick={() => {
                  game.erase()
                  setCtxMenu(null)
                }}
              >
                Borrar
              </button>
            </div>
          </div>
        </>
      )}

      <Modals
        dialog={dialog}
        stats={stats}
        maxMistakes={maxMistakes}
        onChangeMaxMistakes={changeMaxMistakes}
        onPickDifficulty={startNewGame}
        onClose={() => setDialog('none')}
      />
    </div>
  )
}
