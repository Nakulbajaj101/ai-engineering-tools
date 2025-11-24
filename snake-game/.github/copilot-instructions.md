**Repo Overview**
- **Type:** Single-page React app bootstrapped with Create React App (CRA).
- **Main purpose:** A playable Snake game implemented in a single component (`src/App.js`) using React hooks and Tailwind CSS.

**How To Run / Build**
- Install: `npm install`
- Dev server: `npm start` (opens at `http://localhost:3000`)
- Tests: `npm test` (CRA test runner)
- Production build: `npm run build`

**High-level Architecture & Why**
- Single-component game: the full game logic lives in `src/App.js` (constants, timers, rendering). This keeps all game state and behavior colocated for simplicity.
- Styling: Tailwind CSS configured in `tailwind.config.js` and PostCSS in `postcss.config.js`. Styles are applied via utility classes in JSX.
- Static assets and HTML entry point live in `public/` (entry element `id="root"` used by `src/index.js`).

**Key Patterns & Project-specific Conventions**
- Game constants live at the top of `src/App.js` (e.g. `GRID_SIZE`, `CELL_SIZE`, `BASE_GAME_SPEED`). Change them there to alter game dimensions or speed.
- Timers use refs: `powerUpTimerRef` and `powerUpSpawnTimerRef`. Always clear timeouts/intervals in cleanup to avoid memory leaks — the code already follows this pattern in `useEffect` cleanups.
- Game loop uses `setInterval(moveSnake, gameSpeed)` inside a `useEffect` and `moveSnake` is wrapped with `useCallback` — keep dependencies minimal to avoid recreating the loop unnecessarily.
- Keyboard handling: global `window.addEventListener('keydown', ...)` in a `useEffect`. Since it's shared globally, remove the listener on cleanup and avoid adding duplicate listeners.
- Score/speed logic: `gameSpeed` is derived and reduced over time (see score-based speed increases). When modifying scoring or speed, update both the scoring logic and any UI text in `src/App.js`.

**Examples from Codebase (copy-edit friendly)**
- Change grid: edit `GRID_SIZE` and `CELL_SIZE` at the top of `src/App.js` — the render grid and positioning use these constants directly.
- Add a new power-up: follow `spawnPowerUp()` pattern and use a timer ref to auto-expire. Example timers: `powerUpTimerRef.current = setTimeout(..., POWER_UP_DURATION)` and clear on cleanup.
- Add a new control key: modify the `handleKeyPress` switch in the `useEffect` that binds `keydown`.

**Developer Workflows & Debugging**
- Use `console.log` for quick debugging: the project already logs power-up lifecycle events inside `spawnPowerUp` and the related `useEffect`.
- Hot reload is enabled via CRA dev server. For UI layout issues inspect `src/index.css` / `src/App.css` and `tailwind.config.js` content paths.
- Do not `eject` unless necessary — CRA scripts (`react-scripts`) are used by default and expected by CI or contributors.

**Testing & Linting Notes**
- Tests are scaffolded for CRA; there are no project-specific tests yet. The repo includes Testing Library packages in `package.json` if you add component/unit tests.

**Where to Look First**
- `src/App.js` — single source of truth for game logic and UI.
- `package.json` — scripts and dependency versions (React 19, `react-scripts` 5.x, Tailwind dev dependencies).
- `tailwind.config.js` & `postcss.config.js` — styling build pipeline.

**Do/Don't (project-specific)**
- Do: Use refs for timers and clear them on unmount or when state changes.
- Do: Keep game constants at the top of `src/App.js` for quick tuning.
- Don't: Add multiple global `keydown` listeners — reuse the existing `useEffect` handler.
- Don't: Change CRA script names in `package.json` without updating contributor docs.

**If you need to extend the game**
- Break `src/App.js` into smaller components: `GameBoard`, `HUD`, `Controls` — keep state lifting minimal and keep the game loop in one place (or centralize using context) to avoid duplicate timers.

If anything here is unclear or you'd like me to include CI, contributing, or test examples, tell me which section to expand.
