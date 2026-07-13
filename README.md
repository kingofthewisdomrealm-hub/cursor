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

## Out of Scope (V1)

Property records, lead generation, CRM, canvassing, user accounts, and payments are intentionally excluded.
