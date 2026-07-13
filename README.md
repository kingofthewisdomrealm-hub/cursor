# Florida Storm Map

A mobile-first storm intelligence dashboard for roofing, restoration, solar, and storm-recovery teams operating in Florida.

**Where did severe weather happen recently in Florida?**

## Features

- Full-screen interactive Florida map (Leaflet)
- Color-coded storm markers by severity (Minor → Major)
- 12 major Florida airport weather stations
- Storm detail panel with impact radius visualization (1, 3, 5, 10 miles)
- Filters: date range, storm type, hail size, wind speed, severity, airport
- Dashboard summary: monthly storm counts and most active region
- Saved storms (browser local storage, no login required)

## Supported Event Types

Hail, Severe Wind, Tornado, Hurricane, Flooding, Thunderstorm

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Leaflet / react-leaflet
- React Router
- Local Storage

## Data Architecture

Storm events are structured for future integration with:

- Airport weather observations (METAR)
- NOAA Storm Events
- News-reported severe weather

Version 1 ships with representative sample data across Florida.

## Play online

**Permanent URL (recommended for sharing):** https://kingofthewisdomrealm-hub.github.io/cursor/

> One-time setup required: enable GitHub Pages at
> [repo Settings → Pages](https://github.com/kingofthewisdomrealm-hub/cursor/settings/pages)
> → Source: **Deploy from a branch** → Branch: **gh-pages** → **/ (root)** → Save.
> The app is already deployed to the `gh-pages` branch; it goes live within ~1 minute after enabling.
