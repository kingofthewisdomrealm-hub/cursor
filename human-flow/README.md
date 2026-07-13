# Human Flow Simulator

Practice field marketing as a **pipeline**, not a pitch.

> The opener isn't the sale. It's the brake pedal.

## The insight

In petitioning, canvassing, and street outreach, the first goal isn't to convince someone — it's to **get them to stop moving**.

| Stage | Goal | Success metric |
|-------|------|----------------|
| **Stop** | Brake pedal | Did they stop? |
| **Qualify** | Right prospect | Are they eligible / interested? |
| **Message** | Stay engaged | Do they keep listening? |
| **Action** | Close | Did they sign, book, subscribe, donate? |

## How to play

1. Open `index.html` (or run a local server in this folder).
2. Watch people walk across the screen.
3. When someone enters the **engage zone**, pick an opener and tap **Use opener**.
4. If they stop, work through Qualify → Message → Action.
5. Track your funnel stats and discover each opener's hidden ratings over time.

## Hidden opener stats

Each opener has hidden **Stop**, **Trust**, **Curiosity**, and **Resistance** ratings. Your measured rates unlock hints after repeated use:

- 3+ attempts → Stop rating revealed
- 5+ → Trust
- 7+ → Curiosity
- 10+ → Resistance

## Run locally

```bash
cd human-flow
python3 -m http.server 8080
```

Then open http://localhost:8080

## Files

- `js/flow-data.js` — openers, lines, personas, stage metadata
- `js/flow-engine.js` — probability rolls, session persistence, funnel stats
- `js/app.js` — UI, pedestrian animation, game loop
- `styles.css` — dark theme UI
