# Kill Tony Builder

A browser-based stand-up comedy game that teaches joke construction through drag-and-drop card building.

## How to play

1. **Drag cards** from your deck into the three stage slots: Observation, Technique, and Punchline.
2. **Preview your joke** on the virtual comedy-club stage.
3. **Perform your joke** and watch the audience react.
4. **Technique cards use AI** — when you drop an Observation + Technique, the game generates a custom comedy bridge for your joke.
5. **Earn Laugh Points** based on your Laugh Score and Kill Tony Score.
5. **Unlock new cards** as you accumulate Laugh Points.

Each card has hidden attributes (relatability, surprise, specificity, originality, brevity) that combine into your scores. Experiment with different combinations to find killer sets!

### AI Technique Generation

When you place an **Observation** and **Technique** on stage, the game AI-generates a custom comedy bridge applying that technique to your observation. Optional: add `VITE_OPENAI_API_KEY` to a `.env` file for GPT-powered generation; otherwise a built-in generator is used.

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

## Play online

**Live preview:** https://benchmark-sole-filter-group.trycloudflare.com

**Permanent URL (one-time setup):** https://kingofthewisdomrealm-hub.github.io/cursor/

The game is already deployed to the `gh-pages` branch. To activate the permanent URL:

1. Open [Repository Settings → Pages](https://github.com/kingofthewisdomrealm-hub/cursor/settings/pages)
2. Set **Source** to **Deploy from a branch**
3. Choose branch **`gh-pages`**, folder **`/ (root)`**, then **Save**

The site will be live at the permanent URL within ~1 minute.

## Build

```bash
npm run build
npm run preview
```

Progress is saved automatically in your browser's LocalStorage.
