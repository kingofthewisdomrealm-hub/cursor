# Dosha Yoga

Personalized Ayurvedic yoga app — discover your dosha (Vata, Pitta, Kapha) and receive yoga routines shaped for your constitution and how you feel today.

## Features (MVP)

1. **Landing page** — calm wellness intro with dosha previews  
2. **Dosha quiz** — 20-question assessment with progress  
3. **Results dashboard** — percentages, primary/secondary dosha, profile guidance  
4. **Daily check-in** — sleep, energy, stress, mood, time, desired outcome  
5. **Routine generator** — tagged pose database + ranking logic  
6. **Guided practice** — timer, pause/skip, audio cues, feedback  
7. **Progress tracking** — streak, minutes, mood/imbalance insights  

## Tech stack

- Next.js 15 (App Router) + TypeScript  
- Tailwind CSS 4  
- Supabase (optional auth/database)  
- localStorage demo mode (works offline without keys)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo mode

Works without API keys. Quiz results, check-ins, routines, and practice history are stored in the browser.

### Optional Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Apply `supabase/migrations/001_dosha_yoga.sql` in your Supabase project when ready to persist server-side.

## Disclaimer

Dosha Yoga provides general educational and wellness guidance. It is **not a medical diagnosis** or a substitute for professional healthcare.

## Build

```bash
npm run build
npm start
```
