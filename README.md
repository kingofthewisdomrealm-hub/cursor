# Storm Opportunity Agent

Mobile-first web app for storm-restoration professionals to find Florida storm-damage opportunities and turn them into prioritized canvassing territories.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS 4**
- **Supabase** (optional schema; demo uses localStorage)
- **Leaflet** map (Mapbox-ready)
- **Playwright** for polite public-source checks
- **Scheduled job** via `/api/cron/scan` + `vercel.json` cron + `scripts/daily-scan.ts`

## Features (MVP)

1. Florida map of hail, wind, tornado, severe thunderstorm, and hurricane reports  
2. Storm scanner with modular data sources (sample data active; NWS / airport / news stubs ready)  
3. Filters: 24h · 3d · 7d · 30d  
4. Storm detail panel (type, date, time, city, ZIP, wind, hail, coords, source, confidence)  
5. Opportunity Score 0–100 (severity, recency, reports, density, property age, confidence)  
6. Territory generator (neighborhoods + ZIPs)  
7. Route builder → Google Maps  
8. Saved-opportunities CRM (New → Researching → Ready to canvass → Currently canvassing → Completed / Rejected)  
9. Daily top-5 Florida report  
10. Agent activity log  

**Does not** bypass CAPTCHAs, logins, paywalls, or site restrictions.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Main flow

Run Storm Scan → View storms on map → Select a storm → Review Opportunity Score → Generate territory → Create route → Save opportunity → Begin canvassing

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run scan` | Run scheduled scan locally |
| `npm run test:e2e` | Playwright public-source checks |

## Data sources

See `src/lib/data-sources/`. Enable adapters in their `meta.enabled` flags and implement `fetchReports`. Registry: `src/lib/data-sources/index.ts`.

## Scheduled scans

- HTTP: `GET/POST /api/cron/scan` (optional `Authorization: Bearer $CRON_SECRET`)
- Vercel Cron: noon UTC daily (`vercel.json`)
- CLI: `npm run scan`

## Supabase

Apply `supabase/migrations/001_storm_opportunity_agent.sql` when you connect a project. Until then, opportunities and activity persist in the browser.
