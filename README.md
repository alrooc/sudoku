# Sudoku

Sudoku premium para navegador: puzzles generados con solución única garantizada,
notas de lápiz, pistas, estadísticas y temas claro/oscuro. Sin backend — todo
corre en el navegador y el progreso se guarda en localStorage.

**Juega ya: https://alrooc.github.io/sudoku/** — gratis, sin anuncios y sin
recopilar datos personales.

## Jugar

- **En línea**: https://alrooc.github.io/sudoku/
- **Instalar en el celular/tablet** (es una PWA, funciona offline tras la
  primera carga):
  - iPhone/iPad: Safari → Compartir → *Añadir a pantalla de inicio*.
  - Android: Chrome → aviso *Instalar app* (o menú ⋮ → *Instalar aplicación*).
  - Mac/PC: icono de instalar (⊕) en la barra de direcciones de Chrome.
- **Local**: versión de producción en **http://localhost:8000/sudoku/**
  (portal Mis Apps; `dist/` servido por symlink). Tras cambios de código,
  correr `npm run build` para actualizarla.

## Publicación

- Cada push a `main` dispara `.github/workflows/deploy.yml`, que compila y
  publica `dist/` en GitHub Pages (~1 min). Los dispositivos con la PWA
  instalada se actualizan solos al siguiente arranque (`registerType:
  'autoUpdate'`).
- El service worker y el `manifest.webmanifest` los genera `vite-plugin-pwa`
  durante el build (config en `vite.config.ts`); no hay manifest estático.
- `base: './'` (rutas relativas) permite que el mismo build sirva en
  GitHub Pages (`/sudoku/`) y en el portal local.
- Analíticas: [GoatCounter](https://www.goatcounter.com) — contador anónimo
  sin cookies; no guarda IPs ni identifica personas.

## Desarrollo

```sh
npm install
npm run dev        # servidor de desarrollo en http://localhost:5175
./sudoku.sh start  # o vía el gestor (usado por el Dashboard)
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

## Licencia

© 2026 Alberto Rojas. Todos los derechos reservados — ver [LICENSE](LICENSE).
El juego es de uso libre para fines personales y recreativos; no se permite
reproducir, distribuir ni usar comercialmente el código o el diseño sin
autorización del autor.
