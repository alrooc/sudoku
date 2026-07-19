# Sudoku

Sudoku premium para navegador: puzzles generados con solución única garantizada,
notas de lápiz, pistas, estadísticas y temas claro/oscuro. Sin backend — todo
corre en el navegador y el progreso se guarda en localStorage.

## Desarrollo

```sh
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # type-check + build de producción en dist/
npm run lint       # ESLint
npm run preview    # sirve el build de producción
```

## Cómo se juega

- Toca una celda y usa el pad numérico o el teclado (1-9).
- **Notas**: activa el modo lápiz con el botón o la tecla `N`.
- **Atajos**: flechas para moverse, `⌫`/`0` borra, `Cmd/Ctrl+Z` deshace,
  `Cmd/Ctrl+Shift+Z` rehace, `P` pausa.
- 3 pistas por partida. Los errores se marcan en bermellón y se cuentan.
- La partida se guarda sola: cierra la pestaña y retómala cuando quieras.

## Arquitectura

- `src/lib/sudoku.ts` — generador y solucionador (backtracking con bitmasks);
  vacía celdas en pares simétricos verificando en cada paso que la solución
  siga siendo única. Dificultades por número de pistas: fácil 40, medio 34,
  difícil 29, experto ~25.
- `src/hooks/useGame.ts` — estado del juego en un reducer (jugadas, notas,
  deshacer/rehacer, pistas, timer, pausa automática al ocultar la pestaña) +
  persistencia en localStorage.
- `src/components/` — tablero, pad, herramientas, cabecera y modales.
- `src/styles.css` — sistema de diseño (tokens en custom properties, temas
  claro/oscuro, animaciones con `prefers-reduced-motion` respetado).
