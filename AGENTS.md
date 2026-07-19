# AGENTS.md

## Cursor Cloud specific instructions

Communication Survival is a single, client-only Next.js 15 app (React 19 + Phaser 4 + Zustand + Tailwind 4). There is no backend, database, or auth, and no secrets are required (`.env.example` documents this). All game data is bundled JSON and progression is stored in the browser's `localStorage`.

### Services

One service only: the Next.js dev server (`npm run dev`), served at `http://localhost:3000`. The game runs entirely in the browser; testing the core loop requires a browser (menu -> `/play` -> answer a communication challenge -> pick an upgrade).

### Commands

Standard scripts in `package.json`: `npm run dev`, `npm run lint`, `npm run build`. CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, then `npm run build`.

### Non-obvious notes

- `npm run build` uses static export (`output: "export"` in `next.config.ts`), emitting `./out`. `npm run start` is present but does not serve a static export; to preview a production build, serve `./out` with a static server (e.g. `npx serve out`).
- Production builds behind GitHub Pages set `GITHUB_PAGES=true` for a `/cursor` base path. Local dev uses the root path — do not set that env var locally or asset paths will break.
- CI pins Node 20; the app also runs fine on Node 22.
- `next lint` prints a deprecation warning but still works; it is not an error.
