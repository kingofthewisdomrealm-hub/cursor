# Kill Tony Builder

A browser-based stand-up comedy game that teaches joke construction through drag-and-drop card building.

## How to play

1. **Drag cards** from your deck into the three stage slots: Observation, Technique, and Punchline.
2. **Preview your joke** on the virtual comedy-club stage.
3. **Perform your joke** and watch the audience react.
4. **Earn Laugh Points** based on your Laugh Score and Kill Tony Score.
5. **Unlock new cards** as you accumulate Laugh Points.

Each card has hidden attributes (relatability, surprise, specificity, originality, brevity) that combine into your scores. Experiment with different combinations to find killer sets!

## Tech stack

- React + TypeScript
- Tailwind CSS
- Zustand (state + LocalStorage persistence)
- Framer Motion (animations)
- dnd-kit (drag and drop)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

Progress is saved automatically in your browser's LocalStorage.
