#!/usr/bin/env bash
# Sudoku — gestor para el Dashboard (dev server, build → hub)
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$APP_DIR/.sudoku-dev.pid"
LOG_FILE="$APP_DIR/.sudoku-dev.log"
PORT=5175

get_pid() { lsof -iTCP:$PORT -sTCP:LISTEN -P -n -t 2>/dev/null | head -1; }

case "${1:-status}" in
  start)
    if [ -n "$(get_pid)" ]; then
      echo "Sudoku dev ya corre en http://localhost:$PORT (PID $(get_pid))"
      exit 0
    fi
    cd "$APP_DIR"
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Sudoku dev iniciado en http://localhost:$PORT (PID $(cat "$PID_FILE"))"
    ;;
  stop)
    listener=$(get_pid)
    if [ -f "$PID_FILE" ]; then
      p=$(cat "$PID_FILE")
      pkill -P "$p" 2>/dev/null
      kill "$p" 2>/dev/null
      rm -f "$PID_FILE"
    fi
    [ -n "$listener" ] && kill "$listener" 2>/dev/null
    echo "Sudoku dev detenido"
    ;;
  restart)
    "$0" stop
    sleep 1
    "$0" start
    ;;
  build)
    cd "$APP_DIR" && npm run build
    echo "Build listo — el hub sirve dist/ en http://localhost:8000/sudoku/"
    ;;
  backup)
    ICLOUD="$HOME/Library/Mobile Documents/com~apple~CloudDocs/claude_Backups/Sudoku-Backups"
    KEEP=10
    ts="$(date +%Y-%m-%d_%H-%M-%S)"
    out="$ICLOUD/$ts"
    mkdir -p "$out" || { echo "No se pudo crear $out (¿iCloud Drive activo?)"; exit 1; }
    echo "▶ Copiando código a iCloud ($ts)…"
    rsync -a \
      --exclude node_modules --exclude dist --exclude .git \
      --exclude '.sudoku-dev.*' --exclude .DS_Store \
      "$APP_DIR/" "$out/"
    echo "▶ Rotación (mantener $KEEP copias)…"
    ls -1 "$ICLOUD" 2>/dev/null | sort -r | tail -n +$((KEEP+1)) | while read -r old; do
      rm -rf "$ICLOUD/$old"
      echo "  eliminado respaldo antiguo: $old"
    done
    echo "✔ Respaldo completo en $out"
    ;;
  status)
    pid=$(get_pid)
    if [ -n "$pid" ]; then echo "running (PID $pid, :$PORT)"; else echo "stopped"; fi
    ;;
  *)
    echo "uso: sudoku.sh {start|stop|restart|build|backup|status}"
    ;;
esac
