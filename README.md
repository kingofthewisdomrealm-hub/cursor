# Communication Survival

Mobile-first zombie survival where **communication skills are your weapon**.

Survive a wave → answer a realistic communication scenario → earn a combat upgrade → fight harder. Inspired by Vampire Survivors + Duolingo + Z Route.

## MVP features

- One endless dark-city map (Phaser)
- Six enemy types: Walker, Runner, Tank, Exploder, Spitter, Boss
- Automatic squad shooting + virtual joystick / WASD
- XP gems and leveling
- 50 communication scenarios across modular packs
- 10 weapon / squad upgrades
- Explanation screen (why / psychology / application)
- Score screen with accuracy %
- Local progression that unlocks new communication packs

## Stack

- Next.js 15 + React + TypeScript
- Phaser 4 (combat engine)
- Tailwind CSS 4 (menus / overlays)
- Zustand (run + progression state)
- Local JSON scenario database

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core loop

1. Zombie wave (30–60s)
2. Combat pauses
3. Communication challenge
4. Correct → choose upgrade; incorrect → no upgrade
5. Next wave

Learning is progression. Communication is power.

## Project layout

```
src/
  app/                 # Next.js routes (menu + play)
  components/          # HUD + challenge / upgrade / score overlays
  data/                # scenarios.json, upgrades, packs
  game/                # Phaser scene, textures, audio, config
  store/               # Zustand game store
  types/               # Shared types
```

New learning categories can be added as JSON packs without changing the combat engine.
