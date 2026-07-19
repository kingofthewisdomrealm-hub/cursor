# Communication Survival

A mobile-first survival game where you survive waves of conversations—not monsters.

Every enemy is a communication obstacle. Every weapon is a communication skill. Transform angry customers, objections, skeptics, and self-doubt into understanding, engagement, and clarity.

## Play now

Permanent share link (GitHub Pages):

**https://kingofthewisdomrealm-hub.github.io/cursor/**

Local:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Mobile: drag the on-screen joystick
- Desktop: WASD or arrow keys

## Play loop

1. Enter a social environment (networking event, sales floor, stage, and more)
2. Obstacles approach from all directions
3. Unlocked skills auto-respond to nearby challenges
4. Collect **Confidence** (XP) and level up
5. Choose a new technique or upgrade
6. Between waves, pick the best real-world response to unlock bonuses
7. Face high-pressure boss conversations

## Stack

- Next.js 15 (App Router) + TypeScript
- Canvas game engine (Vampire Survivors–style arena)
- Tailwind CSS 4
- localStorage progression (no backend required)

## Build

```bash
npm run build
npm start
```

Static export for GitHub Pages uses `GITHUB_PAGES=true` (see `.github/workflows/deploy.yml`).

## Why this version

This branch continues the conversation-arena rebuild from earlier agent history: transform obstacles (not zombie combat), custom canvas engine, disciplines/environments, first-run onboarding tuned for the first 30 seconds, and mobile performance work.
